-- 0031_review_cadence_rpc.sql
-- Arregla la escritura de la cadencia de revisión que 0030 dejó inalcanzable.
--
-- POR QUÉ EXISTE. 0030 añadió `organizations.review_cadence_days` y la aplicación
-- la escribía con un `update` directo sobre la tabla. En el Postgres de pruebas
-- funcionaba; contra el Supabase real da **42501 permission denied**.
--
-- La causa no es la RLS, es un GRANT: la migración **0025** endureció esta tabla
-- a propósito, cambiando el `UPDATE` de tabla por una lista blanca de columnas
-- (`grant update (name, slug) on public.organizations to authenticated`). Aquello
-- cerró un agujero real —sin esa lista, un cliente podía escribirse su propia
-- columna `plan` y ascenderse de plan solo—, así que la lista blanca se queda; lo
-- que estaba mal era escribir por fuera de ella.
--
-- Cómo se detectó, y por qué merece la pena repetirlo: el Postgres desechable NO
-- reproduce los grants por defecto de Supabase, así que **no puede decir nada
-- sobre permisos**. Esto solo aparece verificando por API contra el proyecto real
-- con usuarios `*@attesta-test.dev`. Es la segunda vez que ese entorno de pruebas
-- da un falso verde sobre permisos (la primera, 0026/0027 → 0028).
--
-- SOLUCIÓN: el mismo patrón que ya usa `set_org_jurisdictions` para el otro ajuste
-- de organización — una función `security definer` con el guard de rol DENTRO.
-- Ventaja añadida sobre ampliar el grant: la policy `organizations_update` es solo
-- de `owner`, y para un ajuste operativo como este owner **y** admin es lo
-- razonable; el guard de la función lo permite sin tocar la policy.
--
-- ADITIVO y seguro: si no está aplicada, la sección de incidentes se ve y se usa
-- igual; lo único que no se puede es cambiar la cadencia (queda la de 12 meses).

create or replace function public.set_review_cadence(org uuid, days integer)
returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not private.user_has_role(org, array['owner', 'admin']::public.member_role[]) then
    raise exception 'no autorizado';
  end if;

  -- Doble cinturón con el CHECK de 0030: el catálogo se valida aquí también para
  -- que el error sea 'cadencia no válida' y no un fallo de restricción opaco.
  if days is not null and days not in (180, 365, 730) then
    raise exception 'cadencia no válida';
  end if;

  update public.organizations
     set review_cadence_days = days
   where id = org;
end $$;

-- `revoke ... from anon` a secas NO revoca nada: PostgreSQL concede EXECUTE a
-- PUBLIC por defecto y `anon` lo hereda por ahí (lección de 0028).
revoke all on function public.set_review_cadence(uuid, integer) from public;
revoke all on function public.set_review_cadence(uuid, integer) from anon;
grant execute on function public.set_review_cadence(uuid, integer) to authenticated;

comment on function public.set_review_cadence(uuid, integer) is
  'Fija la cadencia de revisión de la autoevaluación (180/365/730, null = defecto). Solo owner/admin. Existe porque 0025 dejó organizations con UPDATE restringido a (name, slug).';
