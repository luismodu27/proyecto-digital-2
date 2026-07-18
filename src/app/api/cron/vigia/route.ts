import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runVigia } from "@/lib/vigia/run";

// Handler de servidor bajo demanda (nunca estático).
export const dynamic = "force-dynamic";

/**
 * Endpoint del cron del Vigía. Pensado para un scheduler (Vercel Cron, GitHub
 * Action…) que lo llame periódicamente tras el deploy.
 *
 * Seguridad: exige `Authorization: Bearer <CRON_SECRET>` (o `?key=`). Corre con
 * `service_role`, por eso el secreto es obligatorio. Sin `CRON_SECRET` o sin
 * llave de servicio → 503 (no configurado), no se ejecuta nada.
 */
async function handle(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "cron no configurado (falta CRON_SECRET)" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  const url = new URL(request.url);
  const provided = auth.startsWith("Bearer ")
    ? auth.slice(7)
    : (url.searchParams.get("key") ?? "");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "no autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "falta SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 },
    );
  }

  const report = await runVigia(admin, new Date().toISOString());
  return NextResponse.json({ ok: true, ...report });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
