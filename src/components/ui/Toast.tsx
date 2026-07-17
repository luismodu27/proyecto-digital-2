"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SealMark } from "./SealMark";

const MESSAGES: Record<string, string> = {
  "system-created": "Sistema registrado en el inventario.",
  "system-updated": "Sistema actualizado.",
  "system-deleted": "Sistema eliminado.",
  seeded: "Datos de ejemplo cargados.",
  "pack-applied": "Policy pack RRHH aplicado al sistema.",
  "gap-created": "Brecha añadida.",
  "gap-deleted": "Brecha eliminada.",
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
  const [show, setShow] = useState(false);
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!key || !MESSAGES[key] || handled.current === key) return;
    handled.current = key;
    setMsg(MESSAGES[key]);
    setShow(true);

    const clean = new URLSearchParams(Array.from(params.entries()));
    clean.delete("toast");
    router.replace(pathname + (clean.toString() ? `?${clean}` : ""), {
      scroll: false,
    });

    const t = setTimeout(() => setShow(false), 3500);
    return () => clearTimeout(t);
  }, [key, params, pathname, router]);

  if (!msg) return null;

  return (
    <div
      className={`pointer-events-none fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
        show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-[#bfdccf] bg-paper-raised px-4 py-3 text-sm font-medium text-ink shadow-[0_18px_44px_-24px_rgba(15,26,20,0.5)]">
        <SealMark size={20} className="text-brand" />
        {msg}
      </div>
    </div>
  );
}
