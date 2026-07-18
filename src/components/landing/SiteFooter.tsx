import { Logo } from "@/components/ui/Logo";
import { LEGAL_FOOTER } from "@/components/ui/LegalNote";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-sunken/50">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Gobernanza continua de IA para el mid-market: inventario, riesgo,
            evidencia y vigilancia regulatoria, listos para auditoría.
          </p>
        </div>
        <div className="text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Contacto
          </p>
          <ul className="mt-3 space-y-1.5 text-ink-soft">
            <li>
              <a
                href="mailto:attesta.io.mx@gmail.com"
                className="font-medium text-brand hover:text-brand-strong"
              >
                attesta.io.mx@gmail.com
              </a>
            </li>
            <li>
              <a
                href="tel:+526624628851"
                className="font-medium text-brand hover:text-brand-strong"
              >
                +52 662 462 8851
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/attesta.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-brand hover:text-brand-strong"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
                </svg>
                @attesta.io
              </a>
            </li>
          </ul>
        </div>
        <div className="text-sm text-muted">
          <p>© 2026 Attesta. Todos los derechos reservados.</p>
          <p className="mt-1 max-w-sm">{LEGAL_FOOTER}</p>
        </div>
      </div>
    </footer>
  );
}
