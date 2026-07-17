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

export { isSupabaseConfigured };
export type { AiSystem, GapItem } from "@/lib/mock-data";
