import { createClient } from "@/lib/supabase/server";

/** Usuario autenticado actual (o null en modo demo / sin sesión). */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Organización activa del usuario. MVP: la primera de sus memberships.
 * TODO: soportar selector de org activa (usuario en varias orgs) vía cookie
 * validada + JWT, según el plan de arquitectura.
 */
export async function getActiveOrg(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return data?.organization_id ?? null;
}
