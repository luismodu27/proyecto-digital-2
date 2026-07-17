import { ButtonLink } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-paper opacity-60" aria-hidden />
      <div
        className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-brand-soft blur-3xl opacity-50"
        aria-hidden
      />
      <div className="container-page relative py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-raised px-3 py-1 text-xs font-medium text-ink-soft">
            <span className="size-1.5 rounded-full bg-brand" />
            EU AI Act · ISO 42001 · NIST AI RMF
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Gobierna tu IA
            <br />
            <span className="text-brand">antes que la auditoría.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Attesta inventaría tus sistemas de IA, clasifica su riesgo según el
            EU AI Act y genera evidencia lista para auditoría — de forma
            continua. Compliance de IA de nivel enterprise, sin necesitar un
            equipo GRC.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="#waitlist" variant="primary" className="px-6 py-3">
              Solicitar acceso anticipado
            </ButtonLink>
            <ButtonLink href="/dashboard" variant="outline" className="px-6 py-3">
              Explorar la demo
            </ButtonLink>
          </div>

          <p className="mt-4 text-xs text-muted">
            El 78% de las empresas aún no ha empezado. Tú puedes ir por delante.
          </p>
        </div>

        {/* Tarjeta-sello ilustrativa */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-line-strong bg-paper-raised p-2 shadow-[0_24px_60px_-32px_rgba(15,26,20,0.35)]">
            <div className="rounded-xl border border-line bg-gradient-to-b from-paper-raised to-paper-sunken px-6 py-8 sm:px-10 sm:py-10">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    Certificado de gobernanza
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-ink">
                    Inventario · Riesgo · Evidencia
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Estado de cumplimiento actualizado en tiempo real.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-[#bfdccf] bg-brand-soft px-4 py-3">
                  <SealMark size={40} className="text-brand" />
                  <div>
                    <p className="font-display text-xl font-semibold text-brand-strong">
                      Auditable
                    </p>
                    <p className="text-xs text-brand">trail íntegro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
