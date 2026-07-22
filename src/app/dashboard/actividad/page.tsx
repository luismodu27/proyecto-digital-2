import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { getAuditLog, verifyAuditChain, isSupabaseConfigured } from "@/lib/data";
import { ENTITY_META_BY_LOCALE, ACTION_META_BY_LOCALE } from "@/lib/audit";
import type { AuditChainStatus, AuditEntry } from "@/lib/mock-data";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

const TONE_PILL: Record<string, string> = {
  danger:
    "bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)] border-[var(--tone-danger-bd)]",
  warn: "bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)] border-[var(--tone-warn-bd)]",
  gold: "bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)] border-[var(--tone-gold-bd)]",
  good: "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  info: "bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)] border-[var(--tone-info-bd)]",
  neutral:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
};

const TYPES = [
  { key: "", label: "Todo" },
  { key: "ai_systems", label: "Sistemas" },
  { key: "risk_assessments", label: "Evaluaciones" },
  { key: "gap_items", label: "Brechas" },
  { key: "memberships", label: "Equipo" },
];

function formatAgo(iso: string, now: Date): string {
  const diff = now.getTime() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d < 30) return `hace ${d} ${d === 1 ? "día" : "días"}`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `hace ${mo} ${mo === 1 ? "mes" : "meses"}`;
  const y = Math.round(mo / 12);
  return `hace ${y} ${y === 1 ? "año" : "años"}`;
}

function formatExact(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ActividadPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const [all, chain] = await Promise.all([getAuditLog(), verifyAuditChain()]);
  const filter = TYPES.some((x) => x.key === t) ? t : "";
  const entries = filter ? all.filter((e) => e.table === filter) : all;
  const now = new Date();
  const locale = await resolveLocale();
  const tr = getDictionary(locale).dashboard.pages.activity;
  const filterLabels: Record<string, string> = {
    "": tr.filterAll,
    ai_systems: tr.filterSystems,
    risk_assessments: tr.filterAssessments,
    gap_items: tr.filterGaps,
    memberships: tr.filterTeam,
  };

  return (
    <>
      <PageHeader
        title={tr.title}
        subtitle={tr.subtitle}
        action={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              chain && !chain.ok
                ? "border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)]"
                : "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)]"
            }`}
          >
            <svg viewBox="0 0 20 20" className="size-3.5" fill="none" aria-hidden>
              <path
                d="M6 9V7a4 4 0 118 0v2m-9 0h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6a1 1 0 011-1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {chain && !chain.ok ? tr.chainBroken : tr.chainOk}
          </span>
        }
      />

      {chain && <ChainStatusCard chain={chain} />}

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-2xl border border-[var(--tone-info-bd)] bg-[var(--tone-info-bg)] px-5 py-4 text-sm text-[var(--tone-info-fg)]">
          {tr.demoBefore}
          <span className="font-medium">{tr.demoMode}</span>
          {tr.demoAfter}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TYPES.map((x) => {
          const active = filter === x.key;
          return (
            <Link
              key={x.key || "all"}
              href={x.key ? `/dashboard/actividad?t=${x.key}` : "/dashboard/actividad"}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                active
                  ? "border-brand bg-brand-soft text-brand-strong"
                  : "border-line bg-paper-raised text-ink-soft hover:bg-paper-sunken"
              }`}
            >
              {filterLabels[x.key] ?? x.label}
            </Link>
          );
        })}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-paper-raised px-6 py-16 text-center text-sm text-muted">
          {tr.empty}
        </div>
      ) : (
        <ol className="space-y-2">
          {entries.map((e) => (
            <ActivityRow key={e.id} entry={e} now={now} locale={locale} />
          ))}
        </ol>
      )}
    </>
  );
}

/**
 * Tarjeta de estado de la cadena de integridad (encadenado SHA-256). Es evidencia
 * de integridad técnica del registro, no una afirmación de conformidad.
 */
function ChainStatusCard({ chain }: { chain: AuditChainStatus }) {
  const ok = chain.ok;
  return (
    <div
      role={ok ? undefined : "alert"}
      className={`mb-6 flex items-start gap-3 rounded-2xl border px-5 py-4 ${
        ok
          ? "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)]"
          : "border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)]"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`mt-0.5 size-5 shrink-0 ${
          ok ? "text-[var(--tone-good-fg)]" : "text-[var(--tone-danger-fg)]"
        }`}
        fill="none"
        aria-hidden
      >
        {ok ? (
          <path
            d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Zm-2.2 8.4 1.7 1.7 3.4-3.4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3ZM12 8v4m0 3h.01"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            ok ? "text-[var(--tone-good-fg)]" : "text-[var(--tone-danger-fg)]"
          }`}
        >
          {ok
            ? "Integridad de la cadena verificada"
            : "Se detectó una alteración en el registro"}
        </p>
        <p
          className={`mt-1 text-sm ${
            ok ? "text-[var(--tone-good-fg)]" : "text-[var(--tone-danger-fg)]"
          }`}
        >
          {ok ? (
            <>
              Los <span className="font-medium">{chain.total}</span>{" "}
              {chain.total === 1 ? "evento está encadenado" : "eventos están encadenados"} con
              SHA-256: cada registro incorpora el hash del anterior, así que alterar
              o borrar cualquiera —incluso con acceso directo a la base de datos—
              rompería la cadena y quedaría en evidencia.
            </>
          ) : (
            <>
              La cadena se rompe en el evento{" "}
              <span className="font-medium">#{chain.brokenId}</span>: un registro fue
              modificado o eliminado fuera de la aplicación. Conserva esta evidencia
              y revisa el acceso a la base de datos.
            </>
          )}
        </p>
        {ok && (
          <p className="mt-1.5 text-xs text-[var(--tone-good-fg)] opacity-80">
            Verificado en vivo · {formatExact(chain.checkedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

function ActivityRow({
  entry,
  now,
  locale,
}: {
  entry: AuditEntry;
  now: Date;
  locale: Locale;
}) {
  const entity = ENTITY_META_BY_LOCALE[locale][entry.table] ?? {
    label: entry.table,
    article: locale === "en" ? "the" : "el",
    tone: "neutral",
  };
  const act = ACTION_META_BY_LOCALE[locale][entry.action];
  const actor = entry.actorEmail ?? "El sistema";
  const initial = (entry.actorEmail ?? "·").slice(0, 1).toUpperCase();

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-line bg-paper-raised p-4">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold uppercase text-brand-strong">
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink">
          <span className="font-medium">{actor}</span>{" "}
          <span className="text-ink-soft">
            {act.verb} {entity.article} {entity.label}
          </span>{" "}
          {entry.label && <span className="font-medium">{entry.label}</span>}
        </p>
        {entry.changed.length > 0 && (
          <p className="mt-0.5 text-xs text-muted">
            Cambió: {entry.changed.join(", ")}
          </p>
        )}
        <p className="mt-1 text-xs text-muted" title={formatExact(entry.at)}>
          {formatAgo(entry.at, now)} · {formatExact(entry.at)}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
          TONE_PILL[act.tone]
        }`}
      >
        {entry.action === "insert"
          ? "Alta"
          : entry.action === "update"
            ? "Cambio"
            : "Baja"}
      </span>
    </li>
  );
}
