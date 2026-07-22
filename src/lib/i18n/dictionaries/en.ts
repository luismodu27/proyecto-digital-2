/**
 * English dictionary. Must satisfy `Dictionary` (the shape derived from `es`).
 * A missing key or a changed signature is a compile-time error.
 *
 * UI chrome only — no deterministic regulatory content (see config.ts).
 */
import type { Dictionary } from "../index";

export const en: Dictionary = {
  common: {
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    next: "Next",
    loading: "Loading…",
    seeAll: "See all",
    skipToContent: "Skip to content",
  },

  locale: {
    switchToEn: "View in English",
    switchToEs: "View in Spanish",
    label: "Language",
    es: "Español",
    en: "English",
  },

  nav: {
    product: "Product",
    howItWorks: "How it works",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Log in",
    requestAccess: "Request access",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
};
