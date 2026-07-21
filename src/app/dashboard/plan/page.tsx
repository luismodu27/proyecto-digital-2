import type { ReactNode } from "react";
import { PageHeader } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { LegalNote, LEGAL_FOOTER } from "@/components/ui/LegalNote";
import {
  TaskStatusControl,
  TaskAssigneeControl,
  TaskDueDateControl,
  DeleteTaskButton,
} from "@/components/dashboard/TaskControls";
import { createActionTask } from "@/lib/data/action-tasks-actions";
import {
  getAiSystems,
  getGapItems,
  getActionTasks,
  getOrgMembers,
  getSystemsForSelect,
} from "@/lib/data";
import {
  TASK_STATUS_LABEL,
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_ORDER,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/mock-data";
import { buildActionPlan, type Priority } from "@/lib/recommendations";
import { isTaskOverdue } from "@/lib/task-reminders";

export const dynamic = "force-dynamic";

const PRIORITY_TONE: Record<TaskPriority, string> = {
  critica:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  alta: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  media: "bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)] border-[var(--tone-gold-bd)]",
  baja: "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

const STATUS_TONE: Record<TaskStatus, string> = {
  todo: "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
  in_progress:
    "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
  blocked:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  done: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
};

// La prioridad derivada usa acentos; el modelo de tareas usa ascii.
const PRIORITY_ASCII: Record<Priority, TaskPriority> = {
  crítica: "critica",
  alta: "alta",
  media: "media",
};

function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export default async function PlanPage() {
  const [systems, gaps, tasks, members, systemOpts] = await Promise.all([
    getAiSystems(),
    getGapItems(),
    getActionTasks(),
    getOrgMembers(),
    getSystemsForSelect(),
  ]);

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const memberOpts = members.map((m) => ({ userId: m.userId, email: m.email }));

  // Sugerencias derivadas aún no añadidas al plan (dedupe por sourceKey).
  const taskedKeys = new Set(
    tasks.map((t) => t.sourceKey).filter((k): k is string => Boolean(k)),
  );
  const suggestions = buildActionPlan(systems, gaps).filter(
    (r) => !taskedKeys.has(r.id),
  );

  const counts: Record<TaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
  };
  for (const t of tasks) counts[t.status] += 1;
  const openCount = tasks.length - counts.done;
  const overdueCount = tasks.filter((t) => isTaskOverdue(t, todayIso)).length;

  // Orden: activas primero (por prioridad, luego vencimiento), hechas al final.
  const sorted = [...tasks].sort((a, b) => {
    const doneA = a.status === "done" ? 1 : 0;
    const doneB = b.status === "done" ? 1 : 0;
    if (doneA !== doneB) return doneA - doneB;
    const pa = TASK_PRIORITY_ORDER.indexOf(a.priority);
    const pb = TASK_PRIORITY_ORDER.indexOf(b.priority);
    if (pa !== pb) return pa - pb;
    return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
  });

  return (
    <>
      <PageHeader
        title="Plan de acción"
        subtitle="Tareas priorizadas para cerrar tus brechas: asigna responsable, fecha y estado."
        action={
          <ButtonLink href="/dashboard/gap/informe" variant="outline">
            ⬇ Exportar evidencia
          </ButtonLink>
        }
      />

      {/* Resumen por estado */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-paper-raised p-4">
          <p className="font-display text-2xl font-semibold text-ink">
            {openCount}
          </p>
          <p className="mt-0.5 text-xs text-muted">abiertas</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-raised p-4">
          <p className="font-display text-2xl font-semibold text-ink">
            {counts.in_progress}
          </p>
          <p className="mt-0.5 text-xs text-muted">en curso</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-raised p-4">
          <p
            className={`font-display text-2xl font-semibold ${overdueCount > 0 ? "text-[var(--tone-danger-fg)]" : "text-ink"}`}
          >
            {overdueCount}
          </p>
          <p className="mt-0.5 text-xs text-muted">vencidas</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-raised p-4">
          <p className="font-display text-2xl font-semibold text-ink">
            {counts.done}
          </p>
          <p className="mt-0.5 text-xs text-muted">hechas</p>
        </div>
      </div>

      {/* Alta manual de tarea */}
      <details className="mt-6 rounded-2xl border border-line bg-paper-raised">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-medium text-ink">+ Añadir tarea</span>
          <span className="text-xs text-muted">Crea una tarea manual</span>
        </summary>
        <form
          action={createActionTask}
          className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-2"
        >
          <input type="hidden" name="source" value="manual" />
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-muted">Título</span>
            <input
              name="title"
              required
              placeholder="Qué hay que hacer"
              className="mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-muted">
              Detalle (opcional)
            </span>
            <textarea
              name="detail"
              rows={2}
              className="mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-muted">Prioridad</span>
            <select
              name="priority"
              defaultValue="media"
              className="mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            >
              {TASK_PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-medium text-muted">Responsable</span>
            <select
              name="assigneeId"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            >
              <option value="">Sin responsable</option>
              {memberOpts.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-medium text-muted">Fecha límite</span>
            <input
              type="date"
              name="dueDate"
              className="mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-muted">
              Sistema (opcional)
            </span>
            <select
              name="systemId"
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            >
              <option value="">—</option>
              {systemOpts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Añadir al plan
            </button>
          </div>
        </form>
      </details>

      {/* Tablero de tareas */}
      {tasks.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-paper-raised px-6 py-12 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Tu plan está vacío
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Añade una tarea o incorpora las sugerencias de abajo, generadas a
            partir de tus brechas y niveles de riesgo.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {sorted.map((t) => {
            const overdue = isTaskOverdue(t, todayIso);
            return (
              <article
                key={t.id}
                className={`rounded-2xl border bg-paper-raised p-5 ${
                  t.status === "done"
                    ? "border-line opacity-70"
                    : "border-line"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Pill className={PRIORITY_TONE[t.priority]}>
                    {TASK_PRIORITY_LABEL[t.priority]}
                  </Pill>
                  <Pill className={STATUS_TONE[t.status]}>
                    {TASK_STATUS_LABEL[t.status]}
                  </Pill>
                  {t.article && (
                    <span className="rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-[11px] text-seal">
                      {t.article}
                    </span>
                  )}
                  {t.systemName && (
                    <span className="text-xs text-muted">· {t.systemName}</span>
                  )}
                  {t.source === "recommendation" && (
                    <span className="text-[11px] text-muted">· sugerida</span>
                  )}
                </div>

                <p
                  className={`mt-2 font-medium text-ink ${t.status === "done" ? "line-through" : ""}`}
                >
                  {t.title}
                </p>
                {t.detail && (
                  <p className="mt-0.5 text-sm text-ink-soft">{t.detail}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3">
                  <TaskStatusControl id={t.id} status={t.status} />
                  <TaskAssigneeControl
                    id={t.id}
                    assigneeId={t.assigneeId}
                    members={memberOpts}
                  />
                  <div className="flex items-center gap-1.5">
                    <TaskDueDateControl id={t.id} dueDate={t.dueDate} />
                    {overdue && (
                      <span className="text-[11px] font-medium text-[var(--tone-danger-fg)]">
                        vencida
                      </span>
                    )}
                  </div>
                  <div className="ml-auto">
                    <DeleteTaskButton id={t.id} title={t.title} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Sugerencias derivadas (aún no añadidas) */}
      {suggestions.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Sugerencias
          </h3>
          <p className="mb-3 text-sm text-muted">
            Generadas a partir de tus brechas abiertas y niveles de riesgo.
            Añádelas al plan para asignarles responsable y fecha.
          </p>
          <div className="space-y-3">
            {suggestions.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill className={PRIORITY_TONE[PRIORITY_ASCII[r.priority]]}>
                      {TASK_PRIORITY_LABEL[PRIORITY_ASCII[r.priority]]}
                    </Pill>
                    <span className="rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-[11px] text-seal">
                      {r.article}
                    </span>
                    {r.systems && r.systems.length > 0 && (
                      <span className="text-xs text-muted">
                        · {r.systems.length}{" "}
                        {r.systems.length === 1 ? "sistema" : "sistemas"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 font-medium text-ink">{r.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{r.action}</p>
                </div>
                <form action={createActionTask} className="shrink-0">
                  <input type="hidden" name="source" value="recommendation" />
                  <input type="hidden" name="sourceKey" value={r.id} />
                  <input type="hidden" name="title" value={r.title} />
                  <input type="hidden" name="detail" value={r.action} />
                  <input type="hidden" name="article" value={r.article} />
                  <input
                    type="hidden"
                    name="priority"
                    value={PRIORITY_ASCII[r.priority]}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
                  >
                    + Añadir al plan
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      <LegalNote
        text={`Recomendaciones orientativas generadas a partir de tus brechas abiertas y niveles de riesgo declarados. ${LEGAL_FOOTER}`}
        className="mt-8"
      />
    </>
  );
}
