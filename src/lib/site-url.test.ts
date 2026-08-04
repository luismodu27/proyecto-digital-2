import { describe, expect, it } from "vitest";
import {
  LOCAL_SITE_URL,
  normalizeSiteUrl,
  resolveSiteUrl,
  SiteUrlError,
} from "./site-url";

describe("normalizeSiteUrl", () => {
  it("devuelve el origen limpio", () => {
    expect(normalizeSiteUrl("https://attesta.io")).toBe("https://attesta.io");
    expect(normalizeSiteUrl("  https://attesta.io  ")).toBe("https://attesta.io");
  });

  /**
   * El caso que motivó la validación: todo el código compone `${SITE_URL}/en`.
   * Con barra final eso da `https://attesta.io//en`, que es una URL distinta —
   * y como canonical, una que no existe.
   */
  it("quita la barra final en vez de dejar que produzca //", () => {
    expect(normalizeSiteUrl("https://attesta.io/")).toBe("https://attesta.io");
  });

  it("conserva el puerto (necesario en local y en previews con puerto)", () => {
    expect(normalizeSiteUrl("http://localhost:4000")).toBe("http://localhost:4000");
  });

  it("rechaza lo que no es una URL absoluta", () => {
    for (const bad of ["attesta.io", "/", "", "   ", "www.attesta.io"]) {
      expect(() => normalizeSiteUrl(bad)).toThrow(SiteUrlError);
    }
  });

  it("rechaza esquemas que no sirven para un canonical", () => {
    expect(() => normalizeSiteUrl("ftp://attesta.io")).toThrow(SiteUrlError);
    // `javascript:` no llegaría a un canonical útil y sí a un href: se corta aquí.
    expect(() => normalizeSiteUrl("javascript:alert(1)")).toThrow(SiteUrlError);
  });

  /**
   * Se rechaza en vez de recortar: si alguien pegó la URL de una página concreta,
   * quedarse con el dominio sería adivinar, y adivinar mal aquí produce canonicals
   * a medias que nadie mira hasta que el tráfico cae.
   */
  it("rechaza una ruta, query o fragmento en vez de recortarlos", () => {
    for (const bad of [
      "https://attesta.io/en",
      "https://attesta.io/?utm_source=x",
      "https://attesta.io/#hero",
    ]) {
      expect(() => normalizeSiteUrl(bad)).toThrow(SiteUrlError);
    }
  });

  it("el mensaje dice qué variable es y cómo arreglarla", () => {
    expect(() => normalizeSiteUrl("attesta.io")).toThrow(/NEXT_PUBLIC_APP_URL/);
    expect(() => normalizeSiteUrl("attesta.io")).toThrow(/sin barra final/);
  });
});

describe("resolveSiteUrl", () => {
  it("la variable explícita manda, tanto en despliegue como fuera", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_APP_URL: "https://attesta.io" })).toBe(
      "https://attesta.io",
    );
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_APP_URL: "https://attesta.io", VERCEL: "1" }),
    ).toBe("https://attesta.io");
  });

  it("sin variable y sin despliegue detrás, cae a localhost sin quejarse", () => {
    expect(resolveSiteUrl({})).toBe(LOCAL_SITE_URL);
    // Cadena vacía = variable declarada pero sin valor: cuenta como ausente.
    expect(resolveSiteUrl({ NEXT_PUBLIC_APP_URL: "" })).toBe(LOCAL_SITE_URL);
    expect(resolveSiteUrl({ NEXT_PUBLIC_APP_URL: "   " })).toBe(LOCAL_SITE_URL);
  });

  /**
   * EL CORAZÓN DEL TICKET. Antes esto devolvía un dominio plausible y la build
   * pasaba: los enlaces salían mal y nadie se enteraba. Ahora se para.
   */
  it("sin variable Y en un despliegue, FALLA en vez de inventarse un dominio", () => {
    expect(() => resolveSiteUrl({ VERCEL: "1" })).toThrow(SiteUrlError);
    expect(() => resolveSiteUrl({ VERCEL: "1" })).toThrow(/NEXT_PUBLIC_APP_URL/);
  });

  /**
   * Guard contra el "arreglo" tentador: volver a poner un default para que la
   * build deje de fallar. Ningún camino puede devolver un dominio que nadie
   * declaró — o es el que pusieron, o es localhost, o no hay build.
   */
  it("nunca devuelve un dominio de producción que nadie haya declarado", () => {
    expect(resolveSiteUrl({})).toBe(LOCAL_SITE_URL);
    expect(() => resolveSiteUrl({ VERCEL: "1" })).toThrow();
    for (const env of [{}, { VERCEL: "1" }] as const) {
      let out: string | null = null;
      try {
        out = resolveSiteUrl(env);
      } catch {
        out = null;
      }
      expect(out === null || out === LOCAL_SITE_URL).toBe(true);
    }
  });
});
