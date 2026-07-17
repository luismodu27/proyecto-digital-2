const sectors = ["RRHH", "Crédito", "Seguros", "Salud", "EdTech", "Servicios públicos"];

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-paper-raised/60">
      <div className="container-page py-8">
        <p className="text-center text-xs uppercase tracking-[0.18em] text-muted">
          Para equipos de Riesgo, Legal, Compliance y Data que despliegan IA en
          decisiones que importan
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {sectors.map((s) => (
            <span
              key={s}
              className="font-display text-lg font-semibold text-ink/35 transition-colors hover:text-ink/60"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
