import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { WelcomeGuide } from "@/components/dashboard/WelcomeGuide";
import { shouldShowGuide } from "@/lib/dashboard/onboarding";
import { getAiSystems } from "@/lib/data";
import { Toaster } from "@/components/ui/Toast";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getActiveOrg, getCurrentUser } from "@/lib/data/context";
import { getIsPlatformAdmin, getUserOrgs } from "@/lib/data";
import { getOrgPlan, type PlanTier } from "@/lib/billing/plan";
import type { UserOrg } from "@/lib/mock-data";
import { I18nProvider } from "@/lib/i18n/provider";
import { getDictionary } from "@/lib/i18n";
import { resolveLocale } from "@/lib/i18n/resolve";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userEmail: string | undefined;
  let userName: string | undefined;
  let userId: string | undefined;
  let showGuide = false;
  let plan: PlanTier | undefined;
  let orgs: UserOrg[] = [];
  let activeOrgId: string | undefined;
  let isPlatformAdmin = false;

  // En modo conectado, exige sesión y organización. En modo demo, abierto.
  if (isSupabaseConfigured) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    const org = await getActiveOrg();
    if (!org) redirect("/onboarding");
    userEmail = user.email ?? undefined;
    userId = user.id;
    activeOrgId = org;
    // `getIsPlatformAdmin` es una lectura indexada de una fila; solo sirve para
    // añadir los paneles internos a la navegación del equipo de Attesta.
    [plan, orgs, isPlatformAdmin] = await Promise.all([
      getOrgPlan(org),
      getUserOrgs(),
      getIsPlatformAdmin().catch(() => false),
    ]);
    const meta = user.user_metadata ?? {};
    const rawName =
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.display_name === "string" && meta.display_name) ||
      (typeof meta.nombre === "string" && meta.nombre) ||
      "";
    userName = rawName.trim() || undefined;
    // La guía se muestra solo la primera vez (hasta que se marca vista) Y solo
    // si hay algo por lo que guiar: con el inventario vacío manda la pantalla
    // de bienvenida, y el modal encima sería la segunda bienvenida simultánea.
    // `getAiSystems` lleva `cache()`, así que en la portada esta consulta es
    // gratis (la página ya la hace).
    showGuide = shouldShowGuide({
      guideSeen: meta.guide_seen === true,
      systemCount: (await getAiSystems()).length,
    });
  }

  const locale = await resolveLocale();
  const dict = getDictionary(locale);

  return (
    <I18nProvider locale={locale} dict={dict}>
      <div className="flex min-h-dvh flex-col bg-paper md:flex-row">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          {dict.dashboard.skipToContent}
        </a>
        <Sidebar
          userEmail={userEmail}
          userName={userName}
          plan={plan}
          orgs={orgs}
          activeOrgId={activeOrgId}
          isPlatformAdmin={isPlatformAdmin}
        />
        {/* `scroll-mt-14` = la altura exacta de la barra móvil `sticky h-14`.
            Sin esto, «Saltar al contenido» deja el `<h1>` y los primeros
            controles DEBAJO de la barra. En escritorio no hay barra que
            esquivar, de ahí el `md:scroll-mt-0`. */}
        <main
          id="contenido"
          className="flex-1 scroll-mt-14 md:h-dvh md:overflow-y-auto md:scroll-mt-0"
        >
          <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">{children}</div>
        </main>
        {showGuide && <WelcomeGuide show userId={userId} />}
        <Suspense>
          <Toaster />
        </Suspense>
      </div>
    </I18nProvider>
  );
}
