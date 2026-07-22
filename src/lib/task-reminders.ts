import type { ActionTask } from "@/lib/mock-data";
import { daysUntil } from "@/lib/regulatory-watch";
import type { Locale } from "@/lib/i18n/config";

/** Ventana por defecto (días) para considerar una tarea "próxima a vencer". */
export const SOON_WINDOW_DAYS = 14;

/** Una tarea está vencida si no está hecha y su fecha límite ya pasó. */
export function isTaskOverdue(t: ActionTask, todayIso: string): boolean {
  return t.status !== "done" && t.dueDate != null && t.dueDate < todayIso;
}

export type TaskReminders = {
  /** Vencidas (no hechas, fecha < hoy), de la más atrasada a la menos. */
  overdue: ActionTask[];
  /** Próximas a vencer (no hechas, hoy ≤ fecha ≤ hoy+ventana), de antes a después. */
  dueSoon: ActionTask[];
};

/**
 * Reparte las tareas con fecha en dos cubos: vencidas y próximas a vencer.
 * Determinista y puro (recibe `now`). Ignora tareas hechas o sin fecha.
 */
export function bucketTaskDeadlines(
  tasks: ActionTask[],
  now: Date,
  soonDays: number = SOON_WINDOW_DAYS,
): TaskReminders {
  const todayIso = now.toISOString().slice(0, 10);
  const overdue: ActionTask[] = [];
  const dueSoon: ActionTask[] = [];

  for (const t of tasks) {
    if (t.status === "done" || t.dueDate == null) continue;
    if (t.dueDate < todayIso) {
      overdue.push(t);
    } else {
      const d = daysUntil(t.dueDate, now);
      if (d <= soonDays) dueSoon.push(t);
    }
  }

  // Vencidas: la más atrasada primero (fecha más antigua arriba).
  overdue.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  // Próximas: la que vence antes, primero.
  dueSoon.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  return { overdue, dueSoon };
}

/**
 * Texto relativo de vencimiento ("vence hoy", "hace 3 días"…). Locale-aware
 * (chrome de UI); por defecto ES para no romper llamadores no migrados.
 */
export function dueLabel(dueIso: string, now: Date, locale: Locale = "es"): string {
  const d = daysUntil(dueIso, now);
  if (locale === "en") {
    if (d < 0) {
      const n = Math.abs(d);
      return `overdue by ${n} ${n === 1 ? "day" : "days"}`;
    }
    if (d === 0) return "due today";
    if (d === 1) return "due tomorrow";
    return `due in ${d} days`;
  }
  if (d < 0) {
    const n = Math.abs(d);
    return `venció hace ${n} ${n === 1 ? "día" : "días"}`;
  }
  if (d === 0) return "vence hoy";
  if (d === 1) return "vence mañana";
  return `vence en ${d} días`;
}
