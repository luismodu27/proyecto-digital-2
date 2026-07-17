"use client";

import { deleteAiSystem } from "@/lib/data/actions";

export function DeleteSystemButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <form
      action={deleteAiSystem}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `¿Eliminar "${name}"? Se borrarán también sus evaluaciones y brechas. Esta acción no se puede deshacer.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-5 py-2.5 text-sm font-medium text-[var(--tone-danger-fg)] transition-colors hover:opacity-90"
      >
        Eliminar sistema
      </button>
    </form>
  );
}
