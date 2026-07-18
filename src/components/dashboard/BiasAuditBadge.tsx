import {
  BIAS_STATUS_LABEL,
  BIAS_STATUS_TONE,
  type BiasAuditStatus,
} from "@/lib/bias-audit";

const TONE_CLS: Record<string, string> = {
  danger:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  warn: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  good: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  neutral:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

/** Texto de cuenta atrás a partir de los días que faltan. */
function countdownText(days: number | null): string | null {
  if (days === null) return null;
  if (days < 0) return `venció hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "vence hoy";
  return `vence en ${days} día${days === 1 ? "" : "s"}`;
}

/**
 * Pill de estado de la auditoría de sesgo (NYC LL144), con cuenta atrás opcional.
 * Orientativo — no es un juicio de cumplimiento.
 */
export function BiasAuditBadge({
  status,
  days,
}: {
  status: BiasAuditStatus;
  days?: number | null;
}) {
  const tone = BIAS_STATUS_TONE[status];
  const countdown =
    status === "vigente" || status === "por_vencer" || status === "vencida"
      ? countdownText(days ?? null)
      : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLS[tone]}`}
    >
      {BIAS_STATUS_LABEL[status]}
      {countdown && <span className="font-normal opacity-80">· {countdown}</span>}
    </span>
  );
}
