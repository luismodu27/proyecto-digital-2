/**
 * Ingesta del corpus a la base de conocimiento vectorial (Fase B.1) — server-only.
 *
 * Chunk → embed (Voyage) → upsert en `reg_knowledge_chunks`. Idempotente: solo
 * (re)embebe los fragmentos cuyo contenido o modelo cambió (dedupe por
 * `source_hash` + `model`), así reingerir es barato y no duplica.
 */

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EMBED_MODEL, isVoyageConfigured } from "./config";
import { embed } from "./voyage";
import { CORPUS, type CorpusChunk } from "./corpus";

const DEFAULT_FRAMEWORK = "eu-ai-act";
const BATCH = 64;

function sha256(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

export type IngestSummary = {
  total: number;
  embedded: number;
  upserted: number;
  skipped: number;
  error?: string;
};

export async function ingestCorpus(
  supabase: SupabaseClient,
): Promise<IngestSummary> {
  if (!isVoyageConfigured) {
    return {
      total: CORPUS.length,
      embedded: 0,
      upserted: 0,
      skipped: 0,
      error: "VOYAGE_API_KEY no configurada",
    };
  }
  if (CORPUS.length === 0) {
    return { total: 0, embedded: 0, upserted: 0, skipped: 0, error: "corpus vacío" };
  }

  // Estado actual: qué (framework|doc_ref|chunk_index) ya está al día.
  const { data: existing } = await supabase
    .from("reg_knowledge_chunks")
    .select("framework, doc_ref, chunk_index, source_hash, model");
  const upToDate = new Set(
    ((existing ?? []) as {
      framework: string;
      doc_ref: string;
      chunk_index: number;
      source_hash: string | null;
      model: string;
    }[])
      .map((r) => `${r.framework}|${r.doc_ref}|${r.chunk_index}|${r.source_hash}|${r.model}`),
  );

  type Pending = { chunk: CorpusChunk; framework: string; hash: string };
  const pending: Pending[] = [];
  for (const c of CORPUS) {
    const framework = c.framework ?? DEFAULT_FRAMEWORK;
    const hash = sha256(c.content);
    const key = `${framework}|${c.doc_ref}|0|${hash}|${EMBED_MODEL}`;
    if (!upToDate.has(key)) pending.push({ chunk: c, framework, hash });
  }

  if (pending.length === 0) {
    return { total: CORPUS.length, embedded: 0, upserted: 0, skipped: CORPUS.length };
  }

  let upserted = 0;
  for (let i = 0; i < pending.length; i += BATCH) {
    const slice = pending.slice(i, i + BATCH);
    const vecs = await embed(
      slice.map((p) => p.chunk.content),
      "document",
    );
    if (!vecs) {
      return {
        total: CORPUS.length,
        embedded: i,
        upserted,
        skipped: 0,
        error: "embed devolvió null (Voyage no configurado o respuesta inválida)",
      };
    }
    const rows = slice.map((p, idx) => ({
      framework: p.framework,
      doc_ref: p.chunk.doc_ref,
      title: p.chunk.title,
      chunk_index: 0,
      content: p.chunk.content,
      token_count: Math.ceil(p.chunk.content.length / 4),
      model: EMBED_MODEL,
      source_url: p.chunk.source_url,
      source_hash: p.hash,
      // pgvector acepta el array; si PostgREST se queja, formatear como
      // `[${vec.join(",")}]` (verificar en la 1ª ingesta real).
      embedding: vecs[idx],
    }));
    const { error } = await supabase
      .from("reg_knowledge_chunks")
      .upsert(rows, { onConflict: "framework,doc_ref,chunk_index" });
    if (error) {
      return {
        total: CORPUS.length,
        embedded: i + slice.length,
        upserted,
        skipped: 0,
        error: error.message,
      };
    }
    upserted += rows.length;
  }

  return {
    total: CORPUS.length,
    embedded: pending.length,
    upserted,
    skipped: CORPUS.length - pending.length,
  };
}
