import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getIsPlatformAdmin } from "@/lib/data";
import { runAnalista } from "@/lib/analista/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Entrada del Analista (Fase B). Misma autorización que el Vigía:
 *  - CRON: `authorization: Bearer <CRON_SECRET>` + service_role.
 *  - MANUAL: sesión de un platform_admin.
 *
 * Enriquece las señales del Vigía; nunca publica en el radar (eso es del humano).
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "modo demo: Analista inactivo" }, { status: 400 });
  }

  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  const isCron = Boolean(cronSecret) && auth === `Bearer ${cronSecret}`;

  let client;
  if (isCron) {
    const svc = createServiceClient();
    if (!svc) {
      return NextResponse.json(
        { error: "falta SUPABASE_SERVICE_ROLE_KEY para el modo cron" },
        { status: 500 },
      );
    }
    client = svc;
  } else {
    const isAdmin = await getIsPlatformAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "no autorizado" }, { status: 403 });
    }
    client = await createClient();
  }

  try {
    const summary = await runAnalista(client);
    return NextResponse.json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
