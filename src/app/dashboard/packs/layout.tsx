import { PaidGate } from "@/lib/billing/gate";

export default function PacksLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaidGate
      feature="Policy packs"
      description="Plantillas de políticas listas para tu vertical (empezando por RRHH) para acelerar tu evidencia."
    >
      {children}
    </PaidGate>
  );
}
