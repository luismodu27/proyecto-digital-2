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
export const getUserOrgs = () => repo.getUserOrgs();
export const getSystemById = (id: string) => repo.getSystemById(id);
export const getSystemBiasAudit = (id: string) => repo.getSystemBiasAudit(id);
export const getSystemAssessments = (id: string) =>
  repo.getSystemAssessments(id);
export const getSystemDossier = (id: string) => repo.getSystemDossier(id);
export const getOrgMembers = () => repo.getOrgMembers();
export const getPendingInvitations = () => repo.getPendingInvitations();
export const getCurrentMemberRole = () => repo.getCurrentMemberRole();
export const getAuditLog = () => repo.getAuditLog();
export const verifyAuditChain = () => repo.verifyAuditChain();
export const getExportBundle = () => repo.getExportBundle();
export const getRegulatoryAcks = () => repo.getRegulatoryAcks();
export const getRegulatoryEvents = () => repo.getRegulatoryEvents();
export const getRegCandidates = () => repo.getRegCandidates();
export const getRegSources = () => repo.getRegSources();
export const getIsPlatformAdmin = () => repo.getIsPlatformAdmin();
export const getOrgJurisdictions = () => repo.getOrgJurisdictions();
export const getActionTasks = () => repo.getActionTasks();

export { isSupabaseConfigured };
export type {
  ActionTask,
  AiSystem,
  AuditChainStatus,
  AuditEntry,
  DossierData,
  ExportBundle,
  GapItem,
  MemberRole,
  OrgMember,
  PendingInvitation,
  RegAck,
  RegCandidate,
  RegSource,
} from "@/lib/mock-data";
