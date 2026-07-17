"use client";

import { setOrgJurisdictions } from "@/lib/data/jurisdiction-actions";
import {
  JURISDICTION_ORDER,
  JURISDICTION_LABEL,
} from "@/lib/regulatory-watch";

/**
 * Configurador del nexo de jurisdicción (owner/admin): marca dónde contrata la
 * organización para que el radar priorice esas normativas. Colapsable para no
 * robar protagonismo al radar.
 */
export function JurisdictionSettings({ selected }: { selected: string[] }) {
  return (
    <details className="mb-6 rounded-2xl border border-line bg-paper-raised">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-medium text-ink">
          Ajustar mis jurisdicciones
        </span>
        <span className="text-xs text-muted">
          Dónde contratas · afina el radar
        </span>
      </summary>
      <form action={setOrgJurisdictions} className="border-t border-line px-5 py-4">
        <p className="mb-3 text-xs text-muted">
          Marca los territorios donde tu organización contrata o tiene
          empleados. El radar priorizará las normas de esas jurisdicciones.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {JURISDICTION_ORDER.map((j) => (
            <label
              key={j}
              className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft"
            >
              <input
                type="checkbox"
                name="jurisdiction"
                value={j}
                defaultChecked={selected.includes(j)}
                className="size-4 rounded border-line-strong text-brand focus:ring-brand/30"
              />
              {JURISDICTION_LABEL[j]}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Guardar
        </button>
      </form>
    </details>
  );
}
