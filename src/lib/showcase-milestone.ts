import { showcaseMilestone } from "@/lib/regulatory-watch";
import { formatInDays } from "@/lib/i18n/countdown";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

/** Lo que pintan las ilustraciones del hito destacado. */
export type MilestoneView = { dateLabel: string; countdown: string };

/**
 * Hito destacado listo para pintar, calculado en el servidor en cada request.
 *
 * Vive fuera de `i18n/` a propósito: junta un dato del catálogo regulatorio con
 * palabras de la UI, y la frontera legal (eslint) impide que i18n importe el
 * radar. Los componentes cliente (la guía del panel) lo reciben ya hecho por
 * props: calcular la fecha en el navegador podría no coincidir con el HTML del
 * servidor cerca de medianoche y romper la hidratación.
 */
export function milestoneView(
  locale: Locale,
  w: Dictionary["common"],
  now: Date = new Date(),
): MilestoneView | null {
  const ms = showcaseMilestone(locale, now);
  return ms ? { dateLabel: ms.dateLabel, countdown: formatInDays(ms.days, w) } : null;
}
