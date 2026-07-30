import Link from "next/link";
import { PageHeader, StatCard } from "@/components/dashboard/parts";
import { getIsPlatformAdmin, getProductFunnel, isSupabaseConfigured } from "@/lib/data";
import { ACTIVATION_FUNNEL, PRODUCT_EVENTS } from "@/lib/telemetry/events";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/i18n/resolve";
import { formatDateTime } from "@/lib/date";

/**
 * Panel interno del embudo de activación (telemetría de producto, migración 0026).
 *
 * NO es una función del producto: es el marcador del negocio. Solo lo ve el
 * personal de Attesta (`platform_admins`) y en modo demo no existe, para que
 * ninguna captura ni demo muestre números internos.
 *
 * Datos siempre frescos: el sentido del panel es mirarlo justo después de tocar
 * la landing o el onboarding.
 */
export const dynamic = "force-dynamic";

const DAYS = 30;

export default async function TelemetriaPage() {
  const [isAdmin, rows] = await Promise.all([
    getIsPlatformAdmin().catch(() => false),
    getProductFunnel(DAYS),
  ]);
  const locale = await resolveLocale();
  const d = getDictionary(locale).dashboard.pages;
  const tt = d.telemetry;

  // Doble guarda: la RPC ya filtra por admin, pero la pantalla no debe ni
  // insinuar que existe para un cliente.
  if (!isAdmin || !isSupabaseConfigured) {
    return (
      <>
        <PageHeader title={tt.title} subtitle={tt.subtitleNonAdmin} />
        <div className="rounded-2xl border border-line bg-paper-raised p-8 text-center">
          <p className="text-sm text-ink-soft">{tt.nonAdminNotice}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-medium text-brand hover:text-brand-strong"
          >
            ← {getDictionary(locale).dashboard.nav.overview}
          </Link>
        </div>
      </>
    );
  }

  const byEvent = new Map(rows.map((r) => [r.event, r]));
  const label = (event: string) =>
    (tt.events as Record<string, string>)[event] ?? event;

  const steps = ACTIVATION_FUNNEL.map((event, i) => {
    const row = byEvent.get(event);
    const visitors = row?.visitors ?? 0;
    const prev = i === 0 ? null : byEvent.get(ACTIVATION_FUNNEL[i - 1]!);
    const prevVisitors = prev?.visitors ?? 0;
    return {
      event,
      visitors,
      events: row?.events ?? 0,
      lastAt: row?.lastAt ?? null,
      // Conversión respecto al paso anterior. Sin base, no se inventa un 0 %:
      // se muestra "—" (no es lo mismo "nadie convirtió" que "no hay base").
      conversion:
        i === 0 || prevVisitors === 0
          ? null
          : Math.round((visitors / prevVisitors) * 100),
    };
  });

  // Eventos fuera del embudo (señales de valor y expansión).
  const funnelSet = new Set<string>(ACTIVATION_FUNNEL);
  const others = PRODUCT_EVENTS.filter((e) => !funnelSet.has(e))
    .map((event) => ({ event, row: byEvent.get(event) }))
    .filter((o) => o.row);

  const visits = byEvent.get("page_view")?.visitors ?? 0;
  const paid = byEvent.get("checkout_completed")?.visitors ?? 0;
  const activated = byEvent.get("system_created")?.visitors ?? 0;

  const pct = (n: number) => (visits === 0 ? "—" : `${Math.round((n / visits) * 100)} %`);

  return (
    <>
      <PageHeader title={tt.title} subtitle={tt.subtitle} />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-paper-raised p-8">
          <p className="text-sm text-ink-soft">{tt.empty}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={label("page_view")}
              value={visits}
              hint={`${DAYS} d`}
            />
            <StatCard
              label={label("system_created")}
              value={activated}
              hint={pct(activated)}
            />
            <StatCard
              label={label("checkout_completed")}
              value={paid}
              hint={pct(paid)}
            />
          </div>

          <section className="mt-8 rounded-2xl border border-line bg-paper-raised p-6">
            <h2 className="font-display text-lg font-semibold text-ink">
              {tt.funnelTitle}
            </h2>
            <p className="mt-1 text-xs text-muted">{tt.funnelHint}</p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-125 text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-medium text-muted">
                    <th className="pb-2 pr-4">{tt.colStep}</th>
                    <th className="pb-2 pr-4 text-right">{tt.colVisitors}</th>
                    <th className="pb-2 pr-4 text-right">{tt.colEvents}</th>
                    <th className="pb-2 pr-4 text-right">{tt.colConversion}</th>
                    <th className="pb-2 text-right">{tt.colLast}</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((s) => (
                    <tr key={s.event} className="border-b border-line/60">
                      <td className="py-3 pr-4 font-medium text-ink">
                        {label(s.event)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-ink">
                        {s.visitors}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-muted">
                        {s.events}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-ink-soft">
                        {s.conversion === null ? "—" : `${s.conversion} %`}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap text-xs text-muted">
                        {formatDateTime(s.lastAt, locale, tt.never)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {others.length > 0 && (
            <section className="mt-6 rounded-2xl border border-line bg-paper-raised p-6">
              <h2 className="font-display text-lg font-semibold text-ink">
                {tt.othersTitle}
              </h2>
              <ul className="mt-4 divide-y divide-line/60">
                {others.map(({ event, row }) => (
                  <li
                    key={event}
                    className="flex items-baseline justify-between gap-4 py-2.5"
                  >
                    <span className="text-sm text-ink">{label(event)}</span>
                    <span className="text-sm tabular-nums text-ink-soft">
                      {row!.events}
                      <span className="ml-2 text-xs text-muted">
                        {formatDateTime(row!.lastAt, locale, tt.never)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs text-muted">{tt.privacyNote}</p>
    </>
  );
}
