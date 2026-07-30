import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * Cliente de Supabase para Server Components / Route Handlers (Next.js 16).
 * En Next 16 `cookies()` es asíncrono.
 *
 * Envuelto en `cache()` de React: una página del dashboard llama a varios
 * getters de la fachada de datos (`Promise.all([...])`) y cada uno pedía su
 * propio cliente, releyendo cookies y reconstruyendo el objeto. Con `cache()`
 * se crea UNO por render (request) y todos lo comparten. No cambia el
 * comportamiento: el cliente ya era sin estado entre llamadas, y `cache()` no
 * cruza requests, así que no hay riesgo de filtrar sesión entre usuarios.
 */
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Llamado desde un Server Component sin respuesta mutable: se ignora.
          // El refresco de sesión lo maneja el middleware.
        }
      },
    },
  });
});
