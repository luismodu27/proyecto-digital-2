"use client";

import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/provider";

export function PrintButton({ label }: { label?: string }) {
  const t = useT().dashboard.buttons;
  return (
    <Button onClick={() => window.print()} variant="primary" className="print:hidden">
      ⬇ {label ?? t.downloadPdf}
    </Button>
  );
}
