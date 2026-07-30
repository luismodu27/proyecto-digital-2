/**
 * Utilidades de fecha en UTC, fuente única para los cálculos de "días que
 * faltan". Antes vivían duplicadas en `regulatory-watch.ts` (`daysUntil`) y
 * `bias-audit.ts` (`daysUntilDate` + `parseDate`); ambos hacían exactamente el
 * mismo cálculo (medianoche UTC de la fecha − medianoche UTC de hoy). Aquí queda
 * una sola implementación y aquellos módulos delegan en ella.
 */

/** Parsea una fecha ISO (`YYYY-MM-DD…`) a su medianoche UTC. `null` si es inválida. */
export function parseIsoDateUTC(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Días que faltan hasta `dateIso` respecto a `now` (negativo = ya pasó). Se
 * comparan medianoches UTC, así que el resultado no depende de la hora del día.
 * Devuelve `null` si la fecha es nula o inválida.
 */
export function daysUntilDate(dateIso: string | null, now: Date): number | null {
  const d = parseIsoDateUTC(dateIso);
  if (!d) return null;
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.round((d.getTime() - today) / 86_400_000);
}

/**
 * Sello de fecha y hora corto y localizado (`12 feb, 09:41`), para las columnas
 * de "última vez" de los paneles internos. `fallback` cubre el valor nulo
 * ("nunca"), porque una celda vacía se lee como un fallo de carga.
 *
 * Vivía duplicado como helper local en `vigilancia/fuentes`; al necesitarlo el
 * panel de telemetría se unifica aquí.
 */
export function formatDateTime(
  iso: string | null,
  locale: "es" | "en",
  fallback: string,
): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString(locale === "en" ? "en-GB" : "es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
