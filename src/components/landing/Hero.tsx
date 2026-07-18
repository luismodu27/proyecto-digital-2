import { ButtonLink } from "@/components/ui/Button";
import { HeroPreview } from "./HeroPreview";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-paper opacity-50" aria-hidden />
      <div
        className="absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full bg-brand-soft blur-3xl opacity-50"
        aria-hidden
      />
      <div
        className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-seal-soft blur-3xl opacity-40"
        aria-hidden
      />

      <div className="container-page relative grid items-center gap-14 py-20 md:py-28 lg:grid-cols-[1.05fr_1fr]">
        {/* Mensaje */}
        <div className="reveal is-visible text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-raised px-3 py-1 text-xs font-medium text-ink-soft">
            <span className="size-1.5 rounded-full bg-brand" />
            Gobernanza de IA para Recursos Humanos · EU AI Act
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Contrata con IA
            <br />
            <span className="text-brand">sin miedo a la auditoría.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft lg:mx-0">
            La IA que usas para contratar —cribado de CVs, entrevistas, scoring de
            candidatos— es de <span className="font-medium text-ink">alto riesgo</span>{" "}
            bajo el EU AI Act. Attesta la inventaría, clasifica su riesgo, genera tu
            evidencia y vigila los cambios normativos. Sin necesitar un equipo GRC.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <ButtonLink href="#waitlist" variant="primary" className="px-6 py-3">
              Solicitar acceso anticipado
            </ButtonLink>
            <ButtonLink href="/demo" variant="outline" className="px-6 py-3">
              Explorar la demo
            </ButtonLink>
          </div>

          <p className="mt-4 text-xs text-muted">
            El 78% de las empresas aún no ha empezado. Tú puedes ir por delante.
          </p>
        </div>

        {/* Mockup */}
        <div className="reveal is-visible [transition-delay:120ms]">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
