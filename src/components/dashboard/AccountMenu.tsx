"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, switchAccount } from "@/lib/auth/actions";
import { switchOrg } from "@/lib/data/org-actions";
import { useT, useLocale } from "@/lib/i18n/provider";
import { LocaleToggleCookie } from "@/components/ui/LocaleToggleCookie";
import type { UserOrg } from "@/lib/mock-data";

/** Iniciales a partir del nombre (2 palabras) o, si no hay, del correo. */
function initials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return (email?.[0] ?? "?").toUpperCase();
}

export function AccountMenu({
  userEmail,
  userName,
  orgs = [],
  activeOrgId,
}: {
  userEmail: string;
  userName?: string;
  orgs?: UserOrg[];
  activeOrgId?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = useT();
  const locale = useLocale();
  const acc = t.dashboard.account;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-line bg-paper-sunken/60 p-3 text-left transition-colors hover:border-line-strong hover:bg-paper-sunken"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-strong">
          {initials(userName, userEmail)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {userName ?? userEmail}
          </span>
          {userName && (
            <span className="block truncate text-[11px] text-muted">
              {userEmail}
            </span>
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`size-4 shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          aria-hidden
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute inset-x-0 top-full z-40 mt-2 origin-top overflow-hidden rounded-xl border border-line bg-paper-raised shadow-lg md:bottom-full md:top-auto md:mb-2 md:mt-0 md:origin-bottom"
        >
          {orgs.length > 1 && (
            <div className="border-b border-line">
              <p className="px-4 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {acc.organization}
              </p>
              {orgs.map((o) =>
                o.id === activeOrgId ? (
                  <div
                    key={o.id}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-ink"
                  >
                    <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-brand" fill="none" aria-hidden>
                      <path
                        d="m3.5 8.5 3 3 6-7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="truncate">{o.name}</span>
                  </div>
                ) : (
                  <form key={o.id} action={switchOrg}>
                    <input type="hidden" name="orgId" value={o.id} />
                    <button
                      type="submit"
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
                    >
                      <span className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{o.name}</span>
                    </button>
                  </form>
                ),
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
            <span className="text-sm text-ink-soft">{t.locale.label}</span>
            <LocaleToggleCookie
              locale={locale}
              labelToEn={t.locale.switchToEn}
              labelToEs={t.locale.switchToEs}
            />
          </div>

          <Link
            href="/dashboard/facturacion"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" aria-hidden>
              <path
                d="M3 10h18M6 15h4m-5 5h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {acc.billing}
          </Link>

          <Link
            href="/"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 border-t border-line px-4 py-2.5 text-sm text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" aria-hidden>
              <path
                d="M3 11l9-8 9 8M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {acc.goToSite}
          </Link>

          <form action={switchAccount} className="border-t border-line">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" aria-hidden>
                <path
                  d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3m1-11 4 4m0 0-4 4m4-4H9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {acc.switchAccount}
            </button>
          </form>

          <form action={signOut} className="border-t border-line">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft transition-colors hover:bg-[var(--tone-danger-bg)] hover:text-[var(--tone-danger-fg)]"
            >
              <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" aria-hidden>
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14 5-5m0 0-5-5m5 5H9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {acc.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
