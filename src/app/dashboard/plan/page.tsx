import { PageHeader } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { RecommendationCard } from "@/components/dashboard/Recommendations";
import { getAiSystems, getGapItems } from "@/lib/data";
import { buildActionPlan, type Priority } from "@/lib/recommendations";

export default async function PlanPage() {
  const [systems, gaps] = await Promise.all([getAiSystems(), getGapItems()]);
  const plan = buildActionPlan(systems, gaps);

  const counts: Record<Priority, number> = {
    crítica: plan.filter((r) => r.priority === "crítica").length,
    alta: plan.filter((r) => r.priority === "alta").length,
    media: plan.filter((r) => r.priority === "media").length,
  };

  return (
    <>
      <PageHeader
        title="Plan de acción"
        subtitle="Puntos críticos y recomendaciones priorizadas para cerrar tus brechas de cumplimiento."
        action={
          <ButtonLink href="/dashboard/gap/informe" variant="outline">
            ⬇ Exportar evidencia
          </ButtonLink>
        }
      />

      {plan.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-paper-raised px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Sin acciones pendientes
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Cuando registres sistemas y clasifiques su riesgo, aquí verás un plan
            priorizado de qué mejorar primero.
          </p>
          <div className="mt-6">
            <ButtonLink href="/dashboard/riesgo/evaluar" variant="primary">
              Evaluar un sistema
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {(["crítica", "alta", "media"] as Priority[]).map((p) => (
              <div key={p} className="rounded-2xl border border-line bg-paper-raised p-5">
                <p className="font-display text-3xl font-semibold text-ink">
                  {counts[p]}
                </p>
                <p className="mt-1 text-xs capitalize text-muted">
                  prioridad {p}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {plan.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>

          <p className="mt-6 text-xs text-muted">
            Recomendaciones generadas a partir de tus brechas abiertas y niveles de
            riesgo. Attesta ofrece orientación de compliance, no asesoría legal.
          </p>
        </>
      )}
    </>
  );
}
