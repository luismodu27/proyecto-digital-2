"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  createIntakeLink,
  discardIntakeSubmission,
  acceptIntakeSubmission,
  revokeIntakeLink,
} from "@/lib/data/intake-actions";
import type { IntakeLink, IntakeSubmission } from "@/lib/intake/types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { formatDateTime } from "@/lib/date";

/**
 * Gestión del intake compartible: emitir enlaces, revocarlos y revisar la bandeja.
 *
 * Es cliente por una sola razón real: **copiar el enlace al portapapeles**. Sin
 * ese botón, el flujo obliga a seleccionar a mano una URL con un token de 32
 * caracteres, que es exactamente donde la gente se equivoca y acaba compartiendo
 * un enlace roto. Las escrituras siguen siendo Server Actions.
 *
 * La URL se compone en el navegador con `window.location.origin`, así que funciona
 * igual en local, en preview de Vercel y en el dominio final sin depender de una
 * variable de entorno más.
 */
export function IntakeManager({
  links,
  submissions,
  t,
  locale,
}: {
  links: IntakeLink[];
  submissions: IntakeSubmission[];
  t: Dictionary["dashboard"]["inventory"]["intake"];
  locale: Locale;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(token: string) {
    const url = `${window.location.origin}/intake/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(token);
      window.setTimeout(() => setCopied(null), 2500);
    } catch {
      // Sin permiso de portapapeles (o http sin localhost): se muestra la URL
      // en un prompt para que al menos se pueda copiar a mano.
      window.prompt(t.copyFallback, url);
    }
  }

  return (
    <div className="space-y-6">
      {/* ---- Bandeja: lo primero, porque es lo que exige acción ---- */}
      {submissions.length > 0 && (
        <section className="rounded-2xl border border-brand/40 bg-paper-raised p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t.inboxTitle.replace("{n}", String(submissions.length))}
          </h2>
          <p className="mt-1 text-xs text-muted">{t.inboxHint}</p>

          <ul className="mt-4 space-y-3">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-line bg-paper p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{s.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {[s.owner, s.domain, s.vendor].filter(Boolean).join(" · ") ||
                        t.noDetails}
                    </p>
                    {s.notes && (
                      <p className="mt-2 text-xs text-ink-soft">{s.notes}</p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      {s.submittedBy
                        ? t.from.replace("{who}", s.submittedBy)
                        : t.fromAnonymous}
                      {s.linkLabel ? ` · ${s.linkLabel}` : ""} ·{" "}
                      {formatDateTime(s.createdAt, locale, "—")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={acceptIntakeSubmission}>
                      <input type="hidden" name="id" value={s.id} />
                      <SubmitButton className="px-3 py-1.5 text-xs" pendingText={t.accepting}>
                        {t.accept}
                      </SubmitButton>
                    </form>
                    <form action={discardIntakeSubmission}>
                      <input type="hidden" name="id" value={s.id} />
                      <SubmitButton
                        variant="outline"
                        className="px-3 py-1.5 text-xs"
                        pendingText={t.discarding}
                      >
                        {t.discard}
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- Emitir un enlace ---- */}
      <section className="rounded-2xl border border-line bg-paper-raised p-6">
        <h2 className="font-display text-lg font-semibold text-ink">{t.title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">{t.subtitle}</p>

        <form action={createIntakeLink} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-50 flex-1">
            <label htmlFor="label" className="block text-xs font-medium text-ink">
              {t.labelLabel}
            </label>
            <input
              id="label"
              name="label"
              maxLength={80}
              placeholder={t.labelPlaceholder}
              className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
            />
          </div>
          <SubmitButton pendingText={t.creating}>{t.create}</SubmitButton>
        </form>

        {links.length === 0 ? (
          <p className="mt-5 text-sm text-muted">{t.empty}</p>
        ) : (
          <ul className="mt-5 divide-y divide-line/60">
            {links.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {l.label || t.untitled}
                    {!l.active && (
                      <span className="ml-2 rounded-full bg-paper-sunken px-2 py-0.5 text-xs font-normal text-muted">
                        {l.revokedAt ? t.stateRevoked : t.stateExpired}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {t.linkMeta
                      .replace("{n}", String(l.submissions))
                      .replace("{max}", String(l.maxSubmissions))
                      .replace("{expires}", formatDateTime(l.expiresAt, locale, "—"))}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {l.active && (
                    <button
                      type="button"
                      onClick={() => copy(l.token)}
                      className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper-sunken"
                    >
                      {copied === l.token ? t.copied : t.copy}
                    </button>
                  )}
                  {!l.revokedAt && (
                    <form action={revokeIntakeLink}>
                      <input type="hidden" name="id" value={l.id} />
                      <SubmitButton
                        variant="ghost"
                        className="px-3 py-1.5 text-xs"
                        pendingText={t.revoking}
                      >
                        {t.revoke}
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
