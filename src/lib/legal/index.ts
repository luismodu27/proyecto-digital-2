/**
 * Registro de documentos legales + resolución de rutas.
 *
 * Una sola lista de la que salen: las rutas estáticas (`generateStaticParams`),
 * el índice del pie de página, las entradas del sitemap y los enlaces cruzados
 * entre documentos. Añadir un documento es añadirlo aquí y aparece en los cuatro
 * sitios; no hay una segunda lista que se quede atrás.
 *
 * LAS URLS SON DISTINTAS EN CADA IDIOMA a propósito (`/legal/privacidad` frente a
 * `/en/legal/privacy`). Una URL legal en español que se llama `privacy` parece un
 * despiste de traducción justo en la página donde el lector está evaluando si te
 * toma en serio. El coste es tener que resolver el slug por idioma, que es este
 * fichero.
 */
import type { Locale } from "@/lib/i18n/config";
import type { LegalDocument } from "./types";
import { PRIVACY_DOC } from "./privacy";
import { COOKIES_DOC } from "./cookies";
import { DPA_DOC } from "./dpa";
import { SUBPROCESSORS_DOC } from "./subprocessors-doc";

export type { LegalDocument, LegalSection, LegalBlock } from "./types";

/** Orden en que se listan en el pie: del más general al más contractual. */
export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  PRIVACY_DOC,
  COOKIES_DOC,
  SUBPROCESSORS_DOC,
  DPA_DOC,
];

/** Prefijo común de todas las rutas legales. */
export const LEGAL_BASE = "/legal";

/** Ruta pública de un documento en un idioma (incluye el prefijo `/en`). */
export function legalPath(doc: LegalDocument, locale: Locale): string {
  const prefix = locale === "en" ? "/en" : "";
  return `${prefix}${LEGAL_BASE}/${doc.slug[locale]}`;
}

/** Busca un documento por su slug en un idioma concreto. `null` si no existe. */
export function findLegalDocument(
  slug: string,
  locale: Locale,
): LegalDocument | null {
  return LEGAL_DOCUMENTS.find((doc) => doc.slug[locale] === slug) ?? null;
}

/** Busca por identificador estable, para enlaces cruzados entre documentos. */
export function legalDocumentById(id: string): LegalDocument | null {
  return LEGAL_DOCUMENTS.find((doc) => doc.id === id) ?? null;
}

/** Todos los slugs de un idioma (rutas estáticas). */
export function legalSlugs(locale: Locale): string[] {
  return LEGAL_DOCUMENTS.map((doc) => doc.slug[locale]);
}
