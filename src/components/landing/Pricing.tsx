import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/lib/i18n";

// Estructura (estructural) por plan — el texto llega por diccionario.
const TIER_META: { href: string; highlight: boolean }[] = [
  { href: "/login", highlight: false },
  { href: "/login", highlight: true },
  { href: "#waitlist", highlight: false },
];

// Matriz de comparación: cada fila = una capacidad; celdas true/false o un
// marcador de texto ("one"/"team") que se resuelve con el diccionario.
type Cell = boolean | "one" | "team";
const COMPARE_CELLS: [Cell, Cell, Cell][] = [
  [true, true, true],
  [true, true, true],
  ["one", "team", "team"],
  [false, true, true],
  [false, true, true],
  [false, true, true],
  [false, true, true],
  [false, true, true],
  [false, false, true],
  [false, false, true],
  [false, false, true],
];

export function Pricing({ t }: { t: Dictionary["landing"]["pricing"] }) {
  const cols = t.tiers.map((tier) => tier.name);

  function CompareCell({ value }: { value: Cell }) {
    if (value === true)
      return (
        <svg
          viewBox="0 0 16 16"
          className="mx-auto size-4 text-brand"
          aria-label={t.compare.includedLabel}
        >
          <path
            d="m3.5 8.5 3 3 6-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    if (value === false)
      return (
        <span className="text-muted" aria-label={t.compare.notIncludedLabel}>
          —
        </span>
      );
    const text = value === "one" ? "1" : t.compare.team;
    return <span className="text-sm font-medium text-ink">{text}</span>;
  }

  return (
    <section id="precios" className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-4 text-lg text-ink-soft">{t.intro}</p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {t.tiers.map((tier, i) => {
          const meta = TIER_META[i];
          return (
            <Reveal key={tier.name} delay={i * 90}>
              <div
                className={`card-lift flex h-full flex-col rounded-2xl border p-7 ${
                  meta.highlight
                    ? "border-brand bg-paper-raised shadow-[0_24px_60px_-36px_rgba(11,107,78,0.5)]"
                    : "border-line bg-paper-raised"
                }`}
              >
                {meta.highlight && (
                  <span className="mb-4 inline-flex w-fit items-center rounded-full bg-brand px-3 py-0.5 text-xs font-medium text-white">
                    {t.recommended}
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold text-ink">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-muted">{tier.note}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold text-ink">
                    {tier.price}
                  </span>
                  {"unit" in tier && tier.unit && (
                    <span className="text-sm text-muted">{tier.unit}</span>
                  )}
                </div>

                <div className="mt-6 flex-1 border-t border-line pt-6">
                  {"lead" in tier && tier.lead && (
                    <p className="mb-3 text-xs font-medium text-ink-soft">
                      {tier.lead}
                    </p>
                  )}
                  <ul className="space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-ink">
                        <svg
                          viewBox="0 0 16 16"
                          className="mt-0.5 size-4 shrink-0 text-brand"
                          aria-hidden
                        >
                          <path
                            d="m3.5 8.5 3 3 6-7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {"limits" in tier && tier.limits && (
                    <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
                      {tier.limits}
                    </p>
                  )}
                </div>

                <ButtonLink
                  href={meta.href}
                  variant={meta.highlight ? "primary" : "outline"}
                  className="mt-7 w-full py-2.5"
                >
                  {tier.cta}
                </ButtonLink>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Comparativa de planes */}
      <Reveal className="mt-16">
        <h3 className="text-center font-display text-xl font-semibold text-ink">
          {t.compare.title}
        </h3>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line-strong">
                <th className="py-3 pr-4 text-sm font-medium text-ink-soft">
                  {t.compare.capability}
                </th>
                {cols.map((c, i) => (
                  <th
                    key={c}
                    className={`px-3 py-3 text-center text-sm font-semibold ${
                      i === 1 ? "text-brand-strong" : "text-ink"
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.compare.rows.map((label, r) => (
                <tr key={label} className="border-b border-line">
                  <td className="py-3 pr-4 text-sm text-ink">{label}</td>
                  {COMPARE_CELLS[r].map((cell, i) => (
                    <td
                      key={i}
                      className={`px-3 py-3 text-center align-middle ${
                        i === 1 ? "bg-brand-soft/30" : ""
                      }`}
                    >
                      <CompareCell value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}
