import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { NAV, type PlanTier } from "./nav";

/**
 * El candado de la navegación y el muro de pago tienen que decir lo MISMO.
 *
 * Son dos verdades escritas en sitios distintos: `requires` en el catálogo de
 * navegación decide si sale la insignia de plan, y el `PaidGate` del
 * `layout.tsx` de esa ruta decide si al entrar se ve el muro. Nada las obliga a
 * coincidir, y las dos formas de divergir son malas:
 *
 *  - Candado sin muro → prometemos que algo es de pago y luego se entra gratis.
 *  - Muro sin candado → la sección parece disponible, el usuario la pulsa y se
 *    choca. Peor aún, el upsell no se ve donde se decide (la navegación).
 *
 * Este test las cruza en las dos direcciones. Es también el que congela la
 * decisión de que los ítems bloqueados **navegan** al muro: ahí es donde se
 * emite `paywall_viewed`, la única señal de monetización del embudo.
 */

const DASHBOARD = join(process.cwd(), "src", "app", "dashboard");

/** Ruta de app-router → fichero de layout de esa sección. */
function layoutFor(href: string): string {
  const segment = href.replace(/^\/dashboard\/?/, "");
  return join(DASHBOARD, segment, "layout.tsx");
}

/**
 * Tier exigido por el `PaidGate` de un layout (`preparacion` es el defecto).
 *
 * Se busca `<PaidGate` y no `PaidGate` a secas: la línea del `import` contiene
 * el nombre igualmente, así que la comprobación laxa daba por bueno un layout
 * que importa el muro y no lo renderiza. Se descubrió inyectando esa mutación
 * exacta, y no la detectaba.
 */
function rendersGate(source: string): boolean {
  return /<PaidGate[\s/>]/.test(source);
}

function gateTier(source: string): PlanTier | null {
  if (!rendersGate(source)) return null;
  const explicit = source.match(/requires=["']([a-z]+)["']/);
  return (explicit?.[1] as PlanTier) ?? "preparacion";
}

const gatedItems = NAV.filter((i) => i.requires);

describe("el candado de la navegación cuadra con el muro de pago", () => {
  it("hay destinos con requisito que comprobar", () => {
    // Sin esta guarda, borrar todos los `requires` dejaría el bloque de abajo
    // sin iteraciones y el test pasaría en verde sin comprobar nada.
    expect(gatedItems.length).toBeGreaterThanOrEqual(8);
  });

  for (const item of gatedItems) {
    it(`${item.key}: su layout existe y lleva PaidGate del mismo plan`, () => {
      const file = layoutFor(item.href);
      expect(existsSync(file), `falta ${file}`).toBe(true);
      const source = readFileSync(file, "utf8");
      expect(gateTier(source), `${item.key} · tier del muro`).toBe(item.requires);
    });
  }

  it("todo layout con muro corresponde a un destino con candado", () => {
    // La dirección contraria: una sección de pago que no aparezca bloqueada en
    // la navegación es upsell que se pierde.
    const withGate: string[] = [];
    for (const entry of readdirSync(DASHBOARD, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const file = join(DASHBOARD, entry.name, "layout.tsx");
      if (!existsSync(file)) continue;
      if (rendersGate(readFileSync(file, "utf8"))) withGate.push(entry.name);
    }
    const navSegments = gatedItems.map((i) => i.href.replace("/dashboard/", ""));
    expect(withGate.sort()).toEqual(navSegments.sort());
  });
});

describe("los destinos bloqueados NAVEGAN al muro", () => {
  const sidebar = readFileSync(
    join(process.cwd(), "src", "components", "dashboard", "Sidebar.tsx"),
    "utf8",
  );

  it("nada desactiva el enlace de un destino bloqueado", () => {
    // Deshabilitarlos parece un detalle de pulido y apagaría `paywall_viewed`
    // (el paso de monetización del embudo) y el teaser del muro con las cifras
    // reales de la organización, que es lo que de verdad convierte. Además
    // `aria-disabled` mentiría: los enlaces son operables y deben serlo.
    expect(sidebar).not.toMatch(/aria-disabled/);
    expect(sidebar).not.toMatch(/pointer-events-none/);
  });

  it("la fila de navegación no intercepta el clic", () => {
    // Se acota a `NavRow`, que es donde se renderiza el `<Link>`. El `<dialog>`
    // sí usa `preventDefault()` legítimamente (en `onCancel`, para que un solo
    // Escape no cierre a la vez el menú de cuenta y el cajón), así que buscarlo
    // en todo el fichero daría un falso positivo.
    const start = sidebar.indexOf("function NavRow(");
    expect(start, "no se encontró NavRow").toBeGreaterThan(-1);
    const end = sidebar.indexOf("export function Sidebar(", start);
    expect(end, "no se encontró el final de NavRow").toBeGreaterThan(start);
    expect(sidebar.slice(start, end)).not.toContain("preventDefault");
  });
});
