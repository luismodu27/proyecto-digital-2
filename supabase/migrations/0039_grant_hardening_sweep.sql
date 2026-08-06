-- 0039_grant_hardening_sweep.sql
-- Cierra de verdad TODAS las funciones, no una más.
--
-- ============================================================================
-- POR QUÉ EXISTE, y conviene leerlo entero porque el fallo era real y estaba vivo
-- ============================================================================
--
-- La 0028 documentó el gotcha y lo arregló: `revoke all on function f from anon`
-- NO revoca nada, porque PostgreSQL concede EXECUTE a **PUBLIC** por defecto en
-- cada función nueva y `anon` lo hereda por ahí. Para cerrar de verdad hay que
-- revocar **de PUBLIC**.
--
-- Pero la 0028 aplicó la corrección a DOS funciones —`product_funnel` e
-- `is_platform_admin`— y dejó las otras quince con la forma que no hace nada. La
-- lección se escribió y no se retrofiteó. Resultado, comprobado hoy contra el
-- proyecto real con la clave pública que cualquiera saca del JavaScript de la web,
-- sin sesión y sin cuenta:
--
--     POST /rest/v1/rpc/verify_all_audit_chains  ->  HTTP 200, 81 filas
--
-- Es decir: el identificador de cada organización cliente, cuántos registros de
-- auditoría tiene cada una, y si su cadena de integridad está intacta. En un
-- producto que se vende como custodio de expedientes, publicar el estado del
-- registro de auditoría ajeno es de los peores datos que se pueden filtrar. Y
-- cada llamada recalcula el hash de TODO el registro de la plataforma, así que
-- además es un amplificador de coste que no requiere cuenta.
--
-- Control que hace la comprobación concluyente y no una casualidad:
-- `product_funnel`, que la 0028 sí cerró bien, responde a la misma petición con
-- `401 permission denied for function`. Misma clave, misma ruta, mismo momento.
-- Una responde y la otra no, y la diferencia es exactamente esta línea.
--
-- POR QUÉ SOLO ESA FUNCIÓN FILTRÓ, teniendo las quince el mismo defecto de
-- permisos: porque las demás llevan un guard DENTRO. Se sondearon una a una:
-- `verify_audit_chain` responde «no autorizado», `list_audit_log` y
-- `list_org_members` devuelven cero filas. Las salvó la segunda cerradura.
-- `verify_all_audit_chains` es la única que no tiene guard interno —se escribió
-- así a propósito, porque el cron necesita recorrer todas las organizaciones— de
-- modo que era la única función del esquema con las DOS defensas ausentes a la
-- vez. Eso es lo que la convirtió en una fuga y no en un susto.
--
-- ============================================================================
-- QUÉ HACE ESTA MIGRACIÓN
-- ============================================================================
--
--   (1) Revoca de PUBLIC en las quince funciones que quedaron a medias, y vuelve
--       a conceder EXECUTE explícitamente a quien deba usarlas.
--   (2) Le pone a `verify_all_audit_chains` el guard interno que le faltaba, con
--       el mismo patrón que ya usan `vigia_report` (0014) y
--       `enrich_reg_candidate_ai` (0015): administrador de plataforma **o** el
--       service_role del cron. Las dos cerraduras, no una.
--
-- Y fuera del SQL queda la tercera pieza, que es la que impide que esto vuelva:
-- `src/lib/security/db-grants.test.ts` escanea estas migraciones y FALLA si
-- alguien declara una función sin cerrarla. La regla deja de depender de que
-- alguien recuerde la lección.
--
-- Es re-ejecutable: `revoke`/`grant` son idempotentes y la función se reemplaza.

/* -------------------------------------------------------------------------- */
/* (1) El guard que faltaba dentro de verify_all_audit_chains                  */
/* -------------------------------------------------------------------------- */

-- Se redefine SOLO para añadir el guard: el cuerpo es idéntico al de 0023.
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
  -- LA SEGUNDA CERRADURA. Los grants de abajo ya deberían bastar, pero esta
  -- función es la que demostró qué pasa cuando solo hay una y falla: hacen falta
  -- dos errores para filtrar, no uno.
  if not (
    public.is_platform_admin()
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role'
  ) then
    raise exception 'no autorizado';
  end if;

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

/* -------------------------------------------------------------------------- */
/* (2) Revocar de PUBLIC en todo lo que quedó a medias                         */
/* -------------------------------------------------------------------------- */

-- --- Operaciones: SOLO el service_role del cron -----------------------------

revoke all on function public.verify_all_audit_chains() from public, anon, authenticated;
grant execute on function public.verify_all_audit_chains() to service_role;

revoke all on function public.apply_subscription_event(
  uuid, text, text, text, text, timestamptz, boolean, timestamptz
) from public, anon, authenticated;
grant execute on function public.apply_subscription_event(
  uuid, text, text, text, text, timestamptz, boolean, timestamptz
) to service_role;

-- --- Producto: hace falta sesión --------------------------------------------
-- Todas llevan además su propio guard dentro (pertenencia a la organización o
-- rol). El grant es la primera cerradura, no la única.

revoke all on function public.verify_audit_chain(uuid) from public, anon;
grant execute on function public.verify_audit_chain(uuid) to authenticated;

revoke all on function public.list_audit_log(uuid, int) from public, anon;
grant execute on function public.list_audit_log(uuid, int) to authenticated;

revoke all on function public.list_org_members(uuid) from public, anon;
grant execute on function public.list_org_members(uuid) to authenticated;

revoke all on function public.org_has_active_subscription(uuid) from public, anon;
grant execute on function public.org_has_active_subscription(uuid) to authenticated, service_role;

revoke all on function public.create_org_and_owner(text, text) from public, anon;
grant execute on function public.create_org_and_owner(text, text) to authenticated;

revoke all on function public.claim_invitations() from public, anon;
grant execute on function public.claim_invitations() to authenticated;

revoke all on function public.invite_member(uuid, text, public.member_role) from public, anon;
grant execute on function public.invite_member(uuid, text, public.member_role) to authenticated;

revoke all on function public.set_org_jurisdictions(uuid, text[]) from public, anon;
grant execute on function public.set_org_jurisdictions(uuid, text[]) to authenticated;

revoke all on function public.set_review_cadence(uuid, integer) from public, anon;
grant execute on function public.set_review_cadence(uuid, integer) to authenticated;

-- --- Pipeline regulatorio: equipo de plataforma o el cron -------------------
-- El corpus normativo no es de ningún cliente, pero tampoco es público: lista qué
-- vigilamos y cómo, que es parte de lo que se vende.

revoke all on function public.approve_reg_candidate(uuid, text) from public, anon;
grant execute on function public.approve_reg_candidate(uuid, text) to authenticated, service_role;

revoke all on function public.reject_reg_candidate(uuid, text) from public, anon;
grant execute on function public.reject_reg_candidate(uuid, text) to authenticated, service_role;

revoke all on function public.enrich_reg_candidate_ai(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.enrich_reg_candidate_ai(uuid, jsonb, jsonb) to authenticated, service_role;

revoke all on function public.vigia_report(uuid, text, boolean, text) from public, anon;
grant execute on function public.vigia_report(uuid, text, boolean, text) to authenticated, service_role;

revoke all on function public.match_reg_chunks(extensions.vector, text, integer) from public, anon;
grant execute on function public.match_reg_chunks(extensions.vector, text, integer) to authenticated, service_role;

/* -------------------------------------------------------------------------- */
/* (3) Lo que se deja abierto A PROPÓSITO                                      */
/* -------------------------------------------------------------------------- */

-- Se re-declara explícitamente para que quede escrito que es una decisión y no un
-- olvido — y para que el guard automático del repositorio pueda distinguirlas.
--
--   · `submit_intake`  → la ÚNICA escritura anónima del producto. Es la puerta
--                        del intake compartible: quien recibe el enlace rellena
--                        una ficha sin cuenta. Devuelve el mismo `false` para
--                        token inexistente, caducado, revocado o agotado, para no
--                        ser un oráculo de tokens.
--   · `btrim_safe`     → la usa `submit_intake` por dentro.
grant execute on function public.btrim_safe(text) to anon, authenticated;
