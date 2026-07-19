import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getIsPlatformAdmin } from "@/lib/data";
import { REGULATORY_EVENTS } from "@/lib/regulatory-watch";
import { collectReminders, type SystemWithBias } from "@/lib/reminders/collect";
import { renderDigest, sendEmail, isEmailConfigured } from "@/lib/reminders/email";
import type { RiskLevel } from "@/lib/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recordatorios de gobernanza (digest por organización). Lo dispara el cron de
 * Vercel (Authorization: Bearer CRON_SECRET) o un platform_admin para probar.
 *
 * Determinista y env-gated: si no hay Resend configurado, calcula igual y
 * reporta qué habría enviado (útil para probar antes de conectar el correo).
 */
async function handle(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "modo demo: recordatorios inactivos" }, { status: 400 });
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

  const now = new Date();
  const { data: orgs, error: orgErr } = await svc
    .from("organizations")
    .select("id, name");
  if (orgErr) {
    return NextResponse.json({ error: "no se pudieron leer las organizaciones" }, { status: 500 });
  }

  let orgsWithItems = 0;
  let emailsSent = 0;
  let recipients = 0;

  for (const org of orgs ?? []) {
    const { data: rows } = await svc
      .from("ai_systems")
      .select(
        "id, code, name, owner, domain, vendor, risk_level, compliance_pct, last_reviewed_at, is_aedt, last_bias_audit_date, independent_auditor_name, auditor_independence_confirmed, bias_audit_summary_url, summary_published_date",
      )
      .eq("organization_id", org.id);

    const systems: SystemWithBias[] = (rows ?? []).map((row) => ({
      id: row.code ?? row.id,
      dbId: row.id,
      name: row.name,
      owner: row.owner ?? "",
      domain: row.domain ?? "",
      vendor: row.vendor ?? "",
      risk: (row.risk_level ?? "minimal") as RiskLevel,
      compliance: row.compliance_pct ?? 0,
      lastReviewed: row.last_reviewed_at ? String(row.last_reviewed_at).slice(0, 10) : "",
      bias: {
        isAedt: !!row.is_aedt,
        lastAuditDate: row.last_bias_audit_date
          ? String(row.last_bias_audit_date).slice(0, 10)
          : null,
        auditorName: row.independent_auditor_name ?? null,
        auditorIndependenceConfirmed: !!row.auditor_independence_confirmed,
        summaryUrl: row.bias_audit_summary_url ?? null,
        summaryPublishedDate: row.summary_published_date
          ? String(row.summary_published_date).slice(0, 10)
          : null,
      },
    }));

    const reminders = collectReminders(systems, REGULATORY_EVENTS, now);
    if (!reminders.hasItems) continue;
    orgsWithItems++;

    // Destinatarios: owners/admins de la organización.
    const { data: mems } = await svc
      .from("memberships")
      .select("user_id, role")
      .eq("organization_id", org.id)
      .in("role", ["owner", "admin"]);

    const emails: string[] = [];
    for (const m of mems ?? []) {
      const { data } = await svc.auth.admin.getUserById(m.user_id);
      const email = data?.user?.email;
      if (email && !emails.includes(email)) emails.push(email);
    }
    recipients += emails.length;

    if (isEmailConfigured() && emails.length > 0) {
      const { subject, html, text } = renderDigest(org.name ?? "tu organización", reminders);
      const ok = await sendEmail(emails, subject, html, text);
      if (ok) emailsSent++;
    }
  }

  return NextResponse.json({
    ok: true,
    emailConfigured: isEmailConfigured(),
    orgsProcessed: (orgs ?? []).length,
    orgsWithItems,
    recipients,
    emailsSent,
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
