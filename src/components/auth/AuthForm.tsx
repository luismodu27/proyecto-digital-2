"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SealMark } from "@/components/ui/SealMark";
import { SsoButtons } from "@/components/auth/SsoButtons";
import { createClient } from "@/lib/supabase/client";
import { isAnySsoEnabled } from "@/lib/supabase/config";
import { friendlyError } from "@/lib/friendly-error";
import type { Dictionary } from "@/lib/i18n";

type Mode = "login" | "signup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  nombre?: string;
  apellido1?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

export function AuthForm({
  t,
  initialError,
}: {
  t: Dictionary["auth"];
  initialError?: string;
}) {
  const l = t.login;
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
      if (!nombre.trim()) errs.nombre = l.nombreRequired;
      if (!apellido1.trim()) errs.apellido1 = l.apellido1Required;
    }
    if (!email.trim()) errs.email = l.emailRequired;
    else if (!EMAIL_RE.test(email.trim())) errs.email = l.emailInvalid;
    if (!password) errs.password = l.passwordRequired;
    else if (mode === "signup" && password.length < 6)
      errs.password = l.passwordMin;
    if (mode === "signup") {
      if (!confirm) errs.confirm = l.confirmRequired;
      else if (confirm !== password) errs.confirm = l.confirmMismatch;
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
      setError(
        friendlyError(err instanceof Error ? err.message : "", t.friendlyErrors),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = code.trim();
    if (!/^\d{4,8}$/.test(token)) {
      setError(l.codeRequired);
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
        setError(l.codeVerifyFailed);
      }
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "", t.friendlyErrors),
      );
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
      setNotice(l.resentNotice);
    } catch (err) {
      setError(
        friendlyError(err instanceof Error ? err.message : "", t.friendlyErrors),
      );
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
    "mt-1.5 w-full rounded-lg border bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:ring-2 focus:ring-brand";
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
          {l.verifyTitle}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {l.verifyDescBefore}
          <span className="font-medium text-ink">{pendingEmail}</span>
          {l.verifyDescAfter}
        </p>

        <form onSubmit={handleVerify} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-ink">
              {l.codeLabel}
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
            {loading ? l.verifying : l.verifyCta}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={resendCode}
            disabled={resending}
            className="font-medium text-brand transition-colors hover:text-brand-strong disabled:opacity-50"
          >
            {resending ? l.resending : l.resend}
          </button>
          <button
            type="button"
            onClick={backToSignup}
            className="font-medium text-muted transition-colors hover:text-ink"
          >
            {l.changeEmail}
          </button>
        </div>

        <p className="mt-4 text-xs text-muted">{l.linkHint}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-8">
      <SealMark size={36} className="text-brand" />
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        {mode === "login" ? l.loginTitle : l.signupTitle}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {mode === "login" ? l.loginSubtitle : l.signupSubtitle}
      </p>

      {isAnySsoEnabled && (
        <div className="mt-6">
          {/* Un único destino: el layout del dashboard envía a /onboarding si aún
              no hay organización (usuario nuevo por OAuth). */}
          <SsoButtons t={t.sso} next="/dashboard" />
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
                {l.nombreLabel}
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
                aria-describedby={fieldErrors.nombre ? "err-nombre" : undefined}
                className={`${inputBase} ${fieldErrors.nombre ? errBorder : okBorder}`}
                placeholder={l.nombrePlaceholder}
              />
              {fieldErrors.nombre && (
                <p id="err-nombre" role="alert" className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.nombre}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="apellido1" className="block text-sm font-medium text-ink">
                  {l.apellido1Label}
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
                  aria-describedby={fieldErrors.apellido1 ? "err-apellido1" : undefined}
                  className={`${inputBase} ${fieldErrors.apellido1 ? errBorder : okBorder}`}
                  placeholder={l.apellido1Placeholder}
                />
                {fieldErrors.apellido1 && (
                  <p id="err-apellido1" role="alert" className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.apellido1}</p>
                )}
              </div>
              <div>
                <label htmlFor="apellido2" className="block text-sm font-medium text-ink">
                  {l.apellido2Label}{" "}
                  <span className="font-normal text-muted">{l.apellido2Optional}</span>
                </label>
                <input
                  id="apellido2"
                  type="text"
                  autoComplete="additional-name"
                  value={apellido2}
                  onChange={(e) => setApellido2(e.target.value)}
                  className={`${inputBase} ${okBorder}`}
                  placeholder={l.apellido2Placeholder}
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            {l.emailLabel}
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
            aria-describedby={fieldErrors.email ? "err-email" : undefined}
            className={`${inputBase} ${fieldErrors.email ? errBorder : okBorder}`}
            placeholder={l.emailPlaceholder}
          />
          {fieldErrors.email && (
            <p id="err-email" role="alert" className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-ink">
              {l.passwordLabel}
            </label>
            {mode === "login" && (
              <Link
                href="/reset-password"
                className="text-xs font-medium text-brand transition-colors hover:text-brand-strong"
              >
                {l.forgotPassword}
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
              aria-describedby={fieldErrors.password ? "err-password" : undefined}
              className={`${inputBase} pr-12 ${fieldErrors.password ? errBorder : okBorder}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-muted hover:text-ink"
              aria-label={showPass ? l.hidePassword : l.showPassword}
            >
              {showPass ? l.hide : l.show}
            </button>
          </div>
          {fieldErrors.password && (
            <p id="err-password" role="alert" className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.password}</p>
          )}
          {mode === "signup" && !fieldErrors.password && (
            <p className="mt-1.5 text-xs text-muted">{l.passwordHint}</p>
          )}
        </div>

        {mode === "signup" && (
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-ink">
              {l.confirmLabel}
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
              aria-describedby={fieldErrors.confirm ? "err-confirm" : undefined}
              className={`${inputBase} ${fieldErrors.confirm ? errBorder : okBorder}`}
              placeholder="••••••••"
            />
            {fieldErrors.confirm && (
              <p id="err-confirm" role="alert" className="mt-1.5 text-xs text-[var(--tone-danger-fg)]">{fieldErrors.confirm}</p>
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
            ? l.submitLoading
            : mode === "login"
              ? l.loginCta
              : l.signupCta}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {mode === "login" ? l.noAccount : l.haveAccount}{" "}
        <button
          type="button"
          onClick={switchMode}
          className="font-medium text-brand transition-colors hover:text-brand-strong"
        >
          {mode === "login" ? l.switchToSignup : l.switchToLogin}
        </button>
      </p>
    </div>
  );
}
