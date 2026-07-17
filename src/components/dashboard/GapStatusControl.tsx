import { updateGapStatus } from "@/lib/data/actions";
import type { GapItem } from "@/lib/mock-data";

const options: { value: GapItem["status"]; label: string; active: string }[] = [
  {
    value: "missing",
    label: "Falta",
    active: "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)]",
  },
  {
    value: "partial",
    label: "Parcial",
    active: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)]",
  },
  {
    value: "done",
    label: "Cubierto",
    active: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)]",
  },
];

/** Control segmentado para cambiar el estado de una brecha (modo conectado). */
export function GapStatusControl({
  id,
  status,
}: {
  id: string;
  status: GapItem["status"];
}) {
  return (
    <form
      action={updateGapStatus}
      className="flex shrink-0 gap-1 rounded-full border border-line bg-paper p-1"
    >
      <input type="hidden" name="id" value={id} />
      {options.map((o) => {
        const isActive = o.value === status;
        return (
          <button
            key={o.value}
            name="status"
            value={o.value}
            aria-pressed={isActive}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? o.active
                : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </form>
  );
}
