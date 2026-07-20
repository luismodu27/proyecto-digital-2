"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  SSO_GOOGLE,
  SSO_MICROSOFT,
  isAnySsoEnabled,
} from "@/lib/supabase/config";

/** Proveedores de identidad soportados (nombre de Supabase). */
type Provider = "google" | "azure";

/** Logo de Google (marca oficial, multicolor). */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5 shrink-0" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** Logo de Microsoft (cuatro cuadros de marca). */
function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5 shrink-0" aria-hidden>
      <path d="M11.4 11.4H2V2h9.4v9.4Z" fill="#F25022" />
      <path d="M22 11.4h-9.4V2H22v9.4Z" fill="#7FBA00" />
      <path d="M11.4 22H2v-9.4h9.4V22Z" fill="#00A4EF" />
      <path d="M22 22h-9.4v-9.4H22V22Z" fill="#FFB900" />
    </svg>
  );
}

/**
 * Botones de acceso corporativo (SSO social). Solo se muestran los proveedores
 * activados por variable de entorno (`NEXT_PUBLIC_SSO_*`). Usa el flujo OAuth de
 * Supabase; el retorno lo maneja `/auth/callback` (intercambio PKCE ya soportado).
 */
export function SsoButtons({ next = "/dashboard" }: { next?: string }) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isAnySsoEnabled) return null;

  async function signIn(provider: Provider) {
    setError(null);
    setLoading(provider);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        ...(provider === "azure" ? { scopes: "email" } : {}),
      },
    });
    if (error) {
      setError("No pudimos conectar con ese proveedor. Inténtalo de nuevo.");
      setLoading(null);
    }
    // En éxito el navegador ya está redirigiendo al proveedor: dejamos el loading.
  }

  const btn =
    "flex w-full items-center justify-center gap-3 rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken disabled:opacity-60";

  return (
    <div className="space-y-3">
      {SSO_GOOGLE && (
        <button
          type="button"
          onClick={() => signIn("google")}
          disabled={loading !== null}
          className={btn}
        >
          {loading === "google" ? (
            "Conectando…"
          ) : (
            <>
              <GoogleLogo />
              Continuar con Google
            </>
          )}
        </button>
      )}
      {SSO_MICROSOFT && (
        <button
          type="button"
          onClick={() => signIn("azure")}
          disabled={loading !== null}
          className={btn}
        >
          {loading === "azure" ? (
            "Conectando…"
          ) : (
            <>
              <MicrosoftLogo />
              Continuar con Microsoft
            </>
          )}
        </button>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-3 py-2 text-sm text-[var(--tone-danger-fg)]"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-muted">o con tu correo</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
