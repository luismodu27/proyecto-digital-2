import type { OrgReminders } from "./collect";

const RESEND_FROM = process.env.RESEND_FROM ?? "Attesta <onboarding@resend.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://attesta-io.vercel.app";

/** ¿Está el envío de correo configurado? (Resend). */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function countdown(days: number | null): string {
  if (days === null) return "";
  if (days < 0) return `venció hace ${Math.abs(days)} día${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "vence hoy";
  return `vence en ${days} día${days === 1 ? "" : "s"}`;
}

/** Renderiza el digest semanal de una organización (HTML + texto plano). */
export function renderDigest(
  orgName: string,
  r: OrgReminders,
): { subject: string; html: string; text: string } {
  const urgent =
    r.bias.filter((b) => b.status === "vencida").length +
    r.deadlines.filter((d) => d.days <= 7).length;
  const subject = urgent
    ? `Attesta · ${urgent} asunto${urgent === 1 ? "" : "s"} urgente${urgent === 1 ? "" : "s"} de gobernanza — ${orgName}`
    : `Attesta · Tu resumen de gobernanza — ${orgName}`;

  const biasRows = r.bias
    .map((b) => {
      const color = b.status === "vencida" ? "#a53328" : "#b7701b";
      const label = b.status === "vencida" ? "Auditoría vencida" : "Próxima a vencer";
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${esc(b.system)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:${color};font-weight:600">${label} · ${countdown(b.days)}</td>
      </tr>`;
    })
    .join("");

  const dlRows = r.deadlines
    .map(
      (d) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">
          <div>${esc(d.title)}</div>
          <div style="color:#6f7970;font-size:13px">${esc(d.framework)} · afecta a ${d.affected} sistema${d.affected === 1 ? "" : "s"}</div>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:#084d38;font-weight:600;white-space:nowrap">${countdown(d.days)}</td>
      </tr>`,
    )
    .join("");

  const section = (title: string, rows: string) =>
    rows
      ? `<h3 style="font-size:15px;margin:24px 0 4px;color:#14201a">${title}</h3>
         <table style="width:100%;border-collapse:collapse;font-size:14px;color:#14201a">${rows}</table>`
      : "";

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#14201a;line-height:1.55;max-width:560px;margin:0 auto">
    <div style="font-size:20px;font-weight:700;color:#0b6b4e">Attesta</div>
    <h2 style="margin:16px 0 4px;font-size:20px">Tu resumen de gobernanza</h2>
    <p style="margin:0;color:#3c4a42">Esto es lo que necesita tu atención en <strong>${esc(orgName)}</strong>.</p>
    ${section("Auditorías de sesgo (NYC LL144)", biasRows)}
    ${section("Próximos plazos regulatorios", dlRows)}
    <div style="margin:28px 0 0">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#0b6b4e;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600;font-size:14px">Abrir el panel</a>
    </div>
    <p style="margin:28px 0 0;color:#6f7970;font-size:12px">
      Orientativo, no asesoría legal. Las cuentas atrás son estimaciones basadas en tus datos.
      Recibes este correo porque eres responsable de una organización en Attesta.
    </p>
  </div>`;

  const lines: string[] = [`Attesta — Tu resumen de gobernanza (${orgName})`, ""];
  if (r.bias.length) {
    lines.push("Auditorías de sesgo:");
    for (const b of r.bias) {
      lines.push(`- ${b.system}: ${b.status === "vencida" ? "vencida" : "por vencer"} (${countdown(b.days)})`);
    }
    lines.push("");
  }
  if (r.deadlines.length) {
    lines.push("Próximos plazos regulatorios:");
    for (const d of r.deadlines) {
      lines.push(`- ${d.title} (${d.framework}) — ${countdown(d.days)}, afecta a ${d.affected} sistema(s)`);
    }
    lines.push("");
  }
  lines.push(`${APP_URL}/dashboard`);

  return { subject, html, text: lines.join("\n") };
}

/** Envía un correo vía Resend. Env-gated: devuelve false si no está configurado o falla. */
export async function sendEmail(
  to: string[],
  subject: string,
  html: string,
  text: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || to.length === 0) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: RESEND_FROM, to, subject, html, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
