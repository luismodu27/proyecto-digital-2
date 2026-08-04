"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Dictionary } from "@/lib/i18n";
import {
  MEASUREMENT_OPT_OUT_EVENT,
  browserSignalsOptOut,
  isMeasurementOptedOut,
  setMeasurementOptOut,
} from "@/lib/telemetry/client";

/**
 * Rechazo explícito de la medición de audiencia.
 *
 * POR QUÉ EXISTE ESTE BOTÓN si ya se respetan GPC y DNT. Porque la posición de
 * "medición de primera parte exenta de consentimiento" se sostiene sobre unas
 * condiciones concretas —propia, agregada, sin cesión, sin cruce entre sitios— y
 * una de las que las autoridades miran es que exista una forma sencilla de
 * oponerse. Sin este botón, la exención depende de que el visitante sepa
 * configurar una señal de navegador que la mayoría no sabe que existe. Con él, la
 * página de cookies deja de ser una explicación y pasa a ser un control.
 *
 * POR QUÉ `useSyncExternalStore` Y NO `useState` + `useEffect`. El estado que se
 * muestra no es de React: vive en `localStorage`, que es un sistema externo. Con
 * el par estado/efecto habría un primer render afirmando "la medición está
 * activa" antes de haber leído nada, corregido un instante después — mentirle al
 * lector justo en la frase donde más importa no hacerlo. Aquí el render del
 * servidor devuelve `unknown` y no se afirma nada hasta saberlo. De regalo, la
 * suscripción al evento `storage` mantiene sincronizadas las pestañas abiertas:
 * rechazar en una y ver "activa" en la de al lado sería desconcertante en la
 * única pantalla del producto cuyo trabajo entero es generar confianza.
 */

type State = "unknown" | "browser" | "opted-out" | "active";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(MEASUREMENT_OPT_OUT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(MEASUREMENT_OPT_OUT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): State {
  if (browserSignalsOptOut()) return "browser";
  return isMeasurementOptedOut() ? "opted-out" : "active";
}

/** En el servidor no se sabe nada del navegador, y así se dice. */
function getServerSnapshot(): State {
  return "unknown";
}

export function MeasurementOptOut({ t }: { t: Dictionary["legal"]["optOut"] }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    setMeasurementOptOut(state !== "opted-out");
  }, [state]);

  const message =
    state === "unknown"
      ? ""
      : state === "browser"
        ? t.browser
        : state === "opted-out"
          ? t.off
          : t.on;

  return (
    <section className="mt-12 max-w-[68ch] rounded-2xl border border-line bg-paper-raised p-6">
      <h2 className="font-display text-lg font-semibold text-ink">{t.heading}</h2>

      {/* `min-h` reserva el hueco: sin él, la línea aparece y empuja el botón. */}
      <p className="mt-2 min-h-[1.5rem] text-[15px] leading-relaxed text-ink-soft">
        {message}
      </p>

      {/* Con señal del navegador el botón sobra: ya se está respetando. */}
      {(state === "active" || state === "opted-out") && (
        <button
          type="button"
          onClick={toggle}
          className="mt-4 rounded-lg border border-line-strong bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand"
        >
          {state === "opted-out" ? t.enable : t.disable}
        </button>
      )}
    </section>
  );
}
