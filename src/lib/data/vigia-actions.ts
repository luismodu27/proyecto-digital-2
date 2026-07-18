"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { runVigia } from "@/lib/vigia/run";

const QUEUE = "/dashboard/vigilancia/candidatos";

/**
 * Disparo manual del Vigía desde la bandeja del Validador. Corre con la sesión
 * del usuario: solo un `platform_admin` puede escribir en `reg_sources` /
 * `reg_candidates` (lo impone la RLS). El cron desatendido usa la ruta
 * `/api/cron/vigia` con service_role.
 */
export async function runVigiaNow() {
  if (!isSupabaseConfigured) redirect(`${QUEUE}?toast=vigia-demo`);

  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) redirect(`${QUEUE}?toast=vigia-denied`);

  const report = await runVigia(supabase, new Date().toISOString());
  revalidatePath(QUEUE);
  revalidatePath("/dashboard/vigilancia");

  const created = report.summary.changed;
  if (report.summary.error > 0 && created === 0) {
    redirect(`${QUEUE}?toast=vigia-error`);
  }
  redirect(`${QUEUE}?toast=${created > 0 ? "vigia-done" : "vigia-none"}`);
}
