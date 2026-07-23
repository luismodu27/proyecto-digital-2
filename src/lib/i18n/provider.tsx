"use client";

/**
 * Provider de i18n para Client Components. El diccionario se resuelve en el
 * servidor y se pasa ya listo; en cliente no se lee cookie ni se hace fetch.
 *
 * Uso:
 *   const t = useT();            // diccionario completo, tipado
 *   const locale = useLocale();  // "es" | "en"
 */
import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./index";

type I18nValue = { locale: Locale; dict: Dictionary };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useT/useLocale deben usarse dentro de <I18nProvider>.");
  }
  return ctx;
}

export function useT(): Dictionary {
  return useI18n().dict;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
