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
