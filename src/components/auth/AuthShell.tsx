import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { SealMark } from "@/components/ui/SealMark";
import { LEGAL_FOOTER } from "@/components/ui/LegalNote";

const points = [
  "Inventario y clasificación de riesgo (EU AI Act)",
  "Evidencia y audit-trail listos para auditoría",
  "Preparación de nivel enterprise, sin equipo GRC",
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel de marca (desktop) */}
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 grid-paper opacity-[0.07]" aria-hidden />
        <div
          className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand blur-3xl opacity-25"
          aria-hidden
        />
        <Link href="/" className="relative inline-flex items-center gap-2">
          <SealMark size={30} className="text-brand-bright" />
          <span className="font-display text-xl font-semibold text-paper">
            Attesta
          </span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md font-display text-3xl font-semibold leading-tight">
            Gobierna tu IA antes que la auditoría.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-paper/80">
                <SealMark size={22} className="mt-0.5 shrink-0 text-brand-bright" />
                <span className="text-sm leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative max-w-sm text-xs leading-relaxed text-paper/45">
          {LEGAL_FOOTER}
        </p>
      </aside>

      {/* Área de formulario */}
      <div className="flex flex-col bg-paper">
        <div className="border-b border-line lg:hidden">
          <div className="container-page flex h-16 items-center">
            <Logo />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-md">
            {children}
            <p className="mt-6 text-center text-sm text-muted">
              <Link href="/" className="transition-colors hover:text-ink">
                ← Volver al sitio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
