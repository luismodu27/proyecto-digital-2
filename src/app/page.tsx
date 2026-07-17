import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { ProblemStats } from "@/components/landing/ProblemStats";
import { Modules } from "@/components/landing/Modules";
import { WhyNow } from "@/components/landing/WhyNow";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { WaitlistCTA } from "@/components/landing/WaitlistCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Reveal } from "@/components/ui/Reveal";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Reveal>
          <TrustStrip />
        </Reveal>
        <Reveal>
          <ProblemStats />
        </Reveal>
        <Reveal>
          <Modules />
        </Reveal>
        <Reveal>
          <WhyNow />
        </Reveal>
        <Reveal>
          <HowItWorks />
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
