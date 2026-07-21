/**
 * Sección "Cero alucinaciones" — convierte la restricción determinista (contenido
 * legal sin LLM) en el diferenciador frente a la ola de "compliance con IA
 * generativa" que un responsable Legal desconfía por definición. Copy seguro
 * (verbos de la organización, sin términos prohibidos, sin nombrar a un experto).
 */

const pillars = [
  {
    title: "Contenido legal determinista",
    body: "Ninguna clasificación de riesgo ni texto regulatorio lo redacta un modelo generativo. Se ensambla con reglas y con el texto verificado del EU AI Act sobre tus datos reales. Un texto legal inventado sería un pasivo; aquí no existe.",
    icon: "M12 3l7 4v5c0 4.4-3 8.3-7 9-4-0.7-7-4.6-7-9V7l7-4Zm-2.5 8.5 2 2 4-4",
  },
  {
    title: "Contrastado con criterio experto",
    body: "El contenido regulatorio se contrasta con criterio experto en el EU AI Act (artículos, plazos y el reparto de obligaciones entre proveedor y deployer) antes de publicarse, y se actualiza cuando la norma cambia.",
    icon: "M9 11l3 3 8-8M4 12a8 8 0 108-8",
  },
  {
    title: "Evidencia verificable",
    body: "Cada registro queda encadenado con una huella SHA-256: cualquier alteración posterior es detectable. La evidencia que presentas al auditor es trazable, no una captura sin respaldo.",
    icon: "M7 3h7l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1Zm7 0v4h4M9 13h6M9 16h4",
  },
];

export function Honestidad() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
          Por qué puedes confiar
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Cero alucinaciones. Por diseño.
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          Cada línea de tu evidencia sale de tus datos y del texto del EU AI Act
          verificado por un humano — no de un modelo generativo. Es lo contrario de
          «compliance con IA»: aquí la IA no escribe tu derecho.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {pillars.map((p) => (
          <article
            key={p.title}
            className="flex flex-col rounded-2xl border border-line bg-paper-raised p-7"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
                <path
                  d={p.icon}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">
              {p.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
