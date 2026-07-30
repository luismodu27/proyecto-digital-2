import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { IntakeForm } from "@/components/dashboard/IntakeForm";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

/**
 * Página PÚBLICA del enlace de intake.
 *
 * Nota de diseño que parece contraintuitiva y es deliberada: **no se comprueba el
 * token al renderizar**. El formulario se muestra siempre y la validación ocurre
 * al enviar, dentro de la RPC. Si aquí se consultara el token, esta URL se
 * convertiría en un oráculo: probando enlaces se sabría cuáles existen (y por
 * tanto qué organizaciones son clientes). Además haría falta darle a `anon`
 * permiso de lectura sobre `intake_links`, que es exactamente lo que 0027 evita.
 *
 * `noindex`: son URLs con capacidad, no deben acabar en un buscador.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await resolveLocale()).intake;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function IntakePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = getDictionary(await resolveLocale()).intake;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center px-5 py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center">
          <Logo href="/" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-ink sm:text-3xl">
          {t.title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft">{t.subtitle}</p>
      </div>

      <IntakeForm token={token} t={t} />

      <p className="mt-8 text-center text-xs text-muted">{t.footerNote}</p>
    </main>
  );
}
