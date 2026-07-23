import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getIsPlatformAdmin } from "@/lib/data";
import { getOrgSubscription } from "@/lib/billing/subscription";

/** Niveles de plan, en orden de acceso creciente. */
export type PlanTier = "free" | "preparacion" | "enterprise";

const RANK: Record<PlanTier, number> = { free: 0, preparacion: 1, enterprise: 2 };

export const TIER_LABEL: Record<PlanTier, string> = {
  free: "Diagnóstico",
  preparacion: "Preparación",
  enterprise: "Enterprise",
};

export function planRank(t: PlanTier): number {
  return RANK[t] ?? 0;
}

function coerceTier(value: unknown): PlanTier | null {
  return value === "free" || value === "preparacion" || value === "enterprise"
    ? value
    : null;
}

/**
 * Plan EFECTIVO de la organización activa.
 *
 * Reglas (de mayor a menor prioridad):
 *  1. Modo demo (sin Supabase) → 'enterprise' (la demo es una muestra completa).
 *  2. Staff de Attesta (platform_admins) → 'enterprise' (para operar/soportar).
 *  3. Suscripción Stripe activa/en prueba → al menos 'preparacion'.
 *  4. Columna `organizations.plan` (por defecto 'free').
 *
 * Degradación segura: si la columna `plan` aún no existe (migración 0018 sin
 * aplicar), devuelve 'enterprise' para NO bloquear a nadie por sorpresa. El
 * bloqueo por plan empieza a aplicar solo cuando se aplica la migración.
 */
export const getOrgPlan = cache(async (orgId: string): Promise<PlanTier> => {
  if (!isSupabaseConfigured) return "enterprise";

  try {
    if (await getIsPlatformAdmin()) return "enterprise";
  } catch {
    // Si no se puede comprobar, seguimos con la resolución normal.
  }

  let plan: PlanTier = "free";
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("plan")
      .eq("id", orgId)
      .maybeSingle();
    if (error) {
      // Solo si la columna/tabla aún NO existe (migración sin aplicar) damos
      // acceso completo, para no bloquear a nadie por sorpresa. Ante cualquier
      // OTRO error fallamos CERRADO a 'free' (no regalar entitlements por un
      // fallo transitorio); la suscripción activa de abajo aún puede subir el tier.
      if (error.code === "42703" || error.code === "42P01") return "enterprise";
      plan = "free";
    } else {
      plan = coerceTier(data?.plan) ?? "free";
    }
  } catch {
    // Error inesperado: conservador (free). No fallar abierto en entitlements.
    plan = "free";
  }

  // Una suscripción Stripe activa sube a Preparación como mínimo.
  if (planRank(plan) < planRank("preparacion")) {
    const sub = await getOrgSubscription(orgId);
    if (sub && (sub.status === "active" || sub.status === "trialing")) {
      plan = "preparacion";
    }
  }

  return plan;
});

/** ¿La organización alcanza (o supera) el nivel de plan requerido? */
export async function orgHasTier(
  orgId: string,
  required: PlanTier,
): Promise<boolean> {
  const plan = await getOrgPlan(orgId);
  return planRank(plan) >= planRank(required);
}
