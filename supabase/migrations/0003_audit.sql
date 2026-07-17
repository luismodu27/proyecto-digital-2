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
    lower(tg_op)::audit_action,
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
