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

  /*
    EL VAULT SE BORRA A MANO, ANTES QUE LA BASE DE DATOS, y esto no es un detalle:
    es la repetición del fallo que ya encontramos una vez. Borrar la organización
    elimina las FILAS de `evidence_files`, pero los ARCHIVOS viven en el
    almacenamiento de Supabase y no los arrastra ninguna cascada — quedarían ahí,
    con el contenido real de la evidencia del cliente, después de haberle dicho
    que sus datos estaban eliminados.

    Y va antes que la purga porque después ya no se sabría qué carpetas mirar.
  */
  const cutoff = new Date(Date.now() - GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: due, error: dueError } = await svc
    .from("organizations")
    .select("id")
    .not("deletion_requested_at", "is", null)
    .lt("deletion_requested_at", cutoff);

  if (dueError) {
    logIncident("orgPurgeCron.due", dueError);
  }

  let archivosBorrados = 0;
  for (const row of (due ?? []) as { id: string }[]) {
    const list = await svc.storage.from("evidence").list(row.id, { limit: 1000 });
    if (list.error) {
      // Sin la 0038 el bucket no existe: no hay archivos que borrar y se sigue.
      logIncident("orgPurgeCron.vaultList", list.error, row.id);
      continue;
    }
    const paths = (list.data ?? []).map((o) => `${row.id}/${o.name}`);
    if (paths.length === 0) continue;
    const rm = await svc.storage.from("evidence").remove(paths);
    if (rm.error) {
      // Si los archivos no se pueden borrar, NO se purga la organización: dejarla
      // purgada dejaría los archivos huérfanos y sin forma de saber de quién eran.
      // Se registra y se reintenta en la siguiente pasada del cron.
      logIncident("orgPurgeCron.vaultRemove", rm.error, row.id);
      return NextResponse.json(
        { error: "no se pudieron borrar los archivos de evidencia", org: row.id },
        { status: 500 },
      );
    }
    archivosBorrados += paths.length;
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
    vaultFilesDeleted: archivosBorrados,
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
