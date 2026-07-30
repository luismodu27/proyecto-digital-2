import Link from "next/link";
import type { QuotaState } from "@/lib/billing/limits";

/**
 * Indicador de consumo de un cupo (sistemas o asientos).
 *
 * Solo se pinta cuando aporta información: si el plan no tiene tope, o si queda
 * mucho margen, no aparece. Un contador permanente de "3 de 25" en una pantalla que
 * se visita a diario es ruido, y además convierte la herramienta en un recordatorio
 * constante de que pagas por unidades — justo la sensación que no queremos en un
 * producto de gobernanza.
 *
 * Aparece en dos momentos, los dos útiles:
 *  · al cruzar el 80 % (aviso, tono de atención) → hay tiempo de reaccionar;
 *  · al llegar al tope (tono de bloqueo) → explica por qué el botón no funciona.
 *
 * OJO con las clases: van **literales** en un mapa y no interpoladas
 * (`text-[var(--tone-${tone}-fg)]` NO funciona). Tailwind v4 escanea el código en
 * busca de cadenas de clase completas; una construida en tiempo de ejecución no
 * genera CSS y el aviso saldría sin color, que es peor que no salir.
 */
const TONES = {
  warn: {
    box: "border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)]",
    text: "text-[var(--tone-warn-fg)]",
    bar: "bg-[var(--tone-warn-fg)]",
  },
  danger: {
    box: "border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)]",
    text: "text-[var(--tone-danger-fg)]",
    bar: "bg-[var(--tone-danger-fg)]",
  },
} as const;

export function QuotaMeter({
  state,
  label,
  nearText,
  atText,
  upgradeHref = "/dashboard/facturacion",
  upgradeText,
}: {
  state: QuotaState;
  /** "12 de 25 sistemas", ya resuelto por quien llama (tiene el diccionario). */
  label: string;
  nearText: string;
  atText: string;
  upgradeHref?: string;
  upgradeText: string;
}) {
  // Sin tope, o con margen de sobra: no hay nada que decir.
  if (state.unlimited || (!state.nearLimit && !state.atLimit)) return null;

  const blocking = state.atLimit;
  const tone = blocking ? TONES.danger : TONES.warn;
  const pct = Math.round((state.ratio ?? 0) * 100);

  return (
    <div className={`mb-6 rounded-2xl border p-4 sm:p-5 ${tone.box}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className={`text-sm font-medium ${tone.text}`}>{label}</p>
        <Link
          href={upgradeHref}
          className={`text-xs font-medium underline decoration-1 underline-offset-2 ${tone.text}`}
        >
          {upgradeText}
        </Link>
      </div>

      {/* Barra de consumo. `aria-hidden` porque el texto de arriba ya dice la
          cifra exacta: repetirla en un rol de progressbar solo duplicaría el
          anuncio del lector de pantalla. */}
      <div
        aria-hidden
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-paper-sunken"
      >
        <div
          className={`h-full rounded-full ${tone.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className={`mt-3 text-xs ${tone.text}`}>{blocking ? atText : nearText}</p>
    </div>
  );
}
