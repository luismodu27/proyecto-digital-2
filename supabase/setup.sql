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

-- ============================================================================
-- 0025_redteam_round2_fixes.sql
-- ============================================================================
-- Ronda 2: FIX 3 de 0024 (bypass de plan) era un no-op (revoke de columna no
-- recorta el grant de tabla). Se revoca UPDATE de tabla y se re-otorga solo
-- columnas de identidad; `plan` queda no escribible por authenticated. Además el
-- guard de pertenencia que le faltaba a org_has_active_subscription.

revoke update on public.organizations from authenticated;
grant update (name, slug) on public.organizations to authenticated;

create or replace function public.org_has_active_subscription(org uuid)
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.subscriptions
    where organization_id = org
      and status in ('active', 'trialing')
  ) and (org in (select private.user_orgs()))
$$;

-- ============================================================================
-- 0026_telemetry.sql
-- ============================================================================
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

-- ============================================================================
-- 0027_intake_links.sql
-- ============================================================================
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


-- ============================================================================
-- 0028_grant_hardening.sql
-- ============================================================================
-- 0028_grant_hardening.sql
-- Endurece los PERMISOS (grants) de lo que 0026 y 0027 dejaron a medias.
--
-- POR QUÉ EXISTE. Al verificar 0026/0027 contra el Supabase real (no contra el
-- Postgres de pruebas) salieron dos diferencias entre lo que el SQL PARECÍA hacer
-- y lo que hace de verdad. Ninguna filtra datos hoy, pero las dos convierten una
-- defensa en profundidad en una sola capa, y eso es exactamente lo que no se
-- quiere en la única superficie anónima del producto.
--
--   (1) `revoke all on function f from anon` NO revoca nada. PostgreSQL concede
--       `EXECUTE` a **PUBLIC** por defecto en cada función nueva, y `anon` hereda
--       ese permiso vía PUBLIC. Comprobado: `anon` puede EJECUTAR
--       `product_funnel`; lo único que lo protege es el guard
--       `where public.is_platform_admin()` que lleva dentro (devuelve 0 filas).
--       Para revocar de verdad hay que revocar **de PUBLIC**, y volver a conceder
--       explícitamente a quien deba usarla.
--
--   (2) En Supabase, el rol `anon` tiene `SELECT` concedido por defecto sobre las
--       tablas de `public`. En el Postgres de pruebas no, y por eso allí un SELECT
--       de `anon` daba *permission denied* mientras en producción da `200 []`.
--       Las dos respuestas son seguras —la RLS no le concede ninguna fila— pero la
--       de producción depende SOLO de la RLS. Si algún día alguien añade una
--       policy permisiva por error, en producción eso sería una fuga y en pruebas
--       no. Revocando el SELECT, hacen falta DOS errores para filtrar, no uno.
--
-- QUÉ NO SE TOCA: el `INSERT` de `anon` en `product_events` (la landing es pública
-- y sus visitas son anónimas: sin ese insert no hay medición) ni el `EXECUTE` de
-- `submit_intake` (es la puerta pública del intake, a propósito).

/* -------------------------------------------------------------------------- */
/* (1) Revocar de PUBLIC, no de anon                                          */
/* -------------------------------------------------------------------------- */

-- El embudo es un panel interno de Attesta. Solo `authenticated`, y con el guard
-- de admin dentro de la propia función.
revoke all on function public.product_funnel(integer) from public;
revoke all on function public.product_funnel(integer) from anon;
grant execute on function public.product_funnel(integer) to authenticated;

-- Mismo defecto en 0011: `is_platform_admin()` la puede ejecutar `anon` vía
-- PUBLIC. Devuelve `false` (no hay `auth.uid()`), así que no filtra, pero no hay
-- ninguna razón para que un anónimo pueda llamarla.
revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_platform_admin() from anon;
grant execute on function public.is_platform_admin() to authenticated;

-- `btrim_safe` sí la necesita `anon`: la usa `submit_intake`. Se deja explícito
-- para que se vea que es deliberado y no un olvido.
grant execute on function public.btrim_safe(text) to anon, authenticated;

/* -------------------------------------------------------------------------- */
/* (2) Quitarle a `anon` el SELECT sobre las tablas nuevas                     */
/* -------------------------------------------------------------------------- */

-- Nadie sin cuenta tiene por qué poder consultar estas tablas. Hoy la RLS ya le
-- devuelve cero filas; esto añade la segunda cerradura.
revoke select on public.intake_links       from anon;
revoke select on public.intake_submissions from anon;

-- En `product_events` se revoca SOLO el select: el INSERT anónimo se conserva
-- porque es lo que permite medir las visitas de la landing.
revoke select on public.product_events from anon;
grant  insert on public.product_events to   anon;

/* -------------------------------------------------------------------------- */
/* Nota para futuras migraciones                                              */
/* -------------------------------------------------------------------------- */

-- Regla que queda: en este esquema, `revoke ... from anon` sobre una FUNCIÓN es
-- casi siempre un no-op. Si una función no debe ser pública, se escribe
--   revoke all on function f(args) from public;
--   grant execute on function f(args) to <rol que sí>;
-- y el guard de autorización va ADEMÁS dentro de la función, nunca en su lugar.


-- ============================================================================
-- 0029_org_limits.sql
-- ============================================================================
-- 0029_org_limits.sql
-- Topes PACTADOS por organización (metering a medida para Enterprise).
--
-- Por qué existe: los cupos por plan viven en el código
-- (`src/lib/billing/limits.ts`: 3 sistemas en el gratuito, 25 en Preparación, sin
-- tope en Enterprise). Eso cubre el autoservicio, pero no un Enterprise vendido
-- "hasta 200 sistemas y 40 asientos": ese número es fruto de una negociación y
-- pertenece a la organización, no al plan.
--
-- Semántica: `null` = usa el cupo de su plan. Un número = **gana sobre el plan**,
-- incluso si es MENOR (así se puede vender un Enterprise con tope pactado). La
-- contrapartida: cuando un contrato termina hay que **limpiarlo**
-- (`set max_systems = null`), o seguirá aplicándose bajo un plan que ya no toca.
--
-- ADITIVO y seguro: si esta migración no está aplicada, la app no encuentra las
-- columnas, lo registra como `migration-pending` y usa los cupos del plan. Nadie
-- se queda bloqueado ni se le regala cupo por sorpresa.
--
-- Los cupos limitan CREAR, nunca VER: no hay nada aquí que oculte o borre datos
-- existentes. Una organización que baja de plan conserva íntegro su expediente y
-- solo deja de poder añadir más.

alter table public.organizations
  add column if not exists max_systems integer,
  add column if not exists max_seats   integer;

-- Cotas de cordura. El mínimo es 1 (no 0) a propósito: un 0 dejaría la cuenta sin
-- poder crear nada, y un tope pactado de cero no es un caso de negocio real. La
-- capa de código además ignora cualquier valor <= 0, así que hacen falta dos
-- errores para dejar a alguien atascado.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_max_systems_check'
  ) then
    alter table public.organizations
      add constraint organizations_max_systems_check
      check (max_systems is null or max_systems between 1 and 100000);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'organizations_max_seats_check'
  ) then
    alter table public.organizations
      add constraint organizations_max_seats_check
      check (max_seats is null or max_seats between 1 and 10000);
  end if;
end $$;

comment on column public.organizations.max_systems is
  'Tope pactado de sistemas de IA. null = usa el cupo del plan. Gana sobre el plan, incluso si es menor. Limpiar al terminar el contrato.';
comment on column public.organizations.max_seats is
  'Tope pactado de asientos (miembros + invitaciones pendientes). null = usa el cupo del plan.';

-- Para cerrar un Enterprise a medida, el fundador ejecuta en el SQL Editor:
--
--   -- ver el consumo actual de cada organización:
--   select o.id, o.name, o.plan, o.max_systems, o.max_seats,
--          (select count(*) from public.ai_systems s  where s.organization_id = o.id) as sistemas,
--          (select count(*) from public.memberships m where m.organization_id = o.id) as miembros
--     from public.organizations o
--    order by sistemas desc;
--
--   -- fijar los topes pactados:
--   update public.organizations
--      set plan = 'enterprise', max_systems = 200, max_seats = 40
--    where id = '<org-uuid>';
--
--   -- al terminar el contrato, limpiar el pacto (vuelve al cupo de su plan):
--   update public.organizations set max_systems = null, max_seats = null
--    where id = '<org-uuid>';


-- ==========================================================================
-- 0030_incidents.sql
-- ==========================================================================
-- 0030_incidents.sql
-- Registro de incidentes del deployer + cadencia de revisión de la autoevaluación.
--
-- POR QUÉ EXISTE: los packs ya llevan controles que citan el Art. 26.5 ("vigila
-- el funcionamiento… suspende el uso e informa al proveedor… notifica los
-- incidentes graves"), pero no había NINGÚN sitio donde registrar un incidente
-- real. Un control sin expediente es una casilla, no evidencia.
--
-- LAS TRES REGLAS QUE ESTE ESQUEMA EXISTE PARA NO EQUIVOCAR (las tres son
-- contraintuitivas y las tres tienen test en `src/lib/incidents/`):
--
--  1. El Art. 26.5 NO contiene ningún plazo numérico ("sin demora injustificada",
--     "inmediatamente"). Los 15 / 10 / 2 días son del Art. 73 y son DEL
--     PROVEEDOR. Por eso aquí no hay ninguna columna de "fecha límite": se
--     derivan de `aware_on`, y de quién sea el plazo depende de
--     `provider_unreachable`.
--
--  2. `aware_on` es la columna de más valor probatorio de toda la tabla. El
--     Art. 73 cuenta sus plazos "desde que el proveedor O, EN SU CASO, el
--     responsable del despliegue tenga conocimiento": la fecha del cliente
--     arranca un reloj que corre para otro. Es `not null` a propósito.
--
--  3. `use_suspended` acompaña a `risk_art79`, no a `seriousness`. El mandato
--     "suspenderán el uso" está en la frase del riesgo del Art. 79.1, no en la
--     del incidente grave.
--
-- ENCUADRE TEMPORAL: el Art. 26 es exigible para el alto riesgo del Anexo III
-- desde el 2-dic-2027 (Reglamento (UE) 2026/1744). Registrar incidentes hoy es
-- PREPARACIÓN, no una obligación vencida.
--
-- ADITIVO y seguro: si esta migración no está aplicada, la fachada de datos
-- devuelve lista vacía, lo registra como `migration-pending` y la app funciona
-- igual. Nada de lo que ya existe cambia de comportamiento.
--
-- Nota de operación: `create policy` no admite `if not exists`, así que cada una
-- va precedida de `drop policy if exists` para que re-pegar el fichero funcione.

-- ---------------------------------------------------------------------------
-- Expediente de incidente
-- ---------------------------------------------------------------------------
create table if not exists public.incidents (
  id                        uuid primary key default gen_random_uuid(),
  organization_id           uuid not null references public.organizations (id) on delete cascade,
  -- `set null` y no `cascade`: si se da de baja el sistema, el expediente del
  -- incidente SOBREVIVE. Borrar la evidencia al retirar la herramienta es justo
  -- lo contrario de lo que hace un system-of-record.
  ai_system_id              uuid references public.ai_systems (id) on delete set null,
  title                     text not null,
  detail                    text,

  -- Tres fechas distintas, y las tres importan. La definición del Art. 3.49
  -- admite causalidad directa O INDIRECTA, así que el nexo causal se establece
  -- (o no) en un momento propio, distinto del hecho y del conocimiento.
  occurred_on               date,
  aware_on                  date not null default current_date,
  causal_link_on            date,

  -- Categorías del Art. 3, punto 49. Son CINCO y no cuatro: la letra (a) se
  -- parte en muerte / daño grave a la salud porque el Art. 73 les da plazos
  -- distintos (10 vs 15 días), y lo que el registro necesita distinguir es el
  -- plazo, no la letra.
  categories                text[] not null default '{}',

  -- `under_assessment` no es un adorno: al abrir la ficha casi nadie sabe aún si
  -- el evento es "grave" en sentido del Art. 3.49. Obligar a decidirlo entonces
  -- produce o registros falsos o ningún registro.
  seriousness               text not null default 'under_assessment'
    check (seriousness in ('under_assessment', 'serious', 'not_serious')),

  -- ¿Hay motivos para considerar que el uso CONFORME A LAS INSTRUCCIONES puede
  -- hacer que el sistema presente un riesgo del Art. 79.1 (salud, seguridad o
  -- derechos fundamentales)? Ojo: no hace falta mal uso.
  risk_art79                boolean not null default false,
  use_suspended             boolean not null default false,

  -- La casilla que decide si Attesta puede enseñar una cuenta atrás legal al
  -- deployer: solo cuando no se ha podido contactar con el proveedor, el
  -- Art. 26.5 remite al Art. 73 "mutatis mutandis".
  provider_unreachable      boolean not null default false,

  -- Notificación DECLARADA por la organización. Attesta no transmite nada a
  -- ninguna autoridad; esto es el registro de lo que el cliente dice haber hecho.
  notified_provider_on      date,
  notified_distributor_on   date,
  notified_authority_on     date,

  -- Bandera INDEPENDIENTE. Un incidente grave del AI Act no es una violación de
  -- datos personales, ni al revés: pueden coincidir, pero los disparadores, los
  -- destinatarios y los plazos son distintos (72 h del RGPD 33 frente al
  -- "inmediatamente" del 26.5) y corren en paralelo.
  personal_data_breach      boolean not null default false,

  status                    text not null default 'open'
    check (status in ('open', 'closed')),
  created_by                uuid references auth.users (id),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- El contenido del array sí se acota (un enum suelto en un text[] se degrada en
-- semanas). `<@` exige que TODO elemento esté en el catálogo; el array vacío lo
-- cumple, que es justo lo que queremos mientras el incidente está en evaluación.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'incidents_categories_check'
  ) then
    alter table public.incidents
      add constraint incidents_categories_check
      check (categories <@ array[
        'death',
        'serious_health_harm',
        'critical_infrastructure',
        'fundamental_rights',
        'property_or_environment'
      ]::text[]);
  end if;
end $$;

create index if not exists incidents_org_idx
  on public.incidents (organization_id, status, aware_on desc);

alter table public.incidents enable row level security;

-- Colaborativo, como el plan de acción: cualquier miembro de la organización
-- registra y actualiza incidentes. Quien detecta un incidente rara vez es quien
-- tiene rol de admin, y un registro que exige permisos se rellena tarde o no se
-- rellena.
drop policy if exists incidents_select on public.incidents;
create policy incidents_select on public.incidents
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

drop policy if exists incidents_write on public.incidents;
create policy incidents_write on public.incidents
  for all to authenticated
  using (organization_id in (select private.user_orgs()))
  with check (organization_id in (select private.user_orgs()));

-- Se audita como el resto (aparece en el registro de actividad encadenado).
drop trigger if exists audit_incidents on public.incidents;
create trigger audit_incidents
  after insert or update or delete on public.incidents
  for each row execute function private.write_audit();

drop trigger if exists set_incidents_updated_at on public.incidents;
create trigger set_incidents_updated_at
  before update on public.incidents
  for each row execute function public.set_updated_at();

comment on table public.incidents is
  'Registro de incidentes del deployer (Art. 26.5). Notificaciones DECLARADAS por la organización: Attesta no transmite nada a ninguna autoridad.';
comment on column public.incidents.aware_on is
  'Fecha de conocimiento. Arranca los plazos del Art. 73, que son DEL PROVEEDOR salvo que provider_unreachable sea true.';
comment on column public.incidents.risk_art79 is
  'Motivos para considerar un riesgo del Art. 79.1. Esta es la rama que obliga a suspender el uso, no la del incidente grave.';

-- ---------------------------------------------------------------------------
-- Cadencia de revisión de la autoevaluación
-- ---------------------------------------------------------------------------
-- IMPORTANTE: el Reglamento NO fija periodicidad de revisión para el deployer.
-- El Art. 26.5 es un deber continuo sin cadencia y el Art. 27.2 dispara por
-- CAMBIO, no por calendario. Esta columna es una red de seguridad de BUENA
-- PRÁCTICA que la organización elige; la UI la etiqueta como tal y hay un test
-- que rompe si alguien reescribe ese copy como "obligatorio".
--
-- `null` = usa el defecto del producto (12 meses). Se acotan los valores porque
-- una cadencia de 0 o negativa marcaría el inventario entero como vencido.
alter table public.organizations
  add column if not exists review_cadence_days integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_review_cadence_check'
  ) then
    alter table public.organizations
      add constraint organizations_review_cadence_check
      check (review_cadence_days is null or review_cadence_days in (180, 365, 730));
  end if;
end $$;

comment on column public.organizations.review_cadence_days is
  'Cadencia de revisión de la autoevaluación en días (180/365/730). null = 12 meses. BUENA PRÁCTICA: el Reglamento no fija periodicidad.';
