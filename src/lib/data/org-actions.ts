"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ACTIVE_ORG_COOKIE } from "./context";

/**
 * Cambia la organización activa del usuario. Valida que sigue siendo miembro de
 * la org destino (seguridad) antes de fijar la cookie. Luego revalida y vuelve
 * al panel, ya con la nueva organización.
 */
export async function switchOrg(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/dashboard");
  const orgId = String(formData.get("orgId") ?? "");
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
