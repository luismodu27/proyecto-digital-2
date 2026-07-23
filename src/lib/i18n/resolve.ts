/**
 * Resolución del locale en el servidor (para auth + dashboard, que no llevan
 * prefijo `/en` en la URL). Precedencia: cookie `NEXT_LOCALE` válida → default.
 *
 * En rutas públicas con URL propia (`/`, `/en`) NO se usa esto: el locale lo
 * sabe la propia ruta y se pasa como prop.
 */
import { cookies, headers } from "next/headers";
import { coerceLocale, DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, type Locale } from "./config";

/** Lee el locale desde la cookie (Server Component / Server Action / route). */
export async function resolveLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return coerceLocale(raw ?? DEFAULT_LOCALE);
}

/**
 * Lee el locale que el middleware raíz ya resolvió y colocó en la cabecera
 * `x-attesta-locale` (precedencia URL → cookie → default). Úsalo en el root
 * layout para `<html lang>` sin volver a calcular la precedencia.
 */
export async function localeFromHeader(): Promise<Locale> {
  const h = await headers();
  return coerceLocale(h.get(LOCALE_HEADER) ?? undefined);
}
