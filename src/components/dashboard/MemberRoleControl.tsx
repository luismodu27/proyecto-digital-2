"use client";

import { updateMemberRole } from "@/lib/data/team-actions";
import type { MemberRole } from "@/lib/mock-data";
import { useT } from "@/lib/i18n/provider";

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
  const c = useT().dashboard.controls;
  return (
    <form action={updateMemberRole}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        aria-label={c.memberRoleAria}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
      >
        <option value="member">{c.memberRole.member}</option>
        <option value="admin">{c.memberRole.admin}</option>
        {(canSetOwner || role === "owner") && (
          <option value="owner">{c.memberRole.owner}</option>
        )}
      </select>
    </form>
  );
}
