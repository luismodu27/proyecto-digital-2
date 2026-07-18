import { ButtonLink } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { PLAN_PRICE_LABEL } from "@/lib/stripe/config";

/**
 * Pantalla de bloqueo para funciones del plan Preparación cuando la organización
 * no tiene suscripción activa. Se muestra en lugar del contenido de la sección.
 */
export function Paywall({
  feature,
  description,
}: {
  feature: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <div className="rounded-3xl border border-line bg-paper-raised p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden>
            <path
              d="M6 10V8a6 6 0 1112 0v2m-9 0h6a3 3 0 013 3v5a3 3 0 01-3 3H9a3 3 0 01-3-3v-5a3 3 0 013-3Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">
          Función del plan Preparación
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          {feature}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {description ??
            "Desbloquea esta sección con el plan Preparación: la preparación completa para auditoría de tu organización."}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/dashboard/facturacion">
            Ver planes · {PLAN_PRICE_LABEL}/mes
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="ghost">
            Volver al resumen
          </ButtonLink>
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted">
          <SealMark size={14} /> Inventario y clasificación de riesgo siguen
          disponibles en el plan gratuito.
        </p>
      </div>
    </div>
  );
}
