import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg, getCurrentUser } from "@/lib/data/context";
import { insertEvent } from "@/lib/telemetry/server";
import {
  isClientEvent,
  normalizePath,
  sanitizeProps,
} from "@/lib/telemetry/events";

/**
 * Ingesta de telemetría del navegador.
 *
 * Superficie pública, así que se trata como hostil:
 *  · **whitelist de eventos** (`CLIENT_EVENTS`): un cliente no puede inventar un
 *    `checkout_completed` y contaminar el embudo de ingresos;
 *  · **rate-limit por IP** para que un script no infle las métricas gratis;
 *  · **cuerpo acotado** (4 KB) y `props` saneadas (sin PII, ≤8 claves);
 *  · **respuesta siempre 204**, sin cuerpo: no confirma ni desmiente que se haya
 *    guardado nada, así que no sirve como oráculo para sondear el sistema.
 *
 * La IP se usa SOLO como clave de rate-limit en memoria del proceso; no se
 * guarda en la base de datos.
 */

// ~1 evento cada 2,5 s sostenidos: de sobra para navegación humana, caro para
// un bucle automatizado.
const RL_LIMIT = 120;
const RL_WINDOW_MS = 5 * 60 * 1000;

/** Cuerpo máximo aceptado. Un evento legítimo ronda los 200 bytes. */
const MAX_BODY_BYTES = 4096;

const LOCALES = new Set(["es", "en"]);
/** `anon_id` esperado: un uuid v4 generado por el cliente. */
const ANON_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * ¿Trae cookie de sesión de Supabase? Si no, es una visita anónima (el caso
 * típico de la landing) y nos ahorramos la llamada de red a Supabase Auth para
 * resolver un usuario que no existe.
 *
 * Cuando el middleware pase a verificar el JWT en local (§0.B, `getClaims`) esto
 * podrá resolverse sin red en ningún caso.
 */
function hasSessionCookie(req: Request): boolean {
  const cookie = req.headers.get("cookie");
  return !!cookie && /(?:^|;\s*)sb-[^=]*auth-token/.test(cookie);
}

export async function POST(req: Request) {
  const noContent = new NextResponse(null, { status: 204 });

  // Modo demo: no hay backend donde escribir y las demos no deben contaminar
  // las métricas reales.
  if (!isSupabaseConfigured) return noContent;

  if (!rateLimit(`telemetry:${clientIp(req)}`, RL_LIMIT, RL_WINDOW_MS)) {
    return noContent;
  }

  let payload: unknown;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return noContent;
    payload = JSON.parse(raw);
  } catch {
    return noContent;
  }

  if (!payload || typeof payload !== "object") return noContent;
  const body = payload as Record<string, unknown>;

  const event = body.event;
  if (!isClientEvent(event)) return noContent;

  const anonId =
    typeof body.anonId === "string" && ANON_ID_RE.test(body.anonId)
      ? body.anonId
      : null;
  const path =
    typeof body.path === "string" ? normalizePath(body.path) : null;
  const locale =
    typeof body.locale === "string" && LOCALES.has(body.locale)
      ? body.locale
      : null;

  // Identidad solo si hay sesión: enlaza la navegación del dashboard con la
  // organización, que es lo que permite medir activación por cuenta.
  let userId: string | null = null;
  let organizationId: string | null = null;
  if (hasSessionCookie(req)) {
    try {
      const [user, org] = await Promise.all([getCurrentUser(), getActiveOrg()]);
      userId = user?.id ?? null;
      organizationId = org ?? null;
    } catch {
      // Sesión ilegible: se guarda como visita anónima.
    }
  }

  await insertEvent({
    event,
    anon_id: anonId,
    user_id: userId,
    organization_id: organizationId,
    path,
    locale,
    props: sanitizeProps(body.props),
  });

  return noContent;
}
