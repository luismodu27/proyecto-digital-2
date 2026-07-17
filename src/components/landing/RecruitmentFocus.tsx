import { RiskBadge } from "@/components/ui/RiskBadge";
import { Reveal } from "@/components/ui/Reveal";
import type { RiskLevel } from "@/lib/mock-data";

const cases: { name: string; body: string; risk: RiskLevel }[] = [
  {
    name: "Cribado y ranking de CVs",
    body: "Filtra o prioriza candidatos y decide quién avanza en el proceso.",
    risk: "high",
  },
  {
    name: "Entrevistas por vídeo con IA",
    body: "Analiza respuestas, voz o expresiones para evaluar a la persona.",
    risk: "high",
  },
  {
    name: "Scoring de candidatos",
    body: "Puntúa la idoneidad para el puesto a partir de datos del perfil.",
    risk: "high",
  },
  {
    name: "Tests psicométricos automatizados",
    body: "Evalúa aptitudes o personalidad con corrección automática.",
    risk: "high",
  },
  {
    name: "Chatbots de selección",
    body: "Interactúan con candidatos: obligación de transparencia.",
    risk: "limited",
  },
  {
    name: "Agenda y logística de entrevistas",
    body: "Coordina sin decidir sobre las personas.",
    risk: "minimal",
  },
];

export function RecruitmentFocus() {
  return (
    <section className="border-y border-line bg-paper-sunken/40">
      <div className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
            Hecho para RRHH
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            ¿Usas IA para contratar? Estás en el alcance.
          </h2>
          <p className="mt-4 text-lg text-ink-soft">
            El EU AI Act clasifica la IA de empleo y selección de personal como{" "}
            <span className="font-medium text-ink">alto riesgo</span> (Anexo III).
            Attesta te dice exactamente qué tienes y qué te falta.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal key={c.name} delay={i * 70}>
              <article className="card-lift flex h-full flex-col rounded-2xl border border-line bg-paper-raised p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {c.name}
                  </h3>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {c.body}
                </p>
                <div className="mt-4">
                  <RiskBadge level={c.risk} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-xs text-muted">
          Clasificación orientativa según los criterios del EU AI Act. Attesta
          ofrece autoevaluación y gestión de evidencia, no asesoría legal.
        </p>
      </div>
    </section>
  );
}
