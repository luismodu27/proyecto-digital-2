import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/Button";
import { getActiveOrg } from "@/lib/data/context";
import { getOrgSubscription } from "@/lib/billing/subscription";
import { getOrgPlan } from "@/lib/billing/plan";
import { startCheckout, openBillingPortal } from "@/lib/billing/actions";
import { PLAN_PRICE_LABEL, isStripeConfigured } from "@/lib/stripe/config";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null, locale: Locale): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function FacturacionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const locale = await resolveLocale();
  const t = getDictionary(locale).dashboard.billing;
  const orgId = await getActiveOrg();
  const [sub, plan] = await Promise.all([
    orgId ? getOrgSubscription(orgId) : Promise.resolve(null),
    orgId ? getOrgPlan(orgId) : Promise.resolve("free" as const),
  ]);
  const hasStripeSub = sub?.status === "active" || sub?.status === "trialing";
  // "Desbloqueado" = alcanza Preparación o más (por Stripe, plan manual o Enterprise).
  const unlocked = plan === "preparacion" || plan === "enterprise";
  const isEnterprise = plan === "enterprise";

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {estado === "ok" && (
        <div className="mb-6 rounded-xl border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] px-4 py-3 text-sm text-[var(--tone-good-fg)]">
          {t.okBanner}
        </div>
      )}
      {estado === "cancelado" && (
        <div className="mb-6 rounded-xl border border-line bg-paper-sunken px-4 py-3 text-sm text-ink-soft">
          {t.canceledBanner}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Estado actual */}
        <div className="rounded-2xl border border-line bg-paper-raised p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">
              {t.planPrefix}{t.tier[plan]}
            </h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                unlocked
                  ? "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)]"
                  : "border-line-strong bg-paper-sunken text-muted"
              }`}
            >
              {hasStripeSub
                ? t.status[sub!.status as keyof typeof t.status] ??
                  t.badgeActiveFallback
                : isEnterprise
                  ? t.badgeEnterprise
                  : unlocked
                    ? t.badgeUnlocked
                    : t.badgeFree}
            </span>
          </div>

          {unlocked ? (
            <>
              {hasStripeSub ? (
                <>
                  <p className="mt-2 text-sm text-ink-soft">
                    {sub?.cancelAtPeriodEnd
                      ? `${t.willCancelBefore}${fmtDate(sub.currentPeriodEnd, locale)}${t.willCancelAfter}`
                      : `${t.renewsBefore}${fmtDate(sub?.currentPeriodEnd ?? null, locale)}${t.renewsAfter}`}
                  </p>
                  <form action={openBillingPortal} className="mt-5">
                    <Button type="submit" variant="outline">
                      {t.manageSubscription}
                    </Button>
                  </form>
                  <p className="mt-3 text-xs text-muted">
                    {t.portalHint}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-ink-soft">
                  {isEnterprise ? t.enterpriseBody : t.unlockedBody}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink-soft">
                {t.freeBody}
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold text-ink">
                  {PLAN_PRICE_LABEL}
                </span>
                <span className="text-sm text-muted">{t.perMonth}</span>
              </div>
              {isStripeConfigured ? (
                <form action={startCheckout} className="mt-5">
                  <Button type="submit" className="w-full sm:w-auto">
                    {t.subscribeCta}
                  </Button>
                </form>
              ) : (
                <p className="mt-5 rounded-lg border border-line bg-paper-sunken px-4 py-3 text-sm text-muted">
                  {t.checkoutInactive}
                </p>
              )}
            </>
          )}
        </div>

        {/* Qué incluye */}
        <div className="rounded-2xl border border-line bg-paper-raised p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t.includesTitle}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink">
                <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden>
                  <path
                    d="m3.5 8.5 3 3 6-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-muted">
            {t.enterpriseHint}
          </p>
        </div>
      </div>

      {/* Exportación de datos (portabilidad) */}
      <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink">
              {t.exportTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              {t.exportBodyBefore}
              <span className="font-medium">{t.exportBodyJson}</span>
              {t.exportBodyAfter}
            </p>
          </div>
          <a
            href="/api/export"
            download
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
              <path
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t.downloadJson}
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">
          {t.exportNote}
        </p>
      </div>
    </>
  );
}
