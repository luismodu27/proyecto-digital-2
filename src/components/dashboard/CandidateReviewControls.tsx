"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { enrichCandidate, rejectCandidate } from "@/lib/data/reg-pipeline-actions";
import {
  REG_KIND_LABEL_BY_LOCALE,
  FRAMEWORK_META_BY_LOCALE,
  type RegKind,
  type RegFramework,
} from "@/lib/regulatory-watch";
import { riskLabel, type RegCandidate, type RiskLevel } from "@/lib/mock-data";
import { useT, useLocale } from "@/lib/i18n/provider";

const RISK_LEVELS = ["unacceptable", "high", "limited", "minimal"] as const;

const inputCls =
  "w-full rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";
const labelCls =
  "text-[11px] font-medium uppercase tracking-wide text-muted";

/**
 * Controles del Validador para un candidato en borrador. Cierra el bucle del
 * Vigía: un editor para completar la señal (fecha, tipo, textos, artículos,
 * alcance) y publicarla como evento del radar, o descartarla.
 */
export function CandidateReviewControls({ c }: { c: RegCandidate }) {
  const tcc = useT().dashboard.pages.candidateControls;
  const locale = useLocale();
  const frameworks = Object.entries(FRAMEWORK_META_BY_LOCALE[locale]) as [
    RegFramework,
    (typeof FRAMEWORK_META_BY_LOCALE)[typeof locale][RegFramework],
  ][];
  const kinds = Object.entries(REG_KIND_LABEL_BY_LOCALE[locale]) as [
    RegKind,
    string,
  ][];
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState(c.kind ?? "");
  const [date, setDate] = useState(c.date ?? "");
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const rejectFormRef = useRef<HTMLFormElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const rejectTriggerRef = useRef<HTMLButtonElement>(null);
  const rejectTitleId = useId();

  const publishable = Boolean(kind && date);
  const isSignal = !c.kind || !c.date;

  // Cierra el modal y devuelve el foco al botón que lo abrió (a11y de teclado).
  const closeReject = useCallback(() => {
    setRejecting(false);
    rejectTriggerRef.current?.focus();
  }, []);

  // Modal de descarte accesible (sustituye a window.prompt): foco al abrir + Escape.
  useEffect(() => {
    if (!rejecting) return;
    noteRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeReject();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [rejecting, closeReject]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {open
            ? tcc.closeEditor
            : isSignal
              ? tcc.completeAndPublish
              : tcc.editAndPublish}
        </button>

        <form action={rejectCandidate} ref={rejectFormRef}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="note" value={note} />
          <button
            ref={rejectTriggerRef}
            type="button"
            onClick={() => setRejecting(true)}
            className="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
          >
            {tcc.discard}
          </button>
        </form>
      </div>

      {rejecting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={rejectTitleId}
        >
          <button
            type="button"
            aria-label={tcc.close}
            onClick={closeReject}
            className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-[2px]"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-line bg-paper-raised p-6 shadow-[0_24px_60px_-24px_rgba(15,26,20,0.55)]">
            <h2
              id={rejectTitleId}
              className="font-display text-base font-semibold text-ink"
            >
              {tcc.discardTitle}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              {tcc.discardBodyBefore}
              {c.title}
              {tcc.discardBodyAfter}
            </p>
            <label
              htmlFor={`rej-${c.id}`}
              className={`${labelCls} mt-4 block`}
            >
              {tcc.reasonLabel}
            </label>
            <textarea
              id={`rej-${c.id}`}
              ref={noteRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={tcc.rejectPlaceholder}
              className={`${inputCls} mt-1`}
            />
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={closeReject}
                className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
              >
                {tcc.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejecting(false);
                  rejectFormRef.current?.requestSubmit();
                }}
                className="inline-flex items-center justify-center rounded-full border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-4 py-2 text-sm font-medium text-[var(--tone-danger-fg)] transition-colors hover:opacity-90"
              >
                {tcc.discard}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSignal && !open && (
        <p className="max-w-xl text-xs text-muted">
          <span className="font-medium text-ink-soft">
            {tcc.signalUnanalyzedBold}
          </span>
          {tcc.signalUnanalyzedRest}
        </p>
      )}

      {open && (
        <form action={enrichCandidate} className="rounded-xl border border-line bg-paper p-4">
          <input type="hidden" name="id" value={c.id} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={`t-${c.id}`} className={labelCls}>
                {tcc.fieldTitle}
              </label>
              <input
                id={`t-${c.id}`}
                name="title"
                defaultValue={c.title}
                required
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor={`fw-${c.id}`} className={labelCls}>
                {tcc.fieldFramework}
              </label>
              <select
                id={`fw-${c.id}`}
                name="framework"
                defaultValue={c.framework}
                className={inputCls}
              >
                {frameworks.map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.short}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`k-${c.id}`} className={labelCls}>
                {tcc.fieldKind} <span className="text-[var(--tone-danger-fg)]">*</span>
              </label>
              <select
                id={`k-${c.id}`}
                name="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className={inputCls}
              >
                <option value="">{tcc.fieldKindChoose}</option>
                {kinds.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`d-${c.id}`} className={labelCls}>
                {tcc.fieldEventDate}{" "}
                <span className="text-[var(--tone-danger-fg)]">*</span>
              </label>
              <input
                id={`d-${c.id}`}
                name="event_date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor={`eid-${c.id}`} className={labelCls}>
                {tcc.fieldEventId}
              </label>
              <input
                id={`eid-${c.id}`}
                name="proposed_event_id"
                defaultValue={c.proposedEventId ?? ""}
                placeholder={tcc.fieldEventIdPlaceholder}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`s-${c.id}`} className={labelCls}>
                {tcc.fieldSummary}
              </label>
              <textarea
                id={`s-${c.id}`}
                name="summary"
                defaultValue={c.summary ?? ""}
                rows={2}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`im-${c.id}`} className={labelCls}>
                {tcc.fieldImpact}
              </label>
              <textarea
                id={`im-${c.id}`}
                name="impact"
                defaultValue={c.impact ?? ""}
                rows={2}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`ac-${c.id}`} className={labelCls}>
                {tcc.fieldAction}
              </label>
              <textarea
                id={`ac-${c.id}`}
                name="action"
                defaultValue={c.action ?? ""}
                rows={2}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`ar-${c.id}`} className={labelCls}>
                {tcc.fieldArticles}
              </label>
              <input
                id={`ar-${c.id}`}
                name="articles"
                defaultValue={c.articles.join(", ")}
                placeholder={tcc.fieldArticlesPlaceholder}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <span className={labelCls}>{tcc.fieldScope}</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <label className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    name="scope_all"
                    defaultChecked={c.scope.all ?? false}
                    className="accent-[var(--color-brand)]"
                  />
                  {tcc.scopeAll}
                </label>
                {RISK_LEVELS.map((lvl) => (
                  <label
                    key={lvl}
                    className="flex items-center gap-1.5 text-sm text-ink-soft"
                  >
                    <input
                      type="checkbox"
                      name={`risk_${lvl}`}
                      defaultChecked={c.scope.riskLevels?.includes(lvl) ?? false}
                      className="accent-[var(--color-brand)]"
                    />
                    {riskLabel(lvl as RiskLevel, locale)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3">
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={!publishable}
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tcc.publishToRadar}
            </button>
            <button
              type="submit"
              name="intent"
              value="save"
              className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
            >
              {tcc.saveDraft}
            </button>
            {!publishable && (
              <span className="text-xs text-muted">{tcc.publishRequired}</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
