import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de autenticación de Supabase (enlaces de correo: confirmación de
 * cuenta y recuperación de contraseña).
 *
 * Soporta los dos formatos de enlace que puede generar Supabase:
 *  - PKCE  → `?code=...`            → `exchangeCodeForSession`
 *  - OTP   → `?token_hash=&type=`   → `verifyOtp` (robusto entre navegadores)
 *
 * Tras establecer la sesión redirige a `next` (siempre una ruta relativa).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // El proveedor OAuth devuelve error/error_description si el usuario cancela o
  // falla el consentimiento.
  const providerError = searchParams.get("error");

  // `next` debe ser una ruta relativa para evitar open-redirects.
  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/")) next = "/dashboard";

  if (providerError) {
    return NextResponse.redirect(`${origin}/login?error=sso`);
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Enlace inválido o caducado: vuelve al login con aviso.
  return NextResponse.redirect(`${origin}/login?error=auth_link`);
}
