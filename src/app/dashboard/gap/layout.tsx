import { PaidGate } from "@/lib/billing/gate";
import { getGapItems } from "@/lib/data";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

export default async function GapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = getDictionary(await resolveLocale());
  const g = dict.dashboard.gap;
  const tg = dict.dashboard.paywall.gapTeaser;

  return (
    <PaidGate
      feature={g.paywallFeature}
      description={g.paywallDesc}
      // Teaser: en vez de un muro ciego, el plan gratuito ve las cifras que ya
      // salen de SUS datos. Se resuelve solo si el muro bloquea (ver PaidGate).
      stats={async () => {
        const gaps = await getGapItems();
        // Las prácticas prohibidas (Art. 5) no son "brechas abiertas": no se
        // preparan, se cesan. Mismo criterio que la página de brechas.
        const open = gaps.filter((x) => !x.prohibited && x.status !== "done");
        if (open.length === 0) return [];
        return [
          { value: open.length, label: tg.openGaps },
          {
            value: open.filter((x) => x.severity === "alta").length,
            label: tg.highSeverity,
          },
          {
            value: new Set(open.map((x) => x.system)).size,
            label: tg.systems,
          },
        ];
      }}
    >
      {children}
    </PaidGate>
  );
}
