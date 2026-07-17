import { EVIDENCE_LABEL, type EvidenceState } from "@/lib/mock-data";

const styles: Record<EvidenceState, string> = {
  declared: "bg-paper-sunken text-ink-soft border-line-strong",
  evidenced: "bg-brand-soft text-brand-strong border-[#bfdccf]",
  reviewed: "bg-[#e8eef7] text-[#33507e] border-[#c3d2ea]",
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
