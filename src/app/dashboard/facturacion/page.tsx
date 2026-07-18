import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/Button";
import { getActiveOrg } from "@/lib/data/context";
import { getOrgSubscription, isBillingEnforced } from "@/lib/billing/subscription";
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
  const sub = orgId ? await getOrgSubscription(orgId) : null;
  const enforced = isBillingEnforced();
  const isActive = sub?.status === "active" || sub?.status === "trialing";

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
              {isActive ? "Plan Preparación" : "Plan Diagnóstico"}
            </h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                isActive
                  ? "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)]"
                  : "border-line-strong bg-paper-sunken text-muted"
              }`}
            >
              {isActive
                ? STATUS_LABEL[sub!.status] ?? "Activa"
                : enforced
                  ? "Gratuito"
                  : "Acceso completo"}
            </span>
          </div>

          {isActive ? (
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
                Cambiar método de pago, ver facturas o cancelar — todo en el portal
                seguro de Stripe.
              </p>
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
    </>
  );
}
