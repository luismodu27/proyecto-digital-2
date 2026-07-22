import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { RiskWizard } from "@/components/dashboard/RiskWizard";
import { getSystemsForSelect, isSupabaseConfigured } from "@/lib/data";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

export default async function EvaluarRiesgoPage({
  searchParams,
}: {
  searchParams: Promise<{ system?: string }>;
}) {
  const { system } = await searchParams;
  const systems = isSupabaseConfigured ? await getSystemsForSelect() : [];
  const preset = system && systems.some((s) => s.id === system) ? system : undefined;
  const t = getDictionary(await resolveLocale()).dashboard.pages;

  return (
    <>
      <PageHeader title={t.evaluate.title} subtitle={t.evaluate.subtitle} />
      <div className="mb-5">
        <Link
          href="/dashboard/riesgo"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          {t.backToRiskClass}
        </Link>
      </div>
      <div className="max-w-2xl">
        <RiskWizard
          systems={systems}
          connected={isSupabaseConfigured}
          presetSystemId={preset}
        />
      </div>
    </>
  );
}
