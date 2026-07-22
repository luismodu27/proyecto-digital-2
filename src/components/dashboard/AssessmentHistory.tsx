"use client";

import { RiskBadge } from "@/components/ui/RiskBadge";
import { EvidenceBadge } from "@/components/ui/EvidenceBadge";
import type { AssessmentRecord } from "@/lib/mock-data";
import { useT, useLocale } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/config";

function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  return d.toLocaleString(locale === "en" ? "en-US" : "es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Línea de tiempo de evaluaciones de riesgo de un sistema. */
export function AssessmentHistory({
  assessments,
}: {
  assessments: AssessmentRecord[];
}) {
  const h = useT().dashboard.controls.history;
  const locale = useLocale();
  if (assessments.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        {h.emptyBefore}
        <span className="font-medium text-ink">{h.emptyLink}</span>
        {h.emptyAfter}
      </p>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-line pl-6">
      {assessments.map((a, i) => (
        <li key={a.id} className="relative">
          <span
            className={`absolute -left-[1.86rem] top-1 flex size-3.5 items-center justify-center rounded-full border-2 border-paper-raised ${
              i === 0 ? "bg-brand" : "bg-line-strong"
            }`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge level={a.level} />
            <EvidenceBadge state={a.evidenceState} />
            {i === 0 && (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-strong">
                {h.current}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-ink-soft">{a.rationale}</p>
          <p className="mt-1.5 text-xs text-muted">
            {formatDate(a.assessedAt, locale)}
            {a.attestedByName ? `${h.attestedByPrefix}${a.attestedByName}` : ""}
          </p>
          {(a.evidenceNote || a.evidenceUrl) && (
            <div className="mt-2 rounded-lg border border-line bg-paper px-3 py-2 text-xs">
              {a.evidenceNote && <p className="text-ink-soft">{a.evidenceNote}</p>}
              {a.evidenceUrl && (
                <a
                  href={a.evidenceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`inline-flex items-center gap-1 font-medium text-brand hover:text-brand-strong ${
                    a.evidenceNote ? "mt-1" : ""
                  }`}
                >
                  {h.viewEvidence}
                  <svg viewBox="0 0 16 16" className="size-3" fill="none" aria-hidden>
                    <path
                      d="M6 3h7v7M13 3 3 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
