import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg, getCurrentUser } from "./context";
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
import { resolveLocale } from "@/lib/i18n/resolve";
import { coerceStoredLocale } from "@/lib/i18n/stored-locale";
import { GRACE_DAYS, type OrgDeletionState } from "@/lib/org-lifecycle";
import { logDataFallback } from "@/lib/observability/log";
import type { FunnelRow } from "@/lib/telemetry/events";
import type { IntakeLink, IntakeSubmission } from "@/lib/intake/types";
import type { Incident, IncidentCategory, Seriousness } from "@/lib/incidents/incidents";
import type { AiActRole, GdprRole, Supplier } from "@/lib/suppliers/types";
import type { EvidenceStatus, SupplierEvidence } from "@/lib/suppliers/evidence";
import { REVIEW_CADENCE_DEFAULT_DAYS, normalizeCadenceDays } from "@/lib/incidents/review";

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
/**
 * Columnas de `ai_systems` que consume la lista (NO incluye las de bias-audit de
 * 0019, que solo usa el dossier). Todas son fundacionales (0001 + evidence_state
 * de 0006), así que enumerarlas explícitamente no reintroduce riesgo de fallback
 * y evita traer las ~6 columnas de sesgo en cada render del dashboard.
 */
const AI_SYSTEM_LIST_COLS =
  "id, code, name, owner, domain, vendor, risk_level, compliance_pct, last_reviewed_at, evidence_state";

/**
 * Inventario de la organización activa.
 *
 * `cache()` (por request) porque desde que el layout decide si enseña el
 * recorrido guiado, lo miran DOS sitios: el layout y la propia portada. Sin
 * esto, gatear el modal habría costado una consulta extra en cada ruta.
 */
async function getAiSystemsUncached(): Promise<AiSystem[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];

  const { data, error } = await supabase
    .from("ai_systems")
    .select(AI_SYSTEM_LIST_COLS)
    .eq("organization_id", org)
    .order("created_at", { ascending: true });

  if (error || !data) {
    logDataFallback("getAiSystems", error);
    return [];
  }

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

export const getAiSystems = cache(getAiSystemsUncached);

/** Historial de evaluaciones de un sistema (más recientes primero). */
/** Columnas de `risk_assessments` que consumen el dossier y la exportación. */
const ASSESSMENT_COLS =
  "id, ai_system_id, level, rationale, evidence_state, attested_by_name, evidence_note, evidence_url, assessed_at";
/** `locale` la aporta la 0033: se pide aparte para poder reintentar sin ella. */
const ASSESSMENT_COLS_FULL = `${ASSESSMENT_COLS}, locale`;

type AssessmentRow = {
  id: string;
  ai_system_id?: string;
  level: string;
  rationale: string;
  evidence_state: string | null;
  attested_by_name: string | null;
  evidence_note: string | null;
  evidence_url: string | null;
  assessed_at: string;
  locale?: string | null;
};

function mapAssessmentRow(r: AssessmentRow): AssessmentRecord {
  return {
    id: r.id,
    level: r.level as RiskLevel,
    rationale: r.rationale,
    evidenceState: (r.evidence_state ?? "declared") as EvidenceState,
    attestedByName: r.attested_by_name ?? null,
    evidenceNote: r.evidence_note ?? null,
    evidenceUrl: r.evidence_url ?? null,
    assessedAt: String(r.assessed_at),
    locale: coerceStoredLocale(r.locale),
  };
}

export async function getSystemAssessments(
  systemId: string,
): Promise<AssessmentRecord[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const q = (cols: string) =>
    supabase
      .from("risk_assessments")
      .select(cols)
      .eq("organization_id", org)
      .eq("ai_system_id", systemId)
      .order("assessed_at", { ascending: false });

  let res = await q(ASSESSMENT_COLS_FULL);
  if (res.error) {
    logDataFallback("getSystemAssessments", res.error, "reintento sin locale (0033)");
    res = await q(ASSESSMENT_COLS);
  }
  return ((res.data ?? []) as unknown as AssessmentRow[]).map(mapAssessmentRow);
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
/** Columnas de auditoría de sesgo (LL144) que viven en `ai_systems` (migración 0019). */
const BIAS_COLS =
  "id, is_aedt, last_bias_audit_date, independent_auditor_name, auditor_independence_confirmed, bias_audit_summary_url, summary_published_date";

type BiasRow = {
  id?: string;
  is_aedt: boolean | null;
  last_bias_audit_date: string | null;
  independent_auditor_name: string | null;
  auditor_independence_confirmed: boolean | null;
  bias_audit_summary_url: string | null;
  summary_published_date: string | null;
};

function mapBiasRow(r: BiasRow): BiasAudit {
  return {
    isAedt: !!r.is_aedt,
    lastAuditDate: r.last_bias_audit_date
      ? String(r.last_bias_audit_date).slice(0, 10)
      : null,
    auditorName: r.independent_auditor_name ?? null,
    auditorIndependenceConfirmed: !!r.auditor_independence_confirmed,
    summaryUrl: r.bias_audit_summary_url ?? null,
    summaryPublishedDate: r.summary_published_date
      ? String(r.summary_published_date).slice(0, 10)
      : null,
  };
}

export async function getSystemBiasAudit(
  id: string,
): Promise<BiasAudit | null> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return null;
  const { data, error } = await supabase
    .from("ai_systems")
    .select(BIAS_COLS)
    .eq("organization_id", org)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    // Sin fila no hay incidente (el sistema puede no tener datos de sesgo aún);
    // solo se registra si Supabase devolvió error.
    if (error) logDataFallback("getSystemBiasAudit", error);
    return null;
  }
  return mapBiasRow(data as BiasRow);
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
      // Viene del `select("*")` de arriba: sin la 0033 la clave no existe y
      // `coerceStoredLocale` la resuelve a "no consta".
      locale: coerceStoredLocale((g as { locale?: unknown }).locale),
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
  // `getCurrentUser` lleva `cache()` y verifica el JWT en local: sin esto, el
  // layout pagaba una ida y vuelta a Supabase Auth por CADA getter que
  // necesitaba el id del usuario (aquí, en `getCurrentRole` y en el propio
  // layout), tres veces lo mismo antes de pedir un solo dato.
  const user = await getCurrentUser();
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

/**
 * Estado de la baja de la organización activa. `null` = no hay baja pendiente.
 *
 * Degrada a `null` si la 0035 no está aplicada (la columna no existe): sin
 * migración simplemente no hay bajas pendientes que mostrar, que es la verdad.
 */
export async function getOrgDeletionState(): Promise<OrgDeletionState | null> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return null;

  const { data, error } = await supabase
    .from("organizations")
    .select("deletion_requested_at")
    .eq("id", org)
    .maybeSingle();

  if (error) {
    logDataFallback("getOrgDeletionState", error, "sin 0035 no hay bajas pendientes");
    return null;
  }
  const requestedAt = (data as { deletion_requested_at?: string | null } | null)
    ?.deletion_requested_at;
  if (!requestedAt) return null;

  // El plazo se recalcula aquí en lugar de guardarse: si algún día cambia, no
  // quedan fechas viejas mintiendo en pantalla.
  const purgeAt = new Date(
    new Date(requestedAt).getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  return { requestedAt, purgeAt, graceDays: GRACE_DAYS };
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

type OrgMemberRow = {
  user_id: string;
  email: string;
  role: MemberRole;
  joined_at: string;
};

/**
 * Filas crudas de miembros de la org activa (RPC security-definer con email).
 * Envuelto en `cache()` para deduplicar dentro del mismo render: el dashboard y
 * el plan piden miembros dos veces (getOrgMembers + getActionTasks) y así solo se
 * hace UN RPC (`list_org_members`, que hace join contra auth.users) por request.
 */
const listOrgMembersRaw = cache(async (): Promise<OrgMemberRow[]> => {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data } = await supabase.rpc("list_org_members", { org });
  return (data ?? []) as OrgMemberRow[];
});

/** Miembros de la organización activa (vía RPC security-definer con email). */
export async function getOrgMembers(): Promise<OrgMember[]> {
  const rows = await listOrgMembersRaw();
  return rows.map((r) => ({
    userId: r.user_id,
    email: r.email,
    role: r.role,
    joinedAt: String(r.joined_at),
  }));
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
  // La fachada resuelve el locale: la base curada sale en EN cuando la UI está
  // en inglés; los eventos publicados por el pipeline se sirven tal como se
  // almacenaron (idioma de guardado).
  const locale = await resolveLocale();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reg_events")
    .select(
      "id, event_date, kind, framework, title, summary, impact, action, articles, source, scope",
    );
  if (error || !data) {
    logDataFallback("getRegulatoryEvents", error, "cae al catálogo curado");
    return mergeCatalog([], undefined, locale);
  }
  return mergeCatalog(
    (data as RegEventRow[]).map(rowToRegEvent),
    undefined,
    locale,
  );
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
  if (error || !data) {
    logDataFallback("getRegCandidates", error);
    return [];
  }
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
  if (error || !data) {
    logDataFallback("getRegSources", error);
    return [];
  }
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
  const TASK_COLS =
    "id, title, detail, article, priority, status, assignee_id, due_date, ai_system_id, source, source_key, created_at, ai_systems(name)";
  const tasksQuery = (cols: string) =>
    supabase
      .from("action_tasks")
      .select(cols)
      .eq("organization_id", org)
      .order("created_at", { ascending: true });
  // `locale` la aporta la 0033; sin ella el SELECT falla entero y el plan se
  // quedaría vacío, así que se reintenta con las columnas de siempre.
  const [firstTry, members] = await Promise.all([
    tasksQuery(`${TASK_COLS}, locale`),
    listOrgMembersRaw(),
  ]);
  let tasksRes = firstTry;
  if (tasksRes.error) {
    logDataFallback("getActionTasks", tasksRes.error, "reintento sin locale (0033)");
    tasksRes = await tasksQuery(TASK_COLS);
  }
  const emailById = new Map<string, string>();
  for (const m of members) {
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
    locale?: string | null;
    ai_systems: { name: string } | { name: string }[] | null;
  };
  return ((tasksRes.data ?? []) as unknown as Row[]).map((r) => {
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
      locale: coerceStoredLocale(r.locale),
    };
  });
}

/**
 * ¿El usuario actual es validador de plataforma (personal de Attesta)?
 *
 * Cacheado por render: el layout (vía getOrgPlan) y las páginas de vigilancia lo
 * consultan por separado; con `cache()` se hace un solo RPC `is_platform_admin`
 * por request en vez de dos.
 */
export const getIsPlatformAdmin = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_platform_admin");
  if (error) {
    logDataFallback("getIsPlatformAdmin", error);
    return false;
  }
  return data === true;
});

/** Registro de actividad (audit-trail) de la organización activa. */
export async function getAuditLog(): Promise<AuditEntry[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const locale = await resolveLocale();
  const { data, error } = await supabase.rpc("list_audit_log", { org, lim: 100 });
  if (error) logDataFallback("getAuditLog", error);
  return ((data ?? []) as RawAudit[]).map((r) => toAuditEntry(r, locale));
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
  if (error) {
    // Distingue "migración 0020 sin aplicar" de "la verificación de integridad
    // del audit-trail está fallando", que es un incidente de primer orden.
    logDataFallback("verifyAuditChain", error);
    return null;
  }
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
  const [
    orgName,
    systems,
    gapItems,
    actionTasks,
    members,
    regulatoryAcks,
    integrity,
    suppliers,
    incidents,
    intakeSubmissions,
  ] = await Promise.all([
    getOrganizationName(),
    getAiSystems(),
    getGapItems(),
    getActionTasks(),
    getOrgMembers(),
    getRegulatoryAcks(),
    verifyAuditChain(),
    // Faltaban en el paquete: proveedores, incidentes y bandeja de intake son
    // datos del cliente tanto como el inventario, y una portabilidad que se deja
    // fuera tres módulos no es portabilidad. Cada uno degrada solo si su
    // migración no está aplicada, así que no pueden tumbar la exportación.
    getSuppliers().catch(() => []),
    getIncidents().catch(() => []),
    getIntakeSubmissions().catch(() => []),
  ]);

  // El tope de `list_audit_log` es 500. Se pide uno más para poder DISTINGUIR
  // "hay exactamente 500" de "hay más y se cortó": sin ese +1 no habría forma de
  // saberlo, y una exportación truncada en silencio es la peor de las tres
  // opciones — quien la recibe cree tenerlo todo.
  const AUDIT_LIMIT = 500;
  const { data: rawLog } = await supabase.rpc("list_audit_log", {
    org,
    lim: AUDIT_LIMIT + 1,
  });
  const rawRows = (rawLog ?? []) as RawAudit[];
  const auditTruncated = rawRows.length > AUDIT_LIMIT;
  const auditLog = rawRows.slice(0, AUDIT_LIMIT).map((r) => toAuditEntry(r));

  // Evidencia por sistema (historial de evaluaciones + auditoría de sesgo).
  // Batch: 2 consultas para toda la org en vez de 2 por sistema (evita N+1 en la
  // exportación de organizaciones con muchos sistemas).
  const dbIds = systems
    .map((s) => s.dbId)
    .filter((x): x is string => Boolean(x));

  const assessmentsBySystem = new Map<string, AssessmentRecord[]>();
  const biasBySystem = new Map<string, BiasAudit>();
  if (dbIds.length > 0) {
    const [assessRes, biasRes] = await Promise.all([
      supabase
        .from("risk_assessments")
        .select(ASSESSMENT_COLS_FULL)
        .eq("organization_id", org)
        .in("ai_system_id", dbIds)
        .order("assessed_at", { ascending: false }),
      supabase
        .from("ai_systems")
        .select(BIAS_COLS)
        .eq("organization_id", org)
        .in("id", dbIds),
    ]);
    // Sin la 0033 el SELECT con `locale` falla entero: se repite sin ella para no
    // dejar la exportación sin historial de evaluaciones por un dato accesorio.
    let assessRows = assessRes.data;
    if (assessRes.error) {
      logDataFallback("exportOrganization", assessRes.error, "reintento sin locale (0033)");
      const fb = await supabase
        .from("risk_assessments")
        .select(ASSESSMENT_COLS)
        .eq("organization_id", org)
        .in("ai_system_id", dbIds)
        .order("assessed_at", { ascending: false });
      assessRows = fb.data as typeof assessRows;
    }
    for (const r of (assessRows ?? []) as unknown as AssessmentRow[]) {
      if (!r.ai_system_id) continue;
      const list = assessmentsBySystem.get(r.ai_system_id) ?? [];
      list.push(mapAssessmentRow(r));
      assessmentsBySystem.set(r.ai_system_id, list);
    }
    // Fallback seguro: si las columnas de sesgo (0019) no existen, biasRes.error
    // está presente y simplemente no hay auditoría de sesgo en el export.
    if (!biasRes.error) {
      for (const r of (biasRes.data ?? []) as BiasRow[]) {
        if (r.id) biasBySystem.set(r.id, mapBiasRow(r));
      }
    }
  }

  const exportedSystems: ExportedSystem[] = systems.map((system) => ({
    system,
    assessments: system.dbId
      ? assessmentsBySystem.get(system.dbId) ?? []
      : [],
    biasAudit: system.dbId ? biasBySystem.get(system.dbId) ?? null : null,
  }));

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
    suppliers,
    incidents,
    intakeSubmissions,
    truncated: auditTruncated ? { auditLog: AUDIT_LIMIT } : null,
  };
}

/** Rol del usuario actual en la organización activa (o null). */
export async function getCurrentMemberRole(): Promise<MemberRole | null> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", org)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data?.role ?? null) as MemberRole | null;
}

/**
 * Brechas de la organización activa.
 *
 * `cache()` (por request) porque desde el streaming del resumen la miran DOS
 * bloques a la vez —la tarjeta de brechas abiertas y el checklist de
 * activación—, y sin esto partir la página en `<Suspense>` habría duplicado la
 * consulta: el streaming saldría más caro que lo que ahorra.
 */
async function getGapItemsUncached(): Promise<GapItem[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];

  const COLS_BASE =
    "id, requirement, article, status, severity, ai_system_id, ai_systems(code)";
  /**
   * Columnas que aporta una migración posterior y que por tanto NO se pueden dar
   * por hechas: `prohibited` (0022) y `locale` (0033). Se piden todas y, si el
   * SELECT falla, se va soltando la ÚLTIMA en cada reintento.
   *
   * Soltarlas de una en una y por el final —en vez de caer directo a `COLS_BASE`—
   * importa: las migraciones se aplican en orden, así que quien tenga la 0022 pero
   * no la 0033 conserva `prohibited`, y no se pierde de vista qué prácticas del
   * Art. 5 quedan fuera del "% listo" por culpa de un dato de accesibilidad.
   */
  const OPTIONAL = ["prohibited", "locale"] as const;
  type RawGap = {
    id: string;
    requirement: string;
    article: string | null;
    status: GapItem["status"];
    severity: string;
    ai_system_id: string;
    ai_systems: { code: string } | { code: string }[] | null;
    prohibited?: boolean;
    locale?: string | null;
  };

  let data: RawGap[] | null = null;
  for (let extra = OPTIONAL.length; extra >= 0; extra--) {
    const cols = [COLS_BASE, ...OPTIONAL.slice(0, extra)].join(", ");
    const res = await supabase
      .from("gap_items")
      .select(cols)
      .eq("organization_id", org)
      .order("created_at", { ascending: true });
    if (!res.error && res.data) {
      data = res.data as unknown as RawGap[];
      break;
    }
    logDataFallback(
      "getGapItems",
      res.error,
      extra > 0
        ? `reintento sin la columna ${OPTIONAL[extra - 1]}`
        : "también falló el reintento con las columnas base",
    );
  }
  if (!data) return [];

  const VALID_STATUS: GapItem["status"][] = ["missing", "partial", "done"];
  return data.map((row) => {
    // La relación embebida `ai_systems` es to-one (en runtime un objeto), pero
    // los tipos generados la infieren como array: normalizamos ambos casos.
    const sys = Array.isArray(row.ai_systems)
      ? row.ai_systems[0]
      : row.ai_systems;
    return {
      id: row.id,
      requirement: row.requirement,
      article: row.article ?? "",
      // Red segura simétrica a `severity`: un valor fuera del enum no rompe las
      // pantallas que indexan STATUS_META[status] (dossier, gap).
      status: VALID_STATUS.includes(row.status) ? row.status : "missing",
      severity: SEVERITY_ES[row.severity] ?? "media",
      system: sys?.code ?? row.ai_system_id,
      prohibited: row.prohibited === true,
      locale: coerceStoredLocale(row.locale),
    };
  });
}

export const getGapItems = cache(getGapItemsUncached);

/**
 * Embudo de activación agregado (telemetría de producto interna, migración 0026).
 *
 * Solo devuelve datos si quien consulta es `platform_admin`: el guard está DENTRO
 * de la RPC, así que no depende de que la página se acuerde de comprobarlo.
 *
 * Degradación segura: si la migración 0026 no está aplicada (la RPC no existe),
 * devuelve `[]` y el panel muestra su estado vacío en lugar de romperse.
 */
export async function getProductFunnel(days = 30): Promise<FunnelRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("product_funnel", { days });
  if (error || !Array.isArray(data)) {
    logDataFallback("getProductFunnel", error, "migración 0026 sin aplicar?");
    return [];
  }

  type Raw = {
    event: string;
    events: number | string;
    visitors: number | string;
    last_at: string | null;
  };
  return (data as Raw[]).map((row) => ({
    event: row.event,
    // Postgres devuelve `bigint` como string por precisión: normalizar a número.
    events: Number(row.events) || 0,
    visitors: Number(row.visitors) || 0,
    lastAt: row.last_at ?? null,
  }));
}

/* -------------------------------------------------------------------------- */
/* Intake compartible (migración 0027)                                        */
/* -------------------------------------------------------------------------- */

type IntakeLinkRow = {
  id: string;
  token: string;
  label: string | null;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  submissions: number;
  max_submissions: number;
};

/**
 * Enlaces de intake de la organización activa. Degradación segura: si la
 * migración 0027 no está aplicada, devuelve `[]` y la pantalla muestra su estado
 * vacío en lugar de romperse.
 */
export async function getIntakeLinks(): Promise<IntakeLink[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data, error } = await supabase
    .from("intake_links")
    .select(
      "id, token, label, created_at, expires_at, revoked_at, submissions, max_submissions",
    )
    .eq("organization_id", org)
    .order("created_at", { ascending: false });
  if (error || !data) {
    logDataFallback("getIntakeLinks", error, "migración 0027 sin aplicar?");
    return [];
  }
  const now = Date.now();
  return (data as IntakeLinkRow[]).map((r) => ({
    id: r.id,
    token: r.token,
    label: r.label,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    revokedAt: r.revoked_at,
    submissions: r.submissions,
    maxSubmissions: r.max_submissions,
    // Mismo criterio que la RPC `submit_intake`: si esto dijera "activo" y la RPC
    // rechazara (o al revés), el usuario mandaría un enlace que no funciona.
    active:
      !r.revoked_at &&
      new Date(r.expires_at).getTime() > now &&
      r.submissions < r.max_submissions,
  }));
}

type IntakeSubmissionRow = {
  id: string;
  name: string;
  owner: string | null;
  domain: string | null;
  vendor: string | null;
  notes: string | null;
  submitted_by: string | null;
  status: string;
  created_at: string;
  intake_links: { label: string | null } | { label: string | null }[] | null;
};

/** Bandeja de envíos PENDIENTES de la organización activa (lo ya resuelto no estorba). */
export async function getIntakeSubmissions(): Promise<IntakeSubmission[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data, error } = await supabase
    .from("intake_submissions")
    .select(
      "id, name, owner, domain, vendor, notes, submitted_by, status, created_at, intake_links(label)",
    )
    .eq("organization_id", org)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error || !data) {
    logDataFallback("getIntakeSubmissions", error, "migración 0027 sin aplicar?");
    return [];
  }
  const VALID: IntakeSubmission["status"][] = ["pending", "accepted", "discarded"];
  return (data as unknown as IntakeSubmissionRow[]).map((r) => {
    const link = Array.isArray(r.intake_links) ? r.intake_links[0] : r.intake_links;
    return {
      id: r.id,
      name: r.name,
      owner: r.owner,
      domain: r.domain,
      vendor: r.vendor,
      notes: r.notes,
      submittedBy: r.submitted_by,
      status: VALID.includes(r.status as IntakeSubmission["status"])
        ? (r.status as IntakeSubmission["status"])
        : "pending",
      createdAt: r.created_at,
      linkLabel: link?.label ?? null,
    };
  });
}

/**
 * Expedientes de incidente de la organización activa (Art. 26.5).
 *
 * Fallback seguro: si la migración 0030 aún no está aplicada devuelve `[]` y lo
 * registra como `migration-pending`. La sección se ve vacía; nada se rompe.
 */
export async function getIncidents(): Promise<Incident[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data, error } = await supabase
    .from("incidents")
    .select(
      "id, title, detail, occurred_on, aware_on, causal_link_on, categories, seriousness, risk_art79, use_suspended, provider_unreachable, notified_provider_on, notified_distributor_on, notified_authority_on, personal_data_breach, status, ai_system_id, created_at, ai_systems(name)",
    )
    .eq("organization_id", org)
    .order("aware_on", { ascending: false });

  if (error) {
    logDataFallback("getIncidents", error);
    return [];
  }

  type Row = {
    id: string;
    title: string;
    detail: string | null;
    occurred_on: string | null;
    aware_on: string;
    causal_link_on: string | null;
    categories: string[] | null;
    seriousness: Seriousness;
    risk_art79: boolean;
    use_suspended: boolean;
    provider_unreachable: boolean;
    notified_provider_on: string | null;
    notified_distributor_on: string | null;
    notified_authority_on: string | null;
    personal_data_breach: boolean;
    status: "open" | "closed";
    ai_system_id: string | null;
    created_at: string;
    ai_systems: { name: string } | { name: string }[] | null;
  };

  return ((data ?? []) as Row[]).map((r) => {
    const sys = Array.isArray(r.ai_systems) ? r.ai_systems[0] : r.ai_systems;
    return {
      id: r.id,
      systemId: r.ai_system_id,
      systemName: sys?.name ?? null,
      title: r.title,
      detail: r.detail,
      occurredOn: r.occurred_on,
      awareOn: String(r.aware_on).slice(0, 10),
      causalLinkOn: r.causal_link_on,
      categories: (r.categories ?? []) as IncidentCategory[],
      seriousness: r.seriousness,
      riskArt79: r.risk_art79,
      useSuspended: r.use_suspended,
      providerUnreachable: r.provider_unreachable,
      notifiedProviderOn: r.notified_provider_on,
      notifiedDistributorOn: r.notified_distributor_on,
      notifiedAuthorityOn: r.notified_authority_on,
      personalDataBreach: r.personal_data_breach,
      status: r.status,
      createdAt: String(r.created_at),
    };
  });
}

/**
 * Cadencia de revisión elegida por la organización. Si la columna aún no existe
 * (0030 sin aplicar) se usa el defecto del producto: una cadencia ausente no
 * puede dejar el inventario sin avisos ni marcarlo entero como vencido.
 */
export async function getReviewCadenceDays(): Promise<number> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return REVIEW_CADENCE_DEFAULT_DAYS;
  const { data, error } = await supabase
    .from("organizations")
    .select("review_cadence_days")
    .eq("id", org)
    .maybeSingle();
  if (error) {
    logDataFallback("getReviewCadenceDays", error);
    return REVIEW_CADENCE_DEFAULT_DAYS;
  }
  return data?.review_cadence_days == null
    ? REVIEW_CADENCE_DEFAULT_DAYS
    : normalizeCadenceDays(data.review_cadence_days);
}

/** Proveedores y terceros de la organización activa (migración 0032). */
export async function getSuppliers(): Promise<Supplier[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data, error } = await supabase
    .from("suppliers")
    .select(
      "id, name, country, ai_act_role, outside_eu, authorized_rep, authorized_rep_checked_on, gdpr_role, contact, contract_ends_on, dpa_signed, excludes_high_risk_use, note",
    )
    .eq("organization_id", org)
    .order("name", { ascending: true });

  if (error) {
    logDataFallback("getSuppliers", error);
    return [];
  }
  type Row = {
    id: string;
    name: string;
    country: string | null;
    ai_act_role: AiActRole;
    outside_eu: boolean;
    authorized_rep: string | null;
    authorized_rep_checked_on: string | null;
    gdpr_role: GdprRole;
    contact: string | null;
    contract_ends_on: string | null;
    dpa_signed: boolean;
    excludes_high_risk_use: boolean;
    note: string | null;
  };
  return ((data ?? []) as Row[]).map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    aiActRole: r.ai_act_role,
    outsideEu: r.outside_eu,
    authorizedRep: r.authorized_rep,
    authorizedRepCheckedOn: r.authorized_rep_checked_on,
    gdprRole: r.gdpr_role,
    contact: r.contact,
    contractEndsOn: r.contract_ends_on,
    dpaSigned: r.dpa_signed,
    excludesHighRiskUse: r.excludes_high_risk_use,
    note: r.note,
  }));
}

/** Elementos de evidencia de todos los proveedores de la organización activa. */
export async function getSupplierEvidence(): Promise<SupplierEvidence[]> {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return [];
  const { data, error } = await supabase
    .from("supplier_evidence")
    .select(
      "id, supplier_id, ai_system_id, kind, status, requested_on, received_on, document_version, source_url, expires_on, note, ai_systems(name)",
    )
    .eq("organization_id", org)
    .order("created_at", { ascending: true });

  if (error) {
    logDataFallback("getSupplierEvidence", error);
    return [];
  }
  type Row = {
    id: string;
    supplier_id: string;
    ai_system_id: string | null;
    kind: string;
    status: EvidenceStatus;
    requested_on: string | null;
    received_on: string | null;
    document_version: string | null;
    source_url: string | null;
    expires_on: string | null;
    note: string | null;
    ai_systems: { name: string } | { name: string }[] | null;
  };
  return ((data ?? []) as Row[]).map((r) => {
    const sys = Array.isArray(r.ai_systems) ? r.ai_systems[0] : r.ai_systems;
    return {
      id: r.id,
      supplierId: r.supplier_id,
      systemId: r.ai_system_id,
      systemName: sys?.name ?? null,
      kind: r.kind,
      status: r.status,
      requestedOn: r.requested_on,
      receivedOn: r.received_on,
      documentVersion: r.document_version,
      sourceUrl: r.source_url,
      expiresOn: r.expires_on,
      note: r.note,
    };
  });
}
