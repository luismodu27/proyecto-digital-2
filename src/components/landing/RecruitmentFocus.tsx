import { RiskBadge } from "@/components/ui/RiskBadge";
import { Reveal } from "@/components/ui/Reveal";
import type { RiskLevel } from "@/lib/mock-data";
import type { Dictionary } from "@/lib/i18n";

// Nivel de riesgo (estructural) por caso — el texto llega por diccionario.
const CASE_RISKS: RiskLevel[] = [
  "high",
  "high",
  "high",
  "high",
  "limited",
  "minimal",
];

export function RecruitmentFocus({
  t,
}: {
  t: Dictionary["landing"]["recruitmentFocus"];
}) {
  return (
    <section className="border-y border-line bg-paper-sunken/40">
      <div className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            {t.introBefore}
            <span className="font-medium text-ink">{t.introEmphasis}</span>
            {t.introAfter}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.cases.map((c, i) => (
            <Reveal key={c.name} delay={i * 70}>
              <article className="card-lift flex h-full flex-col rounded-2xl border border-line bg-paper-raised p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {c.name}
                  </h3>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {c.body}
                </p>
                <div className="mt-4">
                  <RiskBadge
                    level={CASE_RISKS[i]}
                    label={t.riskLabels[CASE_RISKS[i] as keyof typeof t.riskLabels]}
                  />
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-xs text-muted">{t.note}</p>
      </div>
    </section>
  );
}
