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
 * El mismo nombre, reducido a ASCII imprimible.
 *
 * POR QUÉ EXISTE, y es una lección que costó un CI en rojo. El ZIP declara sus
 * nombres en UTF-8 correctamente (bit 11 de la cabecera), y un lector estricto
 * —Python, 7-Zip, el Finder— los lee exactos. Pero el `unzip` de Info-ZIP, que es
 * el que va a usar medio mundo desde una terminal, TRADUCE el nombre al juego de
 * caracteres del entorno al escribirlo en disco. En una máquina sin locale UTF-8
 * (un servidor, un contenedor, el runner de CI) «política.pdf» aterriza en el
 * disco como «pol├нtica.pdf».
 *
 * Y ahí está el daño, que no es cosmético: el manifiesto dice `política.pdf`, en
 * el disco hay otro nombre, y el paso 1 de las instrucciones de verificación
 * —comprobar el SHA-256 de cada ruta del manifiesto— falla sobre un paquete
 * PERFECTAMENTE legítimo. Un archivo de evidencia cuyo modo de fallar es acusar
 * de manipulación a quien no ha tocado nada no sirve para lo que existe.
 *
 * Se corrige donde se puede corregir de verdad: la ruta DENTRO del ZIP es ASCII,
 * así que todo extractor de todo sistema produce exactamente la ruta que el
 * manifiesto declara. El nombre original, con sus acentos, no se pierde: viaja
 * íntegro en el campo `filename` del manifiesto.
 *
 * Los diacríticos latinos se transliteran («política» → «politica»), que es
 * legible. Lo que no se descompone a ASCII —cirílico, griego, CJK, árabe— pasa a
 * `_`: un nombre en chino queda irreconocible dentro del ZIP y eso es una pérdida
 * real, asumida a cambio de que la comprobación del auditor nunca dé un falso
 * positivo. El nombre completo sigue en el manifiesto.
 */
export function asciiPathSegment(name: string): string {
  const plano = name
    // NFD separa la letra de su tilde; el rango de combinantes las borra. Los
    // escapes son EXPLÍCITOS por la misma razón que en `safeFilename`: escritos
    // literales, estos caracteres no se ven al leer el fichero y el rango acaba
    // siendo otra cosa.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Lo que sigue sin ser ASCII imprimible no tiene equivalente: se marca.
    .replace(/[^\x20-\x7e]/g, "_")
    // Varias sustituciones seguidas («日本語» → «___») se colapsan.
    .replace(/_{2,}/g, "_")
    .trim();

  return /[a-zA-Z0-9]/.test(plano) ? plano : "archivo";
}

/**
 * Ruta dentro del ZIP, única por archivo y en ASCII.
 *
 * Lleva el id delante porque dos documentos pueden llamarse igual («política.pdf»
 * en dos sistemas distintos) y un ZIP con rutas repetidas es ambiguo — el
 * escritor de `zip.ts` lo rechaza, así que aquí hay que garantizar unicidad. El
 * id va delante también por esto: al reducir a ASCII, dos nombres distintos
 * pueden converger («política.pdf» y «politica.pdf»), y sin el prefijo el
 * paquete se caería al construirse.
 */
export function packagePath(file: EvidenceFile): string {
  return `evidencia/${file.id.slice(0, 8)}-${asciiPathSegment(safeFilename(file.filename))}`;
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
