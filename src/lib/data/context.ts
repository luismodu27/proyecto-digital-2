import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logDataFallback } from "@/lib/observability/log";
import type { MemberRole } from "@/lib/mock-data";

/** Nombre de la cookie que guarda la organización activa elegida por el usuario. */
export const ACTIVE_ORG_COOKIE = "attesta_org";

/** Lo que el resto de la app usa del usuario. Sale entero del JWT. */
export type SessionUser = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
};

/**
 * Usuario autenticado actual (o null en modo demo / sin sesión).
 *
 * `getClaims()` en vez de `getUser()`, **la misma técnica que ya usa el
 * middleware** (ver `supabase/middleware.ts`, Sprint 2): verifica la firma del
 * JWT en local con WebCrypto —el proyecto firma con llaves asimétricas y publica
 * su JWKS— en lugar de preguntar a Supabase Auth por red.
 *
 * POR QUÉ IMPORTA AQUÍ MÁS QUE EN NINGÚN SITIO: esta llamada estaba en el camino
 * crítico de TODAS las páginas del dashboard, y además **en serie**, porque
 * `getActiveOrg` necesita el id del usuario antes de poder preguntar por sus
 * organizaciones, y los datos vienen después de eso. Medido contra el Supabase
 * real: la ida y vuelta a `/auth/v1/user` cuesta ~90 ms, tanto como una consulta
 * de datos entera. Eran tres saltos de red en serie antes de pintar nada; ahora
 * son dos.
 *
 * SOBRE LA SEGURIDAD, sin adornos. `getUser()` pregunta al servidor de Auth y
 * detecta una sesión REVOCADA; la verificación local no, hasta que el token
 * expira. Pero esa diferencia no protege los datos: PostgREST valida el mismo
 * JWT igual de local, así que la RLS serviría esos datos por API con el token
 * revocado de todas formas. La comprobación extra solo cambiaba cuándo se
 * redirige una pantalla, no a qué se puede acceder — y esa misma decisión ya
 * está tomada en el middleware, que es quien de verdad guarda las rutas.
 *
 * `cache()` deduplica dentro de un mismo render: layout y páginas lo piden
 * varias veces.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  // En modo demo no hay backend: createClient lanzaría por falta de credenciales.
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (error || !claims?.sub) return null;
    return {
      id: String(claims.sub),
      email: typeof claims.email === "string" ? claims.email : null,
      user_metadata:
        (claims.user_metadata as Record<string, unknown> | undefined) ?? {},
    };
  } catch (err) {
    // Igual que en el middleware: un fallo de red o de configuración se trata
    // como "sin sesión" y no revienta el render.
    logDataFallback("getCurrentUser", err, "no se pudo verificar el JWT");
    return null;
  }
});

/**
 * Organización activa del usuario. Si el usuario pertenece a varias, respeta su
 * elección (cookie `attesta_org`) **solo si sigue siendo miembro** de esa org
 * (validación de seguridad); si no, la primera de sus memberships (orden estable).
 */
export const getActiveOrg = cache(async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("organization_id", { ascending: true });

  const orgIds = (data ?? []).map((m) => m.organization_id as string);
  if (orgIds.length === 0) return null;
  if (orgIds.length === 1) return orgIds[0];

  // 1) Elección explícita del usuario (cookie), si sigue siendo miembro.
  const preferred = (await cookies()).get(ACTIVE_ORG_COOKIE)?.value;
  if (preferred && orgIds.includes(preferred)) return preferred;

  // 2) Si no eligió, prioriza una org con suscripción activa (la que pagó): así,
  //    tras pagar, se ve el plan correcto aunque pertenezca a varias orgs.
  try {
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("organization_id, status")
      .in("organization_id", orgIds)
      .in("status", ["active", "trialing"]);
    const subOrg = (subs ?? [])[0]?.organization_id as string | undefined;
    if (subOrg && orgIds.includes(subOrg)) return subOrg;
  } catch (err) {
    // Tabla ausente (0017 sin aplicar) u otro fallo → seguimos con la primera.
    logDataFallback("getActiveOrg", err, "no se pudo priorizar la org con suscripción");
  }

  // 3) Por defecto, la primera (orden estable).
  return orgIds[0];
});

/**
 * Rol del usuario actual en su organización activa (`owner` | `admin` | `member`),
 * o null si no hay sesión/org. Es la fuente única para las guardas de rol del
 * lado servidor: hasta ahora cada acción repetía este mismo SELECT a `memberships`
 * (equipo, vigilancia, facturación…), y una guarda olvidada no se veía en ningún
 * sitio. Igual que las demás, es la PRIMERA cerradura: la RLS y las funciones
 * `security definer` siguen aplicando la suya. `cache()` deduplica en un render.
 */
export const getActiveRole = cache(async (): Promise<MemberRole | null> => {
  const user = await getCurrentUser();
  const org = await getActiveOrg();
  if (!user || !org) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", org)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data?.role ?? null) as MemberRole | null;
});
