import { RISK_LABEL, type RiskLevel } from "@/lib/mock-data";

const RISK_COLOR: Record<RiskLevel, string> = {
  unacceptable: "#b4322a",
  high: "#c9761f",
  limited: "#b0824a",
  minimal: "#0b6b4e",
};

const ORDER: RiskLevel[] = ["unacceptable", "high", "limited", "minimal"];

/** Dona de distribución de riesgo (SVG, on-brand). */
export function RiskDonut({
  counts,
}: {
  counts: Record<RiskLevel, number>;
}) {
  const total = ORDER.reduce((s, l) => s + counts[l], 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  const stroke = 16;

  const active = ORDER.filter((l) => counts[l] > 0);
  const fracs = active.map((l) => (total ? counts[l] / total : 0));
  const segments = active.map((l, i) => {
    const before = fracs.slice(0, i).reduce((s, f) => s + f, 0);
    const frac = fracs[i];
    return {
      level: l,
      dash: frac * c,
      gap: c - frac * c,
      rotate: before * 360 - 90,
    };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle
            cx={70}
            cy={70}
            r={r}
            fill="none"
            stroke="var(--color-paper-sunken)"
            strokeWidth={stroke}
          />
          {segments.map((s) => (
            <circle
              key={s.level}
              cx={70}
              cy={70}
              r={r}
              fill="none"
              stroke={RISK_COLOR[s.level]}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeLinecap="butt"
              transform={`rotate(${s.rotate} 70 70)`}
              style={{ transition: "stroke-dasharray 0.8s ease-out" }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-semibold text-ink">
            {total}
          </span>
          <span className="text-[11px] text-muted">sistemas</span>
        </div>
      </div>

      <ul className="space-y-2.5">
        {ORDER.map((l) => (
          <li key={l} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 rounded-sm"
              style={{ backgroundColor: RISK_COLOR[l] }}
            />
            <span className="text-ink-soft">{RISK_LABEL[l]}</span>
            <span className="ml-auto font-medium tabular-nums text-ink">
              {counts[l]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
