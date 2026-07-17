import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { AuthForm } from "@/components/auth/AuthForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      <div className="border-b border-line">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {isSupabaseConfigured ? (
            <AuthForm />
          ) : (
            <div className="rounded-2xl border border-line bg-paper-raised p-8 text-center">
              <h1 className="font-display text-2xl font-semibold text-ink">
                Modo demo
              </h1>
              <p className="mt-3 text-sm text-ink-soft">
                El acceso con cuentas requiere conectar Supabase. Mientras tanto,
                puedes explorar el producto con datos de ejemplo.
              </p>
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
              >
                Explorar la demo
              </Link>
            </div>
          )}
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/" className="hover:text-ink">
              ← Volver al sitio
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
