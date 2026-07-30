import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Refresca la sesión de Supabase y protege las rutas privadas.
 * En MODO DEMO (sin credenciales) es un no-op: el dashboard queda abierto.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured) return supabaseResponse;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // `getClaims()` en vez de `getUser()`: verifica la FIRMA del JWT en local con
  // WebCrypto (el JWKS se cachea) en lugar de preguntar a Supabase Auth por red en
  // CADA navegación. Antes, cada clic del dashboard pagaba una ida y vuelta en el
  // camino crítico.
  //
  // Requisito comprobado (no supuesto): el proyecto firma con llaves ASIMÉTRICAS
  // — los tokens llegan con `alg: ES256` y hay JWKS público en
  // `/auth/v1/.well-known/jwks.json` —, que es la condición para que la
  // verificación sea local. Con el secreto simétrico heredado `getClaims` haría la
  // misma llamada que `getUser` (correcto igualmente, solo sin la mejora).
  //
  // La seguridad no baja: se verifica la firma, no se confía en la cookie. E igual
  // que `getUser`, refresca la sesión si el token está por expirar, así que las
  // cookies se siguen renovando aquí.
  let hasSession = false;
  try {
    const { data, error } = await supabase.auth.getClaims();
    hasSession = !error && !!data?.claims?.sub;
  } catch {
    // Error de red/config: trátalo como sin sesión, no rompas la navegación.
  }

  const { pathname } = request.nextUrl;
  const isPrivate = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/onboarding";

  if (!hasSession && isPrivate) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  void isAuthPage;
  return supabaseResponse;
}
