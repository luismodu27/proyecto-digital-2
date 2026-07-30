"use client";

import type { ComponentProps } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { track } from "@/lib/telemetry/client";

/**
 * `ButtonLink` que además mide el clic (`cta_click`).
 *
 * Existe porque los CTA viven en Server Components y un `onClick` no puede
 * cruzar la frontera servidor→cliente: hace falta un componente de cliente que
 * envuelva el enlace. Es el único sitio donde se instrumenta la conversión de la
 * web pública, así que el `cta` identifica el sitio exacto del clic
 * (`hero_primary`, `header_signup`, `pricing_free`…) y no el texto del botón,
 * que cambia con el idioma y con cada iteración de copy.
 *
 * `sendBeacon` (ver `lib/telemetry/client`) hace que el evento sobreviva a la
 * navegación que dispara el propio clic.
 */
export function CtaLink({
  cta,
  onClick,
  ...props
}: { cta: string } & ComponentProps<typeof ButtonLink>) {
  return (
    <ButtonLink
      {...props}
      onClick={(e) => {
        track("cta_click", { id: cta });
        onClick?.(e);
      }}
    />
  );
}
