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
