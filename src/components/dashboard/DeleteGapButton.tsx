"use client";

import { deleteGapItem } from "@/lib/data/actions";

export function DeleteGapButton({ id }: { id: string }) {
  return (
    <form
      action={deleteGapItem}
      onSubmit={(e) => {
        if (!window.confirm("¿Eliminar esta brecha?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Eliminar brecha"
        className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper-sunken hover:text-[var(--tone-danger-fg)]"
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
      </button>
    </form>
  );
}
