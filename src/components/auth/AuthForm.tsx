"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Si la confirmación por email está desactivada, hay sesión inmediata.
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
      setError(err instanceof Error ? err.message : "Algo salió mal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {mode === "login"
          ? "Accede a tu panel de gobernanza de IA."
          : "Empieza a inventariar y clasificar tu IA."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Correo de trabajo
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            placeholder="tu@empresa.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-[#e6b6b1] bg-[#f7e4e2] px-3 py-2 text-sm text-[#8f271f]">
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
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setNotice(null);
          }}
          className="font-medium text-brand hover:text-brand-strong"
        >
          {mode === "login" ? "Regístrate" : "Inicia sesión"}
        </button>
      </p>
    </div>
  );
}
