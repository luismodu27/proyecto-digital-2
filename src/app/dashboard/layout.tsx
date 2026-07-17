import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg, getCurrentUser } from "@/lib/data/context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string | undefined;

  // En modo conectado, exige sesión y organización. En modo demo, abierto.
  if (isSupabaseConfigured) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    const org = await getActiveOrg();
    if (!org) redirect("/onboarding");
    userEmail = user.email ?? undefined;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper md:flex-row">
      <Sidebar userEmail={userEmail} />
      <div className="flex-1 md:h-dvh md:overflow-y-auto">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
