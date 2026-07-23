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

/**
 * SSO / acceso corporativo (login social con Google y Microsoft).
 *
 * Los proveedores se configuran en el panel de Supabase (Auth → Providers). La
 * app no puede saber si están activos, así que cada botón se enciende con una
 * variable pública: el fundador la pone en Vercel cuando ya configuró el
 * proveedor. Sin la variable, el botón no aparece (degradación segura).
 */
function envFlag(v: string | undefined): boolean {
  const s = (v ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "on";
}

export const SSO_GOOGLE = envFlag(process.env.NEXT_PUBLIC_SSO_GOOGLE);
export const SSO_MICROSOFT = envFlag(process.env.NEXT_PUBLIC_SSO_MICROSOFT);
export const isAnySsoEnabled = SSO_GOOGLE || SSO_MICROSOFT;
