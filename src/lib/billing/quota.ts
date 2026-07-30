import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getOrgPlan, type PlanTier } from "./plan";
import {
  allowedToAdd,
  quotaState,
  resolveMax,
  type QuotaKind,
  type QuotaState,
} from "./limits";
import { logDataFallback, logIncident } from "@/lib/observability/log";
import { trackServer } from "@/lib/telemetry/server";

/**
 * Resolución del cupo contra la base de datos.
 *
 * La aritmética está en `limits.ts` (pura y con tests); aquí solo se cuenta lo que
 * hay y se averigua el tope. La separación importa: esto no se puede testear sin
 * Supabase, así que cuanto menos decida, mejor.
 *
 * REGLA DE DEGRADACIÓN, y es deliberadamente asimétrica respecto al resto de la
 * app: ante un error **se deja pasar** (`unlimited`). En los *entitlements*
 * (`plan.ts`) fallamos cerrado, porque regalar una función de pago cuesta dinero;
 * aquí fallamos abierto, porque el daño está al revés. Que un fallo transitorio
 * de la base de datos impida a un cliente que paga dar de alta un sistema es un
 * incidente de soporte real y una razón para cancelar; que se cree un sistema de
 * más mientras la base de datos tose no le cuesta nada a nadie. Todo fallo así se
 * registra, así que no es un agujero silencioso.
 */

/** Cupos de una organización, ya resueltos (plan + pacto por organización). */
export type OrgQuotas = {
  plan: PlanTier;
  systems: QuotaState;
  seats: QuotaState;
};

/** Estado "sin tope" que se usa en demo y como degradación segura. */
function unlimited(kind: QuotaKind): QuotaState {
  return quotaState(kind, 0, null);
}

/**
 * Topes pactados de la organización (migración 0029).
 *
 * Si las columnas aún no existen, `logDataFallback` lo clasifica como
 * `migration-pending` (un `warn`, no un error) y se devuelven sin pacto → se usan
 * los cupos del plan. Es el estado esperado antes de aplicar 0029.
 */
async function orgOverrides(
  orgId: string,
): Promise<{ systems: number | null; seats: number | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("max_systems, max_seats")
      .eq("id", orgId)
      .maybeSingle();
    if (error) {
      logDataFallback("orgOverrides", error);
      return { systems: null, seats: null };
    }
    return {
      systems: (data?.max_systems as number | null) ?? null,
      seats: (data?.max_seats as number | null) ?? null,
    };
  } catch (err) {
    logIncident("orgOverrides", err, "sin topes pactados");
    return { systems: null, seats: null };
  }
}

/**
 * Cuenta filas de una tabla en la organización. `null` = no se pudo contar.
 *
 * `head: true` pide solo la cabecera con el total: no trae ni una fila, que es lo
 * que interesa cuando el inventario tiene cientos de sistemas.
 */
async function countRows(
  table: string,
  orgId: string,
  status?: string,
): Promise<number | null> {
  try {
    const supabase = await createClient();
    const base = supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId);
    const { count, error } = await (status ? base.eq("status", status) : base);
    if (error) {
      logDataFallback(`countRows:${table}`, error);
      return null;
    }
    return count ?? 0;
  } catch (err) {
    logIncident(`countRows:${table}`, err);
    return null;
  }
}

/**
 * Asientos consumidos = miembros + invitaciones **pendientes**.
 *
 * Las pendientes cuentan a propósito: si no, se puede invitar a cuarenta personas
 * con un plan de un asiento y el tope no significa nada en cuanto acepten. Contarlas
 * también hace que el aviso llegue en el momento útil — al invitar, no después.
 */
async function seatsUsed(orgId: string): Promise<number | null> {
  const members = await countRows("memberships", orgId);
  if (members === null) return null;
  const pending = await countRows("invitations", orgId, "pending");
  // Si las invitaciones no se pueden contar, es mejor cobrar de menos que
  // bloquear: se cuentan solo los miembros reales.
  return members + (pending ?? 0);
}

/** Cupos completos de la organización activa. */
export const getOrgQuotas = cache(async (orgId: string): Promise<OrgQuotas> => {
  if (!isSupabaseConfigured) {
    // Demo: la muestra es completa, sin topes.
    return { plan: "enterprise", systems: unlimited("systems"), seats: unlimited("seats") };
  }

  const [plan, overrides, systems, seats] = await Promise.all([
    getOrgPlan(orgId),
    orgOverrides(orgId),
    countRows("ai_systems", orgId),
    seatsUsed(orgId),
  ]);

  return {
    plan,
    systems:
      systems === null
        ? unlimited("systems")
        : quotaState("systems", systems, resolveMax(plan, "systems", overrides.systems)),
    seats:
      seats === null
        ? unlimited("seats")
        : quotaState("seats", seats, resolveMax(plan, "seats", overrides.seats)),
  };
});

/** Estado de UN cupo. Atajo para las pantallas que solo muestran uno. */
export async function getQuota(
  orgId: string,
  kind: QuotaKind,
): Promise<QuotaState> {
  const quotas = await getOrgQuotas(orgId);
  return quotas[kind];
}

/**
 * Puerta de entrada de las Server Actions que crean cosas: ¿caben `adding` más?
 *
 * Centraliza la comprobación **y la medición**: cuando un cupo bloquea de verdad,
 * emite `quota_blocked` aquí y no en cada sitio, así ninguna ruta se olvida de
 * medirlo. Eso importa porque es la señal de expansión menos especulativa que
 * tenemos: alguien intentó hacer algo y su plan no le dejó.
 *
 * `allowed` no es un booleano sino un número, para que la importación de CSV pueda
 * crear las filas que caben en lugar de rechazar el fichero entero.
 */
export async function checkQuota(
  orgId: string,
  kind: QuotaKind,
  wanted = 1,
): Promise<{ state: QuotaState; allowed: number; blocked: boolean }> {
  const quotas = await getOrgQuotas(orgId);
  const state = quotas[kind];
  const allowed = allowedToAdd(state, wanted);
  const blocked = allowed < wanted;

  if (blocked) {
    // Se mide el cupo y el plan, nunca el nombre de lo que se intentaba crear.
    await trackServer("quota_blocked", {
      organizationId: orgId,
      props: { kind, plan: quotas.plan, wanted, allowed },
    });
  }

  return { state, allowed, blocked };
}
