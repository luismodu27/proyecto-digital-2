import type { Dictionary } from "@/lib/i18n";

export function WhyNow({ t }: { t: Dictionary["landing"]["whyNow"] }) {
  return (
    <section
      id="por-que-ahora"
      className="relative overflow-hidden bg-ink text-paper"
    >
      <div className="container-page py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand-bright">
              {t.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {t.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-paper/70">
              {t.introBefore}
              <span className="text-paper">{t.introValue1}</span>
              {t.introMid}
              <span className="text-paper">{t.introValue2}</span>
              {t.introAfter}
            </p>
          </div>

          <ol className="relative space-y-8 border-l border-paper/15 pl-8">
            {t.milestones.map((m) => (
              <li key={m.title} className="relative">
                <span className="absolute -left-[2.6rem] top-1 flex size-5 items-center justify-center rounded-full border border-brand-bright/50 bg-ink">
                  <span className="size-2 rounded-full bg-brand-bright" />
                </span>
                <p className="font-mono text-xs uppercase tracking-widest text-brand-bright">
                  {m.date}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-paper">
                  {m.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-paper/65">
                  {m.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
