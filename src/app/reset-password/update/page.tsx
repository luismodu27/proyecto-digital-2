import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetUpdateForm } from "@/components/auth/ResetUpdateForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata() {
  const locale = await resolveLocale();
  return { title: getDictionary(locale).auth.meta.resetUpdateTitle };
}

export default async function ResetPasswordUpdatePage() {
  const locale = await resolveLocale();
  const t = getDictionary(locale).auth;

  return (
    <AuthShell locale={locale} t={t}>
      {isSupabaseConfigured ? (
        <ResetUpdateForm t={t} />
      ) : (
        <div className="rounded-2xl border border-line bg-paper-raised p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {t.resetDemo.title}
          </h1>
          <p className="mt-3 text-sm text-ink-soft">{t.resetDemo.body}</p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            {t.resetDemo.cta}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
