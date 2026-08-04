import { describe, expect, it } from "vitest";
import { buildCsp, generateNonce } from "./csp";

/**
 * Reimplementación EXACTA de cómo Next extrae el nonce, copiada de
 * `next/src/server/app-render/get-script-nonce-from-header.tsx`.
 *
 * Está aquí porque el enganche entre nuestro middleware y Next es un contrato
 * silencioso, y **se verificó ejecutándolo, no leyéndolo**. Lo que pasa de
 * verdad: Next busca el nonce en la política que el middleware manda como
 * `Content-Security-Policy` (la aplicada), no en la de Report-Only ni en
 * `x-nonce`, y si lo encuentra se lo pone él solo a sus ~44 scripts inline (el
 * payload RSC). Como la política aplicada hoy es la "sin riesgo" y no lleva
 * `script-src`, no hay nonce que encontrar y los scripts salen sin él. Es
 * coherente —no se está aplicando nada— pero tiene dos consecuencias que no son
 * obvias y que conviene no volver a deducir mal:
 *
 *  1. Al promover la estricta a `enforce`, el nonce pasa a viajar en esa
 *     cabecera y Next empieza a inyectarlo **solo**. Medido: de 44 scripts
 *     inline sin nonce a 45 con él, sin tocar una línea de la aplicación.
 *  2. Por tanto, las violaciones de `script-src` que el Report-Only reporta hoy
 *     son ESPERADAS y desaparecen al promover. Leerlas como "no se puede
 *     promover" sería justo la conclusión contraria a la verdadera.
 *
 * Lo que este test protege: que el nonce siga siendo **encontrable** por el
 * algoritmo de Next en la política estricta. Si alguien reordena directivas,
 * quita el `script-src` o cambia el formato del nonce, la promoción dejaría de
 * funcionar en silencio — y se descubriría con la app entera sin hidratar.
 */
function getScriptNonceFromHeader(cspHeaderValue: string): string | undefined {
  const CSP_NONCE_SOURCE_REGEX = /^'nonce-([A-Za-z0-9+/_-]+={0,2})'$/;
  const directives = cspHeaderValue.split(";").map((d) => d.trim());
  const directive =
    directives.find((d) => d.startsWith("script-src")) ||
    directives.find((d) => d.startsWith("default-src"));
  if (!directive) return;
  for (const source of directive.split(/\s+/).slice(1)) {
    const match = source.trim().match(CSP_NONCE_SOURCE_REGEX);
    if (match) return match[1];
  }
}

describe("generateNonce", () => {
  it("produce base64 que encaja en el patrón que Next reconoce", () => {
    for (let i = 0; i < 50; i++) {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
      // El nonce debe sobrevivir al viaje de ida y vuelta por la cabecera.
      expect(getScriptNonceFromHeader(buildCsp(nonce).reportOnly)).toBe(nonce);
    }
  });

  it("no repite (es aleatorio, no un contador)", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateNonce()));
    expect(seen.size).toBe(200);
  });
});

describe("buildCsp · contrato con Next", () => {
  /** EL TEST QUE IMPORTA. Ver la nota de arriba. */
  it("la política que el middleware pone en la request deja ver el nonce a Next", () => {
    const nonce = "abc123+/xyz==";
    expect(getScriptNonceFromHeader(buildCsp(nonce).reportOnly)).toBe(nonce);
  });

  it("el nonce va en script-src, no colgado de cualquier otra directiva", () => {
    const { reportOnly } = buildCsp("N0NCE");
    const scriptSrc = reportOnly
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("script-src"));
    expect(scriptSrc).toContain("'nonce-N0NCE'");
  });

  /**
   * La política `enforced` es la de directivas sin riesgo que YA se aplican. No
   * lleva `script-src` a propósito, y de ahí sale la asimetría de arriba: sin
   * `script-src` no hay nonce en la cabecera aplicada, y sin nonce en la cabecera
   * aplicada Next no se lo pone a sus scripts. Las dos cosas van juntas y se
   * arreglan juntas al promover.
   */
  it("la política aplicada sigue sin tocar los scripts (por eso hoy no hay nonce que inyectar)", () => {
    const { enforced } = buildCsp("N0NCE");
    expect(enforced).not.toContain("script-src");
    expect(enforced).not.toContain("default-src");
    // Y lo que sí trae, que es lo que protege hoy sin poder romper nada.
    for (const d of ["frame-ancestors 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) {
      expect(enforced).toContain(d);
    }
  });

  it("la política estricta cierra el default y permite lo que la app necesita", () => {
    const { reportOnly } = buildCsp("N0NCE");
    expect(reportOnly).toContain("default-src 'self'");
    expect(reportOnly).toContain("https://*.supabase.co");
    expect(reportOnly).toContain("https://js.stripe.com");
  });
});
