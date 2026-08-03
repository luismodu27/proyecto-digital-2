/**
 * Quién puede tocar los AJUSTES de organización (nexo de jurisdicción, cadencia
 * de revisión…) y qué se le enseña a quien no puede.
 *
 * LÓGICA PURA, fuera de los componentes, por la misma razón que `nav.ts`: es una
 * regla de autorización, se repite en varias pantallas y dentro de un `.tsx` no
 * se puede probar. Que dos pantallas resuelvan «¿puede este usuario?» cada una a
 * su manera es exactamente cómo se desincronizan.
 *
 * La autorización REAL vive en el servidor —`set_org_jurisdictions` y
 * `set_review_cadence` son `security definer` y comprueban el rol dentro—. Esto
 * es solo la capa de presentación: sirve para no ofrecer un botón que va a
 * fallar, no para proteger nada. Si alguien fuerza el envío, la función SQL lo
 * rechaza igual.
 */
import type { MemberRole } from "@/lib/mock-data";

/**
 * - `manage`   — se muestra el control editable.
 * - `demo`     — sin backend: el control se muestra (la demo enseña el producto
 *                entero) y la acción avisa de que hace falta conectar.
 * - `readonly` — se muestra el VALOR configurado, pero no el control.
 *
 * `readonly` existe en vez de esconderlo todo porque el ajuste **explica lo que
 * el usuario está viendo**: sin saber la cadencia, la lista de revisiones
 * pendientes parece arbitraria; sin saber el nexo, el radar parece incompleto.
 * Ocultarlo del todo convierte una restricción de permisos en un misterio.
 */
export type SettingsAccess = "manage" | "readonly" | "demo";

export function settingsAccess(o: {
  role: MemberRole | null;
  isConnected: boolean;
}): SettingsAccess {
  if (!o.isConnected) return "demo";
  return o.role === "owner" || o.role === "admin" ? "manage" : "readonly";
}

/** ¿Se renderiza el formulario? (En demo sí: la acción avisa por su cuenta.) */
export function canEditSettings(access: SettingsAccess): boolean {
  return access !== "readonly";
}
