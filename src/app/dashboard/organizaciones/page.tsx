import { PageHeader } from "@/components/dashboard/parts";
import { getUserOrgs } from "@/lib/data";
import { getActiveOrg } from "@/lib/data/context";
import { getOrgPlan, type PlanTier } from "@/lib/billing/plan";
import { switchOrg } from "@/lib/data/org-actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";
import { NewEntityForm } from "@/components/dashboard/NewEntityForm";

export const dynamic = "force-dynamic";

const PLAN_TONE: Record<PlanTier, string> = {
  enterprise:
    "border-brand bg-brand-soft text-brand-strong",
  preparacion:
    "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)]",
  free: "border-line-strong bg-paper-sunken text-muted",
};

export default async function OrganizacionesPage() {
  const locale = await resolveLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.organizations;
  const tierLabel = dict.dashboard.billing.tier;

  const [orgs, activeOrgId] = await Promise.all([getUserOrgs(), getActiveOrg()]);
  // Plan efectivo por organización (se aplica por-org, no por usuario).
  const plans = await Promise.all(orgs.map((o) => getOrgPlan(o.id)));

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {orgs.length === 0 ? (
        <div className="rounded-2xl border border-line bg-paper-raised p-6">
          <p className="text-sm text-ink-soft">{t.emptyDemo}</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* Portfolio de entidades */}
          <div className="rounded-2xl border border-line bg-paper-raised p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              {t.listTitle}
            </h2>
            <p className="mt-1 text-sm text-muted">{t.listSubtitle}</p>
            <ul className="mt-5 space-y-3">
              {orgs.map((o, i) => {
                const isActive = o.id === activeOrgId;
                const plan = plans[i];
                return (
                  <li
                    key={o.id}
                    className={`rounded-xl border p-4 ${
                      isActive
                        ? "border-brand bg-brand-soft/20"
                        : "border-line bg-paper"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">
                        {o.name}
                      </span>
                      {isActive && (
                        <span className="rounded-full border border-brand bg-brand px-2 py-0.5 text-xs font-medium text-white">
                          {t.activeBadge}
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${PLAN_TONE[plan]}`}
                      >
                        {tierLabel[plan]}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-muted">
                        {t.roleLabel}: {t.roles[o.role]}
                      </span>
                      {!isActive && (
                        <form action={switchOrg}>
                          <input type="hidden" name="orgId" value={o.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-paper-sunken"
                          >
                            {t.switchCta}
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Crear una nueva entidad */}
          {isSupabaseConfigured && (
            <div className="rounded-2xl border border-line bg-paper-raised p-6">
              <h2 className="font-display text-lg font-semibold text-ink">
                {t.createTitle}
              </h2>
              <p className="mt-1 text-sm text-muted">{t.createSubtitle}</p>
              <NewEntityForm
                t={{
                  nameLabel: t.nameLabel,
                  namePlaceholder: t.namePlaceholder,
                  createCta: t.createCta,
                  creatingCta: t.creatingCta,
                  createdToast: t.createdToast,
                }}
                friendlyErrors={dict.auth.friendlyErrors}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
