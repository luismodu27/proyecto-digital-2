import {
  aiSystems,
  GAP_ITEMS,
  GAP_ITEMS_EN,
  SAMPLE_ASSESSMENTS,
  SAMPLE_ASSESSMENTS_EN,
  SAMPLE_BIAS_AUDITS,
  SAMPLE_BIAS_AUDITS_EN,
  SAMPLE_AUDIT,
  SAMPLE_AUDIT_EN,
  SAMPLE_INVITATIONS,
  SAMPLE_MEMBERS,
  SAMPLE_ACTION_TASKS,
  SAMPLE_ACTION_TASKS_EN,
  SAMPLE_INCIDENTS,
  SAMPLE_INCIDENTS_EN,
  SAMPLE_SUPPLIERS,
  SAMPLE_SUPPLIERS_EN,
  SAMPLE_SUPPLIER_EVIDENCE,
  SAMPLE_SUPPLIER_EVIDENCE_EN,
  SAMPLE_REG_ACKS,
  SAMPLE_REG_ACKS_EN,
  SAMPLE_REG_CANDIDATES,
  SAMPLE_REG_CANDIDATES_EN,
  SAMPLE_REG_SOURCES,
  SAMPLE_REG_SOURCES_EN,
  type ActionTask,
  type AiSystem,
  type AssessmentRecord,
  type AuditChainStatus,
  type AuditEntry,
  type DossierData,
  type ExportBundle,
  type ExportedSystem,
  type GapItem,
  type MemberRole,
  type OrgMember,
  type PendingInvitation,
  type RegAck,
  type RegCandidate,
  type RegSource,
} from "@/lib/mock-data";
import { mergeCatalog, type RegulatoryEvent } from "@/lib/regulatory-watch";
import { resolveLocale } from "@/lib/i18n/resolve";
import type { Locale } from "@/lib/i18n/config";
import type { FunnelRow } from "@/lib/telemetry/events";
import type { IntakeLink, IntakeSubmission } from "@/lib/intake/types";
import type { Incident } from "@/lib/incidents/incidents";
import type { Supplier } from "@/lib/suppliers/types";
import type { SupplierEvidence } from "@/lib/suppliers/evidence";
import { REVIEW_CADENCE_DEFAULT_DAYS } from "@/lib/incidents/review";
import type { OrgDeletionState } from "@/lib/org-lifecycle";

/**
 * Repositorio de datos de ejemplo (modo demo).
 *
 * La METADATA de producto de los sistemas (nombre/área/dominio/proveedor) es
 * locale-aware: en `en` se sirve `AI_SYSTEMS_EN` resolviendo el locale por
 * cookie con `resolveLocale()`, igual que la fachada hace para los eventos
 * regulatorios. El resto de muestras (brechas, evaluaciones, tareas, audit,
 * candidatos, fuentes) contiene texto REGULATORIO y permanece en ES a la espera
 * de la validación del experto — ver informe de entrega.
 */
export async function getAiSystems(): Promise<AiSystem[]> {
  const locale = await resolveLocale();
  return aiSystems(locale);
}

/**
 * Marca las muestras con el idioma en el que se están sirviendo.
 *
 * En demo el texto SIEMPRE sale en el idioma de la interfaz (hay espejo ES/EN de
 * cada muestra), así que aquí el idioma consta y coincide. `langAttr()` no
 * etiquetará nada — que es justo lo correcto: la demo enseña el caso normal, no
 * el de contenido heredado en otro idioma.
 */
function tagged<T extends object>(rows: readonly T[], locale: Locale): T[] {
  return rows.map((r) => ({ ...r, locale }));
}

export async function getGapItems(): Promise<GapItem[]> {
  const locale = await resolveLocale();
  return tagged(locale === "en" ? GAP_ITEMS_EN : GAP_ITEMS, locale);
}

export async function getSystemsForSelect(): Promise<
  { id: string; name: string }[]
> {
  const locale = await resolveLocale();
  return aiSystems(locale).map((s) => ({ id: s.id, name: s.name }));
}

/**
 * En demo NUNCA hay baja pendiente. No es pereza: la pantalla de baja es
 * destructiva y el modo demo es lo que se enseña en capturas y en la landing.
 * Un aviso de "esta organización se borrará en 7 días" en una demo sería, como
 * poco, una mala primera impresión.
 */
export async function getOrgDeletionState(): Promise<OrgDeletionState | null> {
  return null;
}

export async function getOrganizationName(): Promise<string | null> {
  const locale = await resolveLocale();
  return locale === "en" ? "Demo organization" : "Organización demo";
}

export async function getSystemBiasAudit(_id: string): Promise<null> {
  // En modo demo no hay registro editable de auditoría de sesgo.
  void _id;
  return null;
}

export async function getUserOrgs(): Promise<[]> {
  // En modo demo no hay sesión ni múltiples organizaciones.
  return [];
}

export async function getSystemById(_id: string): Promise<null> {
  // En modo demo no se edita: los datos de ejemplo no son reales.
  void _id;
  return null;
}

export async function getSystemAssessments(
  id: string,
): Promise<AssessmentRecord[]> {
  const locale = await resolveLocale();
  const src = locale === "en" ? SAMPLE_ASSESSMENTS_EN : SAMPLE_ASSESSMENTS;
  return tagged(src[id] ?? [], locale);
}

export async function getOrgMembers(): Promise<OrgMember[]> {
  return SAMPLE_MEMBERS;
}

export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  return SAMPLE_INVITATIONS;
}

export async function getCurrentMemberRole(): Promise<MemberRole | null> {
  // En demo mostramos el equipo como propietario, pero sin gestión real.
  return "owner";
}

export async function getAuditLog(): Promise<AuditEntry[]> {
  const locale = await resolveLocale();
  return locale === "en" ? SAMPLE_AUDIT_EN : SAMPLE_AUDIT;
}

export async function verifyAuditChain(): Promise<AuditChainStatus | null> {
  // En demo la cadena se muestra íntegra a modo ilustrativo (no hay backend).
  return {
    total: SAMPLE_AUDIT.length,
    ok: true,
    brokenId: null,
    checkedAt: new Date().toISOString(),
  };
}

export async function getExportBundle(): Promise<ExportBundle | null> {
  const locale = await resolveLocale();
  const en = locale === "en";
  const assessments = en ? SAMPLE_ASSESSMENTS_EN : SAMPLE_ASSESSMENTS;
  const biasAudits = en ? SAMPLE_BIAS_AUDITS_EN : SAMPLE_BIAS_AUDITS;
  const systems: ExportedSystem[] = aiSystems(locale).map((system) => ({
    system,
    assessments: assessments[system.id] ?? [],
    biasAudit: biasAudits[system.id] ?? null,
  }));
  return {
    meta: {
      application: "Attesta",
      organization: en ? "Demo organization" : "Organización demo",
      exportedAt: new Date().toISOString(),
      schemaVersion: 1,
    },
    integrity: {
      total: SAMPLE_AUDIT.length,
      ok: true,
      brokenId: null,
      checkedAt: new Date().toISOString(),
    },
    systems,
    gapItems: tagged(en ? GAP_ITEMS_EN : GAP_ITEMS, locale),
    actionTasks: tagged(en ? SAMPLE_ACTION_TASKS_EN : SAMPLE_ACTION_TASKS, locale),
    members: SAMPLE_MEMBERS,
    regulatoryAcks: en ? SAMPLE_REG_ACKS_EN : SAMPLE_REG_ACKS,
    auditLog: en ? SAMPLE_AUDIT_EN : SAMPLE_AUDIT,
    suppliers: await getSuppliers(),
    incidents: await getIncidents(),
    intakeSubmissions: await getIntakeSubmissions(),
    // En demo los datos de ejemplo nunca llegan al tope, así que nunca se trunca.
    truncated: null,
  };
}

export async function getRegulatoryAcks(): Promise<Record<string, RegAck>> {
  const locale = await resolveLocale();
  return locale === "en" ? SAMPLE_REG_ACKS_EN : SAMPLE_REG_ACKS;
}

export async function getRegulatoryEvents(): Promise<RegulatoryEvent[]> {
  // En demo el catálogo es solo la base curada (sin eventos de pipeline). La
  // fachada resuelve el locale: en EN sirve la base curada en inglés.
  const locale = await resolveLocale();
  return mergeCatalog([], undefined, locale);
}

export async function getRegCandidates(): Promise<RegCandidate[]> {
  const locale = await resolveLocale();
  return locale === "en" ? SAMPLE_REG_CANDIDATES_EN : SAMPLE_REG_CANDIDATES;
}

export async function getRegSources(): Promise<RegSource[]> {
  const locale = await resolveLocale();
  return locale === "en" ? SAMPLE_REG_SOURCES_EN : SAMPLE_REG_SOURCES;
}

export async function getIsPlatformAdmin(): Promise<boolean> {
  // En demo mostramos la bandeja del Validador para poder enseñarla.
  return true;
}

export async function getOrgJurisdictions(): Promise<string[]> {
  // Demo: organización europea que además contrata en Nueva York y California.
  return ["eu", "us-ny", "us-ca"];
}

export async function getActionTasks(): Promise<ActionTask[]> {
  const locale = await resolveLocale();
  return tagged(locale === "en" ? SAMPLE_ACTION_TASKS_EN : SAMPLE_ACTION_TASKS, locale);
}

/**
 * Dossier de un sistema de ejemplo (modo demo). `id` es el código (SYS-xxx).
 * No hay historial de evaluaciones porque los datos de ejemplo no son reales.
 */
export async function getSystemDossier(
  id: string,
): Promise<DossierData | null> {
  const locale = await resolveLocale();
  const en = locale === "en";
  const system = aiSystems(locale).find((s) => s.id === id);
  if (!system) return null;
  return {
    system: { ...system, actorRole: "deployer" },
    gaps: tagged(
      (en ? GAP_ITEMS_EN : GAP_ITEMS).filter((g) => g.system === system.id),
      locale,
    ),
    assessments: tagged(
      (en ? SAMPLE_ASSESSMENTS_EN : SAMPLE_ASSESSMENTS)[system.id] ?? [],
      locale,
    ),
    biasAudit: (en ? SAMPLE_BIAS_AUDITS_EN : SAMPLE_BIAS_AUDITS)[system.id] ?? null,
  };
}

/**
 * Embudo de activación (modo demo): SIEMPRE vacío, a propósito.
 *
 * Es un panel de métricas internas de Attesta, no una pantalla de producto: unos
 * números de ejemplo aquí solo servirían para que alguien tomara una decisión de
 * negocio con datos inventados. El panel muestra su estado vacío.
 */
export async function getProductFunnel(_days = 30): Promise<FunnelRow[]> {
  void _days;
  return [];
}

/**
 * Intake compartible (modo demo): sin enlaces ni bandeja.
 *
 * El intake escribe de verdad en una organización real; en demo no hay a dónde
 * escribir y un enlace de ejemplo solo llevaría a un formulario que no guarda
 * nada. La pantalla muestra su estado vacío con el aviso de modo demo.
 */
export async function getIntakeLinks(): Promise<IntakeLink[]> {
  return [];
}

export async function getIntakeSubmissions(): Promise<IntakeSubmission[]> {
  return [];
}

/** Expedientes de incidente de ejemplo (modo demo). */
export async function getIncidents(): Promise<Incident[]> {
  const locale = await resolveLocale();
  return locale === "en" ? SAMPLE_INCIDENTS_EN : SAMPLE_INCIDENTS;
}

/** En demo la cadencia no es configurable: se enseña el defecto del producto. */
export async function getReviewCadenceDays(): Promise<number> {
  return REVIEW_CADENCE_DEFAULT_DAYS;
}

/** Proveedores de ejemplo (modo demo). */
export async function getSuppliers(): Promise<Supplier[]> {
  const locale = await resolveLocale();
  return locale === "en" ? SAMPLE_SUPPLIERS_EN : SAMPLE_SUPPLIERS;
}

/** Evidencia de ejemplo (modo demo). */
export async function getSupplierEvidence(): Promise<SupplierEvidence[]> {
  const locale = await resolveLocale();
  return locale === "en" ? SAMPLE_SUPPLIER_EVIDENCE_EN : SAMPLE_SUPPLIER_EVIDENCE;
}
