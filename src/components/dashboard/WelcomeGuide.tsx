"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { createClient } from "@/lib/supabase/client";

/**
 * Guía de uso que se muestra UNA sola vez, tras el primer inicio de sesión.
 *
 * La marca de "vista" vive en `user_metadata.guide_seen` (por cuenta, persiste
 * entre dispositivos) y se refleja además en localStorage como guardia rápida
 * para evitar cualquier parpadeo antes de que el layout servidor se refresque.
 * Incluye animaciones de transición y opción de "Omitir".
 */

type Step = {
  icon: string; // path del svg (viewBox 0 0 24 24)
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    icon: "M3 12h7V3H3v9Zm0 9h7v-7H3v7Zm11 0h7V12h-7v9Zm0-18v7h7V3h-7Z",
    title: "Bienvenido a Attesta",
    body: "Tu sistema de registro para gobernar la IA con evidencia: inventario, riesgo, brechas y vigilancia regulatoria, todo listo para auditoría. Te mostramos en 30 segundos para qué sirve cada apartado.",
  },
  {
    icon: "M4 7h16M4 12h16M4 17h16",
    title: "Inventario",
    body: "Registra cada sistema de IA que tu organización usa (por ejemplo, un filtro de CVs). Es el punto de partida: todo lo demás se calcula a partir de lo que declaras aquí.",
  },
  {
    icon: "M12 3 2 20h20L12 3Zm0 6v5m0 3h.01",
    title: "Riesgo",
    body: "Clasifica cada sistema según el EU AI Act y marcos de EE. UU. Attesta te orienta sobre su nivel de riesgo y qué obligaciones aplican a tu rol de deployer. Es una clasificación orientativa, no una certificación.",
  },
  {
    icon: "M9 11l3 3 8-8M4 12a8 8 0 108-8",
    title: "Gap assessment",
    body: "Mide qué tan preparado estás frente a cada obligación y obtén tu «% listo». Las brechas identificadas se convierten en tareas concretas para cerrar.",
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9 2 2 4-4",
    title: "Plan de acción y Policy packs",
    body: "El plan reúne las tareas para cerrar brechas con responsables y fechas. Los policy packs te dan plantillas listas (empezando por RRHH) para acelerar la evidencia.",
  },
  {
    icon: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    title: "Vigilancia",
    body: "Un radar que vigila las fuentes regulatorias oficiales y te avisa cuando algo cambia. Los cambios detectados llegan como candidatos que un humano valida antes de publicarse. Nunca texto inventado.",
  },
  {
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    title: "Equipo y Actividad",
    body: "Invita a tu equipo con roles y consulta el registro de actividad: un audit-trail inmutable de todo lo que ocurre. Listo, ya puedes empezar.",
  },
];

const LS_PREFIX = "attesta:guide:v1:";

export function WelcomeGuide({
  show,
  userId,
}: {
  show: boolean;
  userId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [entered, setEntered] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    // Guardia rápida: si ya la vio en este navegador, no la muestres.
    const key = LS_PREFIX + (userId ?? "anon");
    let seenLocal = false;
    try {
      seenLocal = localStorage.getItem(key) === "1";
    } catch {
      // localStorage no disponible: seguimos con la marca del servidor.
    }
    if (!seenLocal) {
      setOpen(true);
      // Deja que monte antes de animar la entrada.
      requestAnimationFrame(() => setEntered(true));
    }
  }, [show, userId]);

  const dismiss = useCallback(async () => {
    setEntered(false);
    // Marca local inmediata para que no reaparezca al navegar.
    try {
      localStorage.setItem(LS_PREFIX + (userId ?? "anon"), "1");
    } catch {
      // ignorar
    }
    // Persiste en la cuenta (sin bloquear el cierre visual).
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({ data: { guide_seen: true } });
    } catch {
      // Si falla, la guardia local ya evita que reaparezca en este navegador.
    } finally {
      setSaving(false);
    }
    // Espera a la animación de salida antes de desmontar.
    setTimeout(() => setOpen(false), 220);
  }, [userId]);

  if (!open) return null;

  const step = STEPS[i];
  const isFirst = i === 0;
  const isLast = i === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-guide-title"
    >
      {/* Fondo */}
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={dismiss}
        aria-hidden
      />

      {/* Tarjeta */}
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-2xl transition-all duration-300 ${
          entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.98] opacity-0"
        }`}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2 text-brand">
            <SealMark size={22} />
            <span className="text-sm font-semibold text-ink">Guía rápida</span>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Omitir
          </button>
        </div>

        {/* Contenido animado por paso */}
        <div className="px-8 pt-8 pb-6">
          <div key={i} className="animate-guide-step">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
                <path
                  d={step.icon}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2
              id="welcome-guide-title"
              className="mt-5 font-display text-xl font-semibold text-ink"
            >
              {step.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
          </div>
        </div>

        {/* Pie: puntos de progreso + navegación */}
        <div className="flex items-center justify-between border-t border-line px-6 py-4">
          <div className="flex items-center gap-1.5" aria-hidden>
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === i
                    ? "w-5 bg-brand"
                    : idx < i
                      ? "w-1.5 bg-brand/50"
                      : "w-1.5 bg-line-strong"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                type="button"
                variant="ghost"
                className="px-4 py-2"
                onClick={() => setI((n) => Math.max(0, n - 1))}
              >
                Atrás
              </Button>
            )}
            {isLast ? (
              <Button
                type="button"
                className="px-5 py-2"
                disabled={saving}
                onClick={dismiss}
              >
                Empezar
              </Button>
            ) : (
              <Button
                type="button"
                className="px-5 py-2"
                onClick={() => setI((n) => Math.min(STEPS.length - 1, n + 1))}
              >
                Siguiente
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
