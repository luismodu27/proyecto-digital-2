/**
 * Morosidad (dunning): acceso durante un pago fallido.
 *
 * COMPORTAMIENTO ESTÁNDAR DE LA INDUSTRIA. Un pago fallido NO corta el acceso al
 * instante. Cuando falla un cobro, Stripe marca la suscripción `past_due` y
 * REINTENTA por su cuenta durante ~2 semanas ("Smart Retries"), avisando al
 * cliente por correo. Mientras dura ese ciclo, el cliente CONSERVA el acceso.
 * Solo cuando Stripe agota los reintentos y CANCELA la suscripción (`canceled`)
 * —o la deja `unpaid`— se retira el acceso.
 *
 * El motivo: cortar a un cliente que paga por un fallo transitorio de tarjeta
 * (un límite momentáneo, una tarjeta que caducó y se renovó, un banco que declinó
 * y luego aprobó) es peor para el negocio que unos días de servicio en riesgo. Es
 * lo que hacen Stripe Billing, Notion, Linear, Vanta y compañía.
 *
 * ANTES este producto hacía lo contrario: `getOrgPlan` solo desbloqueaba con
 * estado `active`/`trialing`, así que en el instante en que Stripe marcaba
 * `past_due` el cliente caía a 'free' y veía la pantalla "Suscríbete" como si
 * nunca hubiera pagado. Esta lógica lo corrige.
 *
 * Lógica PURA a propósito (sin Supabase, sin `Date.now()` implícito: el instante
 * entra como parámetro), para poder fijarla con tests como el resto de reglas de
 * negocio del repo.
 */

/**
 * Días de gracia MÁS ALLÁ del fin del periodo ya pagado (`current_period_end`).
 *
 * Es un TOPE DE SEGURIDAD, no el reloj principal: normalmente Stripe cancela antes
 * de que se agote, y entonces el corte lo decide el ESTADO (`canceled`), no esta
 * fecha. Existe para que un webhook de cancelación PERDIDO no regale acceso de
 * forma indefinida a una suscripción que se quedó colgada en `past_due`. 14 días
 * cubren con holgura la ventana de reintentos por defecto de Stripe.
 */
export const DUNNING_GRACE_DAYS = 14;

/** Estados en los que Stripe sigue reintentando el cobro: moroso, pero con acceso. */
const DUNNING_STATUSES = new Set<string>(["past_due"]);

/** Estados sanos: acceso pleno, sin matices. */
const HEALTHY_STATUSES = new Set<string>(["active", "trialing"]);

/**
 * ¿La suscripción está en el ciclo de reintentos de Stripe (morosa pero aún con
 * acceso)? Lo usa la UI para mostrar el aviso de "actualiza tu método de pago"
 * sin cortar nada.
 */
export function isInDunning(status: string | null | undefined): boolean {
  return status != null && DUNNING_STATUSES.has(status);
}

/**
 * ¿Esta suscripción da acceso de pago AHORA?
 *
 *  - `active` / `trialing` → sí, siempre.
 *  - `past_due` → sí MIENTRAS dure la gracia: hasta `current_period_end + GRACE`.
 *    Si no hay fecha de periodo (o es ilegible), se confía en el estado y se
 *    concede: nunca cortar a ciegas a quien podría estar pagando.
 *  - cualquier otro (`unpaid`, `canceled`, `incomplete`, `incomplete_expired`,
 *    `paused`, `inactive`, desconocido) → no.
 *
 * @param now  instante de referencia (se inyecta para poder testear la ventana).
 */
export function subscriptionGrantsAccess(
  status: string | null | undefined,
  currentPeriodEndISO: string | null | undefined,
  now: Date,
): boolean {
  if (status == null) return false;
  if (HEALTHY_STATUSES.has(status)) return true;
  if (!DUNNING_STATUSES.has(status)) return false;

  // past_due: dentro de la ventana de gracia anclada al periodo ya pagado.
  if (!currentPeriodEndISO) return true; // sin fecha → confiar en el estado
  const end = Date.parse(currentPeriodEndISO);
  if (Number.isNaN(end)) return true; // fecha ilegible → no castigar al cliente
  const deadline = end + DUNNING_GRACE_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() <= deadline;
}
