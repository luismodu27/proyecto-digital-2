import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { LOCALES } from "@/lib/i18n/config";
import {
  SUBPROCESSORS,
  SUBPROCESSORS_UPDATED,
  corpusOnlySubprocessors,
  customerDataSubprocessors,
  isDeclaredHost,
} from "./subprocessors";

/**
 * EL GUARD QUE JUSTIFICA QUE LA LISTA SEA CÓDIGO.
 *
 * Una lista de subprocesadores solo vale si está completa, y se queda incompleta
 * de la forma más tonta: alguien añade `fetch("https://api.loquesea.com")` para
 * arreglar otra cosa y nadie se acuerda del documento legal. Aquí el test escanea
 * el código fuente en busca de **destinos de salida** y falla si alguno no está
 * declarado. No es una comprobación de estilo: es la diferencia entre una lista
 * que se puede enseñar en una due-diligence y una que hay que ir a verificar a
 * mano cada vez.
 *
 * Escanea ficheros, como el guard de copy prohibido y el de las Server Actions.
 * Es la excepción documentada a "la suite es de lógica pura".
 *
 * LO QUE DISTINGUE (y por qué no da falsos positivos): un destino al que
 * **enviamos datos** no es lo mismo que una URL que solo **citamos**. Este repo
 * está lleno de enlaces a eur-lex, ilga.gov o cppa.ca.gov porque el contenido
 * regulatorio cita sus fuentes; ninguno recibe nada de nadie. Por eso el guard
 * mira solo dos sitios donde un host significa flujo de datos real:
 *   1. el argumento de un `fetch(...)`;
 *   2. la allowlist de la CSP (`connect-src`, `script-src`, `frame-src`), que es
 *      justo la lista de con quién puede hablar el navegador.
 */

const SRC = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** Hosts a los que el código hace `fetch`. */
function fetchHosts(): { host: string; where: string }[] {
  const found: { host: string; where: string }[] = [];
  // `fetch(` seguido de una URL literal, con comilla simple, doble o backtick.
  const FETCH_URL = /fetch\(\s*[`"']https:\/\/([a-zA-Z0-9.-]+)/g;
  for (const file of walk(SRC)) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(FETCH_URL)) {
      found.push({ host: m[1], where: file.replace(process.cwd() + "/", "") });
    }
  }
  // Las URL de API que se arman en una constante y luego se pasan a `fetch` no
  // caen en el patrón de arriba. Se recogen aparte: una constante en MAYÚSCULAS
  // que contenga una URL absoluta y termine en algo que parece un endpoint.
  const CONST_URL =
    /const\s+[A-Z_0-9]*URL[A-Z_0-9]*\s*=\s*[`"']https:\/\/([a-zA-Z0-9.-]+)/g;
  for (const file of walk(SRC)) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(CONST_URL)) {
      found.push({ host: m[1], where: file.replace(process.cwd() + "/", "") });
    }
  }
  return found;
}

/** Hosts permitidos por la CSP: con quién puede hablar el navegador. */
function cspHosts(): string[] {
  const src = readFileSync(join(SRC, "lib/security/csp.ts"), "utf8");
  const hosts = new Set<string>();
  for (const m of src.matchAll(/(?:https|wss):\/\/([a-zA-Z0-9.*-]+)/g)) {
    hosts.add(m[1]);
  }
  return [...hosts];
}

describe("guard · ningún tercero sin declarar", () => {
  it("el escáner encuentra destinos (si no, no vigila nada)", () => {
    // Autoprueba de cobertura: si un refactor rompe los patrones, este test cae
    // antes de que el guard empiece a aprobar cualquier cosa en silencio.
    expect(fetchHosts().length).toBeGreaterThanOrEqual(3);
    expect(cspHosts().length).toBeGreaterThanOrEqual(3);
  });

  it("todo host al que hacemos fetch está en la lista de subprocesadores", () => {
    const undeclared = fetchHosts()
      .filter(({ host }) => !isDeclaredHost(host))
      .map(({ host, where }) => `${host} (${where})`);
    expect(undeclared).toEqual([]);
  });

  it("todo host permitido por la CSP está en la lista de subprocesadores", () => {
    const undeclared = cspHosts().filter((h) => !isDeclaredHost(h));
    expect(undeclared).toEqual([]);
  });

  /**
   * Autoprueba: se le da un host inventado y se comprueba que NO lo da por bueno.
   * Si alguien afloja `isDeclaredHost` (por ejemplo devolviendo `true` por
   * defecto), este test cae con ella.
   */
  it("se autoprueba: un host no declarado no cuela", () => {
    expect(isDeclaredHost("api.posthog.com")).toBe(false);
    expect(isDeclaredHost("sentry.io")).toBe(false);
    // Y el comodín resuelve de verdad, en vez de aceptar cualquier cosa.
    expect(isDeclaredHost("abcdef.supabase.co")).toBe(true);
    expect(isDeclaredHost("supabase.co")).toBe(true);
    expect(isDeclaredHost("supabase.co.evil.com")).toBe(false);
  });
});

describe("lista de subprocesadores", () => {
  it("no hay identificadores repetidos", () => {
    const ids = SUBPROCESSORS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada entrada está completa en ES y EN (paridad)", () => {
    for (const s of SUBPROCESSORS) {
      for (const locale of LOCALES) {
        expect(s.purpose[locale]?.length, `${s.id}.purpose.${locale}`).toBeGreaterThan(20);
        expect(s.data[locale]?.length, `${s.id}.data.${locale}`).toBeGreaterThan(20);
        expect(s.location[locale]?.length, `${s.id}.location.${locale}`).toBeGreaterThan(5);
      }
    }
  });

  it("cada entrada enlaza la privacidad del proveedor por https", () => {
    for (const s of SUBPROCESSORS) {
      expect(s.privacyUrl, s.id).toMatch(/^https:\/\//);
    }
  });

  /**
   * LA AFIRMACIÓN QUE MÁS CARO SALE SI SE VUELVE FALSA. La página pública dice que
   * los proveedores de IA (embeddings y borradores) solo ven texto normativo
   * público. El día que alguien mande a un modelo el inventario de un cliente para
   * "resumirlo", esa frase pasa a ser mentira en una página legal. El test no puede
   * impedirlo, pero sí obliga a que quien lo haga cambie la clasificación aquí y se
   * dé cuenta de lo que está tocando.
   */
  it("los proveedores de IA siguen clasificados como corpus público, no datos de cliente", () => {
    const ai = corpusOnlySubprocessors().map((s) => s.id);
    expect(ai).toContain("voyage");
    expect(ai).toContain("llm-drafting");
    for (const s of corpusOnlySubprocessors()) {
      // Debe decir explícitamente que no recibe datos de cliente, en ambos idiomas.
      expect(s.data.es.toLowerCase()).toMatch(/ningún dato|ningun dato/);
      expect(s.data.en.toLowerCase()).toContain("no data");
    }
  });

  it("los que tratan datos de cliente declaran dónde y bajo qué garantía", () => {
    const customer = customerDataSubprocessors();
    expect(customer.length).toBeGreaterThanOrEqual(4);
    for (const s of customer) {
      // Si sale de la UE, tiene que aparecer la garantía de la transferencia.
      const outsideEu = /Estados Unidos/i.test(s.location.es);
      if (outsideEu) {
        expect(s.location.es, `${s.id} sale de la UE sin declarar garantía`).toMatch(
          /cláusulas contractuales tipo/i,
        );
      }
    }
  });

  it("la fecha de revisión es una fecha ISO válida y no está en el futuro", () => {
    expect(SUBPROCESSORS_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(SUBPROCESSORS_UPDATED))).toBe(false);
  });
});
