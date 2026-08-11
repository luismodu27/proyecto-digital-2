import { describe, expect, it } from "vitest";
import {
  DUNNING_GRACE_DAYS,
  isInDunning,
  subscriptionGrantsAccess,
} from "./dunning";

/**
 * Estas pruebas fijan la EXPECTATIVA de negocio de la morosidad, no la
 * implementación: un pago fallido (`past_due`) NO corta el acceso al instante —el
 * cliente lo conserva mientras Stripe reintenta— y solo `unpaid`/`canceled`/etc.
 * lo retiran. Es exactamente la clase de regla que compila igual de bien
 * invertida (un `active`-only silencioso expulsaría a un cliente que paga).
 *
 * Ancla temporal fija (nada de `Date.now()`): periodo pagado hasta el 1-ago-2026.
 */
const PERIOD_END = "2026-08-01T00:00:00.000Z";
const within = new Date("2026-08-10T00:00:00.000Z"); // +9 d < gracia
const atEdge = new Date("2026-08-15T00:00:00.000Z"); // +14 d = límite exacto
const beyond = new Date("2026-08-20T00:00:00.000Z"); // +19 d > gracia

describe("subscriptionGrantsAccess", () => {
  it("active y trialing dan acceso siempre (sin mirar fechas)", () => {
    expect(subscriptionGrantsAccess("active", null, beyond)).toBe(true);
    expect(subscriptionGrantsAccess("trialing", null, beyond)).toBe(true);
  });

  it("past_due DENTRO de la gracia conserva el acceso (no cortar a quien paga)", () => {
    expect(subscriptionGrantsAccess("past_due", PERIOD_END, within)).toBe(true);
    // El límite (fin de periodo + GRACE) es inclusivo.
    expect(subscriptionGrantsAccess("past_due", PERIOD_END, atEdge)).toBe(true);
  });

  it("past_due PASADA la gracia deja de dar acceso (tope de seguridad)", () => {
    expect(subscriptionGrantsAccess("past_due", PERIOD_END, beyond)).toBe(false);
  });

  it("past_due sin fecha de periodo confía en el estado y concede", () => {
    expect(subscriptionGrantsAccess("past_due", null, beyond)).toBe(true);
    expect(subscriptionGrantsAccess("past_due", "no-es-fecha", beyond)).toBe(true);
  });

  it("unpaid, canceled y demás NO dan acceso (impago definitivo)", () => {
    for (const s of [
      "unpaid",
      "canceled",
      "incomplete",
      "incomplete_expired",
      "paused",
      "inactive",
      "loquesea",
    ]) {
      expect(subscriptionGrantsAccess(s, PERIOD_END, within)).toBe(false);
    }
  });

  it("sin estado (null/undefined) NO da acceso", () => {
    expect(subscriptionGrantsAccess(null, PERIOD_END, within)).toBe(false);
    expect(subscriptionGrantsAccess(undefined, PERIOD_END, within)).toBe(false);
  });

  it("la gracia son 14 días", () => {
    // Blinda la constante: un día antes del borde concede, un día después no.
    const dayBefore = new Date("2026-08-14T12:00:00.000Z");
    const dayAfter = new Date("2026-08-15T12:00:00.000Z");
    expect(DUNNING_GRACE_DAYS).toBe(14);
    expect(subscriptionGrantsAccess("past_due", PERIOD_END, dayBefore)).toBe(true);
    expect(subscriptionGrantsAccess("past_due", PERIOD_END, dayAfter)).toBe(false);
  });
});

describe("isInDunning", () => {
  it("past_due está en morosidad (acceso con aviso)", () => {
    expect(isInDunning("past_due")).toBe(true);
  });

  it("los estados sanos y los terminales NO están en morosidad", () => {
    for (const s of ["active", "trialing", "unpaid", "canceled", null, undefined]) {
      expect(isInDunning(s)).toBe(false);
    }
  });
});
