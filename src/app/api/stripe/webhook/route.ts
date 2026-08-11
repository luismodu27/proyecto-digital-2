import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { STRIPE_WEBHOOK_SECRET, isStripeConfigured } from "@/lib/stripe/config";
import { createServiceClient } from "@/lib/supabase/service";
import { trackService } from "@/lib/telemetry/service";
import { logIncident } from "@/lib/observability/log";
import { sendEmail } from "@/lib/reminders/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook de Stripe.
 *
 * LOS TRES FALLOS QUE ESTA VERSIÓN CORRIGE. Los tres pertenecen a la misma
 * familia: cosas que no fallan en las pruebas, fallan en producción, y no dejan
 * ni una traza que mirar.
 *
 * 1. **Stripe REINTENTA.** Ante un timeout, un 5xx o por su cuenta. El `upsert`
 *    de la suscripción aguantaba el reintento de casualidad, pero
 *    `checkout_completed` no: cada reintento contaba un pago más. El embudo se
 *    falseaba solo, y hacia arriba — la dirección en la que nadie sospecha. Ahora
 *    cada evento se RECLAMA por su id antes de procesarlo (`stripe_events`), y un
 *    duplicado se responde con un 200 sin tocar nada.
 *
 * 2. **Stripe NO garantiza el orden.** Un `subscription.updated` viejo que llega
 *    tarde pisaba el estado bueno: una suscripción activa podía quedar marcada
 *    `past_due` porque el evento de hace dos minutos llegó el último. Ahora manda
 *    `event.created` —cuándo OCURRIÓ, no cuándo llegó— y la comparación está
 *    dentro del `on conflict` de la RPC, en una sola sentencia, porque dos
 *    entregas simultáneas es exactamente lo que pasa cuando Stripe reintenta
 *    mientras el original va de camino.
 *
 * 3. **Un fallo nuestro se tragaba el evento.** El `catch` respondía 200, y un
 *    200 significa "recibido, no lo reintentes". Si la base de datos parpadeaba
 *    justo entonces, el pago no se registraba NUNCA: el cliente pagaba y se
 *    quedaba en el plan gratuito, sin que saltara ninguna alarma. Ahora un fallo
 *    propio SUELTA la reclamación y devuelve 500, para que Stripe reintente —que
 *    es justo para lo que Stripe reintenta.
 *
 * Y lo que faltaba: `invoice.payment_failed`. Stripe ya avisa al cliente por su
 * cuenta; lo que no había era que nos enterásemos NOSOTROS. Un impago silencioso
 * es MRR que se va sin que nadie llame a nadie.
 */

/** Lee el fin de período tanto del modelo antiguo (subscription) como del nuevo (item). */
function periodEndISO(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
  const subLevel = sub as unknown as { current_period_end?: number };
  const secs = item?.current_period_end ?? subLevel.current_period_end;
  return typeof secs === "number" ? new Date(secs * 1000).toISOString() : null;
}

type Db = NonNullable<ReturnType<typeof createServiceClient>>;

/**
 * Reclama el evento. Devuelve:
 *  · `"new"`       — nuestro, hay que procesarlo;
 *  · `"duplicate"` — ya procesado, no tocar nada;
 *  · `"unknown"`   — no se pudo comprobar (0036 sin aplicar). Se procesa igual:
 *    entre "no medir por si acaso" y "arriesgarse a un duplicado", lo segundo es
 *    menos malo, y queda registrado en el log para que no sea invisible.
 */
async function claimEvent(
  db: Db,
  event: Stripe.Event,
): Promise<"new" | "duplicate" | "unknown"> {
  const { data, error } = await db
    .from("stripe_events")
    .upsert(
      {
        id: event.id,
        type: event.type,
        event_at: new Date(event.created * 1000).toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: true },
    )
    .select("id");

  if (error) {
    logIncident("stripeWebhook.claim", error, "sin 0036 no hay idempotencia");
    return "unknown";
  }
  // `ignoreDuplicates` devuelve 0 filas cuando ya existía: ese es el duplicado.
  return (data?.length ?? 0) > 0 ? "new" : "duplicate";
}

/** Suelta la reclamación para que el reintento de Stripe pueda reprocesar. */
async function releaseEvent(db: Db, eventId: string): Promise<void> {
  const { error } = await db.from("stripe_events").delete().eq("id", eventId);
  if (error) logIncident("stripeWebhook.release", error);
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "stripe no configurado" }, { status: 503 });
  }

  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "firma inválida" }, { status: 400 });
  }

  const db = createServiceClient();
  if (!db) {
    return NextResponse.json({ error: "sin service role" }, { status: 503 });
  }

  const claim = await claimEvent(db, event);
  if (claim === "duplicate") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const eventAt = new Date(event.created * 1000).toISOString();

  /** Aplica el estado respetando el orden. Lanza si la RPC falla de verdad. */
  const apply = async (sub: Stripe.Subscription, orgHint?: string) => {
    const orgId = (sub.metadata?.organization_id as string) || orgHint;
    if (!orgId) return;
    const { error } = await db.rpc("apply_subscription_event", {
      p_org: orgId,
      p_customer: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      p_subscription: sub.id,
      p_status: sub.status,
      p_price: sub.items?.data?.[0]?.price?.id ?? null,
      p_period_end: periodEndISO(sub),
      p_cancel_at_period_end: sub.cancel_at_period_end,
      p_event_at: eventAt,
    });
    if (error) throw error;
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId =
          (session.metadata?.organization_id as string) ||
          session.client_reference_id ||
          undefined;
        if (session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await apply(sub, orgId);
        }
        // Cierre del embudo: pago confirmado por Stripe, no "el usuario pulsó
        // pagar". Se mide aquí porque es el único punto donde el hecho consta —
        // y ahora, gracias a la reclamación de arriba, una sola vez.
        await trackService("checkout_completed", { organizationId: orgId });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await apply(event.data.object as Stripe.Subscription);
        break;
      }

      /**
       * Impago. Stripe ya reintenta y ya avisa al cliente; lo que faltaba era
       * enterarnos nosotros. Un impago que nadie mira es una baja con retraso.
       * No se toca el estado de la suscripción aquí: de eso ya llega su propio
       * `subscription.updated` con el `past_due`, y duplicar la escritura sería
       * dos fuentes de verdad para el mismo dato.
       */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customer =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        const to = process.env.FOUNDER_NOTIFY_EMAIL;
        if (to) {
          const amount = ((invoice.amount_due ?? 0) / 100).toFixed(2);
          await sendEmail(
            [to],
            "⚠️ Pago fallido en Stripe",
            `<div style="font-family:system-ui,sans-serif;color:#1a2b20;line-height:1.5">
               <h2 style="margin:0 0 8px">Un cobro no ha pasado</h2>
               <p style="margin:0 0 12px">Cliente <code>${customer ?? "desconocido"}</code> · ${amount} ${(invoice.currency ?? "eur").toUpperCase()}.</p>
               <p style="margin:0;color:#5b6b60;font-size:13px">Stripe reintentará por su cuenta. Si acaba en impago definitivo, la suscripción pasará a <code>past_due</code> y luego a cancelada.</p>
             </div>`,
            `Pago fallido. Cliente ${customer ?? "desconocido"} · ${amount} ${(invoice.currency ?? "eur").toUpperCase()}.`,
          );
        }
        // Churn por impago, medible en el embudo: antes solo se enteraba el
        // fundador por correo. La org se resuelve desde el customer de Stripe; la
        // reclamación por id (arriba) garantiza que un reintento del webhook no lo
        // cuente dos veces. `trackService` nunca lanza, así que no arriesga el 200.
        let failedOrgId: string | null = null;
        if (customer) {
          const { data } = await db
            .from("subscriptions")
            .select("organization_id")
            .eq("stripe_customer_id", customer)
            .maybeSingle();
          failedOrgId = (data?.organization_id as string | undefined) ?? null;
        }
        await trackService("subscription_payment_failed", {
          organizationId: failedOrgId,
          props: { attempt: invoice.attempt_count },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // NO devolver 200 aquí. Un 200 le dice a Stripe que no reintente, y este
    // `catch` cubre fallos NUESTROS (base de datos, red), que son justo los que
    // el reintento arregla. Se suelta la reclamación para que el reintento pueda
    // reprocesar, y se responde 500.
    logIncident("stripeWebhook", err, event.type);
    if (claim === "new") await releaseEvent(db, event.id);
    return NextResponse.json({ received: false }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
