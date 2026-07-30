import "server-only";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg, getCurrentUser } from "@/lib/data/context";
import { logDataFallback } from "@/lib/observability/log";
import {
  normalizePath,
  sanitizeProps,
  type EventProps,
  type ProductEvent,
} from "./events";

/**
 * Emisor de telemetría del lado servidor.
 *
 * Tres invariantes, en este orden de importancia:
 *
 *  1. **Nunca rompe el producto.** Todo va en try/catch y termina en un no-op.
 *     Un fallo al medir jamás debe impedir crear un sistema, cobrar o exportar
 *     evidencia. Si la tabla `product_events` no existe (migración 0026 sin
 *     aplicar), la app funciona igual y simplemente no hay métricas.
 *  2. **No añade latencia percibida.** El insert se agenda con `after()` de
 *     Next: se ejecuta cuando la respuesta ya se envió. El cliente no espera.
 *  3. **No inventa identidad.** Usuario y organización se resuelven con los
 *     getters ya memoizados por render (`cache()`), así que en una página del
 *     dashboard no cuesta ni una llamada extra de red.
 *
 * En MODO DEMO (sin credenciales de Supabase) no hace nada: no hay backend y las
 * capturas/demos no deben contaminar las métricas reales.
 */

type TrackOptions = {
  /** Metadatos del evento. Se sanean (sin PII, ≤8 claves). */
  props?: Record<string, unknown>;
  /** Ruta asociada, si el evento nace de una página concreta. */
  path?: string;
  /** Organización, cuando quien llama ya la tiene resuelta (evita re-resolver). */
  organizationId?: string | null;
};

/** Fila lista para insertar. Se construye en el ámbito de la petición. */
type EventRow = {
  event: string;
  anon_id?: string | null;
  user_id?: string | null;
  organization_id?: string | null;
  path?: string | null;
  locale?: string | null;
  props: EventProps;
};

/** Cliente ya construido en el ámbito de la petición. */
type Inserter = Awaited<ReturnType<typeof createClient>>;

/** Insert crudo con un cliente dado. No lanza nunca. */
async function insertWith(supabase: Inserter, row: EventRow): Promise<boolean> {
  try {
    const { error } = await supabase.from("product_events").insert(row);
    // Se registra (con antirruido) para que una telemetría muda no pase por
    // silenciosa: si 0026 no está aplicada aparece como `migration-pending`, y si
    // fuera otra cosa, como incidente.
    if (error) logDataFallback("telemetry.insert", error);
    return !error;
  } catch (err) {
    logDataFallback("telemetry.insert", err);
    return false;
  }
}

/**
 * Inserta una fila de telemetría. Lo usa la API que recibe los eventos del
 * navegador, que sí está en el ámbito de la petición y puede esperar el insert.
 * No lanza nunca.
 *
 * Devuelve `true` solo si el insert llegó a hacerse, para no mentir en la
 * respuesta de la API.
 */
export async function insertEvent(row: EventRow): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    return await insertWith(await createClient(), row);
  } catch {
    return false;
  }
}

/** Datos de sesión para la telemetría. Silencioso ante cualquier fallo. */
async function resolveActor(
  organizationId?: string | null,
): Promise<{ user_id: string | null; organization_id: string | null }> {
  try {
    const user = await getCurrentUser();
    const org =
      organizationId !== undefined ? organizationId : await getActiveOrg();
    return { user_id: user?.id ?? null, organization_id: org ?? null };
  } catch {
    return { user_id: null, organization_id: organizationId ?? null };
  }
}

/**
 * Registra un evento de producto desde el servidor (Server Action, Route
 * Handler o Server Component).
 *
 * Se llama sin `await` en los sitios donde el valor de negocio es la acción y no
 * la medición; aun así es `async` porque necesita resolver la sesión antes de
 * agendar el insert.
 */
export async function trackServer(
  event: ProductEvent,
  options: TrackOptions = {},
): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const actor = await resolveActor(options.organizationId);
    const row: EventRow = {
      event,
      ...actor,
      path: options.path ? normalizePath(options.path) : null,
      props: sanitizeProps(options.props),
    };

    // El cliente se construye AQUÍ, dentro del ámbito de la petición (lee
    // cookies y pasa por `cache()`); dentro de `after()` ese ámbito ya no
    // existe. Lo que se aplaza es solo la llamada de red del insert.
    const supabase = await createClient();

    // `after()` mueve el insert fuera del camino crítico: se ejecuta cuando la
    // respuesta ya salió. Si el contexto no lo admite (algún runtime sin request
    // scope), se hace en línea: medir importa, pero nunca a costa de lanzar.
    try {
      after(() => {
        void insertWith(supabase, row);
      });
    } catch {
      void insertWith(supabase, row);
    }
  } catch {
    // Telemetría best-effort: cualquier fallo se traga.
  }
}
