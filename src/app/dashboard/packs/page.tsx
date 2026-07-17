import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/Button";
import { LegalNote, LEGAL_FOOTER } from "@/components/ui/LegalNote";
import { getSystemsForSelect, isSupabaseConfigured } from "@/lib/data";
import { applyPolicyPack } from "@/lib/data/actions";
import { RRHH_PACK, type PolicySeverity } from "@/lib/policy-packs/rrhh";

const severityCls: Record<PolicySeverity, string> = {
  alta: "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  media: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  baja: "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

export default async function PolicyPacksPage() {
  const systems = isSupabaseConfigured ? await getSystemsForSelect() : [];

  return (
    <>
      <PageHeader
        title="Policy packs"
        subtitle="Plantillas de controles por caso de uso. Aplícalas para precargar las brechas de un sistema."
      />

      <article className="rounded-2xl border border-line bg-paper-raised p-6">
        <div className="flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong">
              Reclutamiento
            </span>
            <h2 className="mt-2 font-display text-xl font-semibold text-ink">
              {RRHH_PACK.name}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-ink-soft">{RRHH_PACK.summary}</p>
          </div>
          <span className="text-sm text-muted">
            {RRHH_PACK.controls.length} controles
          </span>
        </div>

        <ul className="mt-5 space-y-3">
          {RRHH_PACK.controls.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-2 rounded-xl border border-line bg-paper p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-medium text-seal">
                    {c.article}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${severityCls[c.severity]}`}
                  >
                    {c.severity}
                  </span>
                </div>
                <p className="mt-1.5 font-medium text-ink">{c.title}</p>
                <p className="text-sm text-ink-soft">{c.description}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Aplicar */}
        <div className="mt-6 border-t border-line pt-6">
          {isSupabaseConfigured ? (
            systems.length > 0 ? (
              <form
                action={applyPolicyPack}
                className="flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label
                    htmlFor="systemId"
                    className="block text-sm font-medium text-ink"
                  >
                    Aplicar a un sistema
                  </label>
                  <select
                    id="systemId"
                    name="systemId"
                    required
                    className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                  >
                    <option value="">Selecciona un sistema…</option>
                    {systems.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit">Aplicar policy pack</Button>
              </form>
            ) : (
              <p className="text-sm text-ink-soft">
                Registra un sistema en el inventario para poder aplicarle este pack.
              </p>
            )
          ) : (
            <p className="text-sm text-ink-soft">
              En modo demo puedes ver el pack. Conecta Supabase para aplicarlo a tus
              sistemas.
            </p>
          )}
        </div>
      </article>

      <LegalNote text={`Controles orientativos. ${LEGAL_FOOTER}`} className="mt-6" />
    </>
  );
}
