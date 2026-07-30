"use server";

import { getActiveOrg } from "@/lib/data/context";
import { trackServer } from "./server";

/**
 * Hitos que el cliente AVISA y el servidor VERIFICA.
 *
 * Existen porque algunos pasos del embudo los ejecuta el navegador contra
 * Supabase directamente (el onboarding llama a la RPC `create_org_and_owner`), no
 * una Server Action nuestra: no hay punto de servidor donde enterarse.
 *
 * La regla es que el aviso del cliente **no se cree**: antes de contar el evento
 * se comprueba el hecho contra la base de datos. Así un `fetch` malicioso a esta
 * acción no puede inflar la métrica de altas.
 */

/**
 * El onboarding terminó. Solo se registra si el usuario TIENE de verdad una
 * organización activa, así que el evento no se puede falsear desde el navegador.
 */
export async function reportOrgCreated(): Promise<void> {
  const org = await getActiveOrg();
  if (!org) return;
  await trackServer("org_created", { organizationId: org });
}
