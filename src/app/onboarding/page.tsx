import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrg, getCurrentUser } from "@/lib/data/context";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured) redirect("/dashboard");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Si fue invitado, reclama las invitaciones pendientes por email y entra
  // directamente a su organización (ignora el error si la RPC aún no existe).
  const supabase = await createClient();
  await supabase.rpc("claim_invitations");

  // Si ya tiene organización (propia o reclamada), no repetir el onboarding.
  const org = await getActiveOrg();
  if (org) redirect("/dashboard");

  const locale = await resolveLocale();
  const t = getDictionary(locale).auth;

  return (
    <AuthShell locale={locale} t={t}>
      <OnboardingForm t={t} />
    </AuthShell>
  );
}
