/**
 * Revisión periódica de la autoevaluación.
 *
 * LÓGICA PURA. Lo importante de este módulo es lo que **no** afirma:
 *
 * > **El EU AI Act no fija ninguna periodicidad de revisión para el deployer.**
 *
 * El Art. 26.5 impone supervisar el funcionamiento, pero es un deber *continuo*
 * sin cadencia. El Art. 27.2 obliga a actualizar la evaluación de impacto
 * **cuando cambie** alguno de los elementos del 27.1: disparo por evento, no por
 * calendario — y además solo alcanza a quien está sujeto al Art. 27.1
 * (organismos públicos, entidades privadas que prestan servicios públicos y los
 * puntos 5.b y 5.c del Anexo III); **una empresa privada de RRHH no debe una
 * FRIA**. El Art. 72 (vigilancia poscomercialización) es del proveedor. Fuera
 * del Reglamento, ISO/IEC 42001 pide «intervalos planificados» sin número y
 * NIST AI RMF GOVERN 1.5 dice literalmente que la frecuencia la determina la
 * organización.
 *
 * De ahí el diseño: los **disparadores por evento** son de primera clase (son
 * los que la norma sí reconoce) y la cadencia es una **red de seguridad**
 * configurable, que la UI debe etiquetar siempre como buena práctica. Las únicas
 * cadencias duras del corpus de Attesta son de otro sitio y ya viven en otro
 * módulo: NYC LL144 en `bias-audit.ts`.
 */
import type { AiSystem } from "@/lib/mock-data";
import { daysUntilDate, parseIsoDateUTC } from "@/lib/date";

/** Cadencia por defecto: 12 meses. Es una elección de producto, no un plazo legal. */
export const REVIEW_CADENCE_DEFAULT_DAYS = 365;

/** Opciones ofrecidas (6, 12 y 24 meses). Fuera de esta lista no se acepta nada. */
export const REVIEW_CADENCE_CHOICES = [180, 365, 730] as const;

/** Ventana de preaviso: se avisa cuando la revisión entra en los 30 días. */
export const REVIEW_SOON_DAYS = 30;

export type ReviewState = "overdue" | "due_soon" | "ok" | "unknown";

/**
 * Normaliza la cadencia venida de la BD o de un formulario. Cualquier valor
 * fuera del catálogo cae en el defecto en vez de propagarse: una cadencia de
 * cero o negativa marcaría el inventario entero como vencido de golpe.
 */
export function normalizeCadenceDays(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return (REVIEW_CADENCE_CHOICES as readonly number[]).includes(n)
    ? n
    : REVIEW_CADENCE_DEFAULT_DAYS;
}

/** Fecha en la que toca la próxima revisión. `null` si no consta la última. */
export function nextReviewDue(
  lastReviewed: string | null,
  cadenceDays: number,
): string | null {
  const d = parseIsoDateUTC(lastReviewed);
  if (!d) return null;
  d.setUTCDate(d.getUTCDate() + normalizeCadenceDays(cadenceDays));
  return d.toISOString().slice(0, 10);
}

/**
 * Estado de la revisión. `unknown` (nunca revisado) NO se colapsa con
 * `overdue`: son cosas distintas y se cuentan por separado — un sistema que
 * nadie ha mirado nunca no "venció", es que no empezó, y mezclarlos oculta el
 * peor de los dos casos dentro del montón del otro.
 */
export function reviewState(
  lastReviewed: string | null,
  cadenceDays: number,
  now: Date,
): ReviewState {
  const due = nextReviewDue(lastReviewed, cadenceDays);
  if (!due) return "unknown";
  const days = daysUntilDate(due, now);
  if (days === null) return "unknown";
  if (days < 0) return "overdue";
  return days <= REVIEW_SOON_DAYS ? "due_soon" : "ok";
}

export type ReviewDue = {
  systemId: string;
  systemName: string;
  lastReviewed: string | null;
  dueOn: string | null;
  daysLeft: number | null;
  state: ReviewState;
};

/**
 * Sistemas cuya revisión está vencida, próxima o nunca hecha, del más urgente
 * al menos. Los que están al día no se devuelven: este listado alimenta un
 * aviso, y un aviso que incluye lo que va bien deja de leerse.
 */
const STATE_ORDER: Record<ReviewState, number> = {
  overdue: 0,
  unknown: 1,
  due_soon: 2,
  ok: 3,
};

export function collectReviewsDue(
  systems: AiSystem[],
  cadenceDays: number,
  now: Date,
): ReviewDue[] {
  const out: ReviewDue[] = [];
  for (const s of systems) {
    const state = reviewState(s.lastReviewed, cadenceDays, now);
    if (state === "ok") continue;
    const dueOn = nextReviewDue(s.lastReviewed, cadenceDays);
    out.push({
      systemId: s.id,
      systemName: s.name,
      lastReviewed: s.lastReviewed || null,
      dueOn,
      daysLeft: dueOn ? daysUntilDate(dueOn, now) : null,
      state,
    });
  }
  out.sort((a, b) => {
    const sa = STATE_ORDER[a.state];
    const sb = STATE_ORDER[b.state];
    if (sa !== sb) return sa - sb;
    // Dentro del mismo estado, lo que vence antes primero. Los `unknown` no
    // tienen fecha: se ordenan por nombre para que la lista sea estable.
    if (a.daysLeft !== null && b.daysLeft !== null && a.daysLeft !== b.daysLeft) {
      return a.daysLeft - b.daysLeft;
    }
    return a.systemName.localeCompare(b.systemName);
  });
  return out;
}

/**
 * Disparadores por EVENTO. Son los de primera clase: la norma reconoce el
 * cambio, no el calendario.
 *
 * `art27` marca los que se corresponden con un elemento del Art. 27.1. Ese
 * artículo se cita en la UI **con su condicional**, nunca a secas: actualizar la
 * evaluación de impacto solo obliga a quien está sujeto al 27.1, y programársela
 * a un cliente de RRHH privado sería inventarle un deber.
 */
export type ReviewTrigger = {
  key: string;
  art27: boolean;
  article: string | null;
};

export const REVIEW_TRIGGERS: readonly ReviewTrigger[] = [
  { key: "incident", art27: false, article: "Art. 26.5" },
  { key: "substantialChange", art27: false, article: null },
  { key: "vendorOrModel", art27: false, article: null },
  { key: "purpose", art27: true, article: "Art. 27.1.a" },
  { key: "affectedGroups", art27: true, article: "Art. 27.1.c" },
  { key: "newRisks", art27: true, article: "Art. 27.1.d" },
  { key: "humanOversight", art27: true, article: "Art. 27.1.e" },
  { key: "regulatory", art27: false, article: null },
];
