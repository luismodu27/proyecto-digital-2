import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { ProblemStats } from "@/components/landing/ProblemStats";
import { Modules } from "@/components/landing/Modules";
import { WhyNow } from "@/components/landing/WhyNow";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WaitlistCTA } from "@/components/landing/WaitlistCTA";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ProblemStats />
        <Modules />
        <WhyNow />
        <HowItWorks />
        <WaitlistCTA />
      </main>
      <SiteFooter />
    </>
  );
}
