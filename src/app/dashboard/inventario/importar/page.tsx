import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { CsvImporter } from "@/components/dashboard/CsvImporter";
import { IntakeManager } from "@/components/dashboard/IntakeManager";
import { getIntakeLinks, getIntakeSubmissions } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

/**
 * Alta masiva de inventario: enlace de intake compartible + importación por CSV.
 *
 * Es la respuesta al muro de activación nº 1. Y son DOS problemas distintos, por
 * eso hay dos caminos: el CSV sirve cuando la organización YA tiene la lista (casi
 * siempre en una hoja de cálculo); el enlace de intake sirve para CONSTRUIRLA,
 * porque quien contrata Attesta (Legal, Compliance) normalmente no sabe qué IA usa
 * cada área — eso lo sabe RRHH, Marketing o Soporte, y a esa gente no se le va a
 * dar una cuenta.
 *
 * Nada de esto va detrás del muro de pago a propósito: el plan gratuito incluye
 * Inventario y Riesgo, y cobrar por *meter* los datos sería cobrar por la parte que
 * hace que el resto valga algo.
 */
// La bandeja de intake tiene que verse al instante después de aceptar o revocar.
export const dynamic = "force-dynamic";

export default async function ImportarPage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale).dashboard.inventory;
  const [links, submissions] = await Promise.all([
    getIntakeLinks(),
    getIntakeSubmissions(),
  ]);

  return (
    <>
      <PageHeader title={t.addTitle} subtitle={t.addSubtitle} />
      <div className="mb-5">
        <Link
          href="/dashboard/inventario"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          {t.backToInventory}
        </Link>
      </div>

      {!isSupabaseConfigured ? (
        <div className="max-w-xl rounded-2xl border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] p-6 text-sm text-[var(--tone-warn-fg)]">
          {t.import.demoNotice}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Dos caminos para el mismo problema: el CSV sirve cuando YA tienes la
              lista; el enlace de intake sirve para construirla preguntando a cada
              área. La bandeja va dentro de `IntakeManager` y se pinta primero
              cuando hay fichas pendientes, porque es lo que exige acción. */}
          <IntakeManager
            links={links}
            submissions={submissions}
            t={t.intake}
            locale={locale}
          />
          <CsvImporter locale={locale} />
        </div>
      )}
    </>
  );
}
