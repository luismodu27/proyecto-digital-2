"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logIncident } from "@/lib/observability/log";
import { INCIDENT_CATEGORIES, NOTIFY_TARGETS, SERIOUSNESS } from "@/lib/incidents/incidents";
import { REVIEW_CADENCE_CHOICES } from "@/lib/incidents/review";
import { bool as on, date, MAX_NAME, MAX_NOTE, text, uuid } from "./form";
import { getActiveOrg } from "./context";

const INCIDENTS = "/dashboard/incidentes";

/** Columna de fecha por destinatario. La ÚNICA vía de escritura a esos campos:
 *  así un `target` manipulado no puede tocar ninguna otra columna. */
const NOTIFY_COLUMN = {
  provider: "notified_provider_on",
  distributor: "notified_distributor_on",
  authority: "notified_authority_on",
} as const;

function revalidate() {
  revalidatePath(INCIDENTS);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/actividad");
}

async function ctx() {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, org, user };
}




/** Categorías del Art. 3.49 marcadas, filtradas contra el catálogo cerrado. */
function cleanCategories(values: FormDataEntryValue[]): string[] {
  const allowed = new Set<string>(INCIDENT_CATEGORIES);
  const out = new Set<string>();
  for (const v of values) {
    const s = String(v);
    if (allowed.has(s)) out.add(s);
  }
  return [...out];
}

/**
 * Abre un expediente de incidente.
 *
 * `aware_on` (fecha de conocimiento) es obligatoria y por eso se exige aquí: es
 * el dato que arranca los plazos del Art. 73 y sin ella el expediente no prueba
 * nada. Si el formulario llega sin ella se usa hoy, que es lo que la persona
 * está declarando al abrirlo.
 */
export async function createIncident(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${INCIDENTS}?toast=incident-demo`);
  const { supabase, org, user } = await ctx();

  const title = text(formData.get("title"), MAX_NAME);
  if (!title) redirect(INCIDENTS);

  const seriousness = String(formData.get("seriousness") ?? "under_assessment");
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("incidents").insert({
    organization_id: org,
    ai_system_id: uuid(formData.get("systemId")),
    title,
    detail: text(formData.get("detail"), MAX_NOTE),
    occurred_on: date(formData.get("occurredOn")),
    aware_on: date(formData.get("awareOn")) ?? today,
    causal_link_on: date(formData.get("causalLinkOn")),
    categories: cleanCategories(formData.getAll("categories")),
    seriousness: (SERIOUSNESS as readonly string[]).includes(seriousness)
      ? seriousness
      : "under_assessment",
    risk_art79: on(formData.get("riskArt79")),
    use_suspended: on(formData.get("useSuspended")),
    provider_unreachable: on(formData.get("providerUnreachable")),
    personal_data_breach: on(formData.get("personalDataBreach")),
    created_by: user.id,
  });

  if (error) {
    logIncident("createIncident", error);
    redirect(`${INCIDENTS}?toast=incident-error`);
  }
  revalidate();
  redirect(`${INCIDENTS}?toast=incident-created`);
}

/**
 * Actualiza la CALIFICACIÓN del expediente (gravedad, categorías y las cuatro
 * banderas). Va junto a propósito: son las respuestas a "¿qué es esto?", y
 * partirlas en cuatro formularios invita a dejar el expediente a medias.
 */
export async function updateIncidentAssessment(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${INCIDENTS}?toast=incident-demo`);
  const { supabase, org } = await ctx();
  const id = uuid(formData.get("id"));
  if (!id) redirect(INCIDENTS);

  const seriousness = String(formData.get("seriousness") ?? "under_assessment");

  const { error } = await supabase
    .from("incidents")
    .update({
      seriousness: (SERIOUSNESS as readonly string[]).includes(seriousness)
        ? seriousness
        : "under_assessment",
      categories: cleanCategories(formData.getAll("categories")),
      risk_art79: on(formData.get("riskArt79")),
      use_suspended: on(formData.get("useSuspended")),
      provider_unreachable: on(formData.get("providerUnreachable")),
      personal_data_breach: on(formData.get("personalDataBreach")),
      causal_link_on: date(formData.get("causalLinkOn")),
    })
    .eq("organization_id", org)
    .eq("id", id);

  if (error) {
    logIncident("updateIncidentAssessment", error);
    redirect(`${INCIDENTS}?toast=incident-error`);
  }
  revalidate();
  redirect(`${INCIDENTS}?toast=incident-updated`);
}

/**
 * Registra que la organización DECLARA haber informado a un destinatario.
 *
 * El verbo es de la organización, nunca de Attesta: aquí no se envía nada a
 * ninguna autoridad ni a ningún proveedor. Esto es el expediente de lo que el
 * cliente dice haber hecho, con su fecha.
 */
export async function markIncidentNotified(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${INCIDENTS}?toast=incident-demo`);
  const { supabase, org } = await ctx();
  const id = uuid(formData.get("id"));
  const target = String(formData.get("target") ?? "");
  if (!id || !(NOTIFY_TARGETS as readonly string[]).includes(target)) {
    redirect(INCIDENTS);
  }

  const column = NOTIFY_COLUMN[target as keyof typeof NOTIFY_COLUMN];
  // Fecha vacía = deshacer (se marcó por error). Que sea reversible importa: un
  // registro que no se puede corregir se rellena con miedo o no se rellena.
  const value = date(formData.get("date"));

  const { error } = await supabase
    .from("incidents")
    .update({ [column]: value })
    .eq("organization_id", org)
    .eq("id", id);

  if (error) {
    logIncident("markIncidentNotified", error);
    redirect(`${INCIDENTS}?toast=incident-error`);
  }
  revalidate();
  redirect(`${INCIDENTS}?toast=incident-updated`);
}

/** Cierra o reabre un expediente. */
export async function setIncidentStatus(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${INCIDENTS}?toast=incident-demo`);
  const { supabase, org } = await ctx();
  const id = uuid(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!id || (status !== "open" && status !== "closed")) redirect(INCIDENTS);

  const { error } = await supabase
    .from("incidents")
    .update({ status })
    .eq("organization_id", org)
    .eq("id", id);

  if (error) {
    logIncident("setIncidentStatus", error);
    redirect(`${INCIDENTS}?toast=incident-error`);
  }
  revalidate();
  redirect(`${INCIDENTS}?toast=incident-updated`);
}

/**
 * Cadencia de revisión de la autoevaluación.
 *
 * Recordatorio para quien toque esto: es BUENA PRÁCTICA, no un plazo legal. El
 * Reglamento no fija periodicidad de revisión para el deployer.
 */
export async function updateReviewCadence(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${INCIDENTS}?toast=incident-demo`);
  const { supabase, org } = await ctx();
  const days = Number(formData.get("cadenceDays"));
  if (!(REVIEW_CADENCE_CHOICES as readonly number[]).includes(days)) {
    redirect(INCIDENTS);
  }

  // Vía RPC y no `update` directo: 0025 dejó `organizations` con el UPDATE
  // restringido a (name, slug) para que nadie pudiera escribirse su propia
  // columna `plan`. La autorización (owner/admin) la impone la función SQL.
  const { error } = await supabase.rpc("set_review_cadence", { org, days });

  if (error) {
    logIncident("updateReviewCadence", error);
    redirect(`${INCIDENTS}?toast=incident-error`);
  }
  revalidate();
  redirect(`${INCIDENTS}?toast=cadence-updated`);
}
