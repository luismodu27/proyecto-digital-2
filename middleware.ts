import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { buildCsp, generateNonce } from "@/lib/security/csp";
import {
  coerceLocale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  type Locale,
} from "@/lib/i18n/config";

/**
 * Resuelve el locale de la request para el `<html lang>` del layout raíz.
 *
 * En la web pública manda la RUTA, no la cookie, y en las dos direcciones:
 * `/en` es inglés aunque la cookie diga español, y `/` es español aunque la
 * cookie diga inglés. Lo segundo faltaba y era un fallo de accesibilidad en la
 * página más visitada: `/` sirve la landing en español siempre —el componente
 * recibe `locale="es"` fijo— pero con la cookie en inglés se anunciaba como
 * `lang="en"`. Un lector de pantalla se creía la etiqueta y leía el español con
 * fonética inglesa. La cookie sigue mandando en el resto (auth y dashboard), que
 * no llevan el idioma en la URL.
 */
/**
 * Rutas públicas cuyo idioma lo fija la URL, no la cookie. Cada una tiene su
 * gemela bajo `/en`, así que la versión sin prefijo sirve español SIEMPRE y
 * anunciarla de otro modo es mentirle al lector de pantalla.
 */
const PATH_DEFINES_LOCALE = ["/legal"];

function resolveRequestLocale(request: NextRequest): Locale {
  const { pathname } = request.nextUrl;
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/") return DEFAULT_LOCALE;
  if (PATH_DEFINES_LOCALE.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return DEFAULT_LOCALE;
  }
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  return coerceLocale(cookie ?? DEFAULT_LOCALE);
}

export async function middleware(request: NextRequest) {
  const locale = resolveRequestLocale(request);
  // Inyecta el locale como cabecera de request para que el root layout lo lea
  // (via headers()) y ponga <html lang>. updateSession reusa este mismo request
  // al construir su NextResponse.next({ request }), así que la cabecera propaga.
  request.headers.set(LOCALE_HEADER, locale);

  // CSP: nonce por request. Se expone al layout (via `x-nonce`) para el script
  // inline de tema. La cabecera se fija en request antes de updateSession para
  // que propague, y en la respuesta para que el navegador la aplique.
  const nonce = generateNonce();
  const { enforced, reportOnly } = buildCsp(nonce);
  request.headers.set("x-nonce", nonce);

  const response = await updateSession(request);
  // Refleja el locale también en la respuesta (útil para debug/edge caches).
  response.headers.set(LOCALE_HEADER, locale);
  // OJO al orden de lectura, comprobado ejecutándolo (ver `csp.test.ts`): Next
  // saca el nonce de la política que se manda como `Content-Security-Policy`, y
  // se la impone también a la cabecera de request que ve el servidor. Como la
  // política aplicada hoy es la "sin riesgo" y NO lleva `script-src`, Next no
  // encuentra nonce y no se lo pone a sus scripts inline. Es coherente: no hay
  // nada que aplicar todavía. Al promover la estricta a `enforce`, el nonce pasa
  // a estar en esta cabecera y Next empieza a inyectarlo solo — comprobado: de
  // 44 scripts inline sin nonce a 45 con él, sin tocar una línea de la app.
  // Consecuencia para la validación: las violaciones de `script-src` que reporta
  // hoy el Report-Only son ESPERADAS y desaparecen al promover; no son un motivo
  // para no promover (ver PENDIENTES §0.4).
  response.headers.set("Content-Security-Policy", enforced);
  response.headers.set("Content-Security-Policy-Report-Only", reportOnly);
  return response;
}

export const config = {
  matcher: [
    /*
     * Todas las rutas excepto assets estáticos e imágenes.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
