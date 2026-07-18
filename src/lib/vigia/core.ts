import { createHash } from "node:crypto";

/**
 * Núcleo determinista del Vigía (primer agente del foso).
 *
 * Funciones PURAS: normalizar el contenido de una fuente, calcular su huella y
 * construir el candidato de "algo cambió aquí". Sin red ni base de datos, para
 * poder probarlas de forma aislada. El Vigía NO interpreta la norma (eso es del
 * Analista, Fase B): solo detecta que una fuente vigilada cambió y deja un
 * candidato en la cola del Validador.
 */

export type RegSourceKind = "page" | "feed" | "api";

export type SourceRef = {
  id: string;
  framework: string;
  label: string;
  url: string;
  sourceKind: RegSourceKind;
  lastHash: string | null;
};

/**
 * Normaliza el contenido para que el hash capture cambios *sustantivos* y no
 * ruido (scripts, estilos, comentarios, espacios). No pretende ser perfecto: el
 * humano valida. Reduce falsos positivos triviales, no todos.
 */
export function normalizeContent(raw: string, kind: RegSourceKind): string {
  let text = raw;
  if (kind === "page" || kind === "feed") {
    text = text
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      // etiquetas de nonce/csrf/timestamp habituales que cambian en cada carga
      .replace(/<meta\b[^>]*csrf[^>]*>/gi, " ")
      .replace(/<[^>]+>/g, " "); // resto de etiquetas
  }
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Huella SHA-256 (hex) del contenido normalizado. */
export function contentHash(normalized: string): string {
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

/** Fragmento representativo para la procedencia del candidato. */
export function excerptOf(normalized: string, max = 240): string {
  const t = normalized.trim();
  return t.length <= max ? t : `${t.slice(0, max).trimEnd()}…`;
}

export type DetectionInput = {
  source: SourceRef;
  previousHash: string | null;
  newHash: string;
  excerpt: string;
  detectedAt: string; // ISO
};

/**
 * Fila para `reg_candidates` que representa una detección del Vigía.
 * Deja `kind`/`event_date` en null a propósito: el Vigía no clasifica; marca el
 * cambio para que un humano (o el Analista) lo analice. Por eso NO es
 * publicable directamente (approve_reg_candidate exige fecha+tipo+fuente).
 */
export function buildDetectionCandidate(input: DetectionInput) {
  const { source, previousHash, newHash, excerpt, detectedAt } = input;
  return {
    framework: source.framework,
    title: `Cambio detectado en «${source.label}»`,
    summary:
      "El Vigía detectó que el contenido de esta fuente vigilada cambió desde la última revisión. Requiere análisis para clasificar el cambio.",
    status: "draft" as const,
    source_id: source.id,
    source: { label: source.label, url: source.url },
    provenance: {
      agent: "Vigía",
      model: null, // determinista, sin LLM
      confidence: null,
      excerpt,
      detected_at: detectedAt,
      previous_hash: previousHash,
      new_hash: newHash,
    },
  };
}

export type VigiaOutcome =
  | "baseline" // primera vez que vemos la fuente: guardamos huella, sin candidato
  | "unchanged" // igual que la última vez
  | "changed" // cambió → candidato creado
  | "duplicate" // cambió pero ya hay un candidato en cola con esa huella
  | "error"; // no se pudo leer la fuente

export type VigiaSourceResult = {
  sourceId: string;
  label: string;
  outcome: VigiaOutcome;
  candidateId?: string;
  error?: string;
};

export type VigiaReport = {
  checkedAt: string;
  results: VigiaSourceResult[];
  summary: Record<VigiaOutcome, number>;
};

export function emptySummary(): Record<VigiaOutcome, number> {
  return { baseline: 0, unchanged: 0, changed: 0, duplicate: 0, error: 0 };
}
