"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AccountMenu } from "@/components/dashboard/AccountMenu";
import { useT } from "@/lib/i18n/provider";
import type { Dictionary } from "@/lib/i18n";
import type { UserOrg } from "@/lib/mock-data";

type PlanTier = "free" | "preparacion" | "enterprise";
const RANK: Record<PlanTier, number> = { free: 0, preparacion: 1, enterprise: 2 };

type NavKey = keyof Dictionary["dashboard"]["nav"];

const nav: {
  key: NavKey;
  href: string;
  icon: string;
  requires?: PlanTier;
}[] = [
  { key: "overview", href: "/dashboard", icon: "M3 12h7V3H3v9Zm0 9h7v-7H3v7Zm11 0h7V12h-7v9Zm0-18v7h7V3h-7Z" },
  { key: "inventory", href: "/dashboard/inventario", icon: "M4 7h16M4 12h16M4 17h16" },
  { key: "risk", href: "/dashboard/riesgo", icon: "M12 3 2 20h20L12 3Zm0 6v5m0 3h.01" },
  { key: "gap", href: "/dashboard/gap", icon: "M9 11l3 3 8-8M4 12a8 8 0 108-8", requires: "preparacion" },
  { key: "plan", href: "/dashboard/plan", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9 2 2 4-4", requires: "preparacion" },
  { key: "packs", href: "/dashboard/packs", icon: "M4 7a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7Zm10-2v4h4M8 13h6M8 16h4", requires: "preparacion" },
  { key: "monitoring", href: "/dashboard/vigilancia", icon: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", requires: "preparacion" },
  { key: "team", href: "/dashboard/equipo", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", requires: "preparacion" },
  { key: "activity", href: "/dashboard/actividad", icon: "M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0Z", requires: "preparacion" },
];

export function Sidebar({
  userEmail,
  userName,
  plan,
  orgs,
  activeOrgId,
}: {
  userEmail?: string;
  userName?: string;
  plan?: PlanTier;
  orgs?: UserOrg[];
  activeOrgId?: string;
}) {
  const pathname = usePathname();
  const t = useT();
  const td = t.dashboard;
  const planRank = plan ? RANK[plan] : RANK.enterprise;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-line bg-paper-raised md:h-dvh md:w-64 md:border-b-0 md:border-r print:hidden">
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <Logo href="/dashboard" />
        <ThemeToggle />
      </div>
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible">
        {nav.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const locked = item.requires ? planRank < RANK[item.requires] : false;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={locked ? td.nav.lockedTitle : undefined}
              className={`relative flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-brand-soft text-brand-strong"
                  : locked
                    ? "text-muted hover:bg-paper-sunken hover:text-ink-soft"
                    : "text-ink-soft hover:translate-x-0.5 hover:bg-paper-sunken hover:text-ink"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-4.5 shrink-0" fill="none" aria-hidden>
                <path
                  d={item.icon}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="flex-1">{td.nav[item.key]}</span>
              {locked && (
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 shrink-0 text-muted"
                  fill="none"
                  aria-label={td.nav.lockedLabel}
                >
                  <path
                    d="M6 10V8a6 6 0 1112 0v2m-9 0h6a3 3 0 013 3v5a3 3 0 01-3 3H9a3 3 0 01-3-3v-5a3 3 0 013-3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 md:mt-auto">
        {userEmail ? (
          <AccountMenu
            userEmail={userEmail}
            userName={userName}
            orgs={orgs}
            activeOrgId={activeOrgId}
          />
        ) : (
          <div className="rounded-xl border border-line bg-paper-sunken/60 p-4">
            <p className="text-xs font-medium text-ink">{td.sidebar.demoTitle}</p>
            <p className="mt-1 text-xs text-muted">{td.sidebar.demoBody}</p>
            <Link
              href="/"
              className="mt-3 inline-block text-xs font-medium text-brand hover:text-brand-strong"
            >
              {td.sidebar.backToSite}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
