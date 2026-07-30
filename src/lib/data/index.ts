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

/**
 * CONTRATO de la fachada de datos, derivado del repo REAL (la fuente de verdad
 * del producto). Cualquier getter nuevo se declara en `supabase-repo` y el
 * contrato lo recoge solo, sin duplicar 22 firmas a mano.
 */
export type DataRepo = typeof supabaseRepo;

/**
 * Comprobación en tiempo de compilación de que el repo DEMO implementa el mismo
 * contrato. Sin ella, olvidar un getter en `mock-repo` sí rompía `tsc`, pero con
 * diagnósticos engañosos: el ternario de abajo degradaba los tipos a `any` y los
 * errores aparecían como "Parameter 's' implicitly has an 'any' type" en páginas
 * del dashboard, lejos de la causa. Con esta línea el error señala este archivo y
 * dice exactamente qué getter falta o qué firma divergió.
 *
 * `void` para que el binding no quede como variable sin usar.
 */
const demoRepoImplementsContract: DataRepo = mockRepo;
void demoRepoImplementsContract;

const repo: DataRepo = isSupabaseConfigured ? supabaseRepo : mockRepo;

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
export const getProductFunnel = (days?: number) => repo.getProductFunnel(days);

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
