import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { sanitizeProps, type ProductEvent } from "./events";

/**
 * Telemetría desde contextos SIN sesión de usuario: webhooks de Stripe, crons.
 *
 * Ahí no hay cookies ni usuario que resolver, así que se escribe con el cliente
 * de `service_role`. Si la llave no está configurada (entorno local, preview sin
 * secretos) no hace nada: la telemetría es la última prioridad de un webhook,
 * cuya única obligación es acusar recibo a Stripe.
 *
 * Nunca lanza — un fallo al medir no debe provocar que Stripe reintente el
 * webhook en bucle.
 */
export async function trackService(
  event: ProductEvent,
  options: {
    organizationId?: string | null;
    props?: Record<string, unknown>;
  } = {},
): Promise<void> {
  try {
    const db = createServiceClient();
    if (!db) return;
    await db.from("product_events").insert({
      event,
      organization_id: options.organizationId ?? null,
      props: sanitizeProps(options.props),
    });
  } catch {
    // best-effort
  }
}
