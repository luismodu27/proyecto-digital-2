import { describe, expect, it } from "vitest";
import {
  coerceStoredLocale,
  foreignLocales,
  isForeignContent,
  langAttr,
} from "./stored-locale";
import { coerceLocale } from "./config";

describe("coerceStoredLocale", () => {
  it("acepta los locales del catálogo", () => {
    expect(coerceStoredLocale("es")).toBe("es");
    expect(coerceStoredLocale("en")).toBe("en");
  });

  /**
   * La diferencia con `coerceLocale` ES el módulo. Aquel resuelve el idioma de la
   * INTERFAZ, donde caer al default es lo correcto (hay que renderizar algo). Aquí
   * describimos un dato del pasado: si no consta, no consta. Reutilizar
   * `coerceLocale` marcaría como españolas todas las filas anteriores a la 0033.
   */
  it("NO cae al default: lo desconocido se queda en null", () => {
    for (const raw of [null, undefined, "", "xx", "es-ES", "ES", 42, {}]) {
      expect(coerceStoredLocale(raw)).toBeNull();
    }
    // Y se deja constancia de que el otro sí cae, para que la diferencia sea visible.
    expect(coerceLocale("xx")).toBe("es");
  });
});

describe("langAttr", () => {
  it("no etiqueta el contenido cuyo idioma no consta", () => {
    expect(langAttr(null, "es")).toBeUndefined();
    expect(langAttr(null, "en")).toBeUndefined();
    expect(langAttr(undefined, "en")).toBeUndefined();
  });

  it("no etiqueta cuando coincide con la interfaz (lo dice ya el <html lang>)", () => {
    expect(langAttr("es", "es")).toBeUndefined();
    expect(langAttr("en", "en")).toBeUndefined();
  });

  it("etiqueta con el idioma REAL del texto cuando difiere (WCAG 3.1.2)", () => {
    expect(langAttr("es", "en")).toBe("es");
    expect(langAttr("en", "es")).toBe("en");
  });

  /**
   * Guard contra el error tentador: poner `lang` con el idioma de la INTERFAZ.
   * Compila, se ve bien y le miente al lector de pantalla justo en el único caso
   * en que el atributo servía para algo.
   */
  it("nunca devuelve el idioma de la interfaz", () => {
    const uis = ["es", "en"] as const;
    const stored = ["es", "en", null] as const;
    for (const ui of uis) {
      for (const s of stored) {
        expect(langAttr(s, ui)).not.toBe(ui);
      }
    }
  });
});

describe("isForeignContent", () => {
  it("solo es cierto cuando consta un idioma distinto del de la interfaz", () => {
    expect(isForeignContent("es", "en")).toBe(true);
    expect(isForeignContent("en", "es")).toBe(true);
    expect(isForeignContent("es", "es")).toBe(false);
    // Desconocido NO es "extranjero": no se avisa de algo que no se sabe.
    expect(isForeignContent(null, "en")).toBe(false);
  });
});

describe("foreignLocales", () => {
  it("no repite y respeta el orden de aparición", () => {
    const items = [
      { locale: "es" as const },
      { locale: null },
      { locale: "es" as const },
      { locale: "en" as const },
    ];
    expect(foreignLocales(items, "en")).toEqual(["es"]);
    expect(foreignLocales(items, "es")).toEqual(["en"]);
  });

  it("devuelve vacío cuando todo está en el idioma de la interfaz o se desconoce", () => {
    expect(foreignLocales([{ locale: "es" }, { locale: null }], "es")).toEqual([]);
    expect(foreignLocales([], "en")).toEqual([]);
  });

  it("tolera elementos sin la propiedad (filas viejas mapeadas sin locale)", () => {
    expect(foreignLocales([{}, { locale: "en" }], "es")).toEqual(["en"]);
  });
});
