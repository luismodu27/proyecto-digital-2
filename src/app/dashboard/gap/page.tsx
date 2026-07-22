import { PageHeader } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { LegalNote, LEGAL_FOOTER } from "@/components/ui/LegalNote";
import { GapStatusControl } from "@/components/dashboard/GapStatusControl";
import { DeleteGapButton } from "@/components/dashboard/DeleteGapButton";
import { getAiSystems, getGapItems, isSupabaseConfigured } from "@/lib/data";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

const severityMeta = {
  alta: "text-[var(--tone-danger-fg)]",
  media: "text-[var(--tone-warn-fg)]",
  baja: "text-muted",
} as const;

const statusCls = {
  missing:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  partial:
    "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  done: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
} as const;

export default async function GapPage() {
  const [gapItems, systems] = await Promise.all([getGapItems(), getAiSystems()]);
  const t = getDictionary(await resolveLocale()).dashboard.gap;
  const open = gapItems.filter((g) => g.status !== "done").length;
  // El nombre real del sistema (getGapItems deja el uuid si el sistema no tiene
  // `code`, p. ej. los creados por el usuario). Misma resolución que el PDF.
  const nameById = new Map(systems.map((s) => [s.id, s.name]));

  return (
    <>
      <PageHeader
        title={t.title}
        subtitle={open === 1 ? t.subtitleOne : `${open}${t.subtitleOtherAfter}`}
        action={
          <div className="flex flex-wrap gap-2">
            {isSupabaseConfigured && (
              <ButtonLink href="/dashboard/gap/nuevo" variant="primary">
                {t.addGap}
              </ButtonLink>
            )}
            <ButtonLink href="/dashboard/gap/informe" variant="outline">
              {t.exportEvidence}
            </ButtonLink>
          </div>
        }
      />

      <div className="space-y-3">
        {gapItems.map((g) => {
          return (
            <article
              key={g.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted">{g.article}</span>
                  <span className={`text-xs font-medium uppercase ${severityMeta[g.severity]}`}>
                    {t.severityPrefix}{g.severity}
                  </span>
                </div>
                <p className="mt-1 font-medium text-ink">{g.requirement}</p>
                <p className="text-xs text-muted">
                  {t.affectedSystemPrefix}{nameById.get(g.system) ?? g.system}
                </p>
              </div>
              {isSupabaseConfigured ? (
                <div className="flex shrink-0 items-center gap-1">
                  <GapStatusControl id={g.id} status={g.status} />
                  <DeleteGapButton id={g.id} />
                </div>
              ) : (
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium ${statusCls[g.status]}`}
                >
                  {t.status[g.status]}
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
