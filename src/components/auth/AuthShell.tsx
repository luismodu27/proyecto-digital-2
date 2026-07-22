import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { SealMark } from "@/components/ui/SealMark";
import { LocaleToggleCookie } from "@/components/ui/LocaleToggleCookie";
import { LEGAL_FOOTER_BY_LOCALE } from "@/components/ui/LegalNote";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";

export function AuthShell({
  children,
  locale,
  t,
}: {
  children: ReactNode;
  locale: Locale;
  t: Dictionary["auth"];
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel de marca (desktop) */}
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 grid-paper opacity-[0.07]" aria-hidden />
        <div
          className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand blur-3xl opacity-25"
          aria-hidden
        />
        <Link href="/" className="relative inline-flex items-center gap-2">
          <SealMark size={30} className="text-brand-bright" />
          <span className="font-display text-xl font-semibold text-paper">
            Attesta
          </span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md font-display text-3xl font-semibold leading-tight">
            {t.shell.heading}
          </h2>
          <ul className="mt-8 space-y-4">
            {t.shell.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-paper/80">
                <SealMark size={22} className="mt-0.5 shrink-0 text-brand-bright" />
                <span className="text-sm leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative max-w-sm text-xs leading-relaxed text-paper/45">
          {LEGAL_FOOTER_BY_LOCALE[locale]}
        </p>
      </aside>

      {/* Área de formulario */}
      <div className="flex flex-col bg-paper">
        {/* Barra superior: logo en móvil, selector de idioma siempre a la derecha */}
        <div className="flex h-16 items-center justify-between border-b border-line px-5 lg:justify-end lg:border-b-0">
          <span className="lg:hidden">
            <Logo />
          </span>
          <LocaleToggleCookie
            locale={locale}
            labelToEn={t.shell.switchToEn}
            labelToEs={t.shell.switchToEs}
          />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4">
          <div className="w-full max-w-md">
            {children}
            <p className="mt-6 text-center text-sm text-muted">
              <Link href="/" className="transition-colors hover:text-ink">
                {t.shell.backToSite}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
