import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import type { MemberRole } from "@/lib/mock-data";
import { daysUntilPurge, type OrgDeletionState } from "@/lib/org-lifecycle";
import { cancelOrgDeletion, requestOrgDeletion } from "@/lib/data/org-actions";
import { GRACE_DAYS } from "@/lib/org-lifecycle";

/**
 * Zona de peligro: baja de la organización.
 *
 * DECISIONES DE DISEÑO, que aquí son de seguridad y no de estética:
 *
 *  · **La exportación va ANTES del formulario**, no en otra página. Quien llega
 *    aquí va a destruir su expediente; el momento de ofrecerle llevárselo es
 *    ese, no un enlace en otro menú que ya no volverá a mirar. Además convierte
 *    la pantalla de borrado en la pantalla de portabilidad, que es el otro
 *    derecho que hay que ofrecer y que si no acaba escondido.
 *  · **Se escribe el nombre a mano.** Un `confirm()` se acepta por reflejo; el
 *    nombre obliga a leer QUÉ organización se está dando de baja, que es lo que
 *    importa cuando se pertenece a varias.
 *  · **Lo que se enumera es lo que se pierde**, con nombres de módulos reales
 *    (proveedores, incidentes, registro de auditoría), no un "todos tus datos"
 *    genérico que nadie procesa.
 *  · **A quien no es propietario no se le enseña un botón deshabilitado**, se le
 *    explica quién puede hacerlo. Un botón gris invita a insistir.
 *
 * La autorización real está en la RPC (`request_org_deletion` comprueba que
 * quien llama es propietario). Lo de aquí es cortesía, no barrera.
 */
export function OrgDeletion({
  orgId,
  orgName,
  role,
  state,
  locale,
  t,
}: {
  orgId: string;
  orgName: string;
  role: MemberRole | null;
  state: OrgDeletionState | null;
  locale: Locale;
  t: Dictionary["dashboard"]["organizations"]["deletion"];
}) {
  const isOwner = role === "owner";

  if (state) {
    const days = daysUntilPurge(state);
    const date = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(state.purgeAt));

    return (
      <section className="mt-6 rounded-2xl border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--tone-danger-fg)]">
          {t.pendingTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--tone-danger-fg)]">
          {t.pendingBody(days, date)}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/api/export"
            className="rounded-lg border border-line-strong bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
          >
            {t.exportCta}
          </a>
          {isOwner && (
            <form action={cancelOrgDeletion}>
              <input type="hidden" name="orgId" value={orgId} />
              <button
                type="submit"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
              >
                {t.cancelCta}
              </button>
            </form>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-line bg-paper-raised p-6">
      <h2 className="font-display text-lg font-semibold text-ink">{t.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t.intro}</p>

      {/* Portabilidad primero: es el momento en que de verdad hace falta. */}
      <div className="mt-4 rounded-xl border border-line bg-paper-sunken/50 p-4">
        <p className="text-sm text-ink-soft">{t.exportFirst}</p>
        <a
          href="/api/export"
          className="mt-3 inline-block rounded-lg border border-line-strong bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
        >
          {t.exportCta}
        </a>
      </div>

      <p className="mt-4 text-sm text-muted">{t.graceNotice(GRACE_DAYS)}</p>

      {!isOwner ? (
        <p className="mt-4 text-sm text-muted">{t.ownerOnly}</p>
      ) : (
        <form action={requestOrgDeletion} className="mt-5">
          <input type="hidden" name="orgId" value={orgId} />
          <label
            htmlFor="confirm-org-name"
            className="block text-sm font-medium text-ink"
          >
            {t.confirmLabel}
          </label>
          <p className="mt-1 text-xs text-muted">{t.confirmHint(orgName)}</p>
          <input
            id="confirm-org-name"
            name="confirm"
            required
            autoComplete="off"
            className="mt-2 w-full max-w-sm rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="mt-4 block rounded-lg border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-4 py-2 text-sm font-medium text-[var(--tone-danger-fg)] transition-colors hover:brightness-95"
          >
            {t.requestCta}
          </button>
        </form>
      )}
    </section>
  );
}
