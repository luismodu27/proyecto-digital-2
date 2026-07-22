import { RISK_LABEL, type RiskLevel } from "@/lib/mock-data";

const styles: Record<RiskLevel, string> = {
  unacceptable:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  high: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  limited:
    "bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)] border-[var(--tone-gold-bd)]",
  minimal:
    "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
};

export function RiskBadge({
  level,
  label,
}: {
  level: RiskLevel;
  /**
   * Etiqueta a mostrar. Por defecto la canónica en español (`RISK_LABEL`, usada
   * en el dashboard). La landing en inglés pasa aquí la etiqueta traducida
   * (chrome de UI, no contenido regulatorio).
   */
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[level]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label ?? RISK_LABEL[level]}
    </span>
  );
}
