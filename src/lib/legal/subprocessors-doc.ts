/**
 * Texto que acompaña a la tabla de subprocesadores.
 *
 * La tabla en sí NO está aquí: sale de `subprocessors.ts`, que es el registro que
 * el guard verifica contra el código. Este fichero solo aporta el marco —qué es
 * esta lista, cómo se mantiene y qué derecho tiene el cliente cuando cambia—
 * porque una tabla sin ese marco no responde a la pregunta que trae el lector,
 * que no es "quiénes son" sino "qué pasa cuando añadís uno nuevo".
 */
import type { LegalDocument } from "./types";

export const SUBPROCESSORS_DOC: LegalDocument = {
  id: "subprocessors",
  slug: { es: "subprocesadores", en: "subprocessors" },
  title: {
    es: "Subprocesadores",
    en: "Sub-processors",
  },
  summary: {
    es: "Los terceros que intervienen en el servicio, qué recibe cada uno y dónde lo trata.",
    en: "The third parties involved in the service, what each receives, and where it processes it.",
  },
  updated: "2026-08-04",
  sections: [
    {
      id: "que-es",
      heading: {
        es: "Qué es esta lista",
        en: "What this list is",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Para prestar el servicio, Attesta se apoya en un número reducido de proveedores. Esta es la lista completa. Se distingue entre los que tratan datos de organizaciones clientes —los subencargados en el sentido del art. 28 RGPD— y los que solo intervienen sobre el corpus normativo público del radar de vigilancia.",
            en: "To provide the service, Attesta relies on a small number of providers. This is the complete list. It distinguishes those that process customer organizations' data — sub-processors within the meaning of Art. 28 GDPR — from those that only handle the public regulatory corpus behind the monitoring radar.",
          },
        },
        {
          kind: "note",
          text: {
            es: "Esta lista no se mantiene a mano. Sale del mismo registro que usa el código, y hay una prueba automática que falla si el producto empieza a enviar datos a un dominio que no aparezca aquí. Es la razón por la que se puede afirmar que está completa en lugar de esperar que lo esté.",
            en: "This list is not maintained by hand. It comes from the same registry the code uses, and an automated test fails if the product starts sending data to a domain not listed here. That is why it can be asserted to be complete rather than hoped to be.",
          },
        },
      ],
    },
    {
      id: "cambios",
      heading: {
        es: "Qué pasa cuando cambia",
        en: "What happens when it changes",
      },
      blocks: [
        {
          kind: "p",
          text: {
            es: "Antes de incorporar un subencargado nuevo que vaya a tratar datos de organizaciones clientes, se avisa por correo electrónico con al menos 30 días de antelación. Durante ese plazo, cualquier organización cliente puede oponerse por motivos razonables de protección de datos, según lo previsto en el Acuerdo de Tratamiento de Datos.",
            en: "Before engaging a new sub-processor that will process customer organizations' data, notice is given by email at least 30 days in advance. During that period, any customer organization may object on reasonable data protection grounds, as set out in the Data Processing Agreement.",
          },
        },
      ],
    },
  ],
};
