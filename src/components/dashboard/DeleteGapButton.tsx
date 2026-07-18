"use client";

import { deleteGapItem } from "@/lib/data/actions";
import { ConfirmSubmit } from "@/components/dashboard/ConfirmSubmit";

export function DeleteGapButton({ id }: { id: string }) {
  return (
    <ConfirmSubmit
      action={deleteGapItem}
      fields={{ id }}
      title="Eliminar brecha"
      message="Se quitará este control del gap assessment. Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      triggerAriaLabel="Eliminar brecha"
      triggerClassName="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-sunken hover:text-[var(--tone-danger-fg)]"
    >
      <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden>
        <path
          d="M4 6h12M8 6V4h4v2m-6 0 .5 9a1 1 0 001 1h5a1 1 0 001-1L15 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </ConfirmSubmit>
  );
}
