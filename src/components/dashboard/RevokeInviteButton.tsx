"use client";

import { revokeInvitation } from "@/lib/data/team-actions";
import { ConfirmSubmit } from "@/components/dashboard/ConfirmSubmit";
import { useT } from "@/lib/i18n/provider";

export function RevokeInviteButton({ id }: { id: string }) {
  const t = useT().dashboard.buttons;
  return (
    <ConfirmSubmit
      action={revokeInvitation}
      fields={{ id }}
      title={t.revokeInviteTitle}
      message={t.revokeInviteMessage}
      confirmLabel={t.revokeInviteLabel}
      triggerLabel={t.revokeInviteLabel}
      triggerClassName="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
    />
  );
}
