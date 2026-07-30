"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/telemetry/client";

/**
 * Emite `page_view` en la carga inicial y en cada navegación del App Router.
 *
 * Va montado en el layout raíz, así que cubre web pública, auth y dashboard con
 * un solo punto. No renderiza nada.
 *
 * Se depende de `usePathname` (y no de la query) a propósito: la query puede
 * llevar tokens (`?code=`, `?toast=`) y no aporta nada al embudo.
 *
 * En desarrollo con Strict Mode el efecto corre dos veces, así que las cifras
 * locales están infladas; en producción no.
 */
export function PageView() {
  const pathname = usePathname();

  useEffect(() => {
    track("page_view");
  }, [pathname]);

  return null;
}
