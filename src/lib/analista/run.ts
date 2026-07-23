/**
 * Analista — orquestador (server-only).
 *
 * Recorre las señales del Vigía sin analizar (candidatos `draft`, agente
 * 'Vigía', sin `kind`), y para cada una: obtiene el contenido de la fuente →
 * embed de la consulta → recupera fragmentos de norma (`match_reg_chunks`) →
 * el LLM propone un borrador grounded → lo escribe con `enrich_reg_candidate_ai`.
 * Mantiene el candidato en `draft`: NUNCA publica (eso es del humano).
 *
 * Fallback seguro: sin llaves (B.0) marca cada señal como "skipped" sin escribir
 * nada; sin soporte de RAG, "insufficient" en vez de inventar.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeHtml } from "@/lib/reg-watch/vigia";
import { ANALISTA_MODEL, EMBED_MODEL, isAnalistaConfigured } from "./config";
import { embedOne } from "./voyage";
import { draft, type RetrievedChunk } from "./llm";

export type AnalistaOutcome = {
  id: string;
  label: string;
  /** enriched | skipped | insufficient | error */
  status: string;
  confidence?: number;
  detail?: string;
};

export type AnalistaRunSummary = {
  candidates: number;
  enriched: number;
  skipped: number;
  insufficient: number;
  errors: number;
  configured: boolean;
  outcomes: AnalistaOutcome[];
};

type SignalRow = {
  id: string;
  framework: string;
  title: string;
  source: { label?: string; url?: string } | null;
};

async function fetchSourceContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "AttestaAnalista/1.0 (+regulatory-watch)",
        accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    return normalizeHtml(await res.text());
  } catch {
    return null;
  }
}

export async function runAnalista(
  supabase: SupabaseClient,
): Promise<AnalistaRunSummary> {
  const { data, error } = await supabase
    .from("reg_candidates")
    .select("id, framework, title, source, provenance, kind")
    .eq("status", "draft")
    .is("kind", null)
    .eq("provenance->>agent", "Vigía")
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(`No se pudieron leer los candidatos: ${error.message}`);
  }
  const signals = (data ?? []) as SignalRow[];

  const outcomes: AnalistaOutcome[] = [];

  for (const s of signals) {
    const label = s.source?.label ?? s.title;

    // B.0 / sin llaves: no se toca nada, solo se cuenta.
    if (!isAnalistaConfigured) {
      outcomes.push({
        id: s.id,
        label,
        status: "skipped",
        detail: "IA no configurada (falta VOYAGE_API_KEY / ANALISTA_API_KEY)",
      });
      continue;
    }

    try {
      const url = s.source?.url ?? null;
      const content = url ? await fetchSourceContent(url) : null;
      if (!content) {
        outcomes.push({ id: s.id, label, status: "error", detail: "sin contenido de la fuente" });
        continue;
      }

      const queryVec = await embedOne(content.slice(0, 8000), "query");
      let chunks: RetrievedChunk[] = [];
      if (queryVec) {
        const { data: m } = await supabase.rpc("match_reg_chunks", {
          query_embedding: queryVec,
          fw: s.framework,
          k: 6,
        });
        chunks = (m ?? []) as RetrievedChunk[];
      }

      const d = await draft(
        { framework: s.framework, sourceLabel: label, sourceUrl: url, content },
        chunks,
      );

      if (!d || d.insufficient_evidence || !d.supported) {
        outcomes.push({
          id: s.id,
          label,
          status: "insufficient",
          detail: d?.insufficient_reason ?? "sin borrador con soporte suficiente",
        });
        continue;
      }

      const patch = {
        event_date: d.event_date ?? "",
        kind: d.kind ?? "",
        summary: d.summary,
        impact: d.impact,
        action: d.action,
        articles: d.articles,
        scope: d.scope,
        proposed_event_id: d.proposed_event_id ?? "",
      };
      const prov = {
        agent: "Analista",
        model: ANALISTA_MODEL,
        embed_model: EMBED_MODEL,
        confidence: d.confidence,
        citations: d.citations,
        retrieved_refs: chunks.map((c) => c.doc_ref),
      };

      const { error: eErr } = await supabase.rpc("enrich_reg_candidate_ai", {
        cand: s.id,
        patch,
        prov,
      });
      if (eErr) {
        outcomes.push({ id: s.id, label, status: "error", detail: eErr.message });
        continue;
      }
      outcomes.push({ id: s.id, label, status: "enriched", confidence: d.confidence });
    } catch (e) {
      outcomes.push({
        id: s.id,
        label,
        status: "error",
        detail: e instanceof Error ? e.message : "error",
      });
    }
  }

  return {
    candidates: outcomes.length,
    enriched: outcomes.filter((o) => o.status === "enriched").length,
    skipped: outcomes.filter((o) => o.status === "skipped").length,
    insufficient: outcomes.filter((o) => o.status === "insufficient").length,
    errors: outcomes.filter((o) => o.status === "error").length,
    configured: isAnalistaConfigured,
    outcomes,
  };
}
