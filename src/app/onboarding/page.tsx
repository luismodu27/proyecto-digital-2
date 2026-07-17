import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
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
    <AuthShell>
      <OnboardingForm />
    </AuthShell>
  );
}
