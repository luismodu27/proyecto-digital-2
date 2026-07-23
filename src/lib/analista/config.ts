/**
 * Configuración del Analista (Fase B del foso).
 *
 * Las llaves son SECRETOS DE SERVIDOR (nunca `NEXT_PUBLIC_*`, nunca en cliente).
 * Sin ellas, el Analista degrada con elegancia (fallback seguro).
 *
 * Drafting = cualquier proveedor **compatible con OpenAI** (chat completions +
 * function calling). Por defecto **NVIDIA NIM** (gratis). Configurable por env
 * para usar Groq, OpenRouter u otro sin tocar código.
 */

/** Embeddings (Voyage) — debe coincidir entre ingesta y consulta. */
export const EMBED_MODEL = "voyage-4";
export const EMBED_DIM = 1024;

/** Drafting — endpoint OpenAI-compatible + modelo. */
export const ANALISTA_BASE_URL =
  process.env.ANALISTA_BASE_URL || "https://integrate.api.nvidia.com/v1";
export const ANALISTA_MODEL =
  process.env.ANALISTA_MODEL || "meta/llama-3.3-70b-instruct";

export const isVoyageConfigured = Boolean(process.env.VOYAGE_API_KEY);
export const isLlmConfigured = Boolean(process.env.ANALISTA_API_KEY);

/** El Analista real (embeddings + drafting) requiere ambas llaves. */
export const isAnalistaConfigured = isVoyageConfigured && isLlmConfigured;
