"use client";

import { useState } from "react";
import { enrichCandidate, rejectCandidate } from "@/lib/data/reg-pipeline-actions";
import { REG_KIND_LABEL, FRAMEWORK_META } from "@/lib/regulatory-watch";
import { RISK_LABEL, type RegCandidate } from "@/lib/mock-data";

const RISK_LEVELS = ["unacceptable", "high", "limited", "minimal"] as const;
const FRAMEWORKS = Object.entries(FRAMEWORK_META);
const KINDS = Object.entries(REG_KIND_LABEL);

const inputCls =
  "w-full rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";
const labelCls =
  "text-[11px] font-medium uppercase tracking-wide text-muted";

/**
 * Controles del Validador para un candidato en borrador. Cierra el bucle del
 * Vigía: un editor para completar la señal (fecha, tipo, textos, artículos,
 * alcance) y publicarla como evento del radar, o descartarla.
 */
export function CandidateReviewControls({ c }: { c: RegCandidate }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState(c.kind ?? "");
  const [date, setDate] = useState(c.date ?? "");

  const publishable = Boolean(kind && date);
  const isSignal = !c.kind || !c.date;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {open ? "Cerrar editor" : isSignal ? "Completar y publicar" : "Editar y publicar"}
        </button>

        <form
          action={rejectCandidate}
          onSubmit={(e) => {
            const note = window.prompt(
              `Motivo para descartar «${c.title}» (opcional):`,
              "",
            );
            if (note === null) {
              e.preventDefault();
              return;
            }
            const hidden = e.currentTarget.elements.namedItem(
              "note",
            ) as HTMLInputElement | null;
            if (hidden) hidden.value = note;
          }}
        >
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="note" value="" />
          <button
            type="submit"
            className="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
          >
            Descartar
          </button>
        </form>
      </div>

      {isSignal && !open && (
        <p className="max-w-xl text-xs text-muted">
          <span className="font-medium text-ink-soft">
            Señal del Vigía sin analizar.
          </span>{" "}
          Ábrela para completar fecha y tipo de evento (obligatorios para
          publicar) y afinar los textos; o descártala si es ruido.
        </p>
      )}

      {open && (
        <form action={enrichCandidate} className="rounded-xl border border-line bg-paper p-4">
          <input type="hidden" name="id" value={c.id} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={`t-${c.id}`} className={labelCls}>
                Título
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
                Marco
              </label>
              <select
                id={`fw-${c.id}`}
                name="framework"
                defaultValue={c.framework}
                className={inputCls}
              >
                {FRAMEWORKS.map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.short}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`k-${c.id}`} className={labelCls}>
                Tipo de evento <span className="text-[var(--tone-danger-fg)]">*</span>
              </label>
              <select
                id={`k-${c.id}`}
                name="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                className={inputCls}
              >
                <option value="">— elegir —</option>
                {KINDS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`d-${c.id}`} className={labelCls}>
                Fecha del evento <span className="text-[var(--tone-danger-fg)]">*</span>
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
                Id del evento al publicar
              </label>
              <input
                id={`eid-${c.id}`}
                name="proposed_event_id"
                defaultValue={c.proposedEventId ?? ""}
                placeholder="se genera si lo dejas vacío"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`s-${c.id}`} className={labelCls}>
                Resumen (qué es)
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
                Impacto para el deployer
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
                Acción propuesta (qué hacer)
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
                Artículos (separados por coma)
              </label>
              <input
                id={`ar-${c.id}`}
                name="articles"
                defaultValue={c.articles.join(", ")}
                placeholder="Art. 26, Anexo III"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <span className={labelCls}>Alcance (a qué sistemas afecta)</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <label className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    name="scope_all"
                    defaultChecked={c.scope.all ?? false}
                    className="accent-[var(--color-brand)]"
                  />
                  Toda la organización
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
                    {RISK_LABEL[lvl]}
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
              Publicar en el radar
            </button>
            <button
              type="submit"
              name="intent"
              value="save"
              className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
            >
              Guardar borrador
            </button>
            {!publishable && (
              <span className="text-xs text-muted">
                Fecha y tipo de evento son obligatorios para publicar.
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
