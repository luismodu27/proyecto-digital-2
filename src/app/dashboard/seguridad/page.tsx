import { PageHeader } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SeguridadPage() {
  const t = getDictionary(await resolveLocale()).dashboard.security;

  return (
    <>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* SSO */}
        <div className="rounded-2xl border border-line bg-paper-raised p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">
              {t.ssoTitle}
            </h2>
            <span className="shrink-0 rounded-full border border-line-strong bg-paper-sunken px-2.5 py-0.5 text-xs font-medium text-muted">
              {t.ssoStatusLabel}: {t.ssoStatusNotConfigured}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {t.ssoBody}
          </p>

          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted">
            {t.ssoIncludesTitle}
          </p>
          <ul className="mt-3 space-y-2.5">
            {t.ssoIncludes.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink">
                <svg
                  viewBox="0 0 16 16"
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  aria-hidden
                >
                  <path
                    d="m3.5 8.5 3 3 6-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <ButtonLink href="/dashboard/facturacion" className="mt-6">
            {t.requestCta}
          </ButtonLink>
        </div>

        {/* Controles avanzados */}
        <div className="rounded-2xl border border-line bg-paper-raised p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            {t.controlsTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {t.controlsBody}
          </p>
        </div>
      </div>
    </>
  );
}
