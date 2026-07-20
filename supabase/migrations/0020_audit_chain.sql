-- Attesta — audit-trail a prueba de manipulación (tamper-evident hash chain)
--
-- El audit_log ya es inmutable (triggers block_mutation de 0003). Aquí lo hacemos
-- además VERIFICABLE: cada fila incorpora el hash de la anterior (SHA-256), formando
-- una cadena por organización. Alterar o borrar cualquier evento —incluso con acceso
-- directo a la base— rompe la cadena y queda demostrable con verify_audit_chain().
--
-- No se emite ninguna afirmación de certificación: es evidencia de integridad técnica,
-- no un sello de conformidad.

-- pgcrypto (digest/sha256). En Supabase vive en el esquema `extensions`.
create extension if not exists pgcrypto with schema extensions;

-- Columnas de la cadena. Nullable para permitir el backfill de filas históricas.
alter table public.audit_log add column if not exists prev_hash text;
alter table public.audit_log add column if not exists row_hash  text;

-- ---------------------------------------------------------------------------
-- Hash canónico de una fila de auditoría. Función ÚNICA usada por el trigger,
-- el backfill y la verificación → las tres rutas producen exactamente el mismo
-- hash para el mismo contenido (imprescindible para que la cadena cuadre).
--
-- Serializa el contenido como jsonb (orden de claves normalizado y estable) y lo
-- concatena con el hash previo: hash = sha256( prev_hash || '|' || payload ).
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
          'at',              p_at
        )::text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  )
$$;

-- Constante génesis (hash previo de la primera fila de cada organización).
-- 64 ceros = longitud de un SHA-256 en hex, para que toda la cadena sea homogénea.

-- ---------------------------------------------------------------------------
-- Trigger de auditoría, ahora encadenado. Reemplaza al de 0003.
-- ---------------------------------------------------------------------------
create or replace function private.write_audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_org    uuid;
  v_actor  uuid := (select auth.uid());
  v_new    jsonb := case when tg_op = 'DELETE' then null else to_jsonb(new) end;
  v_old    jsonb := case when tg_op = 'INSERT' then null else to_jsonb(old) end;
  v_diff   jsonb := '{}'::jsonb;
  v_row    text;
  v_action text := lower(tg_op);
  v_at     timestamptz := now();
  v_prev   text;
  v_hash   text;
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

  v_row := (coalesce((case when tg_op = 'DELETE' then old else new end).id))::text;

  -- Serializa los appends por organización: sin esto, dos escrituras concurrentes
  -- podrían leer el mismo prev_hash y bifurcar la cadena.
  perform pg_advisory_xact_lock(hashtextextended(v_org::text, 0));

  -- Último eslabón de la cadena de esta organización (o génesis si es el primero).
  select a.row_hash into v_prev
  from public.audit_log a
  where a.organization_id = v_org
  order by a.id desc
  limit 1;
  v_prev := coalesce(v_prev, repeat('0', 64));

  v_hash := private.audit_hash(
    v_prev, v_org, v_actor, tg_table_name, v_row, v_action,
    v_old, v_new, case when tg_op = 'UPDATE' then v_diff else null end, v_at
  );

  insert into public.audit_log (
    organization_id, actor_id, table_name, row_id, action,
    old_data, new_data, diff, at, prev_hash, row_hash
  )
  values (
    v_org, v_actor, tg_table_name, v_row, v_action::public.audit_action,
    v_old, v_new, case when tg_op = 'UPDATE' then v_diff else null end,
    v_at, v_prev, v_hash
  );

  return coalesce(new, old);
end $$;

-- ---------------------------------------------------------------------------
-- Backfill de la cadena para las filas históricas. El trigger de inmutabilidad
-- bloquea UPDATE sobre audit_log, así que se desactiva solo durante el backfill.
-- ---------------------------------------------------------------------------
alter table public.audit_log disable trigger audit_no_update;

do $$
declare
  r    record;
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

-- ---------------------------------------------------------------------------
-- Verificación de la cadena de una organización. Recalcula cada eslabón en orden
-- y compara con lo almacenado. Devuelve el total, si está íntegra, y el id del
-- primer evento donde se rompe (null si todo cuadra). Guardada por pertenencia.
-- ---------------------------------------------------------------------------
create or replace function public.verify_audit_chain(org uuid)
returns table (
  total      bigint,
  ok         boolean,
  broken_id  bigint,
  checked_at timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
declare
  r       record;
  v_prev  text := repeat('0', 64);
  v_calc  text;
  v_total bigint := 0;
  v_broken bigint := null;
begin
  if org not in (select private.user_orgs()) then
    raise exception 'no autorizado';
  end if;

  for r in
    select * from public.audit_log a
    where a.organization_id = org
    order by a.id asc
  loop
    v_total := v_total + 1;
    v_calc := private.audit_hash(
      v_prev, r.organization_id, r.actor_id, r.table_name, r.row_id,
      r.action::text, r.old_data, r.new_data, r.diff, r.at
    );
    if r.prev_hash is distinct from v_prev or r.row_hash is distinct from v_calc then
      v_broken := r.id;
      exit;
    end if;
    v_prev := r.row_hash;
  end loop;

  return query select v_total, (v_broken is null), v_broken, now();
end $$;

revoke all on function public.verify_audit_chain(uuid) from anon;
grant execute on function public.verify_audit_chain(uuid) to authenticated;
