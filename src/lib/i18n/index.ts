/**
 * Punto de acceso a los diccionarios.
 *
 * `Dictionary` se deriva de la fuente canónica `es` → cualquier divergencia de
 * `en` es un error de compilación. Los diccionarios son estáticos y pequeños
 * (solo chrome de UI), así que se importan directamente; si el bundle cliente
 * creciera, `getDictionary` podría pasar a `import()` dinámico sin cambiar los
 * call-sites.
 */
import type { Locale } from "./config";
import { es } from "./dictionaries/es";
import { en } from "./dictionaries/en";

export type Dictionary = typeof es;

const DICTIONARIES: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
