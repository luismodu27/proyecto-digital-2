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
 * Resuelve el locale con precedencia URL → cookie → default. La URL gana para
 * que un crawler sin cookie que aterrice en `/en` reciba `lang="en"`.
 */
function resolveRequestLocale(request: NextRequest): Locale {
  const { pathname } = request.nextUrl;
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
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
