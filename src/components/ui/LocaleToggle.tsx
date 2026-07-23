import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

/**
 * Alterna idioma en la web pública NAVEGANDO por URL: en `/` enlaza a `/en`
 * ("EN") y en `/en` enlaza a `/` ("ES"). Es un Server Component (solo un enlace),
 * mismo tamaño/estilo que ThemeToggle. Las etiquetas accesibles llegan por props.
 */
export function LocaleToggle({
  locale,
  labelToEn,
  labelToEs,
  className = "",
}: {
  locale: Locale;
  /** aria-label cuando el destino es inglés (mostrado en `/`). */
  labelToEn: string;
  /** aria-label cuando el destino es español (mostrado en `/en`). */
  labelToEs: string;
  className?: string;
}) {
  const toEnglish = locale === "es";
  const href = toEnglish ? "/en" : "/";
  const label = toEnglish ? labelToEn : labelToEs;
  const text = toEnglish ? "EN" : "ES";

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={`inline-flex size-9 items-center justify-center rounded-full border border-line-strong text-xs font-semibold text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink ${className}`}
    >
      {text}
    </Link>
  );
}
