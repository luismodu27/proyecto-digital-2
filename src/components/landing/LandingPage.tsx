import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ProblemStats } from "@/components/landing/ProblemStats";
import { RecruitmentFocus } from "@/components/landing/RecruitmentFocus";
import { Modules } from "@/components/landing/Modules";
import { Platform } from "@/components/landing/Platform";
import { WhyNow } from "@/components/landing/WhyNow";
import { UseCaseStory } from "@/components/landing/UseCaseStory";
import { Honestidad } from "@/components/landing/Honestidad";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { WaitlistCTA } from "@/components/landing/WaitlistCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/**
 * Única fuente de composición de la landing/web pública. Resuelve el diccionario
 * por `locale` y reparte a cada sección el slice que necesita (Server Components).
 * `/` la renderiza con locale="es"; `/en` con locale="en".
 */
export function LandingPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const l = t.landing;

  const nav = [
    { label: t.nav.product, href: "#producto" },
    { label: t.nav.howItWorks, href: "#como-funciona" },
    { label: t.nav.pricing, href: "#precios" },
    { label: t.nav.faq, href: "#faq" },
  ];

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        {t.common.skipToContent}
      </a>
      <SiteHeader nav={nav} t={t} locale={locale} />
      <main id="contenido">
        <Hero t={l.hero} preview={l.heroPreview} />
        <Reveal>
          <TrustStrip t={l.trustStrip} />
        </Reveal>
        <Reveal>
          <ProblemStats t={l.problemStats} />
        </Reveal>
        <Reveal>
          <RecruitmentFocus t={l.recruitmentFocus} />
        </Reveal>
        <Reveal>
          <Modules t={l.modules} />
        </Reveal>
        <Reveal>
          <Platform t={l.platform} />
        </Reveal>
        <Reveal>
          <WhyNow t={l.whyNow} />
        </Reveal>
        <UseCaseStory t={l.useCaseStory} />
        <Reveal>
          <Honestidad t={l.honestidad} />
        </Reveal>
        <Reveal>
          <Pricing t={l.pricing} />
        </Reveal>
        <Reveal>
          <FAQ t={l.faq} />
        </Reveal>
        <Reveal>
          <WaitlistCTA t={l.waitlist} />
        </Reveal>
      </main>
      <SiteFooter t={l.footer} locale={locale} />
    </>
  );
}
