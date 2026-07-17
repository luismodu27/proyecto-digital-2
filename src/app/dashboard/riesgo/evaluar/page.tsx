import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { RiskWizard } from "@/components/dashboard/RiskWizard";
import { getSystemsForSelect, isSupabaseConfigured } from "@/lib/data";

export default async function EvaluarRiesgoPage({
  searchParams,
}: {
  searchParams: Promise<{ system?: string }>;
}) {
  const { system } = await searchParams;
  const systems = isSupabaseConfigured ? await getSystemsForSelect() : [];
  const preset = system && systems.some((s) => s.id === system) ? system : undefined;

  return (
    <>
      <PageHeader
        title="Evaluar riesgo de un sistema"
        subtitle="Responde el cuestionario guiado y obtén la clasificación según el EU AI Act."
      />
      <div className="mb-5">
        <Link
          href="/dashboard/riesgo"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          ← Volver a clasificación de riesgo
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
