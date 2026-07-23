/**
 * Corpus de conocimiento del Analista: texto VERBATIM del articulado, curado y
 * verificado por el `compliance-domain-expert`. Es la única fuente legal que el
 * Analista puede citar (grounding). NO son nuestros resúmenes: es la ley cruda.
 */

export type CorpusChunk = {
  /** Marco al que pertenece (default 'eu-ai-act'). */
  framework?: string;
  /** Referencia estable y legible: "Art. 26.1", "Anexo III.4". */
  doc_ref: string;
  /** Etiqueta corta de qué trata el fragmento. */
  title: string;
  /** Texto literal del apartado. */
  content: string;
  /** URL oficial de la fuente. */
  source_url: string;
};

import { EU_AI_ACT_CORPUS } from "./eu-ai-act";

/** Corpus completo (por ahora solo EU AI Act; multi-marco se añade después). */
export const CORPUS: CorpusChunk[] = [...EU_AI_ACT_CORPUS];
