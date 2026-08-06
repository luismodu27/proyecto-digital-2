import type { Dictionary } from "@/lib/i18n";

/**
 * Cómo verificamos el contenido legal.
 *
 * Existe porque el mayor diferenciador honesto del producto —que el texto
 * regulatorio es determinista y lo revisa un experto— se afirmaba de pasada y
 * no se demostraba en ningún sitio. Un competidor puede decir «usamos IA para
 * generar tu política»; nosotros decimos lo contrario, y eso solo convence si
 * se explica el proceso.
 *
 * REGLA AL EDITAR: aquí solo entran afirmaciones **comprobables** sobre nuestro
 * propio proceso. Es la sección donde una exageración cuesta más cara, porque
 * es literalmente la que promete que no exageramos.
 */
export function Verification({
  t,
}: {
  t: Dictionary["landing"]["verification"];
}) {
  return (
    <section className="border-y border-line bg-paper-sunken">
      <div className="container-page py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-lg text-ink-soft">{t.intro}</p>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((s) => (
            <li
              key={s.n}
              className="flex flex-col rounded-2xl border border-line bg-paper-raised p-6"
            >
              <span className="font-mono text-xs font-semibold tracking-widest text-brand">
                {s.n}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          {/* Lo que NO hacemos. Enumerar los límites es, en esta categoría, más
              creíble que enumerar capacidades: cualquiera promete lo segundo. */}
          <div className="rounded-2xl border border-line bg-paper-raised p-6">
            <h3 className="font-display text-lg font-semibold text-ink">
              {t.notTitle}
            </h3>
            <ul className="mt-4 space-y-3">
              {t.not.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                  <svg
                    viewBox="0 0 16 16"
                    className="mt-0.5 size-4 shrink-0 text-muted"
                    aria-hidden
                  >
                    <path
                      d="M3.5 8h9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <figure className="rounded-2xl border border-line bg-paper-raised p-6">
            <figcaption className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {t.exampleLabel}
            </figcaption>
            <p className="mt-3 font-display text-lg font-semibold text-ink">
              {t.exampleTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {t.exampleBody}
            </p>
          </figure>
        </div>
      </div>
    </section>
  );
}
