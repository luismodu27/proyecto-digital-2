/**
 * Tipos y reglas del vault que no dependen de Supabase (lógica pura, con tests).
 */

/** Tope por archivo. Debe coincidir con el CHECK de la migración 0038. */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

/** Tope del paquete de auditoría completo, para no reventar la memoria del servidor. */
export const MAX_PACKAGE_BYTES = 100 * 1024 * 1024;

export type EvidenceFile = {
  id: string;
  filename: string;
  mime: string | null;
  bytes: number;
  sha256: string;
  uploadedAt: string;
  /** A qué cuelga, ya resuelto a texto legible para el manifiesto y la UI. */
  attachedTo: string;
  gapItemId: string | null;
  aiSystemId: string | null;
  storagePath: string;
};

/**
 * Nombre saneado para el ZIP y para mostrar.
 *
 * NO se usa para construir la ruta de almacenamiento —ahí manda un uuid— pero sí
 * viaja dentro del paquete, así que tiene que ser inofensivo: sin separadores de
 * ruta y sin `..`, o un ZIP malicioso podría escribir fuera de la carpeta al
 * extraerse (el clásico «zip slip»). Es evidencia que sube un usuario y que abre
 * un auditor en su máquina: exactamente el trayecto donde eso importa.
 */
export function safeFilename(raw: string): string {
  const base = raw
    .replace(/[\\/]+/g, "_") // separadores de ruta, de los dos mundos
    .replace(/\.{2,}/g, ".") // secuencias de puntos: adiós al `..`
    // Caracteres de control, con escapes EXPLÍCITOS. La primera versión los puso
    // literales en el fichero y el rango acabó siendo otra cosa completamente:
    // una clase de caracteres mal escrita no se ve leyendo, se ve probando.
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/^[.\s]+/, "") // no empezar por punto ni espacio
    .trim();

  const limpio = base.slice(0, 120);
  // Un nombre que se queda sin una sola letra o cifra (`"///"` → `"_"`) no le
  // sirve a quien abra el paquete. Mejor un genérico honesto que un guion suelto.
  return /[\p{L}\p{N}]/u.test(limpio) ? limpio : "archivo";
}


/**
 * Ruta dentro del ZIP, única por archivo.
 *
 * Lleva el id delante porque dos documentos pueden llamarse igual («política.pdf»
 * en dos sistemas distintos) y un ZIP con rutas repetidas es ambiguo — el
 * escritor de `zip.ts` lo rechaza, así que aquí hay que garantizar unicidad.
 */
export function packagePath(file: EvidenceFile): string {
  return `evidencia/${file.id.slice(0, 8)}-${safeFilename(file.filename)}`;
}

/** SHA-256 en hexadecimal minúscula, el formato que exige el CHECK de la 0038. */
export async function sha256Hex(bytes: ArrayBuffer | Uint8Array): Promise<string> {
  const source = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  // `slice()` normaliza a un ArrayBuffer propio: una vista sobre un búfer mayor
  // haría que se hashease de más.
  const digest = await crypto.subtle.digest("SHA-256", source.slice().buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type UploadRejection = "empty" | "too-large" | "no-anchor";

/** Valida lo que se puede validar antes de tocar la red. */
export function validateUpload(
  size: number,
  anchor: { gapItemId?: string | null; aiSystemId?: string | null },
): UploadRejection | null {
  if (!Number.isFinite(size) || size <= 0) return "empty";
  if (size > MAX_FILE_BYTES) return "too-large";
  if (!anchor.gapItemId && !anchor.aiSystemId) return "no-anchor";
  return null;
}

/**
 * Decide qué entra en el paquete cuando no cabe todo.
 *
 * Se ordena por fecha de subida (lo más reciente primero) y se corta al llegar al
 * tope, DEVOLVIENDO cuántos quedaron fuera. La regla de la casa: ningún corte en
 * silencio — quien recibe un paquete truncado tiene que verlo en el manifiesto,
 * porque si no cree que lo tiene todo.
 */
export function selectForPackage(
  files: readonly EvidenceFile[],
  maxBytes = MAX_PACKAGE_BYTES,
): { included: EvidenceFile[]; omitted: number } {
  const ordenados = [...files].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  const included: EvidenceFile[] = [];
  let total = 0;
  for (const f of ordenados) {
    if (total + f.bytes > maxBytes) continue;
    included.push(f);
    total += f.bytes;
  }
  return { included, omitted: files.length - included.length };
}
