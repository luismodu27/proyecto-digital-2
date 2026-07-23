import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n/metadata";

/**
 * Robots. Se permite el rastreo de la web pública; se excluyen las rutas tras
 * sesión (dashboard, auth, callbacks) que no deben indexarse.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/login", "/reset-password", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
