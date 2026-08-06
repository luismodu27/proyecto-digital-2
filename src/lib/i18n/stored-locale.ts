/**
 * Idioma del texto YA ESCRITO en la base de datos (brechas, evaluaciones).
 *
 * El chrome de la UI se traduce en cada render, pero el contenido regulatorio se
 * **persiste**: al aplicar un policy pack se copian los títulos y artículos de sus
 * controles a `gap_items`, y al guardar una clasificación se copia su motivación a
 * `risk_assessments`. Ese texto queda congelado en el idioma que estaba activo. Si
 * luego se cambia a inglés, la pantalla sale mezclada — y hasta ahora **nadie sabía
 * en qué idioma estaba** cada fila, así que no se podía ni traducir ni etiquetar.
 *
 * Este módulo resuelve la mitad de accesibilidad del problema: qué valor de `lang`
 * poner (o no poner) en el nodo que muestra ese texto.
 *
 * Las tres reglas, y por qué:
 *
 * 1. **Desconocido ⇒ no se etiqueta.** Las filas anteriores a la migración 0033 no
 *    llevan idioma y NO se rellenan a ciegas: el default es español, pero una org
 *    que trabajase en inglés tendría filas inglesas marcadas como españolas. Un
 *    `lang` equivocado es PEOR que ninguno — el lector de pantalla cambia de voz y
 *    pronuncia con la fonética del idioma que no es, mientras que sin atributo
 *    hereda el de la página, que es exactamente el comportamiento de hoy.
 * 2. **Igual al de la UI ⇒ no se etiqueta.** Sería redundante con el `<html lang>`
 *    del layout, y ensuciaría el DOM en el caso mayoritario.
 * 3. **Distinto ⇒ se etiqueta con el idioma real del texto.** Es el único caso en
 *    el que el atributo aporta algo: WCAG 3.1.2 (Idioma de las partes).
 */
import { isLocale, type Locale } from "./config";

/** Idioma de un contenido persistido. `null` = no se registró (fila anterior a 0033). */
export type StoredLocale = Locale | null;

/**
 * Normaliza el valor crudo de la columna `locale`.
 *
 * NO es `coerceLocale`: aquel cae al default y aquí eso sería **inventarse un dato**
 * (ver regla 1). Lo desconocido se queda desconocido.
 */
export function coerceStoredLocale(value: unknown): StoredLocale {
  return isLocale(value) ? value : null;
}

/**
 * Valor del atributo `lang` para un texto persistido, o `undefined` si no debe
 * llevarlo. Pensado para escribirse directo en JSX: `<p lang={langAttr(a, b)}>`,
 * donde `undefined` hace que React omita el atributo.
 */
export function langAttr(
  stored: StoredLocale | undefined,
  ui: Locale,
): Locale | undefined {
  const s = coerceStoredLocale(stored);
  if (s === null) return undefined;
  return s === ui ? undefined : s;
}

/**
 * `true` cuando el texto guardado está en un idioma distinto del de la interfaz y
 * lo sabemos con certeza. Es la señal para avisar al usuario de que lo que ve no
 * está traducido, en vez de dejar que parezca un fallo de la aplicación.
 */
export function isForeignContent(
  stored: StoredLocale | undefined,
  ui: Locale,
): boolean {
  return langAttr(stored, ui) !== undefined;
}

/**
 * Idiomas presentes en una lista de contenidos persistidos que NO coinciden con el
 * de la interfaz, sin repetir y en orden estable. Sirve para poner **un** aviso por
 * pantalla ("hay contenido en español") en vez de uno por fila.
 */
export function foreignLocales(
  items: readonly { locale?: StoredLocale }[],
  ui: Locale,
): Locale[] {
  const out: Locale[] = [];
  for (const item of items) {
    const l = langAttr(item.locale, ui);
    if (l && !out.includes(l)) out.push(l);
  }
  return out;
}
