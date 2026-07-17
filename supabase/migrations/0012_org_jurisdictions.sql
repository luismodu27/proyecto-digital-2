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
