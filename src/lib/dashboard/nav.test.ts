import { describe, expect, it } from "vitest";
import {
  DRAWER_ID,
  DRAWER_TITLE_ID,
  NAV,
  countLocked,
  isActive,
  isLocked,
  planRank,
  visibleNav,
  type NavKey,
  type PlanTier,
} from "./nav";
import { getDictionary } from "@/lib/i18n";

/**
 * Reglas del catálogo de navegación.
 *
 * Existe porque estas reglas son COMERCIALES, no cosméticas: qué secciones
 * llevan candado en cada plan decide qué ve un cliente y qué le empuja a subir
 * de plan. Mientras vivieron dentro del `Sidebar` (`"use client"`) no se podían
 * probar —esta suite es de lógica pura, sin jsdom— y un reetiquetado de plan
 * habría borrado la palanca de upsell sin que nada fallara.
 */

const es = getDictionary("es");
const en = getDictionary("en");

describe("catálogo de navegación", () => {
  it("tiene las 14 entradas y ninguna repetida", () => {
    // Guarda anti-vacío: sin ella, un catálogo vacío pasaría todos los `every`
    // de este fichero y el test diría "todo bien" sin haber mirado nada.
    expect(NAV).toHaveLength(14);
    expect(new Set(NAV.map((i) => i.key)).size).toBe(NAV.length);
    expect(new Set(NAV.map((i) => i.href)).size).toBe(NAV.length);
  });

  it("todas las rutas cuelgan de /dashboard", () => {
    for (const item of NAV) {
      expect(item.href, item.key).toMatch(/^\/dashboard(\/|$)/);
    }
  });

  it("el único destino interno de Attesta es la telemetría", () => {
    expect(NAV.filter((i) => i.adminOnly).map((i) => i.key)).toEqual(["telemetry"]);
  });

  it("los ÚNICOS destinos Enterprise son organizaciones y seguridad", () => {
    // Esta es la aserción que protege el upsell. Si alguien reetiqueta un plan,
    // la insignia dorada desaparece de la navegación y hoy nada lo notaría.
    expect(
      NAV.filter((i) => i.requires === "enterprise").map((i) => i.key),
    ).toEqual(["organizations", "security"]);
  });

  it("cada entrada tiene un icono no vacío", () => {
    for (const item of NAV) {
      expect(item.icon.trim().length, item.key).toBeGreaterThan(0);
    }
  });

  it("los identificadores del cajón no coinciden entre sí", () => {
    expect(DRAWER_ID).not.toBe(DRAWER_TITLE_ID);
    expect(DRAWER_ID.trim()).not.toBe("");
  });
});

describe("visibilidad por rol", () => {
  it("un cliente no ve la telemetría interna", () => {
    expect(visibleNav(false).map((i) => i.key)).not.toContain("telemetry");
    expect(visibleNav(false)).toHaveLength(13);
  });

  it("el equipo de Attesta sí la ve", () => {
    expect(visibleNav(true).map((i) => i.key)).toContain("telemetry");
    expect(visibleNav(true)).toHaveLength(14);
  });
});

describe("bloqueo por plan", () => {
  it("en modo demo (sin plan) no hay nada bloqueado", () => {
    // Fija por test el comportamiento actual: sin backend, la demo enseña la
    // aplicación entera. Hasta ahora esto no estaba escrito en ninguna parte.
    expect(planRank(undefined)).toBe(planRank("enterprise"));
    expect(countLocked({ plan: undefined, isPlatformAdmin: false })).toBe(0);
  });

  const table: [PlanTier, number][] = [
    ["free", 10],
    ["preparacion", 2],
    ["enterprise", 0],
  ];

  for (const [plan, expected] of table) {
    it(`plan ${plan}: ${expected} secciones bloqueadas`, () => {
      expect(countLocked({ plan, isPlatformAdmin: false })).toBe(expected);
    });
  }

  it("con el plan Preparación solo quedan bloqueadas las dos Enterprise", () => {
    const locked = visibleNav(false)
      .filter((i) => isLocked(i, "preparacion"))
      .map((i) => i.key);
    expect(locked).toEqual(["organizations", "security"]);
  });

  it("un destino sin requisito no se bloquea nunca", () => {
    const overview = NAV.find((i) => i.key === "overview")!;
    for (const plan of ["free", "preparacion", "enterprise"] as PlanTier[]) {
      expect(isLocked(overview, plan), plan).toBe(false);
    }
  });

  it("el propio plan requerido desbloquea (el umbral es >=, no >)", () => {
    const gap = NAV.find((i) => i.key === "gap")!;
    expect(isLocked(gap, "free")).toBe(true);
    expect(isLocked(gap, "preparacion")).toBe(false);
  });
});

describe("marcado del destino activo", () => {
  it("el resumen solo se marca en su ruta exacta", () => {
    // `/dashboard` es prefijo de TODAS las demás: con `startsWith` se quedaría
    // permanentemente activo y el usuario no sabría nunca dónde está.
    expect(isActive("/dashboard", "/dashboard")).toBe(true);
    expect(isActive("/dashboard", "/dashboard/riesgo")).toBe(false);
  });

  it("las demás se marcan también en sus subrutas", () => {
    expect(isActive("/dashboard/inventario", "/dashboard/inventario")).toBe(true);
    expect(
      isActive("/dashboard/inventario", "/dashboard/inventario/SYS-1/dossier"),
    ).toBe(true);
    expect(isActive("/dashboard/inventario", "/dashboard/riesgo")).toBe(false);
  });
});

describe("paridad ES/EN de la navegación", () => {
  it("cada destino tiene nombre en las dos lenguas", () => {
    for (const item of NAV) {
      const key = item.key as NavKey;
      expect(es.dashboard.nav[key].trim(), `es ${key}`).not.toBe("");
      expect(en.dashboard.nav[key].trim(), `en ${key}`).not.toBe("");
    }
  });

  it("el copy del cajón existe y está traducido en las dos lenguas", () => {
    // Mismo motivo que en `paywall.test.ts`: `tsc` caza la clave AUSENTE en
    // `en.ts`, pero pegar ahí el español compila tan feliz.
    const keys = [
      "title",
      "openMenu",
      "closeMenu",
      "planLabel",
      "lockedCountOne",
      "lockedCountMany",
      "seePlans",
    ] as const;
    for (const key of keys) {
      expect(es.dashboard.navDrawer[key].trim(), `es ${key}`).not.toBe("");
      expect(en.dashboard.navDrawer[key].trim(), `en ${key}`).not.toBe("");
      expect(en.dashboard.navDrawer[key], key).not.toBe(
        es.dashboard.navDrawer[key],
      );
    }
  });

  it("el contador de secciones bloqueadas conserva el marcador {n}", () => {
    for (const dict of [es, en]) {
      expect(dict.dashboard.navDrawer.lockedCountMany).toContain("{n}");
    }
    // La forma del singular NO lleva marcador: el "1" va escrito, para que la
    // frase suene natural en ambas lenguas.
    expect(es.dashboard.navDrawer.lockedCountOne).not.toContain("{n}");
  });

  it("los nombres de plan de la insignia salen de billing.tier", () => {
    // Se reutilizan a propósito en vez de crear claves nuevas: así no hace falta
    // ninguna lista blanca de "es igual en las dos lenguas" ("Enterprise" es un
    // nombre comercial y coincide legítimamente).
    for (const dict of [es, en]) {
      for (const tier of ["free", "preparacion", "enterprise"] as PlanTier[]) {
        expect(dict.dashboard.billing.tier[tier].trim(), tier).not.toBe("");
      }
    }
  });
});
