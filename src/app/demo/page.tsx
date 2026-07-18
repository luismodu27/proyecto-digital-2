import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { SealMark } from "@/components/ui/SealMark";
import { ButtonLink } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Meter } from "@/components/dashboard/parts";
import { RiskDonut } from "@/components/dashboard/RiskDonut";
import { AI_SYSTEMS, riskCounts, avgCompliance } from "@/lib/mock-data";

export const metadata = {
  title: "Demo · Attesta",
  description:
    "Una muestra de Attesta con datos de ejemplo: inventario y clasificación de riesgo de IA.",
};

/** Tarjeta de función bloqueada: muestra el titular y un candado con CTA. */
function LockedCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-paper-raised">
      {/* Vista previa difuminada */}
      <div
        className="pointer-events-none select-none p-6 opacity-60 blur-[3px]"
        aria-hidden
      >
        {children}
      </div>
      {/* Capa de bloqueo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper-raised/70 p-6 text-center backdrop-blur-[2px]">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
            <path
              d="M6 10V8a6 6 0 1112 0v2m-9 0h6a3 3 0 013 3v5a3 3 0 01-3 3H9a3 3 0 01-3-3v-5a3 3 0 013-3Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="font-display text-base font-semibold text-ink">{title}</p>
        <p className="max-w-xs text-xs text-ink-soft">{description}</p>
        <Link
          href="/login"
          className="mt-1 text-xs font-semibold text-brand hover:text-brand-strong"
        >
          Regístrate para desbloquear →
        </Link>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const systems = AI_SYSTEMS;
  const counts = riskCounts(systems);
  const avg = avgCompliance(systems);
  const high = counts.high + counts.unacceptable;
  const shown = systems.slice(0, 5);

  return (
    <div className="min-h-dvh bg-paper">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block"
            >
              ← Volver al sitio
            </Link>
            <ButtonLink href="/login" className="px-4 py-2 text-sm">
              Crear cuenta
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="container-page py-8">
        {/* Aviso de muestra */}
        <div className="flex flex-col gap-3 rounded-2xl border border-brand/30 bg-brand-soft/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <SealMark size={22} className="mt-0.5 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-semibold text-ink">
                Estás viendo una muestra con datos de ejemplo.
              </p>
              <p className="text-sm text-ink-soft">
                Inventario y clasificación de riesgo, abiertos. El resto se
                desbloquea al crear tu cuenta y usar tus propios datos.
              </p>
            </div>
          </div>
          <ButtonLink href="/login" className="shrink-0 px-5 py-2 text-sm">
            Empezar gratis
          </ButtonLink>
        </div>

        {/* KPIs */}
        <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { k: "Sistemas de IA", v: String(systems.length), hint: "en inventario" },
            { k: "Alto riesgo", v: String(high), hint: "obligaciones estrictas" },
            { k: "Preparación media", v: `${avg}%`, hint: "% listo (muestra)" },
            { k: "Marco", v: "EU AI Act", hint: "+ marcos de EE. UU." },
          ].map((c) => (
            <div key={c.k} className="rounded-2xl border border-line bg-paper-raised p-5">
              <p className="font-display text-2xl font-semibold text-ink">{c.v}</p>
              <p className="mt-1 text-xs font-medium text-ink">{c.k}</p>
              <p className="text-xs text-muted">{c.hint}</p>
            </div>
          ))}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Inventario (abierto) */}
          <section className="rounded-2xl border border-line bg-paper-raised p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">
                Inventario de IA
              </h2>
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong">
                Muestra
              </span>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {shown.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-muted">
                      {s.owner} · {s.domain}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden w-24 sm:block">
                      <Meter value={s.compliance} />
                    </div>
                    <RiskBadge level={s.risk} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Riesgo (abierto) */}
          <section className="rounded-2xl border border-line bg-paper-raised p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              Distribución de riesgo
            </h2>
            <div className="mt-6">
              <RiskDonut counts={counts} />
            </div>
          </section>
        </div>

        {/* Funciones bloqueadas */}
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">
              Con tu cuenta desbloqueas
            </h2>
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <LockedCard
              title="Gap assessment"
              description="Mide tu «% listo» frente a cada obligación y detecta brechas."
            >
              <p className="text-sm font-medium text-ink">Preparación para auditoría</p>
              <p className="mt-2 font-display text-3xl font-semibold text-ink">78%</p>
              <div className="mt-2 h-2 rounded-full bg-paper-sunken">
                <div className="h-full w-3/4 rounded-full bg-brand" />
              </div>
            </LockedCard>
            <LockedCard
              title="Plan de acción"
              description="Convierte las brechas en tareas con responsables y fechas."
            >
              <p className="text-sm font-medium text-ink">Tareas abiertas</p>
              <div className="mt-3 space-y-2">
                <div className="h-6 rounded-md bg-paper-sunken" />
                <div className="h-6 rounded-md bg-paper-sunken" />
                <div className="h-6 w-2/3 rounded-md bg-paper-sunken" />
              </div>
            </LockedCard>
            <LockedCard
              title="Vigilancia regulatoria"
              description="Radar de fuentes oficiales que te avisa de cada cambio y plazo."
            >
              <p className="text-sm font-medium text-ink">Próximo hito</p>
              <p className="mt-2 text-sm text-ink-soft">Transparencia (Art. 50)</p>
              <p className="mt-2 font-display text-2xl font-semibold text-brand-strong">
                en 16 días
              </p>
            </LockedCard>
            <LockedCard
              title="Dossier e informe (PDF)"
              description="Evidencia lista para el auditor, generada con un clic."
            >
              <p className="text-sm font-medium text-ink">Dossier.pdf</p>
              <div className="mt-3 space-y-1.5">
                <div className="h-2 rounded bg-paper-sunken" />
                <div className="h-2 rounded bg-paper-sunken" />
                <div className="h-2 w-4/5 rounded bg-paper-sunken" />
                <div className="h-2 w-3/5 rounded bg-paper-sunken" />
              </div>
            </LockedCard>
          </div>
        </div>

        {/* CTA final */}
        <section className="mt-10 rounded-3xl border border-line-strong bg-paper-raised px-6 py-10 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Úsalo con tus propios sistemas de IA.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">
            Crea tu cuenta gratis: inventaría tu IA y obtén su clasificación de
            riesgo hoy mismo. Desbloquea la preparación completa cuando quieras.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/login" className="px-6 py-3">
              Crear cuenta gratis
            </ButtonLink>
            <ButtonLink href="/#precios" variant="outline" className="px-6 py-3">
              Ver planes
            </ButtonLink>
          </div>
        </section>
      </main>
    </div>
  );
}
