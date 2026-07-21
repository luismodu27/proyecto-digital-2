import { PageHeader } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { LegalNote, LEGAL_FOOTER } from "@/components/ui/LegalNote";
import { GapStatusControl } from "@/components/dashboard/GapStatusControl";
import { DeleteGapButton } from "@/components/dashboard/DeleteGapButton";
import { getAiSystems, getGapItems, isSupabaseConfigured } from "@/lib/data";

const statusMeta = {
  missing: {
    label: "Falta",
    cls: "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  },
  partial: {
    label: "Parcial",
    cls: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  },
  done: {
    label: "Cubierto",
    cls: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  },
} as const;

const severityMeta = {
  alta: "text-[var(--tone-danger-fg)]",
  media: "text-[var(--tone-warn-fg)]",
  baja: "text-muted",
} as const;

export default async function GapPage() {
  const [gapItems, systems] = await Promise.all([getGapItems(), getAiSystems()]);
  const open = gapItems.filter((g) => g.status !== "done").length;
  // El nombre real del sistema (getGapItems deja el uuid si el sistema no tiene
  // `code`, p. ej. los creados por el usuario). Misma resolución que el PDF.
  const nameById = new Map(systems.map((s) => [s.id, s.name]));

  return (
    <>
      <PageHeader
        title="Gap assessment"
        subtitle={
          open === 1
            ? "1 brecha abierta frente a los requisitos del EU AI Act."
            : `${open} brechas abiertas frente a los requisitos del EU AI Act.`
        }
        action={
          <div className="flex flex-wrap gap-2">
            {isSupabaseConfigured && (
              <ButtonLink href="/dashboard/gap/nuevo" variant="primary">
                + Añadir brecha
              </ButtonLink>
            )}
            <ButtonLink href="/dashboard/gap/informe" variant="outline">
              ⬇ Exportar evidencia (PDF)
            </ButtonLink>
          </div>
        }
      />

      <div className="space-y-3">
        {gapItems.map((g) => {
          const st = statusMeta[g.status];
          return (
            <article
              key={g.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted">{g.article}</span>
                  <span className={`text-xs font-medium uppercase ${severityMeta[g.severity]}`}>
                    · severidad {g.severity}
                  </span>
                </div>
                <p className="mt-1 font-medium text-ink">{g.requirement}</p>
                <p className="text-xs text-muted">
                  Sistema afectado: {nameById.get(g.system) ?? g.system}
                </p>
              </div>
              {isSupabaseConfigured ? (
                <div className="flex shrink-0 items-center gap-1">
                  <GapStatusControl id={g.id} status={g.status} />
                  <DeleteGapButton id={g.id} />
                </div>
              ) : (
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium ${st.cls}`}
                >
                  {st.label}
                </span>
              )}
            </article>
          );
        })}
      </div>

      <LegalNote text={LEGAL_FOOTER} className="mt-6" />
    </>
  );
}
