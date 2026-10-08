import type { Dictionary } from "./index";

/**
 * «en 421 días» / «in 421 days»: el mismo formato que las cuentas atrás del
 * panel (prefijo + número + día/días), con las palabras de `common`.
 *
 * Solo formato: el dato (qué hito, cuántos días) lo pone `showcase-milestone`,
 * fuera de `i18n/`, porque la frontera legal impide que i18n importe el radar.
 */
export function formatInDays(days: number, w: Dictionary["common"]): string {
  return `${w.inDaysPrefix}${days} ${days === 1 ? w.dayOne : w.dayOther}`;
}
