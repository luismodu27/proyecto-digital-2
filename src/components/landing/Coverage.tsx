import type { Dictionary } from "@/lib/i18n";

export function Coverage({ t }: { t: Dictionary["landing"]["coverage"] }) {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
          {t.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-4 text-lg text-ink-soft">{t.intro}</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.frameworks.map((f) => (
          <article
            key={f.name}
            className="flex flex-col rounded-2xl border border-line bg-paper-raised p-6 transition-colors hover:border-line-strong"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-ink">{f.name}</h3>
              {f.tag && (
                <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold leading-none text-brand-strong">
                  {f.tag}
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.body}</p>
          </article>
        ))}
      </div>

      {t.radar.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-dashed border-line-strong bg-paper-raised/50 px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            {t.radarLabel}
          </span>
          {t.radar.map((r) => (
            <span
              key={r}
              className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-soft"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted">{t.note}</p>
    </section>
  );
}
