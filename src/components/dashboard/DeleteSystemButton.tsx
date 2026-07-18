"use client";

import { deleteAiSystem } from "@/lib/data/actions";
import { ConfirmSubmit } from "@/components/dashboard/ConfirmSubmit";

export function DeleteSystemButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <ConfirmSubmit
      action={deleteAiSystem}
      fields={{ id }}
      title={`Eliminar "${name}"`}
      message="Se borrarán también sus evaluaciones y brechas. Esta acción no se puede deshacer."
      confirmLabel="Eliminar sistema"
      triggerLabel="Eliminar sistema"
      triggerClassName="inline-flex items-center justify-center rounded-full border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-5 py-2.5 text-sm font-medium text-[var(--tone-danger-fg)] transition-colors hover:opacity-90"
    />
  );
}
