import type { Metadata } from "next";
import {
  LegalPageShell,
  buildLegalMetadata,
} from "@/components/legal/LegalPageShell";
import { legalSlugs } from "@/lib/legal";

/** Documentos legales en inglés. La versión española vive en `/legal/[slug]`. */

export function generateStaticParams() {
  return legalSlugs("en").map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildLegalMetadata(slug, "en");
}

export default async function LegalPageEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LegalPageShell slug={slug} locale="en" />;
}
