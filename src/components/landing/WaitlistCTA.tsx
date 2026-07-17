"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";

export function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO(backend): enviar a la lista de espera real (API / CRM).
    setSubmitted(true);
  }

  return (
    <section id="waitlist" className="container-page py-20 md:py-28">
      <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-paper-raised px-6 py-14 text-center sm:px-12">
        <div className="absolute inset-0 grid-paper opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-xl">
          <SealMark size={48} className="mx-auto text-brand" />
          <h2 className="mt-5 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Ve por delante de la auditoría.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Estamos incorporando a un grupo reducido de empresas mid-market.
            Solicita acceso anticipado y recibe un gap assessment inicial.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-2xl border border-[#bfdccf] bg-brand-soft px-6 py-5 text-brand-strong">
              <p className="font-display text-lg font-semibold">¡Gracias! 🎉</p>
              <p className="mt-1 text-sm">
                Te avisaremos en <span className="font-medium">{email}</span>{" "}
                cuando abramos tu acceso.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="email" className="sr-only">
                Correo de trabajo
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="w-full rounded-full border border-line-strong bg-paper px-5 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
              <Button type="submit" className="px-6 py-3 shrink-0">
                Solicitar acceso
              </Button>
            </form>
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
