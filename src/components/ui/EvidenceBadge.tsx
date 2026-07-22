import { evidenceLabel, type EvidenceState } from "@/lib/mock-data";
import type { Locale } from "@/lib/i18n/config";

const styles: Record<EvidenceState, string> = {
  declared:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
  evidenced:
    "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  reviewed:
    "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
};

// Chrome del estado "sin clasificar" (no hay autoevaluación). Locale-aware; el
// resto del texto de respaldo viene de `evidenceLabel` (mock-data).
const UNCLASSIFIED: Record<Locale, { label: string; title: string }> = {
  es: { label: "Sin clasificar", title: "Este sistema aún no se ha clasificado" },
  en: { label: "Unclassified", title: "This system has not been classified yet" },
};

/**
 * Nivel de respaldo de una autoevaluación (declarado / con evidencia / revisado).
 * `locale` por defecto ES (default seguro): las vistas del dashboard en inglés lo
 * pasan resuelto (server) o vía `useLocale()` (client); los PDF/demo lo omiten y
 * quedan en ES.
 */
export function EvidenceBadge({
  state,
  locale = "es",
}: {
  state?: EvidenceState;
  locale?: Locale;
}) {
  // Sin estado = el sistema aún no se ha clasificado (no hay autoevaluación).
  // Lo mostramos como pendiente, no como "declarado", para no simular respaldo.
  if (!state) {
    const u = UNCLASSIFIED[locale];
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-2 py-0.5 text-xs font-medium text-muted"
        title={u.title}
      >
        <span className="size-1.5 rounded-full bg-current opacity-60" />
        {u.label}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[state]}`}
      title="Nivel de respaldo de la autoevaluación"
    >
      <span className="size-1.5 rounded-full bg-current" />
      {evidenceLabel(state, locale)}
    </span>
  );
}
