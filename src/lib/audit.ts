/**
 * Registro de actividad — helpers de presentación del audit-trail.
 *
 * El audit_log guarda cambios crudos (jsonb). Aquí convertimos cada fila en una
 * `AuditEntry` legible: qué entidad, qué acción y qué campos cambiaron, en
 * español y sin ruido técnico.
 */
import {
  RISK_LABEL,
  ROLE_LABEL,
  type AuditEntry,
  type AuditAction,
  type MemberRole,
  type RiskLevel,
} from "./mock-data";
import { REGULATORY_EVENTS } from "./regulatory-watch";

const EVENT_TITLE = new Map(REGULATORY_EVENTS.map((e) => [e.id, e.title]));

/** Metadatos por tabla de negocio. */
export const ENTITY_META: Record<
  string,
  { label: string; article: string; tone: string }
> = {
  ai_systems: { label: "sistema", article: "el", tone: "info" },
  risk_assessments: { label: "evaluación", article: "la", tone: "gold" },
  gap_items: { label: "brecha", article: "la", tone: "warn" },
  memberships: { label: "miembro", article: "el", tone: "good" },
  regulatory_acks: { label: "revisión regulatoria", article: "la", tone: "info" },
  action_tasks: { label: "tarea del plan", article: "la", tone: "gold" },
};

export const ACTION_META: Record<
  AuditAction,
  { verb: string; tone: string }
> = {
  insert: { verb: "creó", tone: "good" },
  update: { verb: "actualizó", tone: "info" },
  delete: { verb: "eliminó", tone: "danger" },
};

/** Nombres humanos de las columnas por tabla. */
const FIELD_LABELS: Record<string, Record<string, string>> = {
  ai_systems: {
    name: "nombre",
    owner: "área responsable",
    domain: "dominio",
    vendor: "proveedor",
    risk_level: "riesgo",
    compliance_pct: "preparación",
    evidence_state: "respaldo",
    last_reviewed_at: "última revisión",
    actor_role: "rol del sistema",
  },
  gap_items: {
    status: "estado",
    severity: "severidad",
    requirement: "requisito",
    article: "artículo",
    remediation_note: "nota",
  },
  memberships: { role: "rol" },
  regulatory_acks: { status: "estado", note: "nota" },
  action_tasks: {
    status: "estado",
    priority: "prioridad",
    assignee_id: "responsable",
    due_date: "fecha límite",
    title: "título",
    detail: "detalle",
  },
};

/** Columnas técnicas que no aportan al usuario. */
const NOISE = new Set([
  "id",
  "updated_at",
  "created_at",
  "organization_id",
  "created_by",
  "current_assessment_id",
  "assessed_at",
  "assessed_by",
  "ai_system_id",
  "acknowledged_at",
  "acknowledged_by",
  "event_id",
  "source",
  "source_key",
]);

type Json = Record<string, unknown> | null;

/** Resumen legible de la fila afectada (nombre del sistema, requisito, etc.). */
export function deriveLabel(table: string, data: Json): string {
  if (!data) return "";
  switch (table) {
    case "ai_systems":
      return String(data.name ?? data.code ?? "");
    case "gap_items":
      return String(data.requirement ?? "");
    case "risk_assessments": {
      const lvl = data.level as RiskLevel | undefined;
      return lvl ? `nivel ${RISK_LABEL[lvl]}` : "";
    }
    case "memberships": {
      const role = data.role as MemberRole | undefined;
      return role ? `rol ${ROLE_LABEL[role]}` : "";
    }
    case "regulatory_acks": {
      const eid = data.event_id as string | undefined;
      const title = eid ? EVENT_TITLE.get(eid) : undefined;
      return title ? `«${title}»` : (eid ?? "");
    }
    case "action_tasks":
      return data.title ? `«${String(data.title)}»` : "";
    default:
      return "";
  }
}

/** Campos (humanos) cambiados en un update, sin ruido técnico. */
export function deriveChanged(table: string, diff: Json): string[] {
  if (!diff) return [];
  const labels = FIELD_LABELS[table] ?? {};
  return Object.keys(diff)
    .filter((k) => !NOISE.has(k))
    .map((k) => labels[k] ?? k);
}

/** Fila cruda de `list_audit_log`. */
export type RawAudit = {
  id: number;
  actor_email: string | null;
  table_name: string;
  row_id: string;
  action: AuditAction;
  diff: Json;
  new_data: Json;
  old_data: Json;
  at: string;
};

/** Convierte una fila cruda del RPC en una entrada legible. */
export function toAuditEntry(r: RawAudit): AuditEntry {
  return {
    id: r.id,
    actorEmail: r.actor_email ?? null,
    table: r.table_name,
    rowId: r.row_id,
    action: r.action,
    label: deriveLabel(r.table_name, r.new_data ?? r.old_data),
    changed: r.action === "update" ? deriveChanged(r.table_name, r.diff) : [],
    at: String(r.at),
  };
}
