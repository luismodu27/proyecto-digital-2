import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { LegalBlock, LegalDocument } from "@/lib/legal";
import { LEGAL_DOCUMENTS, legalPath } from "@/lib/legal";
import { LEGAL_ENTITY, PRIVACY_CONTACT } from "@/lib/legal/entity";
import { SubprocessorTable } from "./SubprocessorTable";
import { MeasurementOptOut } from "./MeasurementOptOut";

/**
 * Render de un documento legal.
 *
 * DECISIONES DE LECTURA, que en un documento legal no son cosmética:
 *
 *  · **Medida de línea acotada** (`max-w-[68ch]`). Un aviso de privacidad a todo
 *    lo ancho de un monitor no se lee, se hojea — y hojear es exactamente el
 *    fallo que produce las sorpresas después.
 *  · **Índice con anclas** por sección. La gente no lee estos documentos enteros:
 *    entra buscando "cuánto tiempo guardáis los datos" y necesita llegar. Las
 *    anclas son estables porque están en el registro, así que un enlace a una
 *    cláusula concreta sigue funcionando tras una reescritura.
 *  · **Numeración dentro del título** de cada sección, en el propio texto, para
 *    que al citarlo por correo ("vuestra cláusula 6") ambas partes hablen de lo
 *    mismo.
 *
 * Las partes que no son prosa —tabla de subprocesadores, control de rechazo de
 * medición— se insertan por identificador de documento en vez de por una marca
 * dentro del texto: así el contenido legal se mantiene como datos y no acaba
 * llevando marcado dentro.
 */

function Block({ block, locale }: { block: LegalBlock; locale: Locale }) {
  if (block.kind === "p") {
    return (
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
        {block.text[locale]}
      </p>
    );
  }
  if (block.kind === "ul") {
    return (
      <ul className="mt-4 space-y-2.5">
        {block.items[locale].map((item, i) => (
          <li
            key={i}
            className="relative pl-5 text-[15px] leading-relaxed text-ink-soft before:absolute before:left-0 before:top-[0.65em] before:size-1.5 before:rounded-full before:bg-brand/50"
          >
            {item}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="mt-4 rounded-xl border border-[var(--tone-info-bd)] bg-[var(--tone-info-bg)] px-4 py-3 text-[15px] leading-relaxed text-[var(--tone-info-fg)]">
      {block.text[locale]}
    </p>
  );
}

/** Ficha del responsable. Solo se pinta cuando hay datos reales que pintar. */
function ControllerCard({ t }: { t: Dictionary["legal"] }) {
  if (!LEGAL_ENTITY) return null;
  const rows: [string, string][] = [
    [t.controllerName, LEGAL_ENTITY.name],
    [t.controllerAddress, LEGAL_ENTITY.address],
    [t.controllerTaxId, LEGAL_ENTITY.taxId],
    [t.controllerEmail, LEGAL_ENTITY.privacyEmail],
  ];
  if (LEGAL_ENTITY.euRepresentative) {
    rows.push([t.controllerEuRep, LEGAL_ENTITY.euRepresentative]);
  }
  return (
    <section className="mt-10 rounded-2xl border border-line bg-paper-raised p-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        {t.controllerHeading}
      </h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {label}
            </dt>
            <dd className="mt-0.5 text-sm text-ink-soft">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function LegalDocumentView({
  doc,
  locale,
  t,
}: {
  doc: LegalDocument;
  locale: Locale;
  t: Dictionary["legal"];
}) {
  const others = LEGAL_DOCUMENTS.filter((d) => d.id !== doc.id);
  const updated = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${doc.updated}T00:00:00Z`));

  return (
    <div className="container-page py-14 md:py-20">
      <div className="max-w-[68ch]">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
          {t.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          {doc.title[locale]}
        </h1>
        <p className="mt-4 text-lg text-ink-soft">{doc.summary[locale]}</p>
        <p className="mt-4 text-sm text-muted">
          {t.updated}: <time dateTime={doc.updated}>{updated}</time>
        </p>
      </div>

      <ControllerCard t={t} />

      {/* Índice: estos documentos se consultan por partes, no se leen enteros. */}
      <nav aria-labelledby="indice" className="mt-10 max-w-[68ch]">
        <h2
          id="indice"
          className="text-xs font-semibold uppercase tracking-wide text-muted"
        >
          {t.contents}
        </h2>
        <ol className="mt-3 space-y-1.5">
          {doc.sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-sm text-brand underline-offset-4 hover:text-brand-strong hover:underline"
              >
                {section.heading[locale]}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-12 max-w-[68ch]">
        {doc.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="mt-10 scroll-mt-24 first:mt-0"
          >
            <h2 className="font-display text-xl font-semibold text-ink">
              {section.heading[locale]}
            </h2>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} locale={locale} />
            ))}
          </section>
        ))}
      </div>

      {/* Piezas que no son prosa, insertadas por documento. */}
      {doc.id === "subprocessors" && (
        <SubprocessorTable locale={locale} t={t.subprocessors} />
      )}
      {doc.id === "cookies" && <MeasurementOptOut t={t.optOut} />}

      <section className="mt-14 max-w-[68ch] border-t border-line pt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t.contact}
        </h2>
        <a
          href={`mailto:${PRIVACY_CONTACT}`}
          className="mt-2 inline-block text-sm font-medium text-brand hover:text-brand-strong"
        >
          {PRIVACY_CONTACT}
        </a>

        <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-muted">
          {t.otherDocs}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {others.map((other) => (
            <li key={other.id}>
              <Link
                href={legalPath(other, locale)}
                className="text-sm text-brand underline-offset-4 hover:text-brand-strong hover:underline"
              >
                {other.title[locale]}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs leading-relaxed text-muted">{t.lawyerNote}</p>
      </section>
    </div>
  );
}
