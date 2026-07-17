"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import type { MemberRole } from "@/lib/mock-data";

const VIGILANCIA = "/dashboard/vigilancia";
const VALID_STATUS = ["reviewed", "planned", "not_applicable"];

/**
 * Marca (o desmarca) un evento del radar regulatorio con un estado interno.
 * status vacío = quitar la marca. Solo owner/admin.
 */
export async function setEventStatus(formData: FormData) {
  if (!isSupabaseConfigured) redirect(`${VIGILANCIA}?toast=team-demo`);

  const supabase = await createClient();
  const org = await getActiveOrg();
  if (!org) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", org)
    .eq("user_id", user.id)
    .maybeSingle();
  const role = (membership?.role ?? null) as MemberRole | null;
  if (role !== "owner" && role !== "admin") {
    redirect(`${VIGILANCIA}?toast=team-forbidden`);
  }

  const eventId = String(formData.get("eventId") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  if (!eventId) redirect(VIGILANCIA);

  if (!status) {
    // Quitar la marca.
    await supabase
      .from("regulatory_acks")
      .delete()
      .eq("organization_id", org)
      .eq("event_id", eventId);
  } else if (VALID_STATUS.includes(status)) {
    await supabase.from("regulatory_acks").upsert(
      {
        organization_id: org,
        event_id: eventId,
        status,
        acknowledged_by: user.id,
        acknowledged_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,event_id" },
    );
  }

  revalidatePath(VIGILANCIA);
  revalidatePath("/dashboard/actividad");
}
