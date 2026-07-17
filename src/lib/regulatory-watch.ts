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

export type RegFramework =
  | "eu-ai-act"
  | "us-nyc-ll144"
  | "us-co-aiact"
  | "us-il-aivia"
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
    label: "Colorado AI Act (SB 24-205)",
    short: "Colorado AI Act",
    jurisdiction: "us-co",
    jurisdictionLabel: "EE. UU. — Colorado",
  },
  "us-il-aivia": {
    label: "Illinois — IA en el empleo",
    short: "Illinois",
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

/** Nombre del marco (con reserva segura para valores no conocidos de BD). */
export function frameworkLabel(framework: string): string {
  return FRAMEWORK_META[framework as RegFramework]?.label ?? framework;
}

/** Jurisdicción legible del marco (reserva: "Otras"). */
export function jurisdictionLabel(framework: string): string {
  return FRAMEWORK_META[framework as RegFramework]?.jurisdictionLabel ?? "Otras";
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

/** Compatibilidad: mapa simple id de marco → nombre. */
export const FRAMEWORK_LABEL: Record<RegFramework, string> = {
  "eu-ai-act": FRAMEWORK_META["eu-ai-act"].label,
  "us-nyc-ll144": FRAMEWORK_META["us-nyc-ll144"].label,
  "us-co-aiact": FRAMEWORK_META["us-co-aiact"].label,
  "us-il-aivia": FRAMEWORK_META["us-il-aivia"].label,
  "us-eeoc": FRAMEWORK_META["us-eeoc"].label,
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
 * Fusiona el catálogo curado (línea base de confianza) con los eventos que el
 * pipeline haya publicado. El código SIEMPRE gana ante un choque de `id`: un
 * evento publicado por el pipeline solo se añade si su id no existe ya curado.
 */
export function mergeCatalog(
  published: RegulatoryEvent[],
  curated: RegulatoryEvent[] = REGULATORY_EVENTS,
): RegulatoryEvent[] {
  const seen = new Set(curated.map((e) => e.id));
  const extra = published.filter((e) => !seen.has(e.id));
  return [...curated, ...extra];
}
