"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import type { Answers, ClassificationResult } from "@/lib/risk-assessment";

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

  await supabase.from("ai_systems").insert({
    organization_id: org,
    name,
    owner: (String(formData.get("owner") ?? "").trim() || null) as string | null,
    domain: (String(formData.get("domain") ?? "").trim() || null) as string | null,
    vendor: (String(formData.get("vendor") ?? "").trim() || null) as string | null,
    actor_role: (String(formData.get("actor_role") ?? "deployer") ||
      "deployer") as string,
    created_by: user?.id,
  });

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard");
  redirect("/dashboard/inventario");
}

/**
 * Persiste una clasificación de riesgo y actualiza el nivel vigente del sistema.
 * Usado por el asistente cuando se guarda contra un sistema del inventario.
 */
export async function saveRiskAssessment(
  aiSystemId: string,
  answers: Answers,
  result: ClassificationResult,
) {
  if (!isSupabaseConfigured) return { ok: false as const, error: "demo" };

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) return { ok: false as const, error: "sin organización" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    })
    .eq("id", aiSystemId);

  revalidatePath("/dashboard/inventario");
  revalidatePath("/dashboard/riesgo");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
