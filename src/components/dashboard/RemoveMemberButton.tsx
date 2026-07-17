"use client";

import { removeMember } from "@/lib/data/team-actions";

export function RemoveMemberButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  return (
    <form
      action={removeMember}
      onSubmit={(e) => {
        if (!window.confirm(`¿Quitar a ${email} de la organización?`))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
      >
        Quitar
      </button>
    </form>
  );
}
