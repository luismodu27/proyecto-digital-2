/**
 * Configuración del Analista (Fase B del foso).
 *
 * Las llaves son SECRETOS DE SERVIDOR (nunca `NEXT_PUBLIC_*`, nunca en cliente).
 * Sin ellas, el Analista degrada con elegancia: la app y el resto del pipeline
 * siguen funcionando (fallback seguro), solo que el enriquecimiento por IA no se
 * ejecuta hasta que se configuren.
 */

/** Modelo de embeddings (debe coincidir entre ingesta y consulta). */
export const EMBED_MODEL = "voyage-4";
export const EMBED_DIM = 1024;

/** Modelo de drafting del Analista. */
export const ANALISTA_MODEL = "claude-sonnet-5";

export const isVoyageConfigured = Boolean(process.env.VOYAGE_API_KEY);
export const isAnthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

/** El Analista real (embeddings + drafting) requiere ambas llaves. */
export const isAnalistaConfigured = isVoyageConfigured && isAnthropicConfigured;
