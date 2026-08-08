import { describe, expect, it } from "vitest";
import { canManageBilling } from "./roles";

/**
 * La facturación es de owner/admin. Este test fija la EXPECTATIVA de negocio: un
 * `member` NO puede abrir el portal de Stripe ni cancelar la suscripción de la
 * organización. Es la clase de regla que compila igual de bien invertida.
 */
describe("canManageBilling", () => {
  it("owner y admin pueden", () => {
    expect(canManageBilling("owner")).toBe(true);
    expect(canManageBilling("admin")).toBe(true);
  });

  it("member NO puede (no debe cancelar el plan de la organización)", () => {
    expect(canManageBilling("member")).toBe(false);
  });

  it("sin rol (sin sesión/org) NO puede", () => {
    expect(canManageBilling(null)).toBe(false);
    expect(canManageBilling(undefined)).toBe(false);
  });
});
