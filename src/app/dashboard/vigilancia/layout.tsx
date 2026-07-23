import { PaidGate } from "@/lib/billing/gate";

export default function VigilanciaLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaidGate
      feature="Vigilancia regulatoria"
      description="El radar que vigila las fuentes oficiales y te avisa de cada plazo y cambio del EU AI Act antes de que te afecte."
    >
      {children}
    </PaidGate>
  );
}
