"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Flags de UI que persistimos en `user_metadata` (por cuenta). */
type UserFlag = "guide_seen" | "onboarding_dismissed";

/**
 * Marca un flag booleano en `user_metadata` (p. ej. la guía de bienvenida vista,
 * o el checklist de onboarding ocultado).
 *
 * Vive en servidor a propósito: así los componentes de onboarding NO tienen que
 * importar `@/lib/supabase/client`, y `supabase-js` deja de arrastrarse al bundle
 * de cliente del dashboard. Silencioso en modo demo / sin sesión: el guard local
 * (localStorage) del propio componente ya evita que el aviso reaparezca.
 */
export async function setUserFlag(flag: UserFlag): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const supabase = await createClient();
    await supabase.auth.updateUser({ data: { [flag]: true } });
  } catch {
    // sin sesión / error de red → el guard local del cliente ya cubre este render
  }
}
