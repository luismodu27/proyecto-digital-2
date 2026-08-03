/**
 * Catálogo de navegación del dashboard y las reglas de bloqueo por plan.
 *
 * Vive aquí, fuera del componente, por dos motivos. Uno: el `Sidebar` es
 * `"use client"` y la suite de tests de este repo es de LÓGICA PURA (entorno
 * node, sin jsdom), así que dentro del componente la regla comercial —qué
 * secciones llevan candado en cada plan— no se podía probar. Dos: la misma
 * lista la consumen ahora dos superficies (el rail de escritorio y el cajón
 * móvil) y duplicarla es garantía de que se desincronicen.
 *
 * Nada de `"use client"`, `next/*` ni React aquí: en cuanto entre uno, el
 * módulo deja de poder importarse desde la suite.
 */
import type { Dictionary } from "@/lib/i18n";

export type PlanTier = "free" | "preparacion" | "enterprise";
export const RANK: Record<PlanTier, number> = { free: 0, preparacion: 1, enterprise: 2 };

/** Unión EXPLÍCITA (no `keyof …nav`, que está contaminado con lockedTitle/…). */
export type NavKey =
  | "overview" | "inventory" | "risk" | "gap" | "plan" | "incidents" | "suppliers" | "packs"
  | "monitoring" | "team" | "activity" | "organizations" | "security" | "telemetry";

/**
 * Guard REAL de compilación. `Pick<T, K>` exige `K extends keyof T`, así que si
 * una clave desaparece del diccionario, tsc falla con TS2344 aquí mismo.
 * OJO: `type X = NavKey extends keyof … ? true : never` NO sirve — comprobado:
 * el alias resuelve a `never` y compila tan feliz.
 */
export type NavDictSlice = Pick<Dictionary["dashboard"]["nav"], NavKey>;

/** Un solo literal para `id={}` y `aria-controls={}`: desincronizarlos rompe el
 *  cajón sin que tsc ni el build digan nada. */
export const DRAWER_ID = "dashboard-nav-drawer";
export const DRAWER_TITLE_ID = "dashboard-nav-drawer-title";

export const LOCK_PATH =
  "M6 10V8a6 6 0 1112 0v2m-9 0h6a3 3 0 013 3v5a3 3 0 01-3 3H9a3 3 0 01-3-3v-5a3 3 0 013-3Z";

export type NavItem = {
  key: NavKey;
  href: string;
  icon: string;
  requires?: PlanTier;
  /** Solo para el equipo de Attesta (platform_admins), no para clientes. */
  adminOnly?: boolean;
};

/** Las 14 entradas, en un único orden para las dos superficies (rail y cajón).
 *  No se reordena entre ellas: la coherencia de navegación es WCAG 3.2.3. */
export const NAV: readonly NavItem[] = [
  { key: "overview",  href: "/dashboard",                icon: "M3 12h7V3H3v9Zm0 9h7v-7H3v7Zm11 0h7V12h-7v9Zm0-18v7h7V3h-7Z" },
  { key: "inventory", href: "/dashboard/inventario",     icon: "M4 7h16M4 12h16M4 17h16" },
  { key: "risk",      href: "/dashboard/riesgo",         icon: "M12 3 2 20h20L12 3Zm0 6v5m0 3h.01" },
  { key: "gap",       href: "/dashboard/gap",            icon: "M9 11l3 3 8-8M4 12a8 8 0 108-8", requires: "preparacion" },
  { key: "plan",      href: "/dashboard/plan",           icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9 2 2 4-4", requires: "preparacion" },
  { key: "incidents", href: "/dashboard/incidentes",     icon: "M5 21V4m0 0h12l-2.2 4L17 12H5", requires: "preparacion" },
  { key: "suppliers", href: "/dashboard/proveedores",     icon: "M21 8v8a2 2 0 01-1 1.7l-7 4a2 2 0 01-2 0l-7-4A2 2 0 013 16V8a2 2 0 011-1.7l7-4a2 2 0 012 0l7 4A2 2 0 0121 8Zm-9 4 8.7-5M12 12 3.3 7M12 12v9", requires: "preparacion" },
  { key: "packs",     href: "/dashboard/packs",          icon: "M4 7a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7Zm10-2v4h4M8 13h6M8 16h4", requires: "preparacion" },
  { key: "monitoring",href: "/dashboard/vigilancia",     icon: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", requires: "preparacion" },
  { key: "team",      href: "/dashboard/equipo",         icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", requires: "preparacion" },
  { key: "activity",  href: "/dashboard/actividad",      icon: "M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0Z", requires: "preparacion" },
  { key: "organizations", href: "/dashboard/organizaciones", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01", requires: "enterprise" },
  { key: "security",  href: "/dashboard/seguridad",      icon: "M12 3 4 6v5c0 4.5 3.4 8.3 8 9.9 4.6-1.6 8-5.4 8-9.9V6l-8-3Z", requires: "enterprise" },
  // Métricas internas de Attesta (embudo de activación). No es una función del
  // producto: solo la ve el equipo, y nunca en modo demo.
  { key: "telemetry", href: "/dashboard/telemetria",     icon: "M4 20V11m5 9V4m5 16v-6m5 6V8", adminOnly: true },
];

export function visibleNav(isPlatformAdmin: boolean): NavItem[] {
  return NAV.filter((i) => !i.adminOnly || isPlatformAdmin);
}

/** `plan` indefinido = modo demo → nada bloqueado. Fija por test el
 *  comportamiento actual (Sidebar.tsx:60), que hoy no está escrito en ningún sitio. */
export function planRank(plan?: PlanTier): number {
  return plan ? RANK[plan] : RANK.enterprise;
}

export function isLocked(item: NavItem, plan?: PlanTier): boolean {
  if (!item.requires) return false;
  return planRank(plan) < RANK[item.requires];
}

export function isActive(href: string, pathname: string): boolean {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

export function countLocked(o: { plan?: PlanTier; isPlatformAdmin: boolean }): number {
  return visibleNav(o.isPlatformAdmin).filter((i) => isLocked(i, o.plan)).length;
}


