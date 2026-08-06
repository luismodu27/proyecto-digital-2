import type { Dictionary } from "@/lib/i18n";
import type { Supplier } from "@/lib/suppliers/types";
import {
  EVIDENCE_KINDS,
  EVIDENCE_STATUSES,
  LEGAL_BASES,
  coverage,
  type EvidenceKind,
  type LegalBasis,
  type SupplierEvidence,
} from "@/lib/suppliers/evidence";
import {
  deleteSupplier,
  saveSupplierEvidence,
  updateSupplier,
} from "@/lib/data/supplier-actions";

type T = Dictionary["dashboard"]["pages"]["suppliers"];

const FIELD =
  "mt-1 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand";

const STATUS_TONE: Record<string, string> = {
  received: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  verifiedPublicly:
    "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  refused:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  requested: "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
  notRequested:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
  notApplicable:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

/** El verbo del grupo es la afirmación jurídica de la sección. Va en el título,
 *  no en letra pequeña: es lo que el usuario tiene que aprender de esta pantalla. */
const BASIS_TONE: Record<LegalBasis, string> = {
  deliverable: "text-[var(--tone-good-fg)]",
  publicSource: "text-[var(--tone-info-fg)]",
  contractOnly: "text-[var(--tone-gold-fg)]",
  existsNoAccess: "text-muted",
};

function Pill({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tone}`}
    >
      {children}
    </span>
  );
}

/**
 * Fila de un elemento del catálogo. Se pinta SIEMPRE, tenga o no fila guardada:
 * el valor de esta pantalla es tanto lo que consta como lo que falta, y una
 * lista que solo enseña lo ya pedido no dice nada sobre los huecos.
 */
function EvidenceRow({
  supplier,
  kind,
  saved,
  t,
}: {
  supplier: Supplier;
  kind: EvidenceKind;
  saved?: SupplierEvidence;
  t: T;
}) {
  const label = t.kinds[kind.key as keyof typeof t.kinds];
  const status = saved?.status ?? "notRequested";
  return (
    <li className="border-t border-line px-5 py-3">
      <details>
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="text-sm text-ink">{label}</span>
            <span className="ml-2 whitespace-nowrap text-[11px] text-muted">
              {kind.article}
            </span>
            {saved?.systemName && (
              <span className="ml-2 text-[11px] text-muted">· {saved.systemName}</span>
            )}
          </span>
          <Pill tone={STATUS_TONE[status]}>{t.statuses[status]}</Pill>
        </summary>

        <form
          action={saveSupplierEvidence}
          className="mt-3 grid gap-3 rounded-xl border border-line bg-paper p-4 sm:grid-cols-2"
        >
          <input type="hidden" name="supplierId" value={supplier.id} />
          <input type="hidden" name="kind" value={kind.key} />
          {saved && <input type="hidden" name="id" value={saved.id} />}

          <label>
            <span className="text-xs font-medium text-muted">{t.evidenceTitle}</span>
            <select name="status" defaultValue={status} className={FIELD}>
              {EVIDENCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t.statuses[s]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="text-xs font-medium text-muted">{t.fieldVersion}</span>
            <input
              name="documentVersion"
              defaultValue={saved?.documentVersion ?? ""}
              className={FIELD}
            />
            <span className="mt-1 block text-[11px] leading-relaxed text-muted">
              {t.fieldVersionHint}
            </span>
          </label>

          <label>
            <span className="text-xs font-medium text-muted">
              {t.statuses.requested}
            </span>
            <input
              type="date"
              name="requestedOn"
              defaultValue={saved?.requestedOn ?? ""}
              className={FIELD}
            />
          </label>
          <label>
            <span className="text-xs font-medium text-muted">
              {t.statuses.received}
            </span>
            <input
              type="date"
              name="receivedOn"
              defaultValue={saved?.receivedOn ?? ""}
              className={FIELD}
            />
          </label>

          <label className={kind.expires ? "" : "sm:col-span-2"}>
            <span className="text-xs font-medium text-muted">{t.fieldSourceUrl}</span>
            <input
              name="sourceUrl"
              defaultValue={saved?.sourceUrl ?? ""}
              className={FIELD}
            />
          </label>

          {/* La fecha de caducidad SOLO existe donde caduca de verdad. En el
              resto ni se ofrece: el servidor la descartaría igualmente, pero
              enseñar el campo ya sugeriría que ahí hay una caducidad. */}
          {kind.expires && (
            <label>
              <span className="text-xs font-medium text-muted">{t.fieldExpires}</span>
              <input
                type="date"
                name="expiresOn"
                defaultValue={saved?.expiresOn ?? ""}
                className={FIELD}
              />
              <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                {t.fieldExpiresHint}
              </span>
            </label>
          )}

          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-muted">{t.fieldNote}</span>
            <textarea
              name="note"
              rows={2}
              defaultValue={saved?.note ?? ""}
              className={FIELD}
            />
            <span className="mt-1 block text-[11px] leading-relaxed text-muted">
              {t.statusHintRefused}
            </span>
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t.save}
            </button>
          </div>
        </form>
      </details>
    </li>
  );
}

export function SupplierCard({
  supplier,
  evidence,
  t,
}: {
  supplier: Supplier;
  evidence: SupplierEvidence[];
  t: T;
}) {
  const byKind = new Map(evidence.map((e) => [e.kind, e]));
  const c = coverage(
    EVIDENCE_KINDS.map(
      (k) =>
        byKind.get(k.key) ?? {
          id: `virtual-${k.key}`,
          supplierId: supplier.id,
          systemId: null,
          systemName: null,
          kind: k.key,
          status: "notRequested" as const,
          requestedOn: null,
          receivedOn: null,
          documentVersion: null,
          sourceUrl: null,
          expiresOn: null,
          note: null,
        },
    ),
  );

  return (
    <article className="rounded-2xl border border-line bg-paper-raised">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-ink">
              {supplier.name}
            </h3>
            <Pill tone={STATUS_TONE.notRequested}>
              {t.roles[supplier.aiActRole]}
            </Pill>
            {supplier.outsideEu && (
              <Pill tone={STATUS_TONE.requested}>{t.flagOutsideEu}</Pill>
            )}
            {supplier.dpaSigned && (
              <Pill tone={STATUS_TONE.received}>{t.flagDpa}</Pill>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">
            {[supplier.country, t.gdprRoles[supplier.gdprRole], supplier.contact]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {supplier.note && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {supplier.note}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {/* Hechos, no nota: cuántos elementos constan y cuántos faltan.
              Un "% de cumplimiento del proveedor" no tiene base normativa y sería copy prohibido. attesta-copy-ok: comentario que explica por qué NO se hace; no es texto de interfaz. */}
          <p className="font-display text-xl font-semibold text-ink tabular-nums">
            {c.covered}
            <span className="text-sm font-normal text-muted">/{c.total}</span>
          </p>
          <p className="text-[11px] text-muted">{t.statCovered}</p>
        </div>
      </div>

      {/* Bandera roja del Art. 25.2 */}
      {supplier.excludesHighRiskUse && (
        <p className="border-t border-line bg-[var(--tone-danger-bg)] px-5 py-2.5 text-xs leading-relaxed text-[var(--tone-danger-fg)]">
          {t.flagExcludesHighRisk} — {t.flagExcludesHighRiskHint}
        </p>
      )}

      {supplier.outsideEu && (
        <p className="border-t border-line px-5 py-2.5 text-xs leading-relaxed text-muted">
          {t.fieldAuthorizedRep}: {supplier.authorizedRep ?? "—"}
          {supplier.authorizedRepCheckedOn &&
            ` · ${t.fieldAuthorizedRepChecked} ${supplier.authorizedRepCheckedOn}`}
        </p>
      )}

      {/* Evidencia agrupada POR VERBO. El agrupamiento es el mensaje: lo que se
          exige, lo que se verifica y lo que se negocia no son la misma gestión. */}
      {LEGAL_BASES.map((basis) => {
        const kinds = EVIDENCE_KINDS.filter((k) => k.basis === basis);
        if (kinds.length === 0) return null;
        return (
          <section key={basis} className="border-t border-line">
            <div className="px-5 pt-3">
              <h4 className={`text-xs font-semibold uppercase tracking-wide ${BASIS_TONE[basis]}`}>
                {t.verbs[basis]}
              </h4>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                {t.verbHints[basis]}
              </p>
            </div>
            <ul className="mt-2">
              {kinds.map((k) => (
                <EvidenceRow
                  key={k.key}
                  supplier={supplier}
                  kind={k}
                  saved={byKind.get(k.key)}
                  t={t}
                />
              ))}
            </ul>
          </section>
        );
      })}

      {/* Ficha editable + baja */}
      <details className="border-t border-line">
        <summary className="cursor-pointer list-none px-5 py-2.5 text-xs font-medium text-brand [&::-webkit-details-marker]:hidden">
          {t.save}
        </summary>
        <div className="border-t border-line px-5 py-4">
          <form action={updateSupplier} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={supplier.id} />
            <label>
              <span className="text-xs font-medium text-muted">{t.fieldCountry}</span>
              <input name="country" defaultValue={supplier.country ?? ""} className={FIELD} />
            </label>
            <label>
              <span className="text-xs font-medium text-muted">{t.fieldRole}</span>
              <select name="aiActRole" defaultValue={supplier.aiActRole} className={FIELD}>
                {(Object.keys(t.roles) as (keyof typeof t.roles)[]).map((r) => (
                  <option key={r} value={r}>
                    {t.roles[r]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-xs font-medium text-muted">{t.fieldGdprRole}</span>
              <select name="gdprRole" defaultValue={supplier.gdprRole} className={FIELD}>
                {(Object.keys(t.gdprRoles) as (keyof typeof t.gdprRoles)[]).map((r) => (
                  <option key={r} value={r}>
                    {t.gdprRoles[r]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-xs font-medium text-muted">{t.fieldContact}</span>
              <input name="contact" defaultValue={supplier.contact ?? ""} className={FIELD} />
            </label>
            <label>
              <span className="text-xs font-medium text-muted">{t.fieldAuthorizedRep}</span>
              <input
                name="authorizedRep"
                defaultValue={supplier.authorizedRep ?? ""}
                className={FIELD}
              />
            </label>
            <label>
              <span className="text-xs font-medium text-muted">
                {t.fieldAuthorizedRepChecked}
              </span>
              <input
                type="date"
                name="authorizedRepCheckedOn"
                defaultValue={supplier.authorizedRepCheckedOn ?? ""}
                className={FIELD}
              />
            </label>
            <label>
              <span className="text-xs font-medium text-muted">{t.fieldContractEnds}</span>
              <input
                type="date"
                name="contractEndsOn"
                defaultValue={supplier.contractEndsOn ?? ""}
                className={FIELD}
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-xs font-medium text-muted">{t.fieldNote}</span>
              <textarea name="note" rows={2} defaultValue={supplier.note ?? ""} className={FIELD} />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="outsideEu"
                defaultChecked={supplier.outsideEu}
                className="size-4 accent-[var(--color-brand)]"
              />
              {t.flagOutsideEu}
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="dpaSigned"
                defaultChecked={supplier.dpaSigned}
                className="size-4 accent-[var(--color-brand)]"
              />
              {t.flagDpa}
            </label>
            <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
              <input
                type="checkbox"
                name="excludesHighRiskUse"
                defaultChecked={supplier.excludesHighRiskUse}
                className="size-4 accent-[var(--color-brand)]"
              />
              {t.flagExcludesHighRisk}
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {t.save}
              </button>
            </div>
          </form>

          <form action={deleteSupplier} className="mt-4 border-t border-line pt-3">
            <input type="hidden" name="id" value={supplier.id} />
            <button
              type="submit"
              className="text-xs font-medium text-[var(--tone-danger-fg)] hover:underline"
            >
              {t.remove}
            </button>
          </form>
        </div>
      </details>
    </article>
  );
}
