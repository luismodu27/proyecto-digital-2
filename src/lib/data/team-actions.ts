"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg } from "./context";
import type { MemberRole } from "@/lib/mock-data";

const TEAM = "/dashboard/equipo";
const VALID_ROLES: MemberRole[] = ["owner", "admin", "member"];

function back(toast: string): never {
  redirect(`${TEAM}?toast=${toast}`);
}

/** Rol del usuario actual en la org (para las guardas). */
async function currentContext() {
  const supabase = await createClient();
  const org = await getActiveOrg();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!org || !user) return null;
  const { data } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", org)
    .eq("user_id", user.id)
    .maybeSingle();
  return { supabase, org, userId: user.id, role: (data?.role ?? null) as MemberRole | null };
}

/** Invita a alguien por email (o lo añade si ya tiene cuenta). */
export async function inviteMember(formData: FormData) {
  if (!isSupabaseConfigured) back("team-demo");
  const ctx = await currentContext();
  if (!ctx) redirect("/onboarding");
  if (ctx.role !== "owner" && ctx.role !== "admin") back("team-forbidden");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "member") as MemberRole;
  if (!email || !email.includes("@")) back("team-bademail");
  if (!VALID_ROLES.includes(role)) back("team-error");

  const { data, error } = await ctx.supabase.rpc("invite_member", {
    org: ctx.org,
    invitee_email: email,
    invitee_role: role,
  });

  if (error) back("team-error");

  revalidatePath(TEAM);
  if (data === "added") back("member-added");
  if (data === "already_member") back("member-exists");
  back("member-invited");
}

/** Cambia el rol de un miembro. */
export async function updateMemberRole(formData: FormData) {
  if (!isSupabaseConfigured) back("team-demo");
  const ctx = await currentContext();
  if (!ctx) redirect("/onboarding");
  if (ctx.role !== "owner" && ctx.role !== "admin") back("team-forbidden");

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as MemberRole;
  if (!userId || !VALID_ROLES.includes(role)) back("team-error");

  // Solo un owner puede otorgar (o retirar) el rol owner.
  if (role === "owner" && ctx.role !== "owner") back("team-forbidden");

  const { data: members } = await ctx.supabase
    .from("memberships")
    .select("user_id, role")
    .eq("organization_id", ctx.org);
  const owners = (members ?? []).filter((m) => m.role === "owner");
  const target = (members ?? []).find((m) => m.user_id === userId);
  if (!target) back("team-error");

  // No dejar la organización sin ningún owner.
  if (target.role === "owner" && role !== "owner" && owners.length <= 1) {
    back("team-lastowner");
  }
  // Solo un owner puede degradar a otro owner.
  if (target.role === "owner" && ctx.role !== "owner") back("team-forbidden");

  await ctx.supabase
    .from("memberships")
    .update({ role })
    .eq("organization_id", ctx.org)
    .eq("user_id", userId);

  revalidatePath(TEAM);
  back("role-updated");
}

/** Quita a un miembro de la organización. */
export async function removeMember(formData: FormData) {
  if (!isSupabaseConfigured) back("team-demo");
  const ctx = await currentContext();
  if (!ctx) redirect("/onboarding");
  if (ctx.role !== "owner" && ctx.role !== "admin") back("team-forbidden");

  const userId = String(formData.get("userId") ?? "");
  if (!userId) back("team-error");

  const { data: members } = await ctx.supabase
    .from("memberships")
    .select("user_id, role")
    .eq("organization_id", ctx.org);
  const target = (members ?? []).find((m) => m.user_id === userId);
  if (!target) back("team-error");
  const owners = (members ?? []).filter((m) => m.role === "owner");

  // No quitar al último owner; solo un owner puede quitar a otro owner.
  if (target.role === "owner" && owners.length <= 1) back("team-lastowner");
  if (target.role === "owner" && ctx.role !== "owner") back("team-forbidden");

  await ctx.supabase
    .from("memberships")
    .delete()
    .eq("organization_id", ctx.org)
    .eq("user_id", userId);

  revalidatePath(TEAM);
  back("member-removed");
}

/** Revoca una invitación pendiente. */
export async function revokeInvitation(formData: FormData) {
  if (!isSupabaseConfigured) back("team-demo");
  const ctx = await currentContext();
  if (!ctx) redirect("/onboarding");
  if (ctx.role !== "owner" && ctx.role !== "admin") back("team-forbidden");

  const id = String(formData.get("id") ?? "");
  if (!id) back("team-error");

  await ctx.supabase
    .from("invitations")
    .delete()
    .eq("organization_id", ctx.org)
    .eq("id", id);

  revalidatePath(TEAM);
  back("invite-revoked");
}
