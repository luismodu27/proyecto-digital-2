import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logDataFallback, logIncident } from "@/lib/observability/log";

export type OrgSubscription = {
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

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
      if (error) {
        // Un fallo de la tabla `subscriptions` degradaba a "sin suscripción" SIN
        // una línea de log: una org que paga podía verse como free y nadie se
        // enteraba (su hermano `getOrgPlan` sí registra la degradación). `!data`
        // aparte: no tener fila es lo normal, no un error. `logDataFallback`
        // clasifica solo (0017 sin aplicar → warn; error real → incidente).
        logDataFallback("getOrgSubscription", error, "sin 0017 no hay suscripciones");
        return null;
      }
      if (!data) return null;
      return {
        status: data.status,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        priceId: data.price_id,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
      };
    } catch (err) {
      // Fallo inesperado (createClient, red): degradamos a "sin suscripción",
      // pero se registra — degradar el plan de facturación en silencio es
      // justamente lo que no debe pasar inadvertido.
      logIncident("getOrgSubscription", err, "degradado a sin suscripción");
      return null;
    }
  },
);
