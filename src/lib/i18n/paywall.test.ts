/**
 * Guard de los muros de pago (`PaidGate`) en las dos lenguas.
 *
 * Existe porque `tsc` solo protege la MITAD del problema. `Dictionary` se deriva
 * de `es`, así que olvidar una clave en `en` no compila — bien. Pero pegar el
 * texto español dentro de `en.ts` compila tan feliz, y es exactamente lo que
 * pasó: siete rutas de pago llevaban `feature`/`description` escritos a mano en
 * español, y en `/en` el muro salía mezclado sin que nada fallara.
 *
 * De ahí las dos mitades del test:
 *
 *  1. **Paridad real**: las descripciones de los ocho muros existen, no están
 *     vacías y **no son idénticas** entre `es` y `en`. Los nombres de sección sí
 *     pueden coincidir ("Policy packs" es igual en ambas), así que ahí solo se
 *     exige que no estén vacíos.
 *
 *  2. **Escaneo del código fuente**: ningún `layout.tsx` puede volver a pasarle
 *     a `PaidGate` un literal en `feature=` / `description=`. Es la única mitad
 *     que caza la regresión de verdad —añadir una ruta nueva con el copy a mano—
 *     porque el diccionario no puede saber lo que no le han pedido.
 *
 * Leer ficheros rompe la norma de "solo lógica pura" de esta suite, y es
 * deliberado: son nueve ficheros pequeños y un `readFileSync` síncrono, sin
 * render ni red, así que no toca ni la velocidad (<1 s) ni la fragilidad que
 * motivaban la norma. La alternativa era no tener guard.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { es } from "./dictionaries/es";
import { en } from "./dictionaries/en";
import type { Dictionary } from "./index";

/** Las ocho secciones con muro, con su ruta dentro del diccionario. */
const GATED = [
  {
    route: "/dashboard/plan",
    pick: (d: Dictionary) => d.dashboard.pages.plan,
  },
  {
    route: "/dashboard/packs",
    pick: (d: Dictionary) => d.dashboard.pages.packsPage,
  },
  {
    route: "/dashboard/vigilancia",
    pick: (d: Dictionary) => d.dashboard.pages.monitoring,
  },
  {
    route: "/dashboard/actividad",
    pick: (d: Dictionary) => d.dashboard.pages.activity,
  },
  { route: "/dashboard/equipo", pick: (d: Dictionary) => d.dashboard.team },
  { route: "/dashboard/gap", pick: (d: Dictionary) => d.dashboard.gap },
] as const;

/** Las dos Enterprise usan otra convención de nombres (`gate*`), heredada. */
const GATED_ENTERPRISE = [
  {
    route: "/dashboard/organizaciones",
    pick: (d: Dictionary) => d.dashboard.organizations,
  },
  {
    route: "/dashboard/seguridad",
    pick: (d: Dictionary) => d.dashboard.security,
  },
] as const;

describe("copy de los muros de pago", () => {
  for (const { route, pick } of GATED) {
    it(`${route} tiene nombre y descripción en ambas lenguas`, () => {
      for (const [locale, dict] of [
        ["es", es],
        ["en", en],
      ] as const) {
        const t = pick(dict);
        expect(t.paywallFeature.trim(), `${locale} ${route}`).not.toBe("");
        expect(t.paywallDesc.trim(), `${locale} ${route}`).not.toBe("");
      }
    });

    it(`${route} traduce la descripción (no queda español en /en)`, () => {
      expect(pick(en).paywallDesc).not.toBe(pick(es).paywallDesc);
    });
  }

  for (const { route, pick } of GATED_ENTERPRISE) {
    it(`${route} tiene nombre y descripción en ambas lenguas`, () => {
      for (const [locale, dict] of [
        ["es", es],
        ["en", en],
      ] as const) {
        const t = pick(dict);
        expect(t.gateFeature.trim(), `${locale} ${route}`).not.toBe("");
        expect(t.gateDescription.trim(), `${locale} ${route}`).not.toBe("");
      }
    });

    it(`${route} traduce la descripción (no queda español en /en)`, () => {
      expect(pick(en).gateDescription).not.toBe(pick(es).gateDescription);
    });
  }
});

/** Recoge todos los `layout.tsx` bajo `src/app`, sin depender de un glob. */
function findLayouts(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) findLayouts(full, out);
    else if (entry.name === "layout.tsx") out.push(full);
  }
  return out;
}

describe("ningún muro de pago lleva el copy escrito a mano", () => {
  const layouts = findLayouts(join(process.cwd(), "src", "app"));

  // Si el escaneo no encuentra nada (ruta mal montada, refactor de carpetas), el
  // test pasaría en vacío y diría "todo bien" sin haber mirado nada.
  it("encuentra los layouts que dice escanear", () => {
    expect(layouts.length).toBeGreaterThanOrEqual(9);
  });

  for (const file of layouts) {
    const src = readFileSync(file, "utf8");
    if (!src.includes("PaidGate")) continue;
    const rel = file.slice(file.indexOf("src/app"));

    it(`${rel} saca feature/description del diccionario`, () => {
      // `feature="algo"` con comillas es un literal; `feature={t.x}` no lo es.
      expect(src, "feature literal").not.toMatch(/\bfeature=["']/);
      expect(src, "description literal").not.toMatch(/\bdescription=["']/);
    });
  }
});
