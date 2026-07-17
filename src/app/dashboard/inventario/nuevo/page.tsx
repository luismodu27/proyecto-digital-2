import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/Button";
import { createAiSystem } from "@/lib/data/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function NuevoSistemaPage() {
  return (
    <>
      <PageHeader
        title="Registrar sistema de IA"
        subtitle="Añade un sistema al inventario. Podrás clasificar su riesgo después."
      />
      <div className="mb-5">
        <Link
          href="/dashboard/inventario"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          ← Volver al inventario
        </Link>
      </div>

      {!isSupabaseConfigured ? (
        <div className="max-w-xl rounded-2xl border border-[#e6cba3] bg-[#f7ead8] p-6 text-sm text-[#8a4f14]">
          El alta de sistemas requiere conectar Supabase. En modo demo el
          inventario usa datos de ejemplo. Configura las credenciales para
          empezar a registrar sistemas reales.
        </div>
      ) : (
        <form action={createAiSystem} className="max-w-xl space-y-5 rounded-2xl border border-line bg-paper-raised p-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink">
              Nombre del sistema *
            </label>
            <input id="name" name="name" required className={field} placeholder="Filtro de CVs — Talento" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-ink">
                Área responsable
              </label>
              <input id="owner" name="owner" className={field} placeholder="RRHH" />
            </div>
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-ink">
                Dominio de uso
              </label>
              <input id="domain" name="domain" className={field} placeholder="Contratación" />
            </div>
            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-ink">
                Proveedor
              </label>
              <input id="vendor" name="vendor" className={field} placeholder="Interno / HireFlow…" />
            </div>
            <div>
              <label htmlFor="actor_role" className="block text-sm font-medium text-ink">
                Vuestro rol
              </label>
              <select id="actor_role" name="actor_role" className={field} defaultValue="deployer">
                <option value="deployer">Deployer (usamos el sistema)</option>
                <option value="provider">Provider (lo desarrollamos)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">Registrar sistema</Button>
            <Link
              href="/dashboard/inventario"
              className="inline-flex items-center justify-center rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper-sunken"
            >
              Cancelar
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
