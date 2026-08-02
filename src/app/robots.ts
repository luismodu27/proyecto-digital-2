import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n/metadata";

/**
 * Robots. Se permite el rastreo de la web pública.
 *
 * Las rutas tras sesión (dashboard, login, onboarding, reset) **ya no se
 * bloquean aquí**: llevan `robots: { index: false }` en su metadata, y las dos
 * cosas se estorban. `Disallow` prohíbe *rastrear*, no *indexar*: si el
 * buscador no puede entrar, tampoco ve el `noindex`, así que un enlace externo
 * puede meter la URL en resultados igualmente (esos listados de "no hay
 * información disponible"). Para sacar una página del índice hay que dejar que
 * la lean y que encuentren el `noindex` dentro — que es lo que hacemos ahora.
 *
 * `/auth` y `/api` sí se quedan: son route handlers (callback de OAuth,
 * telemetría) que devuelven redirecciones o JSON, no HTML, y por tanto no
 * tienen dónde colgar un meta. Ahí robots.txt es la única palanca.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
