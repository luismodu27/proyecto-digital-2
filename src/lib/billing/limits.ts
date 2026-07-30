import type { PlanTier } from "./plan";

/**
 * Cupos por plan (metering) — LÓGICA PURA.
 *
 * Por qué existe: hasta ahora una organización con 2 sistemas de IA y otra con 50
 * pagaban lo mismo. El trabajo de gobernanza crece con el inventario y con el
 * equipo, así que el precio tenía que poder crecer con ellos; si no, el plan de
 * pago se convierte en un techo de ingresos y el Enterprise no tiene por dónde
 * empezar la conversación.
 *
 * Este módulo es **puro a propósito** (sin Supabase, sin `next/*`): las cuentas y
 * la resolución del plan viven en `quota.ts`, que sí toca la base de datos. Así la
 * aritmética del cupo —la parte que, mal editada, cobra de más o bloquea a un
 * cliente que paga— se puede probar con tests en milisegundos.
 *
 * REGLAS DE PRODUCTO que el código debe respetar (decisión del fundador):
 *  · Los cupos limitan **crear**, nunca **ver**. Lo ya creado no se oculta, no se
 *    bloquea y no se borra jamás por bajar de plan: un expediente regulatorio que
 *    desaparece porque caducó una tarjeta es un daño mucho peor que no cobrar.
 *  · Se avisa **antes** de chocar (al 80 %), para que nadie descubra el tope justo
 *    cuando está a mitad de una tarea.
 *  · Enterprise no tiene tope por defecto; los números de un contrato concreto se
 *    fijan por organización (columnas `max_systems`/`max_seats`, migración 0029).
 */

/** Qué se mide. Añadir uno nuevo obliga a declarar su cupo en los tres planes. */
export type QuotaKind = "systems" | "seats";

/**
 * Cupo por plan. `null` = sin tope.
 *
 * Los números son decisión de negocio, no técnica:
 *  · 3 sistemas en el plano gratuito bastan para ver el producto de verdad
 *    (inventariar, clasificar) y no bastan para gobernar una empresa.
 *  · 25 sistemas cubren un inventario de mid-market real, así que quien lo supera
 *    es Enterprise de facto y ahí empieza la conversación comercial.
 *  · Los asientos son coste real de soporte y el argumento de venta más claro.
 */
export const PLAN_LIMITS: Record<PlanTier, Record<QuotaKind, number | null>> = {
  free: { systems: 3, seats: 1 },
  preparacion: { systems: 25, seats: 5 },
  enterprise: { systems: null, seats: null },
};

/** A partir de qué proporción del cupo se avisa (80 %). */
export const NEAR_LIMIT_RATIO = 0.8;

/**
 * Cupo efectivo: el pactado por organización si existe, y si no el del plan.
 *
 * El override **siempre gana**, incluso si es MENOR que el del plan. Es
 * deliberado: un Enterprise puede venderse como "hasta 200 sistemas", y eso es un
 * tope por debajo del "sin límite" de su plan. La contrapartida es que el override
 * hay que **limpiarlo** (`set max_systems = null`) cuando un contrato termina, o
 * seguirá aplicándose con un plan que ya no le corresponde.
 *
 * Un override de 0 o negativo se ignora: no queremos que un dedo en el SQL Editor
 * deje una organización sin poder crear nada.
 */
export function resolveMax(
  plan: PlanTier,
  kind: QuotaKind,
  override?: number | null,
): number | null {
  if (typeof override === "number" && Number.isFinite(override) && override > 0) {
    return Math.floor(override);
  }
  return PLAN_LIMITS[plan]?.[kind] ?? null;
}

export type QuotaState = {
  kind: QuotaKind;
  /** Cuántos hay ya. */
  used: number;
  /** Tope efectivo, o `null` si no hay. */
  max: number | null;
  unlimited: boolean;
  /** Cuántos caben todavía (`null` si no hay tope). Nunca negativo. */
  remaining: number | null;
  /** Ya no cabe ninguno más. */
  atLimit: boolean;
  /** Cabe alguno, pero se cruzó el umbral de aviso. */
  nearLimit: boolean;
  /** Proporción consumida 0..1 (`null` si no hay tope). Acotada a 1. */
  ratio: number | null;
};

/**
 * Estado del cupo a partir del consumo y el tope.
 *
 * `used` puede venir POR ENCIMA del tope y es un caso legítimo, no un error: pasa
 * cuando una organización baja de plan, o cuando el fundador reduce un override.
 * En ese caso `remaining` es 0 y `atLimit` es true — no se puede crear más — pero
 * nada de lo existente se toca.
 */
export function quotaState(
  kind: QuotaKind,
  used: number,
  max: number | null,
): QuotaState {
  const safeUsed = Number.isFinite(used) && used > 0 ? Math.floor(used) : 0;

  if (max === null) {
    return {
      kind,
      used: safeUsed,
      max: null,
      unlimited: true,
      remaining: null,
      atLimit: false,
      nearLimit: false,
      ratio: null,
    };
  }

  const remaining = Math.max(0, max - safeUsed);
  const ratio = Math.min(1, safeUsed / max);
  return {
    kind,
    used: safeUsed,
    max,
    unlimited: false,
    remaining,
    atLimit: remaining === 0,
    nearLimit: remaining > 0 && ratio >= NEAR_LIMIT_RATIO,
    ratio,
  };
}

/** ¿Caben `adding` elementos más? (`adding` por defecto 1). */
export function fitsWithin(state: QuotaState, adding = 1): boolean {
  if (state.unlimited) return true;
  if (adding <= 0) return true;
  return (state.remaining ?? 0) >= adding;
}

/**
 * De `wanted` elementos, cuántos entran.
 *
 * Existe por la importación de CSV: si alguien sube 40 filas y le caben 20, lo
 * correcto es crear esas 20 y decirle con precisión que 20 se quedaron fuera por
 * el cupo. Rechazar el fichero entero le obliga a editarlo a mano para averiguar
 * dónde estaba el corte, que es trabajo que podemos hacer nosotros.
 */
export function allowedToAdd(state: QuotaState, wanted: number): number {
  if (wanted <= 0) return 0;
  if (state.unlimited) return Math.floor(wanted);
  return Math.min(Math.floor(wanted), state.remaining ?? 0);
}
