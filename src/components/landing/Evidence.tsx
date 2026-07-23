import type { Dictionary } from "@/lib/i18n";

/** Anillo de progreso SVG para el medidor "% listo". */
function ReadinessRing({ value }: { value: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <svg viewBox="0 0 120 120" className="size-32" role="img" aria-label={`${value}%`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-line-strong)" strokeWidth="10" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c - filled}`}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="fill-ink font-display text-[26px] font-semibold">
        {value}%
      </text>
    </svg>
  );
}

export function Evidence({ t }: { t: Dictionary["landing"]["evidence"] }) {
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

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {/* Dossier */}
        <article className="flex flex-col rounded-2xl border border-line bg-paper-raised p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t.dossier.label}</p>
          <div className="mt-4 flex-1 rounded-xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <svg viewBox="0 0 16 16" className="size-4 text-brand" aria-hidden>
                  <path d="M4 1.5h5l3 3v10H4z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M9 1.5v3h3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                {t.dossier.file}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {t.dossier.lines.map((l) => (
                <li key={l} className="flex items-start gap-2 text-xs leading-snug text-ink-soft">
                  <svg viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden>
                    <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {l}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-sm text-muted">{t.dossier.caption}</p>
        </article>

        {/* Audit-log */}
        <article className="flex flex-col rounded-2xl border border-line bg-paper-raised p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t.audit.label}</p>
          <div className="mt-4 flex-1 rounded-xl border border-line bg-paper p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-seal-soft text-sm font-semibold text-seal">
                {t.audit.actor.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-snug text-ink">
                  <span className="font-semibold">{t.audit.actor}</span> {t.audit.action}
                </p>
                <p className="mt-0.5 text-xs text-muted">{t.audit.time}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1" aria-hidden>
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full bg-brand/25" />
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-xs leading-snug text-ink-soft">
              <svg viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden>
                <rect x="3.5" y="7" width="9" height="6" rx="1.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5.6 7V5.6a2.4 2.4 0 0 1 4.8 0V7" fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              {t.audit.sealNote}
            </p>
          </div>
        </article>

        {/* Readiness */}
        <article className="flex flex-col items-center rounded-2xl border border-line bg-paper-raised p-6 text-center">
          <p className="self-start text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t.readiness.label}</p>
          <div className="flex flex-1 items-center py-4">
            <ReadinessRing value={t.readiness.value} />
          </div>
          <p className="text-sm text-muted">{t.readiness.caption}</p>
        </article>
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted">{t.note}</p>
    </section>
  );
}
