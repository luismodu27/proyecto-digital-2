"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { trackServer } from "@/lib/telemetry/server";
import { logIncident } from "@/lib/observability/log";
import { sendEmail } from "@/lib/reminders/email";
import { MAX_NAME, MAX_NOTE, pickStrict, text } from "@/lib/data/form";
import { coerceLocale } from "@/lib/i18n/config";

/**
 * Solicitud de demo (venta asistida).
 *
 * POR QUÉ EXISTE, SEPARADO DE LA LISTA DE ESPERA. La landing solo tenía "déjame
 * tu correo", que es la señal de quien todavía no ha decidido nada. Un plan cuyo
 * contrato anual ronda las decenas de miles no se cierra solo: alguien tiene que
 * hablar con quien pregunta. Y para decidir a quién llamar primero hacen falta
 * tres datos que un correo suelto no da — de qué organización es, qué papel
 * ocupa y qué tamaño tiene. Sin eso, la bandeja se atiende por orden de llegada.
 *
 * EL CORREO SE ENVÍA AUNQUE LA BASE DE DATOS FALLE, y ese orden es deliberado: un
 * lead cualificado perdido cuesta mucho más que una fila que falta en una tabla.
 * Si la migración no está aplicada o Supabase parpadea, la solicitud llega igual
 * a la bandeja del fundador y queda registrada en el log. Es el único sitio de
 * este repo donde el correo es el sistema de registro y la base de datos el
 * respaldo, y es a conciencia.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;

/** Anti-abuso: 3 solicitudes por IP cada 15 minutos. */
const RL_LIMIT = 3;
const RL_WINDOW_MS = 15 * 60 * 1000;

const TEAM_SIZES = ["1-50", "51-200", "201-1000", "1000+"] as const;

const FOUNDER_EMAIL =
  process.env.FOUNDER_NOTIFY_EMAIL ?? "attesta.io.mx@gmail.com";

export type DemoRequestResult = {
  ok: boolean;
  /** Clave de mensaje, no el mensaje: la traduce el cliente según su idioma. */
  error?: "email" | "rate" | "unknown";
};

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function requestDemo(formData: FormData): Promise<DemoRequestResult> {
  const email = (text(formData.get("email"), MAX_EMAIL_LEN) ?? "").toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "email" };

  const name = text(formData.get("name"), MAX_NAME);
  const company = text(formData.get("company"), MAX_NAME);
  const role = text(formData.get("role"), MAX_NAME);
  const teamSize = pickStrict(formData.get("teamSize"), TEAM_SIZES);
  const context = text(formData.get("context"), MAX_NOTE);
  const source = text(formData.get("source"), 80) ?? "landing";
  const locale = coerceLocale(formData.get("locale"));

  if (!(await checkRateLimit(`demo:${await clientIp()}`, RL_LIMIT, RL_WINDOW_MS))) {
    return { ok: false, error: "rate" };
  }

  // 1. El correo PRIMERO. Ver la cabecera: perder un lead cualificado cuesta más
  //    que perder una fila.
  const rows = [
    ["Correo", email],
    ["Nombre", name],
    ["Organización", company],
    ["Papel", role],
    ["Tamaño", teamSize],
    ["Origen", source],
  ].filter(([, v]) => Boolean(v)) as [string, string][];

  await sendEmail(
    [FOUNDER_EMAIL],
    `Solicitud de demo — ${company || email}`,
    `<div style="font-family:system-ui,sans-serif;color:#1a2b20;line-height:1.5">
       <h2 style="margin:0 0 12px">Nueva solicitud de demo</h2>
       <table style="border-collapse:collapse;font-size:14px">
         ${rows
           .map(
             ([k, v]) =>
               `<tr><td style="padding:4px 12px 4px 0;color:#5b6b60">${k}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`,
           )
           .join("")}
       </table>
       ${context ? `<p style="margin:16px 0 4px;color:#5b6b60">Qué cuenta:</p><p style="margin:0;white-space:pre-wrap">${esc(context)}</p>` : ""}
     </div>`,
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") + (context ? `\n\n${context}` : ""),
  );

  // 2. Y luego la fila. Su fallo no invalida la solicitud: ya está avisada.
  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("demo_requests").insert({
        email,
        name,
        company,
        role,
        team_size: teamSize,
        context,
        source,
        locale,
      });
      if (error) {
        logIncident("requestDemo", error, "la solicitud sí se envió por correo");
      }
    } catch (err) {
      logIncident("requestDemo", err, "la solicitud sí se envió por correo");
    }
  }

  // El tamaño va como metadato porque es lo que distingue una conversación
  // enterprise de una que no lo es. Ni el correo ni el nombre salen de aquí:
  // `sanitizeProps` descarta cualquier valor con `@`, pero además no se intenta.
  await trackServer("demo_requested", { props: { size: teamSize ?? "n/d", source } });

  return { ok: true };
}
