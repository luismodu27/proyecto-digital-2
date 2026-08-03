import { PageHeader } from "@/components/dashboard/parts";
import { LegalNote, LEGAL_FOOTER_BY_LOCALE } from "@/components/ui/LegalNote";
import { SupplierCard } from "@/components/dashboard/SupplierCard";
import { getSuppliers, getSupplierEvidence } from "@/lib/data";
import { createSupplier } from "@/lib/data/supplier-actions";
import {
  ART25_TRIGGERS,
  coverage,
  expiringEvidence,
} from "@/lib/suppliers/evidence";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

// Lleva aviso de vencimiento del certificado del Art. 44, que depende de hoy.
export const dynamic = "force-dynamic";

const FIELD =
  "mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

export default async function ProveedoresPage() {
  const [suppliers, evidence] = await Promise.all([
    getSuppliers(),
    getSupplierEvidence(),
  ]);
  const locale = await resolveLocale();
  const t = getDictionary(locale).dashboard.pages.suppliers;

  const now = new Date();
  const c = coverage(evidence);
  const expiring = expiringEvidence(evidence, now);

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {/* Encuadre temporal: hoy esto es preparación contractual, porque las
          obligaciones de importador y distribuidor tampoco son exigibles aún. */}
      <p className="rounded-2xl border border-line bg-paper-raised px-5 py-3 text-xs leading-relaxed text-ink-soft">
        {t.legalFrame}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            [suppliers.length, t.statSuppliers, false],
            [c.covered, t.statCovered, false],
            [c.pending, t.statPending, false],
            [c.refused, t.statRefused, c.refused > 0],
          ] as [number, string, boolean][]
        ).map(([value, label, alert]) => (
          <div key={label} className="rounded-2xl border border-line bg-paper-raised p-4">
            <p
              className={`font-display text-2xl font-semibold ${
                alert ? "text-[var(--tone-warn-fg)]" : "text-ink"
              }`}
            >
              {value}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Único vencimiento real del catálogo. */}
      {expiring.length > 0 && (
        <ul className="mt-4 space-y-2">
          {expiring.map(({ item, daysLeft }) => (
            <li
              key={item.id}
              className="rounded-2xl border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] px-5 py-3 text-xs font-medium text-[var(--tone-warn-fg)]"
            >
              {daysLeft < 0 ? t.certExpired : t.certWarning} · {item.expiresOn}
            </li>
          ))}
        </ul>
      )}

      {/* Alta */}
      <details className="mt-6 rounded-2xl border border-line bg-paper-raised">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-medium text-ink">{t.addSupplier}</span>
          <span className="text-xs text-muted">{t.addSupplierHint}</span>
        </summary>
        <form
          action={createSupplier}
          className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-2"
        >
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-muted">{t.fieldName}</span>
            <input name="name" required placeholder={t.fieldNamePlaceholder} className={FIELD} />
          </label>
          <label>
            <span className="text-xs font-medium text-muted">{t.fieldCountry}</span>
            <input name="country" className={FIELD} />
          </label>
          <label>
            <span className="text-xs font-medium text-muted">{t.fieldRole}</span>
            <select name="aiActRole" defaultValue="unknown" className={FIELD}>
              {(Object.keys(t.roles) as (keyof typeof t.roles)[]).map((r) => (
                <option key={r} value={r}>
                  {t.roles[r]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-medium text-muted">{t.fieldGdprRole}</span>
            <select name="gdprRole" defaultValue="unknown" className={FIELD}>
              {(Object.keys(t.gdprRoles) as (keyof typeof t.gdprRoles)[]).map((r) => (
                <option key={r} value={r}>
                  {t.gdprRoles[r]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-medium text-muted">{t.fieldContact}</span>
            <input name="contact" className={FIELD} />
          </label>
          <label className="flex items-start gap-2 rounded-lg border border-line bg-paper px-3 py-2.5 sm:col-span-2">
            <input
              type="checkbox"
              name="outsideEu"
              className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
            />
            <span>
              <span className="block text-sm text-ink">{t.flagOutsideEu}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                {t.flagOutsideEuHint}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 rounded-lg border border-line bg-paper px-3 py-2.5 sm:col-span-2">
            <input
              type="checkbox"
              name="excludesHighRiskUse"
              className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
            />
            <span>
              <span className="block text-sm text-ink">{t.flagExcludesHighRisk}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                {t.flagExcludesHighRiskHint}
              </span>
            </span>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t.create}
            </button>
          </div>
        </form>
      </details>

      {/* Aviso que ahorra una discusión inútil con el proveedor. */}
      <p className="mt-4 rounded-2xl border border-line bg-paper-raised px-5 py-3 text-xs leading-relaxed text-muted">
        {t.noNotifiedBody}
      </p>

      {suppliers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-paper-raised px-6 py-12 text-center">
          <p className="font-display text-lg font-semibold text-ink">{t.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {suppliers.map((s) => (
            <SupplierCard
              key={s.id}
              supplier={s}
              evidence={evidence.filter((e) => e.supplierId === s.id)}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Art. 25: se avisa, no se dictamina. */}
      <section className="mt-10 rounded-2xl border border-line bg-paper-raised px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">{t.art25Title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-soft">{t.art25Note}</p>
        <ul className="mt-3 space-y-2">
          {ART25_TRIGGERS.map((trig) => (
            <li
              key={trig.key}
              className="flex items-start gap-2 rounded-lg border border-line bg-paper px-3 py-2"
            >
              <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--tone-warn-fg)]" />
              <span className="min-w-0 text-sm text-ink">
                {t.art25[trig.key as keyof typeof t.art25]}
                <span className="ml-1.5 whitespace-nowrap text-[11px] text-muted">
                  {trig.article}
                </span>
                {trig.contractualCarveOut && (
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                    {t.art25CarveOut}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-3xl text-xs font-medium leading-relaxed text-[var(--tone-warn-fg)]">
          {t.art25Outcome}
        </p>
      </section>

      <LegalNote className="mt-8" text={LEGAL_FOOTER_BY_LOCALE[locale]} />
    </>
  );
}
