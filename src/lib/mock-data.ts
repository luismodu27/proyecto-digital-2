/**
 * Datos de ejemplo para el esqueleto del dashboard (app shell).
 * TODO(backend): reemplazar por datos reales cuando exista la capa de datos.
 */

export type RiskLevel = "unacceptable" | "high" | "limited" | "minimal";

/** Nivel de respaldo de una autoevaluación. */
export type EvidenceState = "declared" | "evidenced" | "reviewed";

export const EVIDENCE_LABEL: Record<EvidenceState, string> = {
  declared: "Declarado",
  evidenced: "Con evidencia",
  reviewed: "Revisado",
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  unacceptable: "Inaceptable",
  high: "Alto riesgo",
  limited: "Riesgo limitado",
  minimal: "Riesgo mínimo",
};

export type AiSystem = {
  id: string; // código visible (p. ej. SYS-001) o uuid si no hay código
  dbId?: string; // uuid real en BD (para editar/borrar; ausente en modo demo)
  name: string;
  owner: string;
  domain: string;
  vendor: string;
  risk: RiskLevel;
  compliance: number; // 0-100 · "preparación para auditoría" (% listo)
  lastReviewed: string;
  evidenceState?: EvidenceState;
};

export const AI_SYSTEMS: AiSystem[] = [
  {
    id: "SYS-001",
    name: "Cribado de CVs — ATS",
    owner: "RRHH",
    domain: "Contratación",
    vendor: "HireFlow",
    risk: "high",
    compliance: 42,
    lastReviewed: "2026-06-28",
  },
  {
    id: "SYS-002",
    name: "Ranking de candidatos",
    owner: "Talent Acquisition",
    domain: "Selección",
    vendor: "Interno",
    risk: "high",
    compliance: 61,
    lastReviewed: "2026-07-02",
    evidenceState: "evidenced",
  },
  {
    id: "SYS-003",
    name: "Entrevistas por vídeo con IA",
    owner: "RRHH",
    domain: "Evaluación",
    vendor: "VidAssess",
    risk: "high",
    compliance: 35,
    lastReviewed: "2026-05-30",
  },
  {
    id: "SYS-004",
    name: "Chatbot de reclutamiento",
    owner: "Talent Acquisition",
    domain: "Atención a candidatos",
    vendor: "OpenAI",
    risk: "limited",
    compliance: 70,
    lastReviewed: "2026-07-05",
  },
  {
    id: "SYS-005",
    name: "Test psicométrico automatizado",
    owner: "RRHH",
    domain: "Evaluación",
    vendor: "PsychMetric",
    risk: "high",
    compliance: 55,
    lastReviewed: "2026-07-10",
    evidenceState: "reviewed",
  },
  {
    id: "SYS-006",
    name: "Agenda de entrevistas",
    owner: "People Ops",
    domain: "Logística",
    vendor: "Interno",
    risk: "minimal",
    compliance: 88,
    lastReviewed: "2026-06-20",
  },
];

export type GapItem = {
  id: string;
  requirement: string;
  article: string;
  status: "missing" | "partial" | "done";
  severity: "alta" | "media" | "baja";
  system: string;
};

export const GAP_ITEMS: GapItem[] = [
  {
    id: "GAP-01",
    requirement: "Documentación técnica del sistema (Anexo IV)",
    article: "Art. 11",
    status: "missing",
    severity: "alta",
    system: "SYS-001",
  },
  {
    id: "GAP-02",
    requirement: "Registro y trazabilidad de eventos (logging)",
    article: "Art. 12",
    status: "partial",
    severity: "alta",
    system: "SYS-001",
  },
  {
    id: "GAP-03",
    requirement: "Supervisión humana efectiva",
    article: "Art. 14",
    status: "missing",
    severity: "alta",
    system: "SYS-003",
  },
  {
    id: "GAP-04",
    requirement: "Control de sesgo en la selección de candidatos",
    article: "Art. 10",
    status: "partial",
    severity: "media",
    system: "SYS-002",
  },
  {
    id: "GAP-05",
    requirement: "Información y transparencia al usuario",
    article: "Art. 13",
    status: "done",
    severity: "media",
    system: "SYS-004",
  },
];

export const RISK_ORDER: RiskLevel[] = [
  "unacceptable",
  "high",
  "limited",
  "minimal",
];

export function riskCounts(systems: AiSystem[]): Record<RiskLevel, number> {
  return systems.reduce(
    (acc, s) => {
      acc[s.risk] += 1;
      return acc;
    },
    { unacceptable: 0, high: 0, limited: 0, minimal: 0 } as Record<
      RiskLevel,
      number
    >,
  );
}

export function avgCompliance(systems: AiSystem[]): number {
  if (!systems.length) return 0;
  return Math.round(
    systems.reduce((sum, s) => sum + s.compliance, 0) / systems.length,
  );
}
