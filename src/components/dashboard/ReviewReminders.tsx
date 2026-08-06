import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { collectReviewsDue, type ReviewState } from "@/lib/incidents/review";
import type { AiSystem } from "@/lib/data";

const TONE: Record<ReviewState, string> = {
  overdue:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  unknown:
    "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  due_soon:
    "bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)] border-[var(--tone-gold-bd)]",
  ok: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
};

/**
 * Aviso de revisiones en la portada. Solo aparece si hay algo que decir.
 *
 * Deliberadamente SIN cuenta atrás y sin lenguaje de plazo: la cadencia es una
 * elección de la organización, no un vencimiento legal. El texto de buena
 * práctica vive en la sección de incidentes, a un clic; repetirlo aquí en un
 * widget de cinco líneas lo convertiría en ruido que nadie lee.
 */
export function ReviewReminders({
  systems,
  cadenceDays,
  now,
  limit = 4,
  t,
}: {
  systems: AiSystem[];
  cadenceDays: number;
  now: Date;
  limit?: number;
  t: Dictionary["dashboard"]["pages"]["incidents"];
}) {
  const due = collectReviewsDue(systems, cadenceDays, now);
  if (due.length === 0) return null;

  const shown = due.slice(0, limit);
  const hidden = due.length - shown.length;
  const overdue = due.filter((r) => r.state === "overdue").length;

  return (
    <section className="card-lift mt-6 rounded-2xl border border-line bg-paper-raised p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t.reviewTitle}
          </h2>
          {overdue > 0 && (
            <span className="inline-flex items-center rounded-full border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tone-danger-fg)]">
              {overdue}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/incidentes"
          className="shrink-0 text-sm font-medium text-brand hover:text-brand-strong"
        >
          {t.reviewViewAll}
        </Link>
      </div>

      <ul className="mt-2 divide-y divide-line">
        {shown.map((r) => (
          <li
            key={r.systemId}
            className="flex items-center justify-between gap-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {r.systemName}
              </p>
              <p className="truncate text-xs tabular-nums text-muted">
                {t.reviewLastPrefix}
                {r.lastReviewed ?? t.reviewNever}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${TONE[r.state]}`}
            >
              {t.reviewStateLabel[r.state]}
            </span>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <p className="mt-3 text-xs text-muted">
          {t.reviewMorePrefix}
          {hidden}
          {t.reviewMoreSuffix}
        </p>
      )}
    </section>
  );
}
