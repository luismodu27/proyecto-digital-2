"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";
import {
  classify,
  visibleQuestions,
  NONE,
  type Answers,
  type Question,
} from "@/lib/risk-assessment";
import { RISK_LABEL } from "@/lib/mock-data";
import { saveRiskAssessment } from "@/lib/data/actions";
import { recommendationsForLevel } from "@/lib/recommendations";
import { RecommendationList } from "@/components/dashboard/Recommendations";

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
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [systemId, setSystemId] = useState(presetSystemId ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  const questions = useMemo(() => visibleQuestions(answers), [answers]);
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
    setSaveState("idle");
  }

  if (done) {
    const result = classify(answers);
    // Un sistema de alto riesgo que además dispara transparencia debe cumplir
    // AMBOS: las obligaciones del Art. 50 se suman a las de alto riesgo.
    const alsoTransparency =
      result.level === "high" &&
      (answers.transparency ?? []).filter((v) => v !== NONE).length > 0;

    async function handleSave() {
      if (!systemId) return;
      setSaveState("saving");
      const res = await saveRiskAssessment(systemId, answers, result);
      setSaveState(res.ok ? "saved" : "error");
    }

    const canSave = connected && systems.length > 0;
    const recs = recommendationsForLevel(result.level);
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-7">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Resultado de la clasificación
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
              {RISK_LABEL[result.level]}
            </h2>
          </div>
          <RiskBadge level={result.level} />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ink-soft">
          {result.rationale}
        </p>

        {alsoTransparency && (
          <p className="mt-4 rounded-lg border border-[#e6cba3] bg-[#f7ead8] px-4 py-3 text-sm text-[#8a4f14]">
            Además, este sistema está sujeto a las obligaciones de transparencia
            del <span className="font-medium">Art. 50</span>, que se{" "}
            <span className="font-medium">suman</span> a las de alto riesgo.
          </p>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-display text-sm font-semibold text-ink">
              Obligaciones aplicables
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
              Base regulatoria
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
              Puntos críticos y próximos pasos
            </h3>
            <p className="mt-1 text-xs text-muted">
              Qué priorizar para cumplir, ordenado por urgencia.
            </p>
            <div className="mt-4">
              <RecommendationList recs={recs} />
            </div>
          </div>
        )}

        {canSave && (
          <div className="mt-8 border-t border-line pt-6">
            {saveState === "saved" ? (
              <div className="rounded-xl border border-[#bfdccf] bg-brand-soft px-4 py-3 text-sm text-brand-strong">
                ✓ Clasificación guardada. El sistema quedó actualizado a{" "}
                <span className="font-medium">{RISK_LABEL[result.level]}</span> y
                se registró en el audit-trail.
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label
                    htmlFor="save-system"
                    className="block text-sm font-medium text-ink"
                  >
                    Guardar esta clasificación en un sistema
                  </label>
                  <select
                    id="save-system"
                    value={systemId}
                    onChange={(e) => setSystemId(e.target.value)}
                    disabled={!!presetSystemId}
                    className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
                  >
                    <option value="">Selecciona un sistema…</option>
                    {systems.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!systemId || saveState === "saving"}
                  variant="primary"
                >
                  {saveState === "saving" ? "Guardando…" : "Guardar clasificación"}
                </Button>
              </div>
            )}
            {saveState === "error" && (
              <p className="mt-2 text-sm text-[#8f271f]">
                No se pudo guardar. Inténtalo de nuevo.
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
          <Button onClick={reset} variant="primary">
            Evaluar otro sistema
          </Button>
          <Link
            href="/dashboard/riesgo"
            className="inline-flex items-center justify-center rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink hover:bg-paper-sunken"
          >
            Volver a riesgo
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted">
          Orientación de compliance, no asesoría legal. Los casos límite deben
          revisarse con un experto.
        </p>
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
        Paso {clampedIndex + 1} de {questions.length}
      </p>

      {/* Pregunta */}
      <h2 className="mt-2 font-display text-xl font-semibold text-ink">
        {question.title}
      </h2>
      {question.help && (
        <p className="mt-2 text-sm text-ink-soft">{question.help}</p>
      )}

      {/* Opciones */}
      <div className="mt-5 space-y-2.5">
        {question.choices.map((c) => {
          const active = selected.includes(c.value);
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => choose(c.value)}
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
          ← Atrás
        </button>
        <Button onClick={next} disabled={!canAdvance} variant="primary">
          {isLast ? "Ver resultado" : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}
