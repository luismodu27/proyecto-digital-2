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
