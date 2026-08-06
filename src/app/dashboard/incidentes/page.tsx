import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { LegalNote, LEGAL_FOOTER_BY_LOCALE } from "@/components/ui/LegalNote";
import { IncidentCard } from "@/components/dashboard/IncidentCard";
import { ReadonlySetting } from "@/components/dashboard/ReadonlySetting";
import {
  getAiSystems,
  getCurrentMemberRole,
  getIncidents,
  getReviewCadenceDays,
  getSystemsForSelect,
  isSupabaseConfigured,
} from "@/lib/data";
import { canEditSettings, settingsAccess } from "@/lib/dashboard/settings-access";
import {
  SERIOUSNESS,
  countIncidents,
  sortIncidents,
} from "@/lib/incidents/incidents";
import {
  REVIEW_CADENCE_CHOICES,
  REVIEW_TRIGGERS,
  collectReviewsDue,
  type ReviewState,
} from "@/lib/incidents/review";
import { createIncident, updateReviewCadence } from "@/lib/data/incident-actions";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

// Lleva cronómetro desde la fecha de conocimiento y ventana de revisión: sin
// esto la página se serviría cacheada y los días no avanzarían.
export const dynamic = "force-dynamic";

const FIELD =
  "mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

const REVIEW_TONE: Record<ReviewState, string> = {
  overdue:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  unknown:
    "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  due_soon:
    "bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)] border-[var(--tone-gold-bd)]",
  ok: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
};

const CADENCE_LABEL_KEY = {
  180: "cadence180",
  365: "cadence365",
  730: "cadence730",
} as const;

export default async function IncidentesPage() {
  const [incidents, systems, systemOpts, cadenceDays, role] = await Promise.all([
    getIncidents(),
    getAiSystems(),
    getSystemsForSelect(),
    getReviewCadenceDays(),
    getCurrentMemberRole(),
  ]);
  const locale = await resolveLocale();
  const dd = getDictionary(locale).dashboard;
  const t = dd.pages.incidents;
  const controls = dd.controls;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const counts = countIncidents(incidents);
  const sorted = sortIncidents(incidents);
  const reviewsDue = collectReviewsDue(systems, cadenceDays, now);
  // La autorización real la impone `set_review_cadence` (security definer, con
  // el guard de owner/admin dentro). Esto solo evita ofrecer un botón que iba a
  // fallar con un error genérico.
  const access = settingsAccess({ role, isConnected: isSupabaseConfigured });
  const cadenceLabel = t[CADENCE_LABEL_KEY[cadenceDays as 180 | 365 | 730]] ?? t.cadence365;

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {/* Encuadre temporal. Va arriba a propósito: sin él, un registro de
          incidentes se lee como una obligación que ya corre, y el Art. 26 no es
          exigible para el Anexo III hasta diciembre de 2027. */}
      <p className="rounded-2xl border border-line bg-paper-raised px-5 py-3 text-xs leading-relaxed text-ink-soft">
        {t.legalFrame}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            [counts.open, t.statOpen, false],
            [counts.serious, t.statSerious, false],
            [counts.attention, t.statAttention, counts.attention > 0],
            [counts.unsuspended, t.statUnsuspended, counts.unsuspended > 0],
          ] as [number, string, boolean][]
        ).map(([value, label, alert]) => (
          <div
            key={label}
            className="rounded-2xl border border-line bg-paper-raised p-4"
          >
            <p
              className={`font-display text-2xl font-semibold ${
                alert ? "text-[var(--tone-danger-fg)]" : "text-ink"
              }`}
            >
              {value}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Alta de expediente */}
      <details className="mt-6 rounded-2xl border border-line bg-paper-raised">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-medium text-ink">{t.newIncident}</span>
          <span className="text-xs text-muted">{t.newIncidentHint}</span>
        </summary>
        <form
          action={createIncident}
          className="grid gap-3 border-t border-line px-5 py-4 sm:grid-cols-2"
        >
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-muted">{t.fieldTitle}</span>
            <input
              name="title"
              required
              placeholder={t.fieldTitlePlaceholder}
              className={FIELD}
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-muted">{t.fieldDetail}</span>
            <textarea name="detail" rows={2} className={FIELD} />
          </label>
          <label>
            <span className="text-xs font-medium text-muted">{t.fieldSystem}</span>
            <select name="systemId" defaultValue="" className={FIELD}>
              <option value="">—</option>
              {systemOpts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-medium text-muted">
              {t.fieldSeriousness}
            </span>
            <select
              name="seriousness"
              defaultValue="under_assessment"
              className={FIELD}
            >
              {SERIOUSNESS.map((s) => (
                <option key={s} value={s}>
                  {t.seriousnessLabel[s]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-medium text-muted">
              {t.fieldOccurredOn}
            </span>
            <input type="date" name="occurredOn" max={today} className={FIELD} />
          </label>
          <label>
            <span className="text-xs font-medium text-muted">{t.fieldAwareOn}</span>
            <input
              type="date"
              name="awareOn"
              required
              max={today}
              defaultValue={today}
              className={FIELD}
            />
            <span className="mt-1 block text-[11px] leading-relaxed text-muted">
              {t.fieldAwareOnHint}
            </span>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t.create}
            </button>
          </div>
        </form>
      </details>

      {/* Los dos relojes del RGPD. Se enseña siempre, no solo cuando hay una
          bandera marcada: el error que evita es creer que un aviso vale por el
          otro, y ese error se comete ANTES de marcar nada. */}
      <section className="mt-6 rounded-2xl border border-line bg-paper-raised px-5 py-4">
        <h2 className="text-sm font-medium text-ink">{t.gdprTitle}</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted">
          {t.gdprBody}
        </p>
      </section>

      {/* Expedientes */}
      {sorted.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-paper-raised px-6 py-12 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            {t.emptyTitle}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            {t.emptyBody}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {sorted.map((i) => (
            <IncidentCard key={i.id} incident={i} t={t} locale={locale} now={now} />
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Revisión periódica de la autoevaluación                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="mt-10 rounded-2xl border border-line bg-paper-raised">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink">
              {t.reviewTitle}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-ink-soft">
              {t.reviewSubtitle}
            </p>
          </div>
          {canEditSettings(access) ? (
            <form action={updateReviewCadence} className="flex items-end gap-2">
              <label>
                <span className="text-xs font-medium text-muted">
                  {t.cadenceLabel}
                </span>
                <select
                  name="cadenceDays"
                  defaultValue={String(cadenceDays)}
                  className={FIELD}
                >
                  {REVIEW_CADENCE_CHOICES.map((d) => (
                    <option key={d} value={d}>
                      {t[CADENCE_LABEL_KEY[d]]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand"
              >
                {t.saveCadence}
              </button>
            </form>
          ) : (
            <ReadonlySetting
              label={t.cadenceLabel}
              value={cadenceLabel}
              note={controls.ownerAdminOnly}
            />
          )}
        </div>

        {/* La nota de buena práctica NO es letra pequeña opcional: el
            Reglamento no fija periodicidad, y hay un test que rompe si este
            texto se reescribe como una obligación. */}
        <p className="border-t border-line px-5 py-3 text-xs leading-relaxed text-muted">
          {t.cadenceNote}
        </p>

        {reviewsDue.length === 0 ? (
          <p className="border-t border-line px-5 py-6 text-center text-sm text-muted">
            {t.reviewEmpty}
          </p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {reviewsDue.map((r) => (
              <li
                key={r.systemId}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/inventario/${r.systemId}`}
                    className="truncate text-sm font-medium text-ink hover:text-brand"
                  >
                    {r.systemName}
                  </Link>
                  <p className="mt-0.5 text-xs tabular-nums text-muted">
                    {t.reviewLastPrefix}
                    {r.lastReviewed ?? t.reviewNever}
                    {r.dueOn && ` · ${t.reviewDuePrefix}${r.dueOn}`}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${REVIEW_TONE[r.state]}`}
                >
                  {t.reviewStateLabel[r.state]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Disparadores por evento */}
      <section className="mt-6 rounded-2xl border border-line bg-paper-raised px-5 py-4">
        <h2 className="text-sm font-medium text-ink">{t.triggersTitle}</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted">
          {t.triggersNote}
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {REVIEW_TRIGGERS.map((trig) => (
            <li
              key={trig.key}
              className="flex items-start gap-2 rounded-lg border border-line bg-paper px-3 py-2"
            >
              <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
              <span className="min-w-0 text-sm text-ink">
                {t.triggers[trig.key as keyof typeof t.triggers]}
                {trig.article && (
                  <span className="ml-1.5 whitespace-nowrap text-[11px] text-muted">
                    {trig.article}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-3xl text-[11px] leading-relaxed text-muted">
          {t.art27Note}
        </p>
      </section>

      <LegalNote className="mt-8" text={LEGAL_FOOTER_BY_LOCALE[locale]} />
    </>
  );
}
