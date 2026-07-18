import type { ReactNode } from "react";
import { getActiveOrg } from "@/lib/data/context";
import { orgHasTier, type PlanTier } from "@/lib/billing/plan";
import { Paywall } from "@/components/dashboard/Paywall";

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
  children,
}: {
  feature: string;
  description?: string;
  requires?: PlanTier;
  children: ReactNode;
}) {
  const orgId = await getActiveOrg();
  if (orgId && !(await orgHasTier(orgId, requires))) {
    return <Paywall feature={feature} description={description} tier={requires} />;
  }
  return <>{children}</>;
}
