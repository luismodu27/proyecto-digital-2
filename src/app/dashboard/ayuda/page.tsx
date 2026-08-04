import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/i18n/resolve";
import { HELP_SECTIONS } from "@/lib/help/articles";
import { LEGAL_DOCUMENTS, legalPath } from "@/lib/legal";
import { PRIVACY_CONTACT } from "@/lib/legal/entity";

/**
 * Centro de ayuda dentro del panel.
 *
 * POR QUÉ AQUÍ Y NO EN LA WEB PÚBLICA. Quien tiene una duda la tiene **usando el
 * producto**, no navegando por la landing. Una ayuda que obliga a salir de la
 * aplicación, buscar el sitio web y encontrar el enlace en un pie de página se
 * consulta la mitad de veces — y las que no se consultan acaban en un correo, o
 * peor, en abandonar.
 *
 * Todo abierto, sin acordeones. Un acordeón oculta el 90 % del contenido y
 * rompe la búsqueda del navegador (Ctrl+F), que es como la gente busca de verdad
 * en una página de ayuda. Con este volumen, la lista completa cabe.
 *
 * El contacto va ARRIBA, no enterrado al final: quien no encuentra su respuesta
 * abandona antes de llegar al pie, y esa es exactamente la persona a la que hay
 * que dar una salida.
 */
export default async function AyudaPage() {
  const locale = await resolveLocale();
  const dict = getDictionary(locale);
  const t = dict.dashboard.help;

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <section className="rounded-2xl border border-line bg-paper-raised p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t.contactTitle}
        </h2>
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
          {t.contactBody}
        </p>
        <a
          href={`mailto:${PRIVACY_CONTACT}`}
          className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
        >
          {t.contactCta}
        </a>
      </section>

      <div className="mt-8 space-y-10">
        {HELP_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="font-display text-xl font-semibold text-ink">
              {section.title[locale]}
            </h2>
            <div className="mt-4 space-y-4">
              {section.articles.map((a) => (
                <article
                  key={a.id}
                  id={a.id}
                  className="scroll-mt-24 rounded-2xl border border-line bg-paper-raised p-6"
                >
                  <h3 className="font-display text-base font-semibold text-ink">
                    {a.question[locale]}
                  </h3>
                  {a.answer[locale].map((p, i) => (
                    <p
                      key={i}
                      className="mt-3 max-w-[72ch] text-sm leading-relaxed text-ink-soft"
                    >
                      {p}
                    </p>
                  ))}
                  {a.href && (
                    <Link
                      href={a.href}
                      className="mt-4 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline"
                    >
                      {t.goTo} →
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-line bg-paper-sunken/40 p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t.legalTitle}
        </h2>
        <p className="mt-2 text-sm text-ink-soft">{t.legalBody}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {LEGAL_DOCUMENTS.map((doc) => (
            <li key={doc.id}>
              <Link
                href={legalPath(doc, locale)}
                className="text-sm text-brand underline-offset-4 hover:underline"
              >
                {doc.title[locale]}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
