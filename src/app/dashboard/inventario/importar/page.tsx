import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { CsvImporter } from "@/components/dashboard/CsvImporter";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

/**
 * Importación masiva del inventario por CSV.
 *
 * Es la respuesta al muro de activación nº 1: una organización mid-market llega
 * con decenas de sistemas de IA ya en uso, casi siempre en una hoja de cálculo.
 * Sin inventario, riesgo/brechas/dossier están vacíos y el producto no demuestra
 * nada.
 *
 * No está detrás del muro de pago a propósito: el plan gratuito incluye
 * Inventario y Riesgo, y cobrar por *entrar* los datos sería cobrar por la parte
 * que hace que el resto valga algo.
 */
export default async function ImportarPage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale).dashboard.inventory;

  return (
    <>
      <PageHeader title={t.import.title} subtitle={t.import.subtitle} />
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
        <CsvImporter locale={locale} />
      )}
    </>
  );
}
