"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getIsPlatformAdmin } from "@/lib/data";
import { runVigia } from "@/lib/reg-watch/run";

const PAGE = "/dashboard/vigilancia/fuentes";

/**
 * Ejecuta el Vigía a demanda (botón del panel de fuentes). La autorización real
 * la impone también el RPC `vigia_report` (solo platform_admin / service_role);
 * aquí cortamos antes para dar un aviso claro.
 */
export async function runVigiaNow() {
  if (!isSupabaseConfigured) redirect(`${PAGE}?toast=vigia-demo`);

  const isAdmin = await getIsPlatformAdmin();
  if (!isAdmin) redirect(`${PAGE}?toast=vigia-denied`);

  const supabase = await createClient();

  let ok = true;
  let checked = 0;
  let changed = 0;
  try {
    const summary = await runVigia(supabase);
    checked = summary.checked;
    changed = summary.changed;
  } catch {
    ok = false;
  }

  revalidatePath(PAGE);
  revalidatePath("/dashboard/vigilancia/candidatos");
  redirect(
    ok
      ? `${PAGE}?toast=vigia-ok&checked=${checked}&changed=${changed}`
      : `${PAGE}?toast=vigia-error`,
  );
}
