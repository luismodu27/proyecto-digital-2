-- 0041_audit_hash_utc.sql
-- El hash del audit-trail deja de depender de la zona horaria de la sesión.
--
-- ============================================================================
-- EL FALLO, y por qué es real aunque hoy no esté ardiendo
-- ============================================================================
--
-- `private.audit_hash` (0020) serializa el instante del evento metiendo un
-- `timestamptz` dentro de un `jsonb_build_object(...)::text`. Y ahí está el
-- problema: convertir un `timestamptz` a texto (vía jsonb) usa la zona horaria de
-- la SESIÓN (`TimeZone`). El mismo instante, serializado en dos sesiones con zona
-- distinta, produce dos textos distintos —y por tanto dos hashes distintos—.
--
-- La función está marcada `immutable`, lo cual además NO era cierto: una función
-- cuyo resultado depende de un GUC de sesión no es inmutable. Era una bomba de
-- relojería con la mecha apagada: hoy funciona porque Supabase usa UTC por defecto
-- en todas las conexiones, así que el trigger de escritura y el cron de
-- verificación coinciden. Pero basta con que una sola conexión escriba o verifique
-- con otra zona (un `SET TIME ZONE`, un cliente mal configurado, un cambio de
-- defecto de la plataforma) para que la cadena se reporte ROTA sin que nadie la
-- haya tocado —una falsa alarma de manipulación, que en este producto es de las
-- peores cosas que pueden pasar—.
--
-- ============================================================================
-- EL ARREGLO
-- ============================================================================
--
-- Se serializa el instante SIEMPRE en UTC y con un formato fijo
-- (`...at time zone 'UTC'` + `to_char`), de modo que el texto no depende de la
-- sesión. Con eso la función pasa a ser inmutable de verdad.
--
-- CONSECUENCIA INEVITABLE: cambiar la fórmula cambia TODOS los hashes. Los que ya
-- están almacenados se calcularon con la fórmula vieja, así que hay que RE-CALCULAR
-- la cadena entera —exactamente el mismo backfill que hizo la 0020 al introducirla—.
-- No se pierde ni un dato: el CONTENIDO de cada fila no se toca, solo se recomputan
-- `prev_hash`/`row_hash`. Es determinista y re-ejecutable: volver a pegarla produce
-- los mismos hashes. Es SOLO base de datos —el trigger, `verify_audit_chain` y
-- `verify_all_audit_chains` llaman a esta función por nombre y usan la nueva
-- definición al instante—, sin ningún cambio de código de la aplicación.
--
-- La función y el backfill van seguidos, igual que en la 0020: si el backfill no
-- llegara a correr, quedarían filas viejas con hashes viejos frente a una fórmula
-- nueva (falsa alarma). Volver a pegar el fichero lo resuelve.

-- ---------------------------------------------------------------------------
-- (1) Hash canónico, ahora independiente de zona. Único cambio frente a 0020:
--     `p_at` se serializa como texto UTC fijo en vez de dejar que jsonb lo
--     renderice según el `TimeZone` de la sesión.
-- ---------------------------------------------------------------------------
create or replace function private.audit_hash(
  p_prev   text,
  p_org    uuid,
  p_actor  uuid,
  p_table  text,
  p_row    text,
  p_action text,
  p_old    jsonb,
  p_new    jsonb,
  p_diff   jsonb,
  p_at     timestamptz
) returns text
language sql immutable set search_path = '' as $$
  select encode(
    extensions.digest(
      convert_to(
        p_prev || '|' || jsonb_build_object(
          'organization_id', p_org,
          'actor_id',        p_actor,
          'table_name',      p_table,
          'row_id',          p_row,
          'action',          p_action,
          'old_data',        p_old,
          'new_data',        p_new,
          'diff',            p_diff,
          -- UTC fijo, independiente de la sesión. `to_char` sobre el instante ya
          -- llevado a UTC da un texto estable (p. ej. 2026-08-08T12:00:00.123456Z).
          'at',              to_char(p_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
        )::text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  )
$$;

-- ---------------------------------------------------------------------------
-- (2) Re-calcular la cadena entera con la nueva fórmula. Estructura idéntica al
--     backfill de la 0020: el trigger de inmutabilidad bloquea UPDATE sobre
--     audit_log, así que se desactiva solo durante el backfill. Por organización,
--     en orden de id, arrancando de la constante génesis (64 ceros).
-- ---------------------------------------------------------------------------
alter table public.audit_log disable trigger audit_no_update;

do $$
declare
  r      record;
  v_prev text;
  v_org  uuid := '00000000-0000-0000-0000-000000000000';
  v_hash text;
begin
  for r in
    select * from public.audit_log
    order by organization_id, id asc
  loop
    if v_org is distinct from r.organization_id then
      v_org  := r.organization_id;
      v_prev := repeat('0', 64);
    end if;
    v_hash := private.audit_hash(
      v_prev, r.organization_id, r.actor_id, r.table_name, r.row_id,
      r.action::text, r.old_data, r.new_data, r.diff, r.at
    );
    update public.audit_log set prev_hash = v_prev, row_hash = v_hash where id = r.id;
    v_prev := v_hash;
  end loop;
end $$;

alter table public.audit_log enable trigger audit_no_update;
