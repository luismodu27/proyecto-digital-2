const CAPS = [
  {
    title: "Vigilancia regulatoria",
    body: "Un radar de plazos y cambios del EU AI Act, mapeados a tus sistemas: sabes qué te afecta y cuándo, antes de que llegue. Cuando la ley cambia, tú ya lo sabes.",
    icon: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
  {
    title: "Dossier e informes automáticos",
    body: "Genera en un clic el dossier de gobernanza de cada sistema y el informe ejecutivo de la organización, listos para el auditor o la dirección. Como tener un consultor dentro.",
    icon: "M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1Zm7 0v4h4M9 12h6M9 16h4",
  },
  {
    title: "Registro inmutable",
    body: "Cada cambio queda grabado por la base de datos —quién hizo qué y cuándo— sin poder editarlo ni borrarlo. Evidencia defendible de verdad, no una hoja de cálculo.",
    icon: "M7 10V7a5 5 0 0110 0v3m-11 0h12a1 1 0 011 1v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7a1 1 0 011-1Z",
  },
  {
    title: "Tu equipo, con roles",
    body: "RRHH, Legal y auditoría trabajando en el mismo sitio, con permisos por rol y aislamiento por organización. Invita a quien necesites en segundos.",
    icon: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M13 7a4 4 0 11-8 0 4 4 0 018 0M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  },
];

export function Platform() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
          El foso
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Gobernanza continua, no la foto de un día.
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          Un checklist caduca en cuanto lo cierras. Attesta se mantiene vivo:
          vigila la norma, genera la documentación y guarda la evidencia por ti.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {CAPS.map((c) => (
          <article
            key={c.title}
            className="group flex gap-5 rounded-2xl border border-line bg-paper-raised p-7 transition-colors hover:border-line-strong"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
              <svg viewBox="0 0 24 24" className="size-5.5" fill="none" aria-hidden>
                <path
                  d={c.icon}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
