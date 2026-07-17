const modules = [
  {
    step: "01",
    title: "Inventario de sistemas de IA",
    body: "Un catálogo vivo de cada modelo y sistema en uso: quién lo opera, qué datos toca y para qué decisión se usa. El 83% no lo tiene; tú sí.",
    points: ["Descubrimiento guiado", "Propietario y proveedor", "Estado siempre al día"],
  },
  {
    step: "02",
    title: "Clasificación de riesgo",
    body: "Un asistente clasifica cada sistema según el EU AI Act —inaceptable, alto, limitado o mínimo— y te dice exactamente qué obligaciones aplican.",
    points: ["Mapeo a artículos", "Marcos: AI Act, ISO 42001", "Explicable y defendible"],
  },
  {
    step: "03",
    title: "Gap assessment + evidencia",
    body: "Qué te falta para cumplir, con plan de remediación, y evidencia exportable a PDF lista para presentar ante un auditor.",
    points: ["Brechas priorizadas", "Informe exportable", "Audit-trail íntegro"],
  },
];

export function Modules() {
  return (
    <section id="producto" className="container-page py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
          El producto
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          El sistema de registro de tu gobernanza de IA.
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          Tres piezas que trabajan juntas y se mantienen actualizadas solas.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {modules.map((m) => (
          <article
            key={m.step}
            className="group flex flex-col rounded-2xl border border-line bg-paper-raised p-7 transition-colors hover:border-line-strong"
          >
            <span className="font-mono text-sm text-seal">{m.step}</span>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">
              {m.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
              {m.body}
            </p>
            <ul className="mt-5 space-y-2 border-t border-line pt-5">
              {m.points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-ink">
                  <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-brand" aria-hidden>
                    <path
                      d="m3.5 8.5 3 3 6-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
