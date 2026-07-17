"use client";

import { Button } from "@/components/ui/Button";

export function PrintButton({ label = "Descargar / Imprimir PDF" }: { label?: string }) {
  return (
    <Button onClick={() => window.print()} variant="primary" className="print:hidden">
      ⬇ {label}
    </Button>
  );
}
