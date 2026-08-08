import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { es } from "./dictionaries/es";
import { en } from "./dictionaries/en";

/**
 * GUARD: toda clave `?toast=` que emite el código existe en AMBOS diccionarios.
 *
 * EL FALLO QUE ESTE GUARD EXISTE PARA IMPEDIR. El `Toaster` resuelve el mensaje
 * mirando `t.dashboard.toasts[key]`, y si la clave no está en el mapa **retorna
 * en silencio y no pinta nada** (`if (!MESSAGES[key]) return`). Así, una server
 * action que redirige con `?toast=demo` o `?toast=error` —claves que nunca se
 * añadieron al diccionario— dejaba al usuario sin ningún feedback tras actuar: la
 * baja de una organización en modo demo, o un error al cancelarla, no decían nada.
 * Compila, pasa el build, y el bug solo se ve usando la app en ese caso exacto.
 *
 * Es el mismo patrón que `subprocessors.test.ts` (hosts) o `db-grants.test.ts`
 * (permisos): cuando una correspondencia tiene que valer en muchos sitios, se
 * escanea el repositorio y se falla si algo no cuadra, en vez de confiar en que
 * alguien lo recuerde. Cubre las dos formas en que el código escribe la clave: el
 * literal (`?toast=gap-created`) y el ternario (`?toast=${x ? "a" : "b"}`).
 */

const SRC = join(process.cwd(), "src");

/**
 * Lógica pura. Extrae las claves de toast que emite un fragmento de código:
 *  - `toast=<literal-kebab>` directo.
 *  - `toast=${ ... ? "a" : "b" }` (ternario): se recogen los literales que son
 *    RAMAS del ternario —los que van tras `?` o `:`—, que son los valores que la
 *    clave puede tomar. Un literal que sea OPERANDO de la condición
 *    (`x === "too-large" ? ...`) NO es una clave de toast y se ignora.
 * No se cubren las claves calculadas por completo (una variable sin literal); no
 * las hay hoy y añadir una sin literal la dejaría fuera del guard a propósito.
 */
export function toastKeysIn(source: string): string[] {
  const keys = new Set<string>();
  const re = /toast=(\$\{|[a-z0-9-]+)/g;
  for (let m = re.exec(source); m; m = re.exec(source)) {
    if (m[1] !== "${") {
      keys.add(m[1]);
      continue;
    }
    // Interpolación: capturar el `${...}` equilibrado y sacar solo los literales
    // que son ramas del ternario (tras `?` o `:`), no los operandos de la condición.
    let depth = 1;
    let i = m.index + m[0].length;
    for (; i < source.length && depth > 0; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") depth--;
    }
    const inner = source.slice(m.index + m[0].length, i - 1);
    for (const lit of inner.matchAll(/[?:]\s*["'`]([a-z0-9-]+)["'`]/g)) {
      keys.add(lit[1]);
    }
  }
  return [...keys];
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !p.endsWith(".test.ts") &&
      !p.endsWith(".test.tsx")
    ) {
      out.push(p);
    }
  }
  return out;
}

function allEmittedToastKeys(): string[] {
  const keys = new Set<string>();
  for (const f of walk(SRC)) {
    for (const k of toastKeysIn(readFileSync(f, "utf8"))) keys.add(k);
  }
  return [...keys].sort();
}

const esToasts = es.dashboard.toasts as Record<string, string>;
const enToasts = en.dashboard.toasts as Record<string, string>;

describe("guard · cobertura de claves de toast", () => {
  it("toda clave emitida existe en el diccionario ES", () => {
    const faltan = allEmittedToastKeys().filter((k) => !(k in esToasts));
    expect(faltan, `sin mensaje ES: ${faltan.join(", ")}`).toEqual([]);
  });

  it("toda clave emitida existe en el diccionario EN", () => {
    const faltan = allEmittedToastKeys().filter((k) => !(k in enToasts));
    expect(faltan, `sin mensaje EN: ${faltan.join(", ")}`).toEqual([]);
  });

  it("ES y EN definen exactamente las mismas claves de toast", () => {
    const soloEs = Object.keys(esToasts).filter((k) => !(k in enToasts));
    const soloEn = Object.keys(enToasts).filter((k) => !(k in esToasts));
    expect(soloEs, `solo en ES: ${soloEs.join(", ")}`).toEqual([]);
    expect(soloEn, `solo en EN: ${soloEn.join(", ")}`).toEqual([]);
  });

  it("de verdad encuentra claves (cobertura mínima)", () => {
    const all = allEmittedToastKeys();
    expect(all.length).toBeGreaterThan(20);
    expect(all).toContain("demo");
    expect(all).toContain("error");
  });

  /** Autoprueba del extractor: literal y ternario. */
  it("el extractor lee el literal y las dos ramas de un ternario", () => {
    expect(toastKeysIn('redirect("/x?toast=gap-created")')).toEqual(["gap-created"]);
    const tern = 'redirect(`/x?toast=${bad ? "vault-large" : "vault-empty"}`)';
    expect(toastKeysIn(tern).sort()).toEqual(["vault-empty", "vault-large"]);
  });
});
