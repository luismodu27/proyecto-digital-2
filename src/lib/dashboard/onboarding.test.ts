import { describe, expect, it } from "vitest";
import { shouldShowGuide } from "./onboarding";

/**
 * Fija la regla de «una bienvenida a la vez». Sin este test, cualquiera puede
 * volver a lanzar el modal sobre la pantalla de bienvenida y nada lo notaría:
 * las dos superficies viven en ficheros distintos y ninguna sabe de la otra.
 */
describe("qué bienvenida se enseña", () => {
  it("con el inventario vacío NO sale el modal: manda la pantalla de bienvenida", () => {
    expect(shouldShowGuide({ guideSeen: false, systemCount: 0 })).toBe(false);
  });

  it("con sistemas dados de alta sí sale, una vez", () => {
    expect(shouldShowGuide({ guideSeen: false, systemCount: 1 })).toBe(true);
  });

  it("si ya se vio, no vuelve a salir aunque haya sistemas", () => {
    expect(shouldShowGuide({ guideSeen: true, systemCount: 5 })).toBe(false);
  });

  it("«visto» gana sobre cualquier recuento", () => {
    // El orden importa: mirar primero el recuento y luego el visto haría que
    // una cuenta vacía «reactivase» el recorrido de alguien que ya lo cerró.
    expect(shouldShowGuide({ guideSeen: true, systemCount: 0 })).toBe(false);
  });
});
