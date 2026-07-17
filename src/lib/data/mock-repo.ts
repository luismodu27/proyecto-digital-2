import {
  AI_SYSTEMS,
  GAP_ITEMS,
  type AiSystem,
  type DossierData,
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

export async function getSystemById(_id: string): Promise<null> {
  // En modo demo no se edita: los datos de ejemplo no son reales.
  void _id;
  return null;
}

export async function getSystemAssessments(_id: string): Promise<never[]> {
  void _id;
  return [];
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
    assessments: [],
  };
}
