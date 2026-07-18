"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SealMark } from "./SealMark";

const MESSAGES: Record<string, string> = {
  "system-created": "Sistema registrado en el inventario.",
  "system-updated": "Sistema actualizado.",
  "system-deleted": "Sistema eliminado.",
  "system-error": "No se pudo guardar el sistema. Inténtalo de nuevo.",
  seeded: "Datos de ejemplo cargados.",
  "seed-error": "No se pudieron cargar los datos de ejemplo. Inténtalo de nuevo.",
  "pack-applied": "Policy pack RRHH aplicado al sistema.",
  "pack-error": "No se pudo aplicar el policy pack. Inténtalo de nuevo.",
  "gap-created": "Brecha añadida.",
  "gap-deleted": "Brecha eliminada.",
  "gap-updated": "Estado de la brecha actualizado.",
  "gap-error": "No se pudo completar la acción. Inténtalo de nuevo.",
  "member-added": "Miembro añadido al equipo.",
  "member-invited": "Invitación enviada.",
  "member-exists": "Esa persona ya es miembro del equipo.",
  "role-updated": "Rol actualizado.",
  "member-removed": "Miembro eliminado del equipo.",
  "invite-revoked": "Invitación revocada.",
  "team-forbidden": "No tienes permisos para esta acción.",
  "team-lastowner": "Debe quedar al menos un propietario.",
  "team-bademail": "Introduce un correo válido.",
  "team-demo": "La gestión del equipo requiere conectar tu organización.",
  "team-error": "No se pudo completar la acción. Inténtalo de nuevo.",
  "cand-approved": "Candidato publicado en el radar regulatorio.",
  "cand-saved": "Borrador del candidato guardado.",
  "cand-rejected": "Candidato descartado.",
  "cand-demo": "La validación de candidatos requiere conectar tu organización.",
  "cand-error": "No se pudo completar la acción. Revisa e inténtalo de nuevo.",
  "jur-saved": "Jurisdicciones actualizadas.",
  "jur-demo": "Configurar jurisdicciones requiere conectar tu organización.",
  "jur-error": "No se pudieron guardar las jurisdicciones.",
  "task-created": "Tarea añadida al plan.",
  "task-deleted": "Tarea eliminada.",
  "task-demo": "Editar el plan requiere conectar tu organización.",
  "task-error": "No se pudo completar la acción. Inténtalo de nuevo.",
  "vigia-ok": "Vigía ejecutado. Revisa la bandeja si detectó cambios.",
  "vigia-demo": "El Vigía requiere conectar tu organización.",
  "vigia-denied": "Solo el equipo de validación de Attesta puede ejecutar el Vigía.",
  "vigia-error": "El Vigía no pudo completar la revisión. Inténtalo de nuevo.",
};

/** Claves que son ERRORES o bloqueos → se pintan en tono de peligro (rojo). */
const DANGER = new Set([
  "system-error",
  "seed-error",
  "pack-error",
  "gap-error",
  "team-forbidden",
  "team-lastowner",
  "team-bademail",
  "team-error",
  "cand-error",
  "jur-error",
  "task-error",
  "vigia-error",
  "vigia-denied",
]);

/** Claves informativas (avisos de modo demo o duplicados) → tono neutro. */
const INFO = new Set([
  "member-exists",
  "team-demo",
  "cand-demo",
  "jur-demo",
  "task-demo",
  "vigia-demo",
]);

type Tone = "success" | "danger" | "info";

function toneOf(key: string): Tone {
  if (DANGER.has(key)) return "danger";
  if (INFO.has(key)) return "info";
  return "success";
}

const TONE_STYLES: Record<Tone, string> = {
  success: "border-[var(--tone-good-bd)]",
  danger: "border-[var(--tone-danger-bd)]",
  info: "border-[var(--tone-neutral-bd)]",
};

/**
 * Toast sutil disparado por un parámetro `?toast=` en la URL (tras un server
 * action con redirect). Se anima, se autodescarta y limpia el parámetro.
 */
export function Toaster() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const key = params.get("toast");

  const [msg, setMsg] = useState("");
  const [tone, setTone] = useState<Tone>("success");
  const [show, setShow] = useState(false);
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!key || !MESSAGES[key] || handled.current === key) return;
    handled.current = key;
    setMsg(MESSAGES[key]);
    setTone(toneOf(key));
    setShow(true);

    const clean = new URLSearchParams(Array.from(params.entries()));
    clean.delete("toast");
    router.replace(pathname + (clean.toString() ? `?${clean}` : ""), {
      scroll: false,
    });

    const t = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(t);
  }, [key, params, pathname, router]);

  if (!msg) return null;

  return (
    <div
      className={`pointer-events-none fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div
        role={tone === "danger" ? "alert" : "status"}
        className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border ${TONE_STYLES[tone]} bg-paper-raised py-3 pl-4 pr-3 text-sm font-medium text-ink shadow-[0_18px_44px_-24px_rgba(15,26,20,0.5)]`}
      >
        {tone === "danger" ? (
          <svg
            viewBox="0 0 24 24"
            className="size-5 shrink-0 text-[var(--tone-danger-fg)]"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : tone === "info" ? (
          <svg
            viewBox="0 0 24 24"
            className="size-5 shrink-0 text-muted"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 16v-4m0-4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <SealMark size={20} className="text-brand" />
        )}
        <span>{msg}</span>
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Cerrar notificación"
          className="ml-1 -mr-1 grid size-6 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-paper-sunken hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
