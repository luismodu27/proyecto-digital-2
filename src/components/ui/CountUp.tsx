"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cuenta ascendente animada al entrar en viewport (una sola vez).
 * Respeta `prefers-reduced-motion`: muestra el valor final sin animar.
 * `value` es el número final; `prefix`/`suffix` envuelven (p. ej. "€", "%", "M").
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1300,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Arranca en el valor final: así el HTML del servidor y el estado sin-JS
  // muestran la cifra real (nunca "0"/"€0M"), y la animación es una mejora
  // progresiva que solo ocurre en el cliente.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Sin movimiento (o preferencia de reducirlo): se queda en el valor final.
    if (reduce) return;

    let raf = 0;
    let start = 0;
    // easeOutCubic para un cierre suave.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    // La primera frame de run() deja el display en ~0 y cuenta hacia arriba, de
    // modo que la animación arranca desde 0 SIN un setState síncrono en el
    // cuerpo del effect (evita react-hooks/set-state-in-effect). Ambos usos de
    // CountUp están below-the-fold: el salto value→0 dura una sola frame justo
    // al entrar en viewport (imperceptible), y el SSR/sin-JS ya muestra la cifra.
    const run = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      setDisplay(value * ease(t));
      if (t < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(run);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
