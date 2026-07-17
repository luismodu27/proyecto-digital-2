import { PageHeader, Meter } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { getAiSystems } from "@/lib/data";

export default async function InventarioPage() {
  const systems = await getAiSystems();
  return (
    <>
      <PageHeader
        title="Inventario de sistemas de IA"
        subtitle="Cada modelo y sistema en uso, con su propietario, proveedor y estado."
        action={
          <ButtonLink href="#" variant="primary">
            + Registrar sistema
          </ButtonLink>
        }
      />

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
              {systems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted">
                    Aún no hay sistemas registrados. Empieza con
                    <span className="text-ink"> + Registrar sistema</span>.
                  </td>
                </tr>
              )}
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
    </>
  );
}
