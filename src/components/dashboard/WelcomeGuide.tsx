"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { setUserFlag } from "@/lib/data/user-actions";

/**
 * Guía de uso que se muestra UNA sola vez, tras el primer inicio de sesión.
 *
 * La marca de "vista" vive en `user_metadata.guide_seen` (por cuenta, persiste
 * entre dispositivos) y se refleja además en localStorage como guardia rápida
 * para evitar cualquier parpadeo antes de que el layout servidor se refresque.
 * Cada paso incluye un mini-ejemplo visual de la UI de esa sección + animación.
 */

const C = {
  danger: "var(--tone-danger-fg)",
  warn: "var(--tone-warn-fg)",
  gold: "var(--tone-gold-fg)",
  good: "var(--tone-good-fg)",
};

/* Fila de "sistema" para el mini-inventario (aparición escalonada). */
function SysRow({
  name,
  tag,
  tone,
  delay = 0,
}: {
  name: string;
  tag: string;
  tone: string;
  delay?: number;
}) {
  return (
    <div
      className="animate-guide-row flex items-center justify-between gap-2 rounded-md border border-line bg-paper-raised px-2.5 py-1.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="flex items-center gap-1.5 text-xs text-ink">
        <span className="flex size-4 items-center justify-center rounded bg-brand-soft text-[8px] font-semibold text-brand-strong">
          IA
        </span>
        {name}
      </span>
      <span
        className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
        style={{ color: tone, backgroundColor: `color-mix(in srgb, ${tone} 14%, transparent)` }}
      >
        {tag}
      </span>
    </div>
  );
}

function Bar({
  label,
  pct,
  tone,
  delay = 0,
}: {
  label: string;
  pct: number;
  tone: string;
  delay?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[10px] text-ink-soft">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-sunken">
        <div
          className="animate-guide-bar h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: tone, animationDelay: `${delay}ms` }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-ink">{pct}%</span>
    </div>
  );
}

function Check({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <div
      className="animate-guide-row flex items-center gap-1.5 text-[11px] text-ink-soft"
      style={{ animationDelay: `${delay}ms` }}
    >
      <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" aria-hidden>
        <path
          d="M9 11l3 3 8-8M4 12a8 8 0 108-8"
          stroke={C.good}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </div>
  );
}

/* Marco de mini-UI (ventanita) para dar contexto de "esto es una pantalla". */
function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-3">
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}

type Step = {
  icon: string;
  title: string;
  body: string;
  visual: ReactNode;
};

const STEPS: Step[] = [
  {
    icon: "M3 12h7V3H3v9Zm0 9h7v-7H3v7Zm11 0h7V12h-7v9Zm0-18v7h7V3h-7Z",
    title: "Bienvenido a Attesta",
    body: "Tu sistema de registro para gobernar la IA con evidencia. Te mostramos en 30 segundos para qué sirve cada apartado —con un vistazo a cada pantalla.",
    visual: (
      <Frame label="Resumen de gobernanza">
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "Sistemas", v: "6" },
            { k: "Alto riesgo", v: "4", tone: C.danger },
            { k: "% listo", v: "59%" },
          ].map((c, idx) => (
            <div
              key={c.k}
              className="animate-guide-row rounded-lg border border-line bg-paper-raised p-2"
              style={{ animationDelay: `${60 + idx * 110}ms` }}
            >
              <p
                className="font-display text-base font-semibold"
                style={c.tone ? { color: c.tone } : undefined}
              >
                {c.v}
              </p>
              <p className="text-[9px] text-muted">{c.k}</p>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    icon: "M4 7h16M4 12h16M4 17h16",
    title: "Inventario",
    body: "Registra cada sistema de IA que tu organización usa. Es el punto de partida: todo lo demás se calcula a partir de lo que declaras aquí.",
    visual: (
      <Frame label="Inventario · 3 sistemas">
        <div className="space-y-1.5">
          <SysRow name="Cribado de CVs" tag="Alto riesgo" tone={C.danger} delay={60} />
          <SysRow name="Scoring de candidatos" tag="Alto riesgo" tone={C.danger} delay={170} />
          <SysRow name="Chatbot de entrevistas" tag="Riesgo limitado" tone={C.gold} delay={280} />
        </div>
      </Frame>
    ),
  },
  {
    icon: "M12 3 2 20h20L12 3Zm0 6v5m0 3h.01",
    title: "Riesgo",
    body: "Clasifica cada sistema según el EU AI Act y marcos de EE. UU. Attesta te orienta sobre su nivel de riesgo y qué obligaciones aplican a tu rol de deployer.",
    visual: (
      <Frame label="Distribución de riesgo">
        <div className="space-y-2">
          <Bar label="Alto" pct={67} tone={C.danger} delay={80} />
          <Bar label="Limitado" pct={17} tone={C.gold} delay={220} />
          <Bar label="Mínimo" pct={16} tone={C.good} delay={360} />
        </div>
      </Frame>
    ),
  },
  {
    icon: "M9 11l3 3 8-8M4 12a8 8 0 108-8",
    title: "Gap assessment",
    body: "Mide qué tan preparado estás frente a cada obligación y obtén tu «% listo». Las brechas identificadas se convierten en tareas concretas para cerrar.",
    visual: (
      <Frame label="Preparación para auditoría">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] text-muted">% listo</span>
          <span className="font-display text-lg font-semibold text-ink">78%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-sunken">
          <div
            className="animate-guide-bar h-full rounded-full"
            style={{ width: "78%", backgroundColor: C.good, animationDelay: "80ms" }}
          />
        </div>
        <div className="mt-2 space-y-1">
          <Check delay={220}>Supervisión humana (Art. 14)</Check>
          <Check delay={340}>Transparencia a candidatos (Art. 50)</Check>
        </div>
      </Frame>
    ),
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9 2 2 4-4",
    title: "Plan de acción y Policy packs",
    body: "El plan reúne las tareas para cerrar brechas con responsables y fechas. Los policy packs te dan plantillas listas (empezando por RRHH).",
    visual: (
      <Frame label="Plan de acción">
        <div className="space-y-1.5">
          {[
            { t: "Documentar supervisión humana", who: "Ana · 12 jul", tone: C.danger },
            { t: "Publicar aviso de transparencia", who: "Luis · 20 jul", tone: C.gold },
          ].map((task, idx) => (
            <div
              key={task.t}
              className="animate-guide-row flex items-center justify-between gap-2 rounded-md border border-line bg-paper-raised px-2.5 py-1.5"
              style={{ borderLeftColor: task.tone, borderLeftWidth: 3, animationDelay: `${80 + idx * 130}ms` }}
            >
              <span className="text-[11px] text-ink">{task.t}</span>
              <span className="shrink-0 text-[9px] text-muted">{task.who}</span>
            </div>
          ))}
        </div>
      </Frame>
    ),
  },
  {
    icon: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    title: "Vigilancia",
    body: "Un radar que vigila las fuentes regulatorias oficiales y te avisa cuando algo cambia. Los cambios los valida un humano antes de publicarse: nunca texto inventado.",
    visual: (
      <Frame label="Radar regulatorio">
        <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--tone-good-bd)] bg-brand-soft/50 px-2.5 py-1.5">
          <span className="text-[10px] font-medium text-ink">
            Próximo hito · Transparencia (Art. 50)
          </span>
          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-brand-strong">
            en 16 días
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-muted">
          <span className="size-1.5 rounded-full" style={{ backgroundColor: C.good }} />
          8 fuentes oficiales vigiladas · sin cambios
        </div>
      </Frame>
    ),
  },
  {
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    title: "Equipo y Actividad",
    body: "Invita a tu equipo con roles y consulta el registro de actividad: un audit-trail inmutable de todo lo que ocurre. Listo, ya puedes empezar.",
    visual: (
      <Frame label="Equipo">
        <div className="flex items-center gap-1.5">
          {[
            { i: "AN", tone: "#0b6b4e" },
            { i: "LU", tone: "#b0824a" },
            { i: "MG", tone: "#33507e" },
          ].map((a) => (
            <span
              key={a.i}
              className="flex size-6 items-center justify-center rounded-full text-[9px] font-semibold text-white"
              style={{ backgroundColor: a.tone }}
            >
              {a.i}
            </span>
          ))}
          <span className="ml-1 text-[10px] text-muted">3 miembros · roles por correo</span>
        </div>
        <div className="mt-2 rounded-md border border-line bg-paper-raised px-2.5 py-1.5 text-[10px] text-ink-soft">
          <span className="text-muted">Actividad ·</span> Ana clasificó «Cribado de CVs» como alto riesgo
        </div>
      </Frame>
    ),
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
    const key = LS_PREFIX + (userId ?? "anon");
    let seenLocal = false;
    try {
      seenLocal = localStorage.getItem(key) === "1";
    } catch {
      // localStorage no disponible: seguimos con la marca del servidor.
    }
    if (seenLocal) return;

    // El setState se hace en el callback del rAF (no en el cuerpo del effect):
    // monta y, al frame siguiente, dispara la animación de entrada.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      setOpen(true);
      raf2 = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [show, userId]);

  const dismiss = useCallback(async () => {
    setEntered(false);
    try {
      localStorage.setItem(LS_PREFIX + (userId ?? "anon"), "1");
    } catch {
      // ignorar
    }
    setSaving(true);
    try {
      await setUserFlag("guide_seen");
    } catch {
      // Si falla, la guardia local ya evita que reaparezca en este navegador.
    } finally {
      setSaving(false);
    }
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
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={dismiss}
        aria-hidden
      />

      <div
        className={`relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-2xl transition-all duration-300 ${
          entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.98] opacity-0"
        }`}
      >
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

        <div className="overflow-y-auto px-8 pt-7 pb-6">
          <div key={i} className="animate-guide-step">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
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
                className="font-display text-xl font-semibold text-ink"
              >
                {step.title}
              </h2>
            </div>

            <div className="mt-4">{step.visual}</div>

            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{step.body}</p>
          </div>
        </div>

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
