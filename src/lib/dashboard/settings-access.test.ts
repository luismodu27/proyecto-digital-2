import { describe, expect, it } from "vitest";
import type { MemberRole } from "@/lib/mock-data";
import { canEditSettings, settingsAccess } from "./settings-access";

/**
 * Regla de autorización de los ajustes de organización. Se prueba aquí porque
 * vive en dos pantallas (vigilancia e incidentes) y, hasta ahora, cada una la
 * resolvía por su cuenta con un `role === "owner" || role === "admin"` suelto.
 *
 * Recordatorio de alcance: esto NO protege nada. Las funciones SQL
 * (`set_org_jurisdictions`, `set_review_cadence`) comprueban el rol dentro. Esto
 * solo evita ofrecer un botón que iba a fallar.
 */
describe("quién puede cambiar los ajustes de organización", () => {
  const table: [MemberRole | null, string][] = [
    ["owner", "manage"],
    ["admin", "manage"],
    ["member", "readonly"],
    [null, "readonly"],
  ];

  for (const [role, expected] of table) {
    it(`conectado · rol ${role ?? "sin rol"} → ${expected}`, () => {
      expect(settingsAccess({ role, isConnected: true })).toBe(expected);
    });
  }

  it("un miembro raso NUNCA obtiene permiso de gestión", () => {
    // La aserción que de verdad importa: si alguien invierte la condición o
    // añade "member" a la lista, esto rompe.
    expect(settingsAccess({ role: "member", isConnected: true })).not.toBe("manage");
  });

  it("en demo el control se muestra: la demo enseña el producto entero", () => {
    // Aunque el rol de demo sea owner, el modo se distingue: la acción avisa de
    // que hace falta conectar en vez de fingir que guardó algo.
    expect(settingsAccess({ role: "owner", isConnected: false })).toBe("demo");
    expect(settingsAccess({ role: null, isConnected: false })).toBe("demo");
  });
});

describe("qué se renderiza", () => {
  it("el formulario sale en gestión y en demo, nunca en solo lectura", () => {
    expect(canEditSettings("manage")).toBe(true);
    expect(canEditSettings("demo")).toBe(true);
    expect(canEditSettings("readonly")).toBe(false);
  });
});
