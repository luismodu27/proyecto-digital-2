/**
 * Motor de recomendaciones de remediación — EU AI Act.
 *
 * Convierte una clasificación de riesgo y/o las brechas abiertas de una
 * organización en RECOMENDACIONES ACCIONABLES: qué hacer, por qué importa, con
 * qué prioridad y esfuerzo, y a qué artículo responde.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Contenido revisable por el
 * subagente `compliance-domain-expert`.
 */

import type { AiSystem, GapItem, RiskLevel } from "./mock-data";
import type { Locale } from "./i18n/config";

export type Priority = "crítica" | "alta" | "media";
export type Effort = "bajo" | "medio" | "alto";

export type Recommendation = {
  id: string;
  title: string;
  /** Acción concreta a realizar. */
  action: string;
  article: string;
  priority: Priority;
  effort: Effort;
  /** Nombres de sistemas afectados (en el plan de organización). */
  systems?: string[];
};

const PRIORITY_ORDER: Record<Priority, number> = {
  crítica: 0,
  alta: 1,
  media: 2,
};

/**
 * Catálogo de remediaciones por artículo. Base defendible para el mid-market
 * deployer; los casos límite deben revisarse con un experto.
 */
type CatalogEntry = Omit<Recommendation, "id" | "systems">;

const REMEDIATION: Record<string, CatalogEntry> = {
  "Art. 5": {
    title: "Práctica prohibida: cesar o rediseñar",
    action:
      "Retira el sistema del uso o rediséñalo para eliminar la práctica prohibida antes de cualquier despliegue en la UE.",
    article: "Art. 5",
    priority: "crítica",
    effort: "alto",
  },
  "Art. 9": {
    title: "Sistema de gestión de riesgos (verificación)",
    action:
      "Obligación principalmente del proveedor: implantar un proceso continuo de gestión de riesgos a lo largo del ciclo de vida. Como deployer, verifica que el proveedor lo haya implantado y que el sistema lleve marcado CE, y conserva esa evidencia.",
    article: "Art. 9",
    priority: "media",
    effort: "medio",
  },
  "Art. 10": {
    title: "Gobernanza y calidad de datos (verificación)",
    action:
      "Obligación principalmente del proveedor: documentar origen, representatividad y calidad de los datos de entrenamiento/validación y controlar sesgos. Como deployer, verifica que exista y, cuando controles los datos de entrada, asegúrate de que sean pertinentes y representativos para la finalidad prevista (Art. 26.4).",
    article: "Art. 10",
    priority: "media",
    effort: "medio",
  },
  "Art. 11": {
    title: "Documentación técnica (Anexo IV)",
    action:
      "Obligación principalmente del proveedor: elaborar la documentación técnica conforme al Anexo IV. Como deployer, exige al proveedor esa documentación (e instrucciones) y consérvala como evidencia de auditoría.",
    article: "Art. 11",
    priority: "media",
    effort: "bajo",
  },
  "Art. 12": {
    title: "Registro y trazabilidad (logging)",
    action:
      "El proveedor diseña el registro automático de eventos (por diseño). Como deployer, mantén el sistema con el logging activo y conserva los logs que estén bajo tu control durante al menos 6 meses (Art. 26.6), salvo que otra norma exija más.",
    article: "Art. 12",
    priority: "media",
    effort: "medio",
  },
  "Art. 13": {
    title: "Transparencia e instrucciones de uso",
    action:
      "El proveedor debe entregar instrucciones de uso claras y suficientes. Como deployer, exígelas, asegúrate de que permiten interpretar la salida del sistema y úsalo conforme a ellas.",
    article: "Art. 13",
    priority: "media",
    effort: "bajo",
  },
  "Art. 14": {
    title: "Supervisión humana efectiva",
    action:
      "El proveedor diseña el sistema para permitir supervisión humana (Art. 14). Como deployer (Art. 26.2), encarga la supervisión a personas físicas con competencia, formación, autoridad y apoyo para intervenir o detener el sistema.",
    article: "Art. 14",
    priority: "crítica",
    effort: "medio",
  },
  "Art. 15": {
    title: "Exactitud, robustez y ciberseguridad (verificación)",
    action:
      "Obligación principalmente del proveedor: alcanzar y mantener niveles adecuados de exactitud, robustez y ciberseguridad y declarar las métricas en las instrucciones. Como deployer, revisa esas métricas frente a tu caso de uso y protege el entorno en el que operas el sistema.",
    article: "Art. 15",
    priority: "media",
    effort: "medio",
  },
  "Art. 26": {
    title: "Obligaciones del responsable del despliegue",
    action:
      "Como deployer: usa el sistema conforme a las instrucciones, encarga la supervisión humana a personas competentes, vigila el funcionamiento (y notifica riesgos/incidentes graves), conserva los logs bajo tu control (≥6 meses) e informa a los trabajadores afectados antes de desplegarlo en el puesto de trabajo.",
    article: "Art. 26",
    priority: "crítica",
    effort: "medio",
  },
  "Art. 27": {
    title: "Evaluación de impacto en derechos fundamentales (FRIA)",
    action:
      "Obligación propia del deployer: si eres organismo público, prestas servicios públicos o despliegas sistemas de Anexo III puntos 5(b)/5(c) (scoring crediticio, seguros de vida/salud), realiza y documenta la FRIA ANTES del primer uso y notifica el resultado a la autoridad de vigilancia.",
    article: "Art. 27",
    priority: "alta",
    effort: "medio",
  },
  "Art. 49": {
    title: "Registro en la base de datos de la UE",
    action:
      "Como deployer privado del mid-market normalmente NO registras el sistema (lo registra el proveedor). Solo si eres autoridad pública u organismo que actúa en su nombre debes registrar el uso y verificar que el sistema figure en la base de datos de la UE antes de desplegarlo (Art. 49.3).",
    article: "Art. 49",
    priority: "media",
    effort: "bajo",
  },
  "Art. 50": {
    title: "Transparencia hacia las personas",
    action:
      "Obligación que aplica a proveedores y a deployers. Como deployer: informa a las personas cuando uses reconocimiento de emociones o categorización biométrica, y revela que un contenido es un ultrafalso (deepfake) o texto generado por IA de interés público. Cuando el sistema interactúe con personas, asegúrate de que se les informa de que hablan con una IA.",
    article: "Art. 50",
    priority: "media",
    effort: "bajo",
  },
};

/**
 * Versión INGLESA VALIDADA del catálogo, forma y claves IDÉNTICAS a `REMEDIATION`
 * (las claves "Art. N" NO se traducen; `priority`/`effort`/`article` son valores
 * canónicos —NO texto— y quedan idénticos). Solo se traduce el texto orientado al
 * usuario (`title`, `action`).
 *
 * WIRING (pendiente): hoy `toRec` → `recommendationsForLevel`/`buildActionPlan`
 * leen SIEMPRE el mapa ES `REMEDIATION`. Para exponer EN, una versión locale-aware
 * de `toRec`/`buildActionPlan` debe seleccionar `REMEDIATION_EN` (+
 * `GENERIC_REMEDIATION_ACTION_EN` para la brecha sin remediación validada y
 * `PRIORITIZE_HIGH_RISK_EN` para el punto crítico transversal de alto riesgo).
 * No se toca la lógica aquí; solo se exponen los datos.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal.
 */
export const REMEDIATION_EN: Record<string, CatalogEntry> = {
  "Art. 5": {
    title: "Prohibited practice: cease or redesign",
    action:
      "Withdraw the system from use or redesign it to remove the prohibited practice before any deployment in the EU.",
    article: "Art. 5",
    priority: "crítica",
    effort: "alto",
  },
  "Art. 9": {
    title: "Risk management system (verification)",
    action:
      "Primarily a provider obligation: run a continuous risk management process across the lifecycle. As a deployer, verify that the provider has implemented it and that the system bears the CE marking, and retain that evidence.",
    article: "Art. 9",
    priority: "media",
    effort: "medio",
  },
  "Art. 10": {
    title: "Data governance and data quality (verification)",
    action:
      "Primarily a provider obligation: document the origin, representativeness and quality of the training/validation data and control for bias. As a deployer, verify that this exists and, where you control the input data, make sure it is relevant and representative for the intended purpose (Art. 26.4).",
    article: "Art. 10",
    priority: "media",
    effort: "medio",
  },
  "Art. 11": {
    title: "Technical documentation (Annex IV)",
    action:
      "Primarily a provider obligation: draw up the technical documentation in accordance with Annex IV. As a deployer, require that documentation (and the instructions for use) from the provider and retain it as audit evidence.",
    article: "Art. 11",
    priority: "media",
    effort: "bajo",
  },
  "Art. 12": {
    title: "Record-keeping and traceability (logging)",
    action:
      "The provider designs the automatic logging of events (by design). As a deployer, keep the system running with logging enabled and retain the logs under your control for at least 6 months (Art. 26.6), unless other law requires longer.",
    article: "Art. 12",
    priority: "media",
    effort: "medio",
  },
  "Art. 13": {
    title: "Transparency and instructions for use",
    action:
      "The provider must supply clear and sufficient instructions for use. As a deployer, require them, make sure they let you interpret the system's output, and use the system in accordance with them.",
    article: "Art. 13",
    priority: "media",
    effort: "bajo",
  },
  "Art. 14": {
    title: "Effective human oversight",
    action:
      "The provider designs the system to enable human oversight (Art. 14). As a deployer (Art. 26.2), assign oversight to natural persons with the competence, training, authority and support to intervene in or stop the system.",
    article: "Art. 14",
    priority: "crítica",
    effort: "medio",
  },
  "Art. 15": {
    title: "Accuracy, robustness and cybersecurity (verification)",
    action:
      "Primarily a provider obligation: achieve and maintain appropriate levels of accuracy, robustness and cybersecurity and declare the metrics in the instructions for use. As a deployer, review those metrics against your use case and protect the environment in which you operate the system.",
    article: "Art. 15",
    priority: "media",
    effort: "medio",
  },
  "Art. 26": {
    title: "Deployer obligations",
    action:
      "As a deployer: use the system in accordance with the instructions for use, assign human oversight to competent persons, monitor its operation (and report serious risks/incidents), retain the logs under your control (≥6 months), and inform affected workers before deploying it in the workplace.",
    article: "Art. 26",
    priority: "crítica",
    effort: "medio",
  },
  "Art. 27": {
    title: "Fundamental rights impact assessment (FRIA)",
    action:
      "A deployer's own obligation: if you are a public body, provide public services, or deploy Annex III point 5(b)/5(c) systems (credit scoring, life/health insurance), carry out and document the FRIA BEFORE first use and notify the result to the market surveillance authority.",
    article: "Art. 27",
    priority: "alta",
    effort: "medio",
  },
  "Art. 49": {
    title: "Registration in the EU database",
    action:
      "As a private mid-market deployer you normally do NOT register the system (the provider does). Only if you are a public authority, or a body acting on its behalf, must you register the use and verify that the system appears in the EU database before deploying it (Art. 49.3).",
    article: "Art. 49",
    priority: "media",
    effort: "bajo",
  },
  "Art. 50": {
    title: "Transparency towards people",
    action:
      "An obligation that applies to both providers and deployers. As a deployer: inform people when you use emotion recognition or biometric categorization, and disclose that content is a deepfake or AI-generated text on matters of public interest. When the system interacts with people, make sure they are informed that they are talking to an AI.",
    article: "Art. 50",
    priority: "media",
    effort: "bajo",
  },
};

/**
 * Acción genérica de respaldo (ES) para una brecha sin remediación validada por
 * artículo. Paralelo a `GENERIC_REMEDIATION_ACTION_EN`; texto idéntico al que
 * antes vivía inline en `buildActionPlan`.
 */
export const GENERIC_REMEDIATION_ACTION =
  "Prepara y conserva la evidencia declarada de este control, según el policy pack aplicado; asigna un responsable y una fecha objetivo.";

/**
 * Acción genérica de respaldo (EN) para una brecha sin remediación validada por
 * artículo: en `buildActionPlan` el título es el propio `requirement` del control
 * (dato del cliente/pack, no se traduce aquí) y la acción es este texto fijo.
 */
export const GENERIC_REMEDIATION_ACTION_EN =
  "Prepare and retain the declared evidence for this control, in line with the applied policy pack; assign an owner and a target date.";

/**
 * Punto crítico transversal (ES) que `buildActionPlan` antepone cuando hay
 * sistemas de alto riesgo con baja preparación. Paralelo a
 * `PRIORITIZE_HIGH_RISK_EN`; texto idéntico al que antes vivía inline.
 */
export const PRIORITIZE_HIGH_RISK = {
  title: "Priorizar sistemas de alto riesgo con baja preparación",
  action:
    "Concentra los recursos de remediación en estos sistemas: su nivel de riesgo es alto y su preparación (% listo) está por debajo del 50%.",
} as const;

/**
 * Punto crítico transversal (EN) que `buildActionPlan` antepone cuando hay
 * sistemas de alto riesgo con baja preparación. `article`/`priority`/`effort`/`id`
 * quedan idénticos en el consumidor; aquí solo el texto.
 */
export const PRIORITIZE_HIGH_RISK_EN = {
  title: "Prioritize high-risk systems with low readiness",
  action:
    "Concentrate remediation resources on these systems: their risk level is high and their readiness (% ready) is below 50%.",
} as const;

/** Artículos relevantes por nivel de riesgo. */
const ARTICLES_BY_LEVEL: Record<RiskLevel, string[]> = {
  unacceptable: ["Art. 5"],
  high: [
    // Obligaciones propias del deployer primero (ICP = deployer mid-market).
    "Art. 26",
    "Art. 14",
    "Art. 27",
    // Obligaciones principalmente del proveedor: el deployer las verifica/conserva.
    "Art. 13",
    "Art. 12",
    "Art. 11",
    "Art. 9",
    "Art. 10",
    "Art. 15",
    "Art. 49",
  ],
  limited: ["Art. 50"],
  minimal: [],
};

function toRec(
  article: string,
  locale: Locale = "es",
  over?: Partial<CatalogEntry>,
): Recommendation {
  const catalog = locale === "en" ? REMEDIATION_EN : REMEDIATION;
  const base = catalog[article];
  return {
    id: article.replace(/\W+/g, "-").toLowerCase(),
    ...base,
    ...over,
  };
}

/** Recomendaciones para un nivel de riesgo (usado tras clasificar un sistema). */
export function recommendationsForLevel(
  level: RiskLevel,
  locale: Locale = "es",
): Recommendation[] {
  return ARTICLES_BY_LEVEL[level]
    .map((a) => toRec(a, locale))
    .sort((x, y) => PRIORITY_ORDER[x.priority] - PRIORITY_ORDER[y.priority]);
}

/** Los puntos críticos (prioridad crítica) de un conjunto de recomendaciones. */
export function criticalPoints(recs: Recommendation[]): Recommendation[] {
  return recs.filter((r) => r.priority === "crítica");
}

const GAP_SEVERITY_TO_PRIORITY: Record<GapItem["severity"], Priority> = {
  alta: "crítica",
  media: "alta",
  baja: "media",
};

/**
 * Normaliza el `article` (a menudo rico: "Art. 26.2 (y Art. 14)",
 * "GDPR Art. 35", "Anexo III.5.b"…) a la clave canónica del catálogo REMEDIATION
 * cuando corresponde a un artículo del propio AI Act con remediación validada
 * para el deployer. Devuelve null para referencias sin entrada fiable
 * (GDPR/RGPD, directivas, Anexo, leyes estatales) o para el Art. 5 de prohibición
 * —cuyo encuadre prohibido/alto-riesgo depende del subapartado y ya está
 * redactado en el propio control—; esos casos usan el requisito del control como
 * recomendación, de modo que ninguna brecha se descarta.
 */
function remediationKeyFor(article: string | null | undefined): string | null {
  if (!article || !article.startsWith("Art. ")) return null;
  const m = article.match(/^Art\.\s*(\d+)/);
  if (!m) return null;
  const key = `Art. ${m[1]}`;
  if (key === "Art. 5") return null;
  return REMEDIATION[key] ? key : null;
}

/**
 * Plan de acción de la organización: combina brechas abiertas y sistemas de
 * alto riesgo en una lista priorizada y deduplicada por artículo.
 */
export function buildActionPlan(
  systems: AiSystem[],
  gaps: GapItem[],
  locale: Locale = "es",
): Recommendation[] {
  const byArticle = new Map<string, Recommendation>();
  const nameById = new Map(systems.map((s) => [s.id, s.name]));
  const genericAction =
    locale === "en" ? GENERIC_REMEDIATION_ACTION_EN : GENERIC_REMEDIATION_ACTION;
  const prioritizeHighRisk =
    locale === "en" ? PRIORITIZE_HIGH_RISK_EN : PRIORITIZE_HIGH_RISK;

  // 1) Brechas abiertas → recomendación (prioridad según severidad). El `article`
  //    de un control puede venir en formato rico; se normaliza a la clave del
  //    catálogo cuando hay remediación validada para ese artículo del AI Act, y
  //    si no, se genera la recomendación a partir del propio control (su
  //    requisito ya es texto validado del pack). Así ninguna brecha se pierde.
  for (const g of gaps) {
    if (g.status === "done") continue;

    const priority: Priority =
      g.status === "missing"
        ? GAP_SEVERITY_TO_PRIORITY[g.severity]
        : downgrade(GAP_SEVERITY_TO_PRIORITY[g.severity]);

    const systemName = nameById.get(g.system) ?? g.system;
    const key = remediationKeyFor(g.article);
    const dedupeKey = key ?? `req:${g.article}|${g.requirement}`;

    const existing = byArticle.get(dedupeKey);
    if (existing) {
      if (!existing.systems?.includes(systemName)) existing.systems?.push(systemName);
      if (PRIORITY_ORDER[priority] < PRIORITY_ORDER[existing.priority]) {
        existing.priority = priority;
      }
      continue;
    }

    byArticle.set(
      dedupeKey,
      key
        ? { ...toRec(key, locale, { priority }), systems: [systemName] }
        : {
            id: dedupeKey.replace(/\W+/g, "-").toLowerCase().slice(0, 64),
            title: g.requirement,
            action: genericAction,
            article: g.article || "—",
            priority,
            effort: "medio",
            systems: [systemName],
          },
    );
  }

  // 2) Sistemas de alto riesgo con baja preparación → punto crítico transversal.
  const criticalSystems = systems.filter(
    (s) => (s.risk === "high" || s.risk === "unacceptable") && s.compliance < 50,
  );
  const recs = Array.from(byArticle.values());
  if (criticalSystems.length > 0) {
    recs.unshift({
      id: "priorizar-alto-riesgo",
      title: prioritizeHighRisk.title,
      action: prioritizeHighRisk.action,
      article: "Art. 6",
      priority: "crítica",
      effort: "alto",
      systems: criticalSystems.map((s) => s.name),
    });
  }

  return recs.sort(
    (x, y) =>
      PRIORITY_ORDER[x.priority] - PRIORITY_ORDER[y.priority] ||
      (y.systems?.length ?? 0) - (x.systems?.length ?? 0),
  );
}

function downgrade(p: Priority): Priority {
  return p === "crítica" ? "alta" : p === "alta" ? "media" : "media";
}
