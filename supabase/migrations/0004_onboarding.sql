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
