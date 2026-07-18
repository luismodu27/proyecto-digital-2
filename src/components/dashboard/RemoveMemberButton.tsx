"use client";

import { removeMember } from "@/lib/data/team-actions";
import { ConfirmSubmit } from "@/components/dashboard/ConfirmSubmit";

export function RemoveMemberButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  return (
    <ConfirmSubmit
      action={removeMember}
      fields={{ userId }}
      title="Quitar del equipo"
      message={`${email} dejará de tener acceso a esta organización. Podrás volver a invitarle más tarde.`}
      confirmLabel="Quitar"
      triggerLabel="Quitar"
      triggerClassName="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
    />
  );
}
