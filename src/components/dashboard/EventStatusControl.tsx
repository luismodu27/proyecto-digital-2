"use client";

import { setEventStatus } from "@/lib/data/reg-actions";
import type { RegAckStatus } from "@/lib/mock-data";

/** Selector de estado interno de un evento regulatorio (autoenvía al cambiar). */
export function EventStatusControl({
  eventId,
  status,
}: {
  eventId: string;
  status?: RegAckStatus;
}) {
  return (
    <form action={setEventStatus}>
      <input type="hidden" name="eventId" value={eventId} />
      <select
        name="status"
        defaultValue={status ?? ""}
        aria-label="Estado interno"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
      >
        <option value="">Sin marcar</option>
        <option value="reviewed">Revisado</option>
        <option value="planned">Plan en marcha</option>
        <option value="not_applicable">No aplica</option>
      </select>
    </form>
  );
}
