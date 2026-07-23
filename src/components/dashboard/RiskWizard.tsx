"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import {
  classify,
  visibleQuestions,
  NONE,
  type Answers,
  type Question,
} from "@/lib/risk-assessment";
import { riskLabel } from "@/lib/mock-data";
import { saveRiskAssessment } from "@/lib/data/actions";
import { recommendationsForLevel } from "@/lib/recommendations";
import { RecommendationList } from "@/components/dashboard/Recommendations";
import { LegalNote, LEGAL_RESULT_BY_LOCALE } from "@/components/ui/LegalNote";
import { useT, useLocale } from "@/lib/i18n/provider";

type SystemOption = { id: string; name: string };

function toggle(
  question: Question,
  current: string[],
  value: string,
): string[] {
  if (question.type === "single") return [value];
  // multi: "ninguna" es exclusiva
  if (value === NONE) return [NONE];
  const next = current.filter((v) => v !== NONE);
  return next.includes(value)
    ? next.filter((v) => v !== value)
    : [...next, value];
}

export function RiskWizard({
  systems = [],
  connected = false,
  presetSystemId,
}: {
  systems?: SystemOption[];
  connected?: boolean;
  presetSystemId?: string;
}) {
  const router = useRouter();
  const tw = useT().dashboard.pages.wizard;
  const tr = tw.result;
  const locale = useLocale();
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [systemId, setSystemId] = useState(presetSystemId ?? "");
  const [attestedBy, setAttestedBy] = useState("");
  const [evidence, setEvidence] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  const questions = useMemo(
    () => visibleQuestions(answers, locale),
    [answers, locale],
  );
  const clampedIndex = Math.min(index, questions.length - 1);
  const question = questions[clampedIndex];
  const selected = answers[question.id] ?? [];
  const canAdvance = selected.length > 0;
  const isLast = clampedIndex === questions.length - 1;

  function choose(value: string) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: toggle(question, prev[question.id] ?? [], value),
    }));
  }

  function next() {
    if (isLast) setDone(true);
    else setIndex(clampedIndex + 1);
  }

  function back() {
    if (clampedIndex > 0) setIndex(clampedIndex - 1);
  }

  function reset() {
    setAnswers({});
    setIndex(0);
    setDone(false);
    setSystemId(presetSystemId ?? "");
    setAttestedBy("");
    setEvidence("");
    setSaveState("idle");
  }

  if (done) {
    const result = classify(answers, undefined, locale);
    // Un sistema de alto riesgo que además dispara transparencia debe cumplir
    // AMBOS: las obligaciones del Art. 50 se suman a las de alto riesgo.
    const alsoTransparency =
      result.level === "high" &&
      (answers.transparency ?? []).filter((v) => v !== NONE).length > 0;

    const evidenceIsUrl = /^https?:\/\//i.test(evidence.trim());
    const hasEvidence = evidence.trim().length > 0;

    async function handleSave() {
      if (!systemId) return;
      setSaveState("saving");
      const res = await saveRiskAssessment(systemId, answers, result, {
        attestedByName: attestedBy,
        url: evidenceIsUrl ? evidence : undefined,
        note: evidenceIsUrl ? undefined : evidence,
      });
      if (res.ok) {
        setSaveState("saved");
        // Refresca los server components (inventario, dossier, historial).
        router.refresh();
      } else {
        setSaveState("error");
      }
    }

    const canSave = connected && systems.length > 0;
    const recs = recommendationsForLevel(result.level, locale);
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-7">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {tr.indicativeLabel}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
              {riskLabel(result.level, locale)}{" "}
              <span className="text-base font-normal text-muted">
                {tr.indicativeSuffix}
              </span>
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{tr.indicativeDesc}</p>
          </div>
          <RiskBadge level={result.level} label={riskLabel(result.level, locale)} />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink-soft">
          {result.rationale}
        </p>

        {alsoTransparency && (
          <p className="mt-4 rounded-lg border border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)] px-4 py-3 text-sm text-[var(--tone-warn-fg)]">
            {tr.transparencyPre}
            <span className="font-medium">{tr.transparencyArticle}</span>
            {tr.transparencyMid}
            <span className="font-medium">{tr.transparencyEmphasis}</span>
            {tr.transparencyPost}
          </p>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-ink">
              {tr.obligationsTitle}
            </h3>
            <ul className="mt-3 space-y-2">
              {result.obligations.map((o) => (
                <li key={o} className="flex gap-2 text-sm text-ink-soft">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-ink">
              {tr.regulatoryBasisTitle}
            </h3>
            <ul className="mt-3 space-y-2">
              {result.citations.map((c) => (
                <li
                  key={c.article}
                  className="rounded-lg border border-line bg-paper px-3 py-2 text-sm"
                >
                  <span className="font-mono text-xs font-medium text-seal">
                    {c.article}
                  </span>
                  <span className="ml-2 text-ink-soft">{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {recs.length > 0 && (
          <div className="mt-8 border-t border-line pt-6">
            <h3 className="font-display text-sm font-semibold text-ink">
              {result.level === "unacceptable"
                ? tr.immediateAction
                : tr.criticalPoints}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {result.level === "unacceptable"
                ? tr.prohibitedNote
                : tr.prioritizeNote}
            </p>
            <div className="mt-4">
              <RecommendationList recs={recs} locale={locale} />
            </div>
          </div>
        )}

        {canSave && (
          <div className="mt-8 border-t border-line pt-6">
            {saveState === "saved" ? (
              <div className="rounded-xl border border-[var(--tone-good-bd)] bg-brand-soft px-4 py-3 text-sm text-brand-strong">
                <p>
                  {tr.savedPre}
                  <span className="font-medium">
                    {hasEvidence ? tr.withEvidenceTag : tr.declaredTag}
                  </span>
                  {tr.savedMid}
                  {attestedBy.trim()
                    ? `${tr.savedAttestedPrefix}${attestedBy.trim()}`
                    : ""}
                  .
                </p>
                {systemId && (
                  <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:gap-4">
                    <Link
                      href={`/dashboard/inventario/${systemId}/dossier`}
                      className="inline-flex items-center gap-1 font-medium underline"
                    >
                      {tr.viewDossier}
                    </Link>
                    <Link
                      href={`/dashboard/packs?system=${systemId}`}
                      className="inline-flex items-center gap-1 font-medium underline"
                    >
                      {tr.detectGaps}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-display text-sm font-semibold text-ink">
                  {tr.saveTitle}
                </h3>
                <div>
                  <label
                    htmlFor="save-system"
                    className="block text-sm font-medium text-ink"
                  >
                    {tr.systemLabel}
                  </label>
                  <select
                    id="save-system"
                    value={systemId}
                    onChange={(e) => setSystemId(e.target.value)}
                    disabled={!!presetSystemId}
                    className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand disabled:opacity-60"
                  >
                    <option value="">{tr.systemPlaceholder}</option>
                    {systems.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="attested-by"
                      className="block text-sm font-medium text-ink"
                    >
                      {tr.attestedByLabel}
                    </label>
                    <input
                      id="attested-by"
                      value={attestedBy}
                      onChange={(e) => setAttestedBy(e.target.value)}
                      placeholder={tr.attestedByPlaceholder}
                      className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="evidence"
                      className="block text-sm font-medium text-ink"
                    >
                      {tr.evidenceLabel}{" "}
                      <span className="font-normal text-muted">{tr.optional}</span>
                    </label>
                    <input
                      id="evidence"
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                      placeholder={tr.evidencePlaceholder}
                      className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted">
                  {hasEvidence ? tr.evidenceHintYes : tr.evidenceHintNo}
                </p>
                <Button
                  onClick={handleSave}
                  disabled={!systemId || saveState === "saving"}
                  variant="primary"
                >
                  {saveState === "saving" ? tr.saving : tr.saveButton}
                </Button>
              </div>
            )}
            {saveState === "error" && (
              <p className="mt-2 text-sm text-[var(--tone-danger-fg)]" role="alert">
                {tr.saveError}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
          <Button onClick={reset} variant="primary">
            {tw.evaluateAnother}
          </Button>
          <Link
            href="/dashboard/riesgo"
            className="inline-flex items-center justify-center rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper-sunken"
          >
            {tw.backToRisk}
          </Link>
        </div>

        <LegalNote text={LEGAL_RESULT_BY_LOCALE[locale]} className="mt-6" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-7">
      {/* Progreso */}
      <div className="flex items-center gap-2">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= clampedIndex ? "bg-brand" : "bg-paper-sunken"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">
        {tw.stepPrefix}
        {clampedIndex + 1}
        {tw.stepOf}
        {questions.length}
      </p>

      {/* Pregunta */}
      <h2 id="wizard-question" className="mt-2 font-display text-xl font-semibold text-ink">
        {question.title}
      </h2>
      {question.help && (
        <p className="mt-2 text-sm text-ink-soft">{question.help}</p>
      )}

      {/* Opciones */}
      <div
        className="mt-5 space-y-2.5"
        role="group"
        aria-labelledby="wizard-question"
        aria-describedby="wizard-select-mode"
      >
        <p id="wizard-select-mode" className="sr-only">
          {question.type === "single" ? tw.selectSingle : tw.selectMultiple}
        </p>
        {question.choices.map((c) => {
          const active = selected.includes(c.value);
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => choose(c.value)}
              aria-pressed={active}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-brand bg-brand-soft"
                  : "border-line bg-paper hover:border-line-strong hover:bg-paper-sunken/50"
              }`}
            >
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center border ${
                  question.type === "single" ? "rounded-full" : "rounded-md"
                } ${
                  active ? "border-brand bg-brand text-white" : "border-line-strong"
                }`}
              >
                {active && (
                  <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                    <path
                      d="m3.5 8.5 3 3 6-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">
                  {c.label}
                </span>
                {c.hint && (
                  <span className="mt-0.5 block text-xs text-muted">{c.hint}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navegación */}
      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={clampedIndex === 0}
          className="text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-40"
        >
          {tw.back}
        </button>
        <Button onClick={next} disabled={!canAdvance} variant="primary">
          {isLast ? tw.seeResult : tw.next}
        </Button>
      </div>
    </div>
  );
}
