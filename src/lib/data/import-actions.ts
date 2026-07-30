"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import { trackServer } from "@/lib/telemetry/server";
import { logIncident } from "@/lib/observability/log";
import { MAX_IMPORT_ROWS, parseSystemsCsv } from "@/lib/import/csv";

/**
 * Importación de inventario por CSV (camino de escritura).
 *
 * El parseo y la validación son puros y viven en `lib/import/csv.ts`; aquí solo
 * queda lo que necesita servidor: sesión, organización, insert e invalidación de
 * caché.
 *
 * Se **vuelve a parsear en el servidor** aunque el navegador ya haya mostrado la
 * previsualización: lo que llega es texto del cliente y no se confía en ningún
 * recuento suyo. La previsualización es cortesía de UX, no una validación.
 */

export type ImportOutcome = {
  ok: boolean;
  /** Filas insertadas de verdad. */
  imported: number;
  /** Filas descartadas por el parser (con su motivo). */
  rejected: number;
  /** Filas que ya existían en el inventario con el mismo nombre. */
  skippedExisting: number;
  /** Filas que se quedaron fuera por el tope de la importación. */
  truncated: number;
  /** Clave de error para traducir en la UI (solo si `ok` es false). */
  error?: "demo" | "no-org" | "empty" | "too-large" | "write-failed";
};

/** Tope del texto aceptado (≈200 filas holgadas). Acota el abuso y la memoria. */
const MAX_CSV_CHARS = 100_000;

export async function importSystemsCsv(csv: string): Promise<ImportOutcome> {
  const empty: Omit<ImportOutcome, "ok" | "error"> = {
    imported: 0,
    rejected: 0,
    skippedExisting: 0,
    truncated: 0,
  };

  if (!isSupabaseConfigured) return { ok: false, ...empty, error: "demo" };
  if (typeof csv !== "string" || csv.trim() === "") {
    return { ok: false, ...empty, error: "empty" };
  }
  if (csv.length > MAX_CSV_CHARS) {
    return { ok: false, ...empty, error: "too-large" };
  }

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return { ok: false, ...empty, error: "no-org" };

  const parsed = parseSystemsCsv(csv);
  if (parsed.rows.length === 0) {
    return {
      ok: false,
      ...empty,
      rejected: parsed.errors.length,
      truncated: parsed.truncated,
      error: "empty",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No duplicar lo que ya está en el inventario: la importación tiene que poder
  // repetirse (el cliente corrige su hoja y vuelve a subirla) sin llenar el
  // inventario de copias.
  const { data: existing } = await supabase
    .from("ai_systems")
    .select("name")
    .eq("organization_id", org);
  const seen = new Set(
    (existing ?? []).map((r) => String(r.name ?? "").trim().toLowerCase()),
  );

  const fresh = parsed.rows.filter((r) => !seen.has(r.name.toLowerCase()));
  const skippedExisting = parsed.rows.length - fresh.length;

  if (fresh.length === 0) {
    return {
      ok: true,
      ...empty,
      rejected: parsed.errors.length,
      skippedExisting,
      truncated: parsed.truncated,
    };
  }

  // OJO: en un insert múltiple, PostgREST exige que TODAS las filas tengan
  // EXACTAMENTE las mismas claves; si no, responde 400 `PGRST102 All object keys
  // must match`. Por eso se enumeran los seis campos siempre, con `null` cuando el
  // CSV no traía el dato. No "optimizar" omitiendo los nulos: rompería la
  // importación en cuanto una fila del fichero venga incompleta (o sea, siempre).
  const { error } = await supabase.from("ai_systems").insert(
    fresh.slice(0, MAX_IMPORT_ROWS).map((r) => ({
      organization_id: org,
      name: r.name,
      owner: r.owner,
      domain: r.domain,
      vendor: r.vendor,
      actor_role: r.actorRole,
      created_by: user?.id,
    })),
  );

  if (error) {
    logIncident("importSystemsCsv", error, `${fresh.length} filas`);
    return {
      ok: false,
      ...empty,
      rejected: parsed.errors.length,
      truncated: parsed.truncated,
      error: "write-failed",
    };
  }

  // Un solo evento con el recuento: el hito del embudo es "esta cuenta ya tiene
  // inventario", no cada fila. `source` permite comparar CSV vs alta manual.
  await trackServer("system_created", {
    organizationId: org,
    props: { source: "csv", count: fresh.length },
  });

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/riesgo");

  return {
    ok: true,
    imported: fresh.length,
    rejected: parsed.errors.length,
    skippedExisting,
    truncated: parsed.truncated,
  };
}
