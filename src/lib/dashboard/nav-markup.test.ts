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
const CSS_RAW = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");

/**
 * CSS sin comentarios. Los comentarios de este fichero MENCIONAN selectores y
 * at-rules al explicar por qué están ahí ("…que vive en `@layer utilities`"), y
 * cualquier escaneo ingenuo los cuenta como si fueran código.
 */
const CSS = CSS_RAW.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * El fuente SIN comentarios. Escanear el fichero entero deja los guards a merced
 * de su propia documentación: `expect(SIDEBAR).toContain("showModal()")` lo
 * satisfacían los tres comentarios que mencionan `showModal()`, así que la
 * aserción pasaba con el código abriendo el diálogo de cualquier otra forma.
 */
const CODE = SIDEBAR.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

/**
 * La etiqueta `<dialog …>` completa. No vale `/<dialog[\s\S]*?>/`: los
 * manejadores JSX llevan flechas `=>`, así que el recorte no goloso se para en
 * el primer `>` de una flecha y solo mira 4 de los 8 atributos.
 */
function dialogTag(source: string): string {
  const start = source.indexOf("<dialog");
  expect(start, "no se encontró el <dialog>").toBeGreaterThan(-1);
  // Se avanza carácter a carácter llevando la cuenta de llaves: el `>` que
  // cierra la etiqueta es el primero que aparece con la profundidad a 0.
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return source.slice(start, i + 1);
  }
  throw new Error("etiqueta <dialog> sin cerrar");
}

// Sobre `CODE` y no sobre el fuente: los comentarios del componente citan
// `<dialog>` al explicarse, y `indexOf("<dialog")` caía en el primero de ellos
// devolviendo la cadena literal "<dialog>".
const DIALOG_TAG = dialogTag(CODE);

/**
 * Pila de at-rules ABIERTAS en una posición del CSS.
 *
 * Se cuentan llaves en vez de buscar la `@media` más cercana hacia atrás: la
 * proximidad textual no modela el anidamiento y daba por bueno un bloque que ya
 * había salido de su media query.
 */
function openAtRulesAt(index: number): string[] {
  const stack: string[] = [];
  let i = 0;
  while (i < index) {
    const open = CSS.indexOf("{", i);
    const close = CSS.indexOf("}", i);
    if (open === -1 && close === -1) break;
    if (open !== -1 && (close === -1 || open < close)) {
      if (open >= index) break;
      // Prelude: lo que hay entre la llave anterior y esta.
      const prelude = CSS.slice(
        Math.max(CSS.lastIndexOf("}", open), CSS.lastIndexOf("{", open - 1)) + 1,
        open,
      ).trim();
      stack.push(prelude);
      i = open + 1;
    } else {
      if (close >= index) break;
      stack.pop();
      i = close + 1;
    }
  }
  return stack;
}

/**
 * Todas las condiciones que gobiernan una posición: las at-rules abiertas MÁS
 * el prelude en el que la propia posición cae. Hace falta porque un marcador
 * puede estar en la CONDICIÓN de su at-rule y no dentro de su cuerpo — es el
 * caso de `scripting: none`, que vive en `@media screen and (scripting: none)
 * and (width < 48rem)`, donde la pila de bloques abiertos está vacía.
 */
function conditionsAt(index: number): string {
  const openAt = CSS.indexOf("{", index);
  const prevBrace = Math.max(CSS.lastIndexOf("}", index), CSS.lastIndexOf("{", index));
  const prelude =
    openAt > -1 && prevBrace < index ? CSS.slice(prevBrace + 1, openAt) : "";
  return [...openAtRulesAt(index), prelude].join(" ");
}

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
    const className = DIALOG_TAG.match(/className="([^"]*)"/)?.[1] ?? "";
    expect(className, "className del <dialog>").not.toBe("");
    // Lista cerrada por el lado correcto: TODA utilidad de display de Tailwind
    // salvo `hidden`, que es la única que queremos (y solo con la variante
    // `md:`). Enumerar unas pocas dejaba fuera `inline`, `flow-root`,
    // `list-item` o `inline-table`, que rompen la cascada exactamente igual.
    const DISPLAY =
      /\b(block|inline-block|inline|flex|inline-flex|table|inline-table|table-caption|table-cell|table-column|table-column-group|table-footer-group|table-header-group|table-row-group|table-row|flow-root|grid|inline-grid|contents|list-item)\b/;
    for (const cls of className.split(/\s+/)) {
      // Se ignora la variante (`md:hidden` → `hidden`): la que importa es la
      // utilidad base, y `md:hidden` es legítima.
      const base = cls.split(":").at(-1)!;
      expect(base, `utilidad de display en el <dialog>: ${cls}`).not.toMatch(DISPLAY);
    }
  });

  it("se abre con showModal(), no con show() ni marcando `open`", () => {
    // `show()` abre el diálogo SIN capa superior, sin trampa de foco y sin
    // inertizar el fondo: se vería igual y no protegería nada. Lo mismo vale
    // para las dos vías de runtime que lo abren no modal.
    expect(CODE).toMatch(/\.showModal\(\)/);
    expect(CODE).not.toMatch(/\.show\(\)/);
    expect(CODE).not.toMatch(/setAttribute\(\s*["'`]open/);
    expect(CODE).not.toMatch(/\.open\s*=\s*true/);
    expect(DIALOG_TAG).not.toMatch(/\sopen[\s=>]/);
  });

  it("no escribe a mano role=dialog ni aria-modal", () => {
    // `showModal()` ya los aporta. Escribirlos a mano miente en cuanto alguien
    // cambie la forma de abrirlo.
    expect(DIALOG_TAG).not.toMatch(/role="dialog"/);
    expect(DIALOG_TAG).not.toMatch(/aria-modal/);
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
  it("toda animación del CSS propio está neutralizada en reduced-motion", () => {
    // El bloque `prefers-reduced-motion` de este proyecto es una lista CERRADA
    // de reglas: una animación nueva se le escapa en silencio. Este test la
    // convierte en algo que se mantiene solo. Cubre un riesgo del repo entero,
    // no solo de este cambio.
    const reduced =
      CSS.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/)?.[0] ?? "";
    expect(reduced.length, "no se encontró el bloque reduced-motion").toBeGreaterThan(50);

    // Se escanea TODO el CSS, no solo `@layer utilities`: una animación
    // declarada fuera de ese bloque también hay que neutralizarla. Se descartan
    // el propio bloque de reduced-motion y los de degradación, donde
    // `animation: none` es justamente lo correcto.
    const scanned = CSS.replace(reduced, "");

    // Selectores COMPLETOS que declaran una animación real. Comparar por nombre
    // de clase suelto colapsa dos selectores que compartan clase y basta con
    // que el texto aparezca en cualquier parte del bloque.
    const animated = new Set<string>();
    for (const rule of scanned.split("}")) {
      const brace = rule.indexOf("{");
      if (brace < 0) continue;
      const body = rule.slice(brace + 1);
      if (!/\banimation:/.test(body)) continue;
      if (/\banimation:\s*none/.test(body)) continue;
      const selector = rule.slice(0, brace).trim();
      // Fuera at-rules (`@keyframes`, `@media`, `@supports`) y selectores sin
      // clase: no son utilidades que haya que neutralizar.
      if (selector.startsWith("@") || !selector.includes(".")) continue;
      for (const one of selector.split(",")) animated.add(one.trim());
    }
    expect(animated.size, "ninguna regla animada detectada").toBeGreaterThan(0);

    // Selectores presentes dentro del bloque de reduced-motion.
    const neutralized = new Set<string>();
    for (const rule of reduced.split("}")) {
      const brace = rule.indexOf("{");
      if (brace < 0) continue;
      if (!/\banimation:\s*none/.test(rule.slice(brace + 1))) continue;
      for (const one of rule.slice(0, brace).split(",")) {
        neutralized.add(one.trim().replace(/^[\s{]*/, ""));
      }
    }

    for (const selector of animated) {
      expect(
        [...neutralized].some((n) => n.endsWith(selector) || selector.endsWith(n)),
        `«${selector}» declara animación y no se anula en prefers-reduced-motion`,
      ).toBe(true);
    }
  });

  it("solo hay un bloque @layer utilities", () => {
    // Si aparecieran dos, cualquier escaneo que asuma "el bloque" miraría solo
    // el primero y dejaría el segundo sin vigilar.
    expect(CSS.match(/@layer utilities/g) ?? []).toHaveLength(1);
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
    for (const marker of ["@supports not selector(dialog:modal)", "scripting: none"]) {
      const at = CSS.indexOf(marker);
      expect(at, marker).toBeGreaterThan(-1);
      const conds = conditionsAt(at);
      expect(conds, `${marker} sin @media screen`).toMatch(/@media screen/);
      expect(conds, `${marker} sin límite de anchura`).toMatch(/width < 48rem/);
    }
  });

  it("el bloqueo de scroll del fondo está acotado a móvil", () => {
    // `overflow: hidden` sobre `html` sin acotar congelaría el documento en
    // tablet, donde el cajón ni siquiera existe (`md:hidden`).
    const at = CSS.indexOf("html:has(dialog.nav-drawer[open])");
    expect(at).toBeGreaterThan(-1);
    expect(openAtRulesAt(at).join(" ")).toMatch(/width < 48rem/);
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
