const faqs = [
  {
    q: "¿Attesta certifica mi cumplimiento del EU AI Act?",
    a: "No. Attesta es una herramienta de autoevaluación y preparación para auditoría: organiza tu inventario, tu clasificación de riesgo y tu evidencia. La certificación de conformidad, cuando procede, solo la emiten organismos notificados acreditados. No prestamos asesoría legal.",
  },
  {
    q: "¿La IA que filtra o puntúa candidatos es de alto riesgo?",
    a: "Sí. La IA usada para selección de personal (cribado de CVs, ranking, entrevistas por vídeo, tests) entra en el Anexo III (empleo) del EU AI Act como alto riesgo. Eso implica obligaciones de supervisión humana, control de sesgo y evidencia — justo lo que Attesta organiza por ti.",
  },
  {
    q: "Usamos IA de terceros, no la desarrollamos. ¿Nos sirve?",
    a: "Sí — de hecho ese es nuestro foco. Como responsable del despliegue (deployer) tienes obligaciones propias (uso conforme, supervisión humana, conservación de logs, en ciertos casos una evaluación de impacto). Attesta te ayuda a cumplirlas y a demostrarlo con evidencia.",
  },
  {
    q: "El deadline se aplazó a 2027, ¿para qué empezar ahora?",
    a: "Justo por eso: tienes más ventana para prepararte bien, sin prisas ni consultores caros de última hora. La obligación sigue siendo inevitable; adelantarte es más barato y menos arriesgado.",
  },
  {
    q: "¿Necesito un equipo de compliance para usarlo?",
    a: "No. Attesta está pensado para el mid-market sin equipo GRC: cuestionarios guiados, recomendaciones priorizadas y evidencia lista para auditoría, en un lenguaje claro.",
  },
  {
    q: "¿Cómo protegen nuestros datos?",
    a: "Cada organización está aislada de las demás (multi-tenant con control de acceso a nivel de fila) y todos los cambios quedan en un registro de auditoría inmutable.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-line bg-paper-sunken/40">
      <div className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
            Preguntas frecuentes
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Lo que sueles querer saber.
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-line rounded-2xl border border-line bg-paper-raised">
          {faqs.map((f) => (
            <details key={f.q} className="group px-6 [&_svg]:open:rotate-45">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-ink transition-colors hover:text-brand-strong">
                {f.q}
                <svg
                  viewBox="0 0 20 20"
                  className="size-5 shrink-0 text-muted transition-transform duration-300"
                  aria-hidden
                >
                  <path
                    d="M10 4v12M4 10h12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <p className="grid grid-rows-[0fr] pb-0 text-sm leading-relaxed text-ink-soft transition-all duration-300 group-open:grid-rows-[1fr] group-open:pb-5">
                <span className="overflow-hidden">{f.a}</span>
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
