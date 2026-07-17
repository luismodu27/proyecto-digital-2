"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const QUEUE = "/dashboard/vigilancia/candidatos";

/**
 * Publica un candidato como evento del radar (acción del Validador).
 * La autorización real la impone la función SQL (solo platform_admins);
 * aquí solo orquestamos y refrescamos.
 */
export async function approveCandidate(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${QUEUE}?toast=cand-demo`);

  const id = String(formData.get("id") ?? "").trim();
  const eventId = String(formData.get("eventId") ?? "").trim();
  if (!id) redirect(QUEUE);

  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_reg_candidate", {
    cand: id,
    event_id: eventId,
  });

  if (error) redirect(`${QUEUE}?toast=cand-error`);

  revalidatePath(QUEUE);
  revalidatePath("/dashboard/vigilancia");
  redirect(`${QUEUE}?toast=cand-approved`);
}

const RISK_LEVELS = ["unacceptable", "high", "limited", "minimal"] as const;

/**
 * Enriquece un candidato en borrador (rellena fecha, tipo, textos, artículos y
 * alcance) y, si el intent es "publish", lo publica reutilizando
 * `approve_reg_candidate`. Pensado para cerrar el bucle del Vigía: una señal
 * "algo cambió aquí" se completa a mano y se convierte en evento del radar.
 *
 * La RLS de `reg_candidates` ya restringe el UPDATE a validadores de plataforma;
 * el filtro `status = 'draft'` impide editar uno ya revisado.
 */
export async function enrichCandidate(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${QUEUE}?toast=cand-demo`);

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect(QUEUE);

  const intent = String(formData.get("intent") ?? "save");
  const str = (k: string) => String(formData.get(k) ?? "").trim();

  const title = str("title");
  if (!title) redirect(`${QUEUE}?toast=cand-error`);

  const eventDate = str("event_date") || null;
  const kind = str("kind") || null;
  const framework = str("framework") || "eu-ai-act";
  const proposedEventId = str("proposed_event_id");

  const articles = str("articles")
    .split(/[\n,]/)
    .map((a) => a.trim())
    .filter(Boolean);

  // Alcance: toda la organización, o una lista de niveles de riesgo.
  let scope: { all?: boolean; riskLevels?: string[] } = {};
  if (formData.get("scope_all")) {
    scope = { all: true };
  } else {
    const levels = RISK_LEVELS.filter((l) => formData.get(`risk_${l}`));
    if (levels.length > 0) scope = { riskLevels: levels };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reg_candidates")
    .update({
      title,
      event_date: eventDate,
      kind,
      framework,
      summary: str("summary") || null,
      impact: str("impact") || null,
      action: str("action") || null,
      articles,
      scope,
      proposed_event_id: proposedEventId || null,
    })
    .eq("id", id)
    .eq("status", "draft")
    .select("id");

  if (error || !data || data.length === 0) {
    redirect(`${QUEUE}?toast=cand-error`);
  }

  if (intent === "publish") {
    const { error: pubErr } = await supabase.rpc("approve_reg_candidate", {
      cand: id,
      event_id: proposedEventId,
    });
    if (pubErr) redirect(`${QUEUE}?toast=cand-error`);
    revalidatePath(QUEUE);
    revalidatePath("/dashboard/vigilancia");
    redirect(`${QUEUE}?toast=cand-approved`);
  }

  revalidatePath(QUEUE);
  redirect(`${QUEUE}?toast=cand-saved`);
}

/** Descarta un candidato con una nota (acción del Validador). */
export async function rejectCandidate(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${QUEUE}?toast=cand-demo`);

  const id = String(formData.get("id") ?? "").trim();
  const note = String(formData.get("note") ?? "");
  if (!id) redirect(QUEUE);

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_reg_candidate", {
    cand: id,
    note,
  });

  if (error) redirect(`${QUEUE}?toast=cand-error`);

  revalidatePath(QUEUE);
  redirect(`${QUEUE}?toast=cand-rejected`);
}
