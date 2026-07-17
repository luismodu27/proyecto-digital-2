import { ROLE_LABEL, type MemberRole } from "@/lib/mock-data";

const styles: Record<MemberRole, string> = {
  owner:
    "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  admin:
    "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
  member:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

export function RoleBadge({ role }: { role: MemberRole }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[role]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {ROLE_LABEL[role]}
    </span>
  );
}
