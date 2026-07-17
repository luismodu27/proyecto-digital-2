const stats = [
  {
    value: "78%",
    label: "de las organizaciones no ha dado pasos significativos hacia el cumplimiento del AI Act.",
  },
  {
    value: "83%",
    label: "no tiene un inventario formal de sus sistemas de IA.",
  },
  {
    value: "€35M",
    label: "o el 7% de la facturación: multas más duras que el GDPR.",
  },
  {
    value: "$500/h",
    label: "es lo que hoy cuesta resolverlo con consultores y hojas de cálculo.",
  },
];

export function ProblemStats() {
  return (
    <section className="border-y border-line bg-paper-sunken/60">
      <div className="container-page py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
            El problema
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            La regulación llegó. La mayoría no está lista.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            Miles de empresas medianas usan IA en decisiones que afectan a
            personas —contratación, crédito, seguros, salud— y de repente están
            en el punto de mira regulatorio, sin equipo de compliance.
          </p>
        </div>

        <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.value} className="bg-paper-raised p-6">
              <dt className="font-display text-4xl font-semibold text-ink">
                {s.value}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
