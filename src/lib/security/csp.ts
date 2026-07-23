/**
 * Content-Security-Policy de Attesta.
 *
 * Estrategia de despliegue en dos capas (defensa en profundidad sin romper el
 * producto en vivo):
 *
 *  1. `enforced` — directivas que NO tienen riesgo de romper nada (no dependen
 *     de `default-src`) y que sí aportan protección real desde ya:
 *     anti-clickjacking (`frame-ancestors`), anti-inyección de `<base>`,
 *     anti-secuestro de formularios (`form-action`) y bloqueo de plugins
 *     (`object-src`). Se envían en la cabecera `Content-Security-Policy`.
 *
 *  2. `reportOnly` — la política ESTRICTA completa (incluye `default-src 'self'`,
 *     `script-src` con nonce, allowlist de Supabase y Stripe). Se envía en
 *     `Content-Security-Policy-Report-Only`: el navegador la evalúa y reporta
 *     violaciones, pero NO bloquea. Permite validar en producción/preview que
 *     Stripe, Supabase y el script de tema funcionan antes de promoverla a
 *     enforce (será un cambio de una línea: mover `reportOnly` a `enforced`).
 *
 * Notas de allowlist:
 *  - `script-src` incluye el nonce por request + Stripe.js.
 *  - `style-src 'unsafe-inline'`: Next y Tailwind inyectan estilos inline; poner
 *    nonce a todos es inviable y la inyección de estilos es de baja severidad.
 *  - `connect-src`: Supabase (REST + realtime por wss) y la API de Stripe.
 *  - `frame-src`: iframes de Stripe (Elements/Checkout).
 */
export function buildCsp(nonce: string): {
  enforced: string;
  reportOnly: string;
} {
  const enforced = [
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  const reportOnly = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

  return { enforced, reportOnly };
}

/** Genera un nonce aleatorio (base64) por request. Edge-safe. */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}
