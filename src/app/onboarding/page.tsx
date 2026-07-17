import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg, getCurrentUser } from "@/lib/data/context";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured) redirect("/dashboard");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Si ya tiene organización, no repetir el onboarding.
  const org = await getActiveOrg();
  if (org) redirect("/dashboard");

  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      <div className="border-b border-line">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <OnboardingForm />
        </div>
      </div>
    </main>
  );
}
