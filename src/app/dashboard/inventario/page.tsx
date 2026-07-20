import Link from "next/link";
import { PageHeader, Meter } from "@/components/dashboard/parts";
import { Button, ButtonLink } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { EvidenceBadge } from "@/components/ui/EvidenceBadge";
import { getAiSystems, isSupabaseConfigured } from "@/lib/data";
import { AUDIT_READY_THRESHOLD } from "@/lib/mock-data";
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
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Sistema</th>
                  <th className="px-5 py-3 font-medium">Dominio</th>
                  <th className="px-5 py-3 font-medium">Riesgo</th>
                  <th className="px-5 py-3 font-medium">Respaldo</th>
                  <th className="px-5 py-3 font-medium">Preparación</th>
                  <th className="px-5 py-3 font-medium">Última revisión</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {systems.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-paper-sunken/50">
                    <td className="px-5 py-4">
                      {s.dbId ? (
                        <Link
                          href={`/dashboard/inventario/${s.dbId}/editar`}
                          className="font-medium text-ink transition-colors hover:text-brand"
                        >
                          {s.name}
                        </Link>
                      ) : (
                        <p className="font-medium text-ink">{s.name}</p>
                      )}
                      <p className="font-mono text-xs text-muted">
                        {s.id} · {s.owner}
                        {s.vendor ? ` · ${s.vendor}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{s.domain}</td>
                    <td className="px-5 py-4">
                      <RiskBadge level={s.risk} />
                    </td>
                    <td className="px-5 py-4">
                      <EvidenceBadge state={s.evidenceState} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-32">
                        <Meter value={s.compliance} target={AUDIT_READY_THRESHOLD} />
                      </div>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-ink-soft">
                      {s.lastReviewed}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        {isSupabaseConfigured && s.dbId && !s.evidenceState && (
                          <Link
                            href={`/dashboard/riesgo/evaluar?system=${s.dbId}`}
                            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-brand transition-colors hover:text-brand-strong"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              className="size-4"
                              fill="none"
                              aria-hidden
                            >
                              <path
                                d="M10 2.5 3 6v4.5c0 3.5 2.8 6.2 7 7 4.2-.8 7-3.5 7-7V6l-7-3.5Zm-2.5 8L9.5 12.5l3.5-4"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Clasificar
                          </Link>
                        )}
                        <Link
                          href={`/dashboard/inventario/${s.dbId ?? s.id}/dossier`}
                          className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-brand transition-colors hover:text-brand-strong"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            className="size-4"
                            fill="none"
                            aria-hidden
                          >
                            <path
                              d="M6 2.5h5L15.5 7v10.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Zm5 0V7h4.5M7 11h6M7 14h4"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Dossier
                        </Link>
                      </div>
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
