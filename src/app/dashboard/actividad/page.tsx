import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { getAuditLog, isSupabaseConfigured } from "@/lib/data";
import { ENTITY_META, ACTION_META } from "@/lib/audit";
import type { AuditEntry } from "@/lib/mock-data";

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
  return `hace ${Math.round(mo / 12)} años`;
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
  const all = await getAuditLog();
  const filter = TYPES.some((x) => x.key === t) ? t : "";
  const entries = filter ? all.filter((e) => e.table === filter) : all;
  const now = new Date();

  return (
    <>
      <PageHeader
        title="Registro de actividad"
        subtitle="Cada cambio queda registrado de forma inmutable: quién hizo qué y cuándo."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] px-3 py-1 text-xs font-medium text-[var(--tone-good-fg)]">
            <svg viewBox="0 0 20 20" className="size-3.5" fill="none" aria-hidden>
              <path
                d="M6 9V7a4 4 0 118 0v2m-9 0h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6a1 1 0 011-1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Inmutable
          </span>
        }
      />

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-2xl border border-[var(--tone-info-bd)] bg-[var(--tone-info-bg)] px-5 py-4 text-sm text-[var(--tone-info-fg)]">
          Estás en <span className="font-medium">modo demo</span>: actividad de
          ejemplo. En modo conectado se registra cada cambio real por triggers de
          base de datos, sin poder editarlo ni borrarlo.
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
              {x.label}
            </Link>
          );
        })}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-paper-raised px-6 py-16 text-center text-sm text-muted">
          No hay actividad registrada todavía.
        </div>
      ) : (
        <ol className="space-y-2">
          {entries.map((e) => (
            <ActivityRow key={e.id} entry={e} now={now} />
          ))}
        </ol>
      )}
    </>
  );
}

function ActivityRow({ entry, now }: { entry: AuditEntry; now: Date }) {
  const entity = ENTITY_META[entry.table] ?? {
    label: entry.table,
    article: "el",
    tone: "neutral",
  };
  const act = ACTION_META[entry.action];
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
