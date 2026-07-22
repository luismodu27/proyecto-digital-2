import Link from "next/link";
import { SealMark } from "@/components/ui/SealMark";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { LEGAL_PDF_BY_LOCALE, ScopeNote } from "@/components/ui/LegalNote";
import {
  getAiSystems,
  getGapItems,
  getOrganizationName,
  getOrgJurisdictions,
  getRegulatoryEvents,
} from "@/lib/data";
import { getActiveOrg } from "@/lib/data/context";
import { orgHasTier } from "@/lib/billing/plan";
import { Paywall } from "@/components/dashboard/Paywall";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";
import {
  riskLabel,
  severityLabel,
  RISK_ORDER,
  AUDIT_READY_THRESHOLD,
  avgCompliance,
  riskCounts,
  type RiskLevel,
} from "@/lib/mock-data";
import {
  upcomingDeadlines,
  affectedSystems,
  daysUntil,
  FRAMEWORK_META,
  frameworkMeta,
} from "@/lib/regulatory-watch";

export const dynamic = "force-dynamic";

// Colores por tono semántico (theme-aware: adaptan a claro/oscuro y a impresión).
const RISK_COLOR: Record<RiskLevel, string> = {
  unacceptable: "var(--tone-danger-fg)",
  high: "var(--tone-warn-fg)",
  limited: "var(--tone-gold-fg)",
  minimal: "var(--tone-good-fg)",
};

const SEVERITY_COLOR = {
  alta: "var(--tone-danger-fg)",
  media: "var(--tone-warn-fg)",
  baja: "var(--tone-neutral-fg)",
} as const;

export default async function InformeEjecutivoPage() {
  const locale = await resolveLocale();
  const dict = getDictionary(locale).dashboard;
  const tp = dict.pages;
  const tr = tp.reportExec;
  const rc = tp.reportChrome;
  const u = dict.units;
  const gateOrg = await getActiveOrg();
  if (gateOrg && !(await orgHasTier(gateOrg, "preparacion"))) {
    return (
      <Paywall
        feature={tp.reportExec.paywallFeature}
        description={tp.reportExec.paywallDesc}
        t={dict.paywall}
      />
    );
  }

  const [systems, gaps, orgName, orgJur, regEvents] = await Promise.all([
    getAiSystems(),
    getGapItems(),
    getOrganizationName(),
    getOrgJurisdictions(),
    getRegulatoryEvents(),
  ]);

  const now = new Date();
  const counts = riskCounts(systems);
  const avg = avgCompliance(systems);
  const highRisk = counts.high + counts.unacceptable;
  const total = systems.length;

  const openGaps = gaps.filter((g) => g.status !== "done");
  const criticalGaps = openGaps.filter((g) => g.severity === "alta");

  const backed = systems.filter(
    (s) => s.evidenceState === "evidenced" || s.evidenceState === "reviewed",
  ).length;
  const backedPct = total ? Math.round((backed / total) * 100) : 0;

  const priority = systems
    .filter((s) => (s.risk === "high" || s.risk === "unacceptable") && s.compliance < 60)
    .sort((a, b) => a.compliance - b.compliance)
    .slice(0, 5);

  const nameById = new Map(systems.map((s) => [s.id, s.name]));
  const topGaps = [...openGaps]
    .sort((a, b) => {
      const w = { alta: 0, media: 1, baja: 2 } as const;
      return w[a.severity] - w[b.severity];
    })
    .slice(0, 5);

  const deadlines = upcomingDeadlines(now, regEvents)
    .filter(
      (e) =>
        orgJur.length === 0 ||
        orgJur.includes(FRAMEWORK_META[e.framework]?.jurisdiction ?? ""),
    )
    .slice(0, 3);

  const fecha = now.toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Sistemas de alto riesgo por debajo del umbral ORIENTATIVO de preparación
  // (80%). Es un corte distinto —y más amplio— que `priority` (<60%, "los más
  // urgentes"); la narrativa se apoya en este para que el % coincida con la
  // marca del Meter y con el resto del producto (una sola fuente: la constante).
  const belowReady = systems.filter(
    (s) =>
      (s.risk === "high" || s.risk === "unacceptable") &&
      s.compliance < AUDIT_READY_THRESHOLD,
  ).length;

  const org = orgName ?? "La organización";
  const nearest = deadlines[0];
  const nearestDays = nearest ? daysUntil(nearest.date, now) : 0;
  // Ensamblado determinista (cero LLM) del resumen ejecutivo a partir de los
  // datos ya declarados por la organización. Copy revisado por compliance.
  const pl = (n: number, one: string, many: string) => (n === 1 ? one : many);
  const summaryParagraph =
    total === 0
      ? `A fecha de ${fecha}, ${org} aún no ha inventariado sistemas de IA. El primer paso de la preparación es registrar los sistemas en uso y clasificar su riesgo.`
      : [
          `A fecha de ${fecha}, ${org} mantiene ${total} ${pl(total, "sistema de IA inventariado", "sistemas de IA inventariados")}, de ${pl(total, "el cual", "los cuales")} ${
            highRisk === 0
              ? "ninguno está clasificado"
              : `${highRisk} ${pl(highRisk, "está clasificado", "están clasificados")}`
          } como de alto riesgo según la autoevaluación orientativa de la organización.`,
          `La preparación media declarada es del ${avg}%, y un ${backedPct}% de los sistemas cuenta con evidencia declarada de respaldo.`,
          `Hay ${openGaps.length} ${pl(openGaps.length, "brecha abierta", "brechas abiertas")} (${criticalGaps.length} de severidad alta) ${pl(openGaps.length, "pendiente", "pendientes")} de resolución.`,
          belowReady > 0
            ? `${belowReady} ${pl(belowReady, "sistema de alto riesgo está", "sistemas de alto riesgo están")} por debajo del umbral orientativo de preparación (${AUDIT_READY_THRESHOLD}% listo) y se ${pl(belowReady, "señala", "señalan")} para atención prioritaria.`
            : null,
          nearest
            ? `El próximo hito regulatorio en el radar de la organización es «${nearest.title}», dentro de ${nearestDays} ${pl(nearestDays, "día", "días")}.`
            : null,
        ]
          .filter(Boolean)
          .join(" ");

  const kpis = [
    { k: tr.kpiSystems, v: String(total) },
    { k: tr.kpiHighRisk, v: String(highRisk), color: highRisk > 0 ? RISK_COLOR.high : undefined },
    { k: tr.kpiAvgReadiness, v: `${avg}%` },
    { k: tr.kpiOpenGaps, v: String(openGaps.length) },
    { k: tr.kpiBacked, v: `${backedPct}%` },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          {tp.backToOverview}
        </Link>
        <PrintButton label={tp.reportExec.downloadPdf} />
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
            {rc.organizationLabel}{" "}
            <span className="font-medium text-ink">{orgName ?? "—"}</span> ·{" "}
            {rc.selfDeclaredData}
          </p>
        </div>

        {/* Resumen ejecutivo (narrativa determinista, ES → experto) */}
        <section className="mt-6 break-inside-avoid">
          <h2 className="font-display text-base font-semibold">{rc.execSummary}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {summaryParagraph}
          </p>
        </section>

        {/* Alcance y método */}
        <ScopeNote fecha={fecha} locale={locale} className="mt-5" />

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {kpis.map((c) => (
            <div
              key={c.k}
              className="break-inside-avoid rounded-lg border border-line px-3 py-3"
            >
              <p
                className="font-display text-2xl font-semibold leading-tight"
                style={c.color ? { color: c.color } : undefined}
              >
                {c.v}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{c.k}</p>
            </div>
          ))}
        </div>

        {/* Distribución de riesgo */}
        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-base font-semibold">
            {tr.riskDistribution}
          </h2>
          <div className="mt-3 space-y-2">
            {RISK_ORDER.map((level) => {
              const n = counts[level];
              const pct = total ? Math.round((n / total) * 100) : 0;
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm text-ink-soft">
                    {riskLabel(level, locale)}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-sunken">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: RISK_COLOR[level],
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm tabular-nums text-ink">
                    {n}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sistemas prioritarios */}
        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-base font-semibold">
            {tr.needAttention}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {tr.needAttentionHintPrefix}
            {AUDIT_READY_THRESHOLD}
            {tr.needAttentionHintSuffix}
          </p>
          {priority.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">{tr.allAboveThreshold}</p>
          ) : (
            <div className="mt-3 overflow-x-auto print:overflow-visible">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line-strong text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3 font-medium">{tr.colSystem}</th>
                  <th className="py-2 pr-3 font-medium">{tr.colRisk}</th>
                  <th className="py-2 font-medium">{tr.colReadiness}</th>
                </tr>
              </thead>
              <tbody>
                {priority.map((s) => (
                  <tr key={s.id} className="border-b border-line align-top">
                    <td className="py-2.5 pr-3">
                      {s.name}
                      <span className="ml-1 text-xs text-muted">· {s.owner}</span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span style={{ color: RISK_COLOR[s.risk] }}>
                        {riskLabel(s.risk, locale)}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium tabular-nums">
                      {s.compliance}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </section>

        {/* Brechas abiertas */}
        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-base font-semibold">
            {tr.openGapsTitle}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {openGaps.length}
            {tr.openGapsHintMid}
            {criticalGaps.length}
            {tr.openGapsHintSuffix}
          </p>
          {topGaps.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">{tr.noOpenGaps}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topGaps.map((g) => (
                <li
                  key={g.id}
                  className="flex items-baseline justify-between gap-3 border-b border-line pb-2 text-sm"
                >
                  <span>
                    <span className="font-mono text-xs text-seal">{g.article}</span>{" "}
                    {g.requirement}
                    <span className="ml-1 text-xs text-muted">
                      · {nameById.get(g.system) ?? g.system}
                    </span>
                  </span>
                  <span
                    className="shrink-0 text-xs font-medium uppercase"
                    style={{ color: SEVERITY_COLOR[g.severity] }}
                  >
                    {severityLabel(g.severity, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Próximos plazos regulatorios */}
        <section className="mt-8 break-inside-avoid">
          <h2 className="font-display text-base font-semibold">
            {tr.deadlinesTitle}
          </h2>
          {deadlines.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">{tr.noFutureDeadlines}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {deadlines.map((e) => {
                const d = daysUntil(e.date, now);
                const n = affectedSystems(e, systems).length;
                return (
                  <li
                    key={e.id}
                    className="flex items-baseline justify-between gap-3 border-b border-line pb-2 text-sm"
                  >
                    <span>
                      {e.title}
                      <span className="ml-1 text-xs text-muted">
                        ·{" "}
                        {frameworkMeta(e.framework, locale)?.short ??
                          e.framework}
                        {tr.affectsMid}
                        {n} {n === 1 ? u.systemOne : u.systemOther}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-medium tabular-nums text-ink-soft">
                      {tr.inDaysPrefix}
                      {d} {d === 1 ? u.dayOne : u.dayOther}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="mt-10 border-t border-line pt-5 text-xs text-muted">
          <p>
            {rc.generatedByPrefix}
            <span className="font-medium text-ink">Attesta</span>
            {rc.generatedByOn}
            {fecha}. {tr.footerNote}
          </p>
          <p className="mt-1">{LEGAL_PDF_BY_LOCALE[locale]}</p>
        </footer>
      </article>
    </div>
  );
}
