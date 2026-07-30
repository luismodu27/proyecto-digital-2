/**
 * Observabilidad de los caminos degradados de Attesta.
 *
 * El problema que resuelve: la fachada de datos está llena de degradaciones
 * seguras del tipo `if (error) return []`. Son deliberadas —la app no puede
 * romperse porque una migración no esté aplicada— pero **borraban la causa**. En
 * producción, "la tabla todavía no existe", "la RLS está mal" y "Supabase está
 * caído" se veían exactamente igual: una pantalla vacía. Nadie puede depurar eso.
 *
 * Lo que hace: clasificar el error y dejar UNA línea de log estructurada, sin
 * cambiar el comportamiento. La app sigue degradando igual; ahora además se sabe
 * por qué.
 *
 * Lo que NO hace: enviar nada a un tercero. Integrar Sentry (o cualquier otro
 * destino) es sustituir la implementación de `emit` — el resto del código llama a
 * `logDataFallback` / `logIncident` y no cambia. Se deja así a propósito: sumar
 * un subprocesador es una decisión del fundador (coste + DPA), no un detalle
 * técnico que se cuele en un commit.
 *
 * Regla dura: **aquí no entran datos de cliente.** Se registran identificadores
 * técnicos (dónde, qué código de error) y el mensaje de Postgres, que habla de
 * tablas y columnas. Nunca filas, correos ni contenido del expediente.
 */

/**
 * Códigos que significan "el esquema todavía no está ahí" — el caso normal
 * cuando el fundador aún no ha pegado una migración en el SQL Editor:
 *   42P01 tabla inexistente · 42703 columna inexistente · 42883 función inexistente
 *   PGRST202/204/205 el esquema cacheado de PostgREST no conoce la función/tabla.
 * No son incidentes: son el estado esperado antes de aplicar la migración.
 */
const MIGRATION_PENDING = new Set([
  "42P01",
  "42703",
  "42883",
  "PGRST202",
  "PGRST204",
  "PGRST205",
]);

/** 42501 = la RLS denegó la operación. */
const PERMISSION_DENIED = "42501";

export type DataIssueKind =
  /** Falta una migración: degradación esperada, no hay que despertar a nadie. */
  | "migration-pending"
  /** La RLS denegó: o está mal configurada, o alguien intentó cruzar de tenant. */
  | "permission"
  /** Cualquier otra cosa: Supabase caído, red, bug nuestro. Esto SÍ es un aviso. */
  | "incident";

type SupabaseLikeError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

function asSupabaseError(error: unknown): SupabaseLikeError | null {
  if (!error || typeof error !== "object") return null;
  const e = error as SupabaseLikeError;
  if (typeof e.code === "string" || typeof e.message === "string") return e;
  return null;
}

/** Clasifica un error de Supabase/PostgREST en una de las tres categorías. */
export function classifyDataError(error: unknown): DataIssueKind {
  const e = asSupabaseError(error);
  const code = e?.code ?? "";
  if (MIGRATION_PENDING.has(code)) return "migration-pending";
  if (code === PERMISSION_DENIED) return "permission";
  // PostgREST a veces solo trae el mensaje: última red para el caso frecuente.
  const msg = (e?.message ?? "").toLowerCase();
  if (/does not exist|schema cache|could not find the function/.test(msg)) {
    return "migration-pending";
  }
  return "incident";
}

/**
 * Antirruido: una migración sin aplicar generaría una línea por render. Se emite
 * como mucho una vez cada 5 min por combinación (sitio + código).
 *
 * Alcance honesto: el mapa vive en la memoria del proceso, así que en serverless
 * cada instancia tiene el suyo. Suficiente para no inundar el log; no es un
 * deduplicado exacto.
 */
const lastEmitted = new Map<string, number>();
const THROTTLE_MS = 5 * 60 * 1000;
const MAX_KEYS = 500;

function shouldEmit(key: string, now: number): boolean {
  const prev = lastEmitted.get(key);
  if (prev !== undefined && now - prev < THROTTLE_MS) return false;
  lastEmitted.set(key, now);
  if (lastEmitted.size > MAX_KEYS) {
    for (const [k, t] of lastEmitted) {
      if (now - t >= THROTTLE_MS) lastEmitted.delete(k);
    }
  }
  return true;
}

/** Recorta un texto para que un mensaje enorme no llene el log. */
function trim(value: unknown, max = 300): string | undefined {
  if (typeof value !== "string") return undefined;
  const s = value.trim();
  return s ? s.slice(0, max) : undefined;
}

type LogLine = {
  at: string;
  kind: DataIssueKind | "incident";
  code?: string;
  message?: string;
  hint?: string;
  detail?: string;
};

/**
 * Único punto de salida. Una línea JSON por evento: Vercel y cualquier colector
 * de logs la parsean sin configuración, y `grep '"at":"getAiSystems"'` funciona.
 */
function emit(level: "warn" | "error", line: LogLine): void {
  const payload = JSON.stringify({ src: "attesta", ...line });
  if (level === "error") console.error(payload);
  else console.warn(payload);
}

/**
 * Registra una degradación de la fachada de datos y devuelve su clasificación,
 * por si quien llama quiere decidir con ella. **No lanza nunca**: si el logging
 * fallara, la degradación debe seguir funcionando igual.
 *
 * @param at    identificador del sitio (nombre del getter: `"getAiSystems"`).
 * @param error el error crudo de Supabase.
 * @param detail pista técnica opcional (p. ej. `"fallback sin columna prohibited"`).
 */
export function logDataFallback(
  at: string,
  error: unknown,
  detail?: string,
): DataIssueKind {
  const kind = classifyDataError(error);
  try {
    const e = asSupabaseError(error);
    const code = trim(e?.code, 32);
    if (!shouldEmit(`${at}:${kind}:${code ?? ""}`, Date.now())) return kind;
    emit(kind === "migration-pending" ? "warn" : "error", {
      at,
      kind,
      code,
      message: trim(e?.message) ?? (error ? "sin mensaje" : "sin error (datos vacíos)"),
      hint: trim(e?.hint),
      detail: trim(detail, 120),
    });
  } catch {
    // Observabilidad best-effort.
  }
  return kind;
}

/**
 * Registra un fallo inesperado en un camino de escritura o en un `catch`. Se
 * marca siempre como incidente: si estamos en un `catch` es que algo se rompió.
 */
export function logIncident(at: string, error: unknown, detail?: string): void {
  try {
    const e = asSupabaseError(error);
    const code = trim(e?.code, 32);
    if (!shouldEmit(`${at}:incident:${code ?? ""}`, Date.now())) return;
    emit("error", {
      at,
      kind: "incident",
      code,
      message:
        trim(e?.message) ??
        trim(error instanceof Error ? error.message : String(error ?? "")) ??
        "sin mensaje",
      detail: trim(detail, 120),
    });
  } catch {
    // idem
  }
}

/** Reinicia el antirruido. Solo para los tests. */
export function __resetLogThrottle(): void {
  lastEmitted.clear();
}
