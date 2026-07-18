/**
 * Registro de policy packs disponibles. Cualquier pack nuevo se añade aquí para
 * que aparezca en /dashboard/packs y pueda aplicarse por su `id`.
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";

import type { PolicyPack } from "./types";
import { RRHH_PACK } from "./rrhh";
import { US_HIRING_PACK } from "./us-hiring";

export { RRHH_PACK } from "./rrhh";
export { US_HIRING_PACK } from "./us-hiring";

export const POLICY_PACKS: PolicyPack[] = [RRHH_PACK, US_HIRING_PACK];

/** Devuelve un pack por su id (o null si no existe). */
export function getPolicyPack(id: string): PolicyPack | null {
  return POLICY_PACKS.find((p) => p.id === id) ?? null;
}
