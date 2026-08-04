-- 0034_rate_limits.sql
-- Rate limit COMPARTIDO entre instancias, sobre Postgres.
--
-- POR QUÉ EXISTE: el limitador que hay vive en la memoria del proceso, y en
-- serverless cada instancia tiene la suya. Frena una ráfaga contra una misma
-- instancia caliente —el patrón del script de spam tonto— pero no frena a quien
-- reparte sus intentos, porque Vercel le va dando instancias distintas. Con N
-- instancias el límite real es N veces el configurado, y nadie sabe cuánto vale
-- N. Eso importa en las tres superficies que hoy lo usan, y sobre todo en el
-- formulario de intake: la ÚNICA escritura anónima del producto.
--
-- POR QUÉ POSTGRES Y NO UPSTASH / VERCEL KV, que es lo que pedía el ticket:
-- porque un contador compartido no necesita un proveedor nuevo. Ya hay un estado
-- compartido, en la UE, con su DPA firmado y su copia de seguridad — esta misma
-- base de datos. Añadir Redis significa coste recurrente, otro subprocesador que
-- declarar en la lista que Attesta todavía debe publicar, y otro sitio donde
-- mirar cuando algo falle. Para tres superficies de baja frecuencia (lista de
-- espera, intake, telemetría) eso no sale a cuenta. Si algún día hay que limitar
-- el login o el checkout, con miles de peticiones por minuto, ese es el momento
-- de reconsiderarlo — y entonces se cambia solo el almacén, porque la interfaz
-- (`src/lib/security/rate-limit.ts`) ya no depende de dónde vive el contador.
--
-- CÓMO CUENTA, y por qué así: ventana FIJA, no deslizante. La deslizante es más
-- justa pero exige guardar cada marca de tiempo; la fija guarda una fila por
-- (clave, ventana) y se resuelve con un `insert … on conflict do update`, que es
-- ATÓMICO — que es la propiedad que de verdad hace falta aquí, porque dos
-- instancias pidiendo a la vez es justo el caso que el limitador en memoria no
-- sabía resolver. El precio conocido: en el peor caso se admite hasta el doble
-- del límite a caballo entre dos ventanas. Es aceptable para lo que protege.
--
-- LO QUE NO SE GUARDA: la clave llega ya HASHEADA desde la aplicación, así que
-- aquí no hay direcciones IP. Un limitador no necesita saber a quién limita,
-- solo distinguirlo, y una tabla de IP en la UE es un dato personal más que
-- custodiar sin ninguna necesidad.
--
-- ADITIVO y seguro: sin aplicar, la RPC no existe, `rateLimit` se queda solo con
-- el limitador en memoria de siempre y la app funciona igual que hoy.

create table if not exists public.rate_limits (
  -- Hash de la clave (superficie + emisor). Nunca la clave en claro.
  bucket       text not null,
  -- Inicio de la ventana, truncado. Junto con `bucket` forma la identidad.
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (bucket, window_start)
);

-- Barrido de ventanas viejas. Sin esto la tabla crece para siempre.
create index if not exists rate_limits_window_idx
  on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;

-- Ninguna policy: nadie lee ni escribe esta tabla directamente. El único acceso
-- es la RPC de abajo, que es `security definer` y por tanto salta la RLS. Sin
-- policies, un SELECT de `anon` o `authenticated` devuelve vacío aunque tengan
-- el grant de tabla por defecto de Supabase — que es justo lo que se quiere:
-- el contador no es asunto de nadie salvo del propio limitador.

/**
 * Consume una unidad de cuota. Devuelve `true` si la petición SE PERMITE.
 *
 * `security definer` + `search_path = ''`: todo cualificado con esquema.
 */
create or replace function public.consume_rate_limit(
  p_bucket    text,
  p_limit     integer,
  p_window_ms integer
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_start timestamptz;
  v_hits  integer;
begin
  -- Defensas contra una llamada absurda: sin esto, un `p_window_ms` de cero
  -- provoca una división por cero y un límite negativo dejaría pasar todo.
  if p_bucket is null or length(p_bucket) = 0 or length(p_bucket) > 128 then
    return false;
  end if;
  if p_limit is null or p_limit < 1 or p_window_ms is null or p_window_ms < 1000 then
    return false;
  end if;

  -- Inicio de la ventana actual: el tiempo troceado en bloques de p_window_ms.
  v_start := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / (p_window_ms / 1000.0))
    * (p_window_ms / 1000.0)
  );

  -- Atómico: el upsert incrementa y devuelve el valor ya consolidado, así que
  -- dos instancias concurrentes no pueden leer el mismo contador y sumarle uno
  -- cada una. Es la razón de ser de esta migración.
  insert into public.rate_limits (bucket, window_start, hits)
  values (p_bucket, v_start, 1)
  on conflict (bucket, window_start)
    do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;

  -- Barrido oportunista: una de cada ~100 llamadas limpia lo caducado, para no
  -- necesitar un cron solo para esto.
  if v_hits % 100 = 0 then
    delete from public.rate_limits
    where window_start < clock_timestamp() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end
$$;

-- `revoke ... from anon` sobre una función es casi siempre un no-op: EXECUTE se
-- concede a PUBLIC por defecto. Hay que quitárselo a PUBLIC y luego concederlo.
-- (Lección de la migración 0028.)
revoke all on function public.consume_rate_limit(text, integer, integer) from public;
-- `anon` SÍ la necesita: el formulario de intake se envía sin cuenta, y es
-- precisamente la superficie que más falta hace limitar. La función no revela
-- nada —devuelve un booleano sobre una clave que ya viene hasheada— y valida
-- sus propios argumentos, así que abrirla no da ningún oráculo.
grant execute on function public.consume_rate_limit(text, integer, integer) to anon;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

comment on table public.rate_limits is
  'Contadores del rate limit compartido entre instancias. `bucket` es un hash: aquí NO se guardan direcciones IP.';
comment on function public.consume_rate_limit(text, integer, integer) is
  'Consume una unidad de cuota en una ventana fija. true = permitido. Atómico vía upsert: es lo que el limitador en memoria no podía garantizar entre instancias.';
