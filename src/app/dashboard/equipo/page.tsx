import { PageHeader } from "@/components/dashboard/parts";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { MemberRoleControl } from "@/components/dashboard/MemberRoleControl";
import { RemoveMemberButton } from "@/components/dashboard/RemoveMemberButton";
import { RevokeInviteButton } from "@/components/dashboard/RevokeInviteButton";
import {
  getOrgMembers,
  getPendingInvitations,
  getCurrentMemberRole,
  isSupabaseConfigured,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/data/context";
import { inviteMember } from "@/lib/data/team-actions";
import { type MemberRole } from "@/lib/mock-data";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

function formatDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

export default async function EquipoPage() {
  const connected = isSupabaseConfigured;
  const [members, invitations, role, user] = await Promise.all([
    getOrgMembers(),
    getPendingInvitations(),
    getCurrentMemberRole(),
    connected ? getCurrentUser() : Promise.resolve(null),
  ]);

  const locale = await resolveLocale();
  const t = getDictionary(locale).dashboard.team;

  const isOwner = connected && role === "owner";
  const canManage = connected && (role === "owner" || role === "admin");
  const currentUserId = user?.id;

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {!connected && (
        <div className="mb-6 rounded-2xl border border-[var(--tone-info-bd)] bg-[var(--tone-info-bg)] px-5 py-4 text-sm text-[var(--tone-info-fg)]">
          {t.demoBefore}
          <span className="font-medium">{t.demoMode}</span>
          {t.demoAfter}
        </div>
      )}

      {/* Invitar */}
      {canManage && (
        <section className="mb-8 rounded-2xl border border-line bg-paper-raised p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            {t.inviteTitle}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {t.inviteBody}
          </p>
          <form
            action={inviteMember}
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label htmlFor="email" className="block text-sm font-medium text-ink">
                {t.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={t.emailPlaceholder}
                className={field}
              />
            </div>
            <div className="sm:w-52">
              <label htmlFor="role" className="block text-sm font-medium text-ink">
                {t.roleLabel}
              </label>
              <select id="role" name="role" defaultValue="member" className={field}>
                <option value="member">{t.roleLabels.member}</option>
                <option value="admin">{t.roleLabels.admin}</option>
                {isOwner && <option value="owner">{t.roleLabels.owner}</option>}
              </select>
            </div>
            <Button type="submit" className="shrink-0">
              {t.inviteCta}
            </Button>
          </form>
        </section>
      )}

      {/* Miembros */}
      <section className="overflow-hidden rounded-2xl border border-line bg-paper-raised">
        <div className="border-b border-line px-6 py-4">
          <h2 className="font-display text-base font-semibold text-ink">
            {t.membersTitle}{" "}
            <span className="text-sm font-normal text-muted">({members.length})</span>
          </h2>
        </div>
        <ul className="divide-y divide-line">
          {members.map((m) => {
            const isSelf = !!currentUserId && m.userId === currentUserId;
            // Un admin no puede gestionar a un owner.
            const manageable = canManage && !(m.role === "owner" && !isOwner);
            const removable = manageable && !isSelf;
            return (
              <li
                key={m.userId}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold uppercase text-brand-strong">
                    {m.email.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {m.email}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-muted">
                          {t.you}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {t.joinedPrefix}{formatDate(m.joinedAt, locale)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 pl-12 sm:pl-0">
                  {manageable ? (
                    <MemberRoleControl
                      userId={m.userId}
                      role={m.role}
                      canSetOwner={isOwner}
                    />
                  ) : (
                    <RoleBadge role={m.role} label={t.roleLabels[m.role]} />
                  )}
                  {removable && (
                    <RemoveMemberButton userId={m.userId} email={m.email} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Invitaciones pendientes */}
      {canManage && invitations.length > 0 && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-paper-raised">
          <div className="border-b border-line px-6 py-4">
            <h2 className="font-display text-base font-semibold text-ink">
              {t.pendingTitle}{" "}
              <span className="text-sm font-normal text-muted">
                ({invitations.length})
              </span>
            </h2>
          </div>
          <ul className="divide-y divide-line">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-3 px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {inv.email}
                  </p>
                  <p className="text-xs text-muted">
                    {t.invitedAsPrefix}{t.roleLabels[inv.role as MemberRole]} ·{" "}
                    {formatDate(inv.createdAt, locale)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--tone-warn-fg)]">
                    {t.pending}
                  </span>
                  <RevokeInviteButton id={inv.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Leyenda de roles */}
      <section className="mt-6 rounded-2xl border border-line bg-paper-raised p-6">
        <h2 className="font-display text-sm font-semibold text-ink">
          {t.rolesLegendTitle}
        </h2>
        <dl className="mt-3 space-y-2.5">
          {(["owner", "admin", "member"] as MemberRole[]).map((r) => (
            <div key={r} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <dt className="shrink-0 sm:w-32">
                <RoleBadge role={r} label={t.roleLabels[r]} />
              </dt>
              <dd className="text-sm text-ink-soft">{t.roleHints[r]}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
