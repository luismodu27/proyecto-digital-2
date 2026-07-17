"use client";

import { updateMemberRole } from "@/lib/data/team-actions";
import type { MemberRole } from "@/lib/mock-data";

/** Selector de rol que se autoenvía al cambiar. */
export function MemberRoleControl({
  userId,
  role,
  canSetOwner,
}: {
  userId: string;
  role: MemberRole;
  canSetOwner: boolean;
}) {
  return (
    <form action={updateMemberRole}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        aria-label="Rol del miembro"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
      >
        <option value="member">Miembro</option>
        <option value="admin">Administrador</option>
        {(canSetOwner || role === "owner") && (
          <option value="owner">Propietario</option>
        )}
      </select>
    </form>
  );
}
