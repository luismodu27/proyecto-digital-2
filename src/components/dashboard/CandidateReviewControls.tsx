"use client";

import { useState } from "react";
import { approveCandidate, rejectCandidate } from "@/lib/data/reg-pipeline-actions";

/**
 * Controles del Validador para un candidato en borrador: publicarlo como evento
 * del radar (con un id de evento editable) o descartarlo con una nota.
 */
export function CandidateReviewControls({
  id,
  proposedEventId,
  title,
  publishable,
}: {
  id: string;
  proposedEventId: string | null;
  title: string;
  /**
   * Un candidato solo puede publicarse si tiene fecha y tipo (los exige el RPC
   * approve_reg_candidate). Las señales del Vigía llegan sin ambos → no
   * publicables hasta que el Analista (o un humano) las enriquezca.
   */
  publishable: boolean;
}) {
  const [eventId, setEventId] = useState(proposedEventId ?? "");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      {publishable ? (
        <form action={approveCandidate} className="flex flex-col gap-1">
          <input type="hidden" name="id" value={id} />
          <label
            htmlFor={`eid-${id}`}
            className="text-[11px] font-medium uppercase tracking-wide text-muted"
          >
            Id del evento al publicar
          </label>
          <div className="flex items-center gap-2">
            <input
              id={`eid-${id}`}
              name="eventId"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="se genera si lo dejas vacío"
              className="w-56 rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Publicar
            </button>
          </div>
        </form>
      ) : (
        <p className="max-w-md text-xs text-muted">
          <span className="font-medium text-ink-soft">
            Señal del Vigía sin analizar.
          </span>{" "}
          Requiere fecha y tipo de evento antes de publicarse: el Analista (o un
          humano) debe enriquecerla. Por ahora, ábrela y —si es ruido—
          descártala.
        </p>
      )}

      <form
        action={rejectCandidate}
        onSubmit={(e) => {
          const note = window.prompt(
            `Motivo para descartar «${title}» (opcional):`,
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
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="note" value="" />
        <button
          type="submit"
          className="text-xs font-medium text-muted transition-colors hover:text-[var(--tone-danger-fg)]"
        >
          Descartar
        </button>
      </form>
    </div>
  );
}
