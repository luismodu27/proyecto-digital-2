-- Attesta — setup completo (ejecuta esto en Supabase → SQL Editor)
-- Generado a partir de supabase/migrations/*. Ejecuta todo de una vez.


-- ============================================================
-- supabase/migrations/0001_init.sql
-- ============================================================
-- Attesta — esquema base
-- Multi-tenant: cada tabla de negocio lleva organization_id como columna de tenant.

-- ---------- Enums ----------
create type risk_level as enum ('unacceptable', 'high', 'limited', 'minimal');
create type member_role as enum ('owner', 'admin', 'member');
create type gap_status as enum ('missing', 'partial', 'done');
create type gap_severity as enum ('high', 'medium', 'low');
create type audit_action as enum ('insert', 'update', 'delete');
create type system_actor_role as enum ('provider', 'deployer');

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------- organizations (tenant raíz) ----------
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now()
);

-- ---------- memberships (usuario <-> organización + rol) ----------
create table public.memberships (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  role             member_role not null default 'member',
  created_at       timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index memberships_user_idx on public.memberships (user_id);
create index memberships_org_idx on public.memberships (organization_id);

-- ---------- ai_systems (inventario) ----------
create table public.ai_systems (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references public.organizations (id) on delete cascade,
  code                  text,
  name                  text not null,
  owner                 text,
  domain                text,
  vendor                text,
  actor_role            system_actor_role not null default 'deployer',
  risk_level            risk_level,
  compliance_pct        int check (compliance_pct between 0 and 100),
  last_reviewed_at      timestamptz,
  current_assessment_id uuid,
  created_by            uuid references auth.users (id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (organization_id, code)
);
create index ai_systems_org_idx on public.ai_systems (organization_id);
create trigger ai_systems_updated_at before update on public.ai_systems
  for each row execute function public.set_updated_at();

-- ---------- risk_assessments (resultado del asistente; append-only) ----------
create table public.risk_assessments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  ai_system_id     uuid not null references public.ai_systems (id) on delete cascade,
  answers          jsonb not null,
  level            risk_level not null,
  rationale        text not null,
  citations        jsonb not null default '[]',
  obligations      jsonb not null default '[]',
  engine_version   text,
  assessed_by      uuid references auth.users (id),
  assessed_at      timestamptz not null default now()
);
create index risk_assessments_system_idx
  on public.risk_assessments (ai_system_id, assessed_at desc);

-- FK diferida de ai_systems -> última evaluación vigente
alter table public.ai_systems
  add constraint ai_systems_current_assessment_fk
  foreign key (current_assessment_id)
  references public.risk_assessments (id) on delete set null;

-- ---------- gap_items (brechas) ----------
create table public.gap_items (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  ai_system_id     uuid not null references public.ai_systems (id) on delete cascade,
  requirement      text not null,
  article          text,
  status           gap_status not null default 'missing',
  severity         gap_severity not null default 'medium',
  remediation_note text,
  created_by       uuid references auth.users (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index gap_items_org_idx on public.gap_items (organization_id);
create index gap_items_system_idx on public.gap_items (ai_system_id);
create trigger gap_items_updated_at before update on public.gap_items
  for each row execute function public.set_updated_at();

-- ---------- audit_log (inmutable; se rellena por triggers) ----------
create table public.audit_log (
  id               bigint primary key generated always as identity,
  organization_id  uuid not null,
  actor_id         uuid,
  table_name       text not null,
  row_id           text not null,
  action           audit_action not null,
  old_data         jsonb,
  new_data         jsonb,
  diff             jsonb,
  at               timestamptz not null default now()
);
create index audit_log_org_idx on public.audit_log (organization_id, at desc);

-- ============================================================
-- supabase/migrations/0002_rls.sql
-- ============================================================
-- Attesta — Row Level Security (aislamiento por tenant)
-- Cada usuario solo ve/edita datos de las organizaciones donde es miembro.

create schema if not exists private;

-- Orgs del usuario actual (security definer evita recursión de policies).
create or replace function private.user_orgs()
returns setof uuid
language sql stable security definer set search_path = '' as $$
  select organization_id from public.memberships
  where user_id = (select auth.uid())
$$;

-- ¿El usuario actual tiene alguno de estos roles en la org?
create or replace function private.user_has_role(org uuid, roles member_role[])
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships
    where user_id = (select auth.uid())
      and organization_id = org
      and role = any (roles)
  )
$$;

-- ---------- Habilitar RLS ----------
alter table public.organizations   enable row level security;
alter table public.memberships     enable row level security;
alter table public.ai_systems      enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.gap_items       enable row level security;
alter table public.audit_log       enable row level security;

-- ---------- organizations ----------
create policy organizations_select on public.organizations
  for select to authenticated
  using (id in (select private.user_orgs()));

create policy organizations_insert on public.organizations
  for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy organizations_update on public.organizations
  for update to authenticated
  using (private.user_has_role(id, array['owner']::member_role[]));

-- ---------- memberships ----------
create policy memberships_select on public.memberships
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or private.user_has_role(organization_id, array['owner','admin']::member_role[])
  );

create policy memberships_write_admin on public.memberships
  for all to authenticated
  using (private.user_has_role(organization_id, array['owner','admin']::member_role[]))
  with check (private.user_has_role(organization_id, array['owner','admin']::member_role[]));

-- ---------- Patrón genérico para tablas de negocio con organization_id ----------
-- ai_systems
create policy ai_systems_select on public.ai_systems
  for select to authenticated
  using (organization_id in (select private.user_orgs()));
create policy ai_systems_insert on public.ai_systems
  for insert to authenticated
  with check (organization_id in (select private.user_orgs()));
create policy ai_systems_update on public.ai_systems
  for update to authenticated
  using (private.user_has_role(organization_id, array['owner','admin']::member_role[]))
  with check (organization_id in (select private.user_orgs()));
create policy ai_systems_delete on public.ai_systems
  for delete to authenticated
  using (private.user_has_role(organization_id, array['owner']::member_role[]));

-- risk_assessments (append-only: sin update/delete)
create policy risk_assessments_select on public.risk_assessments
  for select to authenticated
  using (organization_id in (select private.user_orgs()));
create policy risk_assessments_insert on public.risk_assessments
  for insert to authenticated
  with check (organization_id in (select private.user_orgs()));

-- gap_items
create policy gap_items_select on public.gap_items
  for select to authenticated
  using (organization_id in (select private.user_orgs()));
create policy gap_items_insert on public.gap_items
  for insert to authenticated
  with check (organization_id in (select private.user_orgs()));
create policy gap_items_update on public.gap_items
  for update to authenticated
  using (private.user_has_role(organization_id, array['owner','admin']::member_role[]))
  with check (organization_id in (select private.user_orgs()));
create policy gap_items_delete on public.gap_items
  for delete to authenticated
  using (private.user_has_role(organization_id, array['owner','admin']::member_role[]));

-- audit_log: SOLO lectura para miembros. La escritura la hacen triggers
-- security definer; UPDATE/DELETE se bloquean con triggers (ver 0003).
create policy audit_log_select on public.audit_log
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

-- ============================================================
-- supabase/migrations/0003_audit.sql
-- ============================================================
-- Attesta — audit-trail inmutable
-- El registro se rellena SOLO por triggers (no desde la app), y no se puede
-- modificar ni borrar (ni siquiera por el dueño de la tabla o service_role).

-- Escribe una fila de auditoría por cada cambio en las tablas de negocio.
create or replace function private.write_audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_org  uuid;
  v_new  jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  v_old  jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  v_diff jsonb := '{}'::jsonb;
  k text;
begin
  v_org := coalesce(
    (case when tg_op = 'DELETE' then old else new end).organization_id,
    null
  );

  -- diff: columnas cambiadas en un UPDATE
  if tg_op = 'UPDATE' then
    for k in select jsonb_object_keys(v_new) loop
      if v_new -> k is distinct from v_old -> k then
        v_diff := v_diff || jsonb_build_object(k, jsonb_build_array(v_old -> k, v_new -> k));
      end if;
    end loop;
  end if;

  insert into public.audit_log (
    organization_id, actor_id, table_name, row_id, action, old_data, new_data, diff
  )
  values (
    v_org,
    (select auth.uid()),
    tg_table_name,
    (coalesce((case when tg_op = 'DELETE' then old else new end).id))::text,
    lower(tg_op)::public.audit_action,
    v_old,
    v_new,
    case when tg_op = 'UPDATE' then v_diff else null end
  );

  return coalesce(new, old);
end $$;

-- Bloquea cualquier UPDATE/DELETE sobre audit_log (inmutabilidad real).
create or replace function private.block_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_log es inmutable: no se permite % ', tg_op;
end $$;

create trigger audit_no_update before update on public.audit_log
  for each row execute function private.block_mutation();
create trigger audit_no_delete before delete on public.audit_log
  for each row execute function private.block_mutation();

-- Adjunta el trigger de auditoría a las tablas de negocio.
create trigger audit_ai_systems
  after insert or update or delete on public.ai_systems
  for each row execute function private.write_audit();

create trigger audit_risk_assessments
  after insert or update or delete on public.risk_assessments
  for each row execute function private.write_audit();

create trigger audit_gap_items
  after insert or update or delete on public.gap_items
  for each row execute function private.write_audit();

create trigger audit_memberships
  after insert or update or delete on public.memberships
  for each row execute function private.write_audit();

-- ============================================================
-- supabase/migrations/0004_onboarding.sql
-- ============================================================
-- Attesta — onboarding
-- Crea una organización y hace al usuario actual su 'owner' en una transacción.
-- security definer para evitar la ventana en que la policy de INSERT de
-- memberships aún no ve la org recién creada.

create or replace function public.create_org_and_owner(org_name text, org_slug text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_org uuid;
begin
  if v_uid is null then
    raise exception 'No autenticado';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (org_name, org_slug, v_uid)
  returning id into v_org;

  insert into public.memberships (organization_id, user_id, role)
  values (v_org, v_uid, 'owner');

  return v_org;
end $$;

revoke all on function public.create_org_and_owner(text, text) from anon;
grant execute on function public.create_org_and_owner(text, text) to authenticated;

-- ============================================================
-- supabase/migrations/0006_evidence.sql
-- ============================================================
-- Attesta — captura de evidencia (autoevaluación defendible)
-- Distingue una respuesta "solo declarada" de una "con evidencia" aportada.
-- La responsabilidad recae en la persona que atesta (no en Attesta).

alter table public.risk_assessments
  add column if not exists attested_by_name text,
  add column if not exists evidence_note   text,
  add column if not exists evidence_url     text,
  add column if not exists evidence_state   text not null default 'declared'
    check (evidence_state in ('declared', 'evidenced', 'reviewed'));

-- Refleja en el sistema el nivel de respaldo de su última evaluación.
alter table public.ai_systems
  add column if not exists evidence_state text
    check (evidence_state in ('declared', 'evidenced', 'reviewed'));

-- ============================================================
-- supabase/migrations/0007_waitlist.sql
-- ============================================================
-- Attesta — lista de espera (landing público)
-- Cualquiera puede INSERTAR su correo; nadie puede LEER/editar (privacidad).
-- El fundador consulta los leads desde el panel (SQL editor / service_role).

create table public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Solo INSERT, para anon y authenticated. Sin SELECT/UPDATE/DELETE.
create policy "waitlist_insert_anyone" on public.waitlist
  for insert to anon, authenticated
  with check (true);


-- ============================================================
-- supabase/migrations/0008_invitations.sql
-- ============================================================
-- Attesta — invitaciones de equipo (roles / miembros)
-- Permite a owner/admin invitar personas por email a su organización.
--   · Si el invitado YA tiene cuenta → se le añade como miembro de inmediato.
--   · Si NO tiene cuenta → la invitación queda 'pending' y se reclama
--     automáticamente cuando se registra (claim_invitations en el onboarding).
-- Multi-tenant + RLS coherentes con el resto del esquema.

create table if not exists public.invitations (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  email            text not null,
  role             member_role not null default 'member',
  status           text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  invited_by       uuid references auth.users (id),
  created_at       timestamptz not null default now(),
  accepted_at      timestamptz,
  unique (organization_id, email)
);
create index if not exists invitations_org_idx on public.invitations (organization_id);
create index if not exists invitations_email_idx on public.invitations (lower(email));

alter table public.invitations enable row level security;

-- Solo owner/admin de la org ven y gestionan sus invitaciones.
drop policy if exists invitations_select on public.invitations;
create policy invitations_select on public.invitations
  for select to authenticated
  using (private.user_has_role(organization_id, array['owner','admin']::member_role[]));

drop policy if exists invitations_write on public.invitations;
create policy invitations_write on public.invitations
  for all to authenticated
  using (private.user_has_role(organization_id, array['owner','admin']::member_role[]))
  with check (private.user_has_role(organization_id, array['owner','admin']::member_role[]));

-- ---------- RPC: invitar (o añadir de inmediato si ya existe la cuenta) ----------
create or replace function public.invite_member(
  org uuid,
  invitee_email text,
  invitee_role member_role
)
returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_email text := lower(trim(invitee_email));
  v_uid uuid;
begin
  if not private.user_has_role(org, array['owner','admin']::public.member_role[]) then
    raise exception 'No autorizado';
  end if;
  if v_email is null or v_email = '' then
    raise exception 'Email requerido';
  end if;
  -- Solo un owner puede otorgar el rol owner.
  if invitee_role = 'owner'
     and not private.user_has_role(org, array['owner']::public.member_role[]) then
    raise exception 'Solo un owner puede asignar el rol owner';
  end if;

  select id into v_uid from auth.users where lower(email) = v_email limit 1;

  if v_uid is not null then
    if exists (
      select 1 from public.memberships
      where organization_id = org and user_id = v_uid
    ) then
      return 'already_member';
    end if;
    insert into public.memberships (organization_id, user_id, role)
    values (org, v_uid, invitee_role);
    insert into public.invitations (organization_id, email, role, status, invited_by, accepted_at)
    values (org, v_email, invitee_role, 'accepted', (select auth.uid()), now())
    on conflict (organization_id, email)
      do update set status = 'accepted', role = invitee_role, accepted_at = now();
    return 'added';
  end if;

  insert into public.invitations (organization_id, email, role, status, invited_by)
  values (org, v_email, invitee_role, 'pending', (select auth.uid()))
  on conflict (organization_id, email)
    do update set role = invitee_role, status = 'pending',
                  invited_by = (select auth.uid()), created_at = now();
  return 'invited';
end $$;

revoke all on function public.invite_member(uuid, text, member_role) from anon;
grant execute on function public.invite_member(uuid, text, member_role) to authenticated;

-- ---------- RPC: reclamar invitaciones pendientes al registrarse ----------
create or replace function public.claim_invitations()
returns int
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
  v_count int := 0;
begin
  if v_uid is null then return 0; end if;
  select lower(email) into v_email from auth.users where id = v_uid;
  if v_email is null then return 0; end if;

  insert into public.memberships (organization_id, user_id, role)
  select i.organization_id, v_uid, i.role
  from public.invitations i
  where lower(i.email) = v_email and i.status = 'pending'
  on conflict (organization_id, user_id) do nothing;
  get diagnostics v_count = row_count;

  update public.invitations i
  set status = 'accepted', accepted_at = now()
  where lower(i.email) = v_email and i.status = 'pending';

  return v_count;
end $$;

revoke all on function public.claim_invitations() from anon;
grant execute on function public.claim_invitations() to authenticated;

-- ---------- RPC: listar miembros de la org (con email) ----------
-- security definer para poder unir con auth.users; solo miembros de la org.
create or replace function public.list_org_members(org uuid)
returns table (user_id uuid, email text, role member_role, joined_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select m.user_id, u.email::text, m.role, m.created_at
  from public.memberships m
  join auth.users u on u.id = m.user_id
  where m.organization_id = org
    and org in (select private.user_orgs())
  order by
    case m.role when 'owner' then 0 when 'admin' then 1 else 2 end,
    m.created_at asc
$$;

revoke all on function public.list_org_members(uuid) from anon;
grant execute on function public.list_org_members(uuid) to authenticated;


-- ============================================================
-- supabase/migrations/0009_audit_view.sql
-- ============================================================
-- Attesta — lectura del audit-trail para el visor "Registro de actividad".
-- El audit_log ya lo rellenan triggers inmutables (0003). Aquí solo añadimos
-- una función de lectura que une el actor con su email (auth.users no es
-- consultable directamente por RLS). Guardada por pertenencia a la org.

create or replace function public.list_audit_log(org uuid, lim int default 100)
returns table (
  id bigint,
  actor_email text,
  table_name text,
  row_id text,
  action audit_action,
  diff jsonb,
  new_data jsonb,
  old_data jsonb,
  at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select a.id, u.email::text, a.table_name, a.row_id, a.action,
         a.diff, a.new_data, a.old_data, a.at
  from public.audit_log a
  left join auth.users u on u.id = a.actor_id
  where a.organization_id = org
    and org in (select private.user_orgs())
  order by a.at desc
  limit least(coalesce(lim, 100), 500)
$$;

revoke all on function public.list_audit_log(uuid, int) from anon;
grant execute on function public.list_audit_log(uuid, int) to authenticated;


-- ============================================================
-- supabase/migrations/0010_regulatory_acks.sql
-- ============================================================
-- Attesta — acuse de vigilancia regulatoria ("marcar como revisado").
-- Permite a owner/admin dejar constancia de que la organización ha revisado un
-- evento del radar regulatorio y qué decidió (revisado / plan en marcha / no
-- aplica). Es evidencia de vigilancia activa; se AUDITA como el resto.
-- El evento vive en el catálogo curado (código), por eso event_id es texto.

create table if not exists public.regulatory_acks (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  event_id         text not null,
  status           text not null default 'reviewed'
    check (status in ('reviewed', 'planned', 'not_applicable')),
  note             text,
  acknowledged_by  uuid references auth.users (id),
  acknowledged_at  timestamptz not null default now(),
  unique (organization_id, event_id)
);
create index if not exists regulatory_acks_org_idx
  on public.regulatory_acks (organization_id);

alter table public.regulatory_acks enable row level security;

-- Miembros ven el estado; owner/admin lo gestionan.
create policy regulatory_acks_select on public.regulatory_acks
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

create policy regulatory_acks_write on public.regulatory_acks
  for all to authenticated
  using (private.user_has_role(organization_id, array['owner','admin']::public.member_role[]))
  with check (private.user_has_role(organization_id, array['owner','admin']::public.member_role[]));

-- Se audita (aparece en el registro de actividad).
create trigger audit_regulatory_acks
  after insert or update or delete on public.regulatory_acks
  for each row execute function private.write_audit();


-- ============================================================
-- 0011_reg_pipeline.sql
-- ============================================================
-- Attesta — Fase A del "foso automatizado": la espina del pipeline de vigilancia.
--
-- Los agentes (Vigía → Analista → Actualizador) PROPONEN borradores de eventos
-- regulatorios; un humano (el Validador) los aprueba o rechaza antes de que
-- lleguen a los clientes. Filosofía intacta: nada se publica como afirmación
-- regulatoria sin validación humana. El catálogo curado en código sigue siendo
-- la línea base de confianza; estas tablas AÑADEN eventos publicados por el
-- pipeline.
--
-- El catálogo regulatorio es GLOBAL (la misma ley para todos los tenants), por
-- eso estas tablas NO llevan organization_id y NO usan las policies por-org. El
-- Validador es personal de Attesta (platform_admins), no un cliente. Los acuses
-- por organización ("marcar como revisado") siguen en regulatory_acks (0010).

/* -------------------------------------------------------------------------- */
/* Personal de Attesta habilitado para validar (el humano-en-el-bucle)        */
/* -------------------------------------------------------------------------- */

create table if not exists public.platform_admins (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  added_at  timestamptz not null default now(),
  note      text
);

alter table public.platform_admins enable row level security;

-- ¿El usuario actual es validador de plataforma? (security definer → sin recursión)
create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.platform_admins
    where user_id = (select auth.uid())
  )
$$;
revoke all on function public.is_platform_admin() from anon;
grant execute on function public.is_platform_admin() to authenticated;

-- Un validador puede ver la lista de validadores; nadie se auto-inserta
-- (el alta se hace en el panel de Supabase / service_role).
create policy platform_admins_select on public.platform_admins
  for select to authenticated
  using (public.is_platform_admin());

/* -------------------------------------------------------------------------- */
/* Fuentes vigiladas por el Vigía (watchlist global)                          */
/* -------------------------------------------------------------------------- */

create table if not exists public.reg_sources (
  id               uuid primary key default gen_random_uuid(),
  framework        text not null default 'eu-ai-act',
  label            text not null,
  url              text not null,
  source_kind      text not null default 'page'
    check (source_kind in ('page', 'feed', 'api')),
  last_hash        text,
  last_checked_at  timestamptz,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

alter table public.reg_sources enable row level security;

create policy reg_sources_admin on public.reg_sources
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

/* -------------------------------------------------------------------------- */
/* Eventos PUBLICADOS por el pipeline (catálogo global, se suma al de código)  */
/* -------------------------------------------------------------------------- */

create table if not exists public.reg_events (
  id                  text primary key,
  event_date          date not null,
  kind                text not null
    check (kind in ('deadline', 'guidance', 'standard', 'amendment', 'enforcement')),
  framework           text not null default 'eu-ai-act',
  title               text not null,
  summary             text not null,
  impact              text not null,
  action              text not null,
  articles            jsonb not null default '[]'::jsonb,
  source              jsonb not null,
  scope               jsonb not null default '{}'::jsonb,
  published_at        timestamptz not null default now(),
  published_by        uuid references auth.users (id),
  origin_candidate_id uuid
);

alter table public.reg_events enable row level security;

-- Todo miembro autenticado ve los eventos publicados (aparecen en su radar).
create policy reg_events_select on public.reg_events
  for select to authenticated
  using (true);

-- Solo el Validador de plataforma puede publicar/editar/retirar.
create policy reg_events_admin_write on public.reg_events
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

/* -------------------------------------------------------------------------- */
/* Cola de CANDIDATOS: borradores a la espera de validación humana            */
/* -------------------------------------------------------------------------- */

create table if not exists public.reg_candidates (
  id                uuid primary key default gen_random_uuid(),
  proposed_event_id text,
  event_date        date,
  kind              text
    check (kind in ('deadline', 'guidance', 'standard', 'amendment', 'enforcement')),
  framework         text not null default 'eu-ai-act',
  title             text not null,
  summary           text,
  impact            text,
  action            text,
  articles          jsonb not null default '[]'::jsonb,
  source            jsonb,
  scope             jsonb not null default '{}'::jsonb,
  status            text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected', 'superseded')),
  source_id         uuid references public.reg_sources (id) on delete set null,
  -- Procedencia del agente: {agent, model, confidence, excerpt, detected_at}
  provenance        jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  reviewed_by       uuid references auth.users (id),
  reviewed_at       timestamptz,
  review_note       text
);

create index if not exists reg_candidates_status_idx
  on public.reg_candidates (status, created_at desc);

alter table public.reg_candidates enable row level security;

create policy reg_candidates_admin on public.reg_candidates
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

/* -------------------------------------------------------------------------- */
/* Acciones del Validador (atómicas y auto-guardadas)                         */
/* -------------------------------------------------------------------------- */

-- Aprobar: publica el candidato como evento del radar y lo marca aprobado.
-- Todo en una transacción y solo para validadores de plataforma.
create or replace function public.approve_reg_candidate(cand uuid, event_id text)
returns text
language plpgsql volatile security definer set search_path = '' as $$
declare
  c public.reg_candidates%rowtype;
  eid text := nullif(trim(event_id), '');
begin
  if not public.is_platform_admin() then
    raise exception 'no autorizado';
  end if;

  select * into c from public.reg_candidates where id = cand;
  if not found then raise exception 'candidato no encontrado'; end if;
  if c.status <> 'draft' then raise exception 'el candidato ya fue revisado'; end if;
  if eid is null then eid := coalesce(c.proposed_event_id, 'reg-' || replace(cand::text, '-', '')); end if;
  if c.event_date is null or c.kind is null or c.source is null then
    raise exception 'el candidato no tiene fecha, tipo o fuente'; end if;

  insert into public.reg_events (
    id, event_date, kind, framework, title, summary, impact, action,
    articles, source, scope, published_by, origin_candidate_id
  ) values (
    eid, c.event_date, c.kind, c.framework, c.title,
    coalesce(c.summary, ''), coalesce(c.impact, ''), coalesce(c.action, ''),
    c.articles, c.source, c.scope, (select auth.uid()), c.id
  );

  update public.reg_candidates
     set status = 'approved', proposed_event_id = eid,
         reviewed_by = (select auth.uid()), reviewed_at = now()
   where id = cand;

  return eid;
end $$;
revoke all on function public.approve_reg_candidate(uuid, text) from anon;
grant execute on function public.approve_reg_candidate(uuid, text) to authenticated;

-- Rechazar: marca el candidato como rechazado con una nota.
create or replace function public.reject_reg_candidate(cand uuid, note text)
returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then
    raise exception 'no autorizado';
  end if;

  update public.reg_candidates
     set status = 'rejected', review_note = nullif(trim(note), ''),
         reviewed_by = (select auth.uid()), reviewed_at = now()
   where id = cand and status = 'draft';

  if not found then raise exception 'candidato no encontrado o ya revisado'; end if;
end $$;
revoke all on function public.reject_reg_candidate(uuid, text) from anon;
grant execute on function public.reject_reg_candidate(uuid, text) to authenticated;


-- ============================================================
-- 0012_org_jurisdictions.sql
-- ============================================================
-- Attesta — nexo de jurisdicción por organización (v2 del radar de vigilancia).
--
-- Las leyes de IA-empleo de EE. UU. (NYC LL144, Colorado, Illinois) son
-- TERRITORIALES: solo aplican con nexo en ese territorio. Para no sobre-alarmar
-- a un cliente que no contrata allí, la organización declara sus jurisdicciones
-- y el radar prioriza/filtra por ellas. Vacío = sin configurar (el radar muestra
-- todas y sugiere configurarlo).
--
-- Códigos válidos (deben coincidir con RegJurisdiction en el frontend):
--   'eu', 'us-ny', 'us-co', 'us-il', 'us-federal'

alter table public.organizations
  add column if not exists jurisdictions text[] not null default '{}';

-- Fija las jurisdicciones de la organización. Solo owner/admin. Valida que los
-- códigos pertenezcan al conjunto permitido (evita basura en la columna).
create or replace function public.set_org_jurisdictions(org uuid, jur text[])
returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  allowed text[] := array['eu', 'us-ny', 'us-co', 'us-il', 'us-federal'];
  clean   text[];
begin
  if not private.user_has_role(org, array['owner', 'admin']::public.member_role[]) then
    raise exception 'no autorizado';
  end if;

  -- Nos quedamos solo con códigos válidos y sin duplicados.
  select coalesce(array_agg(distinct j), '{}')
    into clean
  from unnest(coalesce(jur, '{}')) as j
  where j = any (allowed);

  update public.organizations
     set jurisdictions = clean
   where id = org;
end $$;
revoke all on function public.set_org_jurisdictions(uuid, text[]) from anon;
grant execute on function public.set_org_jurisdictions(uuid, text[]) to authenticated;


-- ============================================================
-- 0013_action_tasks.sql
-- ============================================================
-- Attesta — plan de acción editable (Capa 2).
--
-- Hasta ahora el "plan de acción" era 100% derivado (solo lectura) de las
-- brechas y el riesgo. Esta tabla lo convierte en un TABLERO DE TAREAS real:
-- cada tarea tiene responsable, fecha límite y estado, editable por el equipo.
-- Las recomendaciones derivadas siguen existiendo como SUGERENCIAS que se
-- añaden al plan con un clic (source='recommendation' + source_key para no
-- duplicar).
--
-- Es colaborativo: cualquier miembro de la organización gestiona las tareas
-- (no solo owner/admin). Se AUDITA como el resto (lleva organization_id).

create table if not exists public.action_tasks (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  title            text not null,
  detail           text,
  article          text,
  priority         text not null default 'media'
    check (priority in ('critica', 'alta', 'media', 'baja')),
  status           text not null default 'todo'
    check (status in ('todo', 'in_progress', 'blocked', 'done')),
  assignee_id      uuid references auth.users (id) on delete set null,
  due_date         date,
  ai_system_id     uuid references public.ai_systems (id) on delete set null,
  source           text not null default 'manual'
    check (source in ('manual', 'recommendation')),
  source_key       text,
  created_by       uuid references auth.users (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists action_tasks_org_idx
  on public.action_tasks (organization_id, status);

alter table public.action_tasks enable row level security;

-- Todo miembro de la organización lee y gestiona las tareas (colaborativo).
create policy action_tasks_select on public.action_tasks
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

create policy action_tasks_write on public.action_tasks
  for all to authenticated
  using (organization_id in (select private.user_orgs()))
  with check (organization_id in (select private.user_orgs()));

-- Se audita (aparece en el registro de actividad).
create trigger audit_action_tasks
  after insert or update or delete on public.action_tasks
  for each row execute function private.write_audit();


-- ==========================================================================
-- 0014_reg_vigia.sql — Vigía determinista (1er agente del foso, Capa 7)
-- ==========================================================================

alter table public.reg_sources
  add column if not exists last_change_at timestamptz;
alter table public.reg_sources
  add column if not exists last_status text;
alter table public.reg_sources
  add column if not exists fail_count integer not null default 0;

create unique index if not exists reg_sources_url_key
  on public.reg_sources (url);

insert into public.reg_sources (framework, label, url, source_kind) values
  ('eu-ai-act',    'EUR-Lex — Reglamento (UE) 2024/1689',              'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', 'page'),
  ('eu-ai-act',    'Comisión Europea — marco regulatorio de IA',       'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', 'page'),
  ('eu-ai-act',    'AI Act Service Desk — Art. 50',                    'https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50', 'page'),
  ('us-nyc-ll144', 'NYC DCWP — Automated Employment Decision Tools',   'https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page', 'page'),
  ('us-co-aiact',  'Colorado General Assembly — SB 26-189',            'https://leg.colorado.gov/bills/sb26-189', 'page'),
  ('us-il-aivia',  'Illinois General Assembly — 820 ILCS 42 (AIVIA)',  'https://www.ilga.gov/Legislation/ILCS/Articles?ActID=4015&ChapterID=68', 'page'),
  ('us-il-hra',    'Illinois General Assembly — 775 ILCS 5 (IHRA)',    'https://www.ilga.gov/Legislation/ILCS/Articles?ActID=2266&ChapterID=64', 'page'),
  ('us-eeoc',      'EEOC — Artificial Intelligence and the ADA',       'https://www.eeoc.gov/eeoc-disability-related-resources/artificial-intelligence-and-ada', 'page')
on conflict (url) do nothing;

create or replace function public.vigia_report(
  src uuid, new_hash text, ok boolean, err text
) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  s          public.reg_sources%rowtype;
  changed    boolean := false;
  first_seen boolean := false;
  cand_id    uuid;
begin
  if not (
    public.is_platform_admin()
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role'
  ) then
    raise exception 'no autorizado';
  end if;

  select * into s from public.reg_sources where id = src for update;
  if not found then raise exception 'fuente no encontrada'; end if;

  if not ok then
    update public.reg_sources
       set last_checked_at = now(),
           last_status     = 'error',
           fail_count      = s.fail_count + 1
     where id = src;
    return jsonb_build_object(
      'status', 'error', 'changed', false,
      'detail', coalesce(nullif(trim(err), ''), 'error de descarga')
    );
  end if;

  first_seen := s.last_hash is null;
  changed    := (not first_seen) and (s.last_hash is distinct from new_hash);

  update public.reg_sources
     set last_hash       = new_hash,
         last_checked_at = now(),
         last_status     = case when changed then 'changed'
                                when first_seen then 'baseline'
                                else 'ok' end,
         last_change_at  = case when changed then now() else s.last_change_at end,
         fail_count      = 0
   where id = src;

  if not changed then
    return jsonb_build_object(
      'status', case when first_seen then 'baseline' else 'unchanged' end,
      'changed', false
    );
  end if;

  if exists (
    select 1 from public.reg_candidates
    where source_id = src and status = 'draft'
  ) then
    return jsonb_build_object('status', 'changed', 'changed', true, 'candidate', 'deduped');
  end if;

  insert into public.reg_candidates (
    framework, title, summary, impact, action, articles, source, scope,
    status, source_id, provenance
  ) values (
    s.framework,
    'Cambio detectado en «' || s.label || '»',
    'El Vigía detectó que el contenido de una fuente oficial vigilada cambió desde la última revisión. Revisa la fuente para determinar qué cambió y, si procede, redacta el evento regulatorio.',
    'Señal automática de cambio, aún sin analizar. Un cambio en esta fuente puede afectar a los sistemas del inventario según su marco (' || s.framework || ').',
    'Abre la fuente, identifica el cambio y —si es relevante— completa y publica el evento; si es ruido, descártalo.',
    '[]'::jsonb,
    jsonb_build_object('label', s.label, 'url', s.url),
    '{}'::jsonb,
    'draft',
    src,
    jsonb_build_object(
      'agent', 'Vigía',
      'model', null,
      'confidence', 0.35,
      'excerpt', 'hash de contenido distinto al de la última revisión',
      'detected_at', now()
    )
  )
  returning id into cand_id;

  return jsonb_build_object('status', 'changed', 'changed', true, 'candidate', cand_id);
end $$;

revoke all on function public.vigia_report(uuid, text, boolean, text) from anon;
grant execute on function public.vigia_report(uuid, text, boolean, text) to authenticated;


-- ==========================================================================
-- 0015_reg_analista.sql — Fase B del foso: el Analista (RAG / pgvector)
-- ==========================================================================

create extension if not exists vector with schema extensions;

create table if not exists public.reg_knowledge_chunks (
  id           uuid primary key default gen_random_uuid(),
  framework    text not null default 'eu-ai-act',
  doc_ref      text not null,
  title        text,
  chunk_index  integer not null default 0,
  content      text not null,
  token_count  integer,
  model        text not null,
  source_url   text,
  source_hash  text,
  embedding    extensions.vector(1024),
  created_at   timestamptz not null default now(),
  unique (framework, doc_ref, chunk_index)
);

alter table public.reg_knowledge_chunks enable row level security;

drop policy if exists reg_knowledge_admin on public.reg_knowledge_chunks;
create policy reg_knowledge_admin on public.reg_knowledge_chunks
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create index if not exists reg_knowledge_chunks_embedding_idx
  on public.reg_knowledge_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

create or replace function public.match_reg_chunks(
  query_embedding extensions.vector, fw text, k integer
) returns table (
  id uuid, doc_ref text, title text, content text, source_url text, similarity double precision
)
language sql stable security definer set search_path = '' as $$
  select
    c.id, c.doc_ref, c.title, c.content, c.source_url,
    1 - (c.embedding OPERATOR(extensions.<=>) query_embedding) as similarity
  from public.reg_knowledge_chunks c
  where c.framework = fw and c.embedding is not null
  order by c.embedding OPERATOR(extensions.<=>) query_embedding
  limit greatest(coalesce(k, 6), 1)
$$;

revoke all on function public.match_reg_chunks(extensions.vector, text, integer) from anon;
grant execute on function public.match_reg_chunks(extensions.vector, text, integer) to authenticated;

create or replace function public.enrich_reg_candidate_ai(
  cand uuid, patch jsonb, prov jsonb
) returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not (
    public.is_platform_admin()
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role'
  ) then
    raise exception 'no autorizado';
  end if;

  update public.reg_candidates set
    event_date        = coalesce(nullif(patch->>'event_date', '')::date, event_date),
    kind              = coalesce(nullif(patch->>'kind', ''), kind),
    framework         = coalesce(nullif(patch->>'framework', ''), framework),
    title             = coalesce(nullif(patch->>'title', ''), title),
    summary           = coalesce(patch->>'summary', summary),
    impact            = coalesce(patch->>'impact', impact),
    action            = coalesce(patch->>'action', action),
    articles          = coalesce(patch->'articles', articles),
    scope             = coalesce(patch->'scope', scope),
    proposed_event_id = coalesce(nullif(patch->>'proposed_event_id', ''), proposed_event_id),
    provenance        = coalesce(provenance, '{}'::jsonb) || coalesce(prov, '{}'::jsonb)
  where id = cand and status = 'draft';

  if not found then raise exception 'candidato no encontrado o ya revisado'; end if;
end $$;

revoke all on function public.enrich_reg_candidate_ai(uuid, jsonb, jsonb) from anon;
grant execute on function public.enrich_reg_candidate_ai(uuid, jsonb, jsonb) to authenticated;


-- ==========================================================================
-- 0016_fix_illinois_urls.sql — corrige URLs muertas de Illinois (ilga.gov)
-- ==========================================================================
update public.reg_sources
   set url = 'https://www.ilga.gov/Legislation/ILCS/Articles?ActID=4015&ChapterID=68',
       last_status = null, fail_count = 0, last_hash = null, last_change_at = null
 where url = 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=4015&ChapterID=68';
update public.reg_sources
   set url = 'https://www.ilga.gov/Legislation/ILCS/Articles?ActID=2266&ChapterID=64',
       last_status = null, fail_count = 0, last_hash = null, last_change_at = null
 where url = 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2266&ChapterID=64';


-- ============================================================
-- 0017_subscriptions.sql
-- ============================================================

-- Attesta — suscripciones (Stripe). Una fila por organización.
--
-- La escribe SOLO el webhook de Stripe (con service_role, que salta RLS). Los
-- miembros de la organización pueden leer su propia suscripción. El estado
-- gobierna el acceso a las funciones de pago (bloqueo por suscripción).
--
-- ADITIVO. Compatible con modo demo (no existe la tabla → la app no bloquea).

create table if not exists public.subscriptions (
  organization_id        uuid primary key references public.organizations (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text not null default 'inactive',
  price_id               text,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx
  on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Los miembros de la org pueden leer su suscripción. Nadie la escribe por RLS:
-- solo el service_role (webhook), que la ignora.
drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

-- updated_at automático.
drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ¿La organización tiene una suscripción que da acceso? (activa o en prueba)
create or replace function public.org_has_active_subscription(org uuid)
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.subscriptions
    where organization_id = org
      and status in ('active', 'trialing')
  )
$$;

revoke all on function public.org_has_active_subscription(uuid) from anon;
grant execute on function public.org_has_active_subscription(uuid) to authenticated;


-- ============================================================================
-- 0018_org_plan.sql — plan (nivel de acceso) por organización
-- ============================================================================

alter table public.organizations
  add column if not exists plan text not null default 'free';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_plan_check'
  ) then
    alter table public.organizations
      add constraint organizations_plan_check
      check (plan in ('free', 'preparacion', 'enterprise'));
  end if;
end $$;


-- ============================================================================
-- 0019_bias_audit.sql — evidencia de auditoría de sesgo (NYC LL144)
-- ============================================================================

alter table public.ai_systems
  add column if not exists is_aedt boolean not null default false,
  add column if not exists last_bias_audit_date date,
  add column if not exists independent_auditor_name text,
  add column if not exists auditor_independence_confirmed boolean not null default false,
  add column if not exists bias_audit_summary_url text,
  add column if not exists summary_published_date date;


-- ============================================================================
-- 0020_audit_chain.sql — audit-trail a prueba de manipulación (hash chain SHA-256)
-- ============================================================================

-- una cadena por organización. Alterar o borrar cualquier evento —incluso con acceso
-- directo a la base— rompe la cadena y queda demostrable con verify_audit_chain().
--
-- No se emite ninguna afirmación de certificación: es evidencia de integridad técnica,
-- no un sello de conformidad.

-- pgcrypto (digest/sha256). En Supabase vive en el esquema `extensions`.
create extension if not exists pgcrypto with schema extensions;

-- Columnas de la cadena. Nullable para permitir el backfill de filas históricas.
alter table public.audit_log add column if not exists prev_hash text;
alter table public.audit_log add column if not exists row_hash  text;

-- ---------------------------------------------------------------------------
-- Hash canónico de una fila de auditoría. Función ÚNICA usada por el trigger,
-- el backfill y la verificación → las tres rutas producen exactamente el mismo
-- hash para el mismo contenido (imprescindible para que la cadena cuadre).
--
-- Serializa el contenido como jsonb (orden de claves normalizado y estable) y lo
-- concatena con el hash previo: hash = sha256( prev_hash || '|' || payload ).
-- ---------------------------------------------------------------------------
create or replace function private.audit_hash(
  p_prev   text,
  p_org    uuid,
  p_actor  uuid,
  p_table  text,
  p_row    text,
  p_action text,
  p_old    jsonb,
  p_new    jsonb,
  p_diff   jsonb,
  p_at     timestamptz
) returns text
language sql immutable set search_path = '' as $$
  select encode(
    extensions.digest(
      convert_to(
        p_prev || '|' || jsonb_build_object(
          'organization_id', p_org,
          'actor_id',        p_actor,
          'table_name',      p_table,
          'row_id',          p_row,
          'action',          p_action,
          'old_data',        p_old,
          'new_data',        p_new,
          'diff',            p_diff,
          'at',              p_at
        )::text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  )
$$;

-- Constante génesis (hash previo de la primera fila de cada organización).
-- 64 ceros = longitud de un SHA-256 en hex, para que toda la cadena sea homogénea.

-- ---------------------------------------------------------------------------
-- Trigger de auditoría, ahora encadenado. Reemplaza al de 0003.
-- ---------------------------------------------------------------------------
create or replace function private.write_audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_org    uuid;
  v_actor  uuid := (select auth.uid());
  v_new    jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  v_old    jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  v_diff   jsonb := '{}'::jsonb;
  v_row    text;
  v_action text := lower(tg_op);
  v_at     timestamptz := now();
  v_prev   text;
  v_hash   text;
  k text;
begin
  v_org := coalesce(
    (case when tg_op = 'DELETE' then old else new end).organization_id,
    null
  );

  -- diff: columnas cambiadas en un UPDATE
  if tg_op = 'UPDATE' then
    for k in select jsonb_object_keys(v_new) loop
      if v_new -> k is distinct from v_old -> k then
        v_diff := v_diff || jsonb_build_object(k, jsonb_build_array(v_old -> k, v_new -> k));
      end if;
    end loop;
  end if;

  v_row := (coalesce((case when tg_op = 'DELETE' then old else new end).id))::text;

  -- Serializa los appends por organización: sin esto, dos escrituras concurrentes
  -- podrían leer el mismo prev_hash y bifurcar la cadena.
  perform pg_advisory_xact_lock(hashtextextended(v_org::text, 0));

  -- Último eslabón de la cadena de esta organización (o génesis si es el primero).
  select a.row_hash into v_prev
  from public.audit_log a
  where a.organization_id = v_org
  order by a.id desc
  limit 1;
  v_prev := coalesce(v_prev, repeat('0', 64));

  v_hash := private.audit_hash(
    v_prev, v_org, v_actor, tg_table_name, v_row, v_action,
    v_old, v_new, case when tg_op = 'UPDATE' then v_diff else null end, v_at
  );

  insert into public.audit_log (
    organization_id, actor_id, table_name, row_id, action,
    old_data, new_data, diff, at, prev_hash, row_hash
  )
  values (
    v_org, v_actor, tg_table_name, v_row, v_action::public.audit_action,
    v_old, v_new, case when tg_op = 'UPDATE' then v_diff else null end,
    v_at, v_prev, v_hash
  );

  return coalesce(new, old);
end $$;

-- ---------------------------------------------------------------------------
-- Backfill de la cadena para las filas históricas. El trigger de inmutabilidad
-- bloquea UPDATE sobre audit_log, así que se desactiva solo durante el backfill.
-- ---------------------------------------------------------------------------
alter table public.audit_log disable trigger audit_no_update;

do $$
declare
  r    record;
  v_prev text;
  v_org  uuid := '00000000-0000-0000-0000-000000000000';
  v_hash text;
begin
  for r in
    select * from public.audit_log
    order by organization_id, id asc
  loop
    if v_org is distinct from r.organization_id then
      v_org  := r.organization_id;
      v_prev := repeat('0', 64);
    end if;
    v_hash := private.audit_hash(
      v_prev, r.organization_id, r.actor_id, r.table_name, r.row_id,
      r.action::text, r.old_data, r.new_data, r.diff, r.at
    );
    update public.audit_log set prev_hash = v_prev, row_hash = v_hash where id = r.id;
    v_prev := v_hash;
  end loop;
end $$;

alter table public.audit_log enable trigger audit_no_update;

-- ---------------------------------------------------------------------------
-- Verificación de la cadena de una organización. Recalcula cada eslabón en orden
-- y compara con lo almacenado. Devuelve el total, si está íntegra, y el id del
-- primer evento donde se rompe (null si todo cuadra). Guardada por pertenencia.
-- ---------------------------------------------------------------------------
create or replace function public.verify_audit_chain(org uuid)
returns table (
  total      bigint,
  ok         boolean,
  broken_id  bigint,
  checked_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
declare
  r       record;
  v_prev  text := repeat('0', 64);
  v_calc  text;
  v_total bigint := 0;
  v_broken bigint := null;
begin
  if org not in (select private.user_orgs()) then
    raise exception 'no autorizado';
  end if;

  for r in
    select * from public.audit_log a
    where a.organization_id = org
    order by a.id asc
  loop
    v_total := v_total + 1;
    v_calc := private.audit_hash(
      v_prev, r.organization_id, r.actor_id, r.table_name, r.row_id,
      r.action::text, r.old_data, r.new_data, r.diff, r.at
    );
    if r.prev_hash is distinct from v_prev or r.row_hash is distinct from v_calc then
      v_broken := r.id;
      exit;
    end if;
    v_prev := r.row_hash;
  end loop;

  return query select v_total, (v_broken is null), v_broken, now();
end $$;

revoke all on function public.verify_audit_chain(uuid) from anon;
grant execute on function public.verify_audit_chain(uuid) to authenticated;


-- ============================================================
-- 0021_membership_guards.sql
-- ============================================================
-- 0021 · Guardas de integridad de membresías a nivel de BD (defensa en profundidad)
--
-- Las invariantes "solo un owner otorga/retira el rol owner" y "una organización
-- nunca se queda sin owner" vivían SOLO en la app (team-actions.ts). Como la anon
-- key es pública y PostgREST es accesible directamente, un usuario con rol admin
-- podía saltarse esas guardas escribiendo en `memberships` por API (auto-promoverse
-- a owner con un UPDATE, o expulsar al owner con un DELETE) — escalada intra-tenant.
--
-- Este trigger impone las invariantes para CUALQUIER escritor (app o PostgREST
-- directo). Solo actúa en UPDATE/DELETE: los INSERT (creación de la org con su
-- primer owner, invitaciones aceptadas) van por funciones security definer y no
-- deben verse afectados; además `unique (organization_id, user_id)` ya impide
-- insertar una segunda fila para el mismo usuario.

create or replace function public.enforce_membership_guards()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_role public.member_role;
  v_other_owners int;
begin
  -- Contextos de confianza (service_role / postgres / DBA por SQL Editor) tienen
  -- auth.uid() nulo: no son el vector de ataque y deben poder operar/mantener.
  if (select auth.uid()) is null then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  -- Rol del actor (según el JWT) en la organización afectada.
  select role into v_actor_role
  from public.memberships
  where organization_id = coalesce(new.organization_id, old.organization_id)
    and user_id = (select auth.uid());

  if tg_op = 'UPDATE' then
    -- Escalar a owner exige ser owner.
    if new.role = 'owner'
       and old.role is distinct from 'owner'
       and coalesce(v_actor_role, 'member') <> 'owner' then
      raise exception 'solo un owner puede otorgar el rol owner';
    end if;
    -- Degradar a un owner exige ser owner y no dejar la org sin owner.
    if old.role = 'owner' and new.role is distinct from 'owner' then
      if coalesce(v_actor_role, 'member') <> 'owner' then
        raise exception 'solo un owner puede modificar a otro owner';
      end if;
      select count(*) into v_other_owners
      from public.memberships
      where organization_id = old.organization_id
        and role = 'owner'
        and user_id <> old.user_id;
      if v_other_owners = 0 then
        raise exception 'la organización no puede quedarse sin owner';
      end if;
    end if;

  elsif tg_op = 'DELETE' then
    if old.role = 'owner' then
      if coalesce(v_actor_role, 'member') <> 'owner' then
        raise exception 'solo un owner puede quitar a otro owner';
      end if;
      select count(*) into v_other_owners
      from public.memberships
      where organization_id = old.organization_id
        and role = 'owner'
        and user_id <> old.user_id;
      if v_other_owners = 0 then
        raise exception 'la organización no puede quedarse sin owner';
      end if;
    end if;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists enforce_membership_guards on public.memberships;
create trigger enforce_membership_guards
  before update or delete on public.memberships
  for each row execute function public.enforce_membership_guards();

-- ============================================================================
-- 0022_gap_prohibited.sql
-- ============================================================================
-- Marca de "práctica prohibida" en las brechas (gap_items). Un control cuyo objeto
-- es una práctica prohibida del Art. 5 (riesgo inaceptable) no es una brecha
-- ordinaria: queda fuera del cómputo de preparación y se trata como revisión
-- jurídica. Columna booleana con default false (degradación segura).
alter table public.gap_items
  add column if not exists prohibited boolean not null default false;

comment on column public.gap_items.prohibited is
  'true = el control corresponde a una práctica prohibida del Art. 5 (riesgo inaceptable); queda fuera del cómputo de preparación y se trata como revisión jurídica, no como brecha a cerrar.';

-- ============================================================================
-- 0023_audit_chain_verify_all.sql
-- ============================================================================
-- Verificación de la cadena de auditoría para operaciones (todas las orgs).
-- verify_audit_chain(org) tiene guard por usuario; esta variante la usa el cron
-- de ops (service_role) para recorrer TODAS las organizaciones sin ese guard.

create or replace function public.verify_all_audit_chains()
returns table (
  organization_id uuid,
  total      bigint,
  ok         boolean,
  broken_id  bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  o        record;
  r        record;
  v_prev   text;
  v_calc   text;
  v_total  bigint;
  v_broken bigint;
begin
  for o in select id from public.organizations loop
    v_prev := repeat('0', 64);
    v_total := 0;
    v_broken := null;

    for r in
      select * from public.audit_log a
      where a.organization_id = o.id
      order by a.id asc
    loop
      v_total := v_total + 1;
      v_calc := private.audit_hash(
        v_prev, r.organization_id, r.actor_id, r.table_name, r.row_id,
        r.action::text, r.old_data, r.new_data, r.diff, r.at
      );
      if r.prev_hash is distinct from v_prev
         or r.row_hash is distinct from v_calc then
        v_broken := r.id;
        exit;
      end if;
      v_prev := r.row_hash;
    end loop;

    organization_id := o.id;
    total := v_total;
    ok := (v_broken is null);
    broken_id := v_broken;
    return next;
  end loop;
end $$;

revoke all on function public.verify_all_audit_chains() from anon, authenticated;

-- ============================================================================
-- 0024_redteam_fixes.sql
-- ============================================================================
-- Correcciones del red team: escalada admin→owner por INSERT directo
-- (memberships + invitations) y bypass de facturación (organizations.plan).
-- Endurece RLS (los RPCs security definer la bypasean, no se rompen) y revoca el
-- UPDATE de la columna plan al rol authenticated.

drop policy if exists memberships_write_admin on public.memberships;
create policy memberships_write_admin on public.memberships
  for all
  using (
    private.user_has_role(organization_id, array['owner','admin']::public.member_role[])
  )
  with check (
    private.user_has_role(organization_id, array['owner','admin']::public.member_role[])
    and (
      role::text <> 'owner'
      or private.user_has_role(organization_id, array['owner']::public.member_role[])
    )
  );

drop policy if exists invitations_write on public.invitations;
create policy invitations_write on public.invitations
  for all
  using (
    private.user_has_role(organization_id, array['owner','admin']::public.member_role[])
  )
  with check (
    private.user_has_role(organization_id, array['owner','admin']::public.member_role[])
    and (
      role::text <> 'owner'
      or private.user_has_role(organization_id, array['owner']::public.member_role[])
    )
  );

revoke update (plan) on public.organizations from authenticated;
