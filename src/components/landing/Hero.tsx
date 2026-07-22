import { ButtonLink } from "@/components/ui/Button";
import { HeroPreview } from "./HeroPreview";
import type { Dictionary } from "@/lib/i18n";

export function Hero({
  t,
  preview,
}: {
  t: Dictionary["landing"]["hero"];
  preview: Dictionary["landing"]["heroPreview"];
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-paper opacity-50" aria-hidden />
      <div
        className="absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full bg-brand-soft blur-3xl opacity-50"
        aria-hidden
      />
      <div
        className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-seal-soft blur-3xl opacity-40"
        aria-hidden
      />

      <div className="container-page relative grid items-center gap-14 py-20 md:py-28 lg:grid-cols-[1.05fr_1fr]">
        {/* Mensaje */}
        <div className="reveal is-visible text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-raised px-3 py-1 text-xs font-medium text-ink-soft">
            <span className="size-1.5 rounded-full bg-brand" />
            {t.badge}
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            {t.titleLine1}
            <br />
            <span className="text-brand">{t.titleLine2}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft lg:mx-0">
            {t.bodyBefore}
            <span className="font-medium text-ink">{t.bodyEmphasis}</span>
            {t.bodyAfter}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <ButtonLink href="#waitlist" variant="primary" className="px-6 py-3">
              {t.ctaPrimary}
            </ButtonLink>
            <ButtonLink href="/demo" variant="outline" className="px-6 py-3">
              {t.ctaSecondary}
            </ButtonLink>
          </div>

          <p className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-brand-strong lg:justify-start">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            {t.ctaNote}
          </p>

          <p className="mt-4 text-xs text-muted">{t.footnote}</p>
        </div>

        {/* Mockup, flotando sobre un suelo atmosférico */}
        <div className="reveal is-visible relative isolate [transition-delay:120ms]">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-6 -bottom-8 top-6 -z-10 rounded-[2.5rem] bg-gradient-to-b from-brand-soft/70 via-seal-soft/25 to-transparent blur-2xl"
          />
          <HeroPreview t={preview} />
        </div>
      </div>
    </section>
  );
}
