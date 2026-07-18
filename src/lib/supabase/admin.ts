import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Cliente Supabase con `service_role` para procesos desatendidos (el cron del
 * Vigía). SALTA la RLS, así que SOLO debe usarse en servidor y en rutas
 * protegidas por secreto. La llave NUNCA lleva prefijo NEXT_PUBLIC: no llega al
 * navegador.
 *
 * Devuelve null si no está configurada (permite desplegar el código sin la
 * llave y que la ruta responda 503 en vez de romper).
 */
export function createAdminClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
