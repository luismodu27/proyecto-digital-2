import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { buildLandingMetadata } from "@/lib/i18n/metadata";

export const metadata: Metadata = buildLandingMetadata("es");

export default function Home() {
  return <LandingPage locale="es" />;
}
