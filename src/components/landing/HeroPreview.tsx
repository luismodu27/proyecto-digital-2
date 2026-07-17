import { SealMark } from "@/components/ui/SealMark";

/** Mockup on-brand del producto para el hero (no es una captura: escala nítido). */
export function HeroPreview() {
  const risk = [
    { label: "Alto riesgo", pct: 50, color: "#c9761f" },
    { label: "Riesgo limitado", pct: 33, color: "#b0824a" },
    { label: "Riesgo mínimo", pct: 17, color: "#0b6b4e" },
  ];

  return (
    <div className="animate-float-soft rounded-2xl border border-line-strong bg-paper-raised p-2 shadow-[0_40px_90px_-40px_rgba(15,26,20,0.45)]">
      {/* Barra de navegador */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="size-2.5 rounded-full bg-[#e4b0aa]" />
        <span className="size-2.5 rounded-full bg-[#e6cfa0]" />
        <span className="size-2.5 rounded-full bg-[#bfdccf]" />
        <div className="ml-3 flex-1 rounded-md bg-paper-sunken px-3 py-1 text-[11px] text-muted">
          app.attesta.io/dashboard
        </div>
      </div>

      {/* Mini-app */}
      <div className="overflow-hidden rounded-xl border border-line bg-paper">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-32 shrink-0 flex-col gap-1 border-r border-line bg-paper-raised p-3 sm:flex">
            <div className="mb-2 flex items-center gap-1.5">
              <SealMark size={16} className="text-brand" />
              <span className="font-display text-xs font-semibold text-ink">
                Attesta
              </span>
            </div>
            {["Resumen", "Inventario", "Riesgo", "Plan"].map((n, i) => (
              <div
                key={n}
                className={`rounded-md px-2 py-1 text-[11px] ${
                  i === 0
                    ? "bg-brand-soft font-medium text-brand-strong"
                    : "text-ink-soft"
                }`}
              >
                {n}
              </div>
            ))}
          </div>

          {/* Contenido */}
          <div className="flex-1 p-4">
            <p className="font-display text-sm font-semibold text-ink">
              Resumen de gobernanza
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { k: "Sistemas", v: "6" },
                { k: "Alto riesgo", v: "3", warn: true },
                { k: "% listo", v: "62%" },
              ].map((c) => (
                <div key={c.k} className="rounded-lg border border-line bg-paper-raised p-2">
                  <p
                    className={`font-display text-lg font-semibold ${
                      c.warn ? "text-[#a3271f]" : "text-ink"
                    }`}
                  >
                    {c.v}
                  </p>
                  <p className="text-[10px] text-muted">{c.k}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-line bg-paper-raised p-3">
              <p className="text-[11px] font-medium text-ink">Distribución de riesgo</p>
              <div className="mt-2.5 space-y-2">
                {risk.map((r) => (
                  <div key={r.label} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-[10px] text-ink-soft">
                      {r.label}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-sunken">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
