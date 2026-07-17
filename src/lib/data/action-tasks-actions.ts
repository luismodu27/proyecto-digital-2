"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";

const PLAN = "/dashboard/plan";
const PRIORITIES = ["critica", "alta", "media", "baja"];
const STATUSES = ["todo", "in_progress", "blocked", "done"];
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function revalidate() {
  revalidatePath(PLAN);
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

function cleanUuid(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return UUID_RE.test(s) ? s : null;
}
function cleanDate(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

/** Crea una tarea del plan (alta manual o desde una recomendación). */
export async function createActionTask(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${PLAN}?toast=task-demo`);
  const { supabase, org, user } = await ctx();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect(PLAN);

  const priority = String(formData.get("priority") ?? "media");
  const source =
    String(formData.get("source") ?? "manual") === "recommendation"
      ? "recommendation"
      : "manual";

  const { error } = await supabase.from("action_tasks").insert({
    organization_id: org,
    title,
    detail: String(formData.get("detail") ?? "").trim() || null,
    article: String(formData.get("article") ?? "").trim() || null,
    priority: PRIORITIES.includes(priority) ? priority : "media",
    assignee_id: cleanUuid(formData.get("assigneeId")),
    due_date: cleanDate(formData.get("dueDate")),
    ai_system_id: cleanUuid(formData.get("systemId")),
    source,
    source_key: String(formData.get("sourceKey") ?? "").trim() || null,
    created_by: user.id,
  });

  if (error) redirect(`${PLAN}?toast=task-error`);
  revalidate();
  redirect(`${PLAN}?toast=task-created`);
}

/** Cambia el estado de una tarea (autoenvío). */
export async function updateTaskStatus(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${PLAN}?toast=task-demo`);
  const { supabase, org } = await ctx();
  const id = cleanUuid(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status)) redirect(PLAN);

  await supabase
    .from("action_tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("organization_id", org)
    .eq("id", id);
  revalidate();
  redirect(PLAN);
}

/** Asigna (o desasigna) el responsable de una tarea (autoenvío). */
export async function updateTaskAssignee(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${PLAN}?toast=task-demo`);
  const { supabase, org } = await ctx();
  const id = cleanUuid(formData.get("id"));
  if (!id) redirect(PLAN);

  await supabase
    .from("action_tasks")
    .update({
      assignee_id: cleanUuid(formData.get("assigneeId")),
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", org)
    .eq("id", id);
  revalidate();
  redirect(PLAN);
}

/** Fija (o borra) la fecha límite de una tarea. */
export async function updateTaskDueDate(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${PLAN}?toast=task-demo`);
  const { supabase, org } = await ctx();
  const id = cleanUuid(formData.get("id"));
  if (!id) redirect(PLAN);

  await supabase
    .from("action_tasks")
    .update({
      due_date: cleanDate(formData.get("dueDate")),
      updated_at: new Date().toISOString(),
    })
    .eq("organization_id", org)
    .eq("id", id);
  revalidate();
  redirect(PLAN);
}

/** Elimina una tarea del plan. */
export async function deleteActionTask(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${PLAN}?toast=task-demo`);
  const { supabase, org } = await ctx();
  const id = cleanUuid(formData.get("id"));
  if (!id) redirect(PLAN);

  await supabase
    .from("action_tasks")
    .delete()
    .eq("organization_id", org)
    .eq("id", id);
  revalidate();
  redirect(`${PLAN}?toast=task-deleted`);
}
