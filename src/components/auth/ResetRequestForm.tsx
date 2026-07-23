"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Solicitud de recuperación de contraseña.
 * Envía el correo de restablecimiento; el enlace vuelve a `/auth/callback` y
 * de ahí a `/reset-password/update` con la sesión de recuperación activa.
 *
 * Por seguridad NO revelamos si el correo existe: siempre mostramos el mismo
 * mensaje de "si existe una cuenta, te enviamos el enlace".
 */
export function ResetRequestForm({ t }: { t: Dictionary["auth"] }) {
  const r = t.resetRequest;
  const [email, setEmail] = useState("");
  // Honeypot anti-bots: un humano nunca rellena este campo oculto.
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Bot detectado: fingimos éxito sin hacer nada.
    if (company) {
      setSent(true);
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(r.emailInvalid);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password/update`;
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo },
      );
      if (error) {
        // Límite de tasa: avisamos para que reintente más tarde.
        if (/rate limit|for security purposes/i.test(error.message)) {
          setError(r.rateLimit);
          return;
        }
        // Error de configuración (URL de redirección no permitida en Supabase):
        // no es enumeración de cuentas, conviene mostrarlo durante el setup.
        if (/redirect|not allowed|invalid.*url/i.test(error.message)) {
          setError(r.redirectConfig);
          return;
        }
        // Cualquier otro caso (p. ej. correo inexistente): NO lo revelamos.
      }
      setSent(true);
    } catch {
      setError(r.generic);
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "mt-1.5 w-full rounded-lg border bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:ring-2 focus:ring-brand border-line-strong focus:border-brand";

  if (sent) {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-8">
        <SealMark size={36} className="text-brand" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          {r.sentTitle}
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          {r.sentBodyBefore}
          <span className="font-medium text-ink">{email.trim()}</span>
          {r.sentBodyAfter}
        </p>
        <p className="mt-3 text-xs text-muted">{r.spamHint}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
        >
          {r.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-8">
      <SealMark size={36} className="text-brand" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        {r.title}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">{r.subtitle}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {/* Honeypot: oculto para humanos, visible para bots. */}
        <div className="absolute -left-[9999px]" aria-hidden>
          <label htmlFor="company">{r.honeypotLabel}</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            {r.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={!!error}
            className={inputBase}
            placeholder={r.emailPlaceholder}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-3 py-2 text-sm text-[var(--tone-danger-fg)]"
          >
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full py-2.5">
          {loading ? r.sending : r.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link
          href="/login"
          className="font-medium text-brand transition-colors hover:text-brand-strong"
        >
          {r.backToLoginLink}
        </Link>
      </p>
    </div>
  );
}
