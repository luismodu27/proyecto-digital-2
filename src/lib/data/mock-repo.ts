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

export async function getGapItems(): Promise<GapItem[]> {
  const locale = await resolveLocale();
  return locale === "en" ? GAP_ITEMS_EN : GAP_ITEMS;
}

export async function getSystemsForSelect(): Promise<
  { id: string; name: string }[]
> {
  const locale = await resolveLocale();
  return aiSystems(locale).map((s) => ({ id: s.id, name: s.name }));
}

export async function getOrganizationName(): Promise<string | null> {
  return "Organización demo";
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
  return src[id] ?? [];
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
      organization: "Organización demo",
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
    gapItems: en ? GAP_ITEMS_EN : GAP_ITEMS,
    actionTasks: en ? SAMPLE_ACTION_TASKS_EN : SAMPLE_ACTION_TASKS,
    members: SAMPLE_MEMBERS,
    regulatoryAcks: en ? SAMPLE_REG_ACKS_EN : SAMPLE_REG_ACKS,
    auditLog: en ? SAMPLE_AUDIT_EN : SAMPLE_AUDIT,
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
  // Demo: organización europea que además contrata en Nueva York.
  return ["eu", "us-ny"];
}

export async function getActionTasks(): Promise<ActionTask[]> {
  const locale = await resolveLocale();
  return locale === "en" ? SAMPLE_ACTION_TASKS_EN : SAMPLE_ACTION_TASKS;
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
    gaps: (en ? GAP_ITEMS_EN : GAP_ITEMS).filter((g) => g.system === system.id),
    assessments: (en ? SAMPLE_ASSESSMENTS_EN : SAMPLE_ASSESSMENTS)[system.id] ?? [],
    biasAudit: (en ? SAMPLE_BIAS_AUDITS_EN : SAMPLE_BIAS_AUDITS)[system.id] ?? null,
  };
}
