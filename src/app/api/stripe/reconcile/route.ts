import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { isStripeConfigured } from "@/lib/stripe/config";
import { createServiceClient } from "@/lib/supabase/service";
import { getIsPlatformAdmin } from "@/lib/data";
import { logIncident } from "@/lib/observability/log";
import { sendEmail } from "@/lib/reminders/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Reconciliación Stripe → base de datos.
 *
 * POR QUÉ HACE FALTA AUNQUE EL WEBHOOK SEA CORRECTO. Porque el webhook puede no
 * llegar: Stripe reintenta unas 72 horas y se rinde. Un despliegue largo, una
 * caída, un secreto de firma rotado y no actualizado, o simplemente un endpoint
 * mal configurado en el panel, y hay eventos que no entran nunca. El síntoma es
 * el peor posible: **un cliente que paga y sigue en el plan gratuito**, sin error
 * en ningún sitio, porque desde dentro todo parece correcto. Nadie abre una
 * incidencia por algo que no da error; la abre el cliente, semanas después, y ya
 * con la confianza rota.
 *
 * Esto recorre lo que Stripe dice que existe y lo compara con lo que tenemos.
 * Stripe es la fuente de verdad del cobro: si discrepan, gana Stripe.
 *
 * NO BORRA NADA y no toca suscripciones que la base de datos tenga y Stripe no:
 * eso podría ser una fila legítima de un entorno distinto o de una prueba, y una
 * reconciliación que borra por su cuenta es peor que la deriva que arregla. Lo
 * que no cuadra se reporta; lo que falta o está desactualizado se repara.
 */
async function handle(request: Request) {
  if (!isStripeConfigured) {
    return NextResponse.json({ error: "stripe no configurado" }, { status: 503 });
  }

  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  const isCron = Boolean(cronSecret) && auth === `Bearer ${cronSecret}`;
  if (!isCron) {
    const isAdmin = await getIsPlatformAdmin().catch(() => false);
    if (!isAdmin) {
      return NextResponse.json({ error: "no autorizado" }, { status: 403 });
    }
  }

  const db = createServiceClient();
  if (!db) {
    return NextResponse.json({ error: "sin service role" }, { status: 503 });
  }

  const stripe = getStripe();
  const repaired: string[] = [];
  const orphans: string[] = [];
  let checked = 0;

  try {
    // `autoPagingEach` recorre todas las páginas. Se acota a 1000 para que un
    // fallo no se convierta en una factura de API: si algún día hay más
    // suscripciones que eso, este cron necesita paginación con estado, y es mejor
    // enterarse por el aviso de abajo que por el importe.
    const LIMIT = 1000;
    const subs: Stripe.Subscription[] = [];
    for await (const sub of stripe.subscriptions.list({ limit: 100 })) {
      subs.push(sub);
      if (subs.length >= LIMIT) break;
    }

    for (const sub of subs) {
      checked++;
      const orgId = sub.metadata?.organization_id as string | undefined;
      if (!orgId) {
        // Sin `organization_id` no se puede saber de quién es. Es un fallo de
        // configuración del checkout, no una deriva: se reporta.
        orphans.push(sub.id);
        continue;
      }

      const { data: row } = await db
        .from("subscriptions")
        .select("status, stripe_subscription_id, current_period_end")
        .eq("organization_id", orgId)
        .maybeSingle();

      const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
      const subLevel = sub as unknown as { current_period_end?: number };
      const secs = item?.current_period_end ?? subLevel.current_period_end;
      const periodEnd =
        typeof secs === "number" ? new Date(secs * 1000).toISOString() : null;

      const drifted =
        !row ||
        row.status !== sub.status ||
        row.stripe_subscription_id !== sub.id;

      if (!drifted) continue;

      // Se repara con `last_event_at = now()`: la reconciliación es, por
      // definición, la información más reciente que tenemos. Poner la fecha del
      // evento original haría que un webhook rezagado la pisara después.
      const { error } = await db.rpc("apply_subscription_event", {
        p_org: orgId,
        p_customer:
          typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        p_subscription: sub.id,
        p_status: sub.status,
        p_price: sub.items?.data?.[0]?.price?.id ?? null,
        p_period_end: periodEnd,
        p_cancel_at_period_end: sub.cancel_at_period_end,
        p_event_at: new Date().toISOString(),
      });
      if (error) throw error;
      repaired.push(orgId);
    }
  } catch (err) {
    logIncident("stripeReconcile", err);
    return NextResponse.json(
      { error: "no se pudo reconciliar", checked, repaired: repaired.length },
      { status: 500 },
    );
  }

  // Solo se avisa si HAY algo. Un correo semanal diciendo "todo bien" se acaba
  // filtrando a una carpeta, y con él el que sí importaba.
  const to = process.env.FOUNDER_NOTIFY_EMAIL;
  if (to && (repaired.length > 0 || orphans.length > 0)) {
    const lines = [
      ...repaired.map((o) => `• reparada la organización ${o}`),
      ...orphans.map((s) => `• suscripción ${s} SIN organization_id en sus metadatos`),
    ].join("\n");
    await sendEmail(
      [to],
      `Reconciliación de Stripe: ${repaired.length + orphans.length} incidencia(s)`,
      `<div style="font-family:system-ui,sans-serif;color:#1a2b20;line-height:1.5">
         <h2 style="margin:0 0 8px">La base de datos no coincidía con Stripe</h2>
         <p style="margin:0 0 12px">Revisadas ${checked} suscripciones. Lo reparable ya está reparado; lo huérfano necesita que alguien mire.</p>
         <pre style="background:#f3f5f2;padding:12px;border-radius:8px;white-space:pre-wrap">${lines.replace(/</g, "&lt;")}</pre>
       </div>`,
      `Reconciliación de Stripe. Revisadas ${checked}.\n${lines}`,
    );
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    checked,
    repaired: repaired.length,
    orphans: orphans.length,
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
