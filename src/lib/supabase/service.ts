import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Cliente con `service_role` para trabajos server-only sin sesión de usuario
 * (p. ej. el cron del Vigía en producción, que escribe en tablas de plataforma).
 *
 * ⚠️ NUNCA importar desde código cliente: la llave `SUPABASE_SERVICE_ROLE_KEY`
 * es un secreto de servidor que bypassa RLS. Devuelve `null` si no está
 * configurada, para que quien lo use pueda degradar con elegancia.
 */
export function createServiceClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createSupabaseClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
