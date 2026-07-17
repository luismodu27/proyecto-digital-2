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

/** Una evaluación de riesgo guardada (para el historial de un sistema). */
export type AssessmentRecord = {
  id: string;
  level: RiskLevel;
  rationale: string;
  evidenceState: EvidenceState;
  attestedByName: string | null;
  evidenceNote?: string | null;
  evidenceUrl?: string | null;
  assessedAt: string; // ISO
};

/** Todo lo necesario para generar el dossier de gobernanza de un sistema. */
export type DossierData = {
  system: AiSystem & { actorRole: string };
  gaps: GapItem[];
  assessments: AssessmentRecord[];
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

/**
 * Historial de evaluaciones de ejemplo (modo demo), indexado por código de
 * sistema. Da vida al dossier y a la ficha del sistema sin backend.
 */
export const SAMPLE_ASSESSMENTS: Record<string, AssessmentRecord[]> = {
  "SYS-002": [
    {
      id: "AS-002-2",
      level: "high",
      rationale:
        "El sistema opera en un área de alto riesgo del Anexo III (empleo y gestión de trabajadores) y no le aplica ninguna excepción del Art. 6(3).",
      evidenceState: "evidenced",
      attestedByName: "Ana López · Responsable de RRHH",
      evidenceNote: "DPIA y prueba de sesgo del proveedor archivadas en el expediente.",
      evidenceUrl: "https://drive.example.com/ranking/dpia-2026.pdf",
      assessedAt: "2026-07-02T09:20:00Z",
    },
    {
      id: "AS-002-1",
      level: "high",
      rationale:
        "Clasificación inicial: ranking de candidatos en el ámbito de empleo (Anexo III).",
      evidenceState: "declared",
      attestedByName: null,
      assessedAt: "2026-05-14T16:05:00Z",
    },
  ],
  "SYS-005": [
    {
      id: "AS-005-1",
      level: "high",
      rationale:
        "Test psicométrico automatizado usado en selección de personal: alto riesgo del Anexo III (empleo).",
      evidenceState: "reviewed",
      attestedByName: "Comité de Gobernanza de IA",
      evidenceNote:
        "Revisado por Legal y RRHH; supervisión humana y DPIA documentadas.",
      assessedAt: "2026-07-10T11:00:00Z",
    },
  ],
  "SYS-001": [
    {
      id: "AS-001-1",
      level: "high",
      rationale:
        "Cribado de CVs en el ámbito de empleo (Anexo III); pendiente de reunir evidencia del proveedor.",
      evidenceState: "declared",
      attestedByName: null,
      assessedAt: "2026-06-28T08:30:00Z",
    },
  ],
};

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
