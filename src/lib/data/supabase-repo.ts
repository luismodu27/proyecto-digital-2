import { createClient } from "@/lib/supabase/server";
import { getActiveOrg } from "./context";
import type {
  AiSystem,
  AssessmentRecord,
  DossierData,
  EvidenceState,
  GapItem,
  RiskLevel,
} from "@/lib/mock-data";

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
