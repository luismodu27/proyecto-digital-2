import { SITE_URL } from "@/lib/i18n/metadata";
import { PLAN_PRICE_LABEL } from "@/lib/stripe/config";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * Datos estructurados (JSON-LD, schema.org) de la web pública.
 *
 * Por qué: sin ellos Google no puede mostrar resultados enriquecidos y no
 * entiende qué ES Attesta ni de qué categoría de producto se trata. El FAQ ya
 * existe perfectamente estructurado en el diccionario, así que el `FAQPage` sale
 * gratis del contenido que ya mantenemos — no se duplica copy.
 *
 * Se emite un solo `@graph` con tres nodos: Organization, SoftwareApplication y
 * FAQPage. Todo el texto viene del diccionario (queda bilingüe automáticamente).
 *
 * OJO con la CSP: el script lleva `type="application/ld+json"`, que NO es
 * ejecutable, por lo que no necesita el nonce de `script-src`. Aun así se
 * serializa escapando `<` para que ninguna cadena del diccionario pueda cerrar
 * la etiqueta e inyectar marcado.
 */
export function StructuredData({
  locale,
  t,
}: {
  locale: Locale;
  t: Dictionary;
}) {
  const path = locale === "en" ? "/en" : "/";
  const pageUrl = `${SITE_URL}${path}`;

  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: "Attesta",
    url: SITE_URL,
    logo: `${SITE_URL}/sealmark.png`,
    description: t.meta.description,
  };

  const application = {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}#software`,
    name: "Attesta",
    url: pageUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: t.meta.description,
    publisher: { "@id": `${SITE_URL}#organization` },
    inLanguage: locale,
    // Dos ofertas reales: el plan gratuito y el de pago. El precio sale de la
    // misma constante que la UI y el checkout, para que no se desincronicen.
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: t.landing.pricing.tiers[0]?.name,
      },
      {
        "@type": "Offer",
        price: PLAN_PRICE_LABEL.replace(/[^0-9.]/g, ""),
        priceCurrency: "USD",
        name: t.landing.pricing.tiers[1]?.name,
      },
    ],
  };

  const faq = {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: t.landing.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [organization, application, faq],
  };

  return (
    <script
      type="application/ld+json"
      // `<` escapado: impide que cualquier texto del diccionario cierre la
      // etiqueta `</script>` y se convierta en marcado.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
