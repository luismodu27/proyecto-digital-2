-- 0027_intake_links.sql
-- Enlace de intake compartible: recoger sistemas de IA sin dar cuentas a nadie.
--
-- Por qué existe: en el mid-market, quien contrata Attesta (Legal, Compliance,
-- Dirección) NO sabe qué IA usa cada área. La información está en RRHH, en
-- Marketing, en Soporte. Pedir una cuenta a doce personas para que rellenen una
-- ficha no ocurre; mandarles un enlace, sí. Es la otra mitad del muro de
-- activación que el import CSV resuelve solo a medias (el CSV sirve cuando YA
-- tienes la lista; el enlace sirve para construirla).
--
-- Modelo de seguridad, que es lo delicado porque abre una escritura ANÓNIMA:
--
--   · El enlace se identifica por un **token aleatorio largo** que genera el
--     servidor. Actúa como capacidad: quien lo tiene puede ENVIAR, nada más.
--   · Un envío NO entra en el inventario: cae en `intake_submissions`, una
--     bandeja que un miembro de la organización revisa y acepta. Así una
--     respuesta anónima nunca escribe directamente en el expediente del cliente
--     (que es dato regulatorio) y no se puede ensuciar el "% listo" desde fuera.
--   · `anon` NO puede leer NADA: ni los enlaces, ni la bandeja, ni saber si un
--     token existe. Todo pasa por la RPC `submit_intake`, que es la única
--     superficie pública y devuelve solo true/false.
--   · El enlace **caduca** (por defecto 30 días), se puede **revocar** y tiene un
--     **tope de envíos**, para que un token filtrado no sea una puerta abierta
--     indefinida.
--
-- Aislamiento por `organization_id` con RLS, como el resto del esquema.
--
-- Nota de operación: `create policy` no admite `IF NOT EXISTS`, así que cada una va
-- precedida de un `drop policy if exists`. Sin eso, re-pegar esta migración (algo
-- que pasa: se corrige algo y se vuelve a ejecutar) falla a mitad y deja el
-- esquema medio aplicado.

/* -------------------------------------------------------------------------- */
/* Enlaces emitidos                                                           */
/* -------------------------------------------------------------------------- */

create table if not exists public.intake_links (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- Token de capacidad. Se genera en el servidor (32 bytes en base64url).
  token           text not null unique check (char_length(token) between 20 and 64),
  -- Etiqueta para que el emisor sepa a quién se lo mandó ("RRHH", "Marketing").
  label           text check (char_length(label) <= 80),
  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '30 days'),
  revoked_at      timestamptz,
  -- Cota dura de envíos por enlace: un token filtrado no es una barra libre.
  max_submissions integer not null default 100 check (max_submissions between 1 and 1000),
  submissions     integer not null default 0
);

create index if not exists intake_links_org_idx
  on public.intake_links (organization_id, created_at desc);

alter table public.intake_links enable row level security;

-- Solo los miembros de la organización ven y gestionan sus enlaces. `anon` no
-- tiene NINGUNA policy: no puede ni comprobar si un token existe.
drop policy if exists intake_links_select on public.intake_links;
create policy intake_links_select on public.intake_links
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

drop policy if exists intake_links_insert on public.intake_links;
create policy intake_links_insert on public.intake_links
  for insert to authenticated
  with check (organization_id in (select private.user_orgs()));

-- Revocar = un update; se limita a las columnas de gestión con un grant abajo.
drop policy if exists intake_links_update on public.intake_links;
create policy intake_links_update on public.intake_links
  for update to authenticated
  using (organization_id in (select private.user_orgs()))
  with check (organization_id in (select private.user_orgs()));

drop policy if exists intake_links_delete on public.intake_links;
create policy intake_links_delete on public.intake_links
  for delete to authenticated
  using (organization_id in (select private.user_orgs()));

/* -------------------------------------------------------------------------- */
/* Bandeja de envíos (NO es el inventario)                                    */
/* -------------------------------------------------------------------------- */

create table if not exists public.intake_submissions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  link_id         uuid references public.intake_links (id) on delete set null,
  -- Los mismos campos que una ficha de inventario, más una nota libre. Acotados
  -- porque los rellena alguien sin cuenta.
  name            text not null check (char_length(name) between 1 and 120),
  owner           text check (char_length(owner) <= 200),
  domain          text check (char_length(domain) <= 200),
  vendor          text check (char_length(vendor) <= 200),
  notes           text check (char_length(notes) <= 1000),
  -- Quién lo manda, para poder preguntarle. Es dato personal: lo aporta
  -- voluntariamente y la organización es la responsable del tratamiento.
  submitted_by    text check (char_length(submitted_by) <= 120),
  status          text not null default 'pending'
                    check (status in ('pending', 'accepted', 'discarded')),
  reviewed_at     timestamptz,
  reviewed_by     uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists intake_submissions_org_idx
  on public.intake_submissions (organization_id, status, created_at desc);

alter table public.intake_submissions enable row level security;

-- Igual que arriba: solo miembros. El envío anónimo NO usa un insert directo,
-- entra por la RPC de abajo.
drop policy if exists intake_submissions_select on public.intake_submissions;
create policy intake_submissions_select on public.intake_submissions
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

drop policy if exists intake_submissions_update on public.intake_submissions;
create policy intake_submissions_update on public.intake_submissions
  for update to authenticated
  using (organization_id in (select private.user_orgs()))
  with check (organization_id in (select private.user_orgs()));

drop policy if exists intake_submissions_delete on public.intake_submissions;
create policy intake_submissions_delete on public.intake_submissions
  for delete to authenticated
  using (organization_id in (select private.user_orgs()));

/* -------------------------------------------------------------------------- */
/* La ÚNICA superficie pública: enviar una ficha con un token válido          */
/* -------------------------------------------------------------------------- */

-- Helper: `btrim` sobre un valor que puede ser null, devolviendo null si queda vacío.
-- Existe para no repetir el nullif/btrim seis veces y para que la función de arriba
-- se lea. Inmutable: solo transforma texto. Se define ANTES de usarla.
create or replace function public.btrim_safe(p text)
returns text
language sql immutable set search_path = '' as $$
  select nullif(pg_catalog.btrim(coalesce(p, '')), '')
$$;

-- `security definer` para poder insertar sin darle a `anon` ninguna policy de
-- escritura sobre la tabla. Devuelve `true` si se guardó y `false` si el token no
-- vale (caducado, revocado, agotado o inexistente): **el mismo `false` para todos
-- los casos**, para no convertirla en un oráculo de tokens.
--
-- Todo cualificado con esquema (`search_path = ''`), incluido el cast del estado.
create or replace function public.submit_intake(
  p_token   text,
  p_name    text,
  p_owner   text default null,
  p_domain  text default null,
  p_vendor  text default null,
  p_notes   text default null,
  p_by      text default null
)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_link public.intake_links;
begin
  -- Nombre obligatorio: sin él el envío no aporta nada.
  --
  -- OJO con la comparación: `btrim_safe` devuelve NULL (no cadena vacía) cuando el
  -- texto queda en blanco, y `NULL = ''` no es cierto sino NULL, así que un
  -- `... = ''` dejaba pasar el caso y el insert reventaba contra el NOT NULL
  -- (respuesta 500 a un anónimo en vez de un `false` limpio). Se comprueba IS NULL.
  if public.btrim_safe(p_name) is null then
    return false;
  end if;

  select * into v_link
  from public.intake_links
  where token = p_token
    and revoked_at is null
    and expires_at > now()
    and submissions < max_submissions
  for update;

  if not found then
    return false;
  end if;

  insert into public.intake_submissions (
    organization_id, link_id, name, owner, domain, vendor, notes, submitted_by
  ) values (
    v_link.organization_id,
    v_link.id,
    pg_catalog.left(public.btrim_safe(p_name), 120),
    pg_catalog.left(public.btrim_safe(p_owner), 200),
    pg_catalog.left(public.btrim_safe(p_domain), 200),
    pg_catalog.left(public.btrim_safe(p_vendor), 200),
    pg_catalog.left(public.btrim_safe(p_notes), 1000),
    pg_catalog.left(public.btrim_safe(p_by), 120)
  );

  update public.intake_links
  set submissions = submissions + 1
  where id = v_link.id;

  return true;
end $$;

-- La RPC es la única puerta pública: se concede a anon Y a authenticated (alguien
-- con cuenta también puede rellenar el formulario que le llegó por correo).
grant execute on function public.submit_intake(text, text, text, text, text, text, text)
  to anon, authenticated;
grant execute on function public.btrim_safe(text) to anon, authenticated;

comment on function public.submit_intake(text, text, text, text, text, text, text) is
  'Única superficie pública del intake: valida el token de capacidad e inserta en intake_submissions (bandeja de revisión, NO el inventario). Devuelve false sin distinguir el motivo para no filtrar si un token existe.';

-- Un envío anónimo NO debe poder tocar el inventario ni el audit-trail: por eso
-- `intake_submissions` es una tabla aparte y el paso a `ai_systems` lo hace un
-- miembro autenticado desde la app (y ese sí queda en el audit-trail).
