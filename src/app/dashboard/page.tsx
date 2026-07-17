import Link from "next/link";
import { PageHeader, StatCard, Meter } from "@/components/dashboard/parts";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { RiskDonut } from "@/components/dashboard/RiskDonut";
import { getAiSystems } from "@/lib/data";
import { avgCompliance, riskCounts } from "@/lib/mock-data";

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
