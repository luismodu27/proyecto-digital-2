import Link from "next/link";
import {
  buildInventoryHref,
  hasActiveFilters,
  type EvidenceFilter,
  type InventoryQuery,
} from "@/lib/inventory/filter";
import {
  RISK_ORDER,
  evidenceLabel,
  riskLabel,
  type AiSystem,
  type EvidenceState,
  type RiskLevel,
} from "@/lib/mock-data";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n";

type T = Dictionary["dashboard"]["inventory"]["filters"];

/**
 * Barra de búsqueda y filtros del inventario.
 *
 * Server component a propósito: el estado vive en la URL, así que no hace falta
 * ni un byte de JavaScript. La caja de búsqueda es un `<form method="GET">` y
 * los filtros son enlaces — funcionan con JS desactivado, con el botón «atrás»
 * y se pueden pegar en un correo.
 *
 * El precio de esa decisión es que un `<form>` GET solo manda SUS campos y
 * borraría el resto de la query, así que el filtro vigente viaja en `<input
 * type="hidden">`. Sin eso, buscar un texto tiraría por la borda el filtro de
 * riesgo que el usuario acaba de poner.
 */
export function InventoryToolbar({
  query,
  systems,
  shown,
  locale,
  t,
}: {
  query: InventoryQuery;
  /** Lista COMPLETA: los contadores de cada chip se calculan sobre ella. */
  systems: AiSystem[];
  /** Cuántos se están enseñando tras filtrar. */
  shown: number;
  locale: Locale;
  t: T;
}) {
  const active = hasActiveFilters(query);

  // Contadores por chip, sobre el inventario COMPLETO y no sobre lo ya
  // filtrado: si bailaran al pulsar, dejarían de servir para decidir dónde ir.
  const riskCount = (level: RiskLevel) =>
    systems.filter((s) => s.risk === level).length;
  const evidenceCount = (value: EvidenceFilter) =>
    systems.filter((s) =>
      value === "none" ? !s.evidenceState : s.evidenceState === value,
    ).length;

  const evidenceValues: EvidenceFilter[] = [
    "none",
    "declared",
    "evidenced",
    "reviewed",
  ];

  const count = active
    ? shown === 1
      ? t.countOne.replace("{total}", String(systems.length))
      : t.countOther
          .replace("{n}", String(shown))
          .replace("{total}", String(systems.length))
    : shown === 1
      ? t.countAllOne
      : t.countAllOther.replace("{n}", String(shown));

  return (
    <section
      className="mb-6 rounded-2xl border border-line bg-paper-raised p-4"
      aria-label={t.searchLabel}
    >
      <div className="flex flex-col gap-4">
        <form
          method="GET"
          action="/dashboard/inventario"
          className="flex flex-wrap items-center gap-2"
        >
          {/* El filtro vigente viaja escondido: un form GET reemplaza la query
              entera y si no, buscar borraría los chips activos. */}
          {query.risk && <input type="hidden" name="risk" value={query.risk} />}
          {query.evidence && (
            <input type="hidden" name="evidence" value={query.evidence} />
          )}
          <input type="hidden" name="sort" value={query.sort} />
          <input type="hidden" name="dir" value={query.dir} />

          <label htmlFor="inventory-q" className="sr-only">
            {t.searchLabel}
          </label>
          <input
            id="inventory-q"
            type="search"
            name="q"
            defaultValue={query.q}
            placeholder={t.searchPlaceholder}
            maxLength={120}
            className="min-w-0 flex-1 rounded-full border border-line-strong bg-paper px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
          />
          <button
            type="submit"
            className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
          >
            {t.searchAction}
          </button>
        </form>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <ChipGroup label={t.riskLabel}>
            <Chip
              href={buildInventoryHref(query, { risk: null })}
              selected={query.risk === null}
            >
              {t.all}
            </Chip>
            {RISK_ORDER.map((level) => (
              <Chip
                key={level}
                href={buildInventoryHref(query, { risk: level })}
                selected={query.risk === level}
                count={riskCount(level)}
              >
                {riskLabel(level, locale)}
              </Chip>
            ))}
          </ChipGroup>

          <ChipGroup label={t.evidenceLabel}>
            <Chip
              href={buildInventoryHref(query, { evidence: null })}
              selected={query.evidence === null}
            >
              {t.all}
            </Chip>
            {evidenceValues.map((value) => (
              <Chip
                key={value}
                href={buildInventoryHref(query, { evidence: value })}
                selected={query.evidence === value}
                count={evidenceCount(value)}
              >
                {value === "none"
                  ? t.evidenceNone
                  : evidenceLabel(value as EvidenceState, locale)}
              </Chip>
            ))}
          </ChipGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-xs text-muted" aria-live="polite">
            {count}
          </p>
          {active && (
            <Link
              href="/dashboard/inventario"
              className="text-xs font-medium text-brand transition-colors hover:text-brand-strong"
            >
              {t.clear}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  href,
  selected,
  count,
  children,
}: {
  href: string;
  selected: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      // `aria-current` y no solo el color: el estado seleccionado tiene que
      // llegar también a quien no ve el contraste.
      aria-current={selected ? "true" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        selected
          ? "border-brand bg-brand-soft text-brand-strong"
          : "border-line-strong text-ink-soft hover:bg-paper-sunken"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className="tabular-nums opacity-70">{count}</span>
      )}
    </Link>
  );
}
