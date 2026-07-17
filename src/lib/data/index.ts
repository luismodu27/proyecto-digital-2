/**
 * Capa de acceso a datos de Attesta.
 *
 * Fachada única para el dashboard: decide entre datos reales (Supabase) y datos
 * de ejemplo (demo) según haya credenciales configuradas. Los componentes solo
 * importan de aquí y no saben qué backend hay detrás.
 */
import { isSupabaseConfigured } from "@/lib/supabase/config";
import * as mockRepo from "./mock-repo";
import * as supabaseRepo from "./supabase-repo";

const repo = isSupabaseConfigured ? supabaseRepo : mockRepo;

export const getAiSystems = () => repo.getAiSystems();
export const getGapItems = () => repo.getGapItems();
export const getSystemsForSelect = () => repo.getSystemsForSelect();
export const getOrganizationName = () => repo.getOrganizationName();
export const getSystemById = (id: string) => repo.getSystemById(id);
export const getSystemAssessments = (id: string) =>
  repo.getSystemAssessments(id);
export const getSystemDossier = (id: string) => repo.getSystemDossier(id);
export const getOrgMembers = () => repo.getOrgMembers();
export const getPendingInvitations = () => repo.getPendingInvitations();
export const getCurrentMemberRole = () => repo.getCurrentMemberRole();
export const getAuditLog = () => repo.getAuditLog();
export const getRegulatoryAcks = () => repo.getRegulatoryAcks();
export const getRegulatoryEvents = () => repo.getRegulatoryEvents();
export const getRegCandidates = () => repo.getRegCandidates();
export const getIsPlatformAdmin = () => repo.getIsPlatformAdmin();

export { isSupabaseConfigured };
export type {
  AiSystem,
  AuditEntry,
  DossierData,
  GapItem,
  MemberRole,
  OrgMember,
  PendingInvitation,
  RegAck,
  RegCandidate,
} from "@/lib/mock-data";
