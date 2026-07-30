import { describe, expect, it } from "vitest";
import type { ActionTask } from "@/lib/mock-data";
import {
  SOON_WINDOW_DAYS,
  bucketTaskDeadlines,
  dueLabel,
  isTaskOverdue,
} from "./task-reminders";

/**
 * Los recordatorios deciden qué ve el cliente como "vencido" en su plan de
 * gobernanza. Un error de un día aquí le hace creer que va al día cuando no.
 * `now` se inyecta, así que todo es determinista (nada de "hoy" real).
 */

const HOY = new Date("2026-07-30T12:00:00Z");

function task(over: Partial<ActionTask> = {}): ActionTask {
  return {
    id: "t1",
    title: "Revisar evidencia del proveedor",
    detail: null,
    article: null,
    priority: "media",
    status: "todo",
    assigneeId: null,
    assigneeEmail: null,
    dueDate: null,
    systemId: null,
    systemName: null,
    source: "manual",
    sourceKey: null,
    createdAt: "2026-07-01T00:00:00Z",
    ...over,
  };
}

describe("isTaskOverdue", () => {
  it("una tarea sin fecha nunca está vencida", () => {
    expect(isTaskOverdue(task({ dueDate: null }), "2026-07-30")).toBe(false);
  });

  it("una tarea hecha nunca está vencida, aunque la fecha haya pasado", () => {
    expect(
      isTaskOverdue(task({ status: "done", dueDate: "2020-01-01" }), "2026-07-30"),
    ).toBe(false);
  });

  it("vence el día siguiente, no el mismo día (hoy no está vencida)", () => {
    expect(isTaskOverdue(task({ dueDate: "2026-07-30" }), "2026-07-30")).toBe(false);
    expect(isTaskOverdue(task({ dueDate: "2026-07-29" }), "2026-07-30")).toBe(true);
  });
});

describe("bucketTaskDeadlines", () => {
  it("separa vencidas de próximas y descarta hechas o sin fecha", () => {
    const { overdue, dueSoon } = bucketTaskDeadlines(
      [
        task({ id: "vencida", dueDate: "2026-07-01" }),
        task({ id: "hoy", dueDate: "2026-07-30" }),
        task({ id: "en-5-dias", dueDate: "2026-08-04" }),
        task({ id: "lejana", dueDate: "2027-01-01" }),
        task({ id: "hecha", dueDate: "2026-07-01", status: "done" }),
        task({ id: "sin-fecha", dueDate: null }),
      ],
      HOY,
    );
    expect(overdue.map((t) => t.id)).toEqual(["vencida"]);
    expect(dueSoon.map((t) => t.id)).toEqual(["hoy", "en-5-dias"]);
  });

  it("ordena vencidas de la más atrasada a la menos", () => {
    const { overdue } = bucketTaskDeadlines(
      [
        task({ id: "b", dueDate: "2026-07-20" }),
        task({ id: "a", dueDate: "2026-01-05" }),
        task({ id: "c", dueDate: "2026-07-29" }),
      ],
      HOY,
    );
    expect(overdue.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });

  it("la ventana de 'próximas' es inclusiva en su último día", () => {
    const ultimoDia = new Date(HOY);
    ultimoDia.setUTCDate(ultimoDia.getUTCDate() + SOON_WINDOW_DAYS);
    const iso = ultimoDia.toISOString().slice(0, 10);
    const { dueSoon } = bucketTaskDeadlines([task({ dueDate: iso })], HOY);
    expect(dueSoon).toHaveLength(1);
  });

  it("un día más allá de la ventana ya no cuenta como próxima", () => {
    const fuera = new Date(HOY);
    fuera.setUTCDate(fuera.getUTCDate() + SOON_WINDOW_DAYS + 1);
    const { dueSoon, overdue } = bucketTaskDeadlines(
      [task({ dueDate: fuera.toISOString().slice(0, 10) })],
      HOY,
    );
    expect(dueSoon).toHaveLength(0);
    expect(overdue).toHaveLength(0);
  });

  it("respeta una ventana personalizada", () => {
    const tasks = [task({ id: "x", dueDate: "2026-08-10" })];
    expect(bucketTaskDeadlines(tasks, HOY, 3).dueSoon).toHaveLength(0);
    expect(bucketTaskDeadlines(tasks, HOY, 30).dueSoon).toHaveLength(1);
  });
});

describe("dueLabel", () => {
  it("devuelve texto no vacío en ambos idiomas y son distintos", () => {
    const es = dueLabel("2026-07-30", HOY, "es");
    const en = dueLabel("2026-07-30", HOY, "en");
    expect(es.trim().length).toBeGreaterThan(0);
    expect(en.trim().length).toBeGreaterThan(0);
    expect(es).not.toBe(en);
  });

  it("distingue hoy, futuro y pasado", () => {
    const hoy = dueLabel("2026-07-30", HOY);
    const futuro = dueLabel("2026-08-15", HOY);
    const pasado = dueLabel("2026-06-15", HOY);
    expect(new Set([hoy, futuro, pasado]).size).toBe(3);
  });
});
