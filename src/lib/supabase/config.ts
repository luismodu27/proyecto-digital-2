/**
 * Configuración de Supabase.
 *
 * La app funciona en dos modos:
 *  - MODO DEMO: sin variables de entorno → se usan los datos de ejemplo.
 *  - MODO CONECTADO: con NEXT_PUBLIC_SUPABASE_URL + ANON_KEY → datos reales.
 *
 * `isSupabaseConfigured` permite que la capa de datos elija la fuente sin romper
 * la demo cuando no hay credenciales.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
