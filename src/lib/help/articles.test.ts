import { describe, expect, it } from "vitest";
import { LOCALES } from "@/lib/i18n/config";
import { HELP_SECTIONS, allArticles } from "./articles";

/**
 * Lo que se protege: que la ayuda no se quede a medias en un idioma y que no
 * pierda la sección que la hace honesta.
 */

describe("centro de ayuda", () => {
  it("no hay identificadores repetidos", () => {
    const ids = allArticles().map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    const sections = HELP_SECTIONS.map((s) => s.id);
    expect(new Set(sections).size).toBe(sections.length);
  });

  it("toda pregunta y toda respuesta existe en ambos idiomas", () => {
    const missing: string[] = [];
    for (const section of HELP_SECTIONS) {
      for (const locale of LOCALES) {
        if (!section.title[locale]?.trim()) missing.push(`${section.id}.title.${locale}`);
      }
      for (const a of section.articles) {
        for (const locale of LOCALES) {
          if ((a.question[locale] ?? "").length < 8) missing.push(`${a.id}.q.${locale}`);
          if ((a.answer[locale] ?? []).length === 0) missing.push(`${a.id}.a.${locale}`);
          for (const [i, p] of (a.answer[locale] ?? []).entries()) {
            if (p.trim().length < 20) missing.push(`${a.id}.a.${locale}[${i}]`);
          }
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("cada respuesta tiene el mismo número de párrafos en ambos idiomas", () => {
    const mismatched = allArticles()
      .filter((a) => a.answer.es.length !== a.answer.en.length)
      .map((a) => a.id);
    expect(mismatched).toEqual([]);
  });

  it("ningún párrafo largo se quedó sin traducir", () => {
    const untranslated: string[] = [];
    for (const a of allArticles()) {
      for (let i = 0; i < a.answer.es.length; i++) {
        if (a.answer.es[i].length > 60 && a.answer.es[i] === a.answer.en[i]) {
          untranslated.push(`${a.id}[${i}]`);
        }
      }
    }
    expect(untranslated).toEqual([]);
  });

  it("los enlaces internos apuntan al panel", () => {
    for (const a of allArticles()) {
      if (a.href) expect(a.href, a.id).toMatch(/^\/dashboard(\/|$)/);
    }
  });

  /**
   * EL TEST QUE IMPORTA. La sección de límites es la que más consultas de soporte
   * ahorra y la que sostiene la regla nº 1 del producto. Si alguien la vacía
   * porque "suena negativo en la ayuda", la ayuda pasa a esquivar exactamente lo
   * que un comprador necesita saber antes de comprar, no después.
   */
  it("la sección de límites existe y cubre las tres preguntas incómodas", () => {
    const limits = HELP_SECTIONS.find((s) => s.id === "limites");
    expect(limits).toBeDefined();
    const ids = limits!.articles.map((a) => a.id);
    expect(ids).toContain("no-certifica");
    expect(ids).toContain("no-asesoria");
    expect(ids).toContain("no-escanea");
  });

  /**
   * La respuesta sobre certificación tiene que seguir siendo un NO explícito en
   * los dos idiomas. Un "no" que se suaviza a "Attesta te ayuda a prepararte"
   * deja de responder la pregunta que se hizo.
   */
  it("la respuesta sobre certificación empieza diciendo que no", () => {
    const a = allArticles().find((x) => x.id === "no-certifica")!;
    expect(a.answer.es[0].toLowerCase()).toMatch(/^no[,.]/);
    expect(a.answer.en[0].toLowerCase()).toMatch(/^no[,.]/);
  });
});
