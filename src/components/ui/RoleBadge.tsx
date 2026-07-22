import { ROLE_LABEL, type MemberRole } from "@/lib/mock-data";

const styles: Record<MemberRole, string> = {
  owner:
    "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  admin:
    "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
  member:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

export function RoleBadge({
  role,
  label,
}: {
  role: MemberRole;
  /**
   * Etiqueta a mostrar. Por defecto la canónica en español (`ROLE_LABEL`). Las
   * vistas i18n (p. ej. Equipo en inglés) pasan aquí la etiqueta traducida
   * (chrome de UI). Mismo patrón que `RiskBadge`.
   */
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[role]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label ?? ROLE_LABEL[role]}
    </span>
  );
}
