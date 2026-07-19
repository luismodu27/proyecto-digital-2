import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { WelcomeGuide } from "@/components/dashboard/WelcomeGuide";
import { Toaster } from "@/components/ui/Toast";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg, getCurrentUser } from "@/lib/data/context";
import { getUserOrgs } from "@/lib/data";
import { getOrgPlan, type PlanTier } from "@/lib/billing/plan";
import type { UserOrg } from "@/lib/mock-data";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string | undefined;
  let userName: string | undefined;
  let userId: string | undefined;
  let showGuide = false;
  let plan: PlanTier | undefined;
  let orgs: UserOrg[] = [];
  let activeOrgId: string | undefined;

  // En modo conectado, exige sesión y organización. En modo demo, abierto.
  if (isSupabaseConfigured) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    const org = await getActiveOrg();
    if (!org) redirect("/onboarding");
    userEmail = user.email ?? undefined;
    userId = user.id;
    activeOrgId = org;
    [plan, orgs] = await Promise.all([getOrgPlan(org), getUserOrgs()]);
    const meta = user.user_metadata ?? {};
    const rawName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.display_name === "string" && meta.display_name) ||
      (typeof meta.nombre === "string" && meta.nombre) ||
      "";
    userName = rawName.trim() || undefined;
    // La guía se muestra solo la primera vez (hasta que se marca vista).
    showGuide = meta.guide_seen !== true;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper md:flex-row">
      <Sidebar
        userEmail={userEmail}
        userName={userName}
        plan={plan}
        orgs={orgs}
        activeOrgId={activeOrgId}
      />
      <div className="flex-1 md:h-dvh md:overflow-y-auto">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</div>
      </div>
      {showGuide && <WelcomeGuide show userId={userId} />}
      <Suspense>
        <Toaster />
      </Suspense>
    </div>
  );
}
