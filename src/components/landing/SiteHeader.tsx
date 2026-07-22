import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
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
          <LocaleToggle
            locale={locale}
            labelToEn={t.locale.switchToEn}
            labelToEs={t.locale.switchToEs}
            className="hidden sm:inline-flex"
          />
          <ThemeToggle />
          <ButtonLink href="/login" variant="ghost" className="hidden sm:inline-flex">
            {t.nav.login}
          </ButtonLink>
          <ButtonLink href="#waitlist" variant="primary">
            {t.nav.requestAccess}
          </ButtonLink>
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
