import { Logo } from "@/components/ui/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-sunken/50">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Gobernanza continua de IA para el mid-market. Inventario, riesgo y
            evidencia lista para auditoría.
          </p>
        </div>
        <div className="text-sm text-muted">
          <p>© 2026 Attesta. Todos los derechos reservados.</p>
          <p className="mt-1">
            Orientación de compliance, no constituye asesoría legal.
          </p>
        </div>
      </div>
    </footer>
  );
}
