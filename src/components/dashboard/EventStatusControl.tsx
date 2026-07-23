"use client";

import { setEventStatus } from "@/lib/data/reg-actions";
import type { RegAckStatus } from "@/lib/mock-data";
import { useT } from "@/lib/i18n/provider";

/** Selector de estado interno de un evento regulatorio (autoenvía al cambiar). */
export function EventStatusControl({
  eventId,
  status,
}: {
  eventId: string;
  status?: RegAckStatus;
}) {
  const s = useT().dashboard.controls.eventStatus;
  return (
    <form action={setEventStatus}>
      <input type="hidden" name="eventId" value={eventId} />
      <select
        name="status"
        defaultValue={status ?? ""}
        aria-label={s.aria}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand"
      >
        <option value="">{s.unset}</option>
        <option value="reviewed">{s.reviewed}</option>
        <option value="planned">{s.planned}</option>
        <option value="not_applicable">{s.notApplicable}</option>
      </select>
    </form>
  );
}
