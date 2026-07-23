"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Barra que se rellena de 0% a `pct` cuando entra en viewport (una vez).
 * Respeta reduce-motion (aparece llena sin transición).
 */
export function FillBar({
  pct,
  color,
  delay = 0,
  className = "",
  trackClassName = "",
}: {
  pct: number;
  color: string;
  delay?: number;
  className?: string;
  trackClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`h-1.5 overflow-hidden rounded-full bg-paper-sunken ${trackClassName} ${className}`}
    >
      <div
        className="h-full rounded-full motion-safe:transition-[width] motion-safe:duration-[1100ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: on ? `${pct}%` : "0%",
          backgroundColor: color,
          transitionDelay: `${delay}ms`,
        }}
      />
    </div>
  );
}
