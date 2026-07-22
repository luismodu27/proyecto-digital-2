import type { Dictionary } from "@/lib/i18n";

// Iconos (estructural) por capacidad — el texto llega por diccionario.
const ICONS = [
  "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  "M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1Zm7 0v4h4M9 12h6M9 16h4",
  "M7 10V7a5 5 0 0110 0v3m-11 0h12a1 1 0 011 1v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7a1 1 0 011-1Z",
  "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M13 7a4 4 0 11-8 0 4 4 0 018 0M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
];

export function Platform({ t }: { t: Dictionary["landing"]["platform"] }) {
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

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {t.items.map((c, i) => (
          <article
            key={c.title}
            className="group flex gap-5 rounded-2xl border border-line bg-paper-raised p-7 transition-colors hover:border-line-strong"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
              <svg viewBox="0 0 24 24" className="size-5.5" fill="none" aria-hidden>
                <path
                  d={ICONS[i]}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
