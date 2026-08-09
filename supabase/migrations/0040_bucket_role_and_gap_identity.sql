-- 0040_bucket_role_and_gap_identity.sql
-- Dos arreglos independientes y aditivos. Ninguno reescribe datos existentes.
--
-- ============================================================================
-- (1) H12 — borrar el OBJETO de evidencia también exige owner/admin
-- ============================================================================
--
-- La 0038 protegió bien la FILA `evidence_files`: su policy de DELETE exige rol
-- (`user_has_role(org, {owner,admin})`). Pero la policy de DELETE del OBJETO en
-- `storage.objects` solo comprobaba PERTENENCIA a la organización, no el rol. Es
-- una asimetría explotable: la app borra la fila primero (y la RLS frena a quien
-- no sea owner/admin), pero un `member` podía llamar a la API de storage
-- DIRECTAMENTE con su JWT y borrar el archivo real, dejando la fila apuntando a un
-- objeto inexistente —el paquete de auditoría saldría con un hueco silencioso, y
-- lo habría causado alguien sin permiso para borrar evidencia—.
--
-- Se iguala el rol en la policy del objeto. La comparación sigue siendo en TEXTO,
-- NO casteando la primera carpeta a uuid: el 0038 avisa de que un objeto cuya
-- carpeta no fuese un uuid reventaría el cast y con él la policy de todos. Para
-- eso se añade un set-returning con las orgs donde el usuario es owner/admin, y se
-- compara `foldername(name)[1]` contra sus versiones en texto, igual que las otras
-- policies del bucket.

-- Orgs donde el usuario actual es owner/admin (para comparar en texto, sin cast).
create or replace function private.user_admin_orgs()
returns setof uuid
language sql stable security definer set search_path = '' as $$
  select organization_id from public.memberships
  where user_id = (select auth.uid())
    and role = any (array['owner','admin']::public.member_role[])
$$;

revoke all on function private.user_admin_orgs() from public;
grant execute on function private.user_admin_orgs() to authenticated;

drop policy if exists evidence_objects_delete on storage.objects;
create policy evidence_objects_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] in (
      select o::text from private.user_admin_orgs() o
    )
  );

-- ============================================================================
-- (2) H1/H2 — identidad ESTABLE del control en las brechas
-- ============================================================================
--
-- Un `gap_item` que sale de un policy pack se identificaba solo por su `requirement`
-- (el título), que SE TRADUCE (0033: en EN se guarda el título EN). Deduplicar por
-- texto obligaba a resolver el título contra el catálogo en ambos idiomas, y una
-- futura edición del título de un pack rompería esa correspondencia en silencio.
--
-- Se añade la identidad estable del control (`pack_id` + `control_id`), que NO se
-- traduce. Es aditivo y opcional: las brechas manuales y las anteriores a esta
-- migración quedan con NULL, y el código sigue resolviendo esas por título. A
-- partir de aquí, `applyPolicyPack` guarda la identidad y deduplica por ella.
--
-- No se SANEAN aquí los duplicados que ya existan: mapear un `requirement` de texto
-- a su `control_id` exige el catálogo de packs, que vive en TypeScript, no en SQL.
-- Esa limpieza, si hace falta, es una tarea de aplicación, no de esquema.

alter table public.gap_items
  add column if not exists pack_id    text,
  add column if not exists control_id text;

comment on column public.gap_items.control_id is
  'Identidad ESTABLE del control del policy pack del que salió la brecha (no el título, que se traduce). Permite deduplicar por identidad, no por texto. NULL en brechas manuales o anteriores a 0040.';
comment on column public.gap_items.pack_id is
  'Id del policy pack de origen de la brecha. NULL en brechas manuales o anteriores a 0040.';
