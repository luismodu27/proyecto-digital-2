import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "./context";
import { toAuditEntry, type RawAudit } from "@/lib/audit";
import type {
  AiSystem,
  AssessmentRecord,
  AuditEntry,
  DossierData,
  EvidenceState,
  GapItem,
  MemberRole,
  OrgMember,
  PendingInvitation,
  RegAck,
  RegAckStatus,
  RegCandidate,
  RegCandidateProvenance,
  RegCandidateStatus,
  RiskLevel,
} from "@/lib/mock-data";
import {
  mergeCatalog,
  type RegulatoryEvent,
  type RegKind,
} from "@/lib/regulatory-watch";

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
  };
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
