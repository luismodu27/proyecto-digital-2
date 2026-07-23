import Link from "next/link";
import { SealMark } from "@/components/ui/SealMark";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { LEGAL_PDF_BY_LOCALE, ScopeNote } from "@/components/ui/LegalNote";
import {
  getAiSystems,
  getRegulatoryAcks,
  getRegulatoryEvents,
  getOrganizationName,
  getOrgJurisdictions,
} from "@/lib/data";
import { regAckLabel, type RegAckStatus } from "@/lib/mock-data";
import {
  affectedSystems,
  daysUntil,
  frameworkMeta,
  FRAMEWORK_META,
  JURISDICTION_ORDER,
  JURISDICTION_LABEL_BY_LOCALE,
  type RegulatoryEvent,
  type RegJurisdiction,
} from "@/lib/regulatory-watch";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

// El radar depende de la fecha actual: nunca prerenderizar.
export const dynamic = "force-dynamic";

// Color del estado interno (theme-aware; imprime en color).
const STATUS_COLOR: Record<RegAckStatus, string> = {
  reviewed: "var(--tone-good-fg)",
  planned: "var(--tone-info-fg)",
  not_applicable: "var(--tone-neutral-fg)",
};

export default async function RadarInformePage({
  searchParams,
}: {
  searchParams: Promise<{ j?: string }>;
}) {
  const sp = await searchParams;
  const [systems, acks, events, orgName, orgJur] = await Promise.all([
    getAiSystems(),
    getRegulatoryAcks(),
    getRegulatoryEvents(),
    getOrganizationName(),
    getOrgJurisdictions(),
  ]);

  const now = new Date();
  const locale = await resolveLocale();
  const dd = getDictionary(locale).dashboard;
  const tp = dd.pages;
  const tr = tp.reportRadar;
  const tm = tp.monitoring;
  const u = dd.units;
  const jurLabels = JURISDICTION_LABEL_BY_LOCALE[locale];

  const jurisdictionOf = (e: RegulatoryEvent) =>
    FRAMEWORK_META[e.framework]?.jurisdiction;

  const present = new Set(
    events
      .map(jurisdictionOf)
      .filter((j): j is RegJurisdiction => Boolean(j)),
  );
  const jurisdictions = JURISDICTION_ORDER.filter((j) => present.has(j));
  const nexus = orgJur.filter((j): j is RegJurisdiction =>
    jurisdictions.includes(j as RegJurisdiction),
  );

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
    affected: affectedSystems(e, systems).length,
  }));
  const upcoming = withDays
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days);
  const past = withDays.filter((x) => x.days < 0).sort((a, b) => b.days - a.days);

  const frameworkCount = new Set(shown.map((e) => e.framework)).size;
  const nearest = upcoming[0];

  const scopeText = singleJ
    ? jurLabels[singleJ]
    : usingNexus
      ? tr.scopeNexus
      : tr.scopeAll;

  const fecha = now.toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(
      locale === "en" ? "en-GB" : "es-ES",
      { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" },
    );

  const statusCell = (evId: string) => {
    const ack = acks[evId];
    if (!ack)
      return <span className="text-muted">{tm.notMarked}</span>;
    return (
      <span style={{ color: STATUS_COLOR[ack.status] }}>
        {regAckLabel(ack.status, locale)}
      </span>
    );
  };

  const kpis = [
    { k: tr.kpiUpcoming, v: String(upcoming.length) },
    { k: tr.kpiInForce, v: String(past.length) },
    { k: tr.kpiFrameworks, v: String(frameworkCount) },
    {
      k: tr.kpiNearest,
      v: nearest
        ? `${tr.inPrefix}${nearest.days} ${nearest.days === 1 ? u.dayOne : u.dayOther}`
        : "—",
    },
  ];

  // Preserva el alcance activo al volver al radar interactivo.
  const backHref = sp.j
    ? `/dashboard/vigilancia?j=${sp.j}`
    : "/dashboard/vigilancia";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href={backHref}
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          {tp.radarBack}
        </Link>
        <PrintButton label={tr.downloadPdf} />
      </div>

      <article className="rounded-2xl border border-line bg-paper-raised p-8 text-ink print:rounded-none print:border-0 print:p-0">
        {/* Portada */}
        <header className="flex items-start justify-between border-b border-line pb-6">
          <div className="flex items-center gap-2">
            <SealMark size={34} className="text-brand" />
            <span className="font-display text-2xl font-semibold">Attesta</span>
          </div>
          <div className="text-right text-xs text-muted">
            <p>{tr.coverTag}</p>
            <p>{fecha}</p>
          </div>
        </header>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {tr.coverKicker}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            {tr.coverTitle}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {dd.pages.reportChrome.organizationLabel}{" "}
            <span className="font-medium text-ink">{orgName ?? "—"}</span> ·{" "}
            {tr.scopeLabel} <span className="text-ink">{scopeText}</span>
          </p>
        </div>

        {/* Alcance y método */}
        <ScopeNote fecha={fecha} locale={locale} className="mt-6" />

        {/* KPIs */}
        <section className="mt-6 break-inside-avoid">
          <h2 className="font-display text-base font-semibold">
            {tr.summaryTitle}
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.map((c) => (
              <div
                key={c.k}
                className="break-inside-avoid rounded-lg border border-line px-3 py-3"
              >
                <p className="font-display text-xl font-semibold leading-tight">
                  {c.v}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">{c.k}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Próximos plazos */}
        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-base font-semibold">
            {tr.upcomingTitle}
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">{tr.noUpcoming}</p>
          ) : (
            <div className="mt-3 overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line-strong text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3 font-medium">{tr.colDate}</th>
                    <th className="py-2 pr-3 font-medium">{tr.colFramework}</th>
                    <th className="py-2 pr-3 font-medium">{tr.colEvent}</th>
                    <th className="py-2 pr-3 font-medium">{tr.colWhen}</th>
                    <th className="py-2 pr-3 font-medium">{tr.colAffected}</th>
                    <th className="py-2 font-medium">{tr.colStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(({ ev, days, affected }) => (
                    <tr key={ev.id} className="border-b border-line align-top">
                      <td className="py-2.5 pr-3 whitespace-nowrap tabular-nums text-ink-soft">
                        {formatDate(ev.date)}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-ink-soft">
                        {frameworkMeta(ev.framework, locale)?.short ??
                          ev.framework}
                      </td>
                      <td className="py-2.5 pr-3">{ev.title}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap tabular-nums">
                        {tr.inPrefix}
                        {days} {days === 1 ? u.dayOne : u.dayOther}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-ink-soft">
                        {affected}
                      </td>
                      <td className="py-2.5 text-xs font-medium">
                        {statusCell(ev.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Ya en vigor */}
        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-base font-semibold">
            {tr.inForceTitle}
          </h2>
          {past.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">{tr.noInForce}</p>
          ) : (
            <div className="mt-3 overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line-strong text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-3 font-medium">{tr.colDate}</th>
                    <th className="py-2 pr-3 font-medium">{tr.colFramework}</th>
                    <th className="py-2 pr-3 font-medium">{tr.colEvent}</th>
                    <th className="py-2 pr-3 font-medium">{tr.colAffected}</th>
                    <th className="py-2 font-medium">{tr.colStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map(({ ev, affected }) => (
                    <tr key={ev.id} className="border-b border-line align-top">
                      <td className="py-2.5 pr-3 whitespace-nowrap tabular-nums text-ink-soft">
                        {formatDate(ev.date)}
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-ink-soft">
                        {frameworkMeta(ev.framework, locale)?.short ??
                          ev.framework}
                      </td>
                      <td className="py-2.5 pr-3">{ev.title}</td>
                      <td className="py-2.5 pr-3 tabular-nums text-ink-soft">
                        {affected}
                      </td>
                      <td className="py-2.5 text-xs font-medium">
                        {statusCell(ev.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-line pt-5 text-xs text-muted">
          <p>
            {dd.pages.reportChrome.generatedByPrefix}
            <span className="font-medium text-ink">Attesta</span>
            {dd.pages.reportChrome.generatedByOn}
            {fecha}. {tr.footerNote}
          </p>
          <p className="mt-1">{LEGAL_PDF_BY_LOCALE[locale]}</p>
        </footer>
      </article>
    </div>
  );
}
