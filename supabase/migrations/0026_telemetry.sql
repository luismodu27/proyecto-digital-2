-- 0026_telemetry.sql
-- Telemetría de producto de PRIMERA PARTE (funnel de activación).
--
-- Por qué existe: hasta ahora optimizábamos conversión y activación a ciegas.
-- No sabíamos cuántas visitas llegan al alta, cuántas altas clasifican su primer
-- sistema, ni cuántas chocan con el muro de pago. Sin eso, cada mejora de la
-- landing o del onboarding es una apuesta sin marcador.
--
-- Por qué de primera parte y no PostHog/GA/Plausible: vendemos gobernanza de IA
-- y transparencia de datos a mid-market europeo. Enviar la navegación de
-- nuestros propios clientes a un tercero exigiría DPA, subprocesador declarado y
-- aviso de cookies, y sería incoherente con el discurso. Aquí los eventos se
-- quedan en la misma base de datos (región UE) que el resto del producto.
--
-- Diseño con privacidad por defecto:
--   · NO se guarda IP ni user-agent ni ninguna huella de dispositivo.
--   · `anon_id` es un identificador aleatorio de primera parte que genera el
--     navegador (localStorage) solo para poder contar "visitantes distintos";
--     no identifica a nadie y no viaja entre dominios.
--   · `props` es un saco de metadatos acotado (≤4 KB) que NUNCA debe llevar
--     datos personales: lo controla la whitelist de eventos en el servidor
--     (`src/lib/telemetry/events.ts`).
--
-- Aislamiento: la tabla es de NEGOCIO INTERNO, no de tenant. Cualquiera puede
-- INSERTAR (hace falta para medir visitas anónimas de la landing) y solo el
-- personal de Attesta (`is_platform_admin()`) puede LEER. Sin policies de
-- UPDATE/DELETE: en la práctica es append-only para anon y authenticated.
--
-- Deliberadamente SIN trigger `write_audit`: `organization_id` aquí es una
-- dimensión analítica, no un dato del expediente del cliente. Auditar cada
-- pageview inundaría el audit-trail inmutable y encarecería la cadena de hashes
-- sin aportar nada al valor probatorio.

create table if not exists public.product_events (
  id              uuid primary key default gen_random_uuid(),
  -- Nombre del evento. La whitelist real vive en el código; el check solo acota.
  event           text not null check (char_length(event) between 1 and 64),
  -- Visitante anónimo (aleatorio, de primera parte). Null en eventos de servidor.
  anon_id         text check (char_length(anon_id) <= 64),
  -- Usuario/organización cuando se conocen (embudo post-alta). Nunca obligatorios.
  user_id         uuid references auth.users (id) on delete set null,
  organization_id uuid references public.organizations (id) on delete set null,
  path            text check (char_length(path) <= 255),
  locale          text check (char_length(locale) <= 8),
  -- Metadatos del evento. Cast a text (inmutable) para poder acotar el tamaño.
  props           jsonb not null default '{}'::jsonb
                    check (char_length(props::text) <= 4096),
  created_at      timestamptz not null default now()
);

comment on table public.product_events is
  'Telemetría de producto de primera parte (funnel de activación). Sin IP ni user-agent; append-only para clientes; solo lectura para platform_admins.';

-- Consultas reales del panel: "cuántos de este evento en los últimos N días".
create index if not exists product_events_event_time_idx
  on public.product_events (event, created_at desc);
create index if not exists product_events_time_idx
  on public.product_events (created_at desc);

alter table public.product_events enable row level security;

-- `drop policy if exists` antes de cada `create policy` porque `create policy`
-- NO admite `if not exists`: sin esto, volver a pegar la migración (algo que pasa
-- de verdad — se re-ejecuta el fichero tras corregir cualquier otra cosa) revienta
-- con *policy already exists*. Reemplazar la política por la misma definición es
-- inocuo; dejar el script no idempotente, no.
drop policy if exists product_events_insert_anyone on public.product_events;
drop policy if exists product_events_select_admin on public.product_events;

-- INSERT abierto: la landing es pública y sus visitas son anónimas por
-- definición. El abuso se acota en la API (whitelist de eventos + rate-limit por
-- IP + recorte de props); el riesgo residual es contaminar nuestras propias
-- métricas, no filtrar datos: nadie puede leer esta tabla sin ser admin.
create policy product_events_insert_anyone on public.product_events
  for insert to anon, authenticated
  with check (true);

-- LECTURA solo para el personal de Attesta.
create policy product_events_select_admin on public.product_events
  for select to authenticated
  using (public.is_platform_admin());

/* -------------------------------------------------------------------------- */
/* Agregación del embudo (para no traer miles de filas al panel)               */
/* -------------------------------------------------------------------------- */

-- Devuelve, por evento, el total y los "visitantes distintos" de los últimos N
-- días. `security definer` para poder leer con el índice sin depender de la
-- policy fila-a-fila, pero con el guard de admin DENTRO: si quien llama no es
-- platform_admin, no devuelve nada.
create or replace function public.product_funnel(days integer default 30)
returns table (
  event    text,
  events   bigint,
  visitors bigint,
  last_at  timestamptz
)
language sql stable security definer set search_path = '' as $$
  select
    e.event,
    count(*)::bigint,
    -- Un usuario autenticado cuenta como uno aunque cambie de navegador; el
    -- anónimo cuenta por anon_id; si no hay ninguno, cada fila es una unidad.
    count(distinct coalesce(e.user_id::text, e.anon_id, e.id::text))::bigint,
    max(e.created_at)
  from public.product_events e
  where public.is_platform_admin()
    -- `greatest`/`least` son CONSTRUCCIONES del lenguaje SQL, no funciones: no
    -- se pueden cualificar con esquema (`pg_catalog.least(...)` no existe) y
    -- tampoco les afecta el `search_path` vacío. `make_interval` sí es función y
    -- va cualificada. La cota 1..365 evita un rango absurdo desde la URL.
    and e.created_at >= now() - pg_catalog.make_interval(
      days => greatest(least(days, 365), 1)
    )
  group by e.event
  order by count(*) desc
$$;

revoke all on function public.product_funnel(integer) from anon;
grant execute on function public.product_funnel(integer) to authenticated;
