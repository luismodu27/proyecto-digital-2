/**
 * Catálogo canónico de eventos de telemetría de producto.
 *
 * Regla de oro: **la lista es cerrada**. Un `track("lo_que_sea")` no compila y la
 * API rechaza cualquier nombre que no esté aquí. Motivo: la telemetría de texto
 * libre se degrada en semanas (`cta_click`, `click_cta`, `ctaClick`…) y deja de
 * poder responder la única pregunta que importa — ¿de cada 100 visitas, cuántas
 * clasifican su primer sistema y cuántas pagan?
 *
 * Segunda regla: **ningún evento lleva datos personales**. Ni correos, ni
 * nombres de sistemas, ni texto escrito por el usuario. Solo identificadores
 * técnicos (qué CTA, qué plan, qué paso). `sanitizeProps` lo hace cumplir.
 *
 * Este módulo es compartido cliente/servidor: sin imports de servidor.
 */

export const PRODUCT_EVENTS = [
  // --- Web pública -------------------------------------------------------
  /** Visita a una página (cliente). El path va en su propia columna. */
  "page_view",
  /** Clic en una llamada a la acción. props: `{ id }` (p. ej. `hero_primary`). */
  "cta_click",
  /** Solicitud de acceso enviada desde la landing (servidor). */
  "waitlist_submit",
  /**
   * Solicitud de DEMO enviada (servidor). Es distinta de `waitlist_submit` a
   * propósito: la lista de espera es "avísame cuando esté" y esto es "quiero
   * hablar". Mezclarlas escondería la única señal que dice si la venta asistida
   * funciona. props: `{ size, source }` — nunca correo ni nombre.
   */
  "demo_requested",

  // --- Alta y activación -------------------------------------------------
  /** El visitante envió el formulario en modo registro (cliente). */
  "signup_submitted",
  /** Organización creada en el onboarding: el alta se completó (servidor). */
  "org_created",
  /** Primer/enésimo sistema de IA dado de alta en el inventario (servidor). */
  "system_created",
  /** Evaluación de riesgo guardada (servidor). props: `{ level }`. */
  "risk_assessed",
  /** Policy pack aplicado: se generaron brechas reales (servidor). props: `{ pack }`. */
  "pack_applied",

  // --- Monetización ------------------------------------------------------
  /** Un muro de pago se mostró de verdad (servidor). props: `{ feature }`. */
  "paywall_viewed",
  /**
   * Un cupo bloqueó un alta de verdad (servidor). props: `{ kind, plan }`.
   *
   * Es la señal de expansión más honesta que tenemos: no dice "podría pagar
   * más", dice "quiso hacer algo y el plan no le dejó". Se emite solo cuando el
   * bloqueo ocurre, nunca al pintar un aviso.
   */
  "quota_blocked",
  /** Se abrió el checkout de Stripe (servidor). */
  "checkout_started",
  /** Stripe confirmó el pago por webhook (servidor). */
  "checkout_completed",

  // --- Señales de valor / expansión --------------------------------------
  /** Descarga del paquete de evidencia (servidor). */
  "export_downloaded",
  /** Invitación a un compañero enviada (servidor). */
  "invite_sent",
] as const;

export type ProductEvent = (typeof PRODUCT_EVENTS)[number];

const EVENT_SET: ReadonlySet<string> = new Set(PRODUCT_EVENTS);

/**
 * Eventos que el navegador puede emitir. El resto solo se emiten desde el
 * servidor, donde el hecho es comprobable: nadie puede falsear un
 * `checkout_completed` desde la consola del navegador y ensuciar el embudo.
 */
export const CLIENT_EVENTS = [
  "page_view",
  "cta_click",
  "signup_submitted",
] as const satisfies readonly ProductEvent[];

const CLIENT_EVENT_SET: ReadonlySet<string> = new Set(CLIENT_EVENTS);

export function isProductEvent(value: unknown): value is ProductEvent {
  return typeof value === "string" && EVENT_SET.has(value);
}

export function isClientEvent(value: unknown): value is ProductEvent {
  return typeof value === "string" && CLIENT_EVENT_SET.has(value);
}

/**
 * Embudo de activación, en orden. Cada paso se mide con un evento; el panel
 * calcula la conversión de un paso al siguiente sobre *visitantes distintos*.
 *
 * No es una secuencia obligatoria (alguien puede pagar sin aplicar un pack), es
 * el orden en el que esperamos que ocurra la vida de una cuenta sana.
 */
export const ACTIVATION_FUNNEL = [
  "page_view",
  "signup_submitted",
  "org_created",
  "system_created",
  "risk_assessed",
  "pack_applied",
  "paywall_viewed",
  "checkout_started",
  "checkout_completed",
] as const satisfies readonly ProductEvent[];

/**
 * Fila agregada del embudo, tal y como la devuelve la RPC `product_funnel`.
 * `visitors` son unidades distintas (usuario si hay sesión, `anon_id` si no).
 */
export type FunnelRow = {
  event: string;
  events: number;
  visitors: number;
  lastAt: string | null;
};

/** Valores admitidos en `props` tras el saneado. */
export type PropValue = string | number | boolean;
export type EventProps = Record<string, PropValue>;

const MAX_PROP_KEYS = 8;
const MAX_KEY_LEN = 32;
const MAX_VALUE_LEN = 64;

/**
 * Normaliza un path para que agrupe: `/dashboard/inventario/<uuid>/dossier` y
 * el de otro sistema son la MISMA página a efectos de embudo. Sin esto cada
 * dossier sería una fila distinta y el panel no diría nada.
 *
 * También descarta la query string: puede llevar tokens (`?code=`, `?toast=`) y
 * no aporta nada al embudo.
 */
export function normalizePath(raw: string): string {
  // `||` y no `??`: al partir una cadena vacía sale `""`, no `undefined`, y un
  // path vacío en la columna se lee como un fallo de instrumentación.
  const path = raw.split(/[?#]/)[0] || "/";
  return path
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi,
      "/:id",
    )
    .replace(/\/\d{2,}(?=\/|$)/g, "/:id")
    .slice(0, 255);
}

/**
 * Deja `props` en un saco pequeño y sin datos personales:
 *  · máximo 8 claves, nombres cortos y en `[a-z0-9_]`;
 *  · solo string/number/boolean (nada anidado);
 *  · valores recortados a 64 caracteres;
 *  · **se descarta cualquier valor con `@`** — la fuga de PII más probable es
 *    colar un correo sin darse cuenta, y es mejor perder el dato que guardarlo.
 */
export function sanitizeProps(input: unknown): EventProps {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: EventProps = {};
  for (const [rawKey, value] of Object.entries(input as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_PROP_KEYS) break;
    const key = rawKey.slice(0, MAX_KEY_LEN);
    if (!/^[a-z0-9_]+$/.test(key)) continue;
    if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
    } else if (typeof value === "boolean") {
      out[key] = value;
    } else if (typeof value === "string") {
      if (value.includes("@")) continue;
      const trimmed = value.trim();
      if (trimmed) out[key] = trimmed.slice(0, MAX_VALUE_LEN);
    }
  }
  return out;
}
