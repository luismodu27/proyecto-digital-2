import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "./context";
import { toAuditEntry, type RawAudit } from "@/lib/audit";
import type {
  ActionTask,
  AiSystem,
  AssessmentRecord,
  AuditChainStatus,
  AuditEntry,
  DossierData,
  EvidenceState,
  ExportBundle,
  ExportedSystem,
  GapItem,
  MemberRole,
  OrgMember,
  PendingInvitation,
  RegAck,
  RegAckStatus,
  RegCandidate,
  RegCandidateProvenance,
  RegCandidateStatus,
  RegSource,
  RiskLevel,
  TaskPriority,
  TaskStatus,
  UserOrg,
} from "@/lib/mock-data";
import {
  mergeCatalog,
  type RegulatoryEvent,
  type RegKind,
} from "@/lib/regulatory-watch";
import type { BiasAudit } from "@/lib/bias-audit";

/** Mapea la severidad de BD (en) a la del modelo de UI (es). */
const SEVERITY_ES: Record<string, GapItem["severity"]> = {
  high: "alta",
  medium: "media",
  low: "baja",
};

/**
 * Repositorio real sobre Supabase. RLS garantiza el aislamiento por tenant;
 * además filtramos por la organización activa.
 */
export async function getAiSystems(): Promise<AiSystem[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];

  const { data, error } = await supabase
    .from("ai_systems")
    .select("*")
    .eq("organization_id", org)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.code ?? row.id,
    dbId: row.id,
    name: row.name,
    owner: row.owner ?? "",
    domain: row.domain ?? "",
    vendor: row.vendor ?? "",
    risk: (row.risk_level ?? "minimal") as RiskLevel,
    compliance: row.compliance_pct ?? 0,
    lastReviewed: row.last_reviewed_at
      ? String(row.last_reviewed_at).slice(0, 10)
      : "",
    evidenceState: (row.evidence_state ?? undefined) as
      | EvidenceState
      | undefined,
  }));
}

/** Historial de evaluaciones de un sistema (más recientes primero). */
export async function getSystemAssessments(
  systemId: string,
): Promise<AssessmentRecord[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data } = await supabase
    .from("risk_assessments")
    .select(
      "id, level, rationale, evidence_state, attested_by_name, evidence_note, evidence_url, assessed_at",
    )
    .eq("organization_id", org)
    .eq("ai_system_id", systemId)
    .order("assessed_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    level: r.level as RiskLevel,
    rationale: r.rationale,
    evidenceState: (r.evidence_state ?? "declared") as EvidenceState,
    attestedByName: r.attested_by_name ?? null,
    evidenceNote: r.evidence_note ?? null,
    evidenceUrl: r.evidence_url ?? null,
    assessedAt: String(r.assessed_at),
  }));
}

export type EditableSystem = {
  id: string;
  name: string;
  owner: string;
  domain: string;
  vendor: string;
  actorRole: string;
};

/** Un sistema por su uuid, con los campos editables (o null si no existe/no es tuyo). */
export async function getSystemById(
  id: string,
): Promise<EditableSystem | null> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return null;
  const { data } = await supabase
    .from("ai_systems")
    .select("id, name, owner, domain, vendor, actor_role")
    .eq("organization_id", org)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    owner: data.owner ?? "",
    domain: data.domain ?? "",
    vendor: data.vendor ?? "",
    actorRole: data.actor_role ?? "deployer",
  };
}

/**
 * Evidencia de auditoría de sesgo (NYC LL144) de un sistema. Fallback seguro: si
 * las columnas aún no existen (migración 0019 sin aplicar), devuelve null y la
 * sección simplemente no aparece — la app no se rompe.
 */
export async function getSystemBiasAudit(
  id: string,
): Promise<BiasAudit | null> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return null;
  const { data, error } = await supabase
    .from("ai_systems")
    .select(
      "is_aedt, last_bias_audit_date, independent_auditor_name, auditor_independence_confirmed, bias_audit_summary_url, summary_published_date",
    )
    .eq("organization_id", org)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    isAedt: !!data.is_aedt,
    lastAuditDate: data.last_bias_audit_date
      ? String(data.last_bias_audit_date).slice(0, 10)
      : null,
    auditorName: data.independent_auditor_name ?? null,
    auditorIndependenceConfirmed: !!data.auditor_independence_confirmed,
    summaryUrl: data.bias_audit_summary_url ?? null,
    summaryPublishedDate: data.summary_published_date
      ? String(data.summary_published_date).slice(0, 10)
      : null,
  };
}

/**
 * Reúne todo lo necesario para el dossier de gobernanza de un sistema:
 * su ficha, sus brechas y su historial de evaluaciones. `id` es el uuid real.
 */
export async function getSystemDossier(
  id: string,
): Promise<DossierData | null> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return null;

  const { data: row } = await supabase
    .from("ai_systems")
    .select("*")
    .eq("organization_id", org)
    .eq("id", id)
    .maybeSingle();
  if (!row) return null;

  const [gapRes, assessments] = await Promise.all([
    supabase
      .from("gap_items")
      .select("*")
      .eq("organization_id", org)
      .eq("ai_system_id", id)
      .order("created_at", { ascending: true }),
    getSystemAssessments(id),
  ]);

  const code = row.code ?? row.id;
  return {
    system: {
      id: code,
      dbId: row.id,
      name: row.name,
      owner: row.owner ?? "",
      domain: row.domain ?? "",
      vendor: row.vendor ?? "",
      actorRole: row.actor_role ?? "deployer",
      risk: (row.risk_level ?? "minimal") as RiskLevel,
      compliance: row.compliance_pct ?? 0,
      lastReviewed: row.last_reviewed_at
        ? String(row.last_reviewed_at).slice(0, 10)
        : "",
      evidenceState: (row.evidence_state ?? undefined) as
        | EvidenceState
        | undefined,
    },
    gaps: (gapRes.data ?? []).map((g) => ({
      id: g.id,
      requirement: g.requirement,
      article: g.article ?? "",
      status: g.status as GapItem["status"],
      severity: SEVERITY_ES[g.severity] ?? "media",
      system: code,
    })),
    assessments,
    // Auditoría de sesgo (si la migración 0019 está aplicada; si no, campos ausentes).
    biasAudit: {
      isAedt: !!row.is_aedt,
      lastAuditDate: row.last_bias_audit_date
        ? String(row.last_bias_audit_date).slice(0, 10)
        : null,
      auditorName: row.independent_auditor_name ?? null,
      auditorIndependenceConfirmed: !!row.auditor_independence_confirmed,
      summaryUrl: row.bias_audit_summary_url ?? null,
      summaryPublishedDate: row.summary_published_date
        ? String(row.summary_published_date).slice(0, 10)
        : null,
    },
  };
}

/** Organizaciones a las que pertenece el usuario actual (para el selector). */
export async function getUserOrgs(): Promise<UserOrg[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: mems } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", user.id);
  const rows = mems ?? [];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.organization_id as string);
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name")
    .in("id", ids);
  const nameById = new Map((orgs ?? []).map((o) => [o.id as string, o.name as string]));

  return rows
    .map((r) => ({
      id: r.organization_id as string,
      name: nameById.get(r.organization_id as string) ?? "Organización",
      role: (r.role ?? "member") as UserOrg["role"],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Nombre de la organización activa (para informes/cabeceras). */
export async function getOrganizationName(): Promise<string | null> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return null;
  const { data } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", org)
    .maybeSingle();
  return data?.name ?? null;
}

/** Sistemas de la org (id real + nombre) para selectores. */
export async function getSystemsForSelect(): Promise<
  { id: string; name: string }[]
> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data } = await supabase
    .from("ai_systems")
    .select("id, name")
    .eq("organization_id", org)
    .order("name", { ascending: true });
  return data ?? [];
}

/* -------------------------------------------------------------------------- */
/* Equipo / miembros                                                          */
/* -------------------------------------------------------------------------- */

/** Miembros de la organización activa (vía RPC security-definer con email). */
export async function getOrgMembers(): Promise<OrgMember[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data } = await supabase.rpc("list_org_members", { org });
  return (data ?? []).map(
    (r: {
      user_id: string;
      email: string;
      role: MemberRole;
      joined_at: string;
    }) => ({
      userId: r.user_id,
      email: r.email,
      role: r.role,
      joinedAt: String(r.joined_at),
    }),
  );
}

/** Invitaciones pendientes de la org (solo visibles para owner/admin por RLS). */
export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data } = await supabase
    .from("invitations")
    .select("id, email, role, created_at")
    .eq("organization_id", org)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    role: r.role as MemberRole,
    createdAt: String(r.created_at),
  }));
}

/** Acuses de vigilancia regulatoria de la org (id de evento -> estado). */
export async function getRegulatoryAcks(): Promise<Record<string, RegAck>> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return {};
  const { data } = await supabase
    .from("regulatory_acks")
    .select("event_id, status, note, acknowledged_at")
    .eq("organization_id", org);
  const map: Record<string, RegAck> = {};
  for (const r of data ?? []) {
    map[r.event_id] = {
      status: r.status as RegAckStatus,
      note: r.note ?? null,
      at: String(r.acknowledged_at),
    };
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* Pipeline del foso: eventos publicados, candidatos y rol de validador        */
/* -------------------------------------------------------------------------- */

type RegEventRow = {
  id: string;
  event_date: string;
  kind: string;
  framework: string;
  title: string;
  summary: string;
  impact: string;
  action: string;
  articles: unknown;
  source: unknown;
  scope: unknown;
};

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => String(x)) : [];
}

function rowToRegEvent(r: RegEventRow): RegulatoryEvent {
  const src = (r.source ?? {}) as { label?: string; url?: string };
  return {
    id: r.id,
    date: r.event_date,
    kind: r.kind as RegKind,
    framework: r.framework as RegulatoryEvent["framework"],
    title: r.title,
    summary: r.summary,
    impact: r.impact,
    action: r.action,
    articles: asStringArray(r.articles),
    source: { label: src.label ?? "", url: src.url ?? "" },
    scope: (r.scope ?? {}) as RegulatoryEvent["scope"],
  };
}

/**
 * Catálogo del radar: base curada en código + eventos publicados por el
 * pipeline. Si la tabla no existe o hay error, cae a la base curada.
 */
export async function getRegulatoryEvents(): Promise<RegulatoryEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reg_events")
    .select(
      "id, event_date, kind, framework, title, summary, impact, action, articles, source, scope",
    );
  if (error || !data) return mergeCatalog([]);
  return mergeCatalog((data as RegEventRow[]).map(rowToRegEvent));
}

type RegCandidateRow = {
  id: string;
  proposed_event_id: string | null;
  event_date: string | null;
  kind: string | null;
  framework: string;
  title: string;
  summary: string | null;
  impact: string | null;
  action: string | null;
  articles: unknown;
  source: unknown;
  scope: unknown;
  status: RegCandidateStatus;
  provenance: unknown;
  created_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  reg_sources: { label: string } | null;
};

function rowToCandidate(r: RegCandidateRow): RegCandidate {
  const src = r.source as { label?: string; url?: string } | null;
  return {
    id: r.id,
    proposedEventId: r.proposed_event_id,
    date: r.event_date,
    kind: r.kind,
    framework: r.framework,
    title: r.title,
    summary: r.summary,
    impact: r.impact,
    action: r.action,
    articles: asStringArray(r.articles),
    source: src?.url ? { label: src.label ?? "", url: src.url } : null,
    scope: (r.scope ?? {}) as RegCandidate["scope"],
    status: r.status,
    sourceLabel: r.reg_sources?.label ?? null,
    provenance: (r.provenance ?? {}) as RegCandidateProvenance,
    createdAt: r.created_at,
    reviewedAt: r.reviewed_at,
    reviewNote: r.review_note,
  };
}

/**
 * Cola de candidatos del pipeline. RLS solo la deja ver a validadores de
 * plataforma; un no-validador recibe [] silenciosamente.
 */
export async function getRegCandidates(): Promise<RegCandidate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reg_candidates")
    .select(
      "id, proposed_event_id, event_date, kind, framework, title, summary, impact, action, articles, source, scope, status, provenance, created_at, reviewed_at, review_note, reg_sources(label)",
    )
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as RegCandidateRow[]).map(rowToCandidate);
}

type RegSourceRow = {
  id: string;
  framework: string;
  label: string;
  url: string;
  source_kind: string;
  last_hash: string | null;
  last_checked_at: string | null;
  last_change_at: string | null;
  last_status: string | null;
  fail_count: number | null;
  active: boolean;
};

function rowToSource(r: RegSourceRow): RegSource {
  return {
    id: r.id,
    framework: r.framework,
    label: r.label,
    url: r.url,
    sourceKind: r.source_kind,
    lastHash: r.last_hash,
    lastCheckedAt: r.last_checked_at,
    lastChangeAt: r.last_change_at,
    lastStatus: (r.last_status as RegSource["lastStatus"]) ?? null,
    failCount: r.fail_count ?? 0,
    active: r.active,
  };
}

/**
 * Watchlist del Vigía. RLS solo la deja ver a validadores de plataforma; un
 * no-validador recibe [] silenciosamente. Fallback seguro si la migración 0014
 * aún no está aplicada (columnas nuevas) → [].
 */
export async function getRegSources(): Promise<RegSource[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reg_sources")
    .select(
      "id, framework, label, url, source_kind, last_hash, last_checked_at, last_change_at, last_status, fail_count, active",
    )
    .order("framework", { ascending: true })
    .order("label", { ascending: true });
  if (error || !data) return [];
  return (data as RegSourceRow[]).map(rowToSource);
}

/** Jurisdicciones donde la organización activa tiene nexo (dónde contrata). */
export async function getOrgJurisdictions(): Promise<string[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data } = await supabase
    .from("organizations")
    .select("jurisdictions")
    .eq("id", org)
    .maybeSingle();
  const j = (data?.jurisdictions ?? []) as unknown;
  return Array.isArray(j) ? j.map((x) => String(x)) : [];
}

/** Tareas del plan de acción de la organización activa (con responsable y sistema). */
export async function getActionTasks(): Promise<ActionTask[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const [tasksRes, membersRes] = await Promise.all([
    supabase
      .from("action_tasks")
      .select(
        "id, title, detail, article, priority, status, assignee_id, due_date, ai_system_id, source, source_key, created_at, ai_systems(name)",
      )
      .eq("organization_id", org)
      .order("created_at", { ascending: true }),
    supabase.rpc("list_org_members", { org }),
  ]);
  const emailById = new Map<string, string>();
  for (const m of (membersRes.data ?? []) as { user_id: string; email: string }[]) {
    emailById.set(m.user_id, m.email);
  }
  type Row = {
    id: string;
    title: string;
    detail: string | null;
    article: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    assignee_id: string | null;
    due_date: string | null;
    ai_system_id: string | null;
    source: "manual" | "recommendation";
    source_key: string | null;
    created_at: string;
    ai_systems: { name: string } | { name: string }[] | null;
  };
  return ((tasksRes.data ?? []) as Row[]).map((r) => {
    const sys = Array.isArray(r.ai_systems) ? r.ai_systems[0] : r.ai_systems;
    return {
      id: r.id,
      title: r.title,
      detail: r.detail,
      article: r.article,
      priority: r.priority,
      status: r.status,
      assigneeId: r.assignee_id,
      assigneeEmail: r.assignee_id ? emailById.get(r.assignee_id) ?? null : null,
      dueDate: r.due_date,
      systemId: r.ai_system_id,
      systemName: sys?.name ?? null,
      source: r.source,
      sourceKey: r.source_key,
      createdAt: String(r.created_at),
    };
  });
}

/** ¿El usuario actual es validador de plataforma (personal de Attesta)? */
export async function getIsPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_platform_admin");
  if (error) return false;
  return data === true;
}

/** Registro de actividad (audit-trail) de la organización activa. */
export async function getAuditLog(): Promise<AuditEntry[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data } = await supabase.rpc("list_audit_log", { org, lim: 100 });
  return ((data ?? []) as RawAudit[]).map(toAuditEntry);
}

/**
 * Verifica la cadena de integridad del audit-trail de la organización activa
 * (encadenado con SHA-256). Devuelve null con degradación segura si la función
 * aún no existe (migración 0020 sin aplicar) para no romper el visor.
 */
export async function verifyAuditChain(): Promise<AuditChainStatus | null> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return null;
  const { data, error } = await supabase.rpc("verify_audit_chain", { org });
  if (error) return null;
  const row = ((data ?? []) as {
    total: number;
    ok: boolean;
    broken_id: number | null;
    checked_at: string;
  }[])[0];
  if (!row) return null;
  return {
    total: Number(row.total),
    ok: row.ok === true,
    brokenId: row.broken_id === null ? null : Number(row.broken_id),
    checkedAt: String(row.checked_at),
  };
}

/**
 * Paquete de exportación de datos de la organización activa: toda su evidencia
 * declarada en JSON portable. Compone los getters existentes (deduplicados por el
 * cache de getActiveOrg). Es un volcado de los datos propios del cliente, no un
 * informe ni una certificación.
 */
export async function getExportBundle(): Promise<ExportBundle | null> {
  const org = await getActiveOrg();
  if (!org) return null;

  const supabase = await createClient();
  const [orgName, systems, gapItems, actionTasks, members, regulatoryAcks, integrity] =
    await Promise.all([
      getOrganizationName(),
      getAiSystems(),
      getGapItems(),
      getActionTasks(),
      getOrgMembers(),
      getRegulatoryAcks(),
      verifyAuditChain(),
    ]);

  // Registro completo (hasta el tope de la función, 500) para la exportación.
  const { data: rawLog } = await supabase.rpc("list_audit_log", { org, lim: 500 });
  const auditLog = ((rawLog ?? []) as RawAudit[]).map(toAuditEntry);

  // Evidencia por sistema (historial de evaluaciones + auditoría de sesgo).
  const exportedSystems: ExportedSystem[] = await Promise.all(
    systems.map(async (system): Promise<ExportedSystem> => {
      if (!system.dbId) return { system, assessments: [], biasAudit: null };
      const [assessments, biasAudit] = await Promise.all([
        getSystemAssessments(system.dbId),
        getSystemBiasAudit(system.dbId),
      ]);
      return { system, assessments, biasAudit };
    }),
  );

  return {
    meta: {
      application: "Attesta",
      organization: orgName ?? "Mi organización",
      exportedAt: new Date().toISOString(),
      schemaVersion: 1,
    },
    integrity,
    systems: exportedSystems,
    gapItems,
    actionTasks,
    members,
    regulatoryAcks,
    auditLog,
  };
}

/** Rol del usuario actual en la organización activa (o null). */
export async function getCurrentMemberRole(): Promise<MemberRole | null> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", org)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data?.role ?? null) as MemberRole | null;
}

export async function getGapItems(): Promise<GapItem[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];

  const { data, error } = await supabase
    .from("gap_items")
    .select("*, ai_systems(code)")
    .eq("organization_id", org)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    requirement: row.requirement,
    article: row.article ?? "",
    status: row.status as GapItem["status"],
    severity: SEVERITY_ES[row.severity] ?? "media",
    system: row.ai_systems?.code ?? row.ai_system_id,
  }));
}
