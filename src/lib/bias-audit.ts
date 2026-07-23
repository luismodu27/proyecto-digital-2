/**
 * Auditoría de sesgo (NYC Local Law 144) — lógica de estado y caducidad.
 *
 * La ventana de 12 meses NO es una fecha fija para todos: es un vencimiento
 * ROTATORIO por herramienta desde su última auditoría. Todo es determinista y
 * ORIENTATIVO — no es un juicio de cumplimiento.
 *
 * ⚠️ Attesta REGISTRA la evidencia declarada; no realiza ni valida la auditoría.
 * "Auditoría realizada" ≠ "aprobada" ≠ "sin discriminación".
 */
import type { Locale } from "./i18n/config";
import { parseIsoDateUTC, daysUntilDate } from "./date";

// `daysUntilDate` se define una sola vez en `./date`; se re-exporta aquí para no
// romper los imports existentes (`@/lib/bias-audit`).
export { daysUntilDate };

/** Umbral (días) para avisar de que una auditoría está por vencer. Un solo sitio. */
export const BIAS_AUDIT_WARN_DAYS = 60;

export type BiasAudit = {
  isAedt: boolean;
  lastAuditDate: string | null; // YYYY-MM-DD
  auditorName: string | null;
  auditorIndependenceConfirmed: boolean;
  summaryUrl: string | null;
  summaryPublishedDate: string | null; // YYYY-MM-DD
};

export type BiasAuditStatus =
  | "no_aplica" // no es AEDT
  | "sin_auditoria" // AEDT sin auditoría registrada
  | "vencida" // auditoría de más de 12 meses
  | "por_vencer" // vence dentro de BIAS_AUDIT_WARN_DAYS
  | "vigente"; // auditoría dentro de los 12 meses

export const BIAS_STATUS_LABEL: Record<BiasAuditStatus, string> = {
  no_aplica: "No es AEDT",
  sin_auditoria: "Sin auditoría",
  vencida: "Auditoría vencida",
  por_vencer: "Próxima a vencer",
  vigente: "Auditoría vigente",
};
// Etiqueta EN (chrome de UI, neutral — no es un juicio de cumplimiento). Coincide
// con `dashboard.bias.labels` del diccionario (usado por `BiasAuditBadge`).
const BIAS_STATUS_LABEL_EN: Record<BiasAuditStatus, string> = {
  no_aplica: "Not an AEDT",
  sin_auditoria: "No audit",
  vencida: "Audit expired",
  por_vencer: "Expiring soon",
  vigente: "Audit valid",
};
export const BIAS_STATUS_LABEL_BY_LOCALE: Record<Locale, Record<BiasAuditStatus, string>> = {
  es: BIAS_STATUS_LABEL,
  en: BIAS_STATUS_LABEL_EN,
};
export function biasStatusLabel(status: BiasAuditStatus, locale: Locale): string {
  return BIAS_STATUS_LABEL_BY_LOCALE[locale][status];
}

/** Tono semántico para el badge (danger/warn/good/neutral). */
export const BIAS_STATUS_TONE: Record<BiasAuditStatus, "danger" | "warn" | "good" | "neutral"> = {
  no_aplica: "neutral",
  sin_auditoria: "danger",
  vencida: "danger",
  por_vencer: "warn",
  vigente: "good",
};

/** Fecha en que caduca la auditoría = última auditoría + 12 meses calendario. */
export function nextBiasAuditDue(lastAuditDate: string | null): string | null {
  const d = parseIsoDateUTC(lastAuditDate);
  if (!d) return null;
  d.setUTCMonth(d.getUTCMonth() + 12);
  return d.toISOString().slice(0, 10);
}

/** Estado de la auditoría de sesgo de una herramienta. */
export function biasAuditStatus(a: BiasAudit, now: Date): BiasAuditStatus {
  if (!a.isAedt) return "no_aplica";
  const due = nextBiasAuditDue(a.lastAuditDate);
  if (!due) return "sin_auditoria";
  const days = daysUntilDate(due, now);
  if (days === null) return "sin_auditoria";
  if (days < 0) return "vencida";
  if (days <= BIAS_AUDIT_WARN_DAYS) return "por_vencer";
  return "vigente";
}

/**
 * ¿Está publicado el resumen? (LL144 exige auditoría Y publicación Y aviso; no
 * se colapsan en un solo semáforo). Solo relevante si es AEDT.
 */
export function publicationComplete(a: BiasAudit): boolean {
  return !!(a.summaryUrl && a.summaryPublishedDate);
}
