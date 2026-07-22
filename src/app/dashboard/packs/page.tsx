import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/Button";
import { LegalNote, LEGAL_FOOTER_BY_LOCALE } from "@/components/ui/LegalNote";
import { getSystemsForSelect, isSupabaseConfigured } from "@/lib/data";
import { applyPolicyPack } from "@/lib/data/actions";
import { policyPacks, type PolicySeverity } from "@/lib/policy-packs";
import { severityLabel, type GapSeverity } from "@/lib/mock-data";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

const severityCls: Record<PolicySeverity, string> = {
  alta: "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  media: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  baja: "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

export default async function PolicyPacksPage() {
  const systems = isSupabaseConfigured ? await getSystemsForSelect() : [];
  const locale = await resolveLocale();
  const t = getDictionary(locale).dashboard.pages.packsPage;
  // La fachada de packs sirve el contenido validado en el idioma de la UI.
  const packs = policyPacks(locale);

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="space-y-6">
        {packs.map((pack) => (
          <article
            key={pack.id}
            className="rounded-2xl border border-line bg-paper-raised p-6"
          >
            <div className="flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong">
                  {pack.tag}
                </span>
                <h2 className="mt-2 font-display text-xl font-semibold text-ink">
                  {pack.name}
                </h2>
                <p className="mt-1 max-w-xl text-sm text-ink-soft">{pack.summary}</p>
                {pack.note && (
                  <p className="mt-2 max-w-xl text-xs text-muted">{pack.note}</p>
                )}
              </div>
              <span className="shrink-0 text-sm text-muted">
                {pack.controls.length} {t.controlsUnit}
              </span>
            </div>

            <ul className="mt-5 space-y-3">
              {pack.controls.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 rounded-xl border border-line bg-paper p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-medium text-seal">
                        {c.article}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${severityCls[c.severity]}`}
                      >
                        {severityLabel(c.severity as GapSeverity, locale)}
                      </span>
                    </div>
                    <p className="mt-1.5 font-medium text-ink">{c.title}</p>
                    <p className="text-sm text-ink-soft">{c.description}</p>
                    {c.conditional && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted">
                        <svg
                          viewBox="0 0 24 24"
                          className="mt-0.5 size-3.5 shrink-0"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M12 8v4m0 4h.01M12 3l9 16H3L12 3Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>
                          <span className="font-medium">{t.applies}</span>{" "}
                          {c.conditional}
                        </span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Aplicar */}
            <div className="mt-6 border-t border-line pt-6">
              {isSupabaseConfigured ? (
                systems.length > 0 ? (
                  <form
                    action={applyPolicyPack}
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                  >
                    <input type="hidden" name="packId" value={pack.id} />
                    <div className="flex-1">
                      <label
                        htmlFor={`systemId-${pack.id}`}
                        className="block text-sm font-medium text-ink"
                      >
                        {t.applyToSystem}
                      </label>
                      <select
                        id={`systemId-${pack.id}`}
                        name="systemId"
                        required
                        className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
                      >
                        <option value="">{t.selectSystem}</option>
                        {systems.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit">{t.applyButton}</Button>
                  </form>
                ) : (
                  <p className="text-sm text-ink-soft">{t.needSystem}</p>
                )
              ) : (
                <p className="text-sm text-ink-soft">{t.demoNote}</p>
              )}
            </div>
          </article>
        ))}
      </div>

      <LegalNote
        text={`${t.legalPrefix} ${LEGAL_FOOTER_BY_LOCALE[locale]}`}
        className="mt-6"
      />
    </>
  );
}
