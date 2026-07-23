import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getIsPlatformAdmin } from "@/lib/data";
import { ingestCorpus } from "@/lib/analista/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ingesta del corpus a la base de conocimiento vectorial (Fase B.1).
 * Autorización igual que el Vigía/Analista: cron (Bearer + service_role) o
 * sesión de platform_admin. Operación puntual e idempotente.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "modo demo: ingesta inactiva" }, { status: 400 });
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
    const summary = await ingestCorpus(client);
    return NextResponse.json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
