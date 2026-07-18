/**
 * Configuración de Stripe (cobro por suscripción).
 *
 * Todo env-gated: si no hay `STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID`, el cobro y
 * el bloqueo por suscripción quedan DESACTIVADOS (la app funciona como antes).
 * Así el deploy no bloquea a nadie hasta que el fundador conecte Stripe.
 */

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID ?? "";
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/** Precio mostrado en la UI (informativo). Moneda: USD. */
export const PLAN_PRICE_LABEL = process.env.NEXT_PUBLIC_PLAN_PRICE ?? "$350";

/** ¿Está Stripe listo para cobrar? (clave secreta + precio) */
export const isStripeConfigured =
  STRIPE_SECRET_KEY.length > 0 && STRIPE_PRICE_ID.length > 0;
