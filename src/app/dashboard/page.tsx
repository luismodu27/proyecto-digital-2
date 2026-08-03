import { Suspense } from "react";
import Link from "next/link";
import { PageHeader, StatCard, Meter } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { LegalNote, LEGAL_FOOTER_BY_LOCALE } from "@/components/ui/LegalNote";
import { RiskDonut } from "@/components/dashboard/RiskDonut";
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";
import {
  ActivationChecklist,
  ChecklistSkeleton,
  MilestoneSkeleton,
  NextMilestone,
  OpenGapsStat,
  RemindersSkeleton,
  ReviewSection,
  StatSkeleton,
  TaskDeadlines,
} from "@/components/dashboard/overview/sections";
import {
  getAiSystems,
  getOrgJurisdictions,
  getOrganizationName,
  getRegulatoryEvents,
  isSupabaseConfigured,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/data/context";
import {
  avgCompliance,
  riskCounts,
  AUDIT_READY_THRESHOLD,
  isAuditReady,
  riskLabel,
} from "@/lib/mock-data";
import {
  upcomingDeadlines,
  daysUntil,
  FRAMEWORK_META,
  type RegulatoryEvent,
} from "@/lib/regulatory-watch";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

// El widget de "próximo hito" depende de la fecha actual.
export const dynamic = "force-dynamic";

/**
 * Resumen del dashboard, en dos velocidades.
 *
 * ANTES: un solo `Promise.all` de diez consultas y **nada** en pantalla hasta
 * que volvía la más lenta. Una brecha lenta retrasaba los KPIs, el donut y la
 * cabecera, que no dependen de ella.
 *
 * AHORA solo se espera el CAMINO CRÍTICO —el inventario, el usuario y el nombre
 * de la organización— porque de ahí salen la decisión de enseñar la bienvenida,
 * la cabecera, tres de los cuatro KPIs, el donut de riesgo y "requieren
 * atención". Todo lo demás baja por `<Suspense>` y aparece cuando llega.
 *
 * El inventario **no** se puede transmitir: decide si esta página es un panel o
 * una bienvenida, y eso no puede resolverse a medias. Los bloques que lo
 * necesitan lo reciben por props, no lo vuelven a pedir.
 */
export default async function DashboardOverview() {
  const [systems, user, orgName] = await Promise.all([
    getAiSystems(),
    getCurrentUser(),
    getOrganizationName(),
  ]);

  const locale = await resolveLocale();
  const d = getDictionary(locale).dashboard;
  const o = d.overview;
  const now = new Date();

  // Nombre de pila para el saludo (solo si hay un nombre real en el perfil; no
  // usamos el prefijo del email para no mostrar algo poco natural).
  const meta = user?.user_metadata as
    | { full_name?: string; name?: string }
    | undefined;
  const firstName =
    (meta?.full_name ?? meta?.name)?.trim().split(/\s+/)[0] ?? null;

  // Cuenta sin sistemas todavía: en vez de widgets en cero (distribución vacía,
  // "requieren atención"), damos una bienvenida cálida con la misión y los
  // caminos para empezar.
  //
  // Esta rama SÍ espera el radar: la bienvenida enseña un único dato —el
  // próximo hito— y transmitirlo dejaría un hueco parpadeando en el centro de
  // la primera pantalla que ve alguien. Es una consulta, y solo aquí.
  if (systems.length === 0) {
    const [regEvents, orgJur] = await Promise.all([
      getRegulatoryEvents(),
      getOrgJurisdictions(),
    ]);
    const inNexus = (e: RegulatoryEvent) =>
      orgJur.length === 0 ||
      orgJur.includes(FRAMEWORK_META[e.framework]?.jurisdiction ?? "");
    const next = upcomingDeadlines(now, regEvents).filter(inNexus)[0];
    return (
      <>
        <PageHeader title={o.title} subtitle={o.subtitleStart} />
        <DashboardWelcome
          name={firstName}
          orgName={orgName}
          canSeed={isSupabaseConfigured}
          deadline={
            next ? { title: next.title, days: daysUntil(next.date, now) } : null
          }
          t={d.welcome}
          units={d.units}
        />
      </>
    );
  }

  const counts = riskCounts(systems);
  const avg = avgCompliance(systems);
  const highRisk = counts.high + counts.unacceptable;
  const recent = [...systems]
    .sort((a, b) => a.compliance - b.compliance)
    .slice(0, 4);

  return (
    <>
      <PageHeader
        title={o.title}
        subtitle={o.subtitle}
        action={
          <ButtonLink href="/dashboard/informe" variant="outline">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
              <path
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {o.executiveReport}
          </ButtonLink>
        }
      />

      <Suspense fallback={<ChecklistSkeleton />}>
        <ActivationChecklist systems={systems} userId={user?.id} />
      </Suspense>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={o.stat.systems}
          value={systems.length}
          hint={o.stat.systemsHint}
          href="/dashboard/inventario"
        />
        {/* Las cuatro tarjetas son navegables. "Alto riesgo" lleva al inventario
            YA FILTRADO por ese nivel (Sprint 4): la tarjeta enseña un número y
            el destino enseña exactamente las filas que lo componen, que es lo
            que uno espera al pulsarla. "% listo" va a las brechas, que es lo que
            mueve ese número. */}
        <StatCard
          label={o.stat.highRisk}
          value={highRisk}
          hint={o.stat.highRiskHint}
          accent="warn"
          href="/dashboard/inventario?risk=high"
        />
        <StatCard
          label={o.stat.avgReadiness}
          value={`${avg}%`}
          hint={`${o.stat.avgReadinessHintBefore}${AUDIT_READY_THRESHOLD}${o.stat.avgReadinessHintAfter}`}
          accent={isAuditReady(avg) ? "brand" : "warn"}
          href="/dashboard/gap"
        />
        {/* La única de las cuatro que no sale del inventario. */}
        <Suspense fallback={<StatSkeleton />}>
          <OpenGapsStat />
        </Suspense>
      </section>

      <p className="mt-3 flex items-center gap-2 text-xs text-muted">
        <span
          className="inline-block h-3 w-0.5 rounded-full bg-ink/45"
          aria-hidden
        />
        {o.meterNoteBefore}
        <span className="font-medium text-ink-soft">
          {AUDIT_READY_THRESHOLD}
          {o.meterNoteReady}
        </span>
        {o.meterNoteAfter}
      </p>

      <Suspense fallback={<MilestoneSkeleton />}>
        <NextMilestone systems={systems} now={now} />
      </Suspense>

      <Suspense fallback={<RemindersSkeleton />}>
        <TaskDeadlines now={now} />
      </Suspense>

      <Suspense fallback={<RemindersSkeleton />}>
        <ReviewSection systems={systems} now={now} />
      </Suspense>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="card-lift rounded-2xl border border-line bg-paper-raised p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            {o.riskDistribution}
          </h2>
          <div className="mt-6">
            <RiskDonut
              counts={counts}
              labels={d.risk.labels}
              systemsLabel={d.risk.systems}
            />
          </div>
        </div>

        <div className="card-lift rounded-2xl border border-line bg-paper-raised p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">
              {o.needAttention}
            </h2>
            <Link
              href="/dashboard/inventario"
              className="text-sm font-medium text-brand hover:text-brand-strong"
            >
              {o.viewAll}
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-line-strong px-4 py-8 text-center">
              <p className="text-sm font-medium text-ink">
                {o.emptyAttentionTitle}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-ink-soft">
                {o.emptyAttentionBody}
              </p>
              <Link
                href="/dashboard/inventario/nuevo"
                className="mt-3 inline-block text-xs font-semibold text-brand hover:text-brand-strong"
              >
                {o.registerSystem}
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted">{s.owner}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="w-24">
                      <Meter
                        value={s.compliance}
                        target={AUDIT_READY_THRESHOLD}
                      />
                    </div>
                    <RiskBadge
                      level={s.risk}
                      label={riskLabel(s.risk, locale)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <LegalNote
        text={`${o.legalNote} ${LEGAL_FOOTER_BY_LOCALE[locale]}`}
        className="mt-6"
      />
    </>
  );
}
