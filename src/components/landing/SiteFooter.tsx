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
                href="mailto:luisscmorenod@gmail.com"
                className="font-medium text-brand hover:text-brand-strong"
              >
                luisscmorenod@gmail.com
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
