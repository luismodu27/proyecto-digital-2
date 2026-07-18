/**
 * Estado de carga del dashboard. Next lo muestra mientras el Server Component
 * de la página resuelve sus consultas (evita pantalla en blanco / navegación
 * colgada). Esqueleto sutil, consistente con las tarjetas del panel.
 */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>

      {/* Cabecera */}
      <div className="h-8 w-64 max-w-full rounded-lg bg-paper-sunken" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-paper-sunken/70" />

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-line bg-paper-raised"
          />
        ))}
      </div>

      {/* Bloques de contenido */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-2xl border border-line bg-paper-raised" />
        <div className="h-64 rounded-2xl border border-line bg-paper-raised" />
      </div>
    </div>
  );
}
