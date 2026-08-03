import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import {
  INCIDENT_CATEGORIES,
  SERIOUSNESS,
  daysSinceAware,
  deadlineReference,
  incidentStage,
  notificationPlan,
  suspensionRequired,
  type Incident,
  type IncidentStage,
  type NotifyTarget,
} from "@/lib/incidents/incidents";
import {
  markIncidentNotified,
  setIncidentStatus,
  updateIncidentAssessment,
} from "@/lib/data/incident-actions";

type T = Dictionary["dashboard"]["pages"]["incidents"];

const STAGE_TONE: Record<IncidentStage, string> = {
  attention:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  notified:
    "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  logged:
    "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
  closed:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

const FIELD =
  "mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

function Pill({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tone}`}
    >
      {children}
    </span>
  );
}

/** Casilla con su explicación debajo. La explicación NO es adorno: cada una de
 *  estas cuatro banderas es un matiz legal que se equivoca solo. */
function Flag({
  name,
  label,
  hint,
  checked,
}: {
  name: string;
  label: string;
  hint: string;
  checked: boolean;
}) {
  return (
    <label className="flex gap-2.5 rounded-lg border border-line bg-paper px-3 py-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
      />
      <span className="min-w-0">
        <span className="block text-sm text-ink">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
          {hint}
        </span>
      </span>
    </label>
  );
}

/**
 * Fila de un destinatario: qué declara la organización y cuándo.
 *
 * Lleva `formAction` con la acción de borrar la fecha para poder DESHACER un
 * aviso marcado por error. Que sea reversible no es cosmético: un registro que
 * no se puede corregir se rellena con miedo, o no se rellena.
 */
function NotifyRow({
  incident,
  target,
  order,
  notifiedOn,
  ordered,
  t,
}: {
  incident: Incident;
  target: NotifyTarget;
  order: number;
  notifiedOn: string | null;
  ordered: boolean;
  t: T;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {ordered && (
          <span
            aria-hidden
            className="grid size-5 shrink-0 place-items-center rounded-full border border-line-strong text-[10px] font-medium text-muted"
          >
            {order}
          </span>
        )}
        <span className="text-sm text-ink">{t.targetLabel[target]}</span>
      </div>
      <form
        action={markIncidentNotified}
        className="flex shrink-0 items-center gap-2"
      >
        <input type="hidden" name="id" value={incident.id} />
        <input type="hidden" name="target" value={target} />
        <input
          type="date"
          name="date"
          defaultValue={notifiedOn ?? ""}
          aria-label={`${t.notifyDeclared} — ${t.targetLabel[target]}`}
          className="rounded-lg border border-line-strong bg-paper px-2.5 py-1 text-xs text-ink outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-full border border-line-strong px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand"
        >
          {notifiedOn ? t.undoNotified : t.markNotified}
        </button>
      </form>
    </li>
  );
}

export function IncidentCard({
  incident,
  t,
  locale,
  now,
}: {
  incident: Incident;
  t: T;
  locale: Locale;
  now: Date;
}) {
  const stage = incidentStage(incident);
  const plan = notificationPlan(incident);
  const deadline = deadlineReference(incident, now);
  const elapsed = daysSinceAware(incident, now);
  const u = locale === "en" ? (elapsed === 1 ? "day" : "days") : elapsed === 1 ? "día" : "días";

  return (
    <article className="rounded-2xl border border-line bg-paper-raised">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={STAGE_TONE[stage]}>{t.stageLabel[stage]}</Pill>
            <Pill tone={STAGE_TONE.logged}>
              {t.seriousnessLabel[incident.seriousness]}
            </Pill>
            {incident.personalDataBreach && (
              <Pill tone={STAGE_TONE.attention}>{t.flagPersonalData}</Pill>
            )}
          </div>
          <h3 className="mt-2 font-display text-base font-semibold text-ink">
            {incident.title}
          </h3>
          {incident.systemName && (
            <p className="mt-0.5 text-xs text-muted">{incident.systemName}</p>
          )}
          {incident.detail && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {incident.detail}
            </p>
          )}
        </div>
        <form action={setIncidentStatus} className="shrink-0">
          <input type="hidden" name="id" value={incident.id} />
          <input
            type="hidden"
            name="status"
            value={incident.status === "open" ? "closed" : "open"}
          />
          <button
            type="submit"
            className="rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand"
          >
            {incident.status === "open" ? t.close : t.reopen}
          </button>
        </form>
      </div>

      {/* Cronómetro ASCENDENTE. El Art. 26.5 dice «inmediatamente», no da días:
          una cuenta atrás aquí inventaría un plazo. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-5 py-2.5 text-xs text-muted">
        <span>
          {elapsed <= 0 ? t.elapsedToday : `${t.elapsedPrefix}${elapsed} ${u}`}
        </span>
        <span className="tabular-nums">
          {t.fieldAwareOn}: {incident.awareOn}
        </span>
        {incident.occurredOn && (
          <span className="tabular-nums">
            {t.fieldOccurredOn}: {incident.occurredOn}
          </span>
        )}
        {incident.causalLinkOn && (
          <span className="tabular-nums">
            {t.fieldCausalLinkOn}: {incident.causalLinkOn}
          </span>
        )}
      </div>

      {suspensionRequired(incident) && (
        <p
          className={`border-t border-line px-5 py-2.5 text-xs font-medium ${
            incident.useSuspended
              ? "text-[var(--tone-good-fg)]"
              : "text-[var(--tone-danger-fg)]"
          }`}
        >
          {incident.useSuspended ? t.suspendDone : t.suspendRequired}
        </p>
      )}

      {/* Plazo del Art. 73. La etiqueta dice DE QUIÉN es: por defecto del
          proveedor, y solo pasa a ser propio si se declaró que no se le pudo
          contactar. */}
      {deadline && (
        <div className="border-t border-line px-5 py-3">
          <p className="text-xs font-medium text-ink">
            {deadline.owner === "provider"
              ? t.deadlineProviderTitle
              : t.deadlineSelfTitle}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {deadline.owner === "provider"
              ? t.deadlineProviderBody
              : t.deadlineSelfBody}
          </p>
          <p className="mt-1.5 text-xs tabular-nums text-ink-soft">
            {t.deadlineRef}
            {deadline.days}
            {t.deadlineDaysSuffix} → {deadline.dueOn}
          </p>
        </div>
      )}

      {/* A quién informar */}
      <div className="border-t border-line px-5 py-3">
        <p className="text-xs font-medium text-ink">{t.notifyTitle}</p>
        {plan.steps.length === 0 ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {t.notifyNothing}
          </p>
        ) : (
          <>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {plan.ordered ? t.notifyOrderedNote : t.notifySimultaneousNote}
            </p>
            <ul className="mt-1 divide-y divide-line">
              {plan.steps.map((s) => (
                <NotifyRow
                  key={s.target}
                  incident={incident}
                  target={s.target}
                  order={s.order}
                  notifiedOn={s.notifiedOn}
                  ordered={plan.ordered}
                  t={t}
                />
              ))}
            </ul>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              {t.notifyDisclaimer}
            </p>
          </>
        )}
      </div>

      {/* Calificación editable */}
      <details className="border-t border-line">
        <summary className="cursor-pointer list-none px-5 py-2.5 text-xs font-medium text-brand [&::-webkit-details-marker]:hidden">
          {t.detailsToggle}
        </summary>
        <form
          action={updateIncidentAssessment}
          className="grid gap-3 border-t border-line px-5 py-4"
        >
          <input type="hidden" name="id" value={incident.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="text-xs font-medium text-muted">
                {t.fieldSeriousness}
              </span>
              <select
                name="seriousness"
                defaultValue={incident.seriousness}
                className={FIELD}
              >
                {SERIOUSNESS.map((s) => (
                  <option key={s} value={s}>
                    {t.seriousnessLabel[s]}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-muted">
                {t.seriousnessHint}
              </span>
            </label>
            <label>
              <span className="text-xs font-medium text-muted">
                {t.fieldCausalLinkOn}
              </span>
              <input
                type="date"
                name="causalLinkOn"
                defaultValue={incident.causalLinkOn ?? ""}
                className={FIELD}
              />
              <span className="mt-1 block text-[11px] text-muted">
                {t.fieldCausalLinkOnHint}
              </span>
            </label>
          </div>

          <fieldset>
            <legend className="text-xs font-medium text-muted">
              {t.fieldCategories}
            </legend>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
              {t.categoriesHint}
            </p>
            <div className="mt-1.5 grid gap-1.5">
              {INCIDENT_CATEGORIES.map((c) => (
                <label key={c} className="flex items-start gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    name="categories"
                    value={c}
                    defaultChecked={incident.categories.includes(c)}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
                  />
                  <span>{t.categoryLabel[c]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-2 sm:grid-cols-2">
            <Flag
              name="riskArt79"
              label={t.flagRisk79}
              hint={t.flagRisk79Hint}
              checked={incident.riskArt79}
            />
            <Flag
              name="useSuspended"
              label={t.flagSuspended}
              hint={t.flagSuspendedHint}
              checked={incident.useSuspended}
            />
            <Flag
              name="providerUnreachable"
              label={t.flagProviderUnreachable}
              hint={t.flagProviderUnreachableHint}
              checked={incident.providerUnreachable}
            />
            <Flag
              name="personalDataBreach"
              label={t.flagPersonalData}
              hint={t.flagPersonalDataHint}
              checked={incident.personalDataBreach}
            />
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t.saveAssessment}
            </button>
          </div>
        </form>
      </details>
    </article>
  );
}
