"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import { rateLimit } from "@/lib/security/rate-limit";
import { trackServer } from "@/lib/telemetry/server";
import { logDataFallback, logIncident } from "@/lib/observability/log";

/**
 * Enlace de intake compartible (escrituras).
 *
 * Dos mundos muy distintos en el mismo fichero, por eso conviene tenerlos a la
 * vista juntos:
 *
 *  · **Gestión** (crear/revocar enlaces, aceptar/descartar envíos): exige sesión y
 *    organización; la RLS de 0027 hace el aislamiento por tenant.
 *  · **Envío público** (`submitIntakeForm`): lo ejecuta alguien SIN cuenta. Es la
 *    única escritura anónima del producto, así que va acotada por todos lados:
 *    rate-limit por IP, longitudes máximas, y la RPC `submit_intake` como única
 *    puerta (nunca un insert directo). Y lo que entra NO es un sistema del
 *    inventario: es una propuesta en una bandeja que un humano revisa.
 */

const INVENTORY = "/dashboard/inventario";
const IMPORT = "/dashboard/inventario/importar";

/** Anti-abuso del formulario público: 10 envíos por IP cada 10 minutos. */
const RL_LIMIT = 10;
const RL_WINDOW_MS = 10 * 60 * 1000;

const MAX_FIELD = 200;
const MAX_NAME = 120;
const MAX_NOTES = 1000;

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

function field(form: FormData, key: string, max = MAX_FIELD): string | null {
  const raw = form.get(key);
  if (typeof raw !== "string") return null;
  const v = raw.trim().slice(0, max);
  return v ? v : null;
}

/* -------------------------------------------------------------------------- */
/* Gestión (requiere sesión)                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Emite un enlace nuevo. El token lo genera el SERVIDOR con 24 bytes aleatorios
 * en base64url (32 caracteres): es una capacidad, así que no puede ser adivinable
 * ni derivarse del nombre de la organización.
 */
export async function createIntakeLink(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${IMPORT}?toast=intake-demo`);

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const token = randomBytes(24).toString("base64url");
  const { error } = await supabase.from("intake_links").insert({
    organization_id: org,
    token,
    label: field(formData, "label", 80),
    created_by: user?.id,
  });

  if (error) {
    logIncident("createIntakeLink", error);
    redirect(`${IMPORT}?toast=intake-error`);
  }

  revalidatePath(IMPORT);
  redirect(`${IMPORT}?toast=intake-created`);
}

/** Revoca un enlace: deja de aceptar envíos de inmediato. */
export async function revokeIntakeLink(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${IMPORT}?toast=intake-demo`);
  const id = field(formData, "id", 40);
  if (!id) redirect(IMPORT);

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  // El filtro por organización es defensa en profundidad: la RLS ya lo impide.
  const { error } = await supabase
    .from("intake_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("organization_id", org)
    .eq("id", id);

  if (error) logIncident("revokeIntakeLink", error);
  revalidatePath(IMPORT);
  redirect(`${IMPORT}?toast=intake-revoked`);
}

/**
 * Acepta un envío: lo convierte en un sistema del inventario y lo marca como
 * aceptado. Este paso lo hace una persona autenticada a propósito — así la
 * entrada en el expediente (y en el audit-trail) tiene un responsable con nombre,
 * en lugar de venir de un anónimo.
 */
export async function acceptIntakeSubmission(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${IMPORT}?toast=intake-demo`);
  const id = field(formData, "id", 40);
  if (!id) redirect(IMPORT);

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sub, error: readError } = await supabase
    .from("intake_submissions")
    .select("id, name, owner, domain, vendor, status")
    .eq("organization_id", org)
    .eq("id", id)
    .maybeSingle();

  if (readError || !sub) {
    if (readError) logIncident("acceptIntakeSubmission", readError, "lectura");
    redirect(`${IMPORT}?toast=intake-error`);
  }
  // Ya resuelto por otra persona: no duplicar el sistema.
  if (sub.status !== "pending") redirect(`${IMPORT}?toast=intake-already`);

  const { error: insertError } = await supabase.from("ai_systems").insert({
    organization_id: org,
    name: String(sub.name).slice(0, MAX_NAME),
    owner: sub.owner,
    domain: sub.domain,
    vendor: sub.vendor,
    // Nuestro ICP: quien USA la IA. Si es proveedor, se corrige al editar la ficha.
    actor_role: "deployer",
    created_by: user?.id,
  });

  if (insertError) {
    logIncident("acceptIntakeSubmission", insertError, "insert del sistema");
    redirect(`${IMPORT}?toast=intake-error`);
  }

  await supabase
    .from("intake_submissions")
    .update({
      status: "accepted",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id,
    })
    .eq("organization_id", org)
    .eq("id", id);

  await trackServer("system_created", {
    organizationId: org,
    props: { source: "intake" },
  });

  revalidatePath(IMPORT);
  revalidatePath(INVENTORY);
  revalidatePath("/dashboard");
  redirect(`${IMPORT}?toast=intake-accepted`);
}

/** Descarta un envío (duplicado, ruido, no es un sistema de IA). */
export async function discardIntakeSubmission(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${IMPORT}?toast=intake-demo`);
  const id = field(formData, "id", 40);
  if (!id) redirect(IMPORT);

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("intake_submissions")
    .update({
      status: "discarded",
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id,
    })
    .eq("organization_id", org)
    .eq("id", id);

  if (error) logIncident("discardIntakeSubmission", error);
  revalidatePath(IMPORT);
  redirect(`${IMPORT}?toast=intake-discarded`);
}

/* -------------------------------------------------------------------------- */
/* Envío público (SIN sesión)                                                 */
/* -------------------------------------------------------------------------- */

export type IntakeSubmitResult = {
  ok: boolean;
  /** Clave para traducir el mensaje. `invalid` cubre token malo/caducado/agotado. */
  error?: "demo" | "no-name" | "rate-limit" | "invalid";
};

/**
 * Envía una ficha desde el formulario público. Devuelve un resultado en vez de
 * redirigir para que la página pueda dar las gracias sin recargar.
 *
 * No distingue "token inexistente" de "caducado" ni de "agotado": la RPC responde
 * lo mismo en los tres casos a propósito, para no ser un oráculo de tokens. A
 * quien rellena el formulario le da igual el motivo; a quien sondea, no.
 */
export async function submitIntakeForm(
  token: string,
  formData: FormData,
): Promise<IntakeSubmitResult> {
  if (!isSupabaseConfigured) return { ok: false, error: "demo" };

  const name = field(formData, "name", MAX_NAME);
  if (!name) return { ok: false, error: "no-name" };

  if (!rateLimit(`intake:${await clientIp()}`, RL_LIMIT, RL_WINDOW_MS)) {
    return { ok: false, error: "rate-limit" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_intake", {
      p_token: token,
      p_name: name,
      p_owner: field(formData, "owner"),
      p_domain: field(formData, "domain"),
      p_vendor: field(formData, "vendor"),
      p_notes: field(formData, "notes", MAX_NOTES),
      p_by: field(formData, "submitted_by", 120),
    });

    if (error) {
      // `logDataFallback` y no `logIncident`: si la RPC no existe (0027 sin
      // aplicar) es una degradación esperada y se registra como
      // `migration-pending`; cualquier otro fallo sí sale como incidente. Al
      // usuario se le dice lo mismo en ambos casos — no es su problema.
      logDataFallback("submitIntakeForm", error);
      return { ok: false, error: "invalid" };
    }
    return data === true ? { ok: true } : { ok: false, error: "invalid" };
  } catch (err) {
    logIncident("submitIntakeForm", err);
    return { ok: false, error: "invalid" };
  }
}
