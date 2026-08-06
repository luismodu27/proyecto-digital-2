import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guard de regresión sobre el CÓDIGO FUENTE de las Server Actions.
 *
 * Los ayudantes de `./form` no sirven de nada si la próxima acción que alguien
 * escriba vuelve a hacer `String(formData.get("note") ?? "").trim()`. Eso es
 * justo lo que pasó: el patrón estaba copiado en cuatro ficheros y ninguno tenía
 * tope de longitud, así que un miembro autenticado podía escribir megabytes en
 * cualquier campo de texto. Arreglar los cuatro sin dejar un guard solo compra
 * tiempo hasta el quinto.
 *
 * Escanea ficheros (como el guard de copy prohibido y el de honestidad del
 * diccionario). Es la excepción documentada a "la suite es de lógica pura":
 * cuesta milisegundos y vigila una propiedad que ningún test de unidad puede ver.
 *
 * Lo que NO comprueba: que el tope elegido sea el adecuado. Eso es criterio, y
 * vive en la revisión. Esto solo garantiza que **hay** uno.
 */

const DIR = join(process.cwd(), "src/lib/data");

/** Patrón peligroso: leer del formulario y quedarse la cadena tal cual. */
const RAW_READ =
  /String\(\s*(?:form|formData)\.get\([^)]*\)\s*\?\?\s*""\s*\)\s*\.trim\(\)/g;

/**
 * Excepción legítima: leer en crudo para compararlo **acto seguido** contra un
 * catálogo cerrado (`priority`, `status`, `role`…). Ahí la cadena no se guarda,
 * se usa para elegir, y el catálogo ya acota lo que puede valer.
 */
const ENUM_LIKE =
  /\b(priority|status|role|source|seriousness|target|intent|kind|packId|framework)\b/;

function actionFiles(): string[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
    .filter((f) => f === "actions.ts" || f.includes("-actions"));
}

describe("guard · las Server Actions no leen texto sin tope", () => {
  it("encuentra los ficheros de acciones (si no, el guard no vigila nada)", () => {
    const files = actionFiles();
    expect(files.length).toBeGreaterThanOrEqual(10);
    expect(files).toContain("actions.ts");
  });

  it("ningún fichero de acciones lee texto libre sin pasar por ./form", () => {
    const offenders: string[] = [];
    for (const file of actionFiles()) {
      const src = readFileSync(join(DIR, file), "utf8");
      for (const line of src.split("\n")) {
        RAW_READ.lastIndex = 0;
        if (!RAW_READ.test(line)) continue;
        if (ENUM_LIKE.test(line)) continue;
        offenders.push(`${file}: ${line.trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  /**
   * Autoprueba: un guard que no puede fallar no protege nada. Se le da una línea
   * infractora y una legítima y se comprueba que distingue — así, si alguien
   * debilita la expresión regular, este test cae con ella.
   */
  it("se autoprueba: caza el patrón peligroso y deja pasar el legítimo", () => {
    const bad = 'detail: String(formData.get("detail") ?? "").trim() || null,';
    // Sí cae en el patrón, pero es una lectura para elegir de un catálogo.
    const okEnum = 'const status = String(formData.get("status") ?? "").trim();';
    const okHelper = 'detail: text(formData.get("detail"), MAX_NOTE),';

    RAW_READ.lastIndex = 0;
    expect(RAW_READ.test(bad)).toBe(true);
    expect(ENUM_LIKE.test(bad)).toBe(false);

    RAW_READ.lastIndex = 0;
    expect(RAW_READ.test(okEnum)).toBe(true);
    expect(ENUM_LIKE.test(okEnum)).toBe(true);

    RAW_READ.lastIndex = 0;
    expect(RAW_READ.test(okHelper)).toBe(false);
  });
});
