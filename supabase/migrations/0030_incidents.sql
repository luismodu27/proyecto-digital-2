-- 0030_incidents.sql
-- Registro de incidentes del deployer + cadencia de revisión de la autoevaluación.
--
-- POR QUÉ EXISTE: los packs ya llevan controles que citan el Art. 26.5 ("vigila
-- el funcionamiento… suspende el uso e informa al proveedor… notifica los
-- incidentes graves"), pero no había NINGÚN sitio donde registrar un incidente
-- real. Un control sin expediente es una casilla, no evidencia.
--
-- LAS TRES REGLAS QUE ESTE ESQUEMA EXISTE PARA NO EQUIVOCAR (las tres son
-- contraintuitivas y las tres tienen test en `src/lib/incidents/`):
--
--  1. El Art. 26.5 NO contiene ningún plazo numérico ("sin demora injustificada",
--     "inmediatamente"). Los 15 / 10 / 2 días son del Art. 73 y son DEL
--     PROVEEDOR. Por eso aquí no hay ninguna columna de "fecha límite": se
--     derivan de `aware_on`, y de quién sea el plazo depende de
--     `provider_unreachable`.
--
--  2. `aware_on` es la columna de más valor probatorio de toda la tabla. El
--     Art. 73 cuenta sus plazos "desde que el proveedor O, EN SU CASO, el
--     responsable del despliegue tenga conocimiento": la fecha del cliente
--     arranca un reloj que corre para otro. Es `not null` a propósito.
--
--  3. `use_suspended` acompaña a `risk_art79`, no a `seriousness`. El mandato
--     "suspenderán el uso" está en la frase del riesgo del Art. 79.1, no en la
--     del incidente grave.
--
-- ENCUADRE TEMPORAL: el Art. 26 es exigible para el alto riesgo del Anexo III
-- desde el 2-dic-2027 (Reglamento (UE) 2026/1744). Registrar incidentes hoy es
-- PREPARACIÓN, no una obligación vencida.
--
-- ADITIVO y seguro: si esta migración no está aplicada, la fachada de datos
-- devuelve lista vacía, lo registra como `migration-pending` y la app funciona
-- igual. Nada de lo que ya existe cambia de comportamiento.
--
-- Nota de operación: `create policy` no admite `if not exists`, así que cada una
-- va precedida de `drop policy if exists` para que re-pegar el fichero funcione.

-- ---------------------------------------------------------------------------
-- Expediente de incidente
-- ---------------------------------------------------------------------------
create table if not exists public.incidents (
  id                        uuid primary key default gen_random_uuid(),
  organization_id           uuid not null references public.organizations (id) on delete cascade,
  -- `set null` y no `cascade`: si se da de baja el sistema, el expediente del
  -- incidente SOBREVIVE. Borrar la evidencia al retirar la herramienta es justo
  -- lo contrario de lo que hace un system-of-record.
  ai_system_id              uuid references public.ai_systems (id) on delete set null,
  title                     text not null,
  detail                    text,

  -- Tres fechas distintas, y las tres importan. La definición del Art. 3.49
  -- admite causalidad directa O INDIRECTA, así que el nexo causal se establece
  -- (o no) en un momento propio, distinto del hecho y del conocimiento.
  occurred_on               date,
  aware_on                  date not null default current_date,
  causal_link_on            date,

  -- Categorías del Art. 3, punto 49. Son CINCO y no cuatro: la letra (a) se
  -- parte en muerte / daño grave a la salud porque el Art. 73 les da plazos
  -- distintos (10 vs 15 días), y lo que el registro necesita distinguir es el
  -- plazo, no la letra.
  categories                text[] not null default '{}',

  -- `under_assessment` no es un adorno: al abrir la ficha casi nadie sabe aún si
  -- el evento es "grave" en sentido del Art. 3.49. Obligar a decidirlo entonces
  -- produce o registros falsos o ningún registro.
  seriousness               text not null default 'under_assessment'
    check (seriousness in ('under_assessment', 'serious', 'not_serious')),

  -- ¿Hay motivos para considerar que el uso CONFORME A LAS INSTRUCCIONES puede
  -- hacer que el sistema presente un riesgo del Art. 79.1 (salud, seguridad o
  -- derechos fundamentales)? Ojo: no hace falta mal uso.
  risk_art79                boolean not null default false,
  use_suspended             boolean not null default false,

  -- La casilla que decide si Attesta puede enseñar una cuenta atrás legal al
  -- deployer: solo cuando no se ha podido contactar con el proveedor, el
  -- Art. 26.5 remite al Art. 73 "mutatis mutandis".
  provider_unreachable      boolean not null default false,

  -- Notificación DECLARADA por la organización. Attesta no transmite nada a
  -- ninguna autoridad; esto es el registro de lo que el cliente dice haber hecho.
  notified_provider_on      date,
  notified_distributor_on   date,
  notified_authority_on     date,

  -- Bandera INDEPENDIENTE. Un incidente grave del AI Act no es una violación de
  -- datos personales, ni al revés: pueden coincidir, pero los disparadores, los
  -- destinatarios y los plazos son distintos (72 h del RGPD 33 frente al
  -- "inmediatamente" del 26.5) y corren en paralelo.
  personal_data_breach      boolean not null default false,

  status                    text not null default 'open'
    check (status in ('open', 'closed')),
  created_by                uuid references auth.users (id),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- El contenido del array sí se acota (un enum suelto en un text[] se degrada en
-- semanas). `<@` exige que TODO elemento esté en el catálogo; el array vacío lo
-- cumple, que es justo lo que queremos mientras el incidente está en evaluación.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'incidents_categories_check'
  ) then
    alter table public.incidents
      add constraint incidents_categories_check
      check (categories <@ array[
        'death',
        'serious_health_harm',
        'critical_infrastructure',
        'fundamental_rights',
        'property_or_environment'
      ]::text[]);
  end if;
end $$;

create index if not exists incidents_org_idx
  on public.incidents (organization_id, status, aware_on desc);

alter table public.incidents enable row level security;

-- Colaborativo, como el plan de acción: cualquier miembro de la organización
-- registra y actualiza incidentes. Quien detecta un incidente rara vez es quien
-- tiene rol de admin, y un registro que exige permisos se rellena tarde o no se
-- rellena.
drop policy if exists incidents_select on public.incidents;
create policy incidents_select on public.incidents
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

drop policy if exists incidents_write on public.incidents;
create policy incidents_write on public.incidents
  for all to authenticated
  using (organization_id in (select private.user_orgs()))
  with check (organization_id in (select private.user_orgs()));

-- Se audita como el resto (aparece en el registro de actividad encadenado).
drop trigger if exists audit_incidents on public.incidents;
create trigger audit_incidents
  after insert or update or delete on public.incidents
  for each row execute function private.write_audit();

drop trigger if exists set_incidents_updated_at on public.incidents;
create trigger set_incidents_updated_at
  before update on public.incidents
  for each row execute function public.set_updated_at();

comment on table public.incidents is
  'Registro de incidentes del deployer (Art. 26.5). Notificaciones DECLARADAS por la organización: Attesta no transmite nada a ninguna autoridad.';
comment on column public.incidents.aware_on is
  'Fecha de conocimiento. Arranca los plazos del Art. 73, que son DEL PROVEEDOR salvo que provider_unreachable sea true.';
comment on column public.incidents.risk_art79 is
  'Motivos para considerar un riesgo del Art. 79.1. Esta es la rama que obliga a suspender el uso, no la del incidente grave.';

-- ---------------------------------------------------------------------------
-- Cadencia de revisión de la autoevaluación
-- ---------------------------------------------------------------------------
-- IMPORTANTE: el Reglamento NO fija periodicidad de revisión para el deployer.
-- El Art. 26.5 es un deber continuo sin cadencia y el Art. 27.2 dispara por
-- CAMBIO, no por calendario. Esta columna es una red de seguridad de BUENA
-- PRÁCTICA que la organización elige; la UI la etiqueta como tal y hay un test
-- que rompe si alguien reescribe ese copy como "obligatorio".
--
-- `null` = usa el defecto del producto (12 meses). Se acotan los valores porque
-- una cadencia de 0 o negativa marcaría el inventario entero como vencido.
alter table public.organizations
  add column if not exists review_cadence_days integer;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_review_cadence_check'
  ) then
    alter table public.organizations
      add constraint organizations_review_cadence_check
      check (review_cadence_days is null or review_cadence_days in (180, 365, 730));
  end if;
end $$;

comment on column public.organizations.review_cadence_days is
  'Cadencia de revisión de la autoevaluación en días (180/365/730). null = 12 meses. BUENA PRÁCTICA: el Reglamento no fija periodicidad.';
