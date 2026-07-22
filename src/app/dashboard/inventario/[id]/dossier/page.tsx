import type { ReactNode } from "react";
import Link from "next/link";
import { SealMark } from "@/components/ui/SealMark";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { getSystemDossier, getOrganizationName } from "@/lib/data";
import { LEGAL_PDF_BY_LOCALE, ScopeNote } from "@/components/ui/LegalNote";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Paywall } from "@/components/dashboard/Paywall";
import { getActiveOrg } from "@/lib/data/context";
import { orgHasTier } from "@/lib/billing/plan";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import {
  OBLIGATIONS_BY_LEVEL,
  OBLIGATIONS_BY_LEVEL_EN,
} from "@/lib/risk-assessment";
import { recommendationsForLevel } from "@/lib/recommendations";
import { BiasAuditBadge } from "@/components/dashboard/BiasAuditBadge";
import {
  biasAuditStatus,
  nextBiasAuditDue,
  daysUntilDate,
  publicationComplete,
} from "@/lib/bias-audit";
import {
  EVIDENCE_LABEL,
  RISK_LABEL,
  riskLabel,
  evidenceLabel,
  severityLabel,
  type EvidenceState,
  type RiskLevel,
} from "@/lib/mock-data";

/* Colores por tono semántico (theme-aware: adaptan a claro/oscuro e impresión). */
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

const PRIORITY_COLOR = {
  crítica: "var(--tone-danger-fg)",
  alta: "var(--tone-warn-fg)",
  media: "var(--tone-neutral-fg)",
} as const;

const STATUS_META = {
  missing: { label: "Falta", color: "var(--tone-danger-fg)" },
  partial: { label: "Parcial", color: "var(--tone-warn-fg)" },
  done: { label: "Cubierto", color: "var(--tone-good-fg)" },
} as const;

const ROLE_LABEL: Record<string, string> = {
  deployer: "Responsable del despliegue (deployer)",
  provider: "Proveedor (provider)",
};

const RATIONALE_FALLBACK: Record<RiskLevel, string> = {
  unacceptable:
    "El sistema incurre en una o más prácticas prohibidas por el Art. 5 del EU AI Act; no puede comercializarse ni usarse en la UE.",
  high: "El sistema opera en un área de alto riesgo del Anexo III del EU AI Act y le aplican los requisitos de los Arts. 9–15 y las obligaciones del responsable del despliegue (Art. 26).",
  limited:
    "El sistema no es de alto riesgo, pero está sujeto a obligaciones de transparencia del Art. 50.",
  minimal:
    "El sistema no encaja en prácticas prohibidas, áreas de alto riesgo ni obligaciones de transparencia. Se recomiendan códigos de conducta voluntarios (Art. 95).",
};

function formatDateTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Bloque de campo etiqueta/valor para la ficha de identificación. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="break-inside-avoid border-b border-line py-2.5">
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}

/** Cabecera numerada de sección. */
function SectionTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2.5 font-display text-lg font-semibold text-ink">
      <span className="flex size-6 items-center justify-center rounded-md bg-brand-soft text-xs font-semibold text-brand-strong">
        {n}
      </span>
      {children}
    </h2>
  );
}

export default async function DossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const locale = await resolveLocale();
  const dict = getDictionary(locale).dashboard;
  const tp = dict.pages;
  const td = tp.dossier;
  const rc = tp.reportChrome;
  const statusLabelMap = {
    missing: rc.statusMissing,
    partial: rc.statusPartial,
    done: rc.statusDone,
  } as const;
  const gateOrg = await getActiveOrg();
  if (gateOrg && !(await orgHasTier(gateOrg, "preparacion"))) {
    return (
      <Paywall
        feature={tp.dossier.paywallFeature}
        description={tp.dossier.paywallDesc}
        t={dict.paywall}
      />
    );
  }

  const [dossier, orgName] = await Promise.all([
    getSystemDossier(id),
    getOrganizationName(),
  ]);

  const fecha = new Date().toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (!dossier) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 print:hidden">
          <Link
            href="/dashboard/inventario"
            className="text-sm font-medium text-brand hover:text-brand-strong"
          >
            {tp.backToInventory}
          </Link>
        </div>
        <div className="rounded-2xl border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] p-6 text-sm text-[var(--tone-warn-fg)]">
          {tp.dossier.notFound}
        </div>
      </div>
    );
  }

  const { system, gaps, assessments, biasAudit } = dossier;
  const now = new Date();
  const biasStatus =
    biasAudit && biasAudit.isAedt ? biasAuditStatus(biasAudit, now) : null;
  const biasDue = biasAudit ? nextBiasAuditDue(biasAudit.lastAuditDate) : null;
  const biasDays = daysUntilDate(biasDue, now);
  const level = system.risk;
  const latest = assessments[0];
  const rationale = latest?.rationale ?? RATIONALE_FALLBACK[level];
  const evidenceState: EvidenceState = system.evidenceState ?? "declared";
  const obligations = (
    locale === "en" ? OBLIGATIONS_BY_LEVEL_EN : OBLIGATIONS_BY_LEVEL
  )[level];
  const recs = recommendationsForLevel(level, locale);
  const openGaps = gaps.filter((g) => g.status !== "done").length;
  const criticalOpen = gaps.filter(
    (g) => g.status !== "done" && g.severity === "alta",
  ).length;
  const isUnacceptable = level === "unacceptable";

  const org = orgName ?? "La organización";
  const rol = ROLE_LABEL[system.actorRole] ?? system.actorRole;
  // Etiqueta de rol para el chrome (locale-aware); `rol` (ES) se reserva para
  // la narrativa del resumen ejecutivo (s1), que permanece en español.
  const roleChrome =
    system.actorRole === "deployer"
      ? rc.roleDeployer
      : system.actorRole === "provider"
        ? rc.roleProvider
        : system.actorRole;
  const vendorPart = system.vendor ? `, proveedor: ${system.vendor}` : "";

  // Resumen ejecutivo ensamblado de forma determinista (cero LLM) a partir de los
  // datos ya declarados. Copy revisado por compliance. Para nivel "Inaceptable"
  // (Art. 5) se enuncia la prohibición, no una "preparación": una práctica
  // prohibida no se prepara para auditoría.
  const s1 = `Este dossier documenta «${system.name}», un sistema de IA que ${org} utiliza en el dominio de ${system.domain}${vendorPart}. El rol que la organización declara frente a este sistema es «${rol}».`;
  const s2s3 = isUnacceptable
    ? "La autoevaluación orientativa de la organización sitúa este sistema entre las prácticas prohibidas del Art. 5 del EU AI Act. Las prácticas prohibidas no son una cuestión de «preparación para auditoría»: no pueden ponerse en el mercado ni utilizarse en la UE una vez en vigor su prohibición (la mayoría desde el 2 de febrero de 2025; las dos añadidas por el Digital Omnibus —imágenes íntimas realistas no consentidas y CSAM— desde el 2 de diciembre de 2026), con independencia del nivel de evidencia o de preparación declarado. Por tanto, la prioridad no es cubrir controles, sino revisar de inmediato el uso del sistema y validar esta clasificación con asesoría jurídica cualificada antes de tomar cualquier decisión. Esta conclusión es orientativa y se basa únicamente en la información declarada por la organización."
    : `Según la autoevaluación orientativa de la organización, este sistema se clasifica como ${RISK_LABEL[level]}, con una preparación declarada del ${system.compliance}% y un nivel de respaldo «${EVIDENCE_LABEL[evidenceState]}». ${
        openGaps === 1
          ? `Frente a los controles evaluados queda 1 brecha abierta (${criticalOpen} de severidad alta), detallada más abajo.`
          : openGaps > 1
            ? `Frente a los controles evaluados quedan ${openGaps} brechas abiertas (${criticalOpen} de severidad alta), detalladas más abajo.`
            : "Frente a los controles evaluados no quedan brechas abiertas; el respaldo es autodeclarado, no verificado por Attesta ni por un tercero, y queda pendiente de verificación independiente. Esto no equivale a un juicio de cumplimiento ni descarta controles aún no evaluados."
      }`;
  const s4 = latest
    ? latest.attestedByName
      ? `La evaluación de riesgo vigente fue atestada por ${latest.attestedByName} el ${formatDateTime(latest.assessedAt, locale)}.`
      : "La evaluación de riesgo vigente no está atestada nominalmente."
    : "El nivel de riesgo se asignó en la ficha del sistema, sin una evaluación guardada con el asistente de riesgo.";
  const s5 =
    biasAudit && biasAudit.isAedt
      ? `En la medida en que la organización utiliza «${system.name}» para tomar decisiones de empleo sobre candidatos o personal en la ciudad de Nueva York, esta herramienta queda sujeta a la auditoría de sesgo anual por un auditor independiente que exige la Local Law 144; su estado, de forma orientativa, se detalla en el anexo correspondiente.`
      : null;
  const summaryParagraph = [s1, s2s3, s4, s5].filter(Boolean).join(" ");

  // KPIs: para "Inaceptable" no se rotula "Preparación %/Brechas" como si algo
  // prohibido pudiera prepararse; se muestra la prohibición y la acción debida.
  const summary = isUnacceptable
    ? [
        { k: td.kpiRiskLevel, v: riskLabel(level, locale), color: RISK_COLOR[level] },
        { k: td.kpiClassification, v: td.kpiProhibited, color: RISK_COLOR[level] },
        { k: td.kpiPriority, v: td.kpiLegalReview, color: RISK_COLOR[level] },
        { k: td.kpiBacking, v: evidenceLabel(evidenceState, locale) },
      ]
    : [
        { k: td.kpiRiskLevel, v: riskLabel(level, locale), color: RISK_COLOR[level] },
        { k: td.kpiReadiness, v: `${system.compliance}%` },
        { k: td.kpiOpenGaps, v: String(openGaps) },
        { k: td.kpiBacking, v: evidenceLabel(evidenceState, locale) },
      ];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barra de acciones (no se imprime) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href={
            system.dbId
              ? `/dashboard/inventario/${system.dbId}/editar`
              : "/dashboard/inventario"
          }
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          {tp.back}
        </Link>
        <PrintButton label={tp.dossier.downloadPdf} />
      </div>

      {/* Documento */}
      <article className="rounded-2xl border border-line bg-paper-raised p-8 text-ink print:rounded-none print:border-0 print:p-0">
        {/* Portada */}
        <header className="flex items-start justify-between border-b border-line pb-6">
          <div className="flex items-center gap-2">
            <SealMark size={34} className="text-brand" />
            <span className="font-display text-2xl font-semibold">Attesta</span>
          </div>
          <div className="text-right text-xs text-muted">
            <p>{td.docType}</p>
            <p>
              {td.refPrefix}
              {system.id}
            </p>
            <p>{fecha}</p>
          </div>
        </header>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {td.docKicker}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            {system.name}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {rc.organizationLabel}{" "}
            <span className="font-medium text-ink">{orgName ?? "—"}</span> ·{" "}
            {rc.roleWord}{" "}
            <span className="font-medium text-ink">{roleChrome}</span> ·{" "}
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

        {/* Indicadores */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summary.map((c) => (
            <div
              key={c.k}
              className="break-inside-avoid rounded-lg border border-line px-3 py-3"
            >
              <p
                className="font-display text-xl font-semibold leading-tight"
                style={c.color ? { color: c.color } : undefined}
              >
                {c.v}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{c.k}</p>
            </div>
          ))}
        </div>

        {/* 1 · Identificación */}
        <section className="mt-9">
          <SectionTitle n={1}>{td.sec1}</SectionTitle>
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <Field label={td.fieldCode} value={system.id} />
            <Field label={td.fieldName} value={system.name} />
            <Field label={td.fieldOwnerArea} value={system.owner} />
            <Field label={td.fieldDomain} value={system.domain} />
            <Field label={td.fieldVendor} value={system.vendor} />
            <Field label={td.fieldYourRole} value={roleChrome} />
            <Field label={td.fieldLastReview} value={system.lastReviewed} />
            <Field label={td.fieldDeclaredReadiness} value={`${system.compliance}%`} />
          </dl>
        </section>

        {/* 2 · Clasificación de riesgo */}
        <section className="mt-9 break-inside-avoid">
          <SectionTitle n={2}>{td.sec2}</SectionTitle>
          <div className="rounded-xl border border-line p-5">
            <div className="flex items-center gap-3">
              <RiskBadge level={level} label={riskLabel(level, locale)} />
              <span className="text-xs text-muted">
                {td.backingPrefix}
                {evidenceLabel(evidenceState, locale)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {rationale}
            </p>
            {latest ? (
              <p className="mt-3 text-xs text-muted">
                {td.currentAssessmentPrefix}
                {formatDateTime(latest.assessedAt, locale)}
                {latest.attestedByName
                  ? ` ${td.attestedByPrefix}${latest.attestedByName}`
                  : ` ${td.noNominalAttestation}`}
                .
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted">
                {td.levelAssignedNoAssessment}
              </p>
            )}
          </div>
        </section>

        {/* 3 · Obligaciones aplicables */}
        <section className="mt-9 break-inside-avoid">
          <SectionTitle n={3}>{td.sec3}</SectionTitle>
          <ul className="space-y-2">
            {obligations.map((o) => (
              <li key={o} className="flex gap-2.5 text-sm text-ink-soft">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-seal"
                />
                {o}
              </li>
            ))}
          </ul>
        </section>

        {/* Anexo · Auditoría de sesgo (EE. UU. · NYC LL144) — solo si es AEDT */}
        {biasAudit && biasStatus && (
          <section className="mt-9 break-inside-avoid">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-ink">
                {td.biasSectionTitle}
              </h2>
              <BiasAuditBadge status={biasStatus} days={biasDays} />
            </div>
            <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Field
                label={td.biasFieldLast}
                value={biasAudit.lastAuditDate ?? "—"}
              />
              <Field label={td.biasFieldNext} value={biasDue ?? "—"} />
              <Field
                label={td.biasFieldAuditor}
                value={biasAudit.auditorName ?? "—"}
              />
              <Field
                label={td.biasFieldIndependence}
                value={
                  biasAudit.auditorIndependenceConfirmed
                    ? td.biasYesDeclared
                    : td.biasNo
                }
              />
              <Field
                label={td.biasFieldPublished}
                value={
                  publicationComplete(biasAudit)
                    ? `${td.biasPublishedYesPrefix}${biasAudit.summaryPublishedDate}`
                    : td.biasPending
                }
              />
              <Field label={td.biasFieldUrl} value={biasAudit.summaryUrl ?? "—"} />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              La auditoría de sesgo la realiza un auditor independiente; Attesta
              registra esta evidencia declarada por la organización y no la realiza,
              valida ni certifica. La vigencia (12 meses desde la última auditoría) y
              este estado son orientativos, no un juicio de cumplimiento.
            </p>
          </section>
        )}

        {/* 4 · Controles y brechas */}
        <section className="mt-9">
          <SectionTitle n={4}>{td.sec4}</SectionTitle>
          {gaps.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted">
              {td.gapsEmpty}
            </p>
          ) : (
            <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line-strong text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-3 font-medium">{rc.colArticle}</th>
                  <th className="py-2 pr-3 font-medium">{td.colRequirementControl}</th>
                  <th className="py-2 pr-3 font-medium">{rc.colSeverity}</th>
                  <th className="py-2 font-medium">{rc.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map((g) => {
                  const st = STATUS_META[g.status];
                  return (
                    <tr
                      key={g.id}
                      className="break-inside-avoid border-b border-line align-top"
                    >
                      <td className="py-3 pr-3 font-mono text-xs text-seal">
                        {g.article || "—"}
                      </td>
                      <td className="py-3 pr-3">{g.requirement}</td>
                      <td className="py-3 pr-3 capitalize">
                        <span style={{ color: SEVERITY_COLOR[g.severity] }}>
                          {severityLabel(g.severity, locale)}
                        </span>
                      </td>
                      <td
                        className="py-3 font-medium"
                        style={{ color: st.color }}
                      >
                        {statusLabelMap[g.status]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </section>

        {/* 5 · Plan de acción priorizado */}
        <section className="mt-9">
          <SectionTitle n={5}>{td.sec5}</SectionTitle>
          {recs.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Sin acciones obligatorias bajo el EU AI Act para este nivel de
              riesgo. Se recomiendan buenas prácticas y códigos de conducta
              voluntarios (Art. 95).
            </p>
          ) : (
            <ol className="space-y-3">
              {recs.map((r, i) => (
                <li
                  key={r.id}
                  className="break-inside-avoid rounded-xl border border-line p-4"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium text-ink">{r.title}</span>
                    <span
                      className="text-[11px] font-semibold uppercase"
                      style={{ color: PRIORITY_COLOR[r.priority] }}
                    >
                      · {r.priority}
                    </span>
                    <span className="text-[11px] text-muted">
                      {td.effortPrefix}
                      {r.effort}
                    </span>
                    <span className="font-mono text-[11px] text-seal">
                      · {r.article}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {r.action}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* 6 · Historial de evaluaciones */}
        <section className="mt-9">
          <SectionTitle n={6}>{td.sec6}</SectionTitle>
          {assessments.length === 0 ? (
            <p className="text-sm text-ink-soft">{td.historyEmpty}</p>
          ) : (
            <ol className="space-y-3">
              {assessments.map((a, i) => (
                <li
                  key={a.id}
                  className="break-inside-avoid border-b border-line pb-3 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge level={a.level} label={riskLabel(a.level, locale)} />
                    <span className="text-xs text-muted">
                      {evidenceLabel(a.evidenceState, locale)}
                    </span>
                    {i === 0 && (
                      <span className="text-[11px] font-medium text-brand-strong">
                        {td.currentBadge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-ink-soft">{a.rationale}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDateTime(a.assessedAt, locale)}
                    {a.attestedByName
                      ? ` ${td.attestedByPrefix}${a.attestedByName}`
                      : ""}
                  </p>
                  {(a.evidenceNote || a.evidenceUrl) && (
                    <p className="mt-1 text-xs text-ink-soft">
                      <span className="text-muted">{td.evidencePrefix}</span>
                      {a.evidenceNote}
                      {a.evidenceNote && a.evidenceUrl ? " · " : ""}
                      {a.evidenceUrl && (
                        <a
                          href={a.evidenceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-medium text-brand underline"
                        >
                          {a.evidenceUrl}
                        </a>
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* 7 · Declaración de responsabilidad */}
        <section className="mt-9 break-inside-avoid">
          <SectionTitle n={7}>{td.sec7}</SectionTitle>
          <div className="rounded-xl border border-line p-5 text-sm text-ink-soft">
            <p>
              Los datos de este dossier han sido{" "}
              <span className="font-medium text-ink">autodeclarados</span> por la
              organización{" "}
              <span className="font-medium text-ink">{orgName ?? "—"}</span> y
              reflejan el estado y la evidencia declarados por sus responsables.
            </p>
            <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
              <Field
                label={td.declFieldBackingLevel}
                value={evidenceLabel(evidenceState, locale)}
              />
              <Field
                label={td.declFieldAttestedBy}
                value={latest?.attestedByName ?? "—"}
              />
            </dl>
          </div>
        </section>

        <footer className="mt-10 border-t border-line pt-5 text-xs text-muted">
          <p>
            {rc.generatedByPrefix}
            <span className="font-medium text-ink">Attesta</span>
            {rc.generatedByOn}
            {fecha}. {rc.footerWorkingDoc}
          </p>
          <p className="mt-1">{LEGAL_PDF_BY_LOCALE[locale]}</p>
        </footer>
      </article>
    </div>
  );
}
