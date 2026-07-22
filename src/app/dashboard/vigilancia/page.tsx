import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { LegalNote, LEGAL_FOOTER_BY_LOCALE } from "@/components/ui/LegalNote";
import { EventStatusControl } from "@/components/dashboard/EventStatusControl";
import {
  getAiSystems,
  getRegulatoryAcks,
  getRegulatoryEvents,
  getCurrentMemberRole,
  getIsPlatformAdmin,
  getOrgJurisdictions,
  isSupabaseConfigured,
} from "@/lib/data";
import { JurisdictionSettings } from "@/components/dashboard/JurisdictionSettings";
import {
  regAckLabel,
  type RegAck,
  type RegAckStatus,
} from "@/lib/mock-data";
import {
  regKindLabel,
  FRAMEWORK_META,
  JURISDICTION_ORDER,
  JURISDICTION_LABEL_BY_LOCALE,
  frameworkLabel,
  frameworkMeta,
  affectedSystems,
  daysUntil,
  upcomingDeadlines,
  type RegKind,
  type RegJurisdiction,
  type RegulatoryEvent,
} from "@/lib/regulatory-watch";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

type MonitoringDict = ReturnType<
  typeof getDictionary
>["dashboard"]["pages"]["monitoring"];
type UnitsDict = ReturnType<typeof getDictionary>["dashboard"]["units"];

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

function AckPill({
  status,
  locale,
}: {
  status: RegAckStatus;
  locale: Locale;
}) {
  return <Pill tone={ACK_TONE[status]}>{regAckLabel(status, locale)}</Pill>;
}

/** Pill sutil con el marco/jurisdicción de un evento. */
function FrameworkPill({
  framework,
  locale,
}: {
  framework: string;
  locale: Locale;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft">
      {frameworkMeta(framework, locale)?.short ?? framework}
    </span>
  );
}

/** Chip de filtro por jurisdicción. `inNexus` marca las del nexo de la org. */
function JurisdictionChip({
  label,
  href,
  active,
  inNexus = false,
  nexusAria,
}: {
  label: string;
  href: string;
  active: boolean;
  inNexus?: boolean;
  nexusAria: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-brand bg-brand-soft text-brand-strong"
          : "border-line-strong text-ink-soft hover:bg-paper-sunken"
      }`}
    >
      {inNexus && (
        <span className="size-1.5 rounded-full bg-brand" aria-label={nexusAria} />
      )}
      {label}
    </Link>
  );
}

/** Tono del countdown según cercanía. */
function countdownTone(days: number): keyof typeof TONE_PILL {
  if (days < 0) return "neutral";
  if (days <= 45) return "danger";
  if (days <= 365) return "warn";
  return "info";
}

function formatDate(iso: string, locale: Locale): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(
    locale === "en" ? "en-GB" : "es-ES",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  );
}

/** Etiqueta de tiempo relativa: "en 16 días", "hoy", "hace 3 meses". */
function relativeLabel(days: number, t: MonitoringDict): string {
  if (days === 0) return t.relToday;
  if (days > 0) {
    if (days === 1) return t.relTomorrow;
    if (days < 45) return `${t.relInPrefix}${days} ${t.relDays}`;
    const months = Math.round(days / 30);
    if (months < 24) return `${t.relInPrefix}${months} ${t.relMonths}`;
    return `${t.relInPrefix}${Math.round(days / 365)} ${t.relYears}`;
  }
  const abs = Math.abs(days);
  if (abs === 1) return t.relYesterday;
  if (abs < 45) return `${t.relAgoPrefix}${abs} ${t.relDays}${t.relAgoSuffix}`;
  const months = Math.round(abs / 30);
  if (months < 24) return `${t.relAgoPrefix}${months} ${t.relMonths}${t.relAgoSuffix}`;
  return `${t.relAgoPrefix}${Math.round(abs / 365)} ${t.relYears}${t.relAgoSuffix}`;
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

/**
 * Briefing "aclaración de plazos" — diferenciador de Attesta: corrige el error
 * extendido de que el 2-ago-2026 es el plazo de alto riesgo (el Digital Omnibus
 * lo movió a dic-2027) y enfoca lo que el deployer sí debe tener listo pronto.
 * Determinista, basado en los eventos curados del radar.
 */
function EuReadinessBriefing({
  art50,
  highRisk,
  now,
  locale,
  t,
}: {
  art50: RegulatoryEvent;
  highRisk: RegulatoryEvent;
  now: Date;
  locale: Locale;
  t: MonitoringDict;
}) {
  const art50Days = daysUntil(art50.date, now);
  const hrDays = daysUntil(highRisk.date, now);
  return (
    <section className="mb-8 rounded-2xl border border-brand/30 bg-brand-soft/40 p-6">
      <div className="flex items-start gap-3">
        <svg
          viewBox="0 0 24 24"
          className="mt-0.5 size-5 shrink-0 text-brand-strong"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.9 1 1 1.6l.2 1.1h4.8l.2-1.1c.1-.6.5-1.2 1-1.6A6 6 0 0 0 12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 20.5h5M10 18.4h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-strong">
            Aclaración de plazos · EU AI Act
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            El 2 de agosto de 2026 no es el plazo de los sistemas de alto riesgo
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft">
            Es un error extendido en el mercado. El{" "}
            <span className="font-medium text-ink">Digital Omnibus</span> movió las
            obligaciones de alto riesgo del Anexo III (empleo) al{" "}
            <span className="font-medium text-ink">
              {formatDate(highRisk.date, locale)}
            </span>
            {hrDays > 0 && ` (${relativeLabel(hrDays, t)})`}. Lo que tu organización sí
            debe tener listo pronto como{" "}
            <span className="font-medium text-ink">deployer</span>:
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <li className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised px-3.5 py-2.5">
              <span className="text-sm text-ink">
                Alfabetización en IA <span className="text-muted">· Art. 4</span>
              </span>
              <Pill tone="good">ya vigente</Pill>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised px-3.5 py-2.5">
              <span className="text-sm text-ink">
                Transparencia <span className="text-muted">· Art. 50.3/50.4</span>
              </span>
              <Pill tone={countdownTone(art50Days)}>
                {art50Days >= 0 ? relativeLabel(art50Days, t) : "en vigor"}
              </Pill>
            </li>
          </ul>
          <Link
            href="/dashboard/packs"
            className="mt-3 inline-flex text-xs font-medium text-brand hover:text-brand-strong"
          >
            Aplicar el pack de RRHH para dejar la evidencia lista →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function VigilanciaPage({
  searchParams,
}: {
  searchParams: Promise<{ j?: string }>;
}) {
  const sp = await searchParams;
  const [systems, acks, role, events, isAdmin, orgJur] = await Promise.all([
    getAiSystems(),
    getRegulatoryAcks(),
    getCurrentMemberRole(),
    getRegulatoryEvents(),
    getIsPlatformAdmin(),
    getOrgJurisdictions(),
  ]);
  const now = new Date();
  const locale = await resolveLocale();
  const dd = getDictionary(locale).dashboard;
  const tm = dd.pages.monitoring;
  const u = dd.units;
  const jurLabels = JURISDICTION_LABEL_BY_LOCALE[locale];
  const canManage =
    isSupabaseConfigured && (role === "owner" || role === "admin");

  const jurisdictionOf = (e: RegulatoryEvent) =>
    FRAMEWORK_META[e.framework]?.jurisdiction;

  // Jurisdicciones presentes en el catálogo (para el filtro multi-marco).
  const present = new Set(
    events
      .map(jurisdictionOf)
      .filter((j): j is RegJurisdiction => Boolean(j)),
  );
  const jurisdictions = JURISDICTION_ORDER.filter((j) => present.has(j));

  // Nexo de la organización (solo jurisdicciones que existen en el catálogo).
  const nexus = orgJur.filter((j): j is RegJurisdiction =>
    jurisdictions.includes(j as RegJurisdiction),
  );

  // Modo de vista: ?j=all → todas · ?j=<cód> → una · (sin ?j) → nexo (o todas).
  const showAll = sp.j === "all";
  const singleJ =
    sp.j && sp.j !== "all" && jurisdictions.includes(sp.j as RegJurisdiction)
      ? (sp.j as RegJurisdiction)
      : null;
  const usingNexus = !showAll && !singleJ && nexus.length > 0;

  const shown = singleJ
    ? events.filter((e) => jurisdictionOf(e) === singleJ)
    : usingNexus
      ? events.filter((e) => {
          const j = jurisdictionOf(e);
          return j != null && nexus.includes(j);
        })
      : events;

  const withDays = shown.map((e) => ({
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

  const deadlines = upcomingDeadlines(now, shown);
  const hero = deadlines[0];
  const heroAffected = hero ? affectedSystems(hero, systems) : [];
  const heroDays = hero ? daysUntil(hero.date, now) : 0;
  const heroAck = hero ? acks[hero.id] : undefined;
  const otherDeadlines = deadlines.slice(1);

  // Briefing "aclaración de plazos" (diferenciador): se muestra con la UE en vista
  // y mientras el alto riesgo del Anexo III siga por venir (mito aún vivo).
  const art50Ev = shown.find((e) => e.id === "eu-transparency-art50");
  const highRiskEv = events.find((e) => e.id === "eu-highrisk-annex-iii");
  const showBriefing =
    !!art50Ev && !!highRiskEv && daysUntil(highRiskEv.date, now) > 0;

  return (
    <>
      <PageHeader
        title={tm.title}
        subtitle={tm.subtitle}
        action={
          isAdmin ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/vigilancia/fuentes"
                className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
              >
                {tm.watchedSources}
              </Link>
              <Link
                href="/dashboard/vigilancia/candidatos"
                className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
              >
                {tm.validationInbox}
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* Configurador del nexo de jurisdicción (owner/admin) */}
      {canManage && jurisdictions.length > 1 && (
        <JurisdictionSettings selected={nexus} />
      )}

      {/* Filtro por jurisdicción (solo si hay más de un marco) */}
      {jurisdictions.length > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {tm.jurisdictionFilter}
          </span>
          {nexus.length > 0 && (
            <JurisdictionChip
              label={tm.myJurisdictions}
              href="/dashboard/vigilancia"
              active={usingNexus}
              nexusAria={tm.inNexus}
            />
          )}
          {jurisdictions.map((j) => (
            <JurisdictionChip
              key={j}
              label={jurLabels[j]}
              href={`/dashboard/vigilancia?j=${j}`}
              active={singleJ === j}
              inNexus={nexus.includes(j)}
              nexusAria={tm.inNexus}
            />
          ))}
          <JurisdictionChip
            label={tm.allJurisdictions}
            href="/dashboard/vigilancia?j=all"
            active={showAll || (!singleJ && nexus.length === 0)}
            nexusAria={tm.inNexus}
          />
        </div>
      )}

      {/* Briefing: aclaración del plazo del 2-ago-2026 (corrige el error de mercado) */}
      {showBriefing && art50Ev && highRiskEv && (
        <EuReadinessBriefing
          art50={art50Ev}
          highRisk={highRiskEv}
          now={now}
          locale={locale}
          t={tm}
        />
      )}

      {/* Hero: próximo plazo */}
      {hero && (
        <section className="mb-8 overflow-hidden rounded-2xl border border-line bg-paper-raised">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={countdownTone(heroDays)}>{tm.nextDeadline}</Pill>
                <FrameworkPill framework={hero.framework} locale={locale} />
                <span className="text-xs text-muted">
                  {frameworkLabel(hero.framework, locale)}
                </span>
                {heroAck && <AckPill status={heroAck.status} locale={locale} />}
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">
                {hero.title}
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                {formatDate(hero.date, locale)} ·{" "}
                {heroAffected.length > 0 ? (
                  <span className="font-medium text-ink">
                    {tm.affectsPrefix}
                    {heroAffected.length}{" "}
                    {heroAffected.length === 1 ? u.systemOne : u.systemOther}
                    {tm.affectsSuffix}
                  </span>
                ) : (
                  tm.noAffected
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <div className="text-center">
                <p className="font-display text-3xl font-semibold tabular-nums text-ink">
                  {heroDays}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  {heroDays === 1 ? u.dayOne : u.dayOther}
                </p>
              </div>
              <Link
                href="/dashboard/inventario"
                className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
              >
                {tm.viewSystems}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Otros próximos plazos */}
      {otherDeadlines.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {tm.morePastDeadlines}
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
                    <Pill tone={countdownTone(d)}>{relativeLabel(d, tm)}</Pill>
                    <span className="text-xs tabular-nums text-muted">
                      {formatDate(e.date, locale)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <FrameworkPill framework={e.framework} locale={locale} />
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-ink">{e.title}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted">
                      {n} {n === 1 ? tm.affectedOne : tm.affectedOther}
                    </p>
                    {ack && <AckPill status={ack.status} locale={locale} />}
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
          {tm.regulatoryTimeline}
          {singleJ
            ? ` · ${jurLabels[singleJ]}`
            : usingNexus
              ? tm.timelineMyJurisdictions
              : ""}
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
              locale={locale}
              t={tm}
              u={u}
            />
          ))}
        </div>
      </section>

      <LegalNote text={LEGAL_FOOTER_BY_LOCALE[locale]} className="mt-8" />
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
  locale,
  t,
  u,
}: {
  ev: RegulatoryEvent;
  days: number;
  affectedCount: number;
  affected: { id: string; name: string }[];
  ack?: RegAck;
  canManage: boolean;
  locale: Locale;
  t: MonitoringDict;
  u: UnitsDict;
}) {
  const upcoming = days >= 0;
  return (
    <details className="group rounded-2xl border border-line bg-paper-raised open:shadow-[0_18px_44px_-30px_rgba(15,26,20,0.45)]">
      <summary className="flex cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <div className="mt-0.5 flex w-24 shrink-0 flex-col items-start gap-1">
          <span className="text-xs font-medium tabular-nums text-ink-soft">
            {relativeLabel(days, t)}
          </span>
          <span className="text-[11px] tabular-nums text-muted">
            {formatDate(ev.date, locale)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={KIND_TONE[ev.kind]}>{regKindLabel(ev.kind, locale)}</Pill>
            <FrameworkPill framework={ev.framework} locale={locale} />
            {upcoming ? (
              <span className="text-[11px] font-medium text-muted">{t.upcoming}</span>
            ) : (
              <span className="text-[11px] font-medium text-muted">{t.inForce}</span>
            )}
            {ack && <AckPill status={ack.status} locale={locale} />}
          </div>
          <p className="mt-1.5 font-medium text-ink">{ev.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {affectedCount > 0
              ? `${t.affectsPrefixCap}${affectedCount} ${affectedCount === 1 ? u.systemOne : u.systemOther}${t.affectsSuffix}`
              : t.noAffectedCap}
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
          <Detail label={t.detailWhat}>{ev.summary}</Detail>
          <Detail label={t.detailMeaning}>{ev.impact}</Detail>
          <Detail label={t.detailAction}>{ev.action}</Detail>
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
            {t.internalStatus}
          </p>
          {canManage ? (
            <EventStatusControl eventId={ev.id} status={ack?.status} />
          ) : ack ? (
            <AckPill status={ack.status} locale={locale} />
          ) : (
            <span className="text-xs text-muted">{t.notMarked}</span>
          )}
          {ack?.note && (
            <span className="text-xs text-ink-soft">· {ack.note}</span>
          )}
        </div>

        {affected.length > 0 && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-[11px] uppercase tracking-wide text-muted">
              {t.affectedSystemsLabel}
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
