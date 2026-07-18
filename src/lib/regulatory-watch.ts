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
  "us-il-hra": FRAMEWORK_META["us-il-hra"].label,
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
