import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeContent,
  contentHash,
  excerptOf,
  buildDetectionCandidate,
  emptySummary,
  type SourceRef,
  type RegSourceKind,
  type VigiaReport,
  type VigiaSourceResult,
} from "./core";

type SourceRow = {
  id: string;
  framework: string;
  label: string;
  url: string;
  source_kind: RegSourceKind;
  last_hash: string | null;
};

/** Descarga el contenido de una fuente con un tope de tiempo. */
async function fetchText(
  url: string,
  timeoutMs = 12_000,
): Promise<{ ok: boolean; text: string; error?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": "AttestaVigia/1.0 (+compliance watch)" },
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, text: "", error: `HTTP ${res.status}` };
    return { ok: true, text: await res.text() };
  } catch (e) {
    return {
      ok: false,
      text: "",
      error: e instanceof Error ? e.message : "fetch error",
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ejecuta el Vigía sobre todas las fuentes activas: descarga, normaliza, calcula
 * la huella y la compara con la última conocida. Si cambió, deja un candidato en
 * la cola (idempotente: no duplica si ya hay uno en borrador con esa huella) y
 * actualiza la huella de la fuente.
 *
 * Recibe el cliente Supabase ya construido: con sesión de un `platform_admin`
 * (disparo manual, la RLS autoriza las escrituras) o con `service_role` (cron
 * desatendido, salta la RLS). El núcleo es el mismo en ambos casos.
 *
 * `detectedAt` se inyecta (ISO) para mantener la función determinista/testeable.
 */
export async function runVigia(
  supabase: SupabaseClient,
  detectedAt: string,
): Promise<VigiaReport> {
  const results: VigiaSourceResult[] = [];
  const summary = emptySummary();

  const { data, error } = await supabase
    .from("reg_sources")
    .select("id, framework, label, url, source_kind, last_hash")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    // Sin acceso (no admin / RLS) o tabla ausente: devolvemos informe vacío.
    return { checkedAt: detectedAt, results, summary };
  }

  for (const row of (data as SourceRow[]) ?? []) {
    const source: SourceRef = {
      id: row.id,
      framework: row.framework,
      label: row.label,
      url: row.url,
      sourceKind: row.source_kind,
      lastHash: row.last_hash,
    };

    const fetched = await fetchText(source.url);
    if (!fetched.ok) {
      summary.error += 1;
      results.push({
        sourceId: source.id,
        label: source.label,
        outcome: "error",
        error: fetched.error,
      });
      // Registramos la revisión aunque falle, sin tocar la huella.
      await supabase
        .from("reg_sources")
        .update({ last_checked_at: detectedAt })
        .eq("id", source.id);
      continue;
    }

    const normalized = normalizeContent(fetched.text, source.sourceKind);
    const newHash = contentHash(normalized);

    // Primera observación: fijamos la línea base, sin candidato.
    if (source.lastHash == null) {
      summary.baseline += 1;
      results.push({
        sourceId: source.id,
        label: source.label,
        outcome: "baseline",
      });
      await supabase
        .from("reg_sources")
        .update({ last_hash: newHash, last_checked_at: detectedAt })
        .eq("id", source.id);
      continue;
    }

    // Sin cambios.
    if (newHash === source.lastHash) {
      summary.unchanged += 1;
      results.push({
        sourceId: source.id,
        label: source.label,
        outcome: "unchanged",
      });
      await supabase
        .from("reg_sources")
        .update({ last_checked_at: detectedAt })
        .eq("id", source.id);
      continue;
    }

    // Cambió: ¿ya hay un candidato en borrador con esta misma huella?
    // (idempotencia frente a reejecuciones o fallos entre insert y update).
    const { data: dup } = await supabase
      .from("reg_candidates")
      .select("id")
      .eq("source_id", source.id)
      .eq("status", "draft")
      .eq("provenance->>new_hash", newHash)
      .limit(1);

    if (dup && dup.length > 0) {
      summary.duplicate += 1;
      results.push({
        sourceId: source.id,
        label: source.label,
        outcome: "duplicate",
        candidateId: (dup[0] as { id: string }).id,
      });
      await supabase
        .from("reg_sources")
        .update({ last_hash: newHash, last_checked_at: detectedAt })
        .eq("id", source.id);
      continue;
    }

    const candidate = buildDetectionCandidate({
      source,
      previousHash: source.lastHash,
      newHash,
      excerpt: excerptOf(normalized),
      detectedAt,
    });

    const { data: inserted, error: insErr } = await supabase
      .from("reg_candidates")
      .insert(candidate)
      .select("id")
      .single();

    if (insErr || !inserted) {
      summary.error += 1;
      results.push({
        sourceId: source.id,
        label: source.label,
        outcome: "error",
        error: insErr?.message ?? "no se pudo crear el candidato",
      });
      continue;
    }

    summary.changed += 1;
    results.push({
      sourceId: source.id,
      label: source.label,
      outcome: "changed",
      candidateId: (inserted as { id: string }).id,
    });
    await supabase
      .from("reg_sources")
      .update({ last_hash: newHash, last_checked_at: detectedAt })
      .eq("id", source.id);
  }

  return { checkedAt: detectedAt, results, summary };
}
