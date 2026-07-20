import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

type Tier = {
  name: string;
  price: string;
  unit?: string;
  note: string;
  lead?: string;
  features: string[];
  limits?: string;
  cta: string;
  href: string;
  highlight: boolean;
};

const tiers: Tier[] = [
  {
    name: "Diagnóstico",
    price: "Gratis",
    note: "Una muestra para empezar hoy",
    features: [
      "Inventario de sistemas de IA",
      "Clasificación de riesgo (EU AI Act + EE. UU.)",
      "1 usuario",
    ],
    limits: "Sin evidencia en PDF, sin vigilancia ni plan de acción.",
    cta: "Empezar gratis",
    href: "/login",
    highlight: false,
  },
  {
    name: "Preparación",
    price: "$120",
    unit: "/mes",
    note: "El sistema de registro de tu gobernanza",
    lead: "Todo lo del plan gratis, y además desbloqueas:",
    features: [
      "Gap assessment + plan de acción",
      "Vigilancia regulatoria continua",
      "Dossier e informe ejecutivo (PDF)",
      "Evidencia y audit-trail inmutable",
      "Policy packs (RRHH)",
      "Equipo y roles",
    ],
    cta: "Solicitar acceso",
    href: "#waitlist",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "A medida",
    note: "Para varias entidades y necesidades avanzadas",
    lead: "Todo lo de Preparación, y además:",
    features: [
      "Multi-organización",
      "SSO y controles avanzados",
      "Soporte prioritario",
    ],
    cta: "Hablar con nosotros",
    href: "#waitlist",
    highlight: false,
  },
];

/** Matriz de comparación: cada fila = una capacidad; celdas true/false/string. */
type Cell = boolean | string;
const COMPARE: { label: string; cells: [Cell, Cell, Cell] }[] = [
  { label: "Inventario de sistemas de IA", cells: [true, true, true] },
  { label: "Clasificación de riesgo (EU AI Act + EE. UU.)", cells: [true, true, true] },
  { label: "Usuarios", cells: ["1", "Equipo", "Equipo"] },
  { label: "Gap assessment + plan de acción", cells: [false, true, true] },
  { label: "Vigilancia regulatoria continua", cells: [false, true, true] },
  { label: "Dossier e informe ejecutivo (PDF)", cells: [false, true, true] },
  { label: "Evidencia y audit-trail inmutable", cells: [false, true, true] },
  { label: "Policy packs (RRHH)", cells: [false, true, true] },
  { label: "Multi-organización", cells: [false, false, true] },
  { label: "SSO y controles avanzados", cells: [false, false, true] },
  { label: "Soporte prioritario", cells: [false, false, true] },
];

const COLS = ["Diagnóstico", "Preparación", "Enterprise"] as const;

function CompareCell({ value }: { value: Cell }) {
  if (value === true)
    return (
      <svg viewBox="0 0 16 16" className="mx-auto size-4 text-brand" aria-label="Incluido">
        <path
          d="m3.5 8.5 3 3 6-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (value === false)
    return <span className="text-muted" aria-label="No incluido">—</span>;
  return <span className="text-sm font-medium text-ink">{value}</span>;
}

export function Pricing() {
  return (
    <section id="precios" className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand">
          Precios
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Empieza gratis. Escala cuando lo necesites.
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          Precios en dólares (USD), orientativos durante el acceso anticipado.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 90}>
            <div
              className={`card-lift flex h-full flex-col rounded-2xl border p-7 ${
                t.highlight
                  ? "border-brand bg-paper-raised shadow-[0_24px_60px_-36px_rgba(11,107,78,0.5)]"
                  : "border-line bg-paper-raised"
              }`}
            >
              {t.highlight && (
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-brand px-3 py-0.5 text-xs font-medium text-white">
                  Recomendado
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.name}
              </h3>
              <p className="mt-1 text-sm text-muted">{t.note}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-ink">
                  {t.price}
                </span>
                {t.unit && <span className="text-sm text-muted">{t.unit}</span>}
              </div>

              <div className="mt-6 flex-1 border-t border-line pt-6">
                {t.lead && (
                  <p className="mb-3 text-xs font-medium text-ink-soft">{t.lead}</p>
                )}
                <ul className="space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink">
                      <svg viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden>
                        <path
                          d="m3.5 8.5 3 3 6-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {t.limits && (
                  <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
                    {t.limits}
                  </p>
                )}
              </div>

              <ButtonLink
                href={t.href}
                variant={t.highlight ? "primary" : "outline"}
                className="mt-7 w-full py-2.5"
              >
                {t.cta}
              </ButtonLink>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Comparativa de planes */}
      <Reveal className="mt-16">
        <h3 className="text-center font-display text-xl font-semibold text-ink">
          Compara los planes
        </h3>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line-strong">
                <th className="py-3 pr-4 text-sm font-medium text-ink-soft">
                  Capacidad
                </th>
                {COLS.map((c, i) => (
                  <th
                    key={c}
                    className={`px-3 py-3 text-center text-sm font-semibold ${
                      i === 1 ? "text-brand-strong" : "text-ink"
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label} className="border-b border-line">
                  <td className="py-3 pr-4 text-sm text-ink">{row.label}</td>
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={`px-3 py-3 text-center align-middle ${
                        i === 1 ? "bg-brand-soft/30" : ""
                      }`}
                    >
                      <CompareCell value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  );
}
