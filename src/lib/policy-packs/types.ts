/**
 * Tipos compartidos de los policy packs (plantillas de controles por caso de uso).
 * Cada pack precarga las brechas de un gap assessment al aplicarse a un sistema.
 */

export type PolicySeverity = "alta" | "media" | "baja";

export type PolicyControl = {
  id: string;
  title: string;
  /** Qué hacer / qué exige, con el encuadre del deployer. */
  description: string;
  /** Cita legal corta (se guarda en `gap_items.article`). */
  article: string;
  severity: PolicySeverity;
  /**
   * Condición de aplicabilidad (solo informativa en la UI del pack). Ausente =
   * aplica siempre dentro del ámbito del pack. Útil para leyes territoriales
   * (p. ej. "solo si contratas en NYC").
   */
  conditional?: string;
};

export type PolicyPack = {
  id: string;
  name: string;
  /** Etiqueta corta para el chip de la tarjeta (p. ej. "Reclutamiento"). */
  tag: string;
  summary: string;
  /** Aviso extra opcional (p. ej. territorialidad, snapshot regulatorio). */
  note?: string;
  controls: PolicyControl[];
};
