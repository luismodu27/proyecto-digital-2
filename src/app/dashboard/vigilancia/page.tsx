import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { LegalNote, LEGAL_FOOTER } from "@/components/ui/LegalNote";
import { EventStatusControl } from "@/components/dashboard/EventStatusControl";
import {
  getAiSystems,
  getRegulatoryAcks,
  getCurrentMemberRole,
  isSupabaseConfigured,
} from "@/lib/data";
import {
  REG_ACK_LABEL,
  type RegAck,
  type RegAckStatus,
} from "@/lib/mock-data";
import {
  REGULATORY_EVENTS,
  REG_KIND_LABEL,
  FRAMEWORK_LABEL,
  affectedSystems,
  daysUntil,
  upcomingDeadlines,
  type RegKind,
  type RegulatoryEvent,
} from "@/lib/regulatory-watch";

// El radar depende de la fecha actual: nunca prerenderizar el countdown.
export const dynamic = "force-dynamic";

const TONE_PILL: Record<string, string> = {
  danger:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  warn: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  gold: "bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)] border-[var(--tone-gold-bd)]",
  good: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  info: "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
  neutral:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

const KIND_TONE: Record<RegKind, keyof typeof TONE_PILL> = {
  deadline: "warn",
  guidance: "info",
  standard: "neutral",
  amendment: "gold",
  enforcement: "danger",
};

const ACK_TONE: Record<RegAckStatus, keyof typeof TONE_PILL> = {
  reviewed: "good",
  planned: "info",
  not_applicable: "neutral",
};

function AckPill({ status }: { status: RegAckStatus }) {
  return <Pill tone={ACK_TONE[status]}>{REG_ACK_LABEL[status]}</Pill>;
}

/** Tono del countdown según cercanía. */
function countdownTone(days: number): keyof typeof TONE_PILL {
  if (days < 0) return "neutral";
  if (days <= 45) return "danger";
  if (days <= 365) return "warn";
  return "info";
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Etiqueta de tiempo relativa: "en 16 días", "hoy", "hace 3 meses". */
function relativeLabel(days: number): string {
  if (days === 0) return "hoy";
  if (days > 0) {
    if (days === 1) return "mañana";
    if (days < 45) return `en ${days} días`;
    const months = Math.round(days / 30);
    if (months < 24) return `en ${months} meses`;
    return `en ${Math.round(days / 365)} años`;
  }
  const abs = Math.abs(days);
  if (abs === 1) return "ayer";
  if (abs < 45) return `hace ${abs} días`;
  const months = Math.round(abs / 30);
  if (months < 24) return `hace ${months} meses`;
  return `hace ${Math.round(abs / 365)} años`;
}

function Pill({
  tone,
  children,
}: {
  tone: keyof typeof TONE_PILL;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_PILL[tone]}`}
    >
      {children}
    </span>
  );
}

export default async function VigilanciaPage() {
  const [systems, acks, role] = await Promise.all([
    getAiSystems(),
    getRegulatoryAcks(),
    getCurrentMemberRole(),
  ]);
  const now = new Date();
  const canManage =
    isSupabaseConfigured && (role === "owner" || role === "admin");

  const withDays = REGULATORY_EVENTS.map((e) => ({
    ev: e,
    days: daysUntil(e.date, now),
    affected: affectedSystems(e, systems),
  }));

  // Feed: primero los próximos (del más cercano), luego los pasados (más reciente primero).
  const upcoming = withDays
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days);
  const past = withDays.filter((x) => x.days < 0).sort((a, b) => b.days - a.days);
  const feed = [...upcoming, ...past];

  const deadlines = upcomingDeadlines(now);
  const hero = deadlines[0];
  const heroAffected = hero ? affectedSystems(hero, systems) : [];
  const heroDays = hero ? daysUntil(hero.date, now) : 0;
  const heroAck = hero ? acks[hero.id] : undefined;
  const otherDeadlines = deadlines.slice(1);

  return (
    <>
      <PageHeader
        title="Vigilancia regulatoria"
        subtitle="Radar de plazos y cambios normativos que afectan a tus sistemas de IA."
      />

      {/* Hero: próximo plazo */}
      {hero && (
        <section className="mb-8 overflow-hidden rounded-2xl border border-line bg-paper-raised">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={countdownTone(heroDays)}>Próximo plazo</Pill>
                <span className="text-xs text-muted">
                  {FRAMEWORK_LABEL[hero.framework]}
                </span>
                {heroAck && <AckPill status={heroAck.status} />}
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">
                {hero.title}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {formatDate(hero.date)} ·{" "}
                {heroAffected.length > 0 ? (
                  <span className="font-medium text-ink">
                    afecta a {heroAffected.length}{" "}
                    {heroAffected.length === 1 ? "sistema" : "sistemas"} de tu
                    inventario
                  </span>
                ) : (
                  "sin sistemas afectados en tu inventario"
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <div className="text-center">
                <p className="font-display text-3xl font-semibold tabular-nums text-ink">
                  {heroDays}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  {heroDays === 1 ? "día" : "días"}
                </p>
              </div>
              <Link
                href="/dashboard/inventario"
                className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
              >
                Ver sistemas →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Otros próximos plazos */}
      {otherDeadlines.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Más plazos por venir
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherDeadlines.map((e) => {
              const d = daysUntil(e.date, now);
              const n = affectedSystems(e, systems).length;
              const ack = acks[e.id];
              return (
                <div
                  key={e.id}
                  className="card-lift rounded-2xl border border-line bg-paper-raised p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Pill tone={countdownTone(d)}>{relativeLabel(d)}</Pill>
                    <span className="text-xs tabular-nums text-muted">
                      {formatDate(e.date)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink">{e.title}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted">
                      {n} {n === 1 ? "sistema afectado" : "sistemas afectados"}
                    </p>
                    {ack && <AckPill status={ack.status} />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Cronología completa */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Cronología regulatoria · EU AI Act
        </h3>
        <div className="space-y-3">
          {feed.map(({ ev, days, affected }) => (
            <EventRow
              key={ev.id}
              ev={ev}
              days={days}
              affectedCount={affected.length}
              affected={affected}
              ack={acks[ev.id]}
              canManage={canManage}
            />
          ))}
        </div>
      </section>

      <LegalNote text={LEGAL_FOOTER} className="mt-8" />
    </>
  );
}

function EventRow({
  ev,
  days,
  affectedCount,
  affected,
  ack,
  canManage,
}: {
  ev: RegulatoryEvent;
  days: number;
  affectedCount: number;
  affected: { id: string; name: string }[];
  ack?: RegAck;
  canManage: boolean;
}) {
  const upcoming = days >= 0;
  return (
    <details className="group rounded-2xl border border-line bg-paper-raised open:shadow-[0_18px_44px_-30px_rgba(15,26,20,0.45)]">
      <summary className="flex cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div className="mt-0.5 flex w-24 shrink-0 flex-col items-start gap-1">
          <span className="text-xs font-medium tabular-nums text-ink-soft">
            {relativeLabel(days)}
          </span>
          <span className="text-[11px] tabular-nums text-muted">
            {formatDate(ev.date).replace(/ de \d{4}$/, (m) => m)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={KIND_TONE[ev.kind]}>{REG_KIND_LABEL[ev.kind]}</Pill>
            {upcoming ? (
              <span className="text-[11px] font-medium text-muted">por venir</span>
            ) : (
              <span className="text-[11px] font-medium text-muted">en vigor</span>
            )}
            {ack && <AckPill status={ack.status} />}
          </div>
          <p className="mt-1.5 font-medium text-ink">{ev.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {affectedCount > 0
              ? `Afecta a ${affectedCount} ${affectedCount === 1 ? "sistema" : "sistemas"} de tu inventario`
              : "Sin sistemas afectados en tu inventario"}
          </p>
        </div>
        <svg
          viewBox="0 0 20 20"
          className="mt-1 size-4 shrink-0 text-muted transition-transform group-open:rotate-180"
          fill="none"
          aria-hidden
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>

      <div className="border-t border-line px-5 pb-5 pt-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Detail label="Qué es">{ev.summary}</Detail>
          <Detail label="Qué significa para ti">{ev.impact}</Detail>
          <Detail label="Qué hacer">{ev.action}</Detail>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {ev.articles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {ev.articles.map((a) => (
                <span
                  key={a}
                  className="rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-[11px] text-seal"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
          <a
            href={ev.source.url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-strong"
          >
            {ev.source.label}
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
              <path
                d="M6 3h7v7M13 3 3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-4">
          <p className="text-[11px] uppercase tracking-wide text-muted">
            Estado interno
          </p>
          {canManage ? (
            <EventStatusControl eventId={ev.id} status={ack?.status} />
          ) : ack ? (
            <AckPill status={ack.status} />
          ) : (
            <span className="text-xs text-muted">Sin marcar</span>
          )}
          {ack?.note && (
            <span className="text-xs text-ink-soft">· {ack.note}</span>
          )}
        </div>

        {affected.length > 0 && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              Sistemas afectados
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {affected.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full border border-line bg-paper px-2.5 py-0.5 text-xs text-ink-soft"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}
