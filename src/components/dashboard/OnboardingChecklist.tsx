"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { setUserFlag } from "@/lib/data/user-actions";
import { useT } from "@/lib/i18n/provider";

export type OnboardingStep = {
  key: string;
  label: string;
  hint: string;
  href: string;
  done: boolean;
  paid?: boolean;
};

/**
 * Checklist de primeros pasos para activar a un usuario nuevo. Se muestra en el
 * resumen mientras haya pasos pendientes; desaparece solo al completarlos, o si
 * el usuario lo oculta (persiste por cuenta + navegador).
 */
export function OnboardingChecklist({
  steps,
  userId,
}: {
  steps: OnboardingStep[];
  userId?: string;
}) {
  const t = useT().dashboard.onboarding;
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const dismissKey = `attesta:onboarding:dismissed:${userId ?? "anon"}`;
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        setDismissed(localStorage.getItem(dismissKey) === "1");
      } catch {
        setDismissed(false);
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, [dismissKey]);

  if (!ready || allDone || dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(dismissKey, "1");
    } catch {
      /* almacenamiento no disponible */
    }
    void setUserFlag("onboarding_dismissed");
    setDismissed(true);
  };

  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <section className="mb-6 rounded-2xl border border-brand/30 bg-brand-soft/40 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            {t.title}
          </h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            {t.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          {t.dismiss}
        </button>
      </div>

      {/* Progreso */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-raised">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums text-brand-strong">
          {doneCount}/{steps.length}
        </span>
      </div>

      {/* Pasos */}
      <ul className="mt-5 space-y-2">
        {steps.map((s) => (
          <li key={s.key}>
            <Link
              href={s.href}
              className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                s.done
                  ? "border-transparent bg-transparent"
                  : "border-line bg-paper-raised hover:border-brand/40"
              }`}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full border ${
                  s.done
                    ? "border-brand bg-brand text-white"
                    : "border-line-strong text-transparent group-hover:border-brand"
                }`}
                aria-hidden
              >
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                  <path
                    d="m3.5 8.5 3 3 6-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm font-medium ${
                    s.done ? "text-muted line-through" : "text-ink"
                  }`}
                >
                  {s.label}
                </span>
                {!s.done && (
                  <span className="block text-xs text-muted">{s.hint}</span>
                )}
              </span>
              {s.paid && !s.done && (
                <span className="shrink-0 rounded-full border border-[var(--tone-gold-bd)] bg-[var(--tone-gold-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--tone-gold-fg)]">
                  {t.paidBadge}
                </span>
              )}
              {!s.done && (
                <svg
                  viewBox="0 0 24 24"
                  className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
