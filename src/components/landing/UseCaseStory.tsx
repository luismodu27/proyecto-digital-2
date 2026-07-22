import { CountUp } from "@/components/ui/CountUp";
import { FillBar } from "@/components/ui/FillBar";
import { Reveal } from "@/components/ui/Reveal";
import { RISK_HEX } from "@/lib/mock-data";
import type { Dictionary } from "@/lib/i18n";

type L = Dictionary["landing"]["useCaseStory"];

/* Paleta de riesgo (hex inline: colores dinámicos, no tokens tree-shakeados).
   Fuente única RISK_HEX + un rojo de acento propio de esta ilustración. */
const C = { ...RISK_HEX, danger: "#a3271f" };

/* Visual del paso 1 — inventario descubierto. */
function InventoryVisual({ t }: { t: L["inventory"] }) {
  const tones = [C.danger, C.danger, C.limited];
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
        {t.header}
      </p>
      <ul className="mt-3 space-y-2">
        {t.rows.map((r, i) => (
          <Reveal
            key={r.name}
            delay={200 + i * 110}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper-raised px-3 py-2"
          >
            <span className="flex items-center gap-2 text-sm text-ink">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-soft text-[10px] font-semibold text-brand-strong">
                IA
              </span>
              {r.name}
            </span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ color: tones[i], backgroundColor: `${tones[i]}18` }}
            >
              {r.tag}
            </span>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

/* Visual del paso 2 — distribución de riesgo. */
function RiskVisual({ t }: { t: L["risk"] }) {
  const pcts = [67, 17, 16];
  const colors = [C.high, C.limited, C.minimal];
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {t.header}
        </p>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ color: C.danger, backgroundColor: `${C.danger}18` }}
        >
          {t.badge}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {t.barLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-ink-soft">{label}</span>
            <FillBar pct={pcts[i]} color={colors[i]} delay={i * 140} className="flex-1" />
            <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-ink">
              {pcts[i]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Visual del paso 3 — brechas cerradas, preparación en aumento. */
function GapVisual({ t }: { t: L["gap"] }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {t.header}
        </p>
        <p className="font-display text-2xl font-semibold text-ink">
          <CountUp value={78} suffix="%" />
        </p>
      </div>
      <FillBar pct={78} color={C.minimal} className="mt-2" />
      <p className="mt-1 text-[11px] text-muted">{t.subtext}</p>
      <ul className="mt-3 space-y-1.5">
        {t.tasks.map((task, i) => (
          <Reveal
            key={task}
            delay={300 + i * 120}
            className="flex items-center gap-2 text-xs text-ink-soft"
          >
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" aria-hidden>
              <path
                d="M9 11l3 3 8-8M4 12a8 8 0 108-8"
                stroke={C.minimal}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {task}
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

/* Visual del paso 4 — evidencia generada + radar vigilando. */
function EvidenceVisual({ t }: { t: L["evidence"] }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <div className="flex items-center gap-3 rounded-lg border border-line bg-paper-raised px-3 py-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
            <path
              d="M7 3h7l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1Zm7 0v4h4M9 13h6M9 16h4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{t.fileTitle}</p>
          <p className="text-[11px] text-muted">{t.fileSubtitle}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-[var(--tone-good-bd)] bg-brand-soft/50 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink">
          <svg viewBox="0 0 24 24" className="size-3.5 text-brand-strong" fill="none" aria-hidden>
            <path
              d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.radar}
        </span>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-brand-strong">
          {t.countdown}
        </span>
      </div>
    </div>
  );
}

export function UseCaseStory({ t }: { t: L }) {
  const visuals = [
    <InventoryVisual key="1" t={t.inventory} />,
    <RiskVisual key="2" t={t.risk} />,
    <GapVisual key="3" t={t.gap} />,
    <EvidenceVisual key="4" t={t.evidence} />,
  ];

  return (
    <section id="como-funciona" className="border-y border-line bg-paper-sunken/40">
      <div className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg text-ink-soft">{t.intro}</p>
        </div>

        <div className="mt-14 space-y-6 md:space-y-4">
          {t.steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="grid items-center gap-6 rounded-2xl border border-line bg-paper-raised p-6 md:grid-cols-2 md:gap-10 md:p-8">
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft font-display text-lg font-semibold text-brand-strong">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </div>
                <div className={i % 2 === 1 ? "md:order-1" : ""}>{visuals[i]}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
