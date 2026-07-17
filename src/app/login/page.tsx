import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  return (
    <AuthShell>
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
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            Explorar la demo
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
