import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetRequestForm } from "@/components/auth/ResetRequestForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "Recuperar contraseña · Attesta" };

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      {isSupabaseConfigured ? (
        <ResetRequestForm />
      ) : (
        <div className="rounded-2xl border border-line bg-paper-raised p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Modo demo
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            La recuperación de contraseña requiere conectar Supabase.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
