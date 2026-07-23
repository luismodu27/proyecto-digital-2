import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { localeFromHeader } from "@/lib/i18n/resolve";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
