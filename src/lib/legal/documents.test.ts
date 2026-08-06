import { describe, expect, it } from "vitest";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import {
  LEGAL_DOCUMENTS,
  findLegalDocument,
  legalDocumentById,
  legalPath,
  legalSlugs,
} from "./index";
import type { LegalBlock } from "./types";

/**
 * Lo que se protege: que los documentos legales no se desincronicen entre idiomas
 * ni queden a medias. El modo de fallo real no es una excepción en tiempo de
 * ejecución —un texto vacío se renderiza tan feliz— sino una cláusula que en
 * inglés dice algo distinto que en español, o que directamente no está. Eso es
 * exactamente lo que nadie ve hasta que un cliente lo lee.
 */

function blockTexts(block: LegalBlock, locale: Locale): string[] {
  if (block.kind === "ul") return [...block.items[locale]];
  return [block.text[locale]];
}

describe("documentos legales · integridad", () => {
  it("hay documentos y ninguno repite identificador", () => {
    expect(LEGAL_DOCUMENTS.length).toBeGreaterThanOrEqual(4);
    const ids = LEGAL_DOCUMENTS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("los slugs son únicos dentro de cada idioma", () => {
    for (const locale of LOCALES) {
      const slugs = legalSlugs(locale);
      expect(new Set(slugs).size, `slugs duplicados en ${locale}`).toBe(slugs.length);
    }
  });

  it("los slugs son válidos para una URL", () => {
    for (const doc of LEGAL_DOCUMENTS) {
      for (const locale of LOCALES) {
        expect(doc.slug[locale], `${doc.id}.${locale}`).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it("cada documento tiene título, resumen y fecha en ambos idiomas", () => {
    for (const doc of LEGAL_DOCUMENTS) {
      expect(doc.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const locale of LOCALES) {
        expect(doc.title[locale]?.trim(), `${doc.id}.title.${locale}`).toBeTruthy();
        expect(doc.summary[locale]?.length, `${doc.id}.summary.${locale}`).toBeGreaterThan(20);
      }
    }
  });

  it("las anclas de sección son únicas dentro de cada documento", () => {
    for (const doc of LEGAL_DOCUMENTS) {
      const ids = doc.sections.map((s) => s.id);
      expect(new Set(ids).size, `anclas duplicadas en ${doc.id}`).toBe(ids.length);
    }
  });

  /** PARIDAD: ninguna frase puede faltar en un idioma. */
  it("ningún bloque está vacío en ninguno de los dos idiomas", () => {
    const empty: string[] = [];
    for (const doc of LEGAL_DOCUMENTS) {
      for (const section of doc.sections) {
        for (const [i, block] of section.blocks.entries()) {
          for (const locale of LOCALES) {
            const texts = blockTexts(block, locale);
            if (texts.length === 0 || texts.some((t) => !t || t.trim().length < 10)) {
              empty.push(`${doc.id}/${section.id}[${i}].${locale}`);
            }
          }
        }
      }
    }
    expect(empty).toEqual([]);
  });

  it("las listas tienen el mismo número de puntos en ambos idiomas", () => {
    const mismatched: string[] = [];
    for (const doc of LEGAL_DOCUMENTS) {
      for (const section of doc.sections) {
        for (const [i, block] of section.blocks.entries()) {
          if (block.kind !== "ul") continue;
          if (block.items.es.length !== block.items.en.length) {
            mismatched.push(
              `${doc.id}/${section.id}[${i}]: es=${block.items.es.length} en=${block.items.en.length}`,
            );
          }
        }
      }
    }
    expect(mismatched).toEqual([]);
  });

  /**
   * Detecta el "traduzco luego": un párrafo largo idéntico en los dos idiomas es,
   * en la práctica, español sin traducir copiado en el campo inglés.
   */
  it("ningún texto largo se quedó sin traducir (es idéntico a en)", () => {
    const untranslated: string[] = [];
    for (const doc of LEGAL_DOCUMENTS) {
      for (const section of doc.sections) {
        for (const [i, block] of section.blocks.entries()) {
          const es = blockTexts(block, "es");
          const en = blockTexts(block, "en");
          for (let j = 0; j < es.length; j++) {
            if (es[j].length > 60 && es[j] === en[j]) {
              untranslated.push(`${doc.id}/${section.id}[${i}][${j}]`);
            }
          }
        }
      }
      if (doc.title.es === doc.title.en && doc.title.es.length > 20) {
        untranslated.push(`${doc.id}/title`);
      }
    }
    expect(untranslated).toEqual([]);
  });
});

describe("documentos legales · rutas", () => {
  it("la ruta española no lleva prefijo y la inglesa sí", () => {
    const privacy = legalDocumentById("privacy");
    expect(privacy).not.toBeNull();
    expect(legalPath(privacy!, "es")).toBe("/legal/privacidad");
    expect(legalPath(privacy!, "en")).toBe("/en/legal/privacy");
  });

  it("cada documento se encuentra por su slug en su propio idioma", () => {
    for (const doc of LEGAL_DOCUMENTS) {
      for (const locale of LOCALES) {
        expect(findLegalDocument(doc.slug[locale], locale)?.id).toBe(doc.id);
      }
    }
  });

  /**
   * Un slug de otro idioma NO debe resolver: si `/legal/privacy` (inglés) sirviera
   * la página española, tendríamos dos URL con el mismo contenido y el canonical
   * dejaría de significar nada.
   */
  it("un slug del otro idioma no resuelve", () => {
    expect(findLegalDocument("privacy", "es")).toBeNull();
    expect(findLegalDocument("privacidad", "en")).toBeNull();
  });

  it("un slug inventado devuelve null en vez de lanzar", () => {
    expect(findLegalDocument("no-existe", "es")).toBeNull();
    expect(legalDocumentById("no-existe")).toBeNull();
  });
});
