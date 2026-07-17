import Link from "next/link";
import { SealMark } from "@/components/ui/SealMark";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { getAiSystems, getGapItems, getOrganizationName } from "@/lib/data";

const statusLabel = { missing: "Falta", partial: "Parcial", done: "Cubierto" } as const;
const statusCls = {
  missing: "text-[#8f271f]",
  partial: "text-[#8a4f14]",
  done: "text-brand-strong",
} as const;

export default async function InformeGapPage() {
  const [gapItems, systems, orgName] = await Promise.all([
    getGapItems(),
    getAiSystems(),
    getOrganizationName(),
  ]);

  const nameById = new Map(systems.map((s) => [s.id, s.name]));
  const open = gapItems.filter((g) => g.status !== "done").length;
  const bySeverity = {
    alta: gapItems.filter((g) => g.severity === "alta").length,
    media: gapItems.filter((g) => g.severity === "media").length,
    baja: gapItems.filter((g) => g.severity === "baja").length,
  };
  const fecha = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl">
      {/* Barra de acciones (no se imprime) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/gap"
          className="text-sm font-medium text-brand hover:text-brand-strong"
        >
          ← Volver al gap assessment
        </Link>
        <PrintButton label="Descargar evidencia (PDF)" />
      </div>

      {/* Documento */}
      <article className="rounded-2xl border border-line bg-white p-8 text-ink print:rounded-none print:border-0 print:p-0">
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
            Gap assessment · EU AI Act
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Evaluación de brechas de cumplimiento
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Organización: <span className="font-medium text-ink">{orgName ?? "—"}</span>
          </p>
        </div>

        {/* Resumen */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {[
            { k: "Brechas totales", v: gapItems.length },
            { k: "Abiertas", v: open },
            { k: "Severidad alta", v: bySeverity.alta },
            { k: "Sistemas", v: systems.length },
          ].map((c) => (
            <div key={c.k} className="rounded-lg border border-line px-3 py-3">
              <p className="font-display text-2xl font-semibold">{c.v}</p>
              <p className="mt-0.5 text-[11px] text-muted">{c.k}</p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <table className="mt-8 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line-strong text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-3 font-medium">Artículo</th>
              <th className="py-2 pr-3 font-medium">Requisito</th>
              <th className="py-2 pr-3 font-medium">Sistema</th>
              <th className="py-2 pr-3 font-medium">Severidad</th>
              <th className="py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {gapItems.map((g) => (
              <tr key={g.id} className="border-b border-line align-top">
                <td className="py-3 pr-3 font-mono text-xs text-seal">{g.article}</td>
                <td className="py-3 pr-3">{g.requirement}</td>
                <td className="py-3 pr-3 text-ink-soft">
                  {nameById.get(g.system) ?? g.system}
                </td>
                <td className="py-3 pr-3 capitalize text-ink-soft">{g.severity}</td>
                <td className={`py-3 font-medium ${statusCls[g.status]}`}>
                  {statusLabel[g.status]}
                </td>
              </tr>
            ))}
            {gapItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-muted">
                  No hay brechas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <footer className="mt-10 border-t border-line pt-5 text-xs text-muted">
          <p>
            Generado por <span className="font-medium text-ink">Attesta</span> el {fecha}.
            Documento de trabajo para evidencia de auditoría.
          </p>
          <p className="mt-1">
            Attesta ofrece orientación de compliance y no constituye asesoría legal.
          </p>
        </footer>
      </article>
    </div>
  );
}
