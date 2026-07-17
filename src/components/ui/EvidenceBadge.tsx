import { EVIDENCE_LABEL, type EvidenceState } from "@/lib/mock-data";

const styles: Record<EvidenceState, string> = {
  declared:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
  evidenced:
    "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  reviewed:
    "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
};

/** Nivel de respaldo de una autoevaluación (declarado / con evidencia / revisado). */
export function EvidenceBadge({ state }: { state?: EvidenceState }) {
  const s = state ?? "declared";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[s]}`}
      title="Nivel de respaldo de la autoevaluación"
    >
      <span className="size-1.5 rounded-full bg-current" />
      {EVIDENCE_LABEL[s]}
    </span>
  );
}
