import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/Button";
import { DeleteSystemButton } from "@/components/dashboard/DeleteSystemButton";
import { getSystemById, isSupabaseConfigured } from "@/lib/data";
import { updateAiSystem } from "@/lib/data/actions";

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default async function EditarSistemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const system = isSupabaseConfigured ? await getSystemById(id) : null;

  return (
    <>
      <PageHeader
        title="Editar sistema"
        subtitle="Actualiza los datos del sistema o elimínalo del inventario."
      />
      <div className="mb-5">
        <Link
          href="/dashboard/inventario"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          ← Volver al inventario
        </Link>
      </div>

      {!system ? (
        <div className="max-w-xl rounded-2xl border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] p-6 text-sm text-[var(--tone-warn-fg)]">
          No se encontró el sistema, o la edición no está disponible en modo demo.
        </div>
      ) : (
        <>
          <form
            action={updateAiSystem}
            className="max-w-xl space-y-5 rounded-2xl border border-line bg-paper-raised p-6"
          >
            <input type="hidden" name="id" value={system.id} />
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink">
                Nombre del sistema *
              </label>
              <input id="name" name="name" required defaultValue={system.name} className={field} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="owner" className="block text-sm font-medium text-ink">
                  Área responsable
                </label>
                <input id="owner" name="owner" defaultValue={system.owner} className={field} />
              </div>
              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-ink">
                  Dominio de uso
                </label>
                <input id="domain" name="domain" defaultValue={system.domain} className={field} />
              </div>
              <div>
                <label htmlFor="vendor" className="block text-sm font-medium text-ink">
                  Proveedor
                </label>
                <input id="vendor" name="vendor" defaultValue={system.vendor} className={field} />
              </div>
              <div>
                <label htmlFor="actor_role" className="block text-sm font-medium text-ink">
                  Vuestro rol
                </label>
                <select
                  id="actor_role"
                  name="actor_role"
                  className={field}
                  defaultValue={system.actorRole}
                >
                  <option value="deployer">Deployer (usamos el sistema)</option>
                  <option value="provider">Provider (lo desarrollamos)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Guardar cambios</Button>
              <Link
                href="/dashboard/inventario"
                className="inline-flex items-center justify-center rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper-sunken"
              >
                Cancelar
              </Link>
            </div>
          </form>

          <div className="mt-6 max-w-xl rounded-2xl border border-line bg-paper-raised p-6">
            <h2 className="font-display text-sm font-semibold text-ink">Zona de peligro</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Eliminar el sistema borra también sus evaluaciones y brechas.
            </p>
            <div className="mt-4">
              <DeleteSystemButton id={system.id} name={system.name} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
