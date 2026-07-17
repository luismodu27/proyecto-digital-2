/**
 * Cliente de embeddings (Voyage AI) — server-only.
 *
 * Devuelve `null` si no hay `VOYAGE_API_KEY` (fallback seguro: en B.0 nunca se
 * llama). La verificación fina del contrato de la API se hace al activar B.1
 * (con la llave real) — ver TODO abajo.
 */

import { EMBED_DIM, EMBED_MODEL, isVoyageConfigured } from "./config";

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

export type EmbedInputType = "document" | "query";

/**
 * Embebe una lista de textos. `input_type` mejora el retrieval (document al
 * indexar, query al consultar). Devuelve un vector por texto, o `null` si no
 * está configurado.
 *
 * TODO(B.1): confirmar con Context7/docs el shape exacto (output_dimension,
 * límites de batch, códigos de rate-limit) antes de la primera ingesta real.
 */
export async function embed(
  texts: string[],
  inputType: EmbedInputType,
): Promise<number[][] | null> {
  if (!isVoyageConfigured || texts.length === 0) return null;

  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: texts,
      model: EMBED_MODEL,
      input_type: inputType,
      output_dimension: EMBED_DIM,
    }),
  });

  if (!res.ok) {
    throw new Error(`Voyage ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { data?: { embedding: number[] }[] };
  const out = (json.data ?? []).map((d) => d.embedding);
  return out.length === texts.length ? out : null;
}

/** Embebe un solo texto (conveniencia para la consulta del Analista). */
export async function embedOne(
  text: string,
  inputType: EmbedInputType,
): Promise<number[] | null> {
  const r = await embed([text], inputType);
  return r?.[0] ?? null;
}
