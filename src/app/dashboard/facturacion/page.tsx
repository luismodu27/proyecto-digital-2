import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/Button";
import { getActiveOrg } from "@/lib/data/context";
import { getOrgSubscription } from "@/lib/billing/subscription";
import { getOrgPlan, TIER_LABEL } from "@/lib/billing/plan";
import { startCheckout, openBillingPortal } from "@/lib/billing/actions";
import { PLAN_PRICE_LABEL, isStripeConfigured } from "@/lib/stripe/config";

export const dynamic = "force-dynamic";

const PLAN_FEATURES = [
  "Gap assessment + plan de acción",
  "Vigilancia regulatoria continua",
  "Dossier e informe ejecutivo (PDF)",
  "Evidencia y audit-trail",
  "Policy packs (RRHH)",
  "Equipo y roles",
];

const STATUS_LABEL: Record<string, string> = {
  active: "Activa",
  trialing: "En prueba",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Impaga",
  incomplete: "Incompleta",
  incomplete_expired: "Expirada",
  paused: "En pausa",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function FacturacionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const orgId = await getActiveOrg();
  const [sub, plan] = await Promise.all([
    orgId ? getOrgSubscription(orgId) : Promise.resolve(null),
    orgId ? getOrgPlan(orgId) : Promise.resolve("free" as const),
  ]);
  const hasStripeSub = sub?.status === "active" || sub?.status === "trialing";
  // "Desbloqueado" = alcanza Preparación o más (por Stripe, plan manual o Enterprise).
  const unlocked = plan === "preparacion" || plan === "enterprise";
  const isEnterprise = plan === "enterprise";

  return (
    <>
      <PageHeader
        title="Plan y facturación"
        subtitle="Gestiona la suscripción de tu organización."
      />

      {estado === "ok" && (
        <div className="mb-6 rounded-xl border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] px-4 py-3 text-sm text-[var(--tone-good-fg)]">
          ¡Pago recibido! Tu suscripción se activará en unos segundos. Si no ves el
          cambio, recarga la página.
        </div>
      )}
      {estado === "cancelado" && (
        <div className="mb-6 rounded-xl border border-line bg-paper-sunken px-4 py-3 text-sm text-ink-soft">
          Checkout cancelado. No se realizó ningún cargo.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Estado actual */}
        <div className="rounded-2xl border border-line bg-paper-raised p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">
              Plan {TIER_LABEL[plan]}
            </h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                unlocked
                  ? "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)]"
                  : "border-line-strong bg-paper-sunken text-muted"
              }`}
            >
              {hasStripeSub
                ? STATUS_LABEL[sub!.status] ?? "Activa"
                : isEnterprise
                  ? "Enterprise"
                  : unlocked
                    ? "Desbloqueado"
                    : "Gratuito"}
            </span>
          </div>

          {unlocked ? (
            <>
              {hasStripeSub ? (
                <>
                  <p className="mt-2 text-sm text-ink-soft">
                    {sub?.cancelAtPeriodEnd
                      ? `Se cancelará el ${fmtDate(sub.currentPeriodEnd)}. Hasta entonces conservas el acceso.`
                      : `Se renueva el ${fmtDate(sub?.currentPeriodEnd ?? null)}.`}
                  </p>
                  <form action={openBillingPortal} className="mt-5">
                    <Button type="submit" variant="outline">
                      Gestionar suscripción
                    </Button>
                  </form>
                  <p className="mt-3 text-xs text-muted">
                    Cambiar método de pago, ver facturas o cancelar — todo en el
                    portal seguro de Stripe.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-ink-soft">
                  {isEnterprise
                    ? "Tu organización tiene el plan Enterprise: acceso completo, varias entidades, SSO y soporte prioritario."
                    : "Tu organización tiene desbloqueada la preparación completa para auditoría. ¡A por ello!"}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink-soft">
                Tu organización usa el plan gratuito (inventario y clasificación de
                riesgo). Desbloquea la preparación completa para auditoría.
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold text-ink">
                  {PLAN_PRICE_LABEL}
                </span>
                <span className="text-sm text-muted">/mes</span>
              </div>
              {isStripeConfigured ? (
                <form action={startCheckout} className="mt-5">
                  <Button type="submit" className="w-full sm:w-auto">
                    Suscribirse a Preparación
                  </Button>
                </form>
              ) : (
                <p className="mt-5 rounded-lg border border-line bg-paper-sunken px-4 py-3 text-sm text-muted">
                  El cobro en línea aún no está activo. Vuelve pronto.
                </p>
              )}
            </>
          )}
        </div>

        {/* Qué incluye */}
        <div className="rounded-2xl border border-line bg-paper-raised p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Qué incluye Preparación
          </h2>
          <ul className="mt-4 space-y-2.5">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink">
                <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden>
                  <path
                    d="m3.5 8.5 3 3 6-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-muted">
            ¿Necesitas varias entidades, SSO o soporte prioritario? Escríbenos para el
            plan Enterprise.
          </p>
        </div>
      </div>

      {/* Exportación de datos (portabilidad) */}
      <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink">
              Exportar datos
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              Descarga una copia completa de la evidencia declarada de tu
              organización en un archivo <span className="font-medium">JSON</span>{" "}
              portable: inventario de sistemas, evaluaciones de riesgo, brechas,
              plan de acción, auditorías de sesgo, equipo, revisiones regulatorias
              y el registro de actividad con su verificación de integridad. Tus
              datos son tuyos: úsalo para respaldo o para llevártelos.
            </p>
          </div>
          <a
            href="/api/export"
            download
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
              <path
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Descargar JSON
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">
          Es un volcado de tus datos, no un informe ni una certificación. Para el
          dossier o el informe ejecutivo en PDF, usa las secciones de Inventario e
          Informe.
        </p>
      </div>
    </>
  );
}
