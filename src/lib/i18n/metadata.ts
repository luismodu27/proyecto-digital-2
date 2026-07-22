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

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://attesta-io.vercel.app";

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
    },
    twitter: {
      title: m.ogTitle,
      description: m.description,
    },
  };
}
