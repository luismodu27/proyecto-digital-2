import { PaidGate } from "@/lib/billing/gate";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/i18n/resolve";

export default async function OrganizacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = getDictionary(await resolveLocale()).dashboard.organizations;
  return (
    <PaidGate
      requires="enterprise"
      feature={t.gateFeature}
      description={t.gateDescription}
    >
      {children}
    </PaidGate>
  );
}
