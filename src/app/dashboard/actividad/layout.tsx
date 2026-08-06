import { PaidGate } from "@/lib/billing/gate";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/i18n/resolve";

export default async function ActividadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = getDictionary(await resolveLocale()).dashboard.pages.activity;
  return (
    <PaidGate feature={t.paywallFeature} description={t.paywallDesc}>
      {children}
    </PaidGate>
  );
}
