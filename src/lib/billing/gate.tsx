import type { ReactNode } from "react";
import { getActiveOrg } from "@/lib/data/context";
import { orgHasTier, type PlanTier } from "@/lib/billing/plan";
import { Paywall, type PaywallStat } from "@/components/dashboard/Paywall";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";
import { trackServer } from "@/lib/telemetry/server";

/**
 * Envuelve el contenido de una sección con requisito de plan. Si la organización
 * no alcanza el nivel requerido, muestra el paywall en su lugar.
 *
 * En modo demo (sin backend) deja pasar: la demo es una muestra completa. En
 * modo conectado, el nivel efectivo lo resuelve `getOrgPlan` (staff, Stripe,
 * columna `plan`), con degradación segura si la migración 0018 no está aplicada.
 */
export async function PaidGate({
  feature,
  description,
  requires = "preparacion",
  stats,
  children,
}: {
  feature: string;
  description?: string;
  requires?: PlanTier;
  /**
   * Cifras reales de la organización para el TEASER del paywall ("ya tienes 12
   * brechas abiertas"). Se pasa como función y NO como valor porque solo se
   * resuelve cuando el muro bloquea: así el usuario de pago no paga las queries
   * del teaser que nunca va a ver.
   */
  stats?: () => Promise<PaywallStat[]>;
  children: ReactNode;
}) {
  const orgId = await getActiveOrg();
  if (orgId && !(await orgHasTier(orgId, requires))) {
    const dict = getDictionary(await resolveLocale());
    let resolved: PaywallStat[] | undefined;
    if (stats) {
      // Si el teaser falla (tabla ausente, etc.) el muro se muestra igual: es
      // un adorno de conversión, nunca un motivo para romper la página.
      try {
        const s = await stats();
        resolved = s.length > 0 ? s : undefined;
      } catch {
        resolved = undefined;
      }
    }
    // Señal de monetización: el muro se mostró DE VERDAD (no "la ruta existe").
    // `feature` es una etiqueta de sección, no un dato del cliente.
    await trackServer("paywall_viewed", {
      organizationId: orgId,
      props: { tier: requires },
    });

    return (
      <Paywall
        feature={feature}
        description={description}
        tier={requires}
        stats={resolved}
        t={dict.dashboard.paywall}
      />
    );
  }
  return <>{children}</>;
}
