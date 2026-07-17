import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

const nav = [
  { label: "Producto", href: "#producto" },
  { label: "Por qué ahora", href: "#por-que-ahora" },
  { label: "Cómo funciona", href: "#como-funciona" },
];

export function SiteHeader() {
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
          <ButtonLink href="/dashboard" variant="ghost" className="hidden sm:inline-flex">
            Ver demo
          </ButtonLink>
          <ButtonLink href="#waitlist" variant="primary">
            Solicitar acceso
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
