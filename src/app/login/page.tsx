import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = await resolveLocale();
  const t = getDictionary(locale).auth;

  const pageErrors: Record<string, string> = {
    auth_link: t.pageErrors.authLink,
    sso: t.pageErrors.sso,
  };
  const initialError = error ? pageErrors[error] : undefined;

  return (
    <AuthShell locale={locale} t={t}>
      {isSupabaseConfigured ? (
        <AuthForm t={t} initialError={initialError} />
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
