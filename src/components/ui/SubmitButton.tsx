"use client";

import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Botón de envío para `<form action={serverAction}>` que refleja el estado
 * `pending` de la Server Action: se deshabilita, marca `aria-busy` y muestra un
 * texto de progreso. Reutiliza los estilos/variantes de `Button`. Debe vivir
 * DENTRO del `<form>` (así `useFormStatus` lo asocia).
 */
export function SubmitButton({
  children,
  pendingText = "Guardando…",
  ...props
}: { pendingText?: string } & Omit<ComponentProps<typeof Button>, "type">) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
