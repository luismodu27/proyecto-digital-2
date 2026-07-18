import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Usuario autenticado actual (o null en modo demo / sin sesión).
 *
 * Envuelto en `cache()` para deduplicar dentro de un mismo render de servidor:
 * el layout y las páginas pueden pedir el usuario varias veces y solo se hace
 * una llamada de red a Supabase Auth por request (menos latencia percibida).
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Organización activa del usuario. MVP: la primera de sus memberships.
 * TODO: soportar selector de org activa (usuario en varias orgs) vía cookie
 * validada + JWT, según el plan de arquitectura.
 */
export const getActiveOrg = cache(async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return data?.organization_id ?? null;
});
