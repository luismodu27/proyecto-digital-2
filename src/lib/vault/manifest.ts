/**
 * Manifiesto del paquete de auditoría.
 *
 * QUÉ PROBLEMA RESUELVE, y por qué es el mayor salto de defensibilidad del
 * producto. Hoy cada control se marca "hecho" y nadie adjunta nada: el "% listo"
 * mide declaraciones, no evidencia. Ante un auditor eso se derrumba en la primera
 * pregunta ("enséñame el documento"). El vault guarda los archivos; este
 * manifiesto es lo que convierte un montón de archivos en algo *comprobable*.
 *
 * EL ADVERSARIO NO ES ATTESTA, ES LA ORGANIZACIÓN AUDITADA. Conviene decirlo
 * claro porque decide el diseño entero. A un auditor no le preocupa que Attesta
 * mienta; le preocupa que la empresa auditada fabrique o retoque evidencia y la
 * presente como si llevara ahí desde siempre. Por eso el paquete lo firma
 * Attesta con SU clave: el cliente no puede producir uno válido desde su portátil.
 * Un manifiesto con hashes pero SIN firma no resuelve nada frente a ese
 * adversario — quien altera un archivo altera también su hash y el manifiesto
 * vuelve a ser coherente.
 *
 * LO QUE LA FIRMA AFIRMA, redactado con cuidado porque roza la regla nº 1:
 *
 *   «Estos archivos, con estos hashes, estaban en la cuenta de esta organización
 *    en esta fecha.»
 *
 * Es una afirmación de CUSTODIA E INTEGRIDAD, no de cumplimiento. NO dice que la
 * evidencia sea suficiente, ni que la organización cumpla, ni que Attesta la haya
 * revisado. Esa frontera va escrita DENTRO del manifiesto (`attests` /
 * `doesNotAttest`) y no solo en la interfaz: si alguien reenvía el JSON suelto,
 * el matiz viaja con él. Un paquete que se pueda malinterpretar fuera de su
 * pantalla es un pasivo.
 *
 * CANONICALIZACIÓN. La firma se calcula sobre una serialización canónica —claves
 * ordenadas, sin espacios— y no sobre `JSON.stringify` a secas. Sin eso, un
 * verificador independiente (el script de un auditor, otro lenguaje) reordenaría
 * las claves y la firma no cuadraría, lo que se leería como "paquete manipulado".
 * La forma de fallar de un formato mal canonicalizado es acusar de fraude a quien
 * no ha hecho nada.
 */

/** Versión del formato. Un verificador debe rechazar lo que no entienda. */
export const MANIFEST_VERSION = 1;

export type ManifestFile = {
  /** Ruta dentro del ZIP. Única dentro del paquete. */
  path: string;
  /** SHA-256 del contenido, en hexadecimal minúscula. */
  sha256: string;
  bytes: number;
  /** ISO 8601. Cuándo se subió a Attesta, no cuándo se empaquetó. */
  uploadedAt: string;
  /** A qué se adjuntó: requisito, sistema o proveedor. Texto legible. */
  attachedTo: string;
};

export type Manifest = {
  format: "attesta-audit-package";
  version: number;
  /** ISO 8601 de generación del paquete. */
  generatedAt: string;
  organization: { id: string; name: string };
  files: readonly ManifestFile[];
  totals: { files: number; bytes: number };
  /**
   * Qué afirma y qué NO afirma este paquete, en los dos idiomas y dentro del
   * propio fichero. Ver el bloque de arriba.
   */
  attests: Record<"es" | "en", string>;
  doesNotAttest: Record<"es" | "en", string>;
  /**
   * Truncamiento declarado. Un paquete que se corta en silencio es peor que uno
   * que falla: quien lo recibe cree tenerlo todo.
   */
  truncated: { omittedFiles: number; reason: string } | null;
};

const ATTESTS = {
  es: "Attesta hace constar que los archivos listados, con los hashes SHA-256 indicados, estaban almacenados en la cuenta de esta organización en la fecha de generación de este paquete.",
  en: "Attesta records that the listed files, with the SHA-256 hashes shown, were stored in this organization's account on the date this package was generated.",
} as const;

const DOES_NOT_ATTEST = {
  es: "Este paquete NO es una certificación, una auditoría ni una determinación de cumplimiento. Attesta no ha revisado el contenido de los archivos ni valora si la evidencia es suficiente. El contenido lo aporta y lo declara la propia organización.",
  en: "This package is NOT a certification, an audit, or a determination of compliance. Attesta has not reviewed the contents of the files and does not assess whether the evidence is sufficient. The content is supplied and declared by the organization itself.",
} as const;

export type ManifestInput = {
  organizationId: string;
  organizationName: string;
  generatedAt: string;
  files: readonly ManifestFile[];
  truncated?: { omittedFiles: number; reason: string } | null;
};

export function buildManifest(input: ManifestInput): Manifest {
  // Orden estable por ruta. Sin esto, dos paquetes del mismo contenido darían
  // manifiestos distintos según el orden en que la base de datos devolviera las
  // filas, y comparar dos paquetes dejaría de ser posible.
  const files = [...input.files].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  return {
    format: "attesta-audit-package",
    version: MANIFEST_VERSION,
    generatedAt: input.generatedAt,
    organization: { id: input.organizationId, name: input.organizationName },
    files,
    totals: {
      files: files.length,
      bytes: files.reduce((sum, f) => sum + f.bytes, 0),
    },
    attests: { ...ATTESTS },
    doesNotAttest: { ...DOES_NOT_ATTEST },
    truncated: input.truncated ?? null,
  };
}

/**
 * Serialización CANÓNICA: claves ordenadas en todo el árbol, sin espacios.
 *
 * Es lo que se firma y lo que se vuelve a construir al verificar. Se implementa
 * a mano en lugar de usar `JSON.stringify(obj, Object.keys(obj).sort())` porque
 * esa forma solo ordena el primer nivel y deja los objetos anidados como estén —
 * un fallo que no se nota hasta que un verificador ajeno dice "firma inválida"
 * sobre un paquete legítimo.
 *
 * No admite `undefined`, funciones ni ciclos: si aparecen, es un error de
 * programación y debe verse en el acto, no producir una firma silenciosamente
 * distinta.
 */
export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("canonicalJson: número no finito");
    }
    return JSON.stringify(value);
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
  }
  throw new TypeError(`canonicalJson: tipo no serializable (${typeof value})`);
}

/** Bytes exactos que se firman. Un solo sitio, para que firmar y verificar no diverjan. */
export function manifestBytes(manifest: Manifest): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(canonicalJson(manifest)) as Uint8Array<ArrayBuffer>;
}
