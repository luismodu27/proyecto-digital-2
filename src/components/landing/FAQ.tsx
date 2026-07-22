import type { Dictionary } from "@/lib/i18n";

export function FAQ({ t }: { t: Dictionary["landing"]["faq"] }) {
  return (
    <section id="faq" className="border-t border-line bg-paper-sunken/40">
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t.title}
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-line rounded-2xl border border-line bg-paper-raised">
          {t.items.map((f) => (
            <details key={f.q} className="group px-6 [&_svg]:open:rotate-45">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-ink transition-colors hover:text-brand-strong">
                {f.q}
                <svg
                  viewBox="0 0 20 20"
                  className="size-5 shrink-0 text-muted transition-transform duration-300"
                  aria-hidden
                >
                  <path
                    d="M10 4v12M4 10h12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <p className="grid grid-rows-[0fr] pb-0 text-sm leading-relaxed text-ink-soft transition-all duration-300 group-open:grid-rows-[1fr] group-open:pb-5">
                <span className="overflow-hidden">{f.a}</span>
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
