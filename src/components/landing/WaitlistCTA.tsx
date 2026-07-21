"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { submitWaitlist } from "@/lib/landing/waitlist-actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistCTA() {
  const [email, setEmail] = useState("");
  // Honeypot anti-bots: campo oculto que un humano nunca rellena.
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Bot detectado: fingimos éxito sin escribir nada.
    if (company) {
      setSubmitted(true);
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Introduce un correo válido (p. ej. tu@empresa.com).");
      return;
    }
    setLoading(true);
    try {
      const res = await submitWaitlist(email.trim(), "landing");
      if (!res.ok) {
        setError(res.error ?? "No pudimos registrarte. Inténtalo de nuevo.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("No pudimos registrarte. Inténtalo de nuevo en un momento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="waitlist" className="container-page py-20 md:py-28">
      <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-paper-raised px-6 py-14 text-center sm:px-12">
        <div className="absolute inset-0 grid-paper opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-xl">
          <SealMark size={48} className="mx-auto" />
          <h2 className="mt-5 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Ve por delante de la auditoría.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Estamos incorporando a un grupo reducido de empresas mid-market.
            Solicita acceso anticipado y recibe un gap assessment inicial.
          </p>

          {submitted ? (
            <div
              role="status"
              className="mt-8 rounded-2xl border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] px-6 py-5 text-[var(--tone-good-fg)]"
            >
              <p className="font-display text-lg font-semibold">¡Gracias! 🎉</p>
              <p className="mt-1 text-sm">
                Te avisaremos en <span className="font-medium">{email}</span>{" "}
                cuando abramos tu acceso.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Correo de trabajo
              </label>
              {/* Honeypot: fuera de pantalla y accesiblemente oculto. */}
              <div className="absolute -left-[9999px]" aria-hidden>
                <label htmlFor="waitlist-company">No rellenar</label>
                <input
                  id="waitlist-company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <input
                id="waitlist-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={!!error}
                aria-describedby={error ? "waitlist-error" : undefined}
                placeholder="tu@empresa.com"
                className="w-full rounded-full border border-line-strong bg-paper px-5 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
              <Button type="submit" disabled={loading} className="px-6 py-3 shrink-0">
                {loading ? "Enviando…" : "Solicitar acceso"}
              </Button>
            </form>
          )}

          {error && (
            <p
              id="waitlist-error"
              role="alert"
              className="mt-3 text-sm text-[var(--tone-danger-fg)]"
            >
              {error}
            </p>
          )}

          <p className="mt-4 text-xs text-muted">
            Sin compromiso. Attesta ofrece orientación de compliance, no asesoría
            legal.
          </p>
        </div>
      </div>
    </section>
  );
}
