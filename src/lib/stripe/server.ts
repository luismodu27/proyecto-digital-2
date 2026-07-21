// Módulo server-only: solo se importa desde Server Actions / route handlers.
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "./config";

let cached: Stripe | null = null;

/** Instancia de Stripe (servidor). Lanza si no está configurado. */
export function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe no está configurado (falta STRIPE_SECRET_KEY).");
  }
  if (!cached) {
    cached = new Stripe(STRIPE_SECRET_KEY, {
      // Fijada explícitamente para que una actualización del SDK no cambie en
      // silencio la versión de la API de Stripe (coincide con la del SDK v22).
      apiVersion: "2026-06-24.dahlia",
      appInfo: { name: "Attesta" },
    });
  }
  return cached;
}
