"use client";

import { removeMember } from "@/lib/data/team-actions";
import { ConfirmSubmit } from "@/components/dashboard/ConfirmSubmit";
import { useT } from "@/lib/i18n/provider";

export function RemoveMemberButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const t = useT().dashboard.buttons;
  return (
    <ConfirmSubmit
      action={removeMember}
      fields={{ userId }}
      title={t.removeMemberTitle}
      message={`${email}${t.removeMemberMessageSuffix}`}
      confirmLabel={t.removeMemberLabel}
      triggerLabel={t.removeMemberLabel}
      triggerClassName="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
    />
  );
}
