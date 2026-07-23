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
  /**
   * `true` cuando el OBJETO del control ES una práctica PROHIBIDA del Art. 5
   * (riesgo inaceptable — p. ej. inferir emociones de trabajadores, Art. 5.1.f).
   * No es una brecha ordinaria: una práctica prohibida no se "prepara para
   * auditoría", se verifica su ausencia o se cesa. Estos controles quedan FUERA
   * del cómputo de preparación ("% listo") y se renderizan como Inaceptable /
   * revisión jurídica. Regla: marcar solo cuando el control ES la práctica del
   * Art. 5, no cuando meramente se cita el Art. 5 (un control de "mantente dentro
   * de límites" sigue siendo brecha ordinaria).
   */
  prohibited?: boolean;
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
