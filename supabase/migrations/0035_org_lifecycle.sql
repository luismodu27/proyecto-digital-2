-- 0035_org_lifecycle.sql
-- Baja de una organización: solicitud, periodo de gracia y purga completa.
--
-- EL FALLO QUE ARREGLA, comprobado en un Postgres desechable antes de escribir
-- una línea de esto. La hipótesis era que el trigger de inmutabilidad del
-- `audit_log` impediría borrar una organización. Era falso, y la realidad es
-- peor: `audit_log.organization_id` NO tiene clave ajena a `organizations`, así
-- que un `delete from organizations` funciona sin protestar y deja las filas de
-- auditoría **huérfanas** — incluidos los `old_data`/`new_data`, que llevan el
-- contenido real de cada cambio. Es decir: hoy la supresión parece completa y no
-- lo es. Eso convierte en falso el plazo de 30 días del aviso de privacidad y del
-- DPA, que es exactamente la clase de afirmación que no puede quedarse sin
-- producto detrás.
--
-- POR QUÉ NO SE AÑADE, SIN MÁS, UN `on delete cascade` al `audit_log`: porque
-- entonces el trigger `audit_no_delete` haría fallar el borrado en cascada, y
-- porque un `cascade` silencioso sobre el registro inmutable es justo lo que no
-- se quiere. La purga tiene que ser un acto explícito, autorizado y trazable.
--
-- POR QUÉ HAY PERIODO DE GRACIA Y NO BORRADO INMEDIATO. Attesta se vende como
-- system-of-record de evidencia. Que una sola sesión de propietario comprometida
-- destruya el expediente entero sin vuelta atrás sería un diseño malo para
-- cualquier producto y absurdo para este. Con la solicitud, el propietario ve un
-- aviso permanente y puede cancelar con un clic; sin ella, el atacante gana en
-- silencio.
--
-- POR QUÉ 7 DÍAS Y NO 30. El DPA promete la supresión «en un plazo máximo de 30
-- días». Si la gracia fuera de 30, la purga ocurriría justo en el límite y
-- cualquier retraso del cron incumpliría lo prometido. Con 7 queda margen de
-- sobra y la promesa se cumple con holgura, que es como deben escribirse los
-- plazos que uno mismo firma.
--
-- ADITIVO: sin aplicar, la app funciona igual (las nuevas RPC no existen y la
-- fachada degrada con `logDataFallback`).

-- ---------- 1. Marcas de solicitud de baja ----------

alter table public.organizations
  add column if not exists deletion_requested_at timestamptz,
  add column if not exists deletion_requested_by uuid references auth.users (id) on delete set null;

comment on column public.organizations.deletion_requested_at is
  'Momento en que un propietario solicitó la baja. La purga ocurre pasados 7 días; hasta entonces se puede cancelar.';

-- Lo que consulta el cron: pocas filas, pero evita recorrer toda la tabla.
create index if not exists organizations_deletion_due_idx
  on public.organizations (deletion_requested_at)
  where deletion_requested_at is not null;

-- ---------- 2. Excepción ÚNICA a la inmutabilidad del audit_log ----------

/**
 * El `audit_log` sigue siendo inmutable para todo el mundo y para siempre, con
 * una sola excepción: la purga de una organización concreta.
 *
 * CÓMO SE ACOTA, que es lo delicado: la excepción no es "puede borrar quien sea
 * `security definer`", sino "puede borrarse una fila SI Y SOLO SI su
 * `organization_id` coincide con el que la transacción en curso declaró estar
 * purgando". La marca es un ajuste **local a la transacción** (`set_config(...,
 * true)`) que solo pone `purge_organization`, y va con el identificador dentro:
 * ni siquiera con la marca puesta se puede tocar la auditoría de OTRA
 * organización. Un cliente no puede ponerla —PostgREST solo llama funciones de
 * los esquemas expuestos, y `set_config` está en `pg_catalog`— pero el diseño no
 * depende de eso: depende de la comparación por fila.
 */
create or replace function private.block_mutation()
returns trigger language plpgsql as $$
declare
  v_purging text;
begin
  if tg_op = 'DELETE' then
    v_purging := current_setting('attesta.purging_org', true);
    if v_purging is not null
       and v_purging <> ''
       and old.organization_id is not null
       and old.organization_id::text = v_purging then
      return old;
    end if;
  end if;
  raise exception 'audit_log es inmutable: no se permite % ', tg_op;
end $$;

-- ---------- 3. Solicitar la baja (propietario) ----------

/**
 * Marca la organización para su baja. Devuelve la fecha en que se purgará.
 *
 * Pide el NOMBRE de la organización como confirmación. No es teatro: es la única
 * defensa barata contra el clic equivocado en la pantalla que destruye el
 * expediente entero, y obliga a leer qué organización se está dando de baja
 * cuando se pertenece a varias.
 */
create or replace function public.request_org_deletion(
  p_org     uuid,
  p_confirm text
)
returns timestamptz
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := (select auth.uid());
  v_name text;
begin
  if v_uid is null or p_org is null then
    raise exception 'no autorizado';
  end if;

  -- Solo propietario. Un administrador puede gestionar la organización, no
  -- disolverla.
  if not exists (
    select 1 from public.memberships m
    where m.organization_id = p_org
      and m.user_id = v_uid
      and m.role = 'owner'::public.member_role
  ) then
    raise exception 'no autorizado';
  end if;

  select o.name into v_name from public.organizations o where o.id = p_org;
  if v_name is null then
    raise exception 'no autorizado';
  end if;

  if p_confirm is null or lower(trim(p_confirm)) <> lower(trim(v_name)) then
    raise exception 'el nombre de confirmación no coincide';
  end if;

  update public.organizations
  set deletion_requested_at = now(),
      deletion_requested_by = v_uid
  where id = p_org
    and deletion_requested_at is null;  -- idempotente: no reinicia el plazo

  return (
    select o.deletion_requested_at + interval '7 days'
    from public.organizations o where o.id = p_org
  );
end $$;

revoke all on function public.request_org_deletion(uuid, text) from public, anon;
grant execute on function public.request_org_deletion(uuid, text) to authenticated;

-- ---------- 4. Cancelar la baja (propietario) ----------

create or replace function public.cancel_org_deletion(p_org uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null or p_org is null then
    raise exception 'no autorizado';
  end if;

  if not exists (
    select 1 from public.memberships m
    where m.organization_id = p_org
      and m.user_id = v_uid
      and m.role = 'owner'::public.member_role
  ) then
    raise exception 'no autorizado';
  end if;

  update public.organizations
  set deletion_requested_at = null,
      deletion_requested_by = null
  where id = p_org;

  return true;
end $$;

revoke all on function public.cancel_org_deletion(uuid) from public, anon;
grant execute on function public.cancel_org_deletion(uuid) to authenticated;

-- ---------- 5. Purga (solo el cron / service_role) ----------

/**
 * Borra de verdad una organización y TODO lo suyo, auditoría incluida.
 *
 * No la puede llamar `authenticated` a propósito: si el propietario pudiera
 * purgar en el acto, el periodo de gracia no existiría. La ejecuta el cron
 * cuando el plazo ha vencido.
 *
 * EL ORDEN ES AL REVÉS DE LO QUE PARECE, y esto se descubrió probándolo, no
 * razonándolo. La versión intuitiva —borrar la auditoría y luego la
 * organización— deja la auditoría **repoblada**: el `on delete cascade` sobre
 * `ai_systems`, `memberships` y compañía dispara sus triggers `write_audit`, que
 * insertan una fila nueva por cada borrado. En la primera prueba la purga
 * informó de 2 filas eliminadas y la organización volvió a tener 2. Así que
 * primero se borra la organización, se deja que la cascada haga su ruido, y
 * después se barre la auditoría, que a esas alturas ya está completa.
 */
create or replace function public.purge_organization(p_org uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_audit integer;
begin
  if p_org is null then
    return 0;
  end if;

  -- `true` = solo durante esta transacción. Lleva el identificador dentro, así
  -- que la excepción de inmutabilidad no se extiende a ninguna otra organización.
  perform set_config('attesta.purging_org', p_org::text, true);

  -- 1. La organización. La cascada arrastra el resto de tablas y, de paso,
  --    dispara los `write_audit` que dejan la auditoría en su estado final.
  --    La telemetría la referencia con `on delete set null`: los eventos son
  --    agregados y sin PII, y su recuento no debe falsearse al dar de baja a
  --    alguien. Lo que se va es el vínculo, que es lo identificable.
  delete from public.organizations where id = p_org;

  -- 2. Y ahora sí, la auditoría entera — incluida la que acaba de escribir la
  --    cascada. Sin FK a `organizations`, estas filas sobrevivirían solas.
  delete from public.audit_log where organization_id = p_org;
  get diagnostics v_audit = row_count;

  return v_audit;
end $$;

-- OJO: `revoke ... from public` NO BASTA en Supabase. Además del EXECUTE que
-- PostgreSQL concede a PUBLIC, Supabase tiene `alter default privileges in
-- schema public grant all on routines to anon, authenticated, service_role`, así
-- que cada función NUEVA nace con un grant DIRECTO a esos tres roles, que
-- sobrevive a revocárselo a PUBLIC. Se comprobó en el Postgres desechable
-- (que sí replica esos default privileges): tras `revoke ... from public`,
-- `has_function_privilege('authenticated', ...)` seguía dando `t`. Aquí eso no
-- es un detalle: si un propietario pudiera llamar a `purge_organization`, el
-- periodo de gracia entero sería decorativo. Hay que nombrarlos.
revoke all on function public.purge_organization(uuid) from public, anon, authenticated;
grant execute on function public.purge_organization(uuid) to service_role;

/**
 * Purga todas las que hayan cumplido el plazo. Es lo que llama el cron.
 * Devuelve cuántas organizaciones se purgaron.
 */
create or replace function public.purge_due_organizations()
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_org   uuid;
  v_count integer := 0;
begin
  for v_org in
    select o.id from public.organizations o
    where o.deletion_requested_at is not null
      and o.deletion_requested_at < now() - interval '7 days'
  loop
    perform public.purge_organization(v_org);
    v_count := v_count + 1;
  end loop;
  return v_count;
end $$;

revoke all on function public.purge_due_organizations() from public, anon, authenticated;
grant execute on function public.purge_due_organizations() to service_role;

comment on function public.purge_organization(uuid) is
  'Borra una organización y todo lo suyo, auditoría incluida. Solo service_role: si el propietario pudiera llamarla, el periodo de gracia no existiría.';
