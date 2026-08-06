"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import { uuid } from "./form";
import { logIncident } from "@/lib/observability/log";
import { trackServer } from "@/lib/telemetry/server";
import { MAX_FILE_BYTES, sha256Hex, validateUpload } from "@/lib/vault/files";

/**
 * Subida y borrado de evidencia.
 *
 * EL HASH SE CALCULA AQUÍ, EN EL SERVIDOR, sobre los bytes que de verdad se van a
 * guardar. Es la decisión que sostiene todo el vault: si el hash lo aportara el
 * navegador, quien quisiera falsear evidencia mandaría el hash del documento
 * bueno junto al contenido malo, y el paquete firmado daría fe de una
 * correspondencia falsa. Un hash que no calculas tú no es un control, es un
 * campo de texto.
 *
 * EL NOMBRE DEL ARCHIVO NO ENTRA EN LA RUTA DE ALMACENAMIENTO. La ruta es
 * `<organization_id>/<uuid>` y punto: el nombre original viaja en una columna. Un
 * nombre controlado por el usuario dentro de una ruta es una vía de escape, y
 * aquí además la primera carpeta de la ruta es lo que la policy del bucket
 * compara para aislar organizaciones — dejar que el usuario influya en ella sería
 * dejarle influir en el aislamiento.
 *
 * EL ORDEN ES: subir el archivo primero, registrar la fila después. Al revés, un
 * fallo a mitad dejaría una fila que promete un archivo que no existe, y el
 * paquete de auditoría se generaría con un hueco. Así, lo peor que puede quedar
 * es un objeto huérfano en el bucket, que no engaña a nadie y lo barre la purga.
 */

export async function uploadEvidence(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/gap?toast=demo");

  /*
    El formulario manda un solo campo `anchor` con prefijo (`gap:` / `sys:`) para
    no obligar al usuario a entender el modelo de datos antes de subir un PDF.
    El prefijo se resuelve aquí y el uuid se valida igual que cualquier otro: el
    valor viene del cliente y podría traer cualquier cosa.
  */
  const anchor = String(formData.get("anchor") ?? "");
  const gapItemId = anchor.startsWith("gap:") ? uuid(anchor.slice(4)) : null;
  const aiSystemId = anchor.startsWith("sys:") ? uuid(anchor.slice(4)) : null;
  const back = String(formData.get("back") ?? "/dashboard/gap").slice(0, 200);

  const file = formData.get("file");
  if (!(file instanceof File)) redirect(`${back}?toast=vault-empty`);

  const rejection = validateUpload(file.size, { gapItemId, aiSystemId });
  if (rejection) {
    redirect(`${back}?toast=${rejection === "too-large" ? "vault-large" : "vault-empty"}`);
  }

  const org = await getActiveOrg();
  if (!org) redirect("/dashboard");

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Se vuelve a comprobar sobre los bytes REALES: `file.size` lo dice el cliente.
  if (bytes.length === 0 || bytes.length > MAX_FILE_BYTES) {
    redirect(`${back}?toast=vault-large`);
  }

  const sha256 = await sha256Hex(bytes);
  const storagePath = `${org}/${crypto.randomUUID()}`;

  const supabase = await createClient();

  const up = await supabase.storage.from("evidence").upload(storagePath, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (up.error) {
    logIncident("uploadEvidence.storage", up.error);
    redirect(`${back}?toast=vault-error`);
  }

  const { error } = await supabase.from("evidence_files").insert({
    organization_id: org,
    gap_item_id: gapItemId,
    ai_system_id: aiSystemId,
    filename: file.name.slice(0, 200) || "archivo",
    mime: (file.type || null)?.slice(0, 120) ?? null,
    size_bytes: bytes.length,
    sha256,
    storage_path: storagePath,
  });

  if (error) {
    // La fila no entró: el objeto que acabamos de subir sobra. Se intenta quitar
    // para no dejar basura, pero si tampoco se puede, el registro lo dice y la
    // purga de la organización lo barrerá igual.
    logIncident("uploadEvidence.insert", error);
    const cleanup = await supabase.storage.from("evidence").remove([storagePath]);
    if (cleanup.error) logIncident("uploadEvidence.cleanup", cleanup.error);
    redirect(`${back}?toast=vault-error`);
  }

  await trackServer("evidence_uploaded", { props: { bytes: bytes.length } });
  revalidatePath("/dashboard", "layout");
  redirect(`${back}?toast=vault-uploaded`);
}

/**
 * Borra un archivo. Solo propietario/administrador, comprobado por la policy de
 * la 0038 — aquí no se duplica el guard, se confía en la barrera que no se puede
 * esquivar.
 *
 * Se borra la FILA primero y el objeto después: si se hiciera al revés y fallara
 * el borrado de la fila, quedaría un registro apuntando a un archivo inexistente
 * y el paquete saldría con un hueco silencioso.
 */
export async function deleteEvidence(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/gap?toast=demo");

  const id = uuid(formData.get("id"));
  const back = String(formData.get("back") ?? "/dashboard/gap").slice(0, 200);
  if (!id) redirect(back);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evidence_files")
    .delete()
    .eq("id", id)
    .select("storage_path");

  if (error) {
    logIncident("deleteEvidence", error);
    redirect(`${back}?toast=vault-error`);
  }
  // Sin filas devueltas, la RLS lo impidió: no es propietario ni administrador.
  if (!data || data.length === 0) redirect(`${back}?toast=vault-forbidden`);

  const path = (data[0] as { storage_path?: string }).storage_path;
  if (path) {
    const rm = await supabase.storage.from("evidence").remove([path]);
    if (rm.error) logIncident("deleteEvidence.storage", rm.error);
  }

  revalidatePath("/dashboard", "layout");
  redirect(`${back}?toast=vault-deleted`);
}
