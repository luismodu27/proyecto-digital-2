-- Parche: corrige el cast al enum en private.write_audit().
-- Con `search_path = ''` el tipo debe ir cualificado: public.audit_action.
-- Idempotente: create or replace. Aplica esto en Supabase → SQL Editor.

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
