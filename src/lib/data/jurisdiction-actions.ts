"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import { JURISDICTION_ORDER } from "@/lib/regulatory-watch";

const VIGILANCIA = "/dashboard/vigilancia";
// Fuente única de códigos válidos: el catálogo de jurisdicciones del radar. Así,
// al añadir una jurisdicción nueva (p. ej. us-ca) no hay que tocar esta lista.
const ALLOWED = new Set<string>(JURISDICTION_ORDER);

/**
 * Guarda las jurisdicciones donde la organización tiene nexo (dónde contrata).
 * La autorización (owner/admin) la impone la función SQL. Solo se envían códigos
 * válidos; la lista puede quedar vacía (= sin configurar).
 */
export async function setOrgJurisdictions(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${VIGILANCIA}?toast=jur-demo`);

  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const jur = formData
    .getAll("jurisdiction")
    .map((v) => String(v))
    .filter((v) => ALLOWED.has(v));

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_org_jurisdictions", {
    org,
    jur,
  });

  if (error) redirect(`${VIGILANCIA}?toast=jur-error`);

  revalidatePath(VIGILANCIA);
  revalidatePath("/dashboard");
  redirect(`${VIGILANCIA}?toast=jur-saved`);
}
