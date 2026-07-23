/**
 * Vigía — núcleo determinista (Capa 7, foso automatizado).
 *
 * Descarga el contenido de una fuente regulatoria, lo normaliza para eliminar
 * ruido volátil (scripts, nonces, cache-busting) y calcula un hash estable. Un
 * hash distinto al de la última revisión = "algo cambió aquí". CERO LLM: el
 * Vigía no interpreta el contenido, solo detecta que cambió.
 *
 * Todo aquí es puro y con dependencias inyectables (`fetchImpl`) para poder
 * verificarlo sin red.
 */

import { createHash } from "node:crypto";

export type FetchImpl = (url: string, init: RequestInit) => Promise<Response>;

export type FetchResult =
  | { ok: true; hash: string; httpStatus: number }
  | { ok: false; error: string; httpStatus?: number };

/**
 * Normaliza HTML para reducir falsos positivos: quita lo que cambia en cada
 * carga sin que cambie la norma (scripts, estilos, comentarios, nonces/CSRF,
 * parámetros de cache-busting) y colapsa espacios. Conservador a propósito: es
 * peor perder un cambio real que reportar ruido, así que solo se elimina lo que
 * es claramente volátil.
 */
export function normalizeHtml(raw: string): string {
  return raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(
      /\s(nonce|integrity|csrf[-_]?token|data-csrf|data-nonce)="[^"]*"/gi,
      " ",
    )
    .replace(/[?&](v|ver|version|cb|cache|_|t|ts)=[^"'\s&>]+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Hash SHA-256 (hex) del contenido normalizado. */
export function hashContent(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Descarga una URL y devuelve el hash de su contenido normalizado. Con timeout,
 * User-Agent identificable y seguimiento de redirecciones. Inyecta `fetchImpl`
 * en tests para no tocar la red.
 */
export async function fetchAndHash(
  url: string,
  opts: { fetchImpl?: FetchImpl; timeoutMs?: number } = {},
): Promise<FetchResult> {
  const fetchImpl = opts.fetchImpl ?? (globalThis.fetch as FetchImpl);
  const timeoutMs = opts.timeoutMs ?? 12_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "AttestaVigia/1.0 (+regulatory-watch; deployer compliance monitor)",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}`, httpStatus: res.status };
    }
    const body = await res.text();
    return {
      ok: true,
      hash: hashContent(normalizeHtml(body)),
      httpStatus: res.status,
    };
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.name === "AbortError"
          ? "timeout"
          : e.message
        : "error de red";
    return { ok: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
