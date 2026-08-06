import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { Subprocessor } from "@/lib/legal/subprocessors";
import {
  corpusOnlySubprocessors,
  customerDataSubprocessors,
} from "@/lib/legal/subprocessors";

/**
 * Tabla de subprocesadores, en dos grupos.
 *
 * EL GRUPO SEPARADO NO ES UN DETALLE DE MAQUETA. Mezclar en una sola tabla a
 * quien guarda el inventario de un cliente y a quien solo calcula vectores sobre
 * el texto del Reglamento obliga al lector a deducir la diferencia leyendo la
 * columna "qué recibe" de cada fila. Separados, la respuesta a la pregunta que
 * trae —"¿quién toca mis datos?"— está en el primer grupo y se acabó.
 *
 * En móvil se convierte en tarjetas: una tabla de cuatro columnas de texto largo
 * en un teléfono no se lee, y este es un documento que la gente abre desde el
 * correo. Se hace duplicando el marcado (`hidden`/`md:hidden`) en vez de con
 * scroll horizontal, porque el scroll lateral esconde columnas justamente en el
 * sitio donde ocultar información es lo último que interesa.
 */

function StatusChip({
  status,
  t,
}: {
  status: Subprocessor["status"];
  t: Dictionary["legal"]["subprocessors"];
}) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--tone-good-fg)]">
        {t.statusActive}
      </span>
    );
  }
  return (
    <span
      title={t.statusGatedHint}
      className="inline-flex items-center rounded-full border border-[var(--tone-neutral-bd)] bg-[var(--tone-neutral-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--tone-neutral-fg)]"
    >
      {t.statusGated}
    </span>
  );
}

function ProviderName({
  item,
  t,
}: {
  item: Subprocessor;
  t: Dictionary["legal"]["subprocessors"];
}) {
  return (
    <>
      <span className="font-medium text-ink">{item.name}</span>
      <span className="ml-2 align-middle">
        <StatusChip status={item.status} t={t} />
      </span>
      <a
        href={item.privacyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block text-xs text-brand underline-offset-4 hover:underline"
      >
        {t.privacyLink}
      </a>
      {item.hosts.length > 0 && (
        <span className="mt-1 block font-mono text-[11px] text-muted">
          {item.hosts.join(" · ")}
        </span>
      )}
    </>
  );
}

function Group({
  heading,
  intro,
  items,
  locale,
  t,
}: {
  heading: string;
  intro: string;
  items: readonly Subprocessor[];
  locale: Locale;
  t: Dictionary["legal"]["subprocessors"];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-semibold text-ink">{heading}</h2>
      <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-ink-soft">
        {intro}
      </p>

      {/* Escritorio: tabla. */}
      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-paper-sunken/60">
            <tr>
              {[t.colProvider, t.colPurpose, t.colData, t.colLocation].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-line align-top">
                <th scope="row" className="w-52 px-4 py-4 text-left font-normal">
                  <ProviderName item={item} t={t} />
                </th>
                <td className="px-4 py-4 leading-relaxed text-ink-soft">
                  {item.purpose[locale]}
                </td>
                <td className="px-4 py-4 leading-relaxed text-ink-soft">
                  {item.data[locale]}
                </td>
                <td className="px-4 py-4 leading-relaxed text-ink-soft">
                  {item.location[locale]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil: tarjetas. */}
      <div className="mt-6 space-y-4 md:hidden">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-line bg-paper-raised p-5"
          >
            <ProviderName item={item} t={t} />
            <dl className="mt-3 space-y-3">
              {(
                [
                  [t.colPurpose, item.purpose[locale]],
                  [t.colData, item.data[locale]],
                  [t.colLocation, item.location[locale]],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SubprocessorTable({
  locale,
  t,
}: {
  locale: Locale;
  t: Dictionary["legal"]["subprocessors"];
}) {
  return (
    <>
      <Group
        heading={t.customerHeading}
        intro={t.customerIntro}
        items={customerDataSubprocessors()}
        locale={locale}
        t={t}
      />
      <Group
        heading={t.corpusHeading}
        intro={t.corpusIntro}
        items={corpusOnlySubprocessors()}
        locale={locale}
        t={t}
      />
    </>
  );
}
