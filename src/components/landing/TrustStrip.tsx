import type { Dictionary } from "@/lib/i18n";

/** Iconos por señal (orden del diccionario): determinismo · región UE · registro inmutable · validación experta. */
const ICONS = [
  // determinista / cero LLM — llaves de código
  <path key="i0" d="M6.5 4.5 3 8l3.5 3.5M9.5 4.5 13 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />,
  // región UE — globo
  <g key="i1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="5.2" /><path d="M2.8 8h10.4M8 2.8c1.6 1.5 2.4 3.3 2.4 5.2S9.6 11.7 8 13.2C6.4 11.7 5.6 9.9 5.6 8S6.4 4.3 8 2.8Z" /></g>,
  // registro inmutable — candado
  <g key="i2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="7" width="9" height="6.2" rx="1.4" /><path d="M5.6 7V5.4a2.4 2.4 0 0 1 4.8 0V7" /></g>,
  // validación experta — insignia con check
  <g key="i3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2.6 12.5 4.4v3.4c0 3-2 4.8-4.5 5.6-2.5-.8-4.5-2.6-4.5-5.6V4.4Z" /><path d="m6.1 7.9 1.4 1.4 2.6-2.9" /></g>,
];

export function TrustStrip({ t }: { t: Dictionary["landing"]["trustStrip"] }) {
  return (
    <section className="border-y border-line bg-paper-raised/60">
      <div className="container-page py-9">
        <p className="text-center text-xs uppercase tracking-[0.18em] text-muted">
          {t.eyebrow}
        </p>
        <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
          {t.signals.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center md:flex-row md:items-start md:gap-3 md:text-left">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden>{ICONS[i]}</svg>
              </span>
              <div className="mt-2 md:mt-0">
                <p className="text-sm font-semibold text-ink">{s.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
