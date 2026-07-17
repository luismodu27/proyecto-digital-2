const milestones = [
  {
    date: "Ago 2026",
    title: "Obligaciones de alto riesgo",
    body: "Entran en vigor las obligaciones para sistemas de alto riesgo del EU AI Act.",
  },
  {
    date: "2026 →",
    title: "Leyes estatales en EE.UU.",
    body: "Se suman regulaciones de IA a nivel estatal. La superficie regulatoria crece.",
  },
  {
    date: "Dic 2027",
    title: "Posible aplazamiento (Omnibus)",
    body: "Una propuesta podría ampliar el plazo. No desaparece la obligación: da más tiempo para construir bien.",
  },
];

export function WhyNow() {
  return (
    <section
      id="por-que-ahora"
      className="relative overflow-hidden bg-ink text-paper"
    >
      <div className="container-page py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand-bright">
              Por qué ahora
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Una obligación inevitable, con una ventana para adelantarse.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-paper/70">
              El mercado de software de gobernanza de IA pasará de{" "}
              <span className="text-paper">$492M en 2026</span> a{" "}
              <span className="text-paper">$15.8B en 2030</span> (~30–36% CAGR).
              Quien se convierta hoy en el sistema de registro de la gobernanza,
              se queda.
            </p>
          </div>

          <ol className="relative space-y-8 border-l border-paper/15 pl-8">
            {milestones.map((m) => (
              <li key={m.title} className="relative">
                <span className="absolute -left-[2.6rem] top-1 flex size-5 items-center justify-center rounded-full border border-brand-bright/50 bg-ink">
                  <span className="size-2 rounded-full bg-brand-bright" />
                </span>
                <p className="font-mono text-xs uppercase tracking-widest text-brand-bright">
                  {m.date}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold text-paper">
                  {m.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-paper/65">
                  {m.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
