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
