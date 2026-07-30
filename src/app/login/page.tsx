import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; signup?: string }>;
}) {
  const { error, signup } = await searchParams;
  const locale = await resolveLocale();
  const t = getDictionary(locale).auth;

  // `?signup=1` abre el formulario ya en modo registro. Lo usa el CTA principal
  // de la landing ("Empieza gratis"): si cayera en el modo iniciar-sesión, el
  // visitante nuevo tendría que descubrir el toggle — fricción innecesaria en el
  // paso de mayor valor del embudo.
  const startInSignup = signup === "1";

  const pageErrors: Record<string, string> = {
    auth_link: t.pageErrors.authLink,
    sso: t.pageErrors.sso,
  };
  const initialError = error ? pageErrors[error] : undefined;

  return (
    <AuthShell locale={locale} t={t}>
      {isSupabaseConfigured ? (
        <AuthForm
          t={t}
          initialError={initialError}
          initialMode={startInSignup ? "signup" : "login"}
        />
      ) : (
        <div className="rounded-2xl border border-line bg-paper-raised p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t.demo.title}
          </h1>
          <p className="mt-3 text-sm text-ink-soft">{t.demo.body}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            {t.demo.cta}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
