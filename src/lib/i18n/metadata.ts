/**
 * Metadata SEO por locale para la web pública (landing). Genera title,
 * description, canonical, hreflang (`alternates.languages`) y OpenGraph con el
 * `locale` correcto, para que `/` (es) y `/en` (en) se indexen bien y se
 * referencien mutuamente.
 *
 * Solo chrome de UI/SEO (títulos, descripciones). Sin contenido regulatorio.
 */
import type { Metadata } from "next";
import type { Locale } from "./config";
import { getDictionary } from "./index";
import { SITE_URL } from "@/lib/site-url";

// Se reexporta para no tocar los importadores existentes (sitemap, robots), pero
// la resolución y su fail-fast viven en un solo sitio.
export { SITE_URL } from "@/lib/site-url";

// hreflang recíproco compartido por ambas rutas (+ x-default apuntando a es).
const LANGUAGES = { es: "/", en: "/en", "x-default": "/" };

export function buildLandingMetadata(locale: Locale): Metadata {
  const m = getDictionary(locale).meta;
  const path = locale === "en" ? "/en" : "/";
  return {
    // `absolute` evita el template "%s · Attesta" del layout (doble marca).
    title: { absolute: m.title },
    description: m.description,
    alternates: {
      canonical: path,
      languages: LANGUAGES,
    },
    openGraph: {
      title: m.ogTitle,
      description: m.description,
      locale: locale === "en" ? "en_US" : "es_ES",
      url: `${SITE_URL}${path}`,
      // Imagen social explícita para AMBOS locales. La convención
      // `opengraph-image.png` solo se adjunta al segmento raíz (`/`), dejando
      // `/en` sin tarjeta al compartir; declararla aquí la emite en los dos.
      images: [
        { url: `${SITE_URL}/opengraph-image.png`, width: 2400, height: 1260, alt: m.ogTitle },
      ],
    },
    twitter: {
      // La imagen es 2400x1260 (apaisada) → tarjeta grande, no el thumbnail
      // recortado de `summary`.
      card: "summary_large_image",
      title: m.ogTitle,
      description: m.description,
      images: [`${SITE_URL}/twitter-image.png`],
    },
  };
}
