import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DRAWER_ID } from "./nav";

/**
 * Escaneos estáticos del cajón de navegación.
 *
 * El cajón es un `<dialog>` abierto con `showModal()`, y casi todo lo que lo
 * hace correcto —trampa de foco, inertización del resto del árbol, Escape,
 * devolución del foco, capa superior— lo aporta el navegador, no nuestro código.
 * Eso es una virtud, pero deja invariantes que solo viven en el marcado y en el
 * CSS: precisamente lo que esta suite (node, sin jsdom) no puede ejecutar.
 *
 * De ahí el escaneo de fuentes. Mismo precedente y misma justificación que en
 * `paywall.test.ts`: leer unos ficheros pequeños de forma síncrona no toca ni la
 * velocidad ni la fragilidad que motivan la norma de "solo lógica pura", y es la
 * única forma de que estas reglas no se rompan en silencio.
 */

const SIDEBAR = readFileSync(
  join(process.cwd(), "src", "components", "dashboard", "Sidebar.tsx"),
  "utf8",
);
const CSS = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");

describe("marcado del cajón", () => {
  it("los ficheros escaneados no están vacíos", () => {
    expect(SIDEBAR.length).toBeGreaterThan(1000);
    expect(CSS.length).toBeGreaterThan(1000);
  });

  it("EL CRÍTICO: el <dialog> no lleva ninguna utilidad de display", () => {
    // `dialog:not([open]) { display: none }` es una regla del NAVEGADOR. Una
    // regla de autor la vence por ORIGEN de cascada —no por especificidad—, así
    // que un `flex` en el className del propio `<dialog>` dejaría el cajón
    // permanentemente renderizado: invisible a la vista pero tapando la
    // pantalla, con sus 12 enlaces tabulables y presentes en el árbol de
    // accesibilidad. El layout va en el div INTERIOR.
    // El className se busca por su marca `nav-drawer` y no recortando el
    // elemento: un `<dialog …>` en JSX lleva flechas `=>` dentro de sus
    // manejadores, así que cualquier recorte hasta el primer `>` corta por la
    // mitad. (Este test se escribió mal la primera vez exactamente así.)
    const className =
      SIDEBAR.match(/className="(nav-drawer[^"]*)"/)?.[1] ?? "";
    expect(className, "className del <dialog>").not.toBe("");
    expect(className).not.toMatch(
      /\b(flex|grid|block|inline-flex|inline-block|table|contents)\b/,
    );
  });

  it("se abre con showModal(), no con show() ni con el atributo open", () => {
    // `show()` abre el diálogo SIN capa superior, sin trampa de foco y sin
    // inertizar el fondo: se vería igual y no protegería nada.
    expect(SIDEBAR).toContain("showModal()");
    expect(SIDEBAR).not.toMatch(/\.show\(\)/);
    expect(SIDEBAR).not.toMatch(/<dialog[^>]*\sopen[\s>]/);
  });

  it("no escribe a mano role=dialog ni aria-modal", () => {
    // `showModal()` ya los aporta. Escribirlos a mano miente en cuanto alguien
    // cambie la forma de abrirlo.
    const dialog = SIDEBAR.match(/<dialog[\s\S]*?>/)![0];
    expect(dialog).not.toMatch(/role="dialog"/);
    expect(dialog).not.toMatch(/aria-modal/);
  });

  it("el id y el aria-controls salen de la misma constante", () => {
    // Desincronizarlos rompe la referencia sin que tsc ni el build digan nada.
    expect(SIDEBAR).not.toContain(`"${DRAWER_ID}"`);
    expect(SIDEBAR).toContain("id={DRAWER_ID}");
    expect(SIDEBAR).toContain("aria-controls={DRAWER_ID}");
  });

  it("el destino activo se anuncia, no solo se colorea", () => {
    expect(SIDEBAR).toContain('aria-current={active ? "page" : undefined}');
  });
});

describe("CSS del cajón", () => {
  it("toda animación declarada en utilities está neutralizada en reduced-motion", () => {
    // El bloque `prefers-reduced-motion` de este proyecto es una lista CERRADA
    // de clases: una animación nueva se le escapa en silencio. Este test
    // convierte esa lista en algo que se mantiene solo. Cubre un riesgo del
    // repo entero, no solo de este cambio.
    const utilities = CSS.match(/@layer utilities \{[\s\S]*?\n\}/)?.[0] ?? "";
    expect(utilities.length, "no se encontró @layer utilities").toBeGreaterThan(100);
    const reduced =
      CSS.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/)?.[0] ?? "";
    expect(reduced.length, "no se encontró el bloque reduced-motion").toBeGreaterThan(50);

    // Clases del bloque de utilidades que declaran `animation:`. Solo se mira
    // la parte de SELECTOR de cada regla (lo anterior al `{`): escanear el
    // cuerpo pescaría `.26s` de una duración como si fuera una clase.
    const animated = new Set<string>();
    for (const rule of utilities.split("}")) {
      if (!/\banimation:/.test(rule)) continue;
      const selector = rule.slice(0, rule.indexOf("{"));
      for (const cls of selector.matchAll(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
        animated.add(cls[1]);
      }
    }
    expect(animated.size, "ninguna utilidad animada detectada").toBeGreaterThan(0);

    for (const cls of animated) {
      expect(reduced, `.${cls} no está en prefers-reduced-motion`).toContain(`.${cls}`);
    }
  });

  it("la degradación sin dialog modal y sin scripting existe y está acotada", () => {
    // Nunca un botón muerto: si el cajón no se puede abrir, la navegación
    // degrada a la lista vertical de siempre y el disparador desaparece.
    expect(CSS).toContain("@supports not selector(dialog:modal)");
    expect(CSS).toContain("scripting: none");
  });

  it("los bloques de degradación llevan `screen` y se acotan a móvil", () => {
    // Sin `screen` vencerían a `print:hidden` (que vive en @layer utilities) y
    // el cajón saldría IMPRESO en el dossier y en el informe. Sin el límite de
    // anchura, la degradación se colaría en escritorio.
    // Se comprueba sobre la `@media` que gobierna cada marcador. `scripting`
    // vive DENTRO de su propia media query (`@media screen and (scripting:
    // none) and (width < 48rem)`), así que el límite de anchura va después del
    // marcador y no antes: mirar solo hacia atrás daba un falso fallo.
    const guards = CSS.match(/@media[^{]*\{/g) ?? [];
    const govern = (at: number) =>
      guards.filter((g) => {
        const i = CSS.indexOf(g);
        return i > -1 && i < at;
      });

    for (const marker of ["@supports not selector(dialog:modal)", "scripting: none"]) {
      const at = CSS.indexOf(marker);
      expect(at, marker).toBeGreaterThan(-1);
      // La `@media` más cercana por delante es la que lo envuelve.
      const nearest = govern(at).at(-1) ?? "";
      expect(nearest, `${marker} sin @media screen`).toMatch(/@media screen/);
      expect(nearest, `${marker} sin límite de anchura`).toMatch(/width < 48rem/);
    }
  });

  it("el bloqueo de scroll del fondo está acotado a móvil", () => {
    // `overflow: hidden` sobre `html` sin acotar congelaría el documento en
    // tablet, donde el cajón ni siquiera existe (`md:hidden`).
    const at = CSS.indexOf("html:has(dialog.nav-drawer[open])");
    expect(at).toBeGreaterThan(-1);
    expect(CSS.slice(Math.max(0, at - 200), at)).toMatch(/width < 48rem/);
  });

  it("el velo no usa una utilidad de color que se invierte en oscuro", () => {
    // `--color-ink` es casi blanco en tema oscuro: `bg-ink/40` daría un velo
    // CLARO sobre fondo oscuro. Y `::backdrop` no hereda las custom properties
    // de `:root` en todos los motores, con lo que en los antiguos saldría
    // transparente. Por eso va en rgba() literal.
    const backdrop =
      CSS.match(/\.nav-drawer\[open\]::backdrop \{[\s\S]*?\}/)?.[0] ?? "";
    expect(backdrop, "no se encontró la regla del ::backdrop").toContain("background");
    expect(backdrop).toMatch(/rgba?\(/);
    expect(backdrop).not.toMatch(/var\(--color-ink/);
  });
});
