"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import type { Answers, ClassificationResult } from "@/lib/risk-assessment";
import { AI_SYSTEMS, GAP_ITEMS } from "@/lib/mock-data";
import { getPolicyPack } from "@/lib/policy-packs";

const SEVERITY_EN: Record<string, string> = {
  alta: "high",
  media: "medium",
  baja: "low",
};

/**
 * Aplica un policy pack a un sistema: precarga sus controles como brechas
 * (gap_items), sin duplicar los que ya existen. El pack se elige por `packId`
 * (por defecto, el de RRHH, por compatibilidad).
 */
export async function applyPolicyPack(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/packs");

  const systemId = String(formData.get("systemId") ?? "");
  if (!systemId) redirect("/dashboard/packs");

  const pack = getPolicyPack(String(formData.get("packId") ?? "rrhh"));
  if (!pack) redirect("/dashboard/packs");

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing } = await supabase
    .from("gap_items")
    .select("requirement")
    .eq("organization_id", org)
    .eq("ai_system_id", systemId);
  const seen = new Set((existing ?? []).map((r) => r.requirement));

  const rows = pack.controls
    .filter((c) => !seen.has(c.title))
    .map((c) => ({
      organization_id: org,
      ai_system_id: systemId,
      requirement: c.title,
      article: c.article,
      status: "missing",
      severity: SEVERITY_EN[c.severity] ?? "medium",
      created_by: user?.id,
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from("gap_items").insert(rows);
    if (error) redirect("/dashboard/packs?toast=pack-error");
  }

  revalidatePath("/dashboard/gap");
  revalidatePath("/dashboard/plan");
  revalidatePath("/dashboard");
  redirect("/dashboard/gap?toast=pack-applied");
}

/** Alta de un sistema de IA en el inventario (modo conectado). */
export async function createAiSystem(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/inventario");

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/dashboard/inventario/nuevo");

  const { error } = await supabase.from("ai_systems").insert({
    organization_id: org,
    name,
    owner: (String(formData.get("owner") ?? "").trim() || null) as string | null,
    domain: (String(formData.get("domain") ?? "").trim() || null) as string | null,
    vendor: (String(formData.get("vendor") ?? "").trim() || null) as string | null,
    actor_role: (String(formData.get("actor_role") ?? "deployer") ||
      "deployer") as string,
    created_by: user?.id,
  });
  if (error) redirect("/dashboard/inventario/nuevo?toast=system-error");

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  redirect("/dashboard/inventario?toast=system-created");
}

/**
 * Puebla la organización activa con los datos de ejemplo (sistemas + brechas).
 * Útil para que un panel recién creado no esté vacío. Idempotente por `code`.
 */
export async function seedSampleData() {
  if (!isSupabaseConfigured) redirect("/dashboard/inventario");

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Inserta los sistemas (upsert por (organization_id, code)) y recupera sus ids.
  const { data: systems, error: seedError } = await supabase
    .from("ai_systems")
    .upsert(
      AI_SYSTEMS.map((s) => ({
        organization_id: org,
        code: s.id,
        name: s.name,
        owner: s.owner,
        domain: s.domain,
        vendor: s.vendor,
        actor_role: "deployer",
        risk_level: s.risk,
        compliance_pct: s.compliance,
        last_reviewed_at: s.lastReviewed,
        created_by: user?.id,
      })),
      { onConflict: "organization_id,code" },
    )
    .select("id, code");
  if (seedError) redirect("/dashboard/inventario?toast=seed-error");

  // Mapa code → id para enlazar las brechas a sus sistemas.
  const idByCode = new Map((systems ?? []).map((r) => [r.code, r.id]));

  const gapRows = GAP_ITEMS.map((g) => {
    const aiSystemId = idByCode.get(g.system);
    if (!aiSystemId) return null;
    return {
      organization_id: org,
      ai_system_id: aiSystemId,
      requirement: g.requirement,
      article: g.article,
      status: g.status,
      severity: SEVERITY_EN[g.severity] ?? "medium",
    };
  }).filter(Boolean);

  if (gapRows.length > 0) {
    const { error } = await supabase.from("gap_items").insert(gapRows as never[]);
    if (error) redirect("/dashboard/inventario?toast=seed-error");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard/riesgo");
  revalidatePath("/dashboard/gap");
  redirect("/dashboard/inventario?toast=seeded");
}

/**
 * Persiste una clasificación de riesgo y actualiza el nivel vigente del sistema.
 * Usado por el asistente cuando se guarda contra un sistema del inventario.
 */
/** Edita los campos de un sistema de IA. */
export async function updateAiSystem(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/inventario");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/inventario");

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect(`/dashboard/inventario/${id}/editar`);

  const { error } = await supabase
    .from("ai_systems")
    .update({
      name,
      owner: String(formData.get("owner") ?? "").trim() || null,
      domain: String(formData.get("domain") ?? "").trim() || null,
      vendor: String(formData.get("vendor") ?? "").trim() || null,
      actor_role: String(formData.get("actor_role") ?? "deployer") || "deployer",
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", org)
    .eq("id", id);
  if (error) redirect(`/dashboard/inventario/${id}/editar?toast=system-error`);

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  redirect("/dashboard/inventario?toast=system-updated");
}

/** Borra un sistema (y en cascada sus evaluaciones y brechas). */
export async function deleteAiSystem(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/inventario");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/inventario");

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const { error } = await supabase
    .from("ai_systems")
    .delete()
    .eq("organization_id", org)
    .eq("id", id);
  if (error) redirect("/dashboard/inventario?toast=system-error");

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/gap");
  redirect("/dashboard/inventario?toast=system-deleted");
}

/** Alta manual de una brecha/control en el gap assessment. */
export async function createGapItem(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/gap");

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const aiSystemId = String(formData.get("systemId") ?? "");
  const requirement = String(formData.get("requirement") ?? "").trim();
  if (!aiSystemId || !requirement) redirect("/dashboard/gap/nuevo");

  const status = String(formData.get("status") ?? "missing");
  const { error } = await supabase.from("gap_items").insert({
    organization_id: org,
    ai_system_id: aiSystemId,
    requirement,
    article: String(formData.get("article") ?? "").trim() || null,
    severity: SEVERITY_EN[String(formData.get("severity") ?? "media")] ?? "medium",
    status: ["missing", "partial", "done"].includes(status) ? status : "missing",
    created_by: user?.id,
  });
  if (error) redirect("/dashboard/gap/nuevo?toast=gap-error");

  revalidatePath("/dashboard/gap");
  revalidatePath("/dashboard/plan");
  revalidatePath("/dashboard");
  redirect("/dashboard/gap?toast=gap-created");
}

/** Elimina una brecha del gap assessment. */
export async function deleteGapItem(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/gap");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/gap");

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const { error } = await supabase
    .from("gap_items")
    .delete()
    .eq("organization_id", org)
    .eq("id", id);
  if (error) redirect("/dashboard/gap?toast=gap-error");

  revalidatePath("/dashboard/gap");
  revalidatePath("/dashboard/plan");
  revalidatePath("/dashboard");
  redirect("/dashboard/gap?toast=gap-deleted");
}

/** Cambia el estado de una brecha (falta / parcial / cubierto). */
export async function updateGapStatus(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/gap");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["missing", "partial", "done"].includes(status)) {
    redirect("/dashboard/gap");
  }

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const { error } = await supabase
    .from("gap_items")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("organization_id", org)
    .eq("id", id);
  if (error) redirect("/dashboard/gap?toast=gap-error");

  revalidatePath("/dashboard/gap");
  revalidatePath("/dashboard/plan");
  revalidatePath("/dashboard");
  redirect("/dashboard/gap?toast=gap-updated");
}

export type EvidenceInput = {
  attestedByName?: string;
  note?: string;
  url?: string;
};

export async function saveRiskAssessment(
  aiSystemId: string,
  answers: Answers,
  result: ClassificationResult,
  evidence?: EvidenceInput,
) {
  if (!isSupabaseConfigured) return { ok: false as const, error: "demo" };

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return { ok: false as const, error: "sin organización" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const note = evidence?.note?.trim() || null;
  const url = evidence?.url?.trim() || null;
  // "Con evidencia" solo si se aportó una nota o un enlace de soporte.
  const evidenceState = note || url ? "evidenced" : "declared";

  const { data, error } = await supabase
    .from("risk_assessments")
    .insert({
      organization_id: org,
      ai_system_id: aiSystemId,
      answers,
      level: result.level,
      rationale: result.rationale,
      citations: result.citations,
      obligations: result.obligations,
      assessed_by: user?.id,
      attested_by_name: evidence?.attestedByName?.trim() || null,
      evidence_note: note,
      evidence_url: url,
      evidence_state: evidenceState,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false as const, error: error?.message };

  await supabase
    .from("ai_systems")
    .update({
      risk_level: result.level,
      current_assessment_id: data.id,
      last_reviewed_at: new Date().toISOString(),
      evidence_state: evidenceState,
    })
    .eq("id", aiSystemId);

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard/riesgo");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
