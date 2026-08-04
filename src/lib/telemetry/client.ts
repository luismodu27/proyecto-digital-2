"use client";

import { isClientEvent, normalizePath, type ProductEvent } from "./events";

/**
 * Emisor de telemetría del navegador.
 *
 * Privacidad por diseño (y por coherencia con lo que vendemos):
 *
 *  · **Sin terceros.** El evento va a `/api/telemetry`, mismo origen. Ningún
 *    script externo, ninguna cookie de terceros, nada que declarar como
 *    subprocesador ni que añadir a la CSP.
 *  · **Sin huella de dispositivo.** No se envía IP (el servidor tampoco la
 *    guarda), ni user-agent, ni resolución, ni nada que permita reidentificar.
 *  · **`anon_id` = número aleatorio de primera parte** en `localStorage`, solo
 *    para poder contar "visitantes distintos" en lugar de "recargas". No cruza
 *    dominios ni se comparte. El planteamiento es el de medición de audiencia
 *    (primera parte, agregada, sin cesión), que es la única analítica que puede
 *    sostenerse sin banner; la página de privacidad debe declararlo igualmente.
 *  · **Se respeta el opt-out del navegador**: `globalPrivacyControl` (GPC) y
 *    `doNotTrack`. Si el visitante lo pide, no se emite nada — punto.
 *
 * Nunca lanza: si `localStorage` está bloqueado o la red falla, no se mide y se
 * sigue navegando.
 */

const ANON_ID_KEY = "attesta_aid";
const ENDPOINT = "/api/telemetry";

/**
 * Marca de rechazo explícito, desde el botón de la página de cookies.
 *
 * Se guarda en `localStorage` y no en una cookie a propósito: una cookie viajaría
 * en cada petición y, para respetar una decisión que solo importa en el
 * navegador, eso es justo lo contrario de lo que se pretende. El precio conocido
 * es que el rechazo es por navegador y desaparece si se vacía el almacenamiento
 * del sitio — el mismo precio que paga cualquier banner de cookies.
 */
const OPT_OUT_KEY = "attesta_no_track";

/**
 * Evento que se dispara al cambiar la preferencia. `localStorage` no notifica a
 * la propia pestaña que escribe (el evento `storage` solo llega a las OTRAS), así
 * que sin esto el control se quedaría mostrando el estado anterior justo en la
 * pestaña donde acabas de pulsar.
 */
export const MEASUREMENT_OPT_OUT_EVENT = "attesta:measurement-opt-out";

/** ¿El visitante pidió no ser medido? (rechazo explícito, GPC o DNT). */
function optedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  // El rechazo explícito va primero: es la decisión más reciente y más deliberada.
  try {
    if (window.localStorage.getItem(OPT_OUT_KEY) === "1") return true;
  } catch {
    // Almacenamiento bloqueado: se sigue con las señales del navegador.
  }
  const nav = navigator as Navigator & {
    globalPrivacyControl?: boolean;
    msDoNotTrack?: string;
  };
  if (nav.globalPrivacyControl === true) return true;
  return nav.doNotTrack === "1" || nav.msDoNotTrack === "1";
}

/** ¿Manda el navegador una señal de no rastreo? (para poder decirlo en la UI). */
export function browserSignalsOptOut(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    globalPrivacyControl?: boolean;
    msDoNotTrack?: string;
  };
  return (
    nav.globalPrivacyControl === true ||
    nav.doNotTrack === "1" ||
    nav.msDoNotTrack === "1"
  );
}

/** Lee el rechazo explícito. Nunca lanza. */
export function isMeasurementOptedOut(): boolean {
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Aplica o retira el rechazo explícito. Al rechazar se borra además el
 * identificador anónimo: dejar de medir y quedarse el identificador guardado
 * sería quedarse justo con la parte que molesta.
 */
export function setMeasurementOptOut(optOut: boolean): void {
  try {
    if (optOut) {
      window.localStorage.setItem(OPT_OUT_KEY, "1");
      window.localStorage.removeItem(ANON_ID_KEY);
    } else {
      window.localStorage.removeItem(OPT_OUT_KEY);
    }
  } catch {
    // Sin almacenamiento no hay nada que recordar; `optedOut` seguirá mirando
    // las señales del navegador.
  }
  // Se avisa siempre, incluso si el almacenamiento falló: la interfaz debe
  // repintarse y volver a leer el estado real, sea cual sea.
  window.dispatchEvent(new Event(MEASUREMENT_OPT_OUT_EVENT));
}

/**
 * Identificador anónimo estable por navegador. Si el almacenamiento no está
 * disponible (modo privado estricto, políticas de empresa) se devuelve
 * `undefined` y el evento se cuenta igual, solo que sin poder deduplicar.
 */
function anonId(): string | undefined {
  try {
    const existing = window.localStorage.getItem(ANON_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem(ANON_ID_KEY, id);
    return id;
  } catch {
    return undefined;
  }
}

/**
 * Registra un evento de cliente. Solo admite los eventos de `CLIENT_EVENTS`:
 * los hechos de negocio (pago, alta de sistema) se emiten en el servidor, donde
 * son comprobables.
 *
 * Envía con `sendBeacon` cuando existe, para que el evento sobreviva a la
 * navegación que suele provocarlo (un clic en un CTA descarga la página).
 */
export function track(
  event: ProductEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  if (!isClientEvent(event) || optedOut()) return;

  try {
    const body = JSON.stringify({
      event,
      props,
      anonId: anonId(),
      path: normalizePath(window.location.pathname),
      locale: document.documentElement.lang || undefined,
    });

    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }

    // `keepalive` para que la petición no se cancele al cambiar de página.
    void fetch(ENDPOINT, {
      method: "POST",
      body,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch {
    // Medir es best-effort: nunca a costa de la navegación.
  }
}
