"use client";

import {
  updateTaskStatus,
  updateTaskAssignee,
  updateTaskDueDate,
  deleteActionTask,
} from "@/lib/data/action-tasks-actions";
import { TASK_STATUS_ORDER, type TaskStatus } from "@/lib/mock-data";
import { ConfirmSubmit } from "@/components/dashboard/ConfirmSubmit";
import { useT } from "@/lib/i18n/provider";

const selectCls =
  "rounded-lg border border-line-strong bg-paper px-2.5 py-1 text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

/** Selector de estado de una tarea (autoenvía). */
export function TaskStatusControl({
  id,
  status,
}: {
  id: string;
  status: TaskStatus;
}) {
  const c = useT().dashboard.controls;
  return (
    <form action={updateTaskStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        aria-label={c.task.statusAria}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={selectCls}
      >
        {TASK_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {c.taskStatus[s]}
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
  const c = useT().dashboard.controls;
  return (
    <form action={updateTaskAssignee}>
      <input type="hidden" name="id" value={id} />
      <select
        name="assigneeId"
        defaultValue={assigneeId ?? ""}
        aria-label={c.task.assigneeAria}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={selectCls}
      >
        <option value="">{c.task.noAssignee}</option>
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
  const c = useT().dashboard.controls;
  return (
    <form action={updateTaskDueDate}>
      <input type="hidden" name="id" value={id} />
      <input
        type="date"
        name="dueDate"
        defaultValue={dueDate ?? ""}
        aria-label={c.task.dueDateAria}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={selectCls}
      />
    </form>
  );
}

/** Botón para eliminar una tarea (con confirmación). */
export function DeleteTaskButton({ id, title }: { id: string; title: string }) {
  const c = useT().dashboard.controls.task;
  return (
    <ConfirmSubmit
      action={deleteActionTask}
      fields={{ id }}
      title={c.deleteTitle}
      message={`${c.deleteMessageBefore}${title}${c.deleteMessageAfter}`}
      confirmLabel={c.deleteConfirm}
      triggerLabel={c.deleteTrigger}
      triggerAriaLabel={c.deleteAria}
      triggerClassName="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
    />
  );
}
