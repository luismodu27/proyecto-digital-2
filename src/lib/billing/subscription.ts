import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isStripeConfigured } from "@/lib/stripe/config";

export type OrgSubscription = {
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

const ACTIVE = new Set(["active", "trialing"]);

/**
 * ¿Se aplica el bloqueo por suscripción? Solo cuando hay backend real Y Stripe
 * configurado. Si falta cualquiera de los dos, la app queda abierta (como antes
 * de conectar el cobro): así el deploy nunca bloquea a nadie por sorpresa.
 */
export function isBillingEnforced(): boolean {
  return isSupabaseConfigured && isStripeConfigured;
}

/** Suscripción de la organización (o null si no hay / tabla ausente). */
export const getOrgSubscription = cache(
  async (orgId: string): Promise<OrgSubscription | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("subscriptions")
        .select(
          "status, stripe_customer_id, stripe_subscription_id, price_id, current_period_end, cancel_at_period_end",
        )
        .eq("organization_id", orgId)
        .maybeSingle();
      if (error || !data) return null;
      return {
        status: data.status,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        priceId: data.price_id,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
      };
    } catch {
      // Tabla aún no creada u otro fallo: degradamos a "sin suscripción".
      return null;
    }
  },
);

/**
 * ¿La organización puede usar las funciones de pago?
 * - Si el cobro no se aplica (demo o Stripe sin configurar) → siempre sí.
 * - Si se aplica → solo con suscripción activa/en prueba.
 */
export async function orgHasAccess(orgId: string): Promise<boolean> {
  if (!isBillingEnforced()) return true;
  const sub = await getOrgSubscription(orgId);
  return !!sub && ACTIVE.has(sub.status);
}
