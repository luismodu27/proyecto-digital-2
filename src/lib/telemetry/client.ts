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

/** ¿El visitante pidió no ser medido? (GPC o DNT). */
function optedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & {
    globalPrivacyControl?: boolean;
    msDoNotTrack?: string;
  };
  if (nav.globalPrivacyControl === true) return true;
  return nav.doNotTrack === "1" || nav.msDoNotTrack === "1";
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
