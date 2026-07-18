"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Botón que, antes de enviar un Server Action, pide confirmación en un modal con
 * marca (sustituye al `window.confirm` nativo, pobre y sin estilo). Envuelve un
 * `<form action={…}>` con campos ocultos; al confirmar, envía el formulario.
 */
export function ConfirmSubmit({
  action,
  fields,
  title,
  message,
  confirmLabel = "Eliminar",
  triggerLabel,
  triggerClassName,
  triggerAriaLabel,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  /** Campos ocultos del formulario (name → value). */
  fields: Record<string, string>;
  title: string;
  message: string;
  confirmLabel?: string;
  /** Texto del botón disparador (o usa `children` para contenido propio, p. ej. un icono). */
  triggerLabel?: string;
  triggerClassName?: string;
  triggerAriaLabel?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <form action={action} ref={formRef}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={triggerAriaLabel}
        className={triggerClassName}
      >
        {children ?? triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-[2px]"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-line bg-paper-raised p-6 shadow-[0_24px_60px_-24px_rgba(15,26,20,0.55)]">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--tone-danger-bg)] text-[var(--tone-danger-fg)]">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
                  <path
                    d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="min-w-0">
                <h2 id={titleId} className="font-display text-base font-semibold text-ink">
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{message}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-sunken"
              >
                Cancelar
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={() => {
                  setOpen(false);
                  formRef.current?.requestSubmit();
                }}
                className="inline-flex items-center justify-center rounded-full border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-4 py-2 text-sm font-medium text-[var(--tone-danger-fg)] transition-colors hover:opacity-90"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
