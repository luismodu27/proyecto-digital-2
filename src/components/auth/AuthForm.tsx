"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { SsoButtons } from "@/components/auth/SsoButtons";
import { createClient } from "@/lib/supabase/client";
import { isAnySsoEnabled } from "@/lib/supabase/config";

type Mode = "login" | "signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Traduce errores de Supabase a mensajes claros en español. */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Confirma tu correo antes de iniciar sesión.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Ya existe una cuenta con este correo. Inicia sesión.";
  if (m.includes("password should be"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("invalid format") || m.includes("unable to validate email"))
    return "El correo no tiene un formato válido.";
  if (m.includes("signups") && m.includes("disabled"))
    return "El registro por correo está deshabilitado. Contacta al administrador.";
  if (m.includes("for security purposes") || m.includes("rate limit"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (m.includes("expired") || m.includes("invalid") || m.includes("token"))
    return "El código es incorrecto o expiró. Revisa el correo o reenvíalo.";
  if (m.includes("fetch") || m.includes("network"))
    return "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.";
  return "Algo salió mal. Inténtalo de nuevo.";
}

type FieldErrors = {
  nombre?: string;
  apellido1?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export function AuthForm({ initialError }: { initialError?: string } = {}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Verificación por código: correo pendiente + código de 6 dígitos.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (mode === "signup") {
      if (!nombre.trim()) errs.nombre = "Introduce tu nombre.";
      if (!apellido1.trim()) errs.apellido1 = "Introduce tu primer apellido.";
    }
    if (!email.trim()) errs.email = "Introduce tu correo de trabajo.";
    else if (!EMAIL_RE.test(email.trim()))
      errs.email = "Introduce un correo válido (p. ej. tu@empresa.com).";
    if (!password) errs.password = "Introduce tu contraseña.";
    else if (mode === "signup" && password.length < 6)
      errs.password = "La contraseña debe tener al menos 6 caracteres.";
    if (mode === "signup") {
      if (!confirm) errs.confirm = "Repite la contraseña.";
      else if (confirm !== password) errs.confirm = "Las contraseñas no coinciden.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!validate()) return;

    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const fullName = [nombre.trim(), apellido1.trim(), apellido2.trim()]
          .filter(Boolean)
          .join(" ");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              nombre: nombre.trim(),
              apellido_paterno: apellido1.trim(),
              apellido_materno: apellido2.trim(),
              full_name: fullName,
              display_name: fullName,
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/onboarding");
          router.refresh();
        } else {
          // Sin sesión: hay que confirmar el correo. Pasamos a introducir el código.
          setPendingEmail(email.trim());
          setNotice(null);
        }
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = code.trim();
    if (!/^\d{4,8}$/.test(token)) {
      setError("Introduce el código que te enviamos por correo.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingEmail!,
        token,
        type: "signup",
      });
      if (error) throw error;
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        setError("No pudimos verificar el código. Inténtalo de nuevo.");
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!pendingEmail) return;
    setError(null);
    setNotice(null);
    setResending(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
      });
      if (error) throw error;
      setNotice("Te reenviamos el código. Revisa tu correo (y la carpeta de spam).");
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setResending(false);
    }
  }

  function backToSignup() {
    setPendingEmail(null);
    setCode("");
    setError(null);
    setNotice(null);
  }

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
    setNotice(null);
    setFieldErrors({});
  }

  const inputBase =
    "mt-1.5 w-full rounded-lg border bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:ring-2 focus:ring-brand/30";
  const okBorder = "border-line-strong focus:border-brand";
  const errBorder =
    "border-[var(--tone-danger-bd)] focus:border-[var(--tone-danger-fg)]";
  const clearErr = (k: keyof FieldErrors) =>
    setFieldErrors((f) => (f[k] ? { ...f, [k]: undefined } : f));

  // Etapa de verificación por código (tras registrarse).
  if (pendingEmail) {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-8">
        <SealMark size={36} className="text-brand" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          Verifica tu correo
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Te enviamos un código de verificación a{" "}
          <span className="font-medium text-ink">{pendingEmail}</span>. Introdúcelo
          para activar tu cuenta.
        </p>

        <form onSubmit={handleVerify} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-ink">
              Código de verificación
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ""));
                if (error) setError(null);
              }}
              className={`${inputBase} text-center text-lg tracking-[0.5em] ${okBorder}`}
              placeholder="••••••"
              maxLength={8}
              autoFocus
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
          {notice && (
            <p className="rounded-lg border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] px-3 py-2 text-sm text-[var(--tone-good-fg)]">
              {notice}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full py-2.5">
            {loading ? "Verificando…" : "Verificar y continuar"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={resendCode}
            disabled={resending}
            className="font-medium text-brand transition-colors hover:text-brand-strong disabled:opacity-50"
          >
            {resending ? "Reenviando…" : "Reenviar código"}
          </button>
          <button
            type="button"
            onClick={backToSignup}
            className="font-medium text-muted transition-colors hover:text-ink"
          >
            ← Cambiar correo
          </button>
        </div>

        <p className="mt-4 text-xs text-muted">
          ¿Recibiste un enlace en lugar de un código? Ábrelo desde el correo para
          confirmar tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-8">
      <SealMark size={36} className="text-brand" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {mode === "login"
          ? "Accede a tu panel de gobernanza de IA."
          : "Empieza a inventariar y clasificar tu IA."}
      </p>

      {isAnySsoEnabled && (
        <div className="mt-6">
          {/* Un único destino: el layout del dashboard envía a /onboarding si aún
              no hay organización (usuario nuevo por OAuth). */}
          <SsoButtons next="/dashboard" />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className={`${isAnySsoEnabled ? "mt-4" : "mt-6"} space-y-4`}
      >
        {mode === "signup" && (
          <>
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-ink">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                autoComplete="given-name"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  clearErr("nombre");
                }}
                aria-invalid={!!fieldErrors.nombre}
                className={`${inputBase} ${fieldErrors.nombre ? errBorder : okBorder}`}
                placeholder="Tu nombre"
              />
              {fieldErrors.nombre && (
                <p className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.nombre}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="apellido1" className="block text-sm font-medium text-ink">
                  Primer apellido
                </label>
                <input
                  id="apellido1"
                  type="text"
                  autoComplete="family-name"
                  value={apellido1}
                  onChange={(e) => {
                    setApellido1(e.target.value);
                    clearErr("apellido1");
                  }}
                  aria-invalid={!!fieldErrors.apellido1}
                  className={`${inputBase} ${fieldErrors.apellido1 ? errBorder : okBorder}`}
                  placeholder="Apellido"
                />
                {fieldErrors.apellido1 && (
                  <p className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.apellido1}</p>
                )}
              </div>
              <div>
                <label htmlFor="apellido2" className="block text-sm font-medium text-ink">
                  Segundo apellido{" "}
                  <span className="font-normal text-muted">(opcional)</span>
                </label>
                <input
                  id="apellido2"
                  type="text"
                  autoComplete="additional-name"
                  value={apellido2}
                  onChange={(e) => setApellido2(e.target.value)}
                  className={`${inputBase} ${okBorder}`}
                  placeholder="Apellido"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Correo de trabajo
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearErr("email");
            }}
            aria-invalid={!!fieldErrors.email}
            className={`${inputBase} ${fieldErrors.email ? errBorder : okBorder}`}
            placeholder="tu@empresa.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              Contraseña
            </label>
            {mode === "login" && (
              <Link
                href="/reset-password"
                className="text-xs font-medium text-brand transition-colors hover:text-brand-strong"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearErr("password");
              }}
              aria-invalid={!!fieldErrors.password}
              className={`${inputBase} pr-12 ${fieldErrors.password ? errBorder : okBorder}`}
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
          {fieldErrors.password && (
            <p className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.password}</p>
          )}
          {mode === "signup" && !fieldErrors.password && (
            <p className="mt-1.5 text-xs text-muted">Mínimo 6 caracteres.</p>
          )}
        </div>

        {mode === "signup" && (
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-ink">
              Confirmar contraseña
            </label>
            <input
              id="confirm"
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                clearErr("confirm");
              }}
              aria-invalid={!!fieldErrors.confirm}
              className={`${inputBase} ${fieldErrors.confirm ? errBorder : okBorder}`}
              placeholder="••••••••"
            />
            {fieldErrors.confirm && (
              <p className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.confirm}</p>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[var(--tone-danger-bd)] bg-[var(--tone-danger-bg)] px-3 py-2 text-sm text-[var(--tone-danger-fg)]"
          >
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] px-3 py-2 text-sm text-[var(--tone-good-fg)]">
            {notice}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full py-2.5">
          {loading
            ? "Un momento…"
            : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          className="font-medium text-brand transition-colors hover:text-brand-strong"
        >
          {mode === "login" ? "Regístrate" : "Inicia sesión"}
        </button>
      </p>
    </div>
  );
}
