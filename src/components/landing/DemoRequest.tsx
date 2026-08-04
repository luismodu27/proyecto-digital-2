"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { requestDemo } from "@/lib/landing/demo-actions";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { legalPath, legalDocumentById } from "@/lib/legal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIZES = ["1-50", "51-200", "201-1000", "1000+"] as const;

/**
 * Solicitud de demo (venta asistida).
 *
 * QUÉ SE PIDE Y POR QUÉ TAN POCO. Obligatorios: correo y organización. Todo lo
 * demás es opcional. Cada campo de más en un formulario público cuesta
 * solicitudes, y una solicitud perdida vale más que un dato de cualificación: lo
 * que falte se pregunta en la llamada, que es exactamente para lo que existe la
 * llamada. El tamaño se pide porque es lo que ordena la bandeja cuando llegan
 * varias a la vez; el papel, porque no se prepara igual una conversación con
 * RRHH que con un DPO.
 *
 * QUÉ PROMETE EL COPY, y por qué importa en este producto: "te enseñamos el
 * producto con tu caso" y "una respuesta clara sobre qué cubre y qué no". Attesta
 * vende honestidad sobre los límites de lo que hace; un formulario que prometiera
 * una solución integral contradiría la landing entera dos secciones más abajo.
 *
 * El honeypot es el mismo truco que en la lista de espera: un campo que ningún
 * humano ve y que los bots rellenan. Si viene relleno, se finge éxito y no se
 * escribe nada — decir "eres un bot" solo le enseña al bot a esquivarlo.
 */
export function DemoRequest({
  t,
  locale,
}: {
  t: Dictionary["landing"]["demo"];
  locale: Locale;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const privacy = legalDocumentById("privacy");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    // Honeypot: relleno = bot. Se finge éxito.
    if (form.get("website")) {
      setSent(true);
      return;
    }
    const email = String(form.get("email") ?? "").trim();
    if (!EMAIL_RE.test(email)) {
      setError(t.invalidEmail);
      return;
    }

    form.set("locale", locale);
    setLoading(true);
    try {
      const res = await requestDemo(form);
      if (!res.ok) {
        setError(res.error === "rate" ? t.rateError : t.genericError);
        return;
      }
      setSent(true);
    } catch {
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  }

  const field =
    "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-brand";
  const label = "block text-sm font-medium text-ink";

  return (
    <section id="demo" className="container-page py-20 md:py-28">
      <div className="grid gap-10 rounded-3xl border border-line-strong bg-paper-raised p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{t.intro}</p>
          <ul className="mt-6 space-y-3">
            {t.bullets.map((b) => (
              <li
                key={b}
                className="relative pl-6 text-sm leading-relaxed text-ink-soft before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-brand"
              >
                {b}
              </li>
            ))}
          </ul>
        </div>

        {sent ? (
          <div className="flex flex-col justify-center rounded-2xl border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] p-8">
            <p className="font-display text-xl font-semibold text-[var(--tone-good-fg)]">
              {t.successTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--tone-good-fg)]">
              {t.successBody}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            {/* Honeypot: fuera de la vista y fuera del recorrido de teclado. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute left-[-9999px] size-0"
            />
            <input type="hidden" name="source" value="landing_demo" />

            <div className="sm:col-span-2">
              <label htmlFor="demo-email" className={label}>
                {t.emailLabel}
              </label>
              <input
                id="demo-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="demo-company" className={label}>
                {t.companyLabel}
              </label>
              <input
                id="demo-company"
                name="company"
                required
                autoComplete="organization"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="demo-name" className={label}>
                {t.nameLabel}{" "}
                <span className="font-normal text-muted">({t.optional})</span>
              </label>
              <input
                id="demo-name"
                name="name"
                autoComplete="name"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="demo-role" className={label}>
                {t.roleLabel}{" "}
                <span className="font-normal text-muted">({t.optional})</span>
              </label>
              <input
                id="demo-role"
                name="role"
                placeholder={t.rolePlaceholder}
                autoComplete="organization-title"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="demo-size" className={label}>
                {t.sizeLabel}{" "}
                <span className="font-normal text-muted">({t.optional})</span>
              </label>
              <select id="demo-size" name="teamSize" defaultValue="" className={field}>
                <option value="">{t.sizePlaceholder}</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="demo-context" className={label}>
                {t.contextLabel}
              </label>
              <textarea
                id="demo-context"
                name="context"
                rows={3}
                placeholder={t.contextPlaceholder}
                className={field}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="sm:col-span-2 text-sm text-[var(--tone-danger-fg)]"
              >
                {error}
              </p>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? t.sending : t.cta}
              </Button>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {t.privacy}{" "}
                {privacy && (
                  <Link
                    href={legalPath(privacy, locale)}
                    className="text-brand underline-offset-4 hover:underline"
                  >
                    {t.privacyLink}
                  </Link>
                )}
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
