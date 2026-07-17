import { PageHeader } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { LegalNote, LEGAL_FOOTER } from "@/components/ui/LegalNote";
import { getGapItems } from "@/lib/data";

const statusMeta = {
  missing: { label: "Falta", cls: "bg-[#f7e4e2] text-[#8f271f] border-[#e6b6b1]" },
  partial: { label: "Parcial", cls: "bg-[#f7ead8] text-[#8a4f14] border-[#e6cba3]" },
  done: { label: "Cubierto", cls: "bg-brand-soft text-brand-strong border-[#bfdccf]" },
} as const;

const severityMeta = {
  alta: "text-[#a3271f]",
  media: "text-[#a4610f]",
  baja: "text-muted",
} as const;

export default async function GapPage() {
  const gapItems = await getGapItems();
  const open = gapItems.filter((g) => g.status !== "done").length;

  return (
    <>
      <PageHeader
        title="Gap assessment"
        subtitle={`${open} brechas abiertas frente a los requisitos del EU AI Act.`}
        action={
          <ButtonLink href="/dashboard/gap/informe" variant="outline">
            ⬇ Exportar evidencia (PDF)
          </ButtonLink>
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
                <p className="text-xs text-muted">Sistema afectado: {g.system}</p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium ${st.cls}`}
              >
                {st.label}
              </span>
            </article>
          );
        })}
      </div>

      <LegalNote text={LEGAL_FOOTER} className="mt-6" />
    </>
  );
}
