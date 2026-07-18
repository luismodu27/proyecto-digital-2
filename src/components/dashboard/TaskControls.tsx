"use client";

import {
  updateTaskStatus,
  updateTaskAssignee,
  updateTaskDueDate,
  deleteActionTask,
} from "@/lib/data/action-tasks-actions";
import {
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  type TaskStatus,
} from "@/lib/mock-data";
import { ConfirmSubmit } from "@/components/dashboard/ConfirmSubmit";

const selectCls =
  "rounded-lg border border-line-strong bg-paper px-2.5 py-1 text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

/** Selector de estado de una tarea (autoenvía). */
export function TaskStatusControl({
  id,
  status,
}: {
  id: string;
  status: TaskStatus;
}) {
  return (
    <form action={updateTaskStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        aria-label="Estado"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={selectCls}
      >
        {TASK_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {TASK_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </form>
  );
}

/** Selector de responsable (autoenvía). */
export function TaskAssigneeControl({
  id,
  assigneeId,
  members,
}: {
  id: string;
  assigneeId: string | null;
  members: { userId: string; email: string }[];
}) {
  return (
    <form action={updateTaskAssignee}>
      <input type="hidden" name="id" value={id} />
      <select
        name="assigneeId"
        defaultValue={assigneeId ?? ""}
        aria-label="Responsable"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={selectCls}
      >
        <option value="">Sin responsable</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.email}
          </option>
        ))}
      </select>
    </form>
  );
}

/** Fecha límite (autoenvía al cambiar). */
export function TaskDueDateControl({
  id,
  dueDate,
}: {
  id: string;
  dueDate: string | null;
}) {
  return (
    <form action={updateTaskDueDate}>
      <input type="hidden" name="id" value={id} />
      <input
        type="date"
        name="dueDate"
        defaultValue={dueDate ?? ""}
        aria-label="Fecha límite"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={selectCls}
      />
    </form>
  );
}

/** Botón para eliminar una tarea (con confirmación). */
export function DeleteTaskButton({ id, title }: { id: string; title: string }) {
  return (
    <ConfirmSubmit
      action={deleteActionTask}
      fields={{ id }}
      title="Eliminar tarea"
      message={`Se eliminará la tarea «${title}» del plan. Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar"
      triggerLabel="Eliminar"
      triggerAriaLabel="Eliminar tarea"
      triggerClassName="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
    />
  );
}
