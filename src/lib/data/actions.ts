"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import type { Answers, ClassificationResult } from "@/lib/risk-assessment";
import { AI_SYSTEMS, GAP_ITEMS, RISK_ORDER } from "@/lib/mock-data";
import { policyPackById } from "@/lib/policy-packs";
import { resolveLocale } from "@/lib/i18n/resolve";

const SEVERITY_EN: Record<string, string> = {
  alta: "high",
  media: "medium",
  baja: "low",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Verifica que un `ai_system` existe y pertenece a la organización activa.
 * Defensa en profundidad: aunque la RLS ya aísla por tenant, comprobamos la
 * pertenencia (y el formato UUID) antes de escribir filas que lo referencian,
 * para no crear referencias colgantes a sistemas de otro tenant.
 */
async function systemBelongsToOrg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  org: string,
  systemId: string,
): Promise<boolean> {
  if (!UUID_RE.test(systemId)) return false;
  const { data } = await supabase
    .from("ai_systems")
    .select("id")
    .eq("organization_id", org)
    .eq("id", systemId)
    .maybeSingle();
  return !!data;
}

/**
 * Recalcula y persiste el "% listo" (`compliance_pct`) de un sistema a partir de
 * la cobertura de sus brechas: proporción de controles en estado "done" sobre el
 * total evaluado (misma fórmula que el informe de gap en vivo). Se invoca tras
 * cualquier mutación de brechas o al aplicar un policy pack, para que la métrica
 * insignia refleje el trabajo real y no quede clavada en 0 (antes solo la fijaba
 * el seed de demo). Sin brechas evaluadas ⇒ 0% (nada declarado aún).
 */
async function recomputeReadiness(
  supabase: Awaited<ReturnType<typeof createClient>>,
  org: string,
  aiSystemId: string,
): Promise<void> {
  // Se intenta leer la marca `prohibited` (migración 0022). Si la columna aún no
  // existe, se cae al cálculo clásico (todas las brechas cuentan) — degradación
  // segura sin romper el recálculo.
  let items: { status: string | null; prohibited?: boolean }[] = [];
  const withFlag = await supabase
    .from("gap_items")
    .select("status, prohibited")
    .eq("organization_id", org)
    .eq("ai_system_id", aiSystemId);
  if (withFlag.error) {
    const base = await supabase
      .from("gap_items")
      .select("status")
      .eq("organization_id", org)
      .eq("ai_system_id", aiSystemId);
    items = base.data ?? [];
  } else {
    items = withFlag.data ?? [];
  }
  // Las prácticas prohibidas (Art. 5, riesgo inaceptable) NO se "preparan para
  // auditoría": quedan fuera del cómputo de preparación ("% listo").
  const counted = items.filter((r) => !r.prohibited);
  const total = counted.length;
  const done = counted.filter((r) => r.status === "done").length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  await supabase
    .from("ai_systems")
    .update({ compliance_pct: pct })
    .eq("organization_id", org)
    .eq("id", aiSystemId);
}

/**
 * Aplica un policy pack a un sistema: precarga sus controles como brechas
 * (gap_items), sin duplicar los que ya existen. El pack se elige por `packId`
 * (por defecto, el de RRHH, por compatibilidad).
 */
export async function applyPolicyPack(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/packs");

  const systemId = String(formData.get("systemId") ?? "");
  if (!systemId) redirect("/dashboard/packs");

  // Resolvemos el locale para insertar los controles en el idioma de la UI: en
  // EN se guardan los textos EN validados como gap_items (datos persistidos).
  const locale = await resolveLocale();
  const pack = policyPackById(String(formData.get("packId") ?? "rrhh"), locale);
  if (!pack) redirect("/dashboard/packs");

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  // El sistema debe pertenecer a la org activa (evita referencias cross-tenant).
  if (!(await systemBelongsToOrg(supabase, org, systemId))) {
    redirect("/dashboard/packs");
  }

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
      // Práctica prohibida del Art. 5 (fuera del "% listo"). La columna la aporta
      // la migración 0022; si no está aplicada, el insert de abajo reintenta sin ella.
      prohibited: c.prohibited ?? false,
      created_by: user?.id,
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from("gap_items").insert(rows);
    if (error) {
      // Degradación: si la columna `prohibited` aún no existe (migración 0022 sin
      // aplicar), se reinserta sin ella (todos los controles como brecha ordinaria).
      const legacy = rows.map((r) => {
        const rest: Record<string, unknown> = { ...r };
        delete rest.prohibited;
        return rest;
      });
      const retry = await supabase.from("gap_items").insert(legacy);
      if (retry.error) redirect("/dashboard/packs?toast=pack-error");
    }
  }

  // El pack añadió controles como brechas ⇒ recalcula el "% listo" del sistema.
  await recomputeReadiness(supabase, org, systemId);

  revalidatePath("/dashboard/gap");
  revalidatePath("/dashboard/inventario");
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
  if (!(await systemBelongsToOrg(supabase, org, aiSystemId))) {
    redirect("/dashboard/gap/nuevo?toast=gap-error");
  }

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

  await recomputeReadiness(supabase, org, aiSystemId);

  revalidatePath("/dashboard/gap");
  revalidatePath("/dashboard/plan");
  revalidatePath("/dashboard/inventario");
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

  const { data: deleted, error } = await supabase
    .from("gap_items")
    .delete()
    .eq("organization_id", org)
    .eq("id", id)
    .select("ai_system_id")
    .maybeSingle();
  if (error) redirect("/dashboard/gap?toast=gap-error");

  if (deleted?.ai_system_id) {
    await recomputeReadiness(supabase, org, deleted.ai_system_id);
  }

  revalidatePath("/dashboard/gap");
  revalidatePath("/dashboard/plan");
  revalidatePath("/dashboard/inventario");
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

  const { data: updated, error } = await supabase
    .from("gap_items")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("organization_id", org)
    .eq("id", id)
    .select("ai_system_id")
    .maybeSingle();
  if (error) redirect("/dashboard/gap?toast=gap-error");

  if (updated?.ai_system_id) {
    await recomputeReadiness(supabase, org, updated.ai_system_id);
  }

  revalidatePath("/dashboard/gap");
  revalidatePath("/dashboard/plan");
  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  redirect("/dashboard/gap?toast=gap-updated");
}

/**
 * Registra la evidencia de auditoría de sesgo (NYC LL144) de un sistema.
 * Attesta REGISTRA lo declarado; no realiza ni valida la auditoría.
 */
export async function saveBiasAudit(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/inventario");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/inventario");

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const dateOrNull = (key: string) => {
    const v = String(formData.get(key) ?? "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
  };
  const textOrNull = (key: string) => String(formData.get(key) ?? "").trim() || null;

  const back = `/dashboard/inventario/${id}/editar`;
  const { error } = await supabase
    .from("ai_systems")
    .update({
      is_aedt: formData.get("is_aedt") === "on",
      last_bias_audit_date: dateOrNull("last_bias_audit_date"),
      independent_auditor_name: textOrNull("independent_auditor_name"),
      auditor_independence_confirmed:
        formData.get("auditor_independence_confirmed") === "on",
      bias_audit_summary_url: textOrNull("bias_audit_summary_url"),
      summary_published_date: dateOrNull("summary_published_date"),
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", org)
    .eq("id", id);
  if (error) redirect(`${back}?toast=bias-error`);

  revalidatePath(back);
  revalidatePath("/dashboard/inventario");
  redirect(`${back}?toast=bias-saved`);
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

  // El nivel llega calculado en cliente: validarlo contra el enum antes de
  // persistirlo (no confiar en la clasificación enviada sin comprobar).
  if (!RISK_ORDER.includes(result.level)) {
    return { ok: false as const, error: "nivel de riesgo no válido" };
  }
  // El sistema debe pertenecer a la org activa.
  if (!(await systemBelongsToOrg(supabase, org, aiSystemId))) {
    return { ok: false as const, error: "sistema no encontrado" };
  }

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
    .eq("organization_id", org)
    .eq("id", aiSystemId);

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard/riesgo");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
