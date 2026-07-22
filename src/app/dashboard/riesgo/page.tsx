import { PageHeader } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { getAiSystems } from "@/lib/data";
import { RISK_LABEL, RISK_ORDER, type RiskLevel } from "@/lib/mock-data";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

// Textos de obligaciones por nivel de riesgo (contenido regulatorio determinista) → ES.
const guidance: Record<RiskLevel, string> = {
  unacceptable: "Prohibido bajo el EU AI Act. Debe retirarse de uso.",
  high: "Obligaciones estrictas: documentación técnica, supervisión humana, logging, gestión de datos.",
  limited: "Obligaciones de transparencia: informar al usuario de que interactúa con IA.",
  minimal: "Sin obligaciones específicas. Buenas prácticas recomendadas.",
};

export default async function RiesgoPage() {
  const allSystems = await getAiSystems();
  const d = getDictionary(await resolveLocale()).dashboard;
  const t = d.riskPage;
  const grouped = RISK_ORDER.map((level) => ({
    level,
    systems: allSystems.filter((s) => s.risk === level),
  }));

  return (
    <>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        action={
          <ButtonLink href="/dashboard/riesgo/evaluar" variant="primary">
            {t.evaluateCta}
          </ButtonLink>
        }
      />

      <div className="space-y-5">
        {grouped.map(({ level, systems }) => (
          <section
            key={level}
            className="rounded-2xl border border-line bg-paper-raised p-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <RiskBadge level={level} />
                <span className="text-sm text-muted">
                  {systems.length}{" "}
                  {systems.length === 1 ? d.units.systemOne : d.units.systemOther}
                </span>
              </div>
              <span className="font-display text-sm font-medium text-ink">
                {RISK_LABEL[level]}
              </span>
            </div>
            <p className="mt-3 border-l-2 border-line-strong pl-3 text-sm text-ink-soft">
              {guidance[level]}
            </p>
            {systems.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {systems.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink"
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
