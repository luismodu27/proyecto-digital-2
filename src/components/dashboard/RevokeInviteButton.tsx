"use client";

import { revokeInvitation } from "@/lib/data/team-actions";

export function RevokeInviteButton({ id }: { id: string }) {
  return (
    <form
      action={revokeInvitation}
      onSubmit={(e) => {
        if (!window.confirm("¿Revocar esta invitación?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
      >
        Revocar
      </button>
    </form>
  );
}
