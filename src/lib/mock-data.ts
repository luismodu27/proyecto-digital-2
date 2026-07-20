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
  biasAudit?: import("./bias-audit").BiasAudit | null;
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
/** Auditorías de sesgo de ejemplo (NYC LL144) para la demo/dossier. */
export const SAMPLE_BIAS_AUDITS: Record<string, import("./bias-audit").BiasAudit> = {
  // Cribado de CVs (AEDT) con auditoría antigua → estado "vencida/por vencer" en el radar.
  "SYS-001": {
    isAedt: true,
    lastAuditDate: "2025-08-01",
    auditorName: "Fairwatch Audits LLP (auditor independiente)",
    auditorIndependenceConfirmed: true,
    summaryUrl: "https://talenta-rh.example.com/ley144/resumen-auditoria",
    summaryPublishedDate: "2025-08-12",
  },
  // Ranking de candidatos (AEDT) con auditoría reciente → "vigente".
  "SYS-002": {
    isAedt: true,
    lastAuditDate: "2026-05-15",
    auditorName: "Fairwatch Audits LLP (auditor independiente)",
    auditorIndependenceConfirmed: true,
    summaryUrl: "https://talenta-rh.example.com/ley144/ranking-resumen",
    summaryPublishedDate: "2026-05-20",
  },
};

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

/** Organización a la que pertenece el usuario (para el selector de org activa). */
export type UserOrg = {
  id: string;
  name: string;
  role: MemberRole;
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

/**
 * Estado de la cadena de integridad del audit-trail (encadenado con SHA-256).
 * `ok=false` indica que un evento fue alterado o borrado: `brokenId` es el
 * primer eslabón donde la cadena deja de cuadrar.
 */
export type AuditChainStatus = {
  total: number;
  ok: boolean;
  brokenId: number | null;
  checkedAt: string; // ISO
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

/* -------------------------------------------------------------------------- */
/* Acuse de vigilancia regulatoria ("marcar como revisado")                   */
/* -------------------------------------------------------------------------- */

export type RegAckStatus = "reviewed" | "planned" | "not_applicable";

export const REG_ACK_LABEL: Record<RegAckStatus, string> = {
  reviewed: "Revisado",
  planned: "Plan en marcha",
  not_applicable: "No aplica",
};

export type RegAck = {
  status: RegAckStatus;
  note: string | null;
  at: string; // ISO
};

/** Acuses de ejemplo (modo demo), indexados por id de evento regulatorio. */
export const SAMPLE_REG_ACKS: Record<string, RegAck> = {
  "eu-omnibus-highrisk-delay": {
    status: "reviewed",
    note: "Revisado por Legal; plan de preparación de alto riesgo en marcha.",
    at: "2026-07-15T10:00:00Z",
  },
  "eu-gpai-governance": {
    status: "not_applicable",
    note: null,
    at: "2026-07-12T09:00:00Z",
  },
};

/* -------------------------------------------------------------------------- */
/* Pipeline del "foso automatizado" — candidatos a la espera de validación     */
/* -------------------------------------------------------------------------- */

export type RegCandidateStatus = "draft" | "approved" | "rejected" | "superseded";

export const REG_CANDIDATE_STATUS_LABEL: Record<RegCandidateStatus, string> = {
  draft: "Borrador",
  approved: "Publicado",
  rejected: "Descartado",
  superseded: "Reemplazado",
};

/** Procedencia del borrador: qué agente lo generó y con qué señal. */
export type RegCandidateProvenance = {
  agent?: string; // p. ej. "Vigía" | "Analista"
  model?: string | null; // modelo LLM usado (null si determinista)
  embed_model?: string | null; // modelo de embeddings (Analista)
  confidence?: number | null; // 0..1
  excerpt?: string | null; // fragmento de la fuente que lo motivó
  detected_at?: string | null; // ISO
  /** Citas del Analista: qué fragmento de norma respalda cada afirmación. */
  citations?: { chunk_id: string; doc_ref: string; quote: string }[] | null;
  /** doc_refs de los fragmentos recuperados por RAG. */
  retrieved_refs?: string[] | null;
};

/** Borrador de evento regulatorio propuesto por el pipeline. */
export type RegCandidate = {
  id: string;
  proposedEventId: string | null;
  date: string | null; // ISO YYYY-MM-DD
  kind: string | null;
  framework: string;
  title: string;
  summary: string | null;
  impact: string | null;
  action: string | null;
  articles: string[];
  source: { label: string; url: string } | null;
  scope: { riskLevels?: string[]; all?: boolean };
  status: RegCandidateStatus;
  sourceLabel: string | null; // etiqueta de la fuente vigilada (reg_sources)
  provenance: RegCandidateProvenance;
  createdAt: string; // ISO
  reviewedAt: string | null;
  reviewNote: string | null;
};

/** Candidatos de ejemplo (modo demo) para mostrar la bandeja del Validador. */
export const SAMPLE_REG_CANDIDATES: RegCandidate[] = [
  {
    id: "cand-demo-1",
    proposedEventId: "eu-ai-office-hiring-guidelines",
    date: "2026-09-15",
    kind: "guidance",
    framework: "eu-ai-act",
    title:
      "La AI Office publica directrices sobre IA en selección de personal",
    summary:
      "Borrador detectado: la Oficina Europea de IA habría publicado directrices interpretativas sobre el uso de sistemas de IA de alto riesgo en contratación (Anexo III, empleo), con criterios de supervisión humana e información a los candidatos.",
    impact:
      "Afinaría cómo un deployer de RRHH aborda las obligaciones del Art. 26 en cribado de CVs y entrevistas: expectativas concretas de supervisión humana y transparencia hacia el candidato.",
    action:
      "Revisar el policy pack de RRHH contra las nuevas directrices y ajustar la evidencia de supervisión humana.",
    articles: ["Art. 26", "Anexo III"],
    source: {
      label: "European AI Office — guidelines (fuente a verificar)",
      url: "https://digital-strategy.ec.europa.eu/en/policies/ai-office",
    },
    scope: { riskLevels: ["high"] },
    status: "draft",
    sourceLabel: "AI Office — biblioteca",
    provenance: {
      agent: "Analista",
      model: null,
      confidence: 0.62,
      excerpt:
        "…guidelines on the use of high-risk AI systems in recruitment and worker management…",
      detected_at: "2026-07-16T08:00:00Z",
    },
    createdAt: "2026-07-16T08:05:00Z",
    reviewedAt: null,
    reviewNote: null,
  },
  {
    id: "cand-demo-2",
    proposedEventId: null,
    date: "2026-10-01",
    kind: "standard",
    framework: "eu-ai-act",
    title: "CEN-CENELEC avanza la norma armonizada de gestión de riesgos de IA",
    summary:
      "Borrador detectado: publicación de un estándar armonizado (presunción de conformidad) sobre gestión de riesgos de sistemas de IA de alto riesgo.",
    impact:
      "Podría dar una vía de presunción de conformidad; útil para exigir a proveedores evidencia alineada con la norma.",
    action:
      "Evaluar si el estándar aplica a los sistemas de alto riesgo del inventario y pedir a proveedores su alineación.",
    articles: ["Art. 40"],
    source: {
      label: "CEN-CENELEC JTC 21 (fuente a verificar)",
      url: "https://www.cencenelec.eu/",
    },
    scope: { riskLevels: ["high"] },
    status: "draft",
    sourceLabel: "CEN-CENELEC JTC 21",
    provenance: {
      agent: "Vigía",
      model: null,
      confidence: 0.48,
      excerpt: "…harmonised standard on AI risk management…",
      detected_at: "2026-07-15T07:30:00Z",
    },
    createdAt: "2026-07-15T07:35:00Z",
    reviewedAt: null,
    reviewNote: null,
  },
];

/* -------------------------------------------------------------------------- */
/* Vigía — fuentes vigiladas (watchlist del foso, Capa 7)                      */
/* -------------------------------------------------------------------------- */

/** Resultado del último chequeo del Vigía sobre una fuente. */
export type RegSourceStatus =
  | "baseline" // primera vez que se ve (línea base fijada)
  | "ok" // revisada, sin cambios
  | "changed" // cambió → generó una señal
  | "error"; // falló la descarga

export const REG_SOURCE_STATUS_LABEL: Record<RegSourceStatus, string> = {
  baseline: "Línea base",
  ok: "Sin cambios",
  changed: "Cambió",
  error: "Error",
};

/** Fuente oficial que el Vigía monitorea por fetch+hash. */
export type RegSource = {
  id: string;
  framework: string;
  label: string;
  url: string;
  sourceKind: string; // page | feed | api
  lastHash: string | null;
  lastCheckedAt: string | null;
  lastChangeAt: string | null;
  lastStatus: RegSourceStatus | null;
  failCount: number;
  active: boolean;
};

/** Watchlist de ejemplo (modo demo) para enseñar el panel del Vigía. */
export const SAMPLE_REG_SOURCES: RegSource[] = [
  {
    id: "src-demo-1",
    framework: "eu-ai-act",
    label: "EUR-Lex — Reglamento (UE) 2024/1689",
    url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    sourceKind: "page",
    lastHash: "a1b2c3",
    lastCheckedAt: "2026-07-17T06:00:00Z",
    lastChangeAt: null,
    lastStatus: "ok",
    failCount: 0,
    active: true,
  },
  {
    id: "src-demo-2",
    framework: "eu-ai-act",
    label: "AI Act Service Desk — Art. 50",
    url: "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50",
    sourceKind: "page",
    lastHash: "d4e5f6",
    lastCheckedAt: "2026-07-17T06:00:00Z",
    lastChangeAt: "2026-07-15T06:00:00Z",
    lastStatus: "changed",
    failCount: 0,
    active: true,
  },
  {
    id: "src-demo-3",
    framework: "us-nyc-ll144",
    label: "NYC DCWP — Automated Employment Decision Tools",
    url: "https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page",
    sourceKind: "page",
    lastHash: null,
    lastCheckedAt: null,
    lastChangeAt: null,
    lastStatus: null,
    failCount: 0,
    active: true,
  },
];

/* -------------------------------------------------------------------------- */
/* Plan de acción editable (Capa 2) — tablero de tareas                        */
/* -------------------------------------------------------------------------- */

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "critica" | "alta" | "media" | "baja";

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Por hacer",
  in_progress: "En curso",
  blocked: "Bloqueada",
  done: "Hecha",
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "todo",
  "in_progress",
  "blocked",
  "done",
];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const TASK_PRIORITY_ORDER: TaskPriority[] = [
  "critica",
  "alta",
  "media",
  "baja",
];

export type ActionTask = {
  id: string;
  title: string;
  detail: string | null;
  article: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string | null;
  assigneeEmail: string | null;
  dueDate: string | null; // ISO date (YYYY-MM-DD)
  systemId: string | null;
  systemName: string | null;
  source: "manual" | "recommendation";
  sourceKey: string | null;
  createdAt: string; // ISO
};

/** Tareas de ejemplo (modo demo) para enseñar el plan editable. */
export const SAMPLE_ACTION_TASKS: ActionTask[] = [
  {
    id: "task-demo-1",
    title: "Designar supervisión humana del cribado de CVs",
    detail:
      "Encargar la supervisión a una persona con competencia y autoridad para intervenir o detener el sistema (Art. 26.2).",
    article: "Art. 14",
    priority: "critica",
    status: "in_progress",
    assigneeId: "demo-2",
    assigneeEmail: "legal@empresa-demo.com",
    dueDate: "2026-07-31",
    systemId: "SYS-001",
    systemName: "Cribado de CVs — TalentFilter",
    source: "recommendation",
    sourceKey: "art-14",
    createdAt: "2026-07-10T09:00:00Z",
  },
  {
    id: "task-demo-2",
    title: "Exigir al proveedor la documentación técnica (Anexo IV)",
    detail:
      "Pedir al proveedor la documentación técnica e instrucciones de uso y conservarla como evidencia de auditoría.",
    article: "Art. 11",
    priority: "media",
    status: "todo",
    assigneeId: "demo-3",
    assigneeEmail: "talent@empresa-demo.com",
    dueDate: "2026-07-14",
    systemId: null,
    systemName: null,
    source: "recommendation",
    sourceKey: "art-11",
    createdAt: "2026-07-11T11:00:00Z",
  },
  {
    id: "task-demo-3",
    title: "Informar a los trabajadores del uso de IA en selección",
    detail: "Aviso a las personas afectadas antes del despliegue en el puesto.",
    article: "Art. 26",
    priority: "alta",
    status: "todo",
    assigneeId: null,
    assigneeEmail: null,
    dueDate: null,
    systemId: null,
    systemName: null,
    source: "manual",
    sourceKey: null,
    createdAt: "2026-07-12T08:30:00Z",
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

/**
 * Umbral ORIENTATIVO de preparación: a partir de este % consideramos un sistema
 * "listo para auditoría" (nunca es una certificación ni un juicio de cumplimiento;
 * es la meta de preparación de la organización). Ajustable en un único lugar.
 */
export const AUDIT_READY_THRESHOLD = 80;

/** ¿La preparación declarada alcanza el umbral orientativo? */
export function isAuditReady(pct: number): boolean {
  return pct >= AUDIT_READY_THRESHOLD;
}
