"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { createClient } from "@/lib/supabase/client";

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
  if (m.includes("fetch") || m.includes("network"))
    return "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.";
  return "Algo salió mal. Inténtalo de nuevo.";
}

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "Introduce tu correo de trabajo.";
    else if (!EMAIL_RE.test(email.trim()))
      errs.email = "Introduce un correo válido (p. ej. tu@empresa.com).";
    if (!password) errs.password = "Introduce tu contraseña.";
    else if (mode === "signup" && password.length < 6)
      errs.password = "La contraseña debe tener al menos 6 caracteres.";
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
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push("/onboarding");
          router.refresh();
        } else {
          setNotice(
            "Te enviamos un correo de confirmación. Confírmalo y luego inicia sesión.",
          );
          setMode("login");
        }
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : ""));
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
    setNotice(null);
    setFieldErrors({});
  }

  const inputBase =
    "mt-1.5 w-full rounded-lg border bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:ring-2 focus:ring-brand/30";

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

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
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
              if (fieldErrors.email)
                setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            aria-invalid={!!fieldErrors.email}
            className={`${inputBase} ${
              fieldErrors.email
                ? "border-[#e6b6b1] focus:border-[#c9453b]"
                : "border-line-strong focus:border-brand"
            }`}
            placeholder="tu@empresa.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-[#8f271f]">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password)
                  setFieldErrors((f) => ({ ...f, password: undefined }));
              }}
              aria-invalid={!!fieldErrors.password}
              className={`${inputBase} pr-12 ${
                fieldErrors.password
                  ? "border-[#e6b6b1] focus:border-[#c9453b]"
                  : "border-line-strong focus:border-brand"
              }`}
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
            <p className="mt-1.5 text-xs text-[#8f271f]">{fieldErrors.password}</p>
          )}
          {mode === "signup" && !fieldErrors.password && (
            <p className="mt-1.5 text-xs text-muted">Mínimo 6 caracteres.</p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[#e6b6b1] bg-[#f7e4e2] px-3 py-2 text-sm text-[#8f271f]"
          >
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-[#bfdccf] bg-brand-soft px-3 py-2 text-sm text-brand-strong">
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
