import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site-url";
import { findLegalDocument, legalPath } from "@/lib/legal";
import { IS_LEGAL_PUBLISHABLE } from "@/lib/legal/entity";
import { LegalDocumentView } from "./LegalDocumentView";
import { DraftNotice } from "./DraftNotice";

/**
 * Envoltorio compartido por `/legal/[slug]` y `/en/legal/[slug]`.
 *
 * Las dos rutas existen de verdad (no es una redirección) porque el slug es
 * distinto en cada idioma y ambas deben poder indexarse con su canonical y su
 * hreflang recíproco, igual que `/` y `/en`.
 *
 * EL `noindex` ESTÁ ATADO AL MISMO BOOLEANO que el aviso de borrador
 * (`IS_LEGAL_PUBLISHABLE`), no calculado aparte. Si fueran dos condiciones
 * distintas acabarían divergiendo, y la forma en que divergirían es la mala: una
 * página marcada como borrador para el lector pero indexable para Google.
 */

export function buildLegalMetadata(slug: string, locale: Locale): Metadata {
  const doc = findLegalDocument(slug, locale);
  if (!doc) return {};

  return {
    title: doc.title[locale],
    description: doc.summary[locale],
    alternates: {
      canonical: legalPath(doc, locale),
      languages: {
        es: legalPath(doc, "es"),
        en: legalPath(doc, "en"),
        "x-default": legalPath(doc, "es"),
      },
    },
    // Un documento sin responsable identificado no debe circular como definitivo.
    robots: IS_LEGAL_PUBLISHABLE ? undefined : { index: false, follow: true },
    openGraph: {
      title: doc.title[locale],
      description: doc.summary[locale],
      locale: locale === "en" ? "en_US" : "es_ES",
      url: `${SITE_URL}${legalPath(doc, locale)}`,
      type: "article",
    },
  };
}

export function LegalPageShell({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const doc = findLegalDocument(slug, locale);
  if (!doc) notFound();

  const t = getDictionary(locale);
  const nav = [
    { label: t.nav.product, href: locale === "en" ? "/en#producto" : "/#producto" },
    { label: t.nav.pricing, href: locale === "en" ? "/en#precios" : "/#precios" },
    { label: t.nav.faq, href: locale === "en" ? "/en#faq" : "/#faq" },
  ];

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        {t.common.skipToContent}
      </a>
      <SiteHeader nav={nav} t={t} locale={locale} />
      <DraftNotice t={t.legal} />
      <main id="contenido">
        <LegalDocumentView doc={doc} locale={locale} t={t.legal} />
      </main>
      <SiteFooter t={t.landing.footer} locale={locale} />
    </>
  );
}
