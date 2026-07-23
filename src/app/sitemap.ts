import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n/metadata";

/**
 * Sitemap de la web pública. Solo las rutas indexables (landing es/en); el
 * dashboard y auth quedan fuera (tras sesión, no se indexan). Cada entrada
 * declara sus alternantes hreflang para reforzar la relación es↔en.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { es: `${SITE_URL}/`, en: `${SITE_URL}/en` };
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/en`,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    },
  ];
}
