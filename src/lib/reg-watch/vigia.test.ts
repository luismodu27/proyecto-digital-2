import { describe, expect, it } from "vitest";
import { fetchAndHash, hashContent, normalizeHtml, type FetchImpl } from "./vigia";

/**
 * EL VIGÍA NO PUEDE TRATAR UN 202 COMO ÉXITO.
 *
 * Los muros anti-bot de CloudFront/AWS —que EUR-Lex tiene delante— responden
 * `202 Accepted` con una página de *challenge* en el cuerpo, no la norma. El
 * núcleo usaba `res.ok`, que es `true` para todo 2xx: ese challenge se hasheaba
 * y se marcaba como éxito, de modo que un cambio real en la norma quedaría
 * enmascarado tras el hash estable del muro y el Vigía nunca lo vería. Un Vigía
 * que reporta "sin cambios" mirando un muro es peor que uno que reporta un error:
 * el error se ve en el panel; el falso "unchanged" no.
 *
 * Estos tests fijan la EXPECTATIVA (solo 200 es señal), no la implementación. Si
 * alguien vuelve a `res.ok`, el primero de ellos falla.
 */

/** Response mínima falsa: solo lo que `fetchAndHash` toca. */
function fakeResponse(status: number, body: string): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  } as unknown as Response;
}

function fetchDevolviendo(status: number, body: string): FetchImpl {
  return async () => fakeResponse(status, body);
}

describe("fetchAndHash: solo 200 es señal", () => {
  it("un 202 (muro anti-bot) es error, NO éxito", async () => {
    const r = await fetchAndHash("https://eur-lex.europa.eu/x", {
      fetchImpl: fetchDevolviendo(202, "<html>challenge de CloudFront</html>"),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBe("HTTP 202");
      expect(r.httpStatus).toBe(202);
    }
  });

  it("un 204 (sin cuerpo) es error", async () => {
    const r = await fetchAndHash("https://x", {
      fetchImpl: fetchDevolviendo(204, ""),
    });
    expect(r.ok).toBe(false);
  });

  it("un 200 sí es éxito y devuelve el hash del contenido normalizado", async () => {
    const body = "<html><body>Artículo 5 del Reglamento</body></html>";
    const r = await fetchAndHash("https://x", {
      fetchImpl: fetchDevolviendo(200, body),
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.hash).toBe(hashContent(normalizeHtml(body)));
      expect(r.httpStatus).toBe(200);
    }
  });

  it("un 404 sigue siendo error, con su código", async () => {
    const r = await fetchAndHash("https://x", {
      fetchImpl: fetchDevolviendo(404, "no encontrado"),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("HTTP 404");
  });

  it("un timeout se reporta como tal, no como error genérico", async () => {
    const r = await fetchAndHash("https://x", {
      timeoutMs: 5,
      fetchImpl: () =>
        new Promise((_resolve, reject) => {
          // Simula el abort del AbortController.
          const err = new Error("abort");
          err.name = "AbortError";
          setTimeout(() => reject(err), 20);
        }),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("timeout");
  });
});

describe("normalizeHtml: reduce ruido volátil sin perder la norma", () => {
  it("quita scripts, estilos y comentarios", () => {
    const out = normalizeHtml(
      "<style>.a{}</style><p>Norma</p><script>x()</script><!-- nota -->",
    );
    expect(out).toBe("<p>norma</p>");
  });

  it("quita nonces y tokens csrf pero conserva el texto", () => {
    const out = normalizeHtml('<div nonce="abc123" data-csrf="zzz">Texto</div>');
    expect(out).toContain("texto");
    expect(out).not.toContain("abc123");
    expect(out).not.toContain("zzz");
  });

  it("quita parámetros de cache-busting de las URLs", () => {
    const out = normalizeHtml('<a href="/x?v=99&cb=123">l</a>');
    expect(out).not.toContain("v=99");
    expect(out).not.toContain("cb=123");
  });

  it("el mismo contenido con distinto nonce da el MISMO hash", () => {
    const a = normalizeHtml('<div nonce="uno">Norma estable</div>');
    const b = normalizeHtml('<div nonce="dos">Norma estable</div>');
    expect(hashContent(a)).toBe(hashContent(b));
  });
});
