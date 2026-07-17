const steps = [
  {
    n: "1",
    title: "Conecta e inventaría",
    body: "Importa o descubre tus sistemas de IA en minutos. Attesta construye el inventario contigo.",
  },
  {
    n: "2",
    title: "Clasifica el riesgo",
    body: "Responde un cuestionario guiado y obtén la clasificación de riesgo y las obligaciones aplicables.",
  },
  {
    n: "3",
    title: "Cierra brechas",
    body: "Recibe un gap assessment priorizado con plan de remediación y responsables.",
  },
  {
    n: "4",
    title: "Demuestra cumplimiento",
    body: "Exporta evidencia lista para auditoría y mantén el trail actualizado de forma continua.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="container-page py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
          Cómo funciona
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          De cero a auditable en cuatro pasos.
        </h2>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="relative rounded-2xl border border-line bg-paper-raised p-6">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft font-display text-lg font-semibold text-brand-strong">
              {s.n}
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
