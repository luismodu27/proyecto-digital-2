import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  alternates: {
    canonical: "/en",
    languages: { es: "/", en: "/en" },
  },
  openGraph: { locale: "en_US" },
};

export default function HomeEn() {
  return <LandingPage locale="en" />;
}
