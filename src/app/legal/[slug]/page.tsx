import type { Metadata } from "next";
import {
  LegalPageShell,
  buildLegalMetadata,
} from "@/components/legal/LegalPageShell";
import { legalSlugs } from "@/lib/legal";

/**
 * Documentos legales en español. La versión inglesa vive en `/en/legal/[slug]`
 * con su propio slug (ver `src/lib/legal/index.ts`).
 */

export function generateStaticParams() {
  return legalSlugs("es").map((slug) => ({ slug }));
}

// Solo existen los slugs del registro: cualquier otro es 404, no una página vacía.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildLegalMetadata(slug, "es");
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LegalPageShell slug={slug} locale="es" />;
}
