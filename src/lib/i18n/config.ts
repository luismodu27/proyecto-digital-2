/**
 * Configuración base de i18n (español default + inglés).
 *
 * Estrategia (ver MEMORY §i18n): híbrido. La web pública tiene URL real `/en`
 * (para SEO/hreflang); auth + dashboard resuelven el locale por cookie
 * `NEXT_LOCALE` sin cambiar la URL.
 *
 * IMPORTANTE — frontera legal: los diccionarios de i18n contienen SOLO "chrome"
 * de UI (navegación, botones, labels, títulos, estados vacíos, toasts). El
 * contenido regulatorio determinista validado por el experto (policy-packs,
 * risk-assessment, recommendations, regulatory-watch, dossier/informe) NO se
 * traduce ni entra aquí hasta que el experto valide la versión inglesa.
 */

export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

/** Nombre convencional de la cookie de idioma. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Cabecera que el middleware raíz inyecta para que el root layout sepa el locale. */
export const LOCALE_HEADER = "x-attesta-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Devuelve un Locale válido o el default, sin lanzar. */
export function coerceLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
