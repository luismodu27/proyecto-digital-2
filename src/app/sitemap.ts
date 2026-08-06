import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n/metadata";
import { LEGAL_DOCUMENTS, legalPath } from "@/lib/legal";
import { IS_LEGAL_PUBLISHABLE } from "@/lib/legal/entity";

/**
 * Sitemap de la web pública. Solo las rutas indexables (landing es/en y los
 * documentos legales); el dashboard y auth quedan fuera (tras sesión, no se
 * indexan). Cada entrada declara sus alternantes hreflang para reforzar la
 * relación es↔en.
 *
 * Los documentos legales SOLO entran si hay responsable identificado, la misma
 * condición que gobierna su `noindex`. Listar en el sitemap una página marcada
 * como `noindex` es pedirle a Google que visite algo y decirle acto seguido que
 * no lo mire: contradictorio, y una señal de descuido justo en la sección donde
 * el lector está evaluando si el proveedor es serio.
 */

/**
 * `force-dynamic` NO es un capricho: sin él este fichero se prerenderiza en el
 * build y las páginas legales no. Rellenar los datos del responsable en el panel
 * de Vercel haría entonces que las páginas dejaran de ser `noindex` mientras el
 * sitemap seguía sin listarlas, hasta el siguiente despliegue — exactamente la
 * divergencia silenciosa que el resto de este fichero existe para evitar.
 * Comprobado levantando el servidor con las variables puestas: estáticas, las dos
 * mitades discrepaban. Un sitemap se pide de higos a brevas; renderizarlo en cada
 * petición no cuesta nada frente a eso.
 */
export const dynamic = "force-dynamic";
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { es: `${SITE_URL}/`, en: `${SITE_URL}/en` };

  const landing: MetadataRoute.Sitemap = [
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

  if (!IS_LEGAL_PUBLISHABLE) return landing;

  const legal: MetadataRoute.Sitemap = LEGAL_DOCUMENTS.flatMap((doc) => {
    const docLanguages = {
      es: `${SITE_URL}${legalPath(doc, "es")}`,
      en: `${SITE_URL}${legalPath(doc, "en")}`,
    };
    return [
      {
        url: docLanguages.es,
        lastModified: doc.updated,
        changeFrequency: "yearly" as const,
        priority: 0.4,
        alternates: { languages: docLanguages },
      },
      {
        url: docLanguages.en,
        lastModified: doc.updated,
        changeFrequency: "yearly" as const,
        priority: 0.4,
        alternates: { languages: docLanguages },
      },
    ];
  });

  return [...landing, ...legal];
}
