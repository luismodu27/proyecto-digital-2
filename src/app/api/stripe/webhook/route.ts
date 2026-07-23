import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { STRIPE_WEBHOOK_SECRET, isStripeConfigured } from "@/lib/stripe/config";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lee el fin de período tanto del modelo antiguo (subscription) como del nuevo (item). */
function periodEndISO(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
  const subLevel = sub as unknown as { current_period_end?: number };
  const secs = item?.current_period_end ?? subLevel.current_period_end;
  return typeof secs === "number" ? new Date(secs * 1000).toISOString() : null;
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

  const upsert = async (sub: Stripe.Subscription, orgHint?: string) => {
    const orgId = (sub.metadata?.organization_id as string) || orgHint;
    if (!orgId) return;
    await db.from("subscriptions").upsert({
      organization_id: orgId,
      stripe_customer_id:
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripe_subscription_id: sub.id,
      status: sub.status,
      price_id: sub.items?.data?.[0]?.price?.id ?? null,
      current_period_end: periodEndISO(sub),
      cancel_at_period_end: sub.cancel_at_period_end,
    });
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
          await upsert(sub, orgId);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await upsert(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch {
    // No reintentar en bucle por un fallo nuestro: acusamos recibo.
    return NextResponse.json({ received: true, handled: false });
  }

  return NextResponse.json({ received: true });
}
