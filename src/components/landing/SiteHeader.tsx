import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { CtaLink } from "@/components/telemetry/CtaLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LocaleToggle } from "@/components/ui/LocaleToggle";
import { MobileNav } from "@/components/landing/MobileNav";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";

type NavItem = { label: string; href: string };

export function SiteHeader({
  nav,
  t,
  locale,
}: {
  nav: NavItem[];
  t: Dictionary;
  locale: Locale;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {/* En móvil, idioma, tema y «Entrar» viven en el menú (MobileNav). Se
              ocultan con `max-sm:hidden`, NO con `hidden sm:inline-flex`: estos
              componentes concatenan su `inline-flex` de base sin fusionar clases,
              y en el CSS `.inline-flex` va detrás de `.hidden`, así que ganaba y
              se veían en móvil, empujando el menú fuera de la pantalla. */}
          <LocaleToggle
            locale={locale}
            labelToEn={t.locale.switchToEn}
            labelToEs={t.locale.switchToEs}
            className="max-sm:hidden"
          />
          <ThemeToggle className="max-sm:hidden" />
          <ButtonLink href="/login" variant="ghost" className="max-sm:hidden">
            {t.nav.login}
          </ButtonLink>
          {/* Registro real, no lista de espera: el plan Diagnóstico es gratuito
              y el checkout está activo (ver comentario en Hero.tsx). */}
          <CtaLink
            cta="header_signup"
            href="/login?signup=1"
            variant="primary"
            // En una línea: a 360 px el relleno de base (px-5) lo partía en dos.
            className="whitespace-nowrap max-sm:px-3"
          >
            {t.nav.requestAccess}
          </CtaLink>
          <MobileNav
            items={nav}
            loginLabel={t.nav.login}
            openLabel={t.nav.openMenu}
            closeLabel={t.nav.closeMenu}
            locale={locale}
            localeToEn={t.locale.switchToEn}
            localeToEs={t.locale.switchToEs}
          />
        </div>
      </div>
    </header>
  );
}
