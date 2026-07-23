"use client";

import { deleteAiSystem } from "@/lib/data/actions";
import { ConfirmSubmit } from "@/components/dashboard/ConfirmSubmit";
import { useT } from "@/lib/i18n/provider";

export function DeleteSystemButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const t = useT().dashboard.buttons;
  return (
    <ConfirmSubmit
      action={deleteAiSystem}
      fields={{ id }}
      title={`${t.deleteSystemTitleBefore}${name}${t.deleteSystemTitleAfter}`}
      message={t.deleteSystemMessage}
      confirmLabel={t.deleteSystemLabel}
      triggerLabel={t.deleteSystemLabel}
      triggerClassName="inline-flex items-center justify-center rounded-full border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-5 py-2.5 text-sm font-medium text-[var(--tone-danger-fg)] transition-colors hover:opacity-90"
    />
  );
}
