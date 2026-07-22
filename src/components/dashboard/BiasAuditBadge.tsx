import {
  BIAS_STATUS_TONE,
  type BiasAuditStatus,
} from "@/lib/bias-audit";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

const TONE_CLS: Record<string, string> = {
  danger:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  warn: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  good: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  neutral:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

type BiasDict = ReturnType<typeof getDictionary>["dashboard"]["bias"];

/** Texto de cuenta atrás a partir de los días que faltan (chrome de UI). */
function countdownText(days: number | null, t: BiasDict): string | null {
  if (days === null) return null;
  if (days < 0) {
    const n = Math.abs(days);
    return `${t.overduePrefix}${n} ${n === 1 ? t.dayOne : t.dayOther}${t.overdueSuffix}`;
  }
  if (days === 0) return t.today;
  return `${t.upcomingPrefix}${days} ${days === 1 ? t.dayOne : t.dayOther}`;
}

/**
 * Pill de estado de la auditoría de sesgo (NYC LL144), con cuenta atrás opcional.
 * Orientativo — no es un juicio de cumplimiento.
 *
 * Es un Server Component compartido por varias páginas (dossier, editar), así que
 * resuelve el locale por su cuenta (cookie) y no exige que cada página se lo pase.
 * Solo se traduce el chrome del badge; el tono/severidad viene de `bias-audit`.
 */
export async function BiasAuditBadge({
  status,
  days,
}: {
  status: BiasAuditStatus;
  days?: number | null;
}) {
  const t = getDictionary(await resolveLocale()).dashboard.bias;
  const tone = BIAS_STATUS_TONE[status];
  const countdown =
    status === "vigente" || status === "por_vencer" || status === "vencida"
      ? countdownText(days ?? null, t)
      : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLS[tone]}`}
    >
      {t.labels[status]}
      {countdown && <span className="font-normal opacity-80">· {countdown}</span>}
    </span>
  );
}
