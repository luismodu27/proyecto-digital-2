/**
 * Diccionario canónico (español). Define la FORMA (`type Dictionary = typeof es`).
 * `en.ts` debe satisfacer ese tipo: si falta una clave o cambia una firma, tsc falla.
 *
 * SOLO chrome de UI. Nada de contenido regulatorio determinista (ver config.ts).
 * Las cadenas con variables son funciones tipadas (interpolación sin dependencias).
 */

export const es = {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    close: "Cerrar",
    back: "Volver",
    next: "Siguiente",
    loading: "Cargando…",
    seeAll: "Ver todos",
    skipToContent: "Saltar al contenido",
  },

  locale: {
    switchToEn: "Ver en inglés",
    switchToEs: "Ver en español",
    label: "Idioma",
    es: "Español",
    en: "English",
  },

  nav: {
    product: "Producto",
    howItWorks: "Cómo funciona",
    pricing: "Precios",
    faq: "FAQ",
    login: "Entrar",
    requestAccess: "Solicitar acceso",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
};
