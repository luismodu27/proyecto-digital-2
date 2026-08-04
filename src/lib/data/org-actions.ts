"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ACTIVE_ORG_COOKIE } from "./context";
import { MAX_NAME, text, uuid } from "./form";
import { logIncident } from "@/lib/observability/log";

/**
 * Cambia la organización activa del usuario. Valida que sigue siendo miembro de
 * la org destino (seguridad) antes de fijar la cookie. Luego revalida y vuelve
 * al panel, ya con la nueva organización.
 */
export async function switchOrg(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard");
  const orgId = uuid(formData.get("orgId")) ?? "";
  if (!orgId) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // El usuario debe ser miembro de la org destino.
  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .maybeSingle();
  if (!membership) redirect("/dashboard");

  (await cookies()).set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

/**
 * Solicita la baja de la organización activa (derecho de supresión + cierre de
 * cuenta). No borra nada: marca la solicitud y arranca el periodo de gracia de 7
 * días. La purga real la ejecuta el cron, y hasta entonces se puede cancelar.
 *
 * La autorización de verdad —que quien llama sea PROPIETARIO— vive dentro de la
 * RPC `request_org_deletion`, no aquí. Aquí solo se valida la forma de lo que
 * llega y se traducen los errores a algo que se pueda leer en pantalla. Un guard
 * en la Server Action sería una comodidad, no una barrera: la barrera tiene que
 * estar donde no se pueda esquivar.
 */
export async function requestOrgDeletion(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/organizaciones?toast=demo");

  const orgId = uuid(formData.get("orgId")) ?? "";
  const confirm = text(formData.get("confirm"), MAX_NAME) ?? "";
  if (!orgId || !confirm) {
    redirect("/dashboard/organizaciones?toast=deletion-confirm");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("request_org_deletion", {
    p_org: orgId,
    p_confirm: confirm,
    });

  if (error) {
    // El caso frecuente es que el nombre no coincida: se distingue del resto
    // para no enseñar "error inesperado" a quien solo se equivocó tecleando.
    const mismatch = error.message?.includes("confirmación");
    logIncident("requestOrgDeletion", error);
    redirect(
      `/dashboard/organizaciones?toast=${mismatch ? "deletion-confirm" : "error"}`,
    );
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/organizaciones?toast=deletion-requested");
}

/** Cancela una baja pendiente. Solo propietario (comprobado en la RPC). */
export async function cancelOrgDeletion(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard/organizaciones?toast=demo");

  const orgId = uuid(formData.get("orgId")) ?? "";
  if (!orgId) redirect("/dashboard/organizaciones");

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_org_deletion", { p_org: orgId });
  if (error) {
    logIncident("cancelOrgDeletion", error);
    redirect("/dashboard/organizaciones?toast=error");
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/organizaciones?toast=deletion-cancelled");
}
