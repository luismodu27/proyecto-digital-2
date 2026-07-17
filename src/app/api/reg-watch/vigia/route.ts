import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getIsPlatformAdmin } from "@/lib/data";
import { runVigia } from "@/lib/reg-watch/run";

// node:crypto (hash) → runtime Node, no Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Entrada del Vigía. Dos modos de autorización:
 *  - CRON (post-deploy): cabecera `authorization: Bearer <CRON_SECRET>` +
 *    service_role. El cron de Vercel golpea este endpoint en un horario.
 *  - MANUAL: sesión de un platform_admin (verificable ya, sin service_role).
 *
 * Nada se publica en el radar de los clientes: el Vigía solo encola candidatos
 * para el Validador humano.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "modo demo: el Vigía está inactivo" },
      { status: 400 },
    );
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
    // Modo manual: exige sesión de validador de plataforma.
    const isAdmin = await getIsPlatformAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "no autorizado" }, { status: 403 });
    }
    client = await createClient();
  }

  try {
    const summary = await runVigia(client);
    return NextResponse.json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
