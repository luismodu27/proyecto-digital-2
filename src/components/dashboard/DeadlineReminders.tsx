import Link from "next/link";
import type { ActionTask } from "@/lib/data";
import { taskPriorityLabel, type TaskPriority } from "@/lib/mock-data";
import { bucketTaskDeadlines, dueLabel } from "@/lib/task-reminders";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

const PRIORITY_TONE: Record<TaskPriority, string> = {
  critica:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  alta: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  media:
    "bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)] border-[var(--tone-gold-bd)]",
  baja: "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

function ReminderRow({
  task,
  now,
  overdue,
  locale,
}: {
  task: ActionTask;
  now: Date;
  overdue: boolean;
  locale: Locale;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden
          className={`size-1.5 shrink-0 rounded-full ${
            overdue ? "bg-[var(--tone-danger-fg)]" : "bg-[var(--tone-warn-fg)]"
          }`}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{task.title}</p>
          {task.systemName && (
            <p className="truncate text-xs text-muted">{task.systemName}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${PRIORITY_TONE[task.priority]}`}
        >
          {taskPriorityLabel(task.priority, locale)}
        </span>
        <span
          className={`whitespace-nowrap text-xs font-medium tabular-nums ${
            overdue ? "text-[var(--tone-danger-fg)]" : "text-muted"
          }`}
        >
          {task.dueDate ? dueLabel(task.dueDate, now, locale) : ""}
        </span>
      </div>
    </li>
  );
}

/**
 * Widget de vencimientos del plan para el resumen: tareas vencidas y próximas
 * a vencer. No se renderiza si no hay ninguna. Enlaza al plan de acción.
 */
export function DeadlineReminders({
  tasks,
  now,
  limit = 5,
  t,
  locale,
}: {
  tasks: ActionTask[];
  now: Date;
  limit?: number;
  t: Dictionary["dashboard"]["deadlines"];
  locale: Locale;
}) {
  const { overdue, dueSoon } = bucketTaskDeadlines(tasks, now);
  const total = overdue.length + dueSoon.length;
  if (total === 0) return null;

  // Prioriza mostrar vencidas; rellena con próximas hasta el límite.
  const shownOverdue = overdue.slice(0, limit);
  const shownSoon = dueSoon.slice(0, Math.max(0, limit - shownOverdue.length));
  const hidden = total - shownOverdue.length - shownSoon.length;

  return (
    <section className="card-lift mt-6 rounded-2xl border border-line bg-paper-raised p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t.title}
          </h2>
          {overdue.length > 0 && (
            <span className="inline-flex items-center rounded-full border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tone-danger-fg)]">
              {overdue.length} {overdue.length === 1 ? t.overdueOne : t.overdueOther}
            </span>
          )}
        </div>
        <Link
          href="/dashboard/plan"
          className="shrink-0 text-sm font-medium text-brand hover:text-brand-strong"
        >
          {t.viewPlan}
        </Link>
      </div>

      <ul className="mt-2 divide-y divide-line">
        {shownOverdue.map((t) => (
          <ReminderRow key={t.id} task={t} now={now} overdue locale={locale} />
        ))}
        {shownSoon.map((t) => (
          <ReminderRow key={t.id} task={t} now={now} overdue={false} locale={locale} />
        ))}
      </ul>

      {hidden > 0 && (
        <p className="mt-3 text-xs text-muted">
          {t.morePrefix}
          {hidden} {hidden === 1 ? t.moreTaskOne : t.moreTaskOther}
          {t.moreSuffix}
        </p>
      )}
    </section>
  );
}
