import Link from "next/link";
import { PageHeader, StatCard, Meter } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { RiskDonut } from "@/components/dashboard/RiskDonut";
import { DeadlineReminders } from "@/components/dashboard/DeadlineReminders";
import { getAiSystems, getOrgJurisdictions, getActionTasks } from "@/lib/data";
import {
  avgCompliance,
  riskCounts,
  AUDIT_READY_THRESHOLD,
  isAuditReady,
} from "@/lib/mock-data";
import {
  upcomingDeadlines,
  daysUntil,
  affectedSystems,
  FRAMEWORK_META,
  type RegulatoryEvent,
} from "@/lib/regulatory-watch";

// El widget de "próximo hito" depende de la fecha actual.
export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const [systems, orgJur, tasks] = await Promise.all([
    getAiSystems(),
    getOrgJurisdictions(),
    getActionTasks(),
  ]);
  const counts = riskCounts(systems);
  const avg = avgCompliance(systems);
  const highRisk = counts.high + counts.unacceptable;
  const recent = [...systems]
    .sort((a, b) => a.compliance - b.compliance)
    .slice(0, 4);

  const now = new Date();
  // Respeta el nexo de jurisdicción: si está configurado, solo hitos de esas
  // jurisdicciones; si no, todos.
  const inNexus = (e: RegulatoryEvent) =>
    orgJur.length === 0 ||
    orgJur.includes(FRAMEWORK_META[e.framework]?.jurisdiction ?? "");
  const nextDeadline = upcomingDeadlines(now).filter(inNexus)[0];
  const nextDays = nextDeadline ? daysUntil(nextDeadline.date, now) : 0;
  const nextAffected = nextDeadline
    ? affectedSystems(nextDeadline, systems).length
    : 0;

  return (
    <>
      <PageHeader
        title="Resumen de gobernanza"
        subtitle="Estado de preparación de tus sistemas de IA en un vistazo."
        action={
          <ButtonLink href="/dashboard/informe" variant="outline">
            ⬇ Informe ejecutivo
          </ButtonLink>
        }
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sistemas de IA" value={systems.length} hint="en inventario" />
        <StatCard
          label="Alto riesgo"
          value={highRisk}
          hint="requieren obligaciones estrictas"
          accent="danger"
        />
        <StatCard
          label="Preparación media"
          value={`${avg}%`}
          hint={`objetivo ≥ ${AUDIT_READY_THRESHOLD}% para estar listo`}
          accent={isAuditReady(avg) ? "brand" : "warn"}
        />
        <StatCard label="Brechas abiertas" value={4} hint="ver gap assessment" accent="warn" />
      </section>

      <p className="mt-3 flex items-center gap-2 text-xs text-muted">
        <span className="inline-block h-3 w-0.5 rounded-full bg-ink/45" aria-hidden />
        La marca en las barras señala el objetivo orientativo de{" "}
        <span className="font-medium text-ink-soft">{AUDIT_READY_THRESHOLD}% listo</span>{" "}
        para considerar un sistema preparado para auditoría. No es un juicio de
        cumplimiento.
      </p>

      {nextDeadline && (
        <Link
          href="/dashboard/vigilancia"
          className="card-lift mt-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper-raised px-5 py-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
              <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden>
                <path
                  d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted">
                Próximo hito regulatorio ·{" "}
                {FRAMEWORK_META[
                  nextDeadline.framework as RegulatoryEvent["framework"]
                ]?.short ?? nextDeadline.framework}
              </p>
              <p className="truncate text-sm font-medium text-ink">
                {nextDeadline.title}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-ink">
                {nextDays === 0
                  ? "hoy"
                  : `en ${nextDays} ${nextDays === 1 ? "día" : "días"}`}
              </p>
              <p className="text-xs text-muted">
                {nextAffected} {nextAffected === 1 ? "sistema" : "sistemas"}
              </p>
            </div>
            <span className="text-brand transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </div>
        </Link>
      )}

      <DeadlineReminders tasks={tasks} now={now} />

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="card-lift rounded-2xl border border-line bg-paper-raised p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Distribución de riesgo
          </h2>
          <div className="mt-6">
            <RiskDonut counts={counts} />
          </div>
        </div>

        <div className="card-lift rounded-2xl border border-line bg-paper-raised p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">
              Requieren atención
            </h2>
            <Link
              href="/dashboard/inventario"
              className="text-sm font-medium text-brand hover:text-brand-strong"
            >
              Ver todos →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-line-strong px-4 py-8 text-center">
              <p className="text-sm font-medium text-ink">
                Nada que requiera atención
              </p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-ink-soft">
                Cuando registres sistemas de IA, aquí verás los que necesitan
                revisión o tienen menor preparación.
              </p>
              <Link
                href="/dashboard/inventario/nuevo"
                className="mt-3 inline-block text-xs font-semibold text-brand hover:text-brand-strong"
              >
                + Registrar sistema
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-muted">{s.owner}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="w-24">
                      <Meter value={s.compliance} target={AUDIT_READY_THRESHOLD} />
                    </div>
                    <RiskBadge level={s.risk} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
