import type { Dictionary } from "@/lib/i18n";

const STEPS = ["01", "02", "03"];

export function Modules({ t }: { t: Dictionary["landing"]["modules"] }) {
  return (
    <section id="producto" className="container-page py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-4 text-lg text-ink-soft">{t.intro}</p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {t.items.map((m, i) => (
          <article
            key={m.title}
            className="group flex flex-col rounded-2xl border border-line bg-paper-raised p-7 transition-colors hover:border-line-strong"
          >
            <span className="font-mono text-sm text-seal">{STEPS[i]}</span>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
              {m.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
              {m.body}
            </p>
            <ul className="mt-5 space-y-2 border-t border-line pt-5">
              {m.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-ink">
                  <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-brand" aria-hidden>
                    <path
                      d="m3.5 8.5 3 3 6-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
