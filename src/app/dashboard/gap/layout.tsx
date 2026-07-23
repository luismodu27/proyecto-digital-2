import { PaidGate } from "@/lib/billing/gate";

export default function GapLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaidGate
      feature="Gap assessment"
      description="Mide tu preparación frente a cada obligación, genera el informe de brechas y conviértelas en un plan de acción."
    >
      {children}
    </PaidGate>
  );
}
