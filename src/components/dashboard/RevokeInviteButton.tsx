"use client";

import { revokeInvitation } from "@/lib/data/team-actions";
import { ConfirmSubmit } from "@/components/dashboard/ConfirmSubmit";

export function RevokeInviteButton({ id }: { id: string }) {
  return (
    <ConfirmSubmit
      action={revokeInvitation}
      fields={{ id }}
      title="Revocar invitación"
      message="La persona invitada ya no podrá unirse con este enlace. Puedes volver a invitarla más tarde."
      confirmLabel="Revocar"
      triggerLabel="Revocar"
      triggerClassName="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
    />
  );
}
