import Link from "next/link";
import { PageHeader, StatCard, Meter } from "@/components/dashboard/parts";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { getAiSystems } from "@/lib/data";
import {
  RISK_LABEL,
  RISK_ORDER,
  avgCompliance,
  riskCounts,
  type RiskLevel,
} from "@/lib/mock-data";

const RISK_COLOR: Record<RiskLevel, string> = {
  unacceptable: "#b4322a",
  high: "#c9761f",
  limited: "#b0824a",
  minimal: "#0b6b4e",
};

export default async function DashboardOverview() {
  const systems = await getAiSystems();
  const counts = riskCounts(systems);
  const avg = avgCompliance(systems);
  const highRisk = counts.high + counts.unacceptable;
  const recent = [...systems]
    .sort((a, b) => a.compliance - b.compliance)
    .slice(0, 4);

  return (
    <>
      <PageHeader
        title="Resumen de gobernanza"
        subtitle="Estado de preparación de tus sistemas de IA en un vistazo."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sistemas de IA" value={systems.length} hint="en inventario" />
        <StatCard
          label="Alto riesgo"
          value={highRisk}
          hint="requieren obligaciones estrictas"
          accent="danger"
        />
        <StatCard label="Preparación media" value={`${avg}%`} hint="% listo para auditoría" accent={avg >= 60 ? "brand" : "warn"} />
        <StatCard label="Brechas abiertas" value={4} hint="ver gap assessment" accent="warn" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-line bg-paper-raised p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Distribución de riesgo
          </h2>
          <ul className="mt-5 space-y-4">
            {RISK_ORDER.map((level) => {
              const n = counts[level];
              const pct = systems.length
                ? Math.round((n / systems.length) * 100)
                : 0;
              return (
                <li key={level} className="flex items-center gap-4">
                  <span className="w-32 shrink-0 text-sm text-ink-soft">
                    {RISK_LABEL[level]}
                  </span>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-paper-sunken">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: RISK_COLOR[level],
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm tabular-nums text-ink">
                    {n}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-paper-raised p-6">
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
          <ul className="mt-4 divide-y divide-line">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                  <p className="text-xs text-muted">{s.owner}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="w-24">
                    <Meter value={s.compliance} />
                  </div>
                  <RiskBadge level={s.risk} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
