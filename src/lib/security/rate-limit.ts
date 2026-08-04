/**
 * Rate limiter en dos capas: memoria del proceso + contador compartido en Postgres.
 *
 * EL PROBLEMA QUE RESUELVE. La versión anterior vivía solo en la memoria del
 * proceso, y en serverless cada instancia tiene la suya. Frenaba una ráfaga
 * contra una misma instancia caliente —el script de spam tonto— pero no a quien
 * repartía sus intentos, porque Vercel le iba dando instancias distintas. Con N
 * instancias el límite real era N veces el configurado, y nadie sabía cuánto
 * valía N. En la lista de espera eso era molesto; en el formulario de intake,
 * que es la ÚNICA escritura anónima del producto, era el agujero de verdad.
 *
 * POR QUÉ DOS CAPAS Y NO SOLO LA COMPARTIDA. La de memoria es gratis y no sale a
 * la red: quien ya se pasó del límite en esta instancia se rechaza sin gastar
 * una consulta, que es el caso del abuso sostenido. La compartida manda cuando
 * la de memoria deja pasar, y es la única que ve lo que hacen las demás
 * instancias. El orden importa: la memoria decide **solo para denegar**;
 * permitir nunca es decisión suya.
 *
 * POR QUÉ POSTGRES Y NO UPSTASH / VERCEL KV, que es lo que pedía el ticket. Un
 * contador compartido no necesita un proveedor nuevo: ya hay un estado
 * compartido en la UE con su DPA firmado. Añadir Redis es coste recurrente, un
 * subprocesador más que declarar y otro sitio donde mirar cuando algo falle;
 * para tres superficies de baja frecuencia no compensa. Si algún día hay que
 * limitar login o checkout con miles de peticiones por minuto, se cambia el
 * almacén y no las llamadas: por eso `checkRateLimit` no dice dónde vive el
 * contador.
 *
 * QUÉ SE MANDA A LA BASE DE DATOS: un **hash** de la clave, nunca la clave. Las
 * claves llevan direcciones IP, y un limitador no necesita saber a quién limita,
 * solo distinguirlo. Una tabla de IP en la UE es un dato personal más que
 * custodiar sin ninguna necesidad.
 *
 * DEGRADACIÓN: si la migración 0034 no está aplicada, o la base de datos falla,
 * **se permite** la petición y queda solo la capa de memoria. Es la decisión
 * incómoda pero correcta: caer cerrado convertiría cualquier hipo de la base de
 * datos en una caída del formulario público. Se registra para que no sea
 * invisible.
 */
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logDataFallback } from "@/lib/observability/log";

const buckets = new Map<string, number[]>();
// Cota de seguridad: no dejar crecer el mapa sin límite si hay muchas claves.
const MAX_KEYS = 5000;

/**
 * Capa 1: ventana deslizante en memoria del proceso.
 *
 * Devuelve `true` si la petición se PERMITE *en esta instancia*. Sigue siendo
 * pública porque hay sitios donde una barrera local basta y no se quiere pagar
 * una consulta, pero para lo que importe úsese `checkRateLimit`.
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

/**
 * Hash de la clave, para no guardar direcciones IP en la base de datos.
 *
 * SHA-256 truncado a 128 bits. NO lleva sal, a propósito: una sal por proceso
 * rompería el recuento entre instancias, que es justo lo que este módulo existe
 * para arreglar. Eso significa que el hash es reversible por fuerza bruta para
 * quien tenga la tabla y una lista de IP candidatas — aceptable, porque el
 * objetivo no es anonimizar frente a alguien con acceso a la base de datos (si
 * lo tiene, hay problemas mayores) sino no acumular un registro de direcciones
 * IP que nadie necesita.
 *
 * Exportada solo para poder probarla: `checkRateLimit` necesita Supabase y la
 * suite de este repo es de lógica pura.
 */
export async function hashKey(key: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key),
  );
  return Array.from(new Uint8Array(digest).slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Capa 1 + capa 2. Devuelve `true` si la petición se PERMITE.
 *
 * @param key      identificador del emisor (p. ej. `intake:1.2.3.4`). Se hashea
 *                 antes de salir del proceso.
 * @param limit    peticiones permitidas dentro de la ventana.
 * @param windowMs tamaño de la ventana en milisegundos (la RPC exige >= 1000).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  // Capa 1. Solo puede DENEGAR: si esta instancia ya vio pasarse a este emisor,
  // no hace falta preguntar a nadie.
  if (!rateLimit(key, limit, windowMs)) return false;

  // Sin backend (modo demo) no hay contador compartido ni nada que proteger.
  if (!isSupabaseConfigured) return true;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("consume_rate_limit", {
      p_bucket: await hashKey(key),
      p_limit: limit,
      p_window_ms: windowMs,
    });
    if (error) {
      // Sin la 0034 aplicada la RPC no existe: se registra como
      // `migration-pending` y se sigue con la capa de memoria.
      logDataFallback("checkRateLimit", error, "solo queda el límite en memoria");
      return true;
    }
    return data !== false;
  } catch (err) {
    logDataFallback("checkRateLimit", err, "solo queda el límite en memoria");
    return true;
  }
}
