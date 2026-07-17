"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { createClient } from "@/lib/supabase/client";

/**
 * Fija una nueva contraseña. Solo funciona con la sesión de recuperación que
 * establece `/auth/callback` tras abrir el enlace del correo. Si no hay sesión
 * (enlace caducado o abierto en otro navegador), guiamos a pedir otro enlace.
 */
export function ResetUpdateForm() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verifica que exista sesión de recuperación al montar.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setReady(!!data.user))
      .catch(() => setReady(false))
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      // Ya hay sesión completa: llevamos al panel.
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err) {
      const msg = (err instanceof Error ? err.message : "").toLowerCase();
      if (msg.includes("should be different"))
        setError("La nueva contraseña debe ser distinta a la anterior.");
      else if (msg.includes("session") || msg.includes("jwt"))
        setError("El enlace caducó. Solicita uno nuevo.");
      else setError("No pudimos actualizar la contraseña. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "mt-1.5 w-full rounded-lg border bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:ring-2 focus:ring-brand/30 border-line-strong focus:border-brand";

  if (checking) {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-8">
        <p className="text-sm text-muted">Comprobando el enlace…</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-8">
        <SealMark size={36} className="text-brand" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Enlace no válido
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Este enlace de recuperación caducó o ya se usó. Solicita uno nuevo
          para continuar.
        </p>
        <Link
          href="/reset-password"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
        >
          Solicitar otro enlace
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-8">
        <SealMark size={36} className="text-brand" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Contraseña actualizada
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Listo. Te estamos llevando a tu panel…
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-8">
      <SealMark size={36} className="text-brand" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        Crea una nueva contraseña
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Elige una contraseña segura para tu cuenta.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-ink"
          >
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              className={`${inputBase} pr-12`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted hover:text-ink"
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPass ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted">Mínimo 6 caracteres.</p>
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="block text-sm font-medium text-ink"
          >
            Repite la contraseña
          </label>
          <input
            id="confirm"
            type={showPass ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (error) setError(null);
            }}
            className={inputBase}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-3 py-2 text-sm text-[var(--tone-danger-fg)]"
          >
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full py-2.5">
          {loading ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>
    </div>
  );
}
