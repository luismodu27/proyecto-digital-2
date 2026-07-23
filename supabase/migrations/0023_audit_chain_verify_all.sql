-- ============================================================================
-- 0023 · Verificación de la cadena de auditoría para operaciones (todas las orgs)
-- ============================================================================
-- `public.verify_audit_chain(org)` (0020) tiene un guard por usuario
-- (`org in private.user_orgs()`), pensado para que un miembro verifique SU
-- organización desde la app. El cron de ops corre con la service_role (sin
-- sesión de usuario), así que necesita una variante que recorra TODAS las
-- organizaciones sin ese guard.
--
-- Recalcula la cadena de hashes SHA-256 por organización y reporta, por org, si
-- la cadena está intacta (`ok`) o dónde se rompió (`broken_id`). Reutiliza la
-- misma función de hash (`private.audit_hash`) que el trigger `write_audit`, de
-- modo que la verificación es idéntica al cálculo original.
--
-- security definer + search_path='' (cualifica TODO con esquema). Solo la
-- service_role la ejecuta; se revoca a anon y authenticated.

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
