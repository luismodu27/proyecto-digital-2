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
