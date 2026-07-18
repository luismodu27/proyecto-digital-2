import type { ReactNode } from "react";
import { getActiveOrg } from "@/lib/data/context";
import { orgHasAccess } from "@/lib/billing/subscription";
import { Paywall } from "@/components/dashboard/Paywall";

/**
 * Envuelve el contenido de una sección de pago. Si la organización no tiene
 * suscripción activa (y el cobro está en vigor), muestra el paywall en su lugar.
 * En modo demo o con Stripe sin configurar, deja pasar (acceso abierto).
 */
export async function PaidGate({
  feature,
  description,
  children,
}: {
  feature: string;
  description?: string;
  children: ReactNode;
}) {
  const orgId = await getActiveOrg();
  if (orgId && !(await orgHasAccess(orgId))) {
    return <Paywall feature={feature} description={description} />;
  }
  return <>{children}</>;
}
