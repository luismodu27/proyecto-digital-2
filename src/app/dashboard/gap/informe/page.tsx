import Link from "next/link";
import { SealMark } from "@/components/ui/SealMark";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { getAiSystems, getGapItems, getOrganizationName } from "@/lib/data";
import { LEGAL_PDF_BY_LOCALE, ScopeNote } from "@/components/ui/LegalNote";
import type { GapItem } from "@/lib/mock-data";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const STATUS_LABEL = { missing: "Falta", partial: "Parcial", done: "Cubierto" } as const;
const STATUS_TONE = {
  missing: "danger",
  partial: "warn",
  done: "good",
} as const;
const SEVERITY_TONE = { alta: "danger", media: "warn", baja: "neutral" } as const;

/** Chip de tono semántico (theme-aware vía tokens --tone-*). */
function Chip({
  tone,
  children,
}: {
  tone: "danger" | "warn" | "good" | "neutral";
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: `var(--tone-${tone}-bg)`,
        color: `var(--tone-${tone}-fg)`,
        borderColor: `var(--tone-${tone}-bd)`,
      }}
    >
      {children}
    </span>
  );
}

const SEV_W = { alta: 0, media: 1, baja: 2 } as const;

/** Orden dentro de un sistema: abiertas primero, luego por severidad y artículo. */
function orderGaps(a: GapItem, b: GapItem) {
  const ao = a.status === "done" ? 1 : 0;
  const bo = b.status === "done" ? 1 : 0;
  if (ao !== bo) return ao - bo;
  if (SEV_W[a.severity] !== SEV_W[b.severity]) return SEV_W[a.severity] - SEV_W[b.severity];
  return a.article.localeCompare(b.article);
}

export default async function InformeGapPage() {
  const [gapItems, systems, orgName] = await Promise.all([
    getGapItems(),
    getAiSystems(),
    getOrganizationName(),
  ]);
  const locale = await resolveLocale();
  const tp = getDictionary(locale).dashboard.pages;

  const nameById = new Map(systems.map((s) => [s.id, s.name]));
  const total = gapItems.length;
  const open = gapItems.filter((g) => g.status !== "done").length;
  const done = total - open;
  const openAlta = gapItems.filter(
    (g) => g.status !== "done" && g.severity === "alta",
  ).length;
  const coveragePct = total ? Math.round((done / total) * 100) : 0;

  // Agrupa las brechas por sistema (estructura auditable). Ordena los sistemas
  // por urgencia: más brechas abiertas de severidad alta primero.
  const groups = [...new Set(gapItems.map((g) => g.system))]
    .map((sysId) => {
      const items = [...gapItems.filter((g) => g.system === sysId)].sort(orderGaps);
      const gOpen = items.filter((i) => i.status !== "done").length;
      const gAlta = items.filter(
        (i) => i.status !== "done" && i.severity === "alta",
      ).length;
      const gCov = items.length
        ? Math.round(((items.length - gOpen) / items.length) * 100)
        : 0;
      return {
        sysId,
        name: nameById.get(sysId) ?? sysId,
        items,
        gOpen,
        gAlta,
        gCov,
      };
    })
    .sort(
      (a, b) => b.gAlta - a.gAlta || b.gOpen - a.gOpen || a.name.localeCompare(b.name),
    );

  const org = orgName ?? "La organización";
  const fecha = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Resumen ejecutivo ensamblado de forma determinista (cero LLM) a partir de los
  // controles ya evaluados por la organización. Copy revisado por compliance: el
  // universo son "controles evaluados"; solo los abiertos son "brechas".
  const pl = (n: number, one: string, many: string) => (n === 1 ? one : many);
  const openPart =
    open === 0
      ? "ninguno presenta brechas abiertas"
      : `${open} ${pl(open, "presenta una brecha abierta", "presentan brechas abiertas")} (${openAlta} de severidad alta)`;
  const summaryParagraph =
    total === 0
      ? `A fecha de ${fecha}, la autoevaluación de ${org} aún no ha evaluado controles frente a los sistemas declarados. Aplica un policy pack a los sistemas de tu organización para evaluar su preparación.`
      : [
          `A fecha de ${fecha}, la autoevaluación de ${org} ha evaluado ${total} ${pl(total, "control", "controles")} frente a los sistemas declarados, de ${pl(total, "el cual", "los cuales")} ${openPart} y ${done} ${pl(done, "consta como cubierto", "constan como cubiertos")} con evidencia declarada, pendiente de verificación independiente.`,
          `La preparación declarada cubre el ${coveragePct}% de los controles evaluados.`,
          "Cubrir un control refleja evidencia autodeclarada, no verificada por Attesta ni por un tercero, y no constituye un juicio de cumplimiento.",
          open > 0
            ? "Las brechas abiertas de severidad alta son la prioridad de resolución; cada una indica el artículo de referencia y el sistema afectado."
            : "Todos los controles evaluados constan como cubiertos con evidencia declarada, pendiente de verificación independiente; esto no equivale a un juicio de cumplimiento y no descarta la existencia de controles o sistemas aún no evaluados.",
        ].join(" ");

  const kpis = [
    { k: "Controles evaluados", v: total },
    { k: "Brechas abiertas", v: open },
    { k: "Abiertas de sev. alta", v: openAlta },
    { k: "Cubierto", v: `${coveragePct}%` },
    { k: "Sistemas", v: groups.length },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barra de acciones (no se imprime) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/gap"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          {tp.backToGap}
        </Link>
        <PrintButton label={tp.gapReport.downloadPdf} />
      </div>

      {/* Documento */}
      <article className="rounded-2xl border border-line bg-paper-raised p-8 text-ink print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between border-b border-line pb-6">
          <div className="flex items-center gap-2">
            <SealMark size={34} className="text-brand" />
            <span className="font-display text-2xl font-semibold">Attesta</span>
          </div>
          <div className="text-right text-xs text-muted">
            <p>Informe de evidencia</p>
            <p>{fecha}</p>
          </div>
        </header>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Autoevaluación · EU AI Act
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Brechas y preparación para auditoría
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Organización: <span className="font-medium text-ink">{orgName ?? "—"}</span>{" "}
            · datos autodeclarados
          </p>
        </div>

        {/* Resumen ejecutivo (narrativa determinista) */}
        <section className="mt-6 break-inside-avoid">
          <h2 className="font-display text-base font-semibold">Resumen ejecutivo</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {summaryParagraph}
          </p>
        </section>

        {/* Alcance y método */}
        <ScopeNote fecha={fecha} locale={locale} className="mt-5" />

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {kpis.map((c) => (
            <div
              key={c.k}
              className="break-inside-avoid rounded-lg border border-line px-3 py-3"
            >
              <p className="font-display text-2xl font-semibold leading-tight">
                {c.v}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{c.k}</p>
            </div>
          ))}
        </div>

        {/* Cobertura global */}
        {total > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-sunken">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${coveragePct}%` }}
              />
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted">
              {done}/{total} cubierto
            </span>
          </div>
        )}

        {/* Brechas por sistema */}
        {groups.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-line-strong px-4 py-10 text-center text-sm text-muted">
            Aún no hay controles evaluados. Aplica un policy pack a los sistemas de tu
            organización desde el gap assessment para evaluar su preparación.
          </p>
        ) : (
          <div className="mt-8 space-y-8">
            {groups.map((grp) => (
              <section key={grp.sysId} className="break-inside-avoid">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-strong pb-2">
                  <h2 className="font-display text-base font-semibold text-ink">
                    {grp.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    {grp.gAlta > 0 && (
                      <Chip tone="danger">
                        {grp.gAlta} sev. alta {pl(grp.gAlta, "abierta", "abiertas")}
                      </Chip>
                    )}
                    <span className="tabular-nums">
                      {grp.gOpen} {pl(grp.gOpen, "abierta", "abiertas")} ·{" "}
                      {grp.gCov}% cubierto
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-muted">
                      <th className="py-2 pr-3 font-medium">Artículo</th>
                      <th className="py-2 pr-3 font-medium">Requisito</th>
                      <th className="py-2 pr-3 font-medium">Severidad</th>
                      <th className="py-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grp.items.map((g) => (
                      <tr
                        key={g.id}
                        className="break-inside-avoid border-b border-line align-top"
                      >
                        <td className="py-3 pr-3 font-mono text-xs text-seal">
                          {g.article}
                        </td>
                        <td className="py-3 pr-3">{g.requirement}</td>
                        <td className="py-3 pr-3">
                          <Chip tone={SEVERITY_TONE[g.severity]}>
                            <span className="capitalize">{g.severity}</span>
                          </Chip>
                        </td>
                        <td className="py-3">
                          <Chip tone={STATUS_TONE[g.status]}>
                            {STATUS_LABEL[g.status]}
                          </Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-10 border-t border-line pt-5 text-xs text-muted">
          <p>
            Generado por <span className="font-medium text-ink">Attesta</span> el {fecha}.
            Documento de trabajo para preparación de auditoría.
          </p>
          <p className="mt-1">{LEGAL_PDF_BY_LOCALE[locale]}</p>
        </footer>
      </article>
    </div>
  );
}
