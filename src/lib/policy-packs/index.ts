/**
 * Registro de policy packs disponibles. Cualquier pack nuevo se añade aquí para
 * que aparezca en /dashboard/packs y pueda aplicarse por su `id`.
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";

import type { PolicyPack } from "./types";
import type { Locale } from "../i18n/config";
import { RRHH_PACK, RRHH_PACK_EN } from "./rrhh";
import {
  GESTION_TRABAJADORES_PACK,
  GESTION_TRABAJADORES_PACK_EN,
} from "./gestion-trabajadores";
import {
  ATENCION_CLIENTE_GENAI_PACK,
  ATENCION_CLIENTE_GENAI_PACK_EN,
} from "./atencion-cliente-genai";
import {
  CREDITO_SEGUROS_PACK,
  CREDITO_SEGUROS_PACK_EN,
} from "./credito-seguros";
import { US_HIRING_PACK, US_HIRING_PACK_EN } from "./us-hiring";

export { RRHH_PACK, RRHH_PACK_EN } from "./rrhh";
export {
  GESTION_TRABAJADORES_PACK,
  GESTION_TRABAJADORES_PACK_EN,
} from "./gestion-trabajadores";
export {
  ATENCION_CLIENTE_GENAI_PACK,
  ATENCION_CLIENTE_GENAI_PACK_EN,
} from "./atencion-cliente-genai";
export { CREDITO_SEGUROS_PACK, CREDITO_SEGUROS_PACK_EN } from "./credito-seguros";
export { US_HIRING_PACK, US_HIRING_PACK_EN } from "./us-hiring";

/** Catálogo canónico (ES) — orden estable. Retrocompatible. */
export const POLICY_PACKS: PolicyPack[] = [
  RRHH_PACK,
  GESTION_TRABAJADORES_PACK,
  ATENCION_CLIENTE_GENAI_PACK,
  CREDITO_SEGUROS_PACK,
  US_HIRING_PACK,
];

/** Catálogo en inglés (validado), mismo orden e ids que `POLICY_PACKS`. */
export const POLICY_PACKS_EN: PolicyPack[] = [
  RRHH_PACK_EN,
  GESTION_TRABAJADORES_PACK_EN,
  ATENCION_CLIENTE_GENAI_PACK_EN,
  CREDITO_SEGUROS_PACK_EN,
  US_HIRING_PACK_EN,
];

/** Selector locale-aware del catálogo de packs (default ES). */
export const POLICY_PACKS_BY_LOCALE: Record<Locale, PolicyPack[]> = {
  es: POLICY_PACKS,
  en: POLICY_PACKS_EN,
};

/** Devuelve el array de packs en el idioma indicado (default ES). */
export function policyPacks(locale: Locale = "es"): PolicyPack[] {
  return POLICY_PACKS_BY_LOCALE[locale];
}

/** Devuelve un pack por su id (o null si no existe). Default ES, retrocompatible. */
export function getPolicyPack(id: string): PolicyPack | null {
  return POLICY_PACKS.find((p) => p.id === id) ?? null;
}

/** Devuelve un pack por su id en el idioma indicado (o null si no existe). */
export function policyPackById(id: string, locale: Locale = "es"): PolicyPack | null {
  return policyPacks(locale).find((p) => p.id === id) ?? null;
}
