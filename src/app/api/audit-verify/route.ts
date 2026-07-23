import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getIsPlatformAdmin } from "@/lib/data";
import { sendEmail } from "@/lib/reminders/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verificación periódica de la cadena de auditoría (tamper-DETECTING).
 *
 * El `audit_log` ya es tamper-EVIDENT: cada fila encadena un hash SHA-256, así
 * que cualquier alteración con acceso directo a la BD es demostrable llamando a
 * `verify_audit_chain()`. Este cron convierte esa propiedad en detección EN
 * TIEMPO (casi) REAL: recorre todas las organizaciones vía
 * `verify_all_audit_chains()` (0023) y, si alguna cadena está rota, avisa al
 * fundador por email.
 *
 * Lo dispara el cron de Vercel (Authorization: Bearer CRON_SECRET) o un
 * platform_admin con sesión (para probar). Requiere la migración 0023 aplicada.
 */
async function handle(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "modo demo: verificación inactiva" },
      { status: 400 },
    );
  }

  // Autorización: cron (bearer) o platform_admin con sesión.
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  const isCron = Boolean(cronSecret) && auth === `Bearer ${cronSecret}`;
  if (!isCron) {
    const isAdmin = await getIsPlatformAdmin().catch(() => false);
    if (!isAdmin) {
      return NextResponse.json({ error: "no autorizado" }, { status: 403 });
    }
  }

  const svc = createServiceClient();
  if (!svc) {
    return NextResponse.json(
      { error: "falta SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    );
  }

  const { data, error } = await svc.rpc("verify_all_audit_chains");
  if (error) {
    // La migración 0023 puede no estar aplicada todavía: no romper, informar.
    return NextResponse.json(
      { error: "no se pudo verificar", detail: error.message },
      { status: 500 },
    );
  }

  type Row = {
    organization_id: string;
    total: number;
    ok: boolean;
    broken_id: number | null;
  };
  const rows = (data ?? []) as Row[];
  const broken = rows.filter((r) => !r.ok);
  const checkedAt = new Date().toISOString();

  // Alerta: si alguna cadena está rota, avisa al fundador.
  let alerted = false;
  if (broken.length > 0) {
    const to = process.env.FOUNDER_NOTIFY_EMAIL ?? "attesta.io.mx@gmail.com";
    const lines = broken
      .map((r) => `• org ${r.organization_id} — rota en audit_log id ${r.broken_id}`)
      .join("\n");
    alerted = await sendEmail(
      [to],
      `⚠️ Cadena de auditoría rota en ${broken.length} organización(es)`,
      `<div style="font-family:system-ui,sans-serif;color:#1a2b20;line-height:1.5">
         <h2 style="margin:0 0 8px">Integridad del audit log comprometida</h2>
         <p style="margin:0 0 12px">La verificación automática detectó que la cadena de hashes del registro de auditoría no cuadra en ${broken.length} organización(es). Esto indica una posible alteración directa en la base de datos.</p>
         <pre style="background:#f3f5f2;padding:12px;border-radius:8px;white-space:pre-wrap">${lines.replace(/</g, "&lt;")}</pre>
         <p style="margin:12px 0 0;color:#5b6b60;font-size:13px">Verificado el ${checkedAt}.</p>
       </div>`,
      `Cadena de auditoría rota en ${broken.length} org(s).\n${lines}\nVerificado: ${checkedAt}`,
    );
  }

  return NextResponse.json({
    checkedAt,
    checkedOrgs: rows.length,
    brokenOrgs: broken.length,
    alerted,
    broken: broken.map((r) => ({
      organizationId: r.organization_id,
      brokenId: r.broken_id,
    })),
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
