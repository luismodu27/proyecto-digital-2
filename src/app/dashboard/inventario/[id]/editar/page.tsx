import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { DeleteSystemButton } from "@/components/dashboard/DeleteSystemButton";
import { AssessmentHistory } from "@/components/dashboard/AssessmentHistory";
import {
  getSystemById,
  getSystemAssessments,
  getSystemBiasAudit,
  isSupabaseConfigured,
} from "@/lib/data";
import { updateAiSystem, saveBiasAudit } from "@/lib/data/actions";
import { BiasAuditBadge } from "@/components/dashboard/BiasAuditBadge";
import {
  biasAuditStatus,
  nextBiasAuditDue,
  daysUntilDate,
  publicationComplete,
} from "@/lib/bias-audit";

export const dynamic = "force-dynamic";

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

export default async function EditarSistemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Los tres getters filtran por org y por id: con un id inexistente devuelven
  // null/[]. Son independientes entre sí, así que van en paralelo (1 round-trip
  // en vez de 3 en cascada).
  let system: Awaited<ReturnType<typeof getSystemById>> = null;
  let assessments: Awaited<ReturnType<typeof getSystemAssessments>> = [];
  let bias: Awaited<ReturnType<typeof getSystemBiasAudit>> = null;
  if (isSupabaseConfigured) {
    [system, assessments, bias] = await Promise.all([
      getSystemById(id),
      getSystemAssessments(id),
      getSystemBiasAudit(id),
    ]);
  }
  const now = new Date();
  const biasStatus = bias ? biasAuditStatus(bias, now) : null;
  const biasDue = bias ? nextBiasAuditDue(bias.lastAuditDate) : null;
  const biasDays = daysUntilDate(biasDue, now);

  return (
    <>
      <PageHeader
        title="Editar sistema"
        subtitle="Actualiza los datos del sistema o elimínalo del inventario."
        action={
          system ? (
            <ButtonLink
              href={`/dashboard/inventario/${system.id}/dossier`}
              variant="outline"
            >
              ⬇ Generar dossier
            </ButtonLink>
          ) : undefined
        }
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
              <SubmitButton pendingText="Guardando…">Guardar cambios</SubmitButton>
              <Link
                href="/dashboard/inventario"
                className="inline-flex items-center justify-center rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper-sunken"
              >
                Cancelar
              </Link>
            </div>
          </form>

          <div className="mt-6 max-w-xl rounded-2xl border border-line bg-paper-raised p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-base font-semibold text-ink">
                Historial de evaluaciones
              </h2>
              <ButtonLink
                href={`/dashboard/riesgo/evaluar?system=${system.id}`}
                variant="outline"
                className="px-4 py-2 text-xs"
              >
                + Evaluar
              </ButtonLink>
            </div>
            <p className="mb-5 mt-1 text-sm text-ink-soft">
              Cada clasificación guardada queda registrada, con su nivel de respaldo
              y quién la atestó.
            </p>
            <AssessmentHistory assessments={assessments} />
          </div>

          {bias && biasStatus && (
            <div className="mt-6 max-w-xl rounded-2xl border border-line bg-paper-raised p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-base font-semibold text-ink">
                  Auditoría de sesgo (EE. UU. · NYC LL144)
                </h2>
                {bias.isAedt && <BiasAuditBadge status={biasStatus} days={biasDays} />}
              </div>
              <p className="mb-4 mt-1 text-sm text-ink-soft">
                Si esta herramienta es un AEDT usado en Nueva York, registra la
                evidencia de su auditoría de sesgo independiente. Attesta{" "}
                <span className="font-medium text-ink">registra</span> lo que declaras;
                no realiza ni valida la auditoría. Orientativo, no asesoría legal.
              </p>

              {bias.isAedt && !publicationComplete(bias) && (
                <p className="mb-4 rounded-lg border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] px-3 py-2 text-xs text-[var(--tone-warn-fg)]">
                  Falta registrar la publicación del resumen (URL y fecha). LL144 exige
                  auditoría, publicación y aviso — se comprueban por separado.
                </p>
              )}

              <form action={saveBiasAudit} className="space-y-4">
                <input type="hidden" name="id" value={system.id} />

                <label className="flex items-start gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="is_aedt"
                    defaultChecked={bias.isAedt}
                    className="mt-0.5 size-4 rounded border-line-strong text-brand focus:ring-brand"
                  />
                  <span>
                    Es un <span className="font-medium">AEDT</span> (herramienta
                    automatizada de decisión de empleo) usado para puestos en NYC.
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="last_bias_audit_date"
                      className="block text-sm font-medium text-ink"
                    >
                      Fecha de la última auditoría
                    </label>
                    <input
                      id="last_bias_audit_date"
                      name="last_bias_audit_date"
                      type="date"
                      defaultValue={bias.lastAuditDate ?? ""}
                      className={field}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="independent_auditor_name"
                      className="block text-sm font-medium text-ink"
                    >
                      Auditor independiente
                    </label>
                    <input
                      id="independent_auditor_name"
                      name="independent_auditor_name"
                      defaultValue={bias.auditorName ?? ""}
                      placeholder="Nombre del despacho / auditor"
                      className={field}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bias_audit_summary_url"
                      className="block text-sm font-medium text-ink"
                    >
                      URL del resumen publicado
                    </label>
                    <input
                      id="bias_audit_summary_url"
                      name="bias_audit_summary_url"
                      type="url"
                      defaultValue={bias.summaryUrl ?? ""}
                      placeholder="https://…"
                      className={field}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="summary_published_date"
                      className="block text-sm font-medium text-ink"
                    >
                      Fecha de publicación del resumen
                    </label>
                    <input
                      id="summary_published_date"
                      name="summary_published_date"
                      type="date"
                      defaultValue={bias.summaryPublishedDate ?? ""}
                      className={field}
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="auditor_independence_confirmed"
                    defaultChecked={bias.auditorIndependenceConfirmed}
                    className="mt-0.5 size-4 rounded border-line-strong text-brand focus:ring-brand"
                  />
                  <span>
                    Confirmo que el auditor cumple los criterios de{" "}
                    <span className="font-medium">independencia</span> (sin implicación
                    en desarrollar/usar la herramienta ni interés financiero).
                  </span>
                </label>

                {biasDue && bias.isAedt && (
                  <p className="text-xs text-muted">
                    Próxima auditoría (12 meses desde la última):{" "}
                    <span className="font-medium tabular-nums text-ink-soft">
                      {biasDue}
                    </span>
                  </p>
                )}

                <SubmitButton pendingText="Guardando…">Guardar auditoría de sesgo</SubmitButton>
              </form>
            </div>
          )}

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
