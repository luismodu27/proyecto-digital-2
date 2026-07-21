import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getSystemsForSelect, isSupabaseConfigured } from "@/lib/data";
import { createGapItem } from "@/lib/data/actions";

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

export default async function NuevaBrechaPage() {
  const systems = isSupabaseConfigured ? await getSystemsForSelect() : [];

  return (
    <>
      <PageHeader
        title="Añadir brecha"
        subtitle="Registra un control o requisito pendiente para un sistema."
      />
      <div className="mb-5">
        <Link
          href="/dashboard/gap"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          ← Volver al gap assessment
        </Link>
      </div>

      {!isSupabaseConfigured ? (
        <div className="max-w-xl rounded-2xl border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] p-6 text-sm text-[var(--tone-warn-fg)]">
          Añadir brechas requiere conectar Supabase. En modo demo el gap
          assessment usa datos de ejemplo.
        </div>
      ) : systems.length === 0 ? (
        <div className="max-w-xl rounded-2xl border border-line bg-paper-raised p-6 text-sm text-ink-soft">
          Registra primero un sistema en el inventario para poder añadirle brechas.
        </div>
      ) : (
        <form
          action={createGapItem}
          className="max-w-xl space-y-5 rounded-2xl border border-line bg-paper-raised p-6"
        >
          <div>
            <label htmlFor="systemId" className="block text-sm font-medium text-ink">
              Sistema *
            </label>
            <select id="systemId" name="systemId" required className={field} defaultValue="">
              <option value="" disabled>
                Selecciona un sistema…
              </option>
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="requirement" className="block text-sm font-medium text-ink">
              Requisito / control *
            </label>
            <input
              id="requirement"
              name="requirement"
              required
              className={field}
              placeholder="Supervisión humana efectiva en la decisión"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="article" className="block text-sm font-medium text-ink">
                Artículo
              </label>
              <input id="article" name="article" className={field} placeholder="Art. 26.2" />
            </div>
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-ink">
                Severidad
              </label>
              <select id="severity" name="severity" className={field} defaultValue="media">
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-ink">
                Estado
              </label>
              <select id="status" name="status" className={field} defaultValue="missing">
                <option value="missing">Falta</option>
                <option value="partial">Parcial</option>
                <option value="done">Cubierto</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton pendingText="Añadiendo…">Añadir brecha</SubmitButton>
            <Link
              href="/dashboard/gap"
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
