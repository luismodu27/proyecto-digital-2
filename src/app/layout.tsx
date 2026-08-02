import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { localeFromHeader } from "@/lib/i18n/resolve";
import { PageView } from "@/components/telemetry/PageView";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://attesta-io.vercel.app";
const OG_DESC =
  "Inventaría tus sistemas de IA, clasifica su riesgo (EU AI Act + EE. UU.) y genera evidencia lista para auditoría. Compliance de IA sin equipo GRC.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Attesta — Gobernanza continua de IA para el mid-market",
    template: "%s · Attesta",
  },
  description: OG_DESC,
  applicationName: "Attesta",
  keywords: [
    "EU AI Act",
    "gobernanza de IA",
    "compliance de IA",
    "AI governance",
    "RRHH",
    "reclutamiento con IA",
    "preparación para auditoría",
    "NYC Local Law 144",
    "auditoría de sesgo",
    "mid-market",
  ],
  authors: [{ name: "Attesta" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Attesta — Gobernanza continua de IA",
    description: OG_DESC,
    type: "website",
    siteName: "Attesta",
    locale: "es_ES",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Attesta — Gobernanza continua de IA",
    description: OG_DESC,
  },
};

/**
 * `themeColor` pinta la barra del navegador (Safari iOS, Chrome Android) con el
 * papel de la app en vez del blanco por defecto: sin esto, la cabecera choca
 * con el tema oscuro y la app parece rota en móvil antes de renderizar nada.
 *
 * Se declara por `prefers-color-scheme` y NO sigue al toggle manual
 * (`data-theme` en localStorage): el meta se resuelve antes de que corra
 * ningún script, así que un usuario en tema claro dentro de un SO oscuro verá
 * la barra oscura. Corregirlo exigiría mover el `theme-color` a JS en cada
 * cambio de tema; no compensa por una franja de 40 px.
 *
 * `colorScheme` le dice al navegador que hay ambos, para que los controles
 * nativos (scrollbars, selects, autofill) hereden el tema en lugar de salir
 * siempre en claro.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1512" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await localeFromHeader();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Telemetría de primera parte: un solo punto de montaje cubre web
            pública, auth y dashboard. No renderiza nada y respeta GPC/DNT. */}
        <PageView />
      </body>
    </html>
  );
}
