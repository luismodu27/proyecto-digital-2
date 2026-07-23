"use client";

import { useTransition } from "react";
import type { Locale } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";

/**
 * Alterna idioma en MODO COOKIE (sin cambiar la URL): fija la cookie `NEXT_LOCALE`
 * vía server action y recarga la página para que el middleware recomponga
 * `<html lang>` y el SSR sirva el nuevo idioma. Para auth + dashboard (tras auth
 * el SEO es irrelevante, no queremos prefijo `/en` en la URL).
 *
 * Complementa a `LocaleToggle` (modo URL, Server Component, para la web pública).
 * Misma estética que ThemeToggle / el toggle URL (size-9, borde border-line-strong).
 */
export function LocaleToggleCookie({
  locale,
  labelToEn,
  labelToEs,
  className = "",
}: {
  locale: Locale;
  /** aria-label cuando el destino es inglés (mostrado en español). */
  labelToEn: string;
  /** aria-label cuando el destino es español (mostrado en inglés). */
  labelToEs: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const toEnglish = locale === "es";
  const next: Locale = toEnglish ? "en" : "es";
  const label = toEnglish ? labelToEn : labelToEs;
  const text = toEnglish ? "EN" : "ES";

  function onClick() {
    startTransition(async () => {
      await setLocale(next);
      // Recarga completa: el middleware recompone <html lang> y el SSR
      // sirve el nuevo idioma en todos los Server Components de la ruta.
      window.location.reload();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={label}
      title={label}
      className={`inline-flex size-9 items-center justify-center rounded-full border border-line-strong text-xs font-semibold text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink disabled:opacity-60 ${className}`}
    >
      {text}
    </button>
  );
}
