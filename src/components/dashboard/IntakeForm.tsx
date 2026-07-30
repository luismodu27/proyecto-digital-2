"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import {
  submitIntakeForm,
  type IntakeSubmitResult,
} from "@/lib/data/intake-actions";
import type { Dictionary } from "@/lib/i18n";

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

/**
 * Formulario PÚBLICO del enlace de intake: lo rellena alguien de la organización
 * del cliente que no tiene cuenta en Attesta (RRHH, Marketing, Soporte…).
 *
 * Deliberadamente corto: cinco campos y una nota. Cada campo extra reduce la
 * probabilidad de que alguien que no tiene ningún incentivo lo termine, y todo lo
 * demás (riesgo, evidencia, controles) lo completa después la organización.
 *
 * Tras enviar se agradece y se ofrece añadir otro, porque quien rellena esto suele
 * tener dos o tres herramientas en la cabeza.
 */
export function IntakeForm({
  token,
  t,
}: {
  token: string;
  t: Dictionary["intake"];
}) {
  const [result, setResult] = useState<IntakeSubmitResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      setResult(await submitIntakeForm(token, data));
    });
  }

  if (result?.ok) {
    return (
      <div className="rounded-2xl border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] p-8 text-center">
        <p className="font-display text-xl font-semibold text-[var(--tone-good-fg)]">
          {t.thanksTitle}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--tone-good-fg)]">
          {t.thanksBody}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => {
            setResult(null);
            setFormKey((k) => k + 1);
          }}
        >
          {t.addAnother}
        </Button>
      </div>
    );
  }

  return (
    <form
      key={formKey}
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-line bg-paper-raised p-6 sm:p-8"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          {t.nameLabel}
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={120}
          className={field}
          placeholder={t.namePlaceholder}
        />
        <p className="mt-1.5 text-xs text-muted">{t.nameHint}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-ink">
            {t.ownerLabel}
          </label>
          <input id="owner" name="owner" maxLength={200} className={field} placeholder={t.ownerPlaceholder} />
        </div>
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-ink">
            {t.domainLabel}
          </label>
          <input id="domain" name="domain" maxLength={200} className={field} placeholder={t.domainPlaceholder} />
        </div>
        <div>
          <label htmlFor="vendor" className="block text-sm font-medium text-ink">
            {t.vendorLabel}
          </label>
          <input id="vendor" name="vendor" maxLength={200} className={field} placeholder={t.vendorPlaceholder} />
        </div>
        <div>
          <label htmlFor="submitted_by" className="block text-sm font-medium text-ink">
            {t.byLabel}
          </label>
          <input id="submitted_by" name="submitted_by" maxLength={120} className={field} placeholder={t.byPlaceholder} />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-ink">
          {t.notesLabel}
        </label>
        <textarea id="notes" name="notes" rows={3} maxLength={1000} className={field} placeholder={t.notesPlaceholder} />
      </div>

      {result?.error && (
        <p
          role="alert"
          className="rounded-lg border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-3 py-2 text-sm text-[var(--tone-danger-fg)]"
        >
          {t.errors[result.error]}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full py-2.5">
        {pending ? t.sending : t.submit}
      </Button>
      <p className="text-center text-xs text-muted">{t.privacyNote}</p>
    </form>
  );
}
