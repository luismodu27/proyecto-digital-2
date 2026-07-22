/**
 * Vigilancia regulatoria — radar de cambios normativos (Capa 7).
 *
 * Catálogo CURADO de eventos regulatorios (plazos, directrices, enmiendas) del
 * EU AI Act relevantes para un DEPLOYER mid-market, + un motor de relevancia
 * determinista que mapea cada evento a los sistemas afectados del inventario.
 *
 * Filosofía: igual que el resto de Attesta, el contenido es 100% curado y
 * trazable (cero LLM en la ruta legal). La automatización futura (agentes que
 * ingieren normas nuevas vía RAG) alimentará ESTE mismo modelo de datos.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Fechas y artículos
 * verificados por el subagente `compliance-domain-expert`. Fechas del Digital
 * Omnibus (aplazamiento de alto riesgo) según MEMORY.md §6.
 */

import type { AiSystem, RiskLevel } from "./mock-data";
import type { Locale } from "./i18n/config";

export type RegFramework =
  | "eu-ai-act"
  | "us-nyc-ll144"
  | "us-co-aiact"
  | "us-il-aivia"
  | "us-il-hra"
  | "us-eeoc";

/** Jurisdicción a la que pertenece un marco (para agrupar y filtrar el radar). */
export type RegJurisdiction = "eu" | "us-ny" | "us-co" | "us-il" | "us-federal";

export type FrameworkMeta = {
  /** Nombre completo de la ley/marco. */
  label: string;
  /** Etiqueta corta para pills. */
  short: string;
  jurisdiction: RegJurisdiction;
  /** Etiqueta legible de la jurisdicción (para agrupar en la UI). */
  jurisdictionLabel: string;
};

export type RegKind =
  | "deadline" // plazo de aplicación
  | "guidance" // directriz / interpretación oficial
  | "standard" // norma armonizada / estándar
  | "amendment" // enmienda / cambio del texto legal
  | "enforcement"; // sanción / decisión de una autoridad

/** A qué parte del inventario afecta un evento. */
export type RegScope = {
  /** Niveles de riesgo afectados. Ausente = no discrimina por nivel. */
  riskLevels?: RiskLevel[];
  /** Afecta a toda la organización con independencia del inventario. */
  all?: boolean;
};

export type RegulatoryEvent = {
  id: string;
  /** Fecha efectiva o de publicación (ISO, YYYY-MM-DD). */
  date: string;
  kind: RegKind;
  framework: RegFramework;
  title: string;
  /** Qué es. */
  summary: string;
  /** Qué significa para un deployer del mid-market. */
  impact: string;
  /** Qué hacer (acción concreta). */
  action: string;
  articles: string[];
  source: { label: string; url: string };
  scope: RegScope;
};

export const REG_KIND_LABEL: Record<RegKind, string> = {
  deadline: "Plazo",
  guidance: "Directriz",
  standard: "Norma",
  amendment: "Enmienda",
  enforcement: "Sanción",
};

/**
 * EN — event-kind labels (parallel to REG_KIND_LABEL, same keys/enum values).
 * Consumers (ES today): vigilancia/page.tsx (kind pill), candidatos/page.tsx
 * (candidate kind), CandidateReviewControls.tsx (kind selector). To surface EN,
 * pick this map when locale === "en"; logic/enum values are unchanged.
 */
export const REG_KIND_LABEL_EN: Record<RegKind, string> = {
  deadline: "Deadline",
  guidance: "Guidance",
  standard: "Standard",
  amendment: "Amendment",
  enforcement: "Enforcement",
};

/** Selector locale-aware de las etiquetas de tipo de evento (default ES). */
export const REG_KIND_LABEL_BY_LOCALE: Record<Locale, Record<RegKind, string>> = {
  es: REG_KIND_LABEL,
  en: REG_KIND_LABEL_EN,
};
export function regKindLabel(kind: RegKind, locale: Locale = "es"): string {
  return REG_KIND_LABEL_BY_LOCALE[locale][kind];
}

export const FRAMEWORK_META: Record<RegFramework, FrameworkMeta> = {
  "eu-ai-act": {
    label: "EU AI Act",
    short: "EU AI Act",
    jurisdiction: "eu",
    jurisdictionLabel: "Unión Europea",
  },
  "us-nyc-ll144": {
    label: "NYC Local Law 144 (AEDT)",
    short: "NYC LL144",
    jurisdiction: "us-ny",
    jurisdictionLabel: "EE. UU. — Nueva York",
  },
  "us-co-aiact": {
    label: "Colorado AI Act (SB 26-189)",
    short: "Colorado AI Act",
    jurisdiction: "us-co",
    jurisdictionLabel: "EE. UU. — Colorado",
  },
  "us-il-aivia": {
    label: "Illinois AI Video Interview Act",
    short: "IL AIVIA",
    jurisdiction: "us-il",
    jurisdictionLabel: "EE. UU. — Illinois",
  },
  "us-il-hra": {
    label: "Illinois Human Rights Act (HB 3773)",
    short: "IL HRA",
    jurisdiction: "us-il",
    jurisdictionLabel: "EE. UU. — Illinois",
  },
  "us-eeoc": {
    label: "EEOC — orientación federal",
    short: "EEOC",
    jurisdiction: "us-federal",
    jurisdictionLabel: "EE. UU. — Federal",
  },
};

/**
 * EN — framework metadata (parallel to FRAMEWORK_META). Same keys, same
 * `jurisdiction` codes; only human-facing `label`, `short`, `jurisdictionLabel`
 * are translated. Proper names of laws/frameworks are kept (EU AI Act, NYC Local
 * Law 144, Colorado AI Act, Illinois AI Video Interview Act, Illinois Human
 * Rights Act, EEOC). Consumers (ES today): vigilancia/page.tsx (framework meta +
 * jurisdiction), CandidateReviewControls.tsx (framework selector), dashboard/
 * page.tsx & informe/page.tsx (read `.jurisdiction` only — code, no translation
 * needed there). Wire by choosing this map when locale === "en".
 */
export const FRAMEWORK_META_EN: Record<RegFramework, FrameworkMeta> = {
  "eu-ai-act": {
    label: "EU AI Act",
    short: "EU AI Act",
    jurisdiction: "eu",
    jurisdictionLabel: "European Union",
  },
  "us-nyc-ll144": {
    label: "NYC Local Law 144 (AEDT)",
    short: "NYC LL144",
    jurisdiction: "us-ny",
    jurisdictionLabel: "US — New York",
  },
  "us-co-aiact": {
    label: "Colorado AI Act (SB 26-189)",
    short: "Colorado AI Act",
    jurisdiction: "us-co",
    jurisdictionLabel: "US — Colorado",
  },
  "us-il-aivia": {
    label: "Illinois AI Video Interview Act",
    short: "IL AIVIA",
    jurisdiction: "us-il",
    jurisdictionLabel: "US — Illinois",
  },
  "us-il-hra": {
    label: "Illinois Human Rights Act (HB 3773)",
    short: "IL HRA",
    jurisdiction: "us-il",
    jurisdictionLabel: "US — Illinois",
  },
  "us-eeoc": {
    label: "EEOC — federal guidance",
    short: "EEOC",
    jurisdiction: "us-federal",
    jurisdictionLabel: "US — Federal",
  },
};

/** Selector locale-aware de los metadatos de marco (default ES). */
export const FRAMEWORK_META_BY_LOCALE: Record<
  Locale,
  Record<RegFramework, FrameworkMeta>
> = {
  es: FRAMEWORK_META,
  en: FRAMEWORK_META_EN,
};

/**
 * Metadatos del marco por locale (con reserva `undefined` para valores no
 * conocidos de BD). Retrocompatible: `locale` default ES.
 */
export function frameworkMeta(
  framework: string,
  locale: Locale = "es",
): FrameworkMeta | undefined {
  return FRAMEWORK_META_BY_LOCALE[locale][framework as RegFramework];
}

/**
 * Nombre del marco (con reserva segura para valores no conocidos de BD).
 * Retrocompatible: `locale` opcional con default ES.
 */
export function frameworkLabel(framework: string, locale: Locale = "es"): string {
  return FRAMEWORK_META_BY_LOCALE[locale][framework as RegFramework]?.label ?? framework;
}

/**
 * Jurisdicción legible del marco (reserva: "Otras"/"Other").
 * Retrocompatible: `locale` opcional con default ES.
 */
export function jurisdictionLabel(framework: string, locale: Locale = "es"): string {
  const fallback = locale === "en" ? "Other" : "Otras";
  return (
    FRAMEWORK_META_BY_LOCALE[locale][framework as RegFramework]?.jurisdictionLabel ??
    fallback
  );
}

/** Orden de jurisdicciones en la UI (UE primero, luego EE. UU.). */
export const JURISDICTION_ORDER: RegJurisdiction[] = [
  "eu",
  "us-ny",
  "us-co",
  "us-il",
  "us-federal",
];

/** Etiqueta legible de cada jurisdicción (para chips de filtro). */
export const JURISDICTION_LABEL: Record<RegJurisdiction, string> = {
  eu: "Unión Europea",
  "us-ny": "EE. UU. — Nueva York",
  "us-co": "EE. UU. — Colorado",
  "us-il": "EE. UU. — Illinois",
  "us-federal": "EE. UU. — Federal",
};

/**
 * EN — jurisdiction labels for filter chips (parallel to JURISDICTION_LABEL,
 * same keys). Consumers (ES today): vigilancia/page.tsx (filter chips + single-
 * jurisdiction suffix), JurisdictionSettings.tsx (toggle labels). Wire by
 * choosing this map when locale === "en".
 */
export const JURISDICTION_LABEL_EN: Record<RegJurisdiction, string> = {
  eu: "European Union",
  "us-ny": "US — New York",
  "us-co": "US — Colorado",
  "us-il": "US — Illinois",
  "us-federal": "US — Federal",
};

/**
 * Selector locale-aware de las etiquetas de jurisdicción, indexado por código de
 * jurisdicción (para los chips de filtro que hoy indexan `JURISDICTION_LABEL`
 * directamente). Default seguro: `JURISDICTION_LABEL` (ES). Fase 2: los chips
 * de `vigilancia/page.tsx` y `JurisdictionSettings.tsx` deben indexar este mapa
 * con el locale resuelto.
 */
export const JURISDICTION_LABEL_BY_LOCALE: Record<
  Locale,
  Record<RegJurisdiction, string>
> = {
  es: JURISDICTION_LABEL,
  en: JURISDICTION_LABEL_EN,
};

/** Compatibilidad: mapa simple id de marco → nombre. */
export const FRAMEWORK_LABEL: Record<RegFramework, string> = {
  "eu-ai-act": FRAMEWORK_META["eu-ai-act"].label,
  "us-nyc-ll144": FRAMEWORK_META["us-nyc-ll144"].label,
  "us-co-aiact": FRAMEWORK_META["us-co-aiact"].label,
  "us-il-aivia": FRAMEWORK_META["us-il-aivia"].label,
  "us-il-hra": FRAMEWORK_META["us-il-hra"].label,
  "us-eeoc": FRAMEWORK_META["us-eeoc"].label,
};

/**
 * EN — simple framework-id → name map (parallel to FRAMEWORK_LABEL). Names are
 * identical to the ES map (proper names, not translated); provided for symmetry
 * so EN consumers can index one shape. Consumers (ES today): fuentes/page.tsx
 * (source framework pill), candidatos/page.tsx (candidate framework pill).
 */
export const FRAMEWORK_LABEL_EN: Record<RegFramework, string> = {
  "eu-ai-act": FRAMEWORK_META_EN["eu-ai-act"].label,
  "us-nyc-ll144": FRAMEWORK_META_EN["us-nyc-ll144"].label,
  "us-co-aiact": FRAMEWORK_META_EN["us-co-aiact"].label,
  "us-il-aivia": FRAMEWORK_META_EN["us-il-aivia"].label,
  "us-il-hra": FRAMEWORK_META_EN["us-il-hra"].label,
  "us-eeoc": FRAMEWORK_META_EN["us-eeoc"].label,
};

/** Selector locale-aware del mapa simple id→nombre de marco (default ES). */
export const FRAMEWORK_LABEL_BY_LOCALE: Record<
  Locale,
  Record<RegFramework, string>
> = {
  es: FRAMEWORK_LABEL,
  en: FRAMEWORK_LABEL_EN,
};

/* -------------------------------------------------------------------------- */
/* Catálogo curado — EU AI Act (Reglamento (UE) 2024/1689)                    */
/* -------------------------------------------------------------------------- */

export const REGULATORY_EVENTS: RegulatoryEvent[] = [
  {
    id: "eu-entry-into-force",
    date: "2024-08-01",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "El EU AI Act entra en vigor",
    summary:
      "El Reglamento (UE) 2024/1689 se publicó el 12 de julio de 2024 y entró en vigor el 1 de agosto de 2024, iniciando el calendario escalonado de aplicación.",
    impact:
      "Marca el punto de partida: a partir de aquí corren todos los plazos. Ninguna obligación sustantiva es exigible todavía, pero conviene inventariar y clasificar tus sistemas ya.",
    action:
      "Ten tu inventario de sistemas de IA al día y clasifica su nivel de riesgo para anticipar los plazos siguientes.",
    articles: ["Art. 113"],
    source: {
      label: "Reglamento (UE) 2024/1689 — EUR-Lex",
      url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    },
    scope: { all: true },
  },
  {
    id: "eu-prohibited-practices",
    date: "2025-02-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "Prácticas de IA prohibidas (Art. 5) aplicables",
    summary:
      "Desde el 2 de febrero de 2025 son exigibles las prohibiciones del Art. 5, junto con la obligación de alfabetización en IA (Art. 4).",
    impact:
      "Crítico para RRHH: inferir emociones de una persona en el ámbito laboral (p. ej. análisis de afecto o microexpresiones en vídeo-entrevistas) es una práctica PROHIBIDA salvo fines médicos o de seguridad. Si una herramienta de selección lo hace, no puede usarse.",
    action:
      "Revisa si alguna herramienta (sobre todo de vídeo-entrevista) infiere emociones; si es así, deséchala o desactiva esa función. Asegura formación básica en IA a tu equipo (Art. 4).",
    articles: ["Art. 5", "Art. 4", "Art. 5.1.f"],
    source: {
      label: "Directrices de la Comisión sobre prácticas prohibidas (feb 2025)",
      url: "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-prohibited-artificial-intelligence-ai-practices-defined-ai-act",
    },
    scope: { all: true },
  },
  {
    id: "eu-gpai-governance",
    date: "2025-08-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "Modelos de propósito general (GPAI), gobernanza y sanciones",
    summary:
      "Desde el 2 de agosto de 2025 aplican las obligaciones para proveedores de modelos de IA de propósito general (Cap. V), el marco de gobernanza (autoridades) y el régimen de sanciones.",
    impact:
      "Afecta sobre todo a los proveedores de modelos fundacionales, no directamente a un deployer. Pero establece el marco sancionador y las autoridades competentes: el incumplimiento ya tiene consecuencias.",
    action:
      "Si usas modelos de propósito general (p. ej. un chatbot sobre un LLM comercial), pide a tu proveedor la documentación de cumplimiento GPAI y consérvala como evidencia.",
    articles: ["Cap. V (Arts. 51–56)", "Cap. VII (gobernanza)", "Arts. 99–100"],
    source: {
      label: "Calendario de aplicación del AI Act — Comisión Europea",
      url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    },
    scope: { all: true },
  },
  {
    id: "eu-omnibus-highrisk-delay",
    date: "2026-06-29",
    kind: "amendment",
    framework: "eu-ai-act",
    title: "Digital Omnibus: se aplaza el plazo de alto riesgo",
    summary:
      "El paquete Digital Omnibus (adoptado en 2026) reprograma la aplicación de las obligaciones de alto riesgo del Anexo III: de 2 de agosto de 2026 a 2 de diciembre de 2027 (y a 2 de agosto de 2028 para IA embebida en productos del Anexo I).",
    impact:
      "Buena noticia con matiz: tienes más tiempo para preparar tus sistemas de alto riesgo, pero la obligación es inevitable. Es una ventana para prepararte, no una cancelación.",
    action:
      "Usa la ventana: cierra el gap assessment de tus sistemas de alto riesgo y reúne la evidencia con calma antes de diciembre de 2027.",
    articles: ["Art. 113", "Anexo III"],
    source: {
      label: "Consejo de la UE — luz verde final al Digital Omnibus (29 jun 2026)",
      url: "https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/",
    },
    scope: { riskLevels: ["high"] },
  },
  {
    id: "eu-transparency-art50",
    date: "2026-08-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "Aplicación general del Reglamento y transparencia (Art. 50)",
    summary:
      "Desde el 2 de agosto de 2026 el Reglamento es de aplicación general, incluidas las obligaciones de transparencia del Art. 50. El Digital Omnibus NO aplazó esta fecha para el deployer: el único alivio es un periodo de gracia hasta el 2 de diciembre de 2026 para el mecanismo de marcado legible por máquina del PROVEEDOR (Art. 50.2), y solo para la IA generativa ya en el mercado antes del 2 de agosto de 2026.",
    impact:
      "Relevante para RRHH: si usas un chatbot conversacional con candidatos, debes informarles de que interactúan con una IA. También debe etiquetarse el contenido generado por IA. Ojo: la prórroga de marcado del Art. 50.2 es del proveedor, no tuya — tu deber como deployer de avisar al candidato de que habla con una IA sigue vigente el 2 de agosto de 2026, sin prórroga.",
    action:
      "Revisa que tu chatbot de reclutamiento avise de forma clara de que es una IA. Comprueba dónde generas o manipulas contenido con IA para etiquetarlo.",
    articles: ["Art. 50", "Art. 50.2"],
    source: {
      label: "Art. 50 — AI Act Service Desk (Comisión Europea)",
      url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50",
    },
    scope: { riskLevels: ["limited", "high"] },
  },
  {
    id: "eu-omnibus-art5-intimate",
    date: "2026-12-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "Nueva práctica prohibida (Art. 5): imágenes íntimas no consentidas y CSAM",
    summary:
      "El Digital Omnibus añadió al Art. 5 dos nuevas prácticas prohibidas: los sistemas de IA que generan o manipulan imágenes íntimas realistas de una persona identificable sin su consentimiento libre, específico, informado e inequívoco, y los que generan o manipulan material de abuso sexual infantil (CSAM, en el sentido de la Directiva 2011/93/UE). La prohibición es aplicable desde el 2 de diciembre de 2026 (periodo transitorio fijado por el Omnibus).",
    impact:
      "Prohibición transversal, no específica de RRHH: en la práctica NO afecta a las herramientas de selección de personal (cribado de CVs, ranking, entrevistas, chatbots), salvo que tu organización genere o manipule imágenes o vídeo de personas con IA. Conviene conocerla porque es una práctica inaceptable, sujeta a las sanciones más altas del Reglamento (hasta 35 M€ o el 7% de la facturación mundial).",
    action:
      "Confirma que ningún sistema de tu inventario genere o manipule imágenes o vídeo de personas (deepfakes) sin salvaguardas. Si en el futuro incorporas IA generativa de imagen/vídeo, exige al proveedor evidencia de medidas técnicas que impidan estos usos. Para cribado de CVs y entrevistas, normalmente basta con dejar constancia de que no aplica.",
    articles: ["Art. 5", "Directiva 2011/93/UE"],
    source: {
      label: "Consejo de la UE — luz verde final al Digital Omnibus (29 jun 2026)",
      url: "https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/",
    },
    scope: { all: true },
  },
  {
    id: "eu-highrisk-annex-iii",
    date: "2027-12-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "Obligaciones de alto riesgo del Anexo III aplicables",
    summary:
      "Desde el 2 de diciembre de 2027 (plazo aplazado por el Digital Omnibus) son exigibles las obligaciones para los sistemas de alto riesgo del Anexo III, incluido el ámbito de empleo y gestión de trabajadores.",
    impact:
      "El plazo central para RRHH: tus sistemas de selección (cribado de CVs, ranking, tests) son alto riesgo del Anexo III (empleo). Como deployer te aplican las obligaciones del Art. 26: supervisión humana, información a los trabajadores, conservación de logs y uso conforme a instrucciones. Además debes exigir al proveedor la documentación (Arts. 9–15) y el marcado CE.",
    action:
      "Ejecuta el gap assessment y aplica el policy pack de RRHH a cada sistema de alto riesgo. Designa la supervisión humana, informa a los trabajadores y exige la documentación técnica al proveedor.",
    articles: ["Art. 6", "Anexo III", "Art. 26", "Arts. 9–15"],
    source: {
      label: "Reglamento (UE) 2024/1689, Anexo III — EUR-Lex",
      url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    },
    scope: { riskLevels: ["high"] },
  },
  {
    id: "eu-highrisk-annex-i",
    date: "2028-08-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "Alto riesgo embebido en productos regulados (Anexo I)",
    summary:
      "Desde el 2 de agosto de 2028 aplican las obligaciones para los sistemas de alto riesgo que son componentes de seguridad de productos ya regulados por la legislación de armonización de la UE (Anexo I).",
    impact:
      "Poco habitual en un SaaS de RRHH puro; es más relevante si tu IA va embebida en maquinaria, dispositivos médicos u otros productos regulados.",
    action:
      "Si algún sistema es un componente de seguridad de un producto regulado, planifica su conformidad para este plazo posterior.",
    articles: ["Art. 6.1", "Anexo I"],
    source: {
      label: "Calendario de aplicación del AI Act — Comisión Europea",
      url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    },
    scope: { riskLevels: ["high"] },
  },

  /* ------------------------------------------------------------------------ */
  /* Leyes de IA en el empleo — EE. UU. (verificadas por compliance-expert)   */
  /* Territoriales: aplican con nexo NYC/Colorado/Illinois. riskLevels es      */
  /* conveniencia de enrutamiento, NO una clasificación jurídica de esas leyes.*/
  /* ------------------------------------------------------------------------ */

  // ── NYC Local Law 144 (AEDT) ──
  {
    id: "us-nyc-ll144-enforcement",
    date: "2023-07-05",
    kind: "enforcement",
    framework: "us-nyc-ll144",
    title: "NYC LL144 en vigor: auditoría de sesgo, aviso y publicación (AEDT)",
    summary:
      "La Local Law 144 de 2021 de Nueva York prohíbe que empleadores y agencias de colocación usen una herramienta automatizada de decisión de empleo (AEDT) salvo que se cumplan tres requisitos: (1) la herramienta pasó una auditoría de sesgo en el último año, (2) el resumen de resultados de esa auditoría está públicamente disponible, y (3) se avisó a candidatos/empleados. El enforcement por el DCWP comenzó el 5 de julio de 2023.",
    impact:
      "Aplica directamente a nuestro ICP: si usas cribado de CVs, ranking de candidatos o video-entrevistas con personas que se postulan a un puesto en NYC (o residentes de NYC), la OBLIGACIÓN recae en TI como empleador-deployer, no en el vendor. Matiz clave: aunque un auditor independiente ejecuta la auditoría de sesgo, es el empleador quien debe asegurarse de que existe, sea reciente (<12 meses) y esté publicada. No basta con que el proveedor diga que su tool es 'justa'.",
    action:
      "Identifica qué herramientas de selección caen en la definición de AEDT. Encarga (o exige evidencia de) una auditoría de sesgo independiente con antigüedad menor a 1 año, publica el resumen de resultados en tu web, y da el aviso al candidato con al menos 10 días hábiles de antelación (indicando que se usará un AEDT, cómo, y qué datos se recogen). Conserva la evidencia.",
    articles: [
      "NYC Admin. Code §§ 20-870 a 20-874 (Local Law 144 de 2021)",
      "6 RCNY §§ 5-300 a 5-304 (Regla final DCWP, 6-abr-2023)",
    ],
    source: {
      label:
        "DCWP — Automated Employment Decision Tools (Ciudad de Nueva York)",
      url: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
    },
    scope: { riskLevels: ["high"] },
  },
  {
    id: "us-nyc-ll144-annual-audit",
    date: "2023-07-05",
    kind: "deadline",
    framework: "us-nyc-ll144",
    title: "NYC LL144: la auditoría de sesgo caduca cada 12 meses (renovación)",
    summary:
      "La regla exige que la auditoría de sesgo del AEDT tenga una antigüedad no mayor a un año respecto de su uso. En la práctica es una obligación RECURRENTE: cada herramienta debe reauditarse dentro de su propio ciclo de 12 meses para poder seguir usándose legalmente en NYC.",
    impact:
      "No es un plazo de calendario fijo para todos, sino un vencimiento ROTATORIO por herramienta desde la fecha de su última auditoría. Para un deployer significa un control de vigencia continuo: una auditoría vencida convierte el uso del tool en incumplimiento, con multas civiles de 500 a 1.500 USD por día y por infracción (DCWP).",
    action:
      "Lleva un registro de la fecha de la última auditoría de sesgo por cada AEDT y agenda su renovación antes de cumplir 12 meses. Ata en el inventario de Attesta la fecha de auditoría a cada sistema de selección y trátala como evidencia con caducidad.",
    articles: [
      "6 RCNY § 5-301 (bias audit)",
      "6 RCNY § 5-302 (publicación del resumen de resultados)",
    ],
    source: {
      label: "DCWP — AEDT FAQ (PDF oficial de la Ciudad de Nueva York)",
      url: "https://www.nyc.gov/assets/dca/downloads/pdf/about/DCWP-AEDT-FAQ.pdf",
    },
    scope: { riskLevels: ["high"] },
  },

  // ── Colorado AI Act (derogada y reescrita por SB 26-189) ──
  {
    id: "us-co-aiact-effective",
    date: "2027-01-01",
    kind: "deadline",
    framework: "us-co-aiact",
    title: "Colorado: efectividad de la ley de IA reescrita (SB 26-189, ADMT)",
    summary:
      "La Colorado AI Act original (SB 24-205, C.R.S. §§ 6-1-1701 a 6-1-1707) fue aplazada y luego DEROGADA Y REESCRITA por SB 26-189 (firmada el 14-may-2026). La nueva versión abandona el marco de 'alto riesgo' de estilo europeo (elimina el deber de cuidado, los programas de gestión de riesgo obligatorios y las evaluaciones de impacto anuales) y regula la 'tecnología de decisión automatizada' (ADMT) usada en decisiones consecuentes, con obligaciones de documentación del desarrollador, aviso al consumidor, acceso a datos y solicitud de revisión humana. Efectividad: 1 de enero de 2027.",
    impact:
      "El empleo es una 'decisión consecuente', así que si operas en Colorado y usas IA en contratación, esta ley te alcanza como deployer/usuario. PERO cuidado con material desactualizado: gran parte de lo publicado describe la SB 24-205 (deber de cuidado + impact assessments) que YA NO es la ley vigente. El régimen aplicable a 2027 es el de SB 26-189, más ligero en cargas de riesgo pero con foco en transparencia, aviso y revisión humana. Es ventana, no urgencia.",
    action:
      "No inviertas todavía en documentación pesada asumiendo el modelo antiguo de Colorado. Mantén este evento en observación y reconfirma el contenido definitivo de SB 26-189 (aviso al consumidor, derecho a revisión humana, documentación exigible al proveedor) conforme se publique el texto consolidado y las reglas del Fiscal General. Marca tus sistemas de selección usados en Colorado para revisión antes de 2027.",
    articles: [
      "SB 26-189 (deroga y reescribe C.R.S. § 6-1-1701 y ss.) — numeración consolidada a reconfirmar",
    ],
    source: {
      label: "Colorado General Assembly — SB 26-189 (fuente legislativa oficial)",
      url: "https://leg.colorado.gov/bills/sb26-189",
    },
    scope: { riskLevels: ["high"] },
  },
  {
    id: "us-co-aiact-repeal-reenact",
    date: "2026-05-14",
    kind: "amendment",
    framework: "us-co-aiact",
    title: "Colorado deroga el modelo 'alto riesgo' original y lo reescribe",
    summary:
      "SB 24-205 (firmada 17-may-2024) iba a entrar en vigor el 1-feb-2026; se aplazó a 30-jun-2026 (SB 25B-004, 28-ago-2025) y finalmente SB 26-189 (14-may-2026) derogó y reescribió el marco, eliminando la clasificación de 'alto riesgo', el deber de cuidado contra la discriminación algorítmica, los programas de gestión de riesgo y las evaluaciones de impacto anuales, y aplazando la efectividad a 1-ene-2027.",
    impact:
      "Registro de contexto para no confundir versiones. Si algún consultor o documento cita 'las obligaciones del deployer de alto riesgo de Colorado' (deber de cuidado, impact assessment anual, reporte al AG en 90 días), está describiendo la ley DEROGADA. Attesta debe reflejar el estado actual para no dar orientación caduca.",
    action:
      "Tratar SB 24-205 como histórico. Cualquier mapeo de controles de Attesta a 'Colorado' debe apuntar al régimen SB 26-189 (ADMT), no al modelo de alto riesgo original.",
    articles: [
      "SB 24-205 (2024, derogada)",
      "SB 25B-004 (2025, aplazamiento a 30-jun-2026)",
      "SB 26-189 (2026, derogación y reescritura; efectiva 1-ene-2027)",
    ],
    source: {
      label: "Colorado General Assembly — SB 24-205 (historial y estado oficial)",
      url: "https://leg.colorado.gov/bills/sb24-205",
    },
    scope: { riskLevels: ["high"] },
  },

  // ── Illinois — AI Video Interview Act (820 ILCS 42) ──
  {
    id: "us-il-aivia-inforce",
    date: "2020-01-01",
    kind: "enforcement",
    framework: "us-il-aivia",
    title: "Illinois AI Video Interview Act: consentimiento e información",
    summary:
      "El Artificial Intelligence Video Interview Act (820 ILCS 42) está en vigor desde el 1-ene-2020. Un empleador que use IA para analizar video-entrevistas de candidatos debe, ANTES de la entrevista: (1) avisar al candidato de que se puede usar IA para analizar el vídeo, (2) explicar cómo funciona la IA y qué tipos de características evalúa, y (3) obtener su consentimiento. No puede evaluar con IA a quien no consintió y debe borrar los vídeos en 30 días si el candidato lo pide.",
    impact:
      "Aplica de lleno a la video-entrevista con análisis por IA, uno de nuestros casos de uso núcleo. La obligación es del empleador-deployer. Es de baja carga operativa (aviso + explicación + consentimiento + borrado a petición) pero es incumplimiento silencioso fácil de cometer si el proveedor de video-entrevista no te da el texto explicativo.",
    action:
      "Antes de cada video-entrevista analizada por IA: entrega el aviso y la explicación de qué evalúa el sistema, recoge consentimiento y ofrece alternativa a quien no consienta. Habilita el borrado del vídeo en 30 días a petición. Guarda el consentimiento como evidencia.",
    articles: [
      "820 ILCS 42/5 (consentimiento e información)",
      "820 ILCS 42/10 (límite de con quién se comparte el vídeo)",
      "820 ILCS 42/15 (borrado en 30 días a petición)",
      "820 ILCS 42/20 (reporte demográfico si solo se usa IA para cribar a entrevista presencial)",
    ],
    source: {
      label: "Illinois General Assembly — 820 ILCS 42 (texto legal oficial)",
      url: "https://www.ilga.gov/Legislation/ILCS/Articles?ActID=4015&ChapterID=68",
    },
    scope: { riskLevels: ["high"] },
  },

  // ── Illinois — Human Rights Act enmendada (HB 3773) ──
  {
    id: "us-il-hra-ai-amendment",
    date: "2026-01-01",
    kind: "amendment",
    framework: "us-il-hra",
    title: "Illinois HRA (HB 3773): IA discriminatoria en empleo + aviso",
    summary:
      "HB 3773 enmienda la Illinois Human Rights Act (775 ILCS 5) y, desde el 1-ene-2026, prohíbe expresamente que un empleador use IA que tenga el efecto de discriminar por clase protegida en reclutamiento, contratación, promoción, formación, despido, disciplina y otras condiciones de empleo. Prohíbe además usar el código postal como proxy de clase protegida y obliga a AVISAR a candidatos y empleados cuando se usa IA en esas decisiones. Los reglamentos de detalle de la IDHR fueron retirados temporalmente, pero las obligaciones estatutarias siguen vigentes.",
    impact:
      "Es una ley antidiscriminación aplicada a la IA de empleo, no un régimen de auditoría. Encaja con nuestro encuadre europeo: el sesgo en herramientas de selección se ataca vía normativa antidiscriminación (aquí la IHRA), no como obligación de 'proveedor'. La carga del deployer: entender cómo decide su tool, evitar efectos discriminatorios (incluido el proxy por ZIP) y notificar el uso de IA. La incertidumbre está en la FORMA exacta del aviso, porque las reglas de detalle se retiraron.",
    action:
      "Si contratas en Illinois: inventaría dónde interviene la IA en decisiones de empleo, exige al proveedor evidencia de pruebas de sesgo/impacto adverso, evita variables proxy (p. ej. código postal), y prepara un aviso claro del uso de IA a candidatos y empleados. Vigila la reaparición de los reglamentos de la IDHR para ajustar el formato del aviso.",
    articles: [
      "775 ILCS 5/2-102 (prácticas de empleo, enmendado)",
      "775 ILCS 5/1-103 (definiciones, IA y ZIP como proxy)",
      "HB 3773 (Public Act 103-0804)",
    ],
    source: {
      label:
        "Illinois General Assembly — Illinois Human Rights Act (775 ILCS 5)",
      url: "https://www.ilga.gov/Legislation/ILCS/Articles?ActID=2266&ChapterID=64",
    },
    scope: { riskLevels: ["high"] },
  },

  // ── EEOC (federal) — contexto: orientación retirada, no ley ──
  {
    id: "us-eeoc-ai-guidance-withdrawn",
    date: "2025-01-01",
    kind: "guidance",
    framework: "us-eeoc",
    title: "EEOC: orientación sobre IA (Title VII/ADA) RETIRADA (no es ley)",
    summary:
      "La EEOC había publicado orientación técnica (technical assistance) sobre el uso de IA en el empleo: mayo-2022 sobre la ADA ('screen out' de personas con discapacidad) y mayo-2023 sobre Title VII (impacto adverso). En enero de 2025 la EEOC RETIRÓ ese material de eeoc.gov; el documento detallado de la ADA devuelve 404 y la página que sobrevive es una cáscara. Importante: era ORIENTACIÓN, no ley, y su retirada NO cambia las leyes de fondo.",
    impact:
      "Para el deployer, el mensaje honesto es: las leyes federales antidiscriminación (Title VII, ADA, ADEA) SIGUEN aplicando a las herramientas de selección con IA; lo que desapareció es la guía interpretativa específica sobre IA. No hay una obligación federal nueva de 'auditar la IA', pero un tool que produzca impacto adverso o excluya a personas con discapacidad sigue siendo un riesgo legal federal. No sobre-afirmar que 'ya no hay regla federal'.",
    action:
      "No dependas de la guía retirada como fuente. Mantén las buenas prácticas que exigía (pruebas de impacto adverso, adaptaciones razonables para candidatos con discapacidad, alternativas accesibles) porque las leyes subyacentes no cambiaron. Vigila posibles reediciones de la orientación.",
    articles: [
      "Title VII (42 U.S.C. § 2000e y ss.)",
      "ADA (42 U.S.C. § 12101 y ss.)",
      "ADEA (29 U.S.C. § 621 y ss.)",
    ],
    source: {
      label: "EEOC — Artificial Intelligence and the ADA (página oficial)",
      url: "https://www.eeoc.gov/eeoc-disability-related-resources/artificial-intelligence-and-ada",
    },
    scope: { riskLevels: ["high"] },
  },
];

/* -------------------------------------------------------------------------- */
/* Catálogo curado — versión EN VALIDADA (paralela a REGULATORY_EVENTS)        */
/* -------------------------------------------------------------------------- */
/**
 * EN parallel of REGULATORY_EVENTS. IDENTICAL to the ES array in: `id`, `date`,
 * `kind`, `framework`, `scope`, and `source.url`. User-facing prose is
 * translated: `title`, `summary`, `impact`, `action`, and the descriptive part
 * of `source.label` (official document/body names kept, e.g. "Regulation (EU)
 * 2024/1689", "Council of the EU", "DCWP").
 *
 * `articles`: the numeric citation identifiers are kept byte-identical (a
 * mistranslated cite is a liability), but the Spanish DESCRIPTIVE text that some
 * carried has now been translated to English (e.g. "Cap. VII (gobernanza)" →
 * "Ch. VII (governance)"; "(publicación del resumen de resultados)" →
 * "(publication of the summary of results)"; range connector "a" → "to"; dates
 * "6-abr-2023" → "6 Apr 2023"). EXPERT FLAG: standalone language-suffixed
 * statute tokens are intentionally left as-is pending expert sign-off —
 * "Anexo I/III" (vs "Annex"), "Directiva 2011/93/UE" (vs "Directive .../EU").
 *
 * Consumers (ES today): vigilancia/page.tsx, dashboard/page.tsx and
 * informe/page.tsx read title/summary/impact/action (and scope/date via the
 * relevance engine below). Wire by selecting REGULATORY_EVENTS_EN when
 * locale === "en"; the engine + merge helpers are locale-agnostic and unchanged.
 *
 * Deployer framing preserved; no prohibited copy (no certified/compliant/
 * guarantees). Legal fidelity: dates/articles not strengthened or softened.
 */
export const REGULATORY_EVENTS_EN: RegulatoryEvent[] = [
  {
    id: "eu-entry-into-force",
    date: "2024-08-01",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "The EU AI Act enters into force",
    summary:
      "Regulation (EU) 2024/1689 was published on 12 July 2024 and entered into force on 1 August 2024, starting the staggered application timeline.",
    impact:
      "Marks the starting point: from here on, every deadline runs. No substantive obligation is enforceable yet, but it is already wise to inventory and classify your systems.",
    action:
      "Keep your AI system inventory up to date and classify its risk level to get ahead of the upcoming deadlines.",
    articles: ["Art. 113"],
    source: {
      label: "Regulation (EU) 2024/1689 — EUR-Lex",
      url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    },
    scope: { all: true },
  },
  {
    id: "eu-prohibited-practices",
    date: "2025-02-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "Prohibited AI practices (Art. 5) become applicable",
    summary:
      "Since 2 February 2025, the prohibitions in Art. 5 are enforceable, together with the AI literacy obligation (Art. 4).",
    impact:
      "Critical for HR: inferring a person's emotions in the workplace (e.g. affect analysis or micro-expressions in video interviews) is a PROHIBITED practice except for medical or safety purposes. If a hiring tool does this, it cannot be used.",
    action:
      "Check whether any tool (especially video interviewing) infers emotions; if so, discard it or disable that feature. Ensure basic AI literacy for your team (Art. 4).",
    articles: ["Art. 5", "Art. 4", "Art. 5.1.f"],
    source: {
      label: "Commission Guidelines on prohibited AI practices (Feb 2025)",
      url: "https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-prohibited-artificial-intelligence-ai-practices-defined-ai-act",
    },
    scope: { all: true },
  },
  {
    id: "eu-gpai-governance",
    date: "2025-08-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "General-purpose AI (GPAI) models, governance and penalties",
    summary:
      "Since 2 August 2025, the obligations for providers of general-purpose AI models (Chapter V), the governance framework (authorities) and the penalties regime apply.",
    impact:
      "Affects mainly providers of foundation models, not directly a deployer. But it establishes the penalties framework and the competent authorities: non-compliance now has consequences.",
    action:
      "If you use general-purpose models (e.g. a chatbot built on a commercial LLM), ask your provider for the GPAI compliance documentation and keep it as evidence.",
    articles: ["Ch. V (Arts. 51–56)", "Ch. VII (governance)", "Arts. 99–100"],
    source: {
      label: "AI Act application timeline — European Commission",
      url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    },
    scope: { all: true },
  },
  {
    id: "eu-omnibus-highrisk-delay",
    date: "2026-06-29",
    kind: "amendment",
    framework: "eu-ai-act",
    title: "Digital Omnibus: the high-risk deadline is postponed",
    summary:
      "The Digital Omnibus package (adopted in 2026) reschedules the application of the high-risk obligations in Annex III: from 2 August 2026 to 2 December 2027 (and to 2 August 2028 for AI embedded in Annex I products).",
    impact:
      "Good news with a caveat: you have more time to prepare your high-risk systems, but the obligation is unavoidable. It is a window to get ready, not a cancellation.",
    action:
      "Use the window: close the gap assessment for your high-risk systems and gather the evidence calmly before December 2027.",
    articles: ["Art. 113", "Anexo III"],
    source: {
      label: "Council of the EU — final green light to the Digital Omnibus (29 Jun 2026)",
      url: "https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/",
    },
    scope: { riskLevels: ["high"] },
  },
  {
    id: "eu-transparency-art50",
    date: "2026-08-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "General application of the Regulation and transparency (Art. 50)",
    summary:
      "Since 2 August 2026 the Regulation applies in general, including the transparency obligations of Art. 50. The Digital Omnibus did NOT postpone this date for the deployer: the only relief is a grace period until 2 December 2026 for the PROVIDER's machine-readable marking mechanism (Art. 50.2), and only for generative AI already on the market before 2 August 2026.",
    impact:
      "Relevant for HR: if you use a conversational chatbot with candidates, you must inform them that they are interacting with an AI. AI-generated content must also be labeled. Note: the Art. 50.2 marking extension belongs to the provider, not to you — your duty as a deployer to warn the candidate that they are talking to an AI still applies on 2 August 2026, with no extension.",
    action:
      "Check that your recruitment chatbot clearly discloses that it is an AI. Review where you generate or manipulate content with AI so you can label it.",
    articles: ["Art. 50", "Art. 50.2"],
    source: {
      label: "Art. 50 — AI Act Service Desk (European Commission)",
      url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50",
    },
    scope: { riskLevels: ["limited", "high"] },
  },
  {
    id: "eu-omnibus-art5-intimate",
    date: "2026-12-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "New prohibited practice (Art. 5): non-consensual intimate images and CSAM",
    summary:
      "The Digital Omnibus added two new prohibited practices to Art. 5: AI systems that generate or manipulate realistic intimate images of an identifiable person without their freely given, specific, informed and unambiguous consent, and those that generate or manipulate child sexual abuse material (CSAM, within the meaning of Directive 2011/93/EU). The prohibition applies from 2 December 2026 (transitional period set by the Omnibus).",
    impact:
      "A cross-cutting prohibition, not HR-specific: in practice it does NOT affect hiring tools (CV screening, ranking, interviews, chatbots), unless your organization generates or manipulates images or video of people with AI. It is worth knowing because it is an unacceptable practice, subject to the highest penalties in the Regulation (up to €35M or 7% of worldwide turnover).",
    action:
      "Confirm that no system in your inventory generates or manipulates images or video of people (deepfakes) without safeguards. If you later add generative image/video AI, require the provider to give evidence of technical measures that prevent these uses. For CV screening and interviews, it is usually enough to record that this does not apply.",
    articles: ["Art. 5", "Directiva 2011/93/UE"],
    source: {
      label: "Council of the EU — final green light to the Digital Omnibus (29 Jun 2026)",
      url: "https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/artificial-intelligence-council-gives-final-green-light-to-simplify-and-streamline-rules/",
    },
    scope: { all: true },
  },
  {
    id: "eu-highrisk-annex-iii",
    date: "2027-12-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "High-risk obligations under Annex III become applicable",
    summary:
      "Since 2 December 2027 (deadline postponed by the Digital Omnibus) the obligations for high-risk systems under Annex III are enforceable, including the area of employment and worker management.",
    impact:
      "The central deadline for HR: your hiring systems (CV screening, ranking, tests) are high-risk under Annex III (employment). As a deployer, the obligations of Art. 26 apply to you: human oversight, informing workers, keeping logs and use in accordance with instructions. You must also require the provider's documentation (Arts. 9–15) and the CE marking.",
    action:
      "Run the gap assessment and apply the HR policy pack to each high-risk system. Assign human oversight, inform workers and require the technical documentation from the provider.",
    articles: ["Art. 6", "Anexo III", "Art. 26", "Arts. 9–15"],
    source: {
      label: "Regulation (EU) 2024/1689, Annex III — EUR-Lex",
      url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    },
    scope: { riskLevels: ["high"] },
  },
  {
    id: "eu-highrisk-annex-i",
    date: "2028-08-02",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "High-risk embedded in regulated products (Annex I)",
    summary:
      "Since 2 August 2028, the obligations apply for high-risk systems that are safety components of products already regulated by EU harmonisation legislation (Annex I).",
    impact:
      "Uncommon in a pure HR SaaS; it is more relevant if your AI is embedded in machinery, medical devices or other regulated products.",
    action:
      "If any system is a safety component of a regulated product, plan its conformity for this later deadline.",
    articles: ["Art. 6.1", "Anexo I"],
    source: {
      label: "AI Act application timeline — European Commission",
      url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    },
    scope: { riskLevels: ["high"] },
  },

  // ── NYC Local Law 144 (AEDT) ──
  {
    id: "us-nyc-ll144-enforcement",
    date: "2023-07-05",
    kind: "enforcement",
    framework: "us-nyc-ll144",
    title: "NYC LL144 in force: bias audit, notice and publication (AEDT)",
    summary:
      "New York City's Local Law 144 of 2021 prohibits employers and employment agencies from using an automated employment decision tool (AEDT) unless three requirements are met: (1) the tool passed a bias audit within the past year, (2) a summary of that audit's results is publicly available, and (3) candidates/employees were notified. Enforcement by the DCWP began on 5 July 2023.",
    impact:
      "Applies directly to our ICP: if you use CV screening, candidate ranking or video interviews with people applying for a job in NYC (or NYC residents), the OBLIGATION falls on YOU as the employer-deployer, not on the vendor. Key nuance: although an independent auditor runs the bias audit, it is the employer who must ensure it exists, is recent (<12 months) and is published. It is not enough for the provider to say its tool is 'fair'.",
    action:
      "Identify which hiring tools fall within the AEDT definition. Commission (or require evidence of) an independent bias audit less than 1 year old, publish the summary of results on your website, and give the candidate notice at least 10 business days in advance (stating that an AEDT will be used, how, and what data is collected). Keep the evidence.",
    articles: [
      "NYC Admin. Code §§ 20-870 to 20-874 (Local Law 144 of 2021)",
      "6 RCNY §§ 5-300 to 5-304 (DCWP final rule, 6 Apr 2023)",
    ],
    source: {
      label:
        "DCWP — Automated Employment Decision Tools (New York City)",
      url: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
    },
    scope: { riskLevels: ["high"] },
  },
  {
    id: "us-nyc-ll144-annual-audit",
    date: "2023-07-05",
    kind: "deadline",
    framework: "us-nyc-ll144",
    title: "NYC LL144: the bias audit expires every 12 months (renewal)",
    summary:
      "The rule requires the AEDT bias audit to be no more than one year old relative to its use. In practice it is a RECURRING obligation: each tool must be re-audited within its own 12-month cycle to keep being used lawfully in NYC.",
    impact:
      "It is not a fixed calendar deadline for everyone, but a ROLLING expiry per tool from the date of its last audit. For a deployer it means a continuous currency check: an expired audit turns use of the tool into non-compliance, with civil penalties of 500 to 1,500 USD per day and per violation (DCWP).",
    action:
      "Keep a record of the last bias-audit date for each AEDT and schedule its renewal before it turns 12 months old. In the Attesta inventory, tie the audit date to each hiring system and treat it as evidence with an expiry.",
    articles: [
      "6 RCNY § 5-301 (bias audit)",
      "6 RCNY § 5-302 (publication of the summary of results)",
    ],
    source: {
      label: "DCWP — AEDT FAQ (official New York City PDF)",
      url: "https://www.nyc.gov/assets/dca/downloads/pdf/about/DCWP-AEDT-FAQ.pdf",
    },
    scope: { riskLevels: ["high"] },
  },

  // ── Colorado AI Act (repealed and rewritten by SB 26-189) ──
  {
    id: "us-co-aiact-effective",
    date: "2027-01-01",
    kind: "deadline",
    framework: "us-co-aiact",
    title: "Colorado: effectiveness of the rewritten AI law (SB 26-189, ADMT)",
    summary:
      "The original Colorado AI Act (SB 24-205, C.R.S. §§ 6-1-1701 to 6-1-1707) was postponed and then REPEALED AND REWRITTEN by SB 26-189 (signed 14 May 2026). The new version abandons the European-style 'high-risk' framework (it removes the duty of care, the mandatory risk-management programs and the annual impact assessments) and regulates 'automated decision technology' (ADMT) used in consequential decisions, with developer documentation obligations, consumer notice, data access and a request for human review. Effective: 1 January 2027.",
    impact:
      "Employment is a 'consequential decision', so if you operate in Colorado and use AI in hiring, this law reaches you as a deployer/user. BUT beware of outdated material: much of what is published describes SB 24-205 (duty of care + impact assessments), which is NO LONGER the law in force. The regime applicable in 2027 is SB 26-189, lighter on risk burdens but focused on transparency, notice and human review. It is a window, not urgency.",
    action:
      "Do not yet invest in heavy documentation assuming the old Colorado model. Keep this event under watch and reconfirm the final content of SB 26-189 (consumer notice, right to human review, documentation required from the provider) as the consolidated text and the Attorney General's rules are published. Flag your hiring systems used in Colorado for review before 2027.",
    articles: [
      "SB 26-189 (repeals and rewrites C.R.S. § 6-1-1701 et seq.) — consolidated numbering to be reconfirmed",
    ],
    source: {
      label: "Colorado General Assembly — SB 26-189 (official legislative source)",
      url: "https://leg.colorado.gov/bills/sb26-189",
    },
    scope: { riskLevels: ["high"] },
  },
  {
    id: "us-co-aiact-repeal-reenact",
    date: "2026-05-14",
    kind: "amendment",
    framework: "us-co-aiact",
    title: "Colorado repeals the original 'high-risk' model and rewrites it",
    summary:
      "SB 24-205 (signed 17 May 2024) was to take effect on 1 Feb 2026; it was postponed to 30 Jun 2026 (SB 25B-004, 28 Aug 2025) and finally SB 26-189 (14 May 2026) repealed and rewrote the framework, removing the 'high-risk' classification, the duty of care against algorithmic discrimination, the risk-management programs and the annual impact assessments, and postponing the effective date to 1 Jan 2027.",
    impact:
      "A context record to avoid confusing versions. If a consultant or document cites 'Colorado's high-risk deployer obligations' (duty of care, annual impact assessment, report to the AG within 90 days), it is describing the REPEALED law. Attesta must reflect the current state so as not to give outdated guidance.",
    action:
      "Treat SB 24-205 as historical. Any mapping of Attesta controls to 'Colorado' must point to the SB 26-189 regime (ADMT), not to the original high-risk model.",
    articles: [
      "SB 24-205 (2024, repealed)",
      "SB 25B-004 (2025, postponement to 30 Jun 2026)",
      "SB 26-189 (2026, repeal and rewrite; effective 1 Jan 2027)",
    ],
    source: {
      label: "Colorado General Assembly — SB 24-205 (official history and status)",
      url: "https://leg.colorado.gov/bills/sb24-205",
    },
    scope: { riskLevels: ["high"] },
  },

  // ── Illinois — AI Video Interview Act (820 ILCS 42) ──
  {
    id: "us-il-aivia-inforce",
    date: "2020-01-01",
    kind: "enforcement",
    framework: "us-il-aivia",
    title: "Illinois AI Video Interview Act: consent and information",
    summary:
      "The Artificial Intelligence Video Interview Act (820 ILCS 42) has been in force since 1 Jan 2020. An employer that uses AI to analyze candidates' video interviews must, BEFORE the interview: (1) notify the candidate that AI may be used to analyze the video, (2) explain how the AI works and what types of characteristics it evaluates, and (3) obtain their consent. It cannot use AI to evaluate someone who did not consent and must delete the videos within 30 days if the candidate so requests.",
    impact:
      "Applies squarely to AI-analyzed video interviewing, one of our core use cases. The obligation is the employer-deployer's. It is low operational burden (notice + explanation + consent + deletion on request) but a silent violation that is easy to commit if the video-interview provider does not give you the explanatory text.",
    action:
      "Before each AI-analyzed video interview: deliver the notice and the explanation of what the system evaluates, collect consent and offer an alternative to those who do not consent. Enable video deletion within 30 days on request. Keep the consent as evidence.",
    articles: [
      "820 ILCS 42/5 (consent and notice)",
      "820 ILCS 42/10 (limit on whom the video may be shared with)",
      "820 ILCS 42/15 (deletion within 30 days on request)",
      "820 ILCS 42/20 (demographic report where AI alone is used to screen applicants for an in-person interview)",
    ],
    source: {
      label: "Illinois General Assembly — 820 ILCS 42 (official legal text)",
      url: "https://www.ilga.gov/Legislation/ILCS/Articles?ActID=4015&ChapterID=68",
    },
    scope: { riskLevels: ["high"] },
  },

  // ── Illinois — Human Rights Act amended (HB 3773) ──
  {
    id: "us-il-hra-ai-amendment",
    date: "2026-01-01",
    kind: "amendment",
    framework: "us-il-hra",
    title: "Illinois HRA (HB 3773): discriminatory AI in employment + notice",
    summary:
      "HB 3773 amends the Illinois Human Rights Act (775 ILCS 5) and, since 1 Jan 2026, expressly prohibits an employer from using AI that has the effect of discriminating by protected class in recruitment, hiring, promotion, training, dismissal, discipline and other conditions of employment. It also prohibits using ZIP code as a proxy for protected class and requires NOTIFYING candidates and employees when AI is used in those decisions. The IDHR's detailed regulations were temporarily withdrawn, but the statutory obligations remain in force.",
    impact:
      "It is an anti-discrimination law applied to employment AI, not an audit regime. It fits our European framing: bias in hiring tools is tackled via anti-discrimination law (here the IHRA), not as a 'provider' obligation. The deployer's burden: understand how its tool decides, avoid discriminatory effects (including the ZIP proxy) and notify the use of AI. The uncertainty is in the exact FORM of the notice, because the detailed rules were withdrawn.",
    action:
      "If you hire in Illinois: inventory where AI intervenes in employment decisions, require the provider to give evidence of bias/adverse-impact testing, avoid proxy variables (e.g. ZIP code), and prepare a clear notice of AI use for candidates and employees. Watch for the IDHR regulations to reappear so you can adjust the notice format.",
    articles: [
      "775 ILCS 5/2-102 (employment practices, amended)",
      "775 ILCS 5/1-103 (definitions, AI and ZIP as a proxy)",
      "HB 3773 (Public Act 103-0804)",
    ],
    source: {
      label:
        "Illinois General Assembly — Illinois Human Rights Act (775 ILCS 5)",
      url: "https://www.ilga.gov/Legislation/ILCS/Articles?ActID=2266&ChapterID=64",
    },
    scope: { riskLevels: ["high"] },
  },

  // ── EEOC (federal) — context: guidance withdrawn, not law ──
  {
    id: "us-eeoc-ai-guidance-withdrawn",
    date: "2025-01-01",
    kind: "guidance",
    framework: "us-eeoc",
    title: "EEOC: AI guidance (Title VII/ADA) WITHDRAWN (not law)",
    summary:
      "The EEOC had published technical assistance on the use of AI in employment: May 2022 on the ADA ('screen out' of people with disabilities) and May 2023 on Title VII (adverse impact). In January 2025 the EEOC WITHDREW that material from eeoc.gov; the detailed ADA document returns 404 and the surviving page is a shell. Important: it was GUIDANCE, not law, and its withdrawal does NOT change the underlying laws.",
    impact:
      "For the deployer, the honest message is: the federal anti-discrimination laws (Title VII, ADA, ADEA) STILL apply to AI hiring tools; what disappeared is the AI-specific interpretive guidance. There is no new federal obligation to 'audit AI', but a tool that produces adverse impact or screens out people with disabilities is still a federal legal risk. Do not over-state that 'there is no longer a federal rule'.",
    action:
      "Do not rely on the withdrawn guidance as a source. Keep the good practices it required (adverse-impact testing, reasonable accommodations for candidates with disabilities, accessible alternatives) because the underlying laws did not change. Watch for possible re-issues of the guidance.",
    articles: [
      "Title VII (42 U.S.C. § 2000e et seq.)",
      "ADA (42 U.S.C. § 12101 et seq.)",
      "ADEA (29 U.S.C. § 621 et seq.)",
    ],
    source: {
      label: "EEOC — Artificial Intelligence and the ADA (official page)",
      url: "https://www.eeoc.gov/eeoc-disability-related-resources/artificial-intelligence-and-ada",
    },
    scope: { riskLevels: ["high"] },
  },
];

/* -------------------------------------------------------------------------- */
/* Motor de relevancia                                                        */
/* -------------------------------------------------------------------------- */

/** Sistemas del inventario afectados por un evento. */
export function affectedSystems(
  event: RegulatoryEvent,
  systems: AiSystem[],
): AiSystem[] {
  if (event.scope.all) return systems;
  const levels = event.scope.riskLevels;
  if (!levels || levels.length === 0) return systems;
  return systems.filter((s) => levels.includes(s.risk));
}

/**
 * Días desde hoy hasta la fecha del evento (negativo si ya pasó).
 * `now` se inyecta para permitir un cálculo estable por request.
 */
export function daysUntil(dateIso: string, now: Date): number {
  const MS_DAY = 86_400_000;
  const target = new Date(`${dateIso}T00:00:00Z`).getTime();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).getTime();
  return Math.round((target - today) / MS_DAY);
}

/** ¿El evento está en el futuro (o es hoy)? */
export function isUpcoming(event: RegulatoryEvent, now: Date): boolean {
  return daysUntil(event.date, now) >= 0;
}

/** Eventos ordenados por fecha (asc = próximos primero). */
export function sortByDate(
  events: RegulatoryEvent[],
  dir: "asc" | "desc" = "asc",
): RegulatoryEvent[] {
  const k = dir === "asc" ? 1 : -1;
  return [...events].sort((a, b) => k * a.date.localeCompare(b.date));
}

/** Próximos plazos (kind = deadline y fecha futura), del más cercano al más lejano. */
export function upcomingDeadlines(
  now: Date,
  events: RegulatoryEvent[] = REGULATORY_EVENTS,
): RegulatoryEvent[] {
  return sortByDate(
    events.filter((e) => e.kind === "deadline" && isUpcoming(e, now)),
    "asc",
  );
}

/**
 * Catálogo curado base según locale (default ES). Fuente única para elegir
 * `REGULATORY_EVENTS_EN` como línea base cuando la UI está en inglés.
 */
export function regulatoryEventsBase(locale: Locale = "es"): RegulatoryEvent[] {
  return locale === "en" ? REGULATORY_EVENTS_EN : REGULATORY_EVENTS;
}

/**
 * Fusiona el catálogo curado (línea base de confianza) con los eventos que el
 * pipeline haya publicado. El código SIEMPRE gana ante un choque de `id`: un
 * evento publicado por el pipeline solo se añade si su id no existe ya curado.
 *
 * Retrocompatible: `curated` sigue admitiendo un array explícito; si se omite,
 * la base curada se resuelve por `locale` (default ES → `REGULATORY_EVENTS`).
 *
 * NOTA Fase 2: la fusión real vive en la fachada de datos
 * (`src/lib/data/{mock,supabase}-repo.ts` → `getRegulatoryEvents`), que hoy
 * llama `mergeCatalog([...])` sin locale. Para servir EN, esos getters deben
 * pasar el `locale` resuelto (o `regulatoryEventsBase(locale)` como `curated`).
 */
export function mergeCatalog(
  published: RegulatoryEvent[],
  curated?: RegulatoryEvent[],
  locale: Locale = "es",
): RegulatoryEvent[] {
  const base = curated ?? regulatoryEventsBase(locale);
  const seen = new Set(base.map((e) => e.id));
  const extra = published.filter((e) => !seen.has(e.id));
  return [...base, ...extra];
}
