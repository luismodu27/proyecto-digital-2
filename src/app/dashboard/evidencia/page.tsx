import { PageHeader } from "@/components/dashboard/parts";
import { getAiSystems, getEvidenceFiles, getGapItems, isSupabaseConfigured } from "@/lib/data";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/i18n/resolve";
import { uploadEvidence, deleteEvidence } from "@/lib/data/vault-actions";
import { loadSigningKey } from "@/lib/vault/signature";

export const dynamic = "force-dynamic";

/**
 * Vault de evidencia.
 *
 * POR QUÉ TIENE PÁGINA PROPIA en vez de ser un botón dentro de cada brecha. La
 * pregunta que trae aquí a alguien no es «quiero adjuntar un PDF a este control»,
 * es «qué le entrego al auditor el martes». Esa pregunta necesita ver el conjunto:
 * qué hay, qué falta y el botón que produce el paquete. Repartido por fichas, el
 * conjunto no se ve nunca.
 *
 * EL AVISO DE «SIN FIRMA» ES PROMINENTE Y NO UN DETALLE AL PIE. Un paquete sin
 * firmar sirve para uso interno y NO sirve para entregárselo a un tercero, y esa
 * diferencia hay que verla antes de descargarlo, no después de haberlo mandado.
 */
export default async function EvidenciaPage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale).dashboard.vault;

  const [files, gaps, systems] = await Promise.all([
    getEvidenceFiles(),
    getGapItems(),
    getAiSystems(),
  ]);

  // Solo se comprueba SI hay clave, nunca se expone nada de ella.
  let firmado = false;
  try {
    firmado = (await loadSigningKey(process.env as Record<string, string | undefined>)) !== null;
  } catch {
    firmado = false;
  }

  const fmtBytes = (n: number) =>
    n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`;
  const fmtDate = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <p className="max-w-[70ch] text-sm leading-relaxed text-ink-soft">{t.why}</p>

      {/* Paquete de auditoría: lo que la gente viene a buscar. */}
      <section className="mt-6 rounded-2xl border border-line bg-paper-raised p-6">
        <h2 className="font-display text-lg font-semibold text-ink">{t.packageTitle}</h2>
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
          {t.packageBody}
        </p>

        <div
          className={`mt-4 rounded-xl border p-4 ${
            firmado
              ? "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)]"
              : "border-[var(--tone-warn-bd)] bg-[var(--tone-warn-bg)]"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              firmado ? "text-[var(--tone-good-fg)]" : "text-[var(--tone-warn-fg)]"
            }`}
          >
            {firmado ? t.signedTitle : t.unsignedTitle}
          </p>
          <p
            className={`mt-1 max-w-[70ch] text-sm leading-relaxed ${
              firmado ? "text-[var(--tone-good-fg)]" : "text-[var(--tone-warn-fg)]"
            }`}
          >
            {firmado ? t.signedBody : t.unsignedBody}
          </p>
        </div>

        {files.length > 0 ? (
          <a
            href="/api/vault/package"
            className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            {t.packageCta}
          </a>
        ) : (
          <p className="mt-4 text-sm text-muted">{t.packageEmpty}</p>
        )}

        {/* La frontera de la regla nº 1, aquí y dentro del propio paquete. */}
        <dl className="mt-6 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t.attests}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-soft">{t.attestsBody}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t.notAttests}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-soft">{t.notAttestsBody}</dd>
          </div>
        </dl>
      </section>

      {isSupabaseConfigured && (
        <section className="mt-6 rounded-2xl border border-line bg-paper-raised p-6">
          <h2 className="font-display text-lg font-semibold text-ink">{t.uploadTitle}</h2>
          <form action={uploadEvidence} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="back" value="/dashboard/evidencia" />
            <div>
              <label htmlFor="vault-file" className="block text-sm font-medium text-ink">
                {t.fileLabel}
              </label>
              <input
                id="vault-file"
                name="file"
                type="file"
                required
                className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-paper-sunken file:px-3 file:py-1 file:text-sm file:text-ink"
              />
              <p className="mt-1 text-xs text-muted">{t.fileHint}</p>
            </div>
            <div>
              <label htmlFor="vault-anchor" className="block text-sm font-medium text-ink">
                {t.anchorLabel}
              </label>
              {/*
                Un solo desplegable con los dos tipos, y el `name` del campo se
                decide por el prefijo del valor en la acción. Dos selectores
                («¿brecha o sistema?» y luego «¿cuál?») obligan a entender el
                modelo de datos antes de poder subir un PDF.
              */}
              <select
                id="vault-anchor"
                name="anchor"
                required
                defaultValue=""
                className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink"
              >
                <option value="" disabled>
                  {t.anchorPlaceholder}
                </option>
                <optgroup label={t.groupGaps}>
                  {/*
                    En `GapItem` el `id` YA es el uuid de la fila (a diferencia
                    de `AiSystem`, que expone un código legible y guarda el uuid
                    aparte en `dbId`). Son dos convenciones distintas en el mismo
                    modelo, y confundirlas manda al servidor un identificador que
                    no existe.
                  */}
                  {gaps
                    .filter((g) => !g.prohibited)
                    .map((g) => (
                      <option key={g.id} value={`gap:${g.id}`}>
                        {[g.article, g.requirement].filter(Boolean).join(" · ").slice(0, 90)}
                      </option>
                    ))}
                </optgroup>
                <optgroup label={t.groupSystems}>
                  {systems
                    .filter((s) => s.dbId)
                    .map((s) => (
                      <option key={s.id} value={`sys:${s.dbId}`}>
                        {s.name}
                      </option>
                    ))}
                </optgroup>
              </select>
              <p className="mt-1 text-xs text-muted">{t.anchorHint}</p>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
              >
                {t.uploadCta}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-display text-lg font-semibold text-ink">{t.listTitle}</h2>
        {files.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-paper-raised p-6">
            <p className="text-sm text-ink-soft">{t.empty}</p>
            <p className="mt-2 max-w-[70ch] text-sm text-muted">{t.emptyHint}</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-raised p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{f.filename}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {f.attachedTo} · {fmtBytes(f.bytes)} ·{" "}
                    {fmtDate.format(new Date(f.uploadedAt))}
                  </p>
                  {/*
                    La huella se enseña ENTERA y en monoespaciada. Recortarla
                    quedaría más limpio y la volvería inútil: existe para poder
                    compararla con la del paquete, y media huella no se compara.
                  */}
                  <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-muted">
                    {f.sha256}
                  </p>
                </div>
                {isSupabaseConfigured && (
                  <form action={deleteEvidence} className="shrink-0">
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="back" value="/dashboard/evidencia" />
                    <button
                      type="submit"
                      className="rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-[var(--tone-danger-bd)] hover:text-[var(--tone-danger-fg)]"
                    >
                      {t.delete}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
