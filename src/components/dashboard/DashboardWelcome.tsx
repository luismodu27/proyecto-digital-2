import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/Button";
import { seedSampleData } from "@/lib/data/actions";

/** Los tres movimientos del recorrido de gobernanza, en orden. */
const JOURNEY = [
  {
    title: "Inventaría",
    body: "Registra cada sistema de IA en uso: quién lo opera, qué proveedor y para qué.",
    icon: (
      <path
        d="M4 7h16M4 12h16M4 17h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Clasifica el riesgo",
    body: "El asistente del EU AI Act y marcos de EE. UU. sitúan cada sistema en su nivel.",
    icon: (
      <path
        d="M12 3 3 7v5c0 4.5 3.6 8 9 9 5.4-1 9-4.5 9-9V7l-9-4Zm-3 9 2.4 2.5L16 8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Prepara la evidencia",
    body: "Detecta brechas, sigue un plan y genera dossier e informe listos para auditoría.",
    icon: (
      <path
        d="M7 3.5h6L17.5 8v11a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Zm6 0V8h4.5M8.5 12h6M8.5 15.5h4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

/**
 * Estado de bienvenida cálido para una cuenta sin sistemas todavía. Sustituye a
 * los widgets vacíos del resumen (distribución en cero, "requieren atención")
 * por un saludo, la misión y dos caminos claros: registrar el primer sistema o
 * explorar con datos de ejemplo.
 */
export function DashboardWelcome({
  name,
  orgName,
  canSeed,
  deadline,
}: {
  name?: string | null;
  orgName?: string | null;
  canSeed: boolean;
  deadline?: { title: string; days: number } | null;
}) {
  const greeting = name ? `Te damos la bienvenida, ${name}` : "Te damos la bienvenida a Attesta";

  return (
    <section className="overflow-hidden rounded-2xl border border-brand/30 bg-brand-soft/40">
      <div className="relative px-6 py-8 sm:px-8 sm:py-10">
        {/* Halo decorativo sutil */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-brand/10 blur-3xl"
        />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-paper-raised px-3 py-0.5 text-xs font-medium text-brand-strong">
            <span className="size-1.5 rounded-full bg-brand" />
            Empecemos
          </span>

          <h2 className="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {greeting}.
          </h2>
          <p className="mt-2 text-sm text-ink-soft sm:text-base">
            {orgName ? (
              <>
                Aquí construyes el sistema de registro de la gobernanza de IA de{" "}
                <span className="font-medium text-ink">{orgName}</span>: inventario,
                clasificación de riesgo y evidencia lista para auditoría.
              </>
            ) : (
              <>
                Aquí construyes el sistema de registro de tu gobernanza de IA:
                inventario, clasificación de riesgo y evidencia lista para auditoría.
              </>
            )}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/dashboard/inventario/nuevo" variant="primary">
              + Registrar tu primer sistema
            </ButtonLink>
            {canSeed && (
              <form action={seedSampleData}>
                <Button type="submit" variant="outline">
                  Explorar con datos de ejemplo
                </Button>
              </form>
            )}
          </div>
          {canSeed && (
            <p className="mt-2 text-xs text-muted">
              Los datos de ejemplo cargan un inventario realista para que veas el
              dossier, las brechas y la vigilancia antes de introducir los tuyos.
            </p>
          )}
        </div>

        {/* Recorrido en tres pasos */}
        <ol className="relative mt-8 grid gap-4 sm:grid-cols-3">
          {JOURNEY.map((step, i) => (
            <li
              key={step.title}
              className="rounded-xl border border-line bg-paper-raised p-5"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-strong">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
                    {step.icon}
                  </svg>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Paso {i + 1}
                </span>
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>

        {deadline && deadline.days > 0 && (
          <Link
            href="/dashboard/vigilancia"
            className="group mt-6 inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-4 text-brand" fill="none" aria-hidden>
              <path
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Próximo hito regulatorio:{" "}
            <span className="font-medium text-ink">{deadline.title}</span>
            <span className="text-muted">· en {deadline.days} días</span>
            <span className="text-brand transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
