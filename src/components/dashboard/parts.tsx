import type { ReactNode } from "react";

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
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "ink" | "brand" | "warn" | "danger";
}) {
  const accents = {
    ink: "text-ink",
    brand: "text-brand",
    warn: "text-[#a4610f]",
    danger: "text-[#a3271f]",
  };
  return (
    <div className="card-lift rounded-2xl border border-line bg-paper-raised p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className={`mt-2 font-display text-3xl font-semibold ${accents[accent]}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Meter({ value }: { value: number }) {
  const color =
    value >= 75 ? "bg-brand" : value >= 50 ? "bg-[#c9761f]" : "bg-[#b4322a]";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-sunken">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink-soft">
        {value}%
      </span>
    </div>
  );
}
