import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { buildLandingMetadata } from "@/lib/i18n/metadata";

export const metadata: Metadata = buildLandingMetadata("en");

export default function HomeEn() {
  return <LandingPage locale="en" />;
}
