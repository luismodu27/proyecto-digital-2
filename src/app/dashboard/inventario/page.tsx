import { PageHeader, Meter } from "@/components/dashboard/parts";
import { Button, ButtonLink } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { getAiSystems, isSupabaseConfigured } from "@/lib/data";
import { seedSampleData } from "@/lib/data/actions";

export default async function InventarioPage() {
  const systems = await getAiSystems();

  return (
    <>
      <PageHeader
        title="Inventario de sistemas de IA"
        subtitle="Cada modelo y sistema en uso, con su propietario, proveedor y estado."
        action={
          <ButtonLink href="/dashboard/inventario/nuevo" variant="primary">
            + Registrar sistema
          </ButtonLink>
        }
      />

      {systems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-paper-raised px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Tu inventario está vacío
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Registra tu primer sistema de IA, o carga un conjunto de datos de
            ejemplo para explorar Attesta con contenido.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/dashboard/inventario/nuevo" variant="primary">
              + Registrar sistema
            </ButtonLink>
            {isSupabaseConfigured && (
              <form action={seedSampleData}>
                <Button type="submit" variant="outline">
                  Cargar datos de ejemplo
                </Button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Sistema</th>
                  <th className="px-5 py-3 font-medium">Dominio</th>
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 font-medium">Riesgo</th>
                  <th className="px-5 py-3 font-medium">Cumplimiento</th>
                  <th className="px-5 py-3 font-medium">Última revisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {systems.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-paper-sunken/50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{s.name}</p>
                      <p className="font-mono text-xs text-muted">
                        {s.id} · {s.owner}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{s.domain}</td>
                    <td className="px-5 py-4 text-ink-soft">{s.vendor}</td>
                    <td className="px-5 py-4">
                      <RiskBadge level={s.risk} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-32">
                        <Meter value={s.compliance} />
                      </div>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-ink-soft">
                      {s.lastReviewed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
