import {
  AI_SYSTEMS,
  GAP_ITEMS,
  SAMPLE_ASSESSMENTS,
  SAMPLE_AUDIT,
  SAMPLE_INVITATIONS,
  SAMPLE_MEMBERS,
  SAMPLE_REG_ACKS,
  SAMPLE_REG_CANDIDATES,
  type AiSystem,
  type AssessmentRecord,
  type AuditEntry,
  type DossierData,
  type GapItem,
  type MemberRole,
  type OrgMember,
  type PendingInvitation,
  type RegAck,
  type RegCandidate,
} from "@/lib/mock-data";
import { mergeCatalog, type RegulatoryEvent } from "@/lib/regulatory-watch";

/** Repositorio de datos de ejemplo (modo demo). */
export async function getAiSystems(): Promise<AiSystem[]> {
  return AI_SYSTEMS;
}

export async function getGapItems(): Promise<GapItem[]> {
  return GAP_ITEMS;
}

export async function getSystemsForSelect(): Promise<
  { id: string; name: string }[]
> {
  return AI_SYSTEMS.map((s) => ({ id: s.id, name: s.name }));
}

export async function getOrganizationName(): Promise<string | null> {
  return "Organización demo";
}

export async function getSystemById(_id: string): Promise<null> {
  // En modo demo no se edita: los datos de ejemplo no son reales.
  void _id;
  return null;
}

export async function getSystemAssessments(
  id: string,
): Promise<AssessmentRecord[]> {
  return SAMPLE_ASSESSMENTS[id] ?? [];
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
  return SAMPLE_AUDIT;
}

export async function getRegulatoryAcks(): Promise<Record<string, RegAck>> {
  return SAMPLE_REG_ACKS;
}

export async function getRegulatoryEvents(): Promise<RegulatoryEvent[]> {
  // En demo el catálogo es solo la base curada (sin eventos de pipeline).
  return mergeCatalog([]);
}

export async function getRegCandidates(): Promise<RegCandidate[]> {
  return SAMPLE_REG_CANDIDATES;
}

export async function getIsPlatformAdmin(): Promise<boolean> {
  // En demo mostramos la bandeja del Validador para poder enseñarla.
  return true;
}

export async function getOrgJurisdictions(): Promise<string[]> {
  // Demo: organización europea que además contrata en Nueva York.
  return ["eu", "us-ny"];
}

/**
 * Dossier de un sistema de ejemplo (modo demo). `id` es el código (SYS-xxx).
 * No hay historial de evaluaciones porque los datos de ejemplo no son reales.
 */
export async function getSystemDossier(
  id: string,
): Promise<DossierData | null> {
  const system = AI_SYSTEMS.find((s) => s.id === id);
  if (!system) return null;
  return {
    system: { ...system, actorRole: "deployer" },
    gaps: GAP_ITEMS.filter((g) => g.system === system.id),
    assessments: SAMPLE_ASSESSMENTS[system.id] ?? [],
  };
}
