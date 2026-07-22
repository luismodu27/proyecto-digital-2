import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/lib/i18n";

// Formato numérico (estructural) — el texto de cada etiqueta llega por diccionario.
const STAT_FORMAT: { value: number; prefix?: string; suffix?: string }[] = [
  { value: 77, suffix: "%" },
  { value: 50, prefix: ">", suffix: "%" },
  { value: 35, prefix: "€", suffix: "M" },
  { value: 500, prefix: "$", suffix: "/h" },
];

export function ProblemStats({ t }: { t: Dictionary["landing"]["problemStats"] }) {
  return (
    <section className="border-y border-line bg-paper-sunken/60">
      <div className="container-page py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg text-ink-soft">{t.intro}</p>
        </div>

        <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {t.statLabels.map((label, i) => (
            <Reveal
              key={label}
              delay={i * 90}
              className="group bg-paper-raised p-6 transition-colors duration-300 hover:bg-paper"
            >
              <dt className="font-display text-4xl font-semibold text-ink">
                <CountUp
                  value={STAT_FORMAT[i].value}
                  prefix={STAT_FORMAT[i].prefix}
                  suffix={STAT_FORMAT[i].suffix}
                />
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">
                {label}
              </dd>
            </Reveal>
          ))}
        </dl>

        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-ink-soft">
          {t.sources}
        </p>
      </div>
    </section>
  );
}
