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

function toRec(article: string, over?: Partial<CatalogEntry>): Recommendation {
  const base = REMEDIATION[article];
  return {
    id: article.replace(/\W+/g, "-").toLowerCase(),
    ...base,
    ...over,
  };
}

/** Recomendaciones para un nivel de riesgo (usado tras clasificar un sistema). */
export function recommendationsForLevel(level: RiskLevel): Recommendation[] {
  return ARTICLES_BY_LEVEL[level]
    .map((a) => toRec(a))
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
 * Plan de acción de la organización: combina brechas abiertas y sistemas de
 * alto riesgo en una lista priorizada y deduplicada por artículo.
 */
export function buildActionPlan(
  systems: AiSystem[],
  gaps: GapItem[],
): Recommendation[] {
  const byArticle = new Map<string, Recommendation>();
  const nameById = new Map(systems.map((s) => [s.id, s.name]));

  // 1) Brechas abiertas → recomendación por artículo (prioridad según severidad).
  for (const g of gaps) {
    if (g.status === "done") continue;
    const article = g.article || "Art. 26";
    const base = REMEDIATION[article];
    if (!base) continue;

    const priority: Priority =
      g.status === "missing"
        ? GAP_SEVERITY_TO_PRIORITY[g.severity]
        : downgrade(GAP_SEVERITY_TO_PRIORITY[g.severity]);

    const systemName = nameById.get(g.system) ?? g.system;
    const existing = byArticle.get(article);
    if (existing) {
      if (!existing.systems?.includes(systemName)) existing.systems?.push(systemName);
      if (PRIORITY_ORDER[priority] < PRIORITY_ORDER[existing.priority]) {
        existing.priority = priority;
      }
    } else {
      byArticle.set(article, {
        ...toRec(article, { priority }),
        systems: [systemName],
      });
    }
  }

  // 2) Sistemas de alto riesgo con bajo cumplimiento → punto crítico transversal.
  const criticalSystems = systems.filter(
    (s) => (s.risk === "high" || s.risk === "unacceptable") && s.compliance < 50,
  );
  const recs = Array.from(byArticle.values());
  if (criticalSystems.length > 0) {
    recs.unshift({
      id: "priorizar-alto-riesgo",
      title: "Priorizar sistemas de alto riesgo con bajo cumplimiento",
      action:
        "Concentra los recursos de remediación en estos sistemas: su nivel de riesgo es alto y su cumplimiento está por debajo del 50%.",
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
