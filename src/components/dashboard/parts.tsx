import type { ReactNode } from "react";
import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent = "ink",
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "ink" | "brand" | "warn" | "danger";
  href?: string;
}) {
  const accents = {
    ink: "text-ink",
    brand: "text-brand",
    warn: "text-[var(--tone-warn-fg)]",
    danger: "text-[var(--tone-danger-fg)]",
  };
  const inner = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className={`mt-2 font-display text-3xl font-semibold ${accents[accent]}`}>
        {value}
      </p>
      {hint && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          {hint}
          {href && (
            <span className="text-brand transition-transform group-hover:translate-x-0.5">
              →
            </span>
          )}
        </p>
      )}
    </>
  );
  const cls = "card-lift block rounded-2xl border border-line bg-paper-raised p-5";
  if (href) {
    return (
      <Link href={href} className={`group ${cls} hover:border-brand/40`}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function Meter({ value, target }: { value: number; target?: number }) {
  const color =
    value >= 75
      ? "bg-brand"
      : value >= 50
        ? "bg-[var(--tone-warn-fg)]"
        : "bg-[var(--tone-danger-fg)]";
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-paper-sunken">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${color}`}
          style={{ width: `${value}%` }}
        />
        {target != null && (
          <span
            className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-ink/45"
            style={{ left: `${target}%` }}
            title={`Objetivo: ${target}%`}
            aria-hidden
          />
        )}
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink-soft">
        {value}%
      </span>
    </div>
  );
}
