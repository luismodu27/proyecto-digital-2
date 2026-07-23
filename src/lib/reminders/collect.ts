import type { AiSystem } from "@/lib/mock-data";
import {
  biasAuditStatus,
  nextBiasAuditDue,
  daysUntilDate,
  type BiasAudit,
} from "@/lib/bias-audit";
import {
  upcomingDeadlines,
  daysUntil,
  affectedSystems,
  frameworkLabel,
  type RegulatoryEvent,
} from "@/lib/regulatory-watch";

/** Ventana de anticipación: solo avisamos de lo que vence dentro de N días. */
export const REMINDER_HORIZON_DAYS = 30;

export type SystemWithBias = AiSystem & { bias: BiasAudit };

export type BiasReminder = {
  system: string;
  status: "vencida" | "por_vencer";
  due: string | null;
  days: number | null;
};

export type DeadlineReminder = {
  title: string;
  framework: string;
  date: string;
  days: number;
  affected: number;
};

export type OrgReminders = {
  bias: BiasReminder[];
  deadlines: DeadlineReminder[];
  hasItems: boolean;
};

/**
 * Determina qué necesita atención de una organización esta semana, de forma
 * determinista: auditorías de sesgo vencidas o por vencer (AEDT) y plazos
 * regulatorios dentro de la ventana. Orientativo — no es un juicio de cumplimiento.
 */
export function collectReminders(
  systems: SystemWithBias[],
  events: RegulatoryEvent[],
  now: Date,
): OrgReminders {
  const bias: BiasReminder[] = [];
  for (const s of systems) {
    const status = biasAuditStatus(s.bias, now);
    if (status === "vencida" || status === "por_vencer") {
      const due = nextBiasAuditDue(s.bias.lastAuditDate);
      bias.push({ system: s.name, status, due, days: daysUntilDate(due, now) });
    }
  }

  const deadlines: DeadlineReminder[] = upcomingDeadlines(now, events)
    .map((e) => ({ e, days: daysUntil(e.date, now) }))
    .filter(({ days }) => days <= REMINDER_HORIZON_DAYS)
    .map(({ e, days }) => ({
      title: e.title,
      framework: frameworkLabel(e.framework),
      date: e.date,
      days,
      affected: affectedSystems(e, systems).length,
    }));

  return { bias, deadlines, hasItems: bias.length > 0 || deadlines.length > 0 };
}
