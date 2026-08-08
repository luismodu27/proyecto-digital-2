import type { MemberRole } from "@/lib/mock-data";

/**
 * Quién puede gestionar la facturación de la organización: contratar el plan,
 * abrir el portal de Stripe y —lo delicado— CANCELAR la suscripción.
 *
 * Solo `owner`/`admin`. Un `member` (observador) no debe poder dejar a la
 * organización entera sin plan. Es una regla de NEGOCIO, no un detalle de UI: la
 * aplican a la vez la página de facturación (oculta el control) y las server
 * actions (la frontera de seguridad real). Vive aquí, en un módulo puro, para
 * poder blindarla con un test: un `!== "owner"` mal editado abriría el portal a
 * cualquiera sin que compilara nada en rojo.
 */
export function canManageBilling(role: MemberRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}
