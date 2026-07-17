import type { Priority, Recommendation } from "@/lib/recommendations";

const priorityCls: Record<Priority, string> = {
  crítica: "bg-[#f7e4e2] text-[#8f271f] border-[#e6b6b1]",
  alta: "bg-[#f7ead8] text-[#8a4f14] border-[#e6cba3]",
  media: "bg-paper-sunken text-ink-soft border-line-strong",
};

function PriorityBadge({ p }: { p: Priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${priorityCls[p]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {p}
    </span>
  );
}

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <article className="rounded-2xl border border-line bg-paper-raised p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-seal">
            {rec.article}
          </span>
          <PriorityBadge p={rec.priority} />
        </div>
        <span className="text-xs text-muted">Esfuerzo: {rec.effort}</span>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-ink">
        {rec.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{rec.action}</p>
      {rec.systems && rec.systems.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rec.systems.map((s) => (
            <span
              key={s}
              className="rounded-md border border-line bg-paper px-2 py-0.5 text-xs text-ink"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

/** Lista compacta (para el resultado del asistente). */
export function RecommendationList({ recs }: { recs: Recommendation[] }) {
  return (
    <ul className="space-y-3">
      {recs.map((r) => (
        <li key={r.id} className="flex gap-3">
          <span className="mt-1 shrink-0">
            <PriorityBadge p={r.priority} />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">
              {r.title}{" "}
              <span className="font-mono text-xs font-normal text-seal">
                · {r.article}
              </span>
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">{r.action}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
