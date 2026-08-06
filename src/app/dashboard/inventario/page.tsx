import Link from "next/link";
import { PageHeader, Meter } from "@/components/dashboard/parts";
import { ButtonLink } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { EvidenceBadge } from "@/components/ui/EvidenceBadge";
import { InventoryToolbar } from "@/components/dashboard/InventoryToolbar";
import { getAiSystems, isSupabaseConfigured } from "@/lib/data";
import { AUDIT_READY_THRESHOLD, riskLabel, type AiSystem } from "@/lib/mock-data";
import { seedSampleData } from "@/lib/data/actions";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { QuotaMeter } from "@/components/dashboard/QuotaMeter";
import { getQuota } from "@/lib/billing/quota";
import { getActiveOrg } from "@/lib/data/context";
import {
  filterSystems,
  parseInventoryQuery,
  sortHref,
  type InventoryQuery,
  type SortKey,
} from "@/lib/inventory/filter";

type InventoryDict = Dictionary["dashboard"]["inventory"];

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const systems = await getAiSystems();
  const locale = await resolveLocale();
  const dict = getDictionary(locale).dashboard;
  const t = dict.inventory;

  const query = parseInventoryQuery(await searchParams);
  const rows = filterSystems(systems, query);

  // Cupo de sistemas. Se resuelve aquí (no dentro del componente) para que la
  // pantalla siga pintándose si la consulta falla: `getActiveOrg` puede devolver
  // null en demo y `quotaState` degrada a "sin tope", así que el aviso simplemente
  // no aparece en vez de romper el inventario.
  const org = await getActiveOrg();
  const quota = org ? await getQuota(org, "systems") : null;

  return (
    <>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        action={
          <div className="flex flex-wrap gap-2">
            {/* La importación va PRIMERO en el flujo real: quien llega con 30
                sistemas en una hoja no los teclea uno a uno. */}
            <ButtonLink href="/dashboard/inventario/importar" variant="outline">
              {t.importCta}
            </ButtonLink>
            <ButtonLink href="/dashboard/inventario/nuevo" variant="primary">
              {t.addSystem}
            </ButtonLink>
          </div>
        }
      />

      {quota && (
        <QuotaMeter
          state={quota}
          label={dict.quota.systems
            .replace("{used}", String(quota.used))
            .replace("{max}", String(quota.max ?? "∞"))}
          nearText={dict.quota.nearSystems}
          atText={dict.quota.atSystems}
          upgradeText={dict.quota.upgrade}
        />
      )}

      {/* La barra solo aparece con inventario: en una pantalla vacía sería una
          caja de búsqueda sobre la nada. */}
      {systems.length > 0 && (
        <InventoryToolbar
          query={query}
          systems={systems}
          shown={rows.length}
          locale={locale}
          t={t.filters}
        />
      )}

      {systems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-paper-raised px-6 py-16 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            {t.emptyTitle}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            {t.emptyBody}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/dashboard/inventario/nuevo" variant="primary">
              {t.addSystem}
            </ButtonLink>
            <ButtonLink href="/dashboard/inventario/importar" variant="outline">
              {t.importCta}
            </ButtonLink>
            {isSupabaseConfigured && (
              <form action={seedSampleData}>
                <SubmitButton variant="outline" pendingText={t.loadSamplePending}>
                  {t.loadSample}
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      ) : rows.length === 0 ? (
        /* Vacío por FILTRO, no por inventario. Se distingue a propósito: la
           pantalla de "no tienes nada" invitando a importar, delante de alguien
           que sí tiene 40 sistemas y solo ha buscado mal, se lee como que se
           han borrado los datos. */
        <div className="rounded-2xl border border-dashed border-line-strong bg-paper-raised px-6 py-14 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            {t.filters.noResultsTitle}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            {t.filters.noResultsBody}
          </p>
          <div className="mt-6">
            <ButtonLink href="/dashboard/inventario" variant="outline">
              {t.filters.clear}
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          {/* Móvil: tarjetas apiladas. Una tabla de siete columnas con scroll
              horizontal esconde justo lo accionable (riesgo, preparación) tras
              un gesto que nadie descubre. */}
          <ul className="flex flex-col gap-3 sm:hidden">
            {rows.map((s) => (
              <li
                key={s.id}
                className="rounded-2xl border border-line bg-paper-raised p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <SystemName system={s} />
                    <p className="mt-0.5 truncate font-mono text-xs text-muted">
                      {s.id} · {s.owner}
                      {s.vendor ? ` · ${s.vendor}` : ""}
                    </p>
                  </div>
                  <RiskBadge level={s.risk} label={riskLabel(s.risk, locale)} />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-muted">{t.col.domain}</dt>
                    <dd className="mt-0.5 text-ink-soft">{s.domain}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">{t.col.evidence}</dt>
                    <dd className="mt-0.5">
                      <EvidenceBadge state={s.evidenceState} locale={locale} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">{t.col.readiness}</dt>
                    <dd className="mt-1">
                      <Meter value={s.compliance} target={AUDIT_READY_THRESHOLD} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">{t.col.lastReview}</dt>
                    <dd className="mt-0.5 tabular-nums text-ink-soft">
                      {s.lastReviewed}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center gap-4 border-t border-line pt-3">
                  <RowActions system={s} t={t} />
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-2xl border border-line bg-paper-raised sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <SortableTh query={query} column="name" label={t.col.system} t={t.filters} />
                    <th className="px-5 py-3 font-medium">{t.col.domain}</th>
                    <SortableTh query={query} column="risk" label={t.col.risk} t={t.filters} />
                    <th className="px-5 py-3 font-medium">{t.col.evidence}</th>
                    <SortableTh
                      query={query}
                      column="readiness"
                      label={t.col.readiness}
                      t={t.filters}
                    />
                    <SortableTh
                      query={query}
                      column="reviewed"
                      label={t.col.lastReview}
                      t={t.filters}
                    />
                    <th className="px-5 py-3 font-medium">
                      <span className="sr-only">{t.col.actions}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-paper-sunken/50">
                      <td className="px-5 py-4">
                        <SystemName system={s} />
                        <p className="font-mono text-xs text-muted">
                          {s.id} · {s.owner}
                          {s.vendor ? ` · ${s.vendor}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-ink-soft">{s.domain}</td>
                      <td className="px-5 py-4">
                        <RiskBadge level={s.risk} label={riskLabel(s.risk, locale)} />
                      </td>
                      <td className="px-5 py-4">
                        <EvidenceBadge state={s.evidenceState} locale={locale} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="w-32">
                          <Meter value={s.compliance} target={AUDIT_READY_THRESHOLD} />
                        </div>
                      </td>
                      <td className="px-5 py-4 tabular-nums text-ink-soft">
                        {s.lastReviewed}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <RowActions system={s} t={t} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function SystemName({ system }: { system: AiSystem }) {
  if (!system.dbId) return <p className="font-medium text-ink">{system.name}</p>;
  return (
    <Link
      href={`/dashboard/inventario/${system.dbId}/editar`}
      className="font-medium text-ink transition-colors hover:text-brand"
    >
      {system.name}
    </Link>
  );
}

/**
 * Cabecera ordenable. El `aria-sort` va en el `<th>` (no en el enlace) porque es
 * la celda la que tiene el rol de columnheader: sin él, un lector de pantalla no
 * anuncia por dónde está ordenada la tabla.
 */
function SortableTh({
  query,
  column,
  label,
  t,
}: {
  query: InventoryQuery;
  column: SortKey;
  label: string;
  t: InventoryDict["filters"];
}) {
  const isActive = query.sort === column;
  return (
    <th
      className="px-5 py-3 font-medium"
      aria-sort={
        isActive ? (query.dir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <Link
        href={sortHref(query, column)}
        aria-label={t.sortAria.replace("{column}", label)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-ink ${
          isActive ? "text-ink" : ""
        }`}
      >
        {label}
        <span aria-hidden className={isActive ? "opacity-100" : "opacity-30"}>
          {isActive && query.dir === "asc" ? "↑" : "↓"}
        </span>
      </Link>
    </th>
  );
}

function RowActions({ system, t }: { system: AiSystem; t: InventoryDict }) {
  return (
    <>
      {isSupabaseConfigured && system.dbId && !system.evidenceState && (
        <Link
          href={`/dashboard/riesgo/evaluar?system=${system.dbId}`}
          className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-brand transition-colors hover:text-brand-strong"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden>
            <path
              d="M10 2.5 3 6v4.5c0 3.5 2.8 6.2 7 7 4.2-.8 7-3.5 7-7V6l-7-3.5Zm-2.5 8L9.5 12.5l3.5-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.classify}
        </Link>
      )}
      <Link
        href={`/dashboard/inventario/${system.dbId ?? system.id}/dossier`}
        className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-brand transition-colors hover:text-brand-strong"
      >
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden>
          <path
            d="M6 2.5h5L15.5 7v10.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Zm5 0V7h4.5M7 11h6M7 14h4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t.dossier}
      </Link>
    </>
  );
}
