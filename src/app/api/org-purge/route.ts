import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getIsPlatformAdmin } from "@/lib/data";
import { logIncident } from "@/lib/observability/log";
import { GRACE_DAYS } from "@/lib/org-lifecycle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Purga de las organizaciones que solicitaron la baja y agotaron el periodo de
 * gracia. Es lo que convierte el plazo prometido en el DPA y en el aviso de
 * privacidad en algo que ocurre de verdad.
 *
 * POR QUÉ ES UN CRON Y NO UNA ACCIÓN DEL USUARIO. Si el propietario pudiera
 * purgar en el acto, el periodo de gracia no existiría, y su razón de ser es que
 * una sola sesión comprometida no pueda destruir el expediente entero sin vuelta
 * atrás. Por eso `purge_organization` está revocada para `authenticated` y solo
 * la puede llamar `service_role`, que es esta ruta.
 *
 * SE EJECUTA A DIARIO, no semanalmente como los demás crones: el resto avisan de
 * cosas y un retraso de días es tolerable; este cumple un plazo que hemos
 * firmado. Con gracia de 7 días y barrido diario, la purga ocurre entre el día 7
 * y el 8 — holgadamente dentro de los 30 días del DPA aunque falle algún día.
 *
 * NO ENVÍA CORREO al terminar, a diferencia del cron de auditoría. Escribir "tus
 * datos han sido eliminados" a una dirección que acaba de ser eliminada es, en el
 * mejor caso, inútil. El aviso útil ya se dio al solicitar la baja.
 */
async function handle(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "modo demo: purga inactiva" }, { status: 400 });
  }

  // Autorización: cron (bearer) o platform_admin con sesión (para probar).
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

  const { data, error } = await svc.rpc("purge_due_organizations");
  if (error) {
    // Sin la 0035 la RPC no existe. Se informa en vez de fallar en silencio:
    // este cron incumple un plazo contractual si no corre, así que su fallo NO
    // puede ser invisible como el de un fallback de lectura.
    logIncident("orgPurgeCron", error);
    return NextResponse.json(
      { error: "no se pudo purgar", detail: error.message },
      { status: 500 },
    );
  }

  // De paso, poda el registro de eventos de Stripe. Va aquí y no en su propio
  // cron porque es la misma clase de tarea —barrer lo caducado— y un cron más
  // es un sitio más donde mirar cuando algo no corre. Su fallo no debe tumbar la
  // purga, que es lo que cumple un plazo contractual: se registra y se sigue.
  const { data: pruned, error: pruneError } = await svc.rpc("prune_stripe_events");
  if (pruneError) logIncident("orgPurgeCron.prune", pruneError);

  return NextResponse.json({
    purgedAt: new Date().toISOString(),
    purged: typeof data === "number" ? data : 0,
    prunedStripeEvents: typeof pruned === "number" ? pruned : null,
    graceDays: GRACE_DAYS,
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
