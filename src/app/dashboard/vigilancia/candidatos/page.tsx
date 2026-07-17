import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/parts";
import { LegalNote, LEGAL_FOOTER } from "@/components/ui/LegalNote";
import { CandidateReviewControls } from "@/components/dashboard/CandidateReviewControls";
import {
  getRegCandidates,
  getIsPlatformAdmin,
  isSupabaseConfigured,
} from "@/lib/data";
import {
  REG_CANDIDATE_STATUS_LABEL,
  type RegCandidate,
  type RegCandidateStatus,
} from "@/lib/mock-data";
import {
  REG_KIND_LABEL,
  FRAMEWORK_LABEL,
  type RegKind,
  type RegFramework,
} from "@/lib/regulatory-watch";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<RegCandidateStatus, string> = {
  draft:
    "bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)] border-[var(--tone-gold-bd)]",
  approved:
    "bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)] border-[var(--tone-good-bd)]",
  rejected:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
  superseded:
    "bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)] border-[var(--tone-neutral-bd)]",
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

function formatDate(iso: string | null): string {
  if (!iso) return "sin fecha";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Confidence({ value }: { value?: number | null }) {
  if (value == null) return null;
  const pct = Math.round(value * 100);
  const tone = pct >= 75 ? "good" : pct >= 50 ? "gold" : "neutral";
  const cls =
    tone === "good"
      ? "text-[var(--tone-good-fg)]"
      : tone === "gold"
        ? "text-[var(--tone-gold-fg)]"
        : "text-muted";
  return (
    <span className={`text-xs font-medium tabular-nums ${cls}`}>
      confianza {pct}%
    </span>
  );
}

function CandidateCard({
  c,
  reviewable,
}: {
  c: RegCandidate;
  reviewable: boolean;
}) {
  const kindLabel = c.kind
    ? REG_KIND_LABEL[c.kind as RegKind] ?? c.kind
    : "—";
  return (
    <article className="rounded-2xl border border-line bg-paper-raised p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Pill className={STATUS_TONE[c.status]}>
          {REG_CANDIDATE_STATUS_LABEL[c.status]}
        </Pill>
        <Pill>{kindLabel}</Pill>
        <span className="text-xs text-muted">
          {FRAMEWORK_LABEL[c.framework as RegFramework] ?? c.framework}
        </span>
        <span className="text-xs text-muted">· fecha del evento {formatDate(c.date)}</span>
      </div>

      <h2 className="mt-2 font-display text-lg font-semibold text-ink">
        {c.title}
      </h2>

      {c.summary && (
        <p className="mt-1.5 text-sm text-ink-soft">{c.summary}</p>
      )}

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {c.impact && (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Impacto para el deployer
            </dt>
            <dd className="mt-0.5 text-sm text-ink-soft">{c.impact}</dd>
          </div>
        )}
        {c.action && (
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Acción propuesta
            </dt>
            <dd className="mt-0.5 text-sm text-ink-soft">{c.action}</dd>
          </div>
        )}
      </dl>

      {c.articles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.articles.map((a) => (
            <Pill key={a}>{a}</Pill>
          ))}
        </div>
      )}

      {/* Procedencia: por qué el pipeline lo propuso */}
      <div className="mt-4 rounded-xl border border-line bg-paper-sunken/50 p-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Procedencia
          </span>
          {c.provenance.agent && (
            <span className="text-xs text-ink-soft">
              agente <span className="font-medium text-ink">{c.provenance.agent}</span>
            </span>
          )}
          <span className="text-xs text-muted">
            {c.provenance.model ? `modelo ${c.provenance.model}` : "sin LLM (determinista)"}
          </span>
          <Confidence value={c.provenance.confidence} />
          {c.sourceLabel && (
            <span className="text-xs text-muted">· fuente {c.sourceLabel}</span>
          )}
        </div>
        {c.provenance.excerpt && (
          <p className="mt-2 border-l-2 border-line-strong pl-3 text-xs italic text-muted">
            «{c.provenance.excerpt}»
          </p>
        )}
        {c.source?.url && (
          <a
            href={c.source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-xs font-medium text-brand hover:text-brand-strong"
          >
            {c.source.label || c.source.url} ↗
          </a>
        )}
      </div>

      {reviewable && c.status === "draft" ? (
        <div className="mt-5 border-t border-line pt-4">
          <CandidateReviewControls
            id={c.id}
            proposedEventId={c.proposedEventId}
            title={c.title}
          />
        </div>
      ) : (
        c.status !== "draft" && (
          <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
            {c.status === "approved"
              ? `Publicado como «${c.proposedEventId}» · ${formatDate(c.reviewedAt)}`
              : `Descartado · ${formatDate(c.reviewedAt)}`}
            {c.reviewNote ? ` — ${c.reviewNote}` : ""}
          </p>
        )
      )}
    </article>
  );
}

export default async function CandidatosPage() {
  const [isAdmin, candidates] = await Promise.all([
    getIsPlatformAdmin(),
    getRegCandidates(),
  ]);

  // En modo conectado, la bandeja es solo para el equipo de Attesta.
  if (isSupabaseConfigured && !isAdmin) {
    return (
      <>
        <PageHeader
          title="Bandeja de validación"
          subtitle="Cola de candidatos regulatorios propuestos por el pipeline."
        />
        <div className="rounded-2xl border border-line bg-paper-raised p-8 text-center">
          <p className="text-sm text-ink-soft">
            Esta área es para el equipo de compliance de Attesta, que valida los
            cambios normativos antes de publicarlos en el radar.
          </p>
          <Link
            href="/dashboard/vigilancia"
            className="mt-4 inline-block text-sm font-medium text-brand hover:text-brand-strong"
          >
            ← Volver a Vigilancia
          </Link>
        </div>
      </>
    );
  }

  const drafts = candidates.filter((c) => c.status === "draft");
  const reviewed = candidates.filter((c) => c.status !== "draft");

  return (
    <>
      <PageHeader
        title="Bandeja de validación"
        subtitle="Borradores propuestos por el pipeline. Nada llega al radar de los clientes sin tu validación."
        action={
          <Link
            href="/dashboard/vigilancia"
            className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
          >
            ← Radar
          </Link>
        }
      />

      <div className="mb-6 flex items-center gap-3">
        <span className="font-display text-2xl font-semibold tabular-nums text-ink">
          {drafts.length}
        </span>
        <span className="text-sm text-muted">
          {drafts.length === 1 ? "candidato pendiente" : "candidatos pendientes"} de revisión
        </span>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-paper-raised p-8 text-center">
          <p className="text-sm text-ink-soft">
            No hay candidatos pendientes. El pipeline dejará aquí cada cambio
            normativo detectado para tu revisión.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {drafts.map((c) => (
            <CandidateCard key={c.id} c={c} reviewable />
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Ya revisados
          </h3>
          <div className="flex flex-col gap-5">
            {reviewed.map((c) => (
              <CandidateCard key={c.id} c={c} reviewable={false} />
            ))}
          </div>
        </section>
      )}

      <LegalNote className="mt-10" text={LEGAL_FOOTER} />
    </>
  );
}
