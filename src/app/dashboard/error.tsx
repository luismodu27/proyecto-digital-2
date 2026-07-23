"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";

/**
 * Frontera de error del dashboard. Sustituye la pantalla de error por defecto de
 * Next por un fallback con marca cuando un Server Component lanza (p. ej. un
 * fallo de red contra Supabase), con opción de reintentar.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Deja rastro en la consola para diagnóstico (no expone nada al usuario).
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <div className="rounded-3xl border border-line bg-paper-raised p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--tone-warn-bg)] text-[var(--tone-warn-fg)]">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden>
            <path
              d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
          Algo no cargó bien
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Hubo un problema al cargar esta sección. No se ha perdido nada de tu
          información; suele resolverse al reintentar.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>Reintentar</Button>
          <ButtonLink href="/dashboard" variant="ghost">
            Volver al resumen
          </ButtonLink>
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted">
          <SealMark size={14} /> Si el problema persiste, escríbenos a
          attesta.io.mx@gmail.com
        </p>
      </div>
    </div>
  );
}
