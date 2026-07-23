"use client";

import { useEffect, useState } from "react";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import type { Locale } from "@/lib/i18n/config";

type NavItem = { label: string; href: string };

/**
 * Navegación móvil de la landing: botón hamburguesa + panel desplegable con las
 * mismas anclas de sección, el acceso a "Entrar" y el selector de idioma. Solo se
 * muestra en móvil (`md:hidden`); en escritorio la nav horizontal de `SiteHeader`
 * la sustituye. Todas las cadenas llegan por props (sin provider en la landing).
 */
export function MobileNav({
  items,
  loginLabel,
  openLabel,
  closeLabel,
  locale,
  localeToEn,
  localeToEs,
}: {
  items: NavItem[];
  loginLabel: string;
  openLabel: string;
  closeLabel: string;
  locale: Locale;
  localeToEn: string;
  localeToEs: string;
}) {
  const [open, setOpen] = useState(false);

  // Cierra con Escape y bloquea el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? closeLabel : openLabel}
        className="inline-flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          {open ? (
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>

      {open && (
        <>
          {/* Capa para cerrar tocando fuera */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-40 cursor-default bg-ink/10"
          />
          <div
            id="mobile-nav-panel"
            className="absolute inset-x-0 top-16 z-50 border-b border-line bg-paper-raised shadow-lg"
          >
            <nav className="container-page flex flex-col py-2">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-1 flex items-center justify-between gap-3 border-t border-line px-2 py-3">
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-brand"
                >
                  {loginLabel}
                </a>
                <LocaleToggle
                  locale={locale}
                  labelToEn={localeToEn}
                  labelToEs={localeToEs}
                />
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
