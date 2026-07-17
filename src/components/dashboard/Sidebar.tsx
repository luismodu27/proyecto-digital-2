"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { signOut } from "@/lib/auth/actions";

const nav = [
  { label: "Resumen", href: "/dashboard", icon: "M3 12h7V3H3v9Zm0 9h7v-7H3v7Zm11 0h7V12h-7v9Zm0-18v7h7V3h-7Z" },
  { label: "Inventario", href: "/dashboard/inventario", icon: "M4 7h16M4 12h16M4 17h16" },
  { label: "Riesgo", href: "/dashboard/riesgo", icon: "M12 3 2 20h20L12 3Zm0 6v5m0 3h.01" },
  { label: "Gap assessment", href: "/dashboard/gap", icon: "M9 11l3 3 8-8M4 12a8 8 0 108-8" },
  { label: "Plan de acción", href: "/dashboard/plan", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9 2 2 4-4" },
  { label: "Policy packs", href: "/dashboard/packs", icon: "M4 7a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7Zm10-2v4h4M8 13h6M8 16h4" },
];

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();

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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-brand-soft text-brand-strong"
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
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden p-4 md:block">
        {userEmail ? (
          <div className="rounded-xl border border-line bg-paper-sunken/60 p-4">
            <p className="truncate text-xs font-medium text-ink" title={userEmail}>
              {userEmail}
            </p>
            <form action={signOut} className="mt-2">
              <button
                type="submit"
                className="text-xs font-medium text-brand hover:text-brand-strong"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-paper-sunken/60 p-4">
            <p className="text-xs font-medium text-ink">Demo con datos de ejemplo</p>
            <p className="mt-1 text-xs text-muted">
              Backend real pendiente. Los datos no son reales.
            </p>
            <Link
              href="/"
              className="mt-3 inline-block text-xs font-medium text-brand hover:text-brand-strong"
            >
              ← Volver al sitio
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
