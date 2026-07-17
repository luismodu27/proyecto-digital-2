/**
 * El Analista (Claude) — server-only.
 *
 * Toma la señal de cambio + los fragmentos de norma recuperados por RAG y
 * PROPONE un borrador de evento regulatorio, anclado a citas reales. Salida
 * forzada por tool use (JSON estructurado). Nada se publica: el humano valida.
 *
 * B.0: contrato de tipos + stub (devuelve null sin llave o hasta B.2). La
 * redacción real (system prompt de grounding, deployer-vs-provider, filtro de
 * copy prohibido, validación post-hoc) se implementa en B.2.
 */

import { isAnthropicConfigured } from "./config";

/** Fragmento de norma recuperado, con el que el Analista debe fundamentar. */
export type RetrievedChunk = {
  id: string;
  doc_ref: string;
  title: string | null;
  content: string;
  source_url: string | null;
  similarity: number;
};

/** Cita: qué fragmento respalda una afirmación del borrador. */
export type DraftCitation = {
  chunk_id: string;
  doc_ref: string;
  quote: string;
};

/** Borrador propuesto por el Analista (calca las columnas de reg_candidates). */
export type AnalistaDraft = {
  event_date: string | null;
  kind: string | null;
  summary: string;
  impact: string;
  action: string;
  articles: string[];
  scope: { all?: boolean; riskLevels?: string[] };
  proposed_event_id: string | null;
  confidence: number; // 0..1
  citations: DraftCitation[];
  supported: boolean;
  insufficient_evidence: boolean;
  insufficient_reason?: string | null;
};

export type AnalistaSignal = {
  framework: string;
  sourceLabel: string;
  sourceUrl: string | null;
  /** Contenido (nuevo) de la fuente que cambió, para que el Analista lo lea. */
  content: string;
};

/**
 * Redacta un borrador grounded a partir de la señal y los fragmentos.
 * B.0: devuelve `null` (stub). B.2 implementa el tool use real.
 */
export async function draft(
  _signal: AnalistaSignal,
  _chunks: RetrievedChunk[],
): Promise<AnalistaDraft | null> {
  if (!isAnthropicConfigured) return null;
  // TODO(B.2): Messages API con tool `propose_reg_event` forzada, system prompt
  // de grounding (solo los chunks como fuente legal), reencuadre deployer, y
  // validación post-hoc de copy prohibido. Verificar el API con Context7.
  void _signal;
  void _chunks;
  return null;
}
