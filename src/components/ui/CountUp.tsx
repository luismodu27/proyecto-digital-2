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
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let start = 0;
    // easeOutCubic para un cierre suave.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const run = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      setDisplay(value * ease(t));
      if (t < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // El setState vive en el callback del observer (no en el cuerpo del
          // effect): sin movimiento, salta al valor final; si no, anima.
          if (reduce) setDisplay(value);
          else raf = requestAnimationFrame(run);
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
