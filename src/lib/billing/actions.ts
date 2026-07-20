"use server";

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { getStripe } from "@/lib/stripe/server";
import { STRIPE_PRICE_ID, isStripeConfigured } from "@/lib/stripe/config";
import {
  getCurrentUser,
  getActiveOrg,
  ACTIVE_ORG_COOKIE,
} from "@/lib/data/context";
import { getOrgSubscription } from "./subscription";

async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/** Inicia el checkout de suscripción y redirige a Stripe. */
export async function startCheckout() {
  if (!isStripeConfigured) throw new Error("Stripe no está configurado.");
  const user = await getCurrentUser();
  const orgId = await getActiveOrg();
  if (!user || !orgId) redirect("/login");

  const stripe = getStripe();
  const url = await baseUrl();
  const existing = await getOrgSubscription(orgId);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    ...(existing?.stripeCustomerId
      ? { customer: existing.stripeCustomerId }
      : { customer_email: user.email ?? undefined }),
    client_reference_id: orgId,
    metadata: { organization_id: orgId },
    subscription_data: { metadata: { organization_id: orgId } },
    allow_promotion_codes: true,
    success_url: `${url}/dashboard/facturacion?estado=ok`,
    cancel_url: `${url}/dashboard/facturacion?estado=cancelado`,
  });

  if (!session.url) throw new Error("No se pudo crear el checkout.");

  // Fija la organización activa a la que se está suscribiendo, para que al volver
  // de Stripe se vea el plan correcto aunque el usuario pertenezca a varias orgs.
  (await cookies()).set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(session.url);
}

/** Abre el portal de facturación de Stripe (gestionar/cancelar). */
export async function openBillingPortal() {
  if (!isStripeConfigured) throw new Error("Stripe no está configurado.");
  const orgId = await getActiveOrg();
  if (!orgId) redirect("/login");

  const sub = await getOrgSubscription(orgId);
  if (!sub?.stripeCustomerId) redirect("/dashboard/facturacion");

  const stripe = getStripe();
  const url = await baseUrl();
  const portal = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${url}/dashboard/facturacion`,
  });
  redirect(portal.url);
}
