/**
 * Rate limiter de ventana deslizante, en memoria del proceso.
 *
 * Alcance y límites honestos: en un entorno serverless (Vercel) cada instancia
 * tiene su propia memoria, así que esto frena ráfagas contra una MISMA instancia
 * caliente (el patrón típico de un script de spam), pero no es un límite
 * distribuido perfecto. Para eso haría falta un store compartido (p. ej. Upstash
 * Redis). Es una barrera proporcionada para superficies de baja severidad como la
 * lista de espera: sube el coste del abuso sin infraestructura extra.
 */

const buckets = new Map<string, number[]>();
// Cota de seguridad: no dejar crecer el mapa sin límite si hay muchas claves.
const MAX_KEYS = 5000;

/**
 * Devuelve `true` si la petición se PERMITE, `false` si se supera el límite.
 * @param key    identificador del emisor (p. ej. IP).
 * @param limit  peticiones permitidas dentro de la ventana.
 * @param windowMs  tamaño de la ventana en milisegundos.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Poda perezosa: si el mapa se dispara, elimina claves ya vacías/expiradas.
  if (buckets.size > MAX_KEYS) {
    for (const [k, times] of buckets) {
      if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }

  return true;
}
