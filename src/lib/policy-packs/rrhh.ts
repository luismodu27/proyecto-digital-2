/**
 * Policy pack — Reclutamiento y selección de personal (RRHH).
 *
 * Catálogo de controles/obligaciones típicos de un sistema de IA de selección,
 * pensado para un DEPLOYER mid-market. Precarga las brechas de un gap assessment.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Contenido verificado por el
 * subagente `compliance-domain-expert`.
 */

export type PolicySeverity = "alta" | "media" | "baja";

export type PolicyControl = {
  id: string;
  title: string;
  /** Qué hacer, en contexto de reclutamiento. */
  description: string;
  article: string;
  severity: PolicySeverity;
};

export type PolicyPack = {
  id: string;
  name: string;
  summary: string;
  controls: PolicyControl[];
};

export const RRHH_PACK: PolicyPack = {
  id: "rrhh",
  name: "Reclutamiento y selección",
  summary:
    "Controles típicos para IA de selección de personal (alto riesgo, Anexo III). Aplícalo a un sistema para precargar sus brechas.",
  controls: [
    {
      id: "supervision-humana",
      title: "Supervisión humana en la decisión",
      description:
        "Una persona competente revisa y puede anular la recomendación de la IA antes de descartar o avanzar a un candidato.",
      article: "Art. 14",
      severity: "alta",
    },
    {
      id: "sesgo",
      title: "Control de sesgo y no discriminación",
      description:
        "Prueba periódicamente el sistema por sesgo frente a características protegidas (género, edad, origen, discapacidad) y documenta los resultados.",
      article: "Art. 10",
      severity: "alta",
    },
    {
      id: "decision-automatizada",
      title: "Decisión no meramente automatizada (GDPR)",
      description:
        "Garantiza intervención humana significativa y el derecho del candidato a obtener explicación y a impugnar decisiones automatizadas.",
      article: "GDPR Art. 22",
      severity: "alta",
    },
    {
      id: "transparencia-candidato",
      title: "Transparencia al candidato",
      description:
        "Informa a las personas candidatas de que se usa IA en el proceso, con qué finalidad y qué datos se tratan.",
      article: "Art. 50",
      severity: "media",
    },
    {
      id: "info-trabajadores",
      title: "Información a los trabajadores y sus representantes",
      description:
        "Antes de poner en uso la IA en el puesto de trabajo, informa a los trabajadores afectados y a sus representantes.",
      article: "Art. 26.7",
      severity: "media",
    },
    {
      id: "datos-entrada",
      title: "Datos de entrada pertinentes",
      description:
        "Asegura que los datos que introduces (CVs, criterios del puesto) son pertinentes y representativos para la finalidad prevista.",
      article: "Art. 26.4",
      severity: "media",
    },
    {
      id: "documentacion",
      title: "Documentación técnica e instrucciones",
      description:
        "Exige al proveedor la documentación técnica (Anexo IV) y las instrucciones de uso, y consérvalas como evidencia.",
      article: "Art. 11",
      severity: "media",
    },
    {
      id: "logs",
      title: "Conservación de registros (logs)",
      description:
        "Mantén el logging activo y conserva los registros bajo tu control durante al menos 6 meses.",
      article: "Art. 12",
      severity: "media",
    },
    {
      id: "dpia",
      title: "Evaluación de impacto de protección de datos (DPIA)",
      description:
        "El tratamiento de datos de candidatos con evaluación sistemática suele requerir una DPIA bajo el RGPD; realízala y documéntala.",
      article: "GDPR Art. 35",
      severity: "alta",
    },
  ],
};
