/**
 * Ciclo de vida de una organización: tipos y aritmética del periodo de gracia.
 *
 * Vive fuera de la fachada de datos porque es lógica pura y la comparten el repo
 * real, la UI y los tests. El plazo está aquí, en una sola constante, y no
 * repetido en la migración, el cron y la pantalla: tres sitios donde escribir
 * "7" son tres sitios donde acabará poniendo cosas distintas.
 *
 * NOTA sobre la migración: el plazo también aparece en `0035_org_lifecycle.sql`
 * (`interval '7 days'`), y no hay forma de compartir una constante entre SQL y
 * TypeScript. Lo que sí se puede hacer, y se hace, es que el que MANDA sea el de
 * SQL —es quien borra— y que este solo sirva para *contar* lo que falta. Si
 * divergieran, la pantalla enseñaría un día de más o de menos, no se borraría
 * antes de tiempo.
 */

/** Días entre la solicitud de baja y la purga efectiva. Igual que en la 0035. */
export const GRACE_DAYS = 7;

export type OrgDeletionState = {
  /** ISO. Cuándo se solicitó la baja. */
  requestedAt: string;
  /** ISO. Cuándo se purgará si no se cancela. */
  purgeAt: string;
  graceDays: number;
};

/**
 * Días completos que faltan para la purga. Nunca negativo: si el cron va con
 * retraso, la respuesta útil es "hoy", no "hace -2 días".
 */
export function daysUntilPurge(state: OrgDeletionState, now = new Date()): number {
  const ms = new Date(state.purgeAt).getTime() - now.getTime();
  if (Number.isNaN(ms)) return 0;
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
