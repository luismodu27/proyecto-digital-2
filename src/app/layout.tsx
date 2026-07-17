import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Attesta — Gobernanza continua de IA para el mid-market",
  description:
    "Inventaría tus sistemas de IA, clasifica su riesgo según el EU AI Act y genera evidencia lista para auditoría. Compliance de IA sin equipo GRC.",
  metadataBase: new URL("https://attesta.example"),
  openGraph: {
    title: "Attesta — Gobernanza continua de IA",
    description:
      "Compliance de IA continuo para empresas medianas: inventario, clasificación de riesgo y evidencia de auditoría.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
