"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Correo del fundador que recibe la notificación de solicitudes de acceso. */
const FOUNDER_EMAIL =
  process.env.FOUNDER_NOTIFY_EMAIL ?? "luisscmorenod@gmail.com";
/** Remitente. Sin dominio verificado, Resend permite `onboarding@resend.dev`. */
const RESEND_FROM = process.env.RESEND_FROM ?? "Attesta <onboarding@resend.dev>";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Notifica al fundador por email cuando alguien solicita acceso.
 * Env-gated: si no hay RESEND_API_KEY, no hace nada (la solicitud igual se
 * guarda en `waitlist`). Nunca lanza: un fallo de email no debe romper el alta.
 */
async function notifyFounder(email: string, source: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  try {
    const safe = escapeHtml(email);
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [FOUNDER_EMAIL],
        reply_to: email,
        subject: `Nueva solicitud de acceso — ${email}`,
        html: `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a2b20;line-height:1.5">
            <h2 style="margin:0 0 8px">Nueva solicitud de acceso a Attesta</h2>
            <p style="margin:0 0 4px">Alguien pidió acceso anticipado desde la landing.</p>
            <p style="margin:12px 0"><strong>Correo:</strong>
              <a href="mailto:${safe}">${safe}</a>
            </p>
            <p style="margin:0 0 4px;color:#5b6b60"><strong>Origen:</strong> ${escapeHtml(source)}</p>
            <p style="margin:16px 0 0;color:#5b6b60;font-size:13px">
              Responde a este correo para contactar directamente al solicitante.
            </p>
          </div>
        `,
        text: `Nueva solicitud de acceso a Attesta.\nCorreo: ${email}\nOrigen: ${source}\n\nResponde a este correo para contactar al solicitante.`,
      }),
    });
  } catch {
    // No romper el alta si el correo falla.
  }
}

/**
 * Registra una solicitud de acceso (waitlist) y notifica al fundador.
 * El honeypot lo maneja el cliente (éxito falso sin llamar aquí).
 */
export async function submitWaitlist(
  emailRaw: string,
  source = "landing",
): Promise<{ ok: boolean; error?: string }> {
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Introduce un correo válido (p. ej. tu@empresa.com)." };
  }

  if (isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("waitlist")
        .insert({ email, source });
      // Ignora duplicados (unique violation): ya estaba en lista, es éxito.
      if (error && error.code !== "23505") throw error;
    } catch {
      return {
        ok: false,
        error: "No pudimos registrarte. Inténtalo de nuevo en un momento.",
      };
    }
  }

  await notifyFounder(email, source);
  return { ok: true };
}
