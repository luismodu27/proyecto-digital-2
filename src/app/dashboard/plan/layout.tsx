import { PaidGate } from "@/lib/billing/gate";

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaidGate
      feature="Plan de acción"
      description="Convierte las brechas en tareas con responsables y fechas, y sigue su avance hasta cerrarlas."
    >
      {children}
    </PaidGate>
  );
}
