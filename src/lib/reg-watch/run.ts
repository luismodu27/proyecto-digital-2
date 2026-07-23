/**
 * Vigía — orquestador (server-only).
 *
 * Lee la watchlist activa (`reg_sources`), descarga y hashea cada fuente, y
 * llama al RPC `vigia_report`, que detecta el cambio por hash y encola un
 * candidato-señal si procede. Lo usan tanto el Route Handler del cron
 * (post-deploy) como la acción "Ejecutar Vigía ahora" del panel.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAndHash, type FetchImpl } from "./vigia";

export type VigiaSourceOutcome = {
  id: string;
  label: string;
  url: string;
  /** baseline | unchanged | changed | error | unknown */
  status: string;
  /** id del candidato creado, 'deduped', o null si no se creó ninguno */
  candidate: string | null;
  detail?: string;
};

export type VigiaRunSummary = {
  checked: number;
  changed: number;
  candidates: number;
  errors: number;
  outcomes: VigiaSourceOutcome[];
};

type SourceRow = { id: string; label: string; url: string };

export async function runVigia(
  supabase: SupabaseClient,
  opts: { fetchImpl?: FetchImpl; timeoutMs?: number } = {},
): Promise<VigiaRunSummary> {
  const { data, error } = await supabase
    .from("reg_sources")
    .select("id, label, url, active")
    .eq("active", true);
  if (error) {
    throw new Error(`No se pudo leer la watchlist: ${error.message}`);
  }
  const sources = (data ?? []) as SourceRow[];

  const outcomes: VigiaSourceOutcome[] = [];
  // Secuencial y a ritmo pausado: la watchlist es pequeña y así somos amables
  // con las fuentes oficiales (evita parecer un scraper agresivo).
  for (const s of sources) {
    const r = await fetchAndHash(s.url, opts);
    const { data: rep, error: repErr } = await supabase.rpc("vigia_report", {
      src: s.id,
      new_hash: r.ok ? r.hash : "",
      ok: r.ok,
      err: r.ok ? null : r.error,
    });

    if (repErr) {
      outcomes.push({
        id: s.id,
        label: s.label,
        url: s.url,
        status: "error",
        candidate: null,
        detail: repErr.message,
      });
      continue;
    }

    const rj = (rep ?? {}) as {
      status?: string;
      candidate?: string | null;
      detail?: string;
    };
    outcomes.push({
      id: s.id,
      label: s.label,
      url: s.url,
      status: rj.status ?? "unknown",
      candidate: rj.candidate ?? null,
      detail: r.ok ? rj.detail : r.error,
    });
  }

  return {
    checked: outcomes.length,
    changed: outcomes.filter((o) => o.status === "changed").length,
    candidates: outcomes.filter(
      (o) => o.candidate && o.candidate !== "deduped",
    ).length,
    errors: outcomes.filter((o) => o.status === "error").length,
    outcomes,
  };
}
