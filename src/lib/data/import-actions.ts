"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import { trackServer } from "@/lib/telemetry/server";
import { logIncident } from "@/lib/observability/log";
import { MAX_IMPORT_ROWS, parseSystemsCsv } from "@/lib/import/csv";
import { checkQuota } from "@/lib/billing/quota";

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
  /**
   * Filas que no entraron por el CUPO del plan (distinto de `truncated`, que es
   * el tope técnico del fichero). Se separa a propósito: una es "tu fichero es
   * enorme" y la otra "tu plan da para N sistemas", y llevan a acciones
   * distintas — partir el CSV en un caso, mejorar de plan en el otro.
   */
  skippedQuota: number;
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
    skippedQuota: 0,
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

  // Cupo del plan. Se importa lo que CABE en vez de rechazar el fichero entero:
  // quien sube 40 filas con 20 huecos preferiría tener 20 sistemas dentro y saber
  // exactamente cuántos faltan, no un error y su hoja de cálculo intacta. Las que
  // no entran se cuentan aparte para poder decírselo con precisión.
  const { allowed } = await checkQuota(org, "systems", fresh.length);
  const toInsert = fresh.slice(0, Math.min(allowed, MAX_IMPORT_ROWS));
  const skippedQuota = fresh.length - toInsert.length;

  if (toInsert.length === 0) {
    return {
      ok: true,
      ...empty,
      rejected: parsed.errors.length,
      skippedExisting,
      truncated: parsed.truncated,
      skippedQuota,
    };
  }

  // OJO: en un insert múltiple, PostgREST exige que TODAS las filas tengan
  // EXACTAMENTE las mismas claves; si no, responde 400 `PGRST102 All object keys
  // must match`. Por eso se enumeran los seis campos siempre, con `null` cuando el
  // CSV no traía el dato. No "optimizar" omitiendo los nulos: rompería la
  // importación en cuanto una fila del fichero venga incompleta (o sea, siempre).
  const { error } = await supabase.from("ai_systems").insert(
    toInsert.map((r) => ({
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
    props: { source: "csv", count: toInsert.length },
  });

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/riesgo");

  return {
    ok: true,
    // `toInsert.length`, no `fresh.length`: son distintos en cuanto el cupo
    // recorta, y reportar de más haría que la UI dijera "12 importados" cuando
    // entraron 8.
    imported: toInsert.length,
    rejected: parsed.errors.length,
    skippedExisting,
    truncated: parsed.truncated,
    skippedQuota,
  };
}
