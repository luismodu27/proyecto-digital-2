import type { Priority, Recommendation } from "@/lib/recommendations";
import { priorityLabel } from "@/lib/recommendations";
import type { Locale } from "@/lib/i18n/config";

const priorityCls: Record<Priority, string> = {
  crítica:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  alta: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  media:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

function PriorityBadge({ p, locale = "es" }: { p: Priority; locale?: Locale }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${priorityCls[p]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {priorityLabel(p, locale)}
    </span>
  );
}

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <article className="card-lift rounded-2xl border border-line bg-paper-raised p-5">
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
export function RecommendationList({
  recs,
  locale = "es",
}: {
  recs: Recommendation[];
  locale?: Locale;
}) {
  return (
    <ul className="space-y-3">
      {recs.map((r) => (
        <li key={r.id} className="flex gap-3">
          <span className="mt-1 shrink-0">
            <PriorityBadge p={r.priority} locale={locale} />
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
