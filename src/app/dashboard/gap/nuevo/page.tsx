import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getSystemsForSelect, isSupabaseConfigured } from "@/lib/data";
import { createGapItem } from "@/lib/data/actions";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

export default async function NuevaBrechaPage() {
  const systems = isSupabaseConfigured ? await getSystemsForSelect() : [];
  const t = getDictionary(await resolveLocale()).dashboard.gap;

  return (
    <>
      <PageHeader title={t.newTitle} subtitle={t.newSubtitle} />
      <div className="mb-5">
        <Link
          href="/dashboard/gap"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          {t.backToGap}
        </Link>
      </div>

      {!isSupabaseConfigured ? (
        <div className="max-w-xl rounded-2xl border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] p-6 text-sm text-[var(--tone-warn-fg)]">
          {t.newDemoNotice}
        </div>
      ) : systems.length === 0 ? (
        <div className="max-w-xl rounded-2xl border border-line bg-paper-raised p-6 text-sm text-ink-soft">
          {t.noSystems}
        </div>
      ) : (
        <form
          action={createGapItem}
          className="max-w-xl space-y-5 rounded-2xl border border-line bg-paper-raised p-6"
        >
          <div>
            <label htmlFor="systemId" className="block text-sm font-medium text-ink">
              {t.systemLabel}
            </label>
            <select id="systemId" name="systemId" required className={field} defaultValue="">
              <option value="" disabled>
                {t.systemPlaceholder}
              </option>
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="requirement" className="block text-sm font-medium text-ink">
              {t.requirementLabel}
            </label>
            <input
              id="requirement"
              name="requirement"
              required
              className={field}
              placeholder={t.requirementPlaceholder}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="article" className="block text-sm font-medium text-ink">
                {t.articleLabel}
              </label>
              <input id="article" name="article" className={field} placeholder={t.articlePlaceholder} />
            </div>
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-ink">
                {t.severityLabel}
              </label>
              <select id="severity" name="severity" className={field} defaultValue="media">
                <option value="alta">{t.severityAlta}</option>
                <option value="media">{t.severityMedia}</option>
                <option value="baja">{t.severityBaja}</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-ink">
                {t.statusLabel}
              </label>
              <select id="status" name="status" className={field} defaultValue="missing">
                <option value="missing">{t.status.missing}</option>
                <option value="partial">{t.status.partial}</option>
                <option value="done">{t.status.done}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText={t.createPending}>{t.createCta}</SubmitButton>
            <Link
              href="/dashboard/gap"
              className="inline-flex items-center justify-center rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper-sunken"
            >
              {t.cancel}
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
