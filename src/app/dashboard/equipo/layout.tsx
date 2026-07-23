import { PaidGate } from "@/lib/billing/gate";

export default function EquipoLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaidGate
      feature="Equipo y roles"
      description="Invita a tu equipo, asigna roles (owner/admin/member) y gestiona quién ve y atesta la evidencia de tu organización."
    >
      {children}
    </PaidGate>
  );
}
