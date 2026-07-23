"use client";

import { useFormStatus } from "react-dom";
import { runVigiaNow } from "@/lib/data/vigia-actions";
import { useT } from "@/lib/i18n/provider";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useT().dashboard.buttons;
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? t.vigiaRunning : t.vigiaRun}
    </button>
  );
}

/**
 * Dispara una pasada del Vigía a demanda. Útil para verificar el foso sin
 * esperar al cron. En producción el cron lo ejecuta en un horario.
 */
export function VigiaRunButton() {
  return (
    <form action={runVigiaNow}>
      <SubmitButton />
    </form>
  );
}
