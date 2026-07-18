import { PaidGate } from "@/lib/billing/gate";

export default function ActividadLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaidGate
      feature="Registro de actividad"
      description="El audit-trail inmutable de tu organización: quién creó, cambió o atestó cada sistema, evaluación y brecha, con fecha y autor."
    >
      {children}
    </PaidGate>
  );
}
