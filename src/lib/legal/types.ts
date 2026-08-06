/**
 * Modelo de los documentos legales de Attesta.
 *
 * POR QUÉ BILINGÜE Y ESTRUCTURADO, en vez de dos ficheros de prosa. Un aviso de
 * privacidad en dos idiomas se desincroniza en la tercera corrección: alguien
 * ajusta el plazo de conservación en español y el inglés se queda diciendo otra
 * cosa. Dos documentos legales que dicen cosas distintas es peor que tener uno
 * solo. Con la estructura compartida, cada párrafo lleva sus dos versiones al
 * lado y un test comprueba que ninguna se queda vacía o sin traducir.
 *
 * POR QUÉ NO ESTÁ EN EL DICCIONARIO i18n: la frontera legal del proyecto. El
 * diccionario es "chrome" de interfaz (botones, títulos, estados vacíos) y se
 * traduce con criterio de producto. Esto es texto legal y se traduce con criterio
 * legal. Mezclarlos acaba con alguien "mejorando el tono" de una cláusula.
 */
import type { Locale } from "@/lib/i18n/config";

export type LegalBlock =
  | { kind: "p"; text: Record<Locale, string> }
  | { kind: "ul"; items: Record<Locale, readonly string[]> }
  /**
   * Punto que el lector debe poder localizar y citar (plazos, derechos,
   * responsabilidades). Se renderiza destacado.
   */
  | { kind: "note"; text: Record<Locale, string> };

export type LegalSection = {
  /** Ancla estable de la URL. No cambiar: la gente enlaza a cláusulas concretas. */
  id: string;
  heading: Record<Locale, string>;
  blocks: readonly LegalBlock[];
};

export type LegalDocument = {
  id: string;
  /** Ruta por idioma. En español la URL es española; en inglés, inglesa. */
  slug: Record<Locale, string>;
  title: Record<Locale, string>;
  /** Una frase: qué es este documento y para quién. Va bajo el título y en el <meta>. */
  summary: Record<Locale, string>;
  /** Fecha de la última revisión sustantiva (ISO). */
  updated: string;
  sections: readonly LegalSection[];
};
