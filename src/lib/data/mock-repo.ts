import {
  AI_SYSTEMS,
  GAP_ITEMS,
  type AiSystem,
  type GapItem,
} from "@/lib/mock-data";

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
