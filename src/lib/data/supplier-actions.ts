"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { logIncident } from "@/lib/observability/log";
import { EVIDENCE_KINDS, EVIDENCE_STATUSES } from "@/lib/suppliers/evidence";
import {
  bool as on,
  date,
  MAX_NAME,
  MAX_NOTE,
  MAX_REF,
  pick,
  text,
  url,
  uuid,
} from "./form";
import { getActiveOrg } from "./context";

const SUPPLIERS = "/dashboard/proveedores";

const AI_ACT_ROLES = [
  "provider",
  "importer",
  "distributor",
  "model_provider",
  "third_party",
  "unknown",
] as const;
const GDPR_ROLES = ["controller", "processor", "joint", "none", "unknown"] as const;

/** El catálogo de tipos es el de código: la BD no lo repite (ver 0032). */
const KIND_SET = new Set(EVIDENCE_KINDS.map((k) => k.key));
/** Tipos cuya fecha de expiración tiene sentido. Ver la nota de `evidence.ts`. */
const EXPIRING = new Set(EVIDENCE_KINDS.filter((k) => k.expires).map((k) => k.key));

function revalidate() {
  revalidatePath(SUPPLIERS);
  revalidatePath("/dashboard/actividad");
}

async function ctx() {
  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, org, user };
}


/** Da de alta un proveedor o tercero. */
export async function createSupplier(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${SUPPLIERS}?toast=supplier-demo`);
  const { supabase, org, user } = await ctx();

  const name = text(formData.get("name"), MAX_NAME);
  if (!name) redirect(SUPPLIERS);

  const { error } = await supabase.from("suppliers").insert({
    organization_id: org,
    name,
    country: text(formData.get("country")),
    ai_act_role: pick(formData.get("aiActRole"), AI_ACT_ROLES, "unknown"),
    outside_eu: on(formData.get("outsideEu")),
    authorized_rep: text(formData.get("authorizedRep")),
    authorized_rep_checked_on: date(formData.get("authorizedRepCheckedOn")),
    gdpr_role: pick(formData.get("gdprRole"), GDPR_ROLES, "unknown"),
    contact: text(formData.get("contact")),
    contract_ends_on: date(formData.get("contractEndsOn")),
    dpa_signed: on(formData.get("dpaSigned")),
    excludes_high_risk_use: on(formData.get("excludesHighRiskUse")),
    note: text(formData.get("note"), MAX_NOTE),
    created_by: user.id,
  });

  if (error) {
    logIncident("createSupplier", error);
    redirect(`${SUPPLIERS}?toast=supplier-error`);
  }
  revalidate();
  redirect(`${SUPPLIERS}?toast=supplier-created`);
}

/** Actualiza la ficha de un proveedor. */
export async function updateSupplier(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${SUPPLIERS}?toast=supplier-demo`);
  const { supabase, org } = await ctx();
  const id = uuid(formData.get("id"));
  if (!id) redirect(SUPPLIERS);

  const { error } = await supabase
    .from("suppliers")
    .update({
      country: text(formData.get("country")),
      ai_act_role: pick(formData.get("aiActRole"), AI_ACT_ROLES, "unknown"),
      outside_eu: on(formData.get("outsideEu")),
      authorized_rep: text(formData.get("authorizedRep")),
      authorized_rep_checked_on: date(formData.get("authorizedRepCheckedOn")),
      gdpr_role: pick(formData.get("gdprRole"), GDPR_ROLES, "unknown"),
      contact: text(formData.get("contact")),
      contract_ends_on: date(formData.get("contractEndsOn")),
      dpa_signed: on(formData.get("dpaSigned")),
      excludes_high_risk_use: on(formData.get("excludesHighRiskUse")),
      note: text(formData.get("note"), MAX_NOTE),
    })
    .eq("organization_id", org)
    .eq("id", id);

  if (error) {
    logIncident("updateSupplier", error);
    redirect(`${SUPPLIERS}?toast=supplier-error`);
  }
  revalidate();
  redirect(`${SUPPLIERS}?toast=supplier-updated`);
}

/** Elimina un proveedor. Su evidencia se borra en cascada (migración 0032). */
export async function deleteSupplier(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${SUPPLIERS}?toast=supplier-demo`);
  const { supabase, org } = await ctx();
  const id = uuid(formData.get("id"));
  if (!id) redirect(SUPPLIERS);

  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("organization_id", org)
    .eq("id", id);

  if (error) {
    logIncident("deleteSupplier", error);
    redirect(`${SUPPLIERS}?toast=supplier-error`);
  }
  revalidate();
  redirect(`${SUPPLIERS}?toast=supplier-deleted`);
}

/**
 * Crea o actualiza un elemento de evidencia.
 *
 * `expires_on` se **descarta** salvo en los tipos que caducan de verdad. Es una
 * defensa contra el error más caro de esta pantalla: guardar una caducidad al
 * marcado CE o a la declaración de conformidad —que no caducan— llenaría la
 * lista de vencimientos de avisos falsos, y una lista con ruido se deja de
 * mirar. La misma regla vive en `expiringEvidence()`, así que hacen falta dos
 * errores para que un aviso falso llegue a pantalla.
 */
export async function saveSupplierEvidence(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${SUPPLIERS}?toast=supplier-demo`);
  const { supabase, org, user } = await ctx();

  const supplierId = uuid(formData.get("supplierId"));
  const kind = String(formData.get("kind") ?? "");
  if (!supplierId || !KIND_SET.has(kind)) redirect(SUPPLIERS);

  const status = pick(formData.get("status"), [...EVIDENCE_STATUSES], "notRequested");
  const payload = {
    status,
    requested_on: date(formData.get("requestedOn")),
    received_on: date(formData.get("receivedOn")),
    document_version: text(formData.get("documentVersion"), MAX_REF),
    source_url: url(formData.get("sourceUrl")),
    expires_on: EXPIRING.has(kind) ? date(formData.get("expiresOn")) : null,
    note: text(formData.get("note"), MAX_NOTE),
  };

  const id = uuid(formData.get("id"));
  const { error } = id
    ? await supabase
        .from("supplier_evidence")
        .update(payload)
        .eq("organization_id", org)
        .eq("id", id)
    : await supabase.from("supplier_evidence").insert({
        ...payload,
        organization_id: org,
        supplier_id: supplierId,
        ai_system_id: uuid(formData.get("systemId")),
        kind,
        created_by: user.id,
      });

  if (error) {
    logIncident("saveSupplierEvidence", error);
    redirect(`${SUPPLIERS}?toast=supplier-error`);
  }
  revalidate();
  redirect(`${SUPPLIERS}?toast=evidence-updated`);
}
