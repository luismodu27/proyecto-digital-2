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

/* -------------------------------------------------------------------------- */
/* Equipo / miembros                                                          */
/* -------------------------------------------------------------------------- */

export type MemberRole = "owner" | "admin" | "member";

export const ROLE_LABEL: Record<MemberRole, string> = {
  owner: "Propietario",
  admin: "Administrador",
  member: "Miembro",
};

export const ROLE_HINT: Record<MemberRole, string> = {
  owner: "Control total: gestiona el equipo, la organización y puede borrar sistemas.",
  admin: "Gestiona sistemas, brechas y evaluaciones; puede invitar a miembros.",
  member: "Acceso de lectura al panel de la organización.",
};

export type OrgMember = {
  userId: string;
  email: string;
  role: MemberRole;
  joinedAt: string; // ISO
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: MemberRole;
  createdAt: string; // ISO
};

/** Equipo de ejemplo (modo demo). */
export const SAMPLE_MEMBERS: OrgMember[] = [
  {
    userId: "demo-1",
    email: "ana.lopez@empresa-demo.com",
    role: "owner",
    joinedAt: "2026-05-02T10:00:00Z",
  },
  {
    userId: "demo-2",
    email: "legal@empresa-demo.com",
    role: "admin",
    joinedAt: "2026-05-10T09:30:00Z",
  },
  {
    userId: "demo-3",
    email: "talent@empresa-demo.com",
    role: "member",
    joinedAt: "2026-06-01T14:15:00Z",
  },
];

export const SAMPLE_INVITATIONS: PendingInvitation[] = [
  {
    id: "inv-demo-1",
    email: "auditor.externo@despacho.com",
    role: "member",
    createdAt: "2026-07-14T12:00:00Z",
  },
];

/* -------------------------------------------------------------------------- */
/* Registro de actividad (audit-trail)                                        */
/* -------------------------------------------------------------------------- */

export type AuditAction = "insert" | "update" | "delete";

/** Una entrada del registro de actividad, ya legible para la UI. */
export type AuditEntry = {
  id: number;
  actorEmail: string | null;
  table: string; // ai_systems | risk_assessments | gap_items | memberships
  rowId: string;
  action: AuditAction;
  label: string; // nombre/resumen de la fila afectada
  changed: string[]; // campos (humanos) cambiados en un update
  at: string; // ISO
};

/** Registro de actividad de ejemplo (modo demo). */
export const SAMPLE_AUDIT: AuditEntry[] = [
  {
    id: 8,
    actorEmail: "legal@empresa-demo.com",
    table: "gap_items",
    rowId: "GAP-03",
    action: "update",
    label: "Supervisión humana efectiva",
    changed: ["estado"],
    at: "2026-07-16T15:42:00Z",
  },
  {
    id: 7,
    actorEmail: "ana.lopez@empresa-demo.com",
    table: "risk_assessments",
    rowId: "AS-005-1",
    action: "insert",
    label: "nivel Alto riesgo",
    changed: [],
    at: "2026-07-10T11:00:00Z",
  },
  {
    id: 6,
    actorEmail: "ana.lopez@empresa-demo.com",
    table: "ai_systems",
    rowId: "SYS-005",
    action: "update",
    label: "Test psicométrico automatizado",
    changed: ["riesgo", "respaldo", "última revisión"],
    at: "2026-07-10T11:00:05Z",
  },
  {
    id: 5,
    actorEmail: "talent@empresa-demo.com",
    table: "gap_items",
    rowId: "GAP-04",
    action: "insert",
    label: "Control de sesgo en la selección de candidatos",
    changed: [],
    at: "2026-07-05T09:12:00Z",
  },
  {
    id: 4,
    actorEmail: "ana.lopez@empresa-demo.com",
    table: "memberships",
    rowId: "mem-3",
    action: "insert",
    label: "rol Miembro",
    changed: [],
    at: "2026-06-01T14:15:00Z",
  },
  {
    id: 3,
    actorEmail: "ana.lopez@empresa-demo.com",
    table: "ai_systems",
    rowId: "SYS-001",
    action: "insert",
    label: "Cribado de CVs — ATS",
    changed: [],
    at: "2026-05-28T08:30:00Z",
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
