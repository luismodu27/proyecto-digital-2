import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { LegalNote, LEGAL_FOOTER_BY_LOCALE } from "@/components/ui/LegalNote";
import { VigiaRunButton } from "@/components/dashboard/VigiaRunButton";
import { getRegSources, getIsPlatformAdmin, isSupabaseConfigured } from "@/lib/data";
import {
  regSourceStatusLabel,
  type RegSource,
  type RegSourceStatus,
} from "@/lib/mock-data";
import { frameworkLabel } from "@/lib/regulatory-watch";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<RegSourceStatus, string> = {
  baseline:
    "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
  ok: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  changed:
    "bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)] border-[var(--tone-gold-bd)]",
  error:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
};

function Pill({
  children,
  className = "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function relTime(iso: string | null, locale: Locale, never: string): string {
  if (!iso) return never;
  return new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SourceRow({
  s,
  locale,
  tf,
}: {
  s: RegSource;
  locale: Locale;
  tf: ReturnType<typeof getDictionary>["dashboard"]["pages"]["sources"];
}) {
  const status = s.lastStatus;
  return (
    <tr className="border-t border-line align-top">
      <td className="py-3 pr-4">
        <a
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-ink hover:text-brand"
        >
          {s.label} ↗
        </a>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Pill>{frameworkLabel(s.framework, locale)}</Pill>
          <span className="text-[11px] text-muted">{s.sourceKind}</span>
          {s.failCount > 0 && (
            <span className="text-[11px] text-[var(--tone-danger-fg)]">
              {s.failCount} {s.failCount === 1 ? tf.failOne : tf.failOther}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 pr-4 whitespace-nowrap">
        {status ? (
          <Pill className={STATUS_TONE[status]}>
            {regSourceStatusLabel(status, locale)}
          </Pill>
        ) : (
          <Pill>{tf.unreviewed}</Pill>
        )}
      </td>
      <td className="py-3 pr-4 whitespace-nowrap text-xs text-muted">
        {relTime(s.lastCheckedAt, locale, tf.never)}
      </td>
      <td className="py-3 whitespace-nowrap text-xs text-muted">
        {relTime(s.lastChangeAt, locale, tf.never)}
      </td>
    </tr>
  );
}

export default async function FuentesPage() {
  const [isAdmin, sources] = await Promise.all([
    getIsPlatformAdmin(),
    getRegSources(),
  ]);
  const locale = await resolveLocale();
  const d = getDictionary(locale).dashboard.pages;
  const tf = d.sources;

  // En modo conectado, el panel del Vigía es solo para el equipo de Attesta.
  if (isSupabaseConfigured && !isAdmin) {
    return (
      <>
        <PageHeader title={tf.title} subtitle={tf.subtitleNonAdmin} />
        <div className="rounded-2xl border border-line bg-paper-raised p-8 text-center">
          <p className="text-sm text-ink-soft">{tf.nonAdminNotice}</p>
          <Link
            href="/dashboard/vigilancia"
            className="mt-4 inline-block text-sm font-medium text-brand hover:text-brand-strong"
          >
            {d.backToMonitoring}
          </Link>
        </div>
      </>
    );
  }

  const changed = sources.filter((s) => s.lastStatus === "changed").length;
  const errors = sources.filter((s) => s.lastStatus === "error").length;

  return (
    <>
      <PageHeader
        title={tf.title}
        subtitle={tf.subtitle}
        action={
          <Link
            href="/dashboard/vigilancia/candidatos"
            className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
          >
            {d.monitoring.validationInbox}
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tabular-nums text-ink">
            {sources.length}
          </span>
          <span className="text-sm text-muted">{tf.sourcesUnit}</span>
        </div>
        {changed > 0 && (
          <span className="text-sm text-[var(--tone-gold-fg)]">
            {changed} {tf.changedUnrevised}
          </span>
        )}
        {errors > 0 && (
          <span className="text-sm text-[var(--tone-danger-fg)]">
            {errors} {tf.downloadErrors}
          </span>
        )}
        {isSupabaseConfigured && isAdmin && (
          <div className="ml-auto">
            <VigiaRunButton />
          </div>
        )}
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-xl border border-dashed border-line-strong bg-paper-raised p-4 text-sm text-ink-soft">
          {tf.demoNotice}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper-raised">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3">{tf.colSource}</th>
              <th className="px-5 py-3">{tf.colLastStatus}</th>
              <th className="px-5 py-3">{tf.colChecked}</th>
              <th className="px-5 py-3">{tf.colLastChange}</th>
            </tr>
          </thead>
          <tbody className="[&_td:first-child]:pl-5 [&_td:last-child]:pr-5">
            {sources.map((s) => (
              <SourceRow key={s.id} s={s} locale={locale} tf={tf} />
            ))}
          </tbody>
        </table>
      </div>

      <LegalNote className="mt-10" text={LEGAL_FOOTER_BY_LOCALE[locale]} />
    </>
  );
}
