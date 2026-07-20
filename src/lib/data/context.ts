import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Nombre de la cookie que guarda la organización activa elegida por el usuario. */
export const ACTIVE_ORG_COOKIE = "attesta_org";

/**
 * Usuario autenticado actual (o null en modo demo / sin sesión).
 *
 * Envuelto en `cache()` para deduplicar dentro de un mismo render de servidor:
 * el layout y las páginas pueden pedir el usuario varias veces y solo se hace
 * una llamada de red a Supabase Auth por request (menos latencia percibida).
 */
export const getCurrentUser = cache(async () => {
  // En modo demo no hay backend: createClient lanzaría por falta de credenciales.
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Organización activa del usuario. Si el usuario pertenece a varias, respeta su
 * elección (cookie `attesta_org`) **solo si sigue siendo miembro** de esa org
 * (validación de seguridad); si no, la primera de sus memberships (orden estable).
 */
export const getActiveOrg = cache(async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("organization_id", { ascending: true });

  const orgIds = (data ?? []).map((m) => m.organization_id as string);
  if (orgIds.length === 0) return null;
  if (orgIds.length === 1) return orgIds[0];

  // 1) Elección explícita del usuario (cookie), si sigue siendo miembro.
  const preferred = (await cookies()).get(ACTIVE_ORG_COOKIE)?.value;
  if (preferred && orgIds.includes(preferred)) return preferred;

  // 2) Si no eligió, prioriza una org con suscripción activa (la que pagó): así,
  //    tras pagar, se ve el plan correcto aunque pertenezca a varias orgs.
  try {
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("organization_id, status")
      .in("organization_id", orgIds)
      .in("status", ["active", "trialing"]);
    const subOrg = (subs ?? [])[0]?.organization_id as string | undefined;
    if (subOrg && orgIds.includes(subOrg)) return subOrg;
  } catch {
    // Tabla ausente u otro fallo → seguimos con la primera.
  }

  // 3) Por defecto, la primera (orden estable).
  return orgIds[0];
});
