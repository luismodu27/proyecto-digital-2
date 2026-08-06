-- 0038_evidence_vault.sql
-- Vault de evidencia: archivos reales adjuntos a los controles.
--
-- EL AGUJERO QUE CIERRA, y por qué es el mayor salto de defensibilidad del
-- producto. Hoy cada control se marca «hecho» y no hay nada detrás: el «% listo»
-- mide DECLARACIONES. Ante un auditor eso se cae en la primera pregunta —
-- «enséñame el documento». Sin el archivo real, el porcentaje es una opinión bien
-- presentada.
--
-- QUÉ NO CAMBIA, para que quede claro: seguir sin certificar nada. El vault
-- guarda y demuestra CUSTODIA E INTEGRIDAD («este archivo, con este hash, estaba
-- aquí en esta fecha»), nunca suficiencia ni conformidad. Attesta no abre los
-- archivos ni los valora.
--
-- EL HASH SE CALCULA EN EL SERVIDOR AL SUBIR, no en el navegador. Un hash que
-- aporta el cliente no prueba nada: quien quiera falsear evidencia mandaría el
-- hash del documento bueno con el contenido malo. Es la diferencia entre un
-- control y un adorno.
--
-- LA RUTA DE ALMACENAMIENTO EMPIEZA POR EL organization_id a propósito: es lo que
-- permite que la policy del bucket compare la primera carpeta con las
-- organizaciones del usuario. El aislamiento entre clientes de los ARCHIVOS
-- descansa en esa convención, así que la ruta no es un detalle de nomenclatura.
--
-- ADITIVO: sin aplicar, la fachada degrada (`logDataFallback`) y la app funciona
-- igual, sin sección de archivos.

-- ---------- 1. Registro de archivos ----------

create table if not exists public.evidence_files (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,

  -- A qué se adjunta. Ambos opcionales: un archivo puede colgar de una brecha
  -- concreta (lo normal) o del sistema entero (política general).
  gap_item_id     uuid references public.gap_items (id) on delete cascade,
  ai_system_id    uuid references public.ai_systems (id) on delete cascade,

  -- Nombre ORIGINAL, para que el auditor reconozca el documento. No se usa para
  -- construir la ruta de almacenamiento: ahí manda un uuid, porque un nombre de
  -- fichero controlado por el usuario dentro de una ruta es una vía de escape.
  filename        text not null check (char_length(filename) between 1 and 200),
  mime            text check (char_length(mime) <= 120),
  size_bytes      bigint not null check (size_bytes > 0 and size_bytes <= 26214400),

  -- SHA-256 en hexadecimal minúscula. El CHECK impide que entre cualquier cosa:
  -- un hash con formato libre convierte la verificación en un adorno.
  sha256          text not null check (sha256 ~ '^[0-9a-f]{64}$'),

  -- Ruta dentro del bucket. Única: dos filas apuntando al mismo objeto harían
  -- que borrar una dejara la otra colgando de un archivo inexistente.
  storage_path    text not null unique check (char_length(storage_path) <= 400),

  uploaded_by     uuid references auth.users (id) on delete set null,
  uploaded_at     timestamptz not null default now(),

  -- Al menos un anclaje: un archivo suelto en el vault no lo encontraría nadie.
  constraint evidence_files_anchored
    check (gap_item_id is not null or ai_system_id is not null)
);

create index if not exists evidence_files_org_idx
  on public.evidence_files (organization_id, uploaded_at desc);
create index if not exists evidence_files_gap_idx
  on public.evidence_files (gap_item_id);
create index if not exists evidence_files_system_idx
  on public.evidence_files (ai_system_id);

alter table public.evidence_files enable row level security;

drop policy if exists evidence_files_select on public.evidence_files;
create policy evidence_files_select on public.evidence_files
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

drop policy if exists evidence_files_insert on public.evidence_files;
create policy evidence_files_insert on public.evidence_files
  for insert to authenticated
  with check (organization_id in (select private.user_orgs()));

-- Borrar sí, editar NO. Cambiar el `sha256` o el `filename` de una fila existente
-- sería justo la manipulación contra la que existe todo esto: se borra y se sube
-- de nuevo, y el registro de auditoría lo refleja como lo que es.
drop policy if exists evidence_files_delete on public.evidence_files;
create policy evidence_files_delete on public.evidence_files
  for delete to authenticated
  using (private.user_has_role(organization_id, array['owner','admin']::public.member_role[]));

-- Entra en el registro de auditoría como cualquier otra tabla de negocio.
drop trigger if exists audit_evidence_files on public.evidence_files;
create trigger audit_evidence_files
  after insert or update or delete on public.evidence_files
  for each row execute function private.write_audit();

comment on table public.evidence_files is
  'Archivos de evidencia. El hash se calcula en el servidor al subir: un hash aportado por el cliente no probaría nada.';

-- ---------- 2. Bucket privado ----------

insert into storage.buckets (id, name, public, file_size_limit)
values ('evidence', 'evidence', false, 26214400)
on conflict (id) do update set public = false, file_size_limit = 26214400;

-- ---------- 3. Aislamiento de los ARCHIVOS ----------
--
-- Va al final a propósito: en algunos proyectos `storage.objects` pertenece a un
-- rol distinto y crear policies sobre ella puede requerir permisos que el SQL
-- Editor no siempre tiene. Si esta parte fallara, todo lo anterior ya está
-- aplicado y solo habría que resolver este bloque — en vez de perder la
-- migración entera.
--
-- La comparación se hace en TEXTO y no casteando a uuid: si alguien deja en el
-- bucket un objeto cuya primera carpeta no es un uuid, el cast reventaría la
-- policy y con ella el acceso de todo el mundo.

drop policy if exists evidence_objects_select on storage.objects;
create policy evidence_objects_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] in (
      select o::text from private.user_orgs() o
    )
  );

drop policy if exists evidence_objects_insert on storage.objects;
create policy evidence_objects_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] in (
      select o::text from private.user_orgs() o
    )
  );

drop policy if exists evidence_objects_delete on storage.objects;
create policy evidence_objects_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] in (
      select o::text from private.user_orgs() o
    )
  );

-- No hay policy de UPDATE: sobrescribir un objeto dejaría el `sha256` de la fila
-- apuntando a un contenido que ya no es ese. Reemplazar = borrar y subir.
