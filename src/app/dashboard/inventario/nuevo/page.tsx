import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createAiSystem } from "@/lib/data/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

export default async function NuevoSistemaPage() {
  const t = getDictionary(await resolveLocale()).dashboard.inventory;
  return (
    <>
      <PageHeader title={t.newTitle} subtitle={t.newSubtitle} />
      <div className="mb-5">
        <Link
          href="/dashboard/inventario"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          {t.backToInventory}
        </Link>
      </div>

      {!isSupabaseConfigured ? (
        <div className="max-w-xl rounded-2xl border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] p-6 text-sm text-[var(--tone-warn-fg)]">
          {t.newDemoNotice}
        </div>
      ) : (
        <form action={createAiSystem} className="max-w-xl space-y-5 rounded-2xl border border-line bg-paper-raised p-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink">
              {t.nameLabel}
            </label>
            <input id="name" name="name" required className={field} placeholder={t.namePlaceholder} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-ink">
                {t.ownerLabel}
              </label>
              <input id="owner" name="owner" className={field} placeholder={t.ownerPlaceholder} />
            </div>
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-ink">
                {t.domainLabel}
              </label>
              <input id="domain" name="domain" className={field} placeholder={t.domainPlaceholder} />
            </div>
            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-ink">
                {t.vendorLabel}
              </label>
              <input id="vendor" name="vendor" className={field} placeholder={t.vendorPlaceholder} />
            </div>
            <div>
              <label htmlFor="actor_role" className="block text-sm font-medium text-ink">
                {t.roleLabel}
              </label>
              <select id="actor_role" name="actor_role" className={field} defaultValue="deployer">
                <option value="deployer">{t.roleDeployer}</option>
                <option value="provider">{t.roleProvider}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText={t.createPending}>{t.createCta}</SubmitButton>
            <Link
              href="/dashboard/inventario"
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
