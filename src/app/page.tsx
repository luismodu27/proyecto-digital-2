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

export default function Home() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido">
        <Hero />
        <Reveal>
          <TrustStrip />
        </Reveal>
        <Reveal>
          <ProblemStats />
        </Reveal>
        <Reveal>
          <RecruitmentFocus />
        </Reveal>
        <Reveal>
          <Modules />
        </Reveal>
        <Reveal>
          <Platform />
        </Reveal>
        <Reveal>
          <WhyNow />
        </Reveal>
        <UseCaseStory />
        <Reveal>
          <Honestidad />
        </Reveal>
        <Reveal>
          <Pricing />
        </Reveal>
        <Reveal>
          <FAQ />
        </Reveal>
        <Reveal>
          <WaitlistCTA />
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}
