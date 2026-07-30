import { describe, expect, it } from "vitest";
import {
  NEAR_LIMIT_RATIO,
  PLAN_LIMITS,
  allowedToAdd,
  fitsWithin,
  quotaState,
  resolveMax,
} from "./limits";

/**
 * Tests del metering.
 *
 * Codifican las REGLAS DE NEGOCIO, no la implementación: un `<` por `<=` aquí
 * bloquea a un cliente que paga o regala un sistema gratis, y ni `tsc` ni el build
 * dirían nada. Cada bloque nombra la regla que protege.
 */

describe("cupos por plan", () => {
  it("el plan gratuito es una muestra, no una herramienta de gobernanza", () => {
    expect(PLAN_LIMITS.free.systems).toBe(3);
    expect(PLAN_LIMITS.free.seats).toBe(1);
  });

  it("Preparación cubre un inventario de mid-market", () => {
    expect(PLAN_LIMITS.preparacion.systems).toBe(25);
    expect(PLAN_LIMITS.preparacion.seats).toBe(5);
  });

  it("Enterprise no tiene tope por defecto (los pactados van por organización)", () => {
    expect(PLAN_LIMITS.enterprise.systems).toBeNull();
    expect(PLAN_LIMITS.enterprise.seats).toBeNull();
  });

  it("cada plan declara TODOS los cupos: un cupo nuevo sin número es un bug", () => {
    for (const plan of ["free", "preparacion", "enterprise"] as const) {
      for (const kind of ["systems", "seats"] as const) {
        expect(PLAN_LIMITS[plan], `${plan}.${kind}`).toHaveProperty(kind);
      }
    }
  });

  it("los planes son monótonos: pagar nunca da MENOS cupo", () => {
    for (const kind of ["systems", "seats"] as const) {
      const free = PLAN_LIMITS.free[kind];
      const prep = PLAN_LIMITS.preparacion[kind];
      expect(free, `${kind} free debe tener tope`).not.toBeNull();
      expect(prep, `${kind} preparación debe tener tope`).not.toBeNull();
      expect(prep!).toBeGreaterThan(free!);
      // enterprise = null = sin tope, que es más que cualquier número.
      expect(PLAN_LIMITS.enterprise[kind]).toBeNull();
    }
  });
});

describe("resolveMax — el pacto por organización gana", () => {
  it("sin override usa el cupo del plan", () => {
    expect(resolveMax("free", "systems")).toBe(3);
    expect(resolveMax("preparacion", "systems", null)).toBe(25);
    expect(resolveMax("enterprise", "seats", null)).toBeNull();
  });

  it("el override gana aunque sea MENOR que el del plan (Enterprise 'hasta 200')", () => {
    // Es el caso de negocio: un Enterprise vendido con tope pactado. Si el
    // override no pudiera bajar del plan, no se podría vender "hasta N".
    expect(resolveMax("enterprise", "systems", 200)).toBe(200);
    expect(resolveMax("preparacion", "systems", 10)).toBe(10);
  });

  it("el override sube el cupo de un plan de pago (cortesía / trato a medida)", () => {
    expect(resolveMax("preparacion", "systems", 60)).toBe(60);
  });

  it("un override inválido se IGNORA: nadie queda sin poder crear nada", () => {
    // Un 0 o un negativo en el SQL Editor no debe dejar una cuenta inservible.
    for (const bad of [0, -1, -999, NaN, Infinity, -Infinity]) {
      expect(resolveMax("preparacion", "systems", bad), String(bad)).toBe(25);
    }
  });

  it("un override decimal se trunca hacia abajo (no se regala cupo)", () => {
    expect(resolveMax("free", "systems", 7.9)).toBe(7);
  });
});

describe("quotaState — aritmética del cupo", () => {
  it("cuenta lo que queda y no se pasa de rosca", () => {
    const s = quotaState("systems", 10, 25);
    expect(s.used).toBe(10);
    expect(s.remaining).toBe(15);
    expect(s.atLimit).toBe(false);
    expect(s.unlimited).toBe(false);
  });

  it("sin tope: nunca hay límite ni aviso", () => {
    const s = quotaState("systems", 5000, null);
    expect(s.unlimited).toBe(true);
    expect(s.atLimit).toBe(false);
    expect(s.nearLimit).toBe(false);
    expect(s.remaining).toBeNull();
    expect(s.ratio).toBeNull();
  });

  it("justo en el tope: atLimit, y nearLimit NO (ya no es un aviso, es un muro)", () => {
    const s = quotaState("systems", 25, 25);
    expect(s.atLimit).toBe(true);
    expect(s.nearLimit).toBe(false);
    expect(s.remaining).toBe(0);
  });

  it("un elemento por debajo del tope todavía deja crear", () => {
    const s = quotaState("systems", 24, 25);
    expect(s.atLimit).toBe(false);
    expect(s.remaining).toBe(1);
  });

  it("POR ENCIMA del tope (bajada de plan) es un estado legítimo, no un error", () => {
    // Nada de lo ya creado se toca; solo no se puede añadir más.
    const s = quotaState("systems", 40, 25);
    expect(s.used).toBe(40);
    expect(s.remaining).toBe(0);
    expect(s.atLimit).toBe(true);
    expect(s.ratio).toBe(1); // acotado: no queremos un 160 % en la barra de la UI
  });

  it("avisa al 80 % y no antes", () => {
    // 20/25 = 0.8 exacto → avisa (el umbral es inclusivo).
    expect(quotaState("systems", 20, 25).nearLimit).toBe(true);
    // 19/25 = 0.76 → todavía no molestamos.
    expect(quotaState("systems", 19, 25).nearLimit).toBe(false);
    expect(NEAR_LIMIT_RATIO).toBe(0.8);
  });

  it("un consumo absurdo se normaliza a 0 en vez de propagar NaN a la UI", () => {
    for (const bad of [-5, NaN, Infinity]) {
      const s = quotaState("seats", bad as number, 5);
      expect(s.used, String(bad)).toBe(0);
      expect(s.remaining).toBe(5);
    }
  });
});

describe("fitsWithin", () => {
  it("deja crear mientras quepa", () => {
    const s = quotaState("systems", 24, 25);
    expect(fitsWithin(s)).toBe(true);
    expect(fitsWithin(s, 1)).toBe(true);
    expect(fitsWithin(s, 2)).toBe(false);
  });

  it("en el tope no deja crear ni uno", () => {
    expect(fitsWithin(quotaState("systems", 25, 25))).toBe(false);
  });

  it("sin tope siempre cabe", () => {
    expect(fitsWithin(quotaState("systems", 99999, null), 500)).toBe(true);
  });
});

describe("allowedToAdd — importación parcial de CSV", () => {
  it("de 40 filas con 20 huecos, entran 20 (no se rechaza el fichero entero)", () => {
    const s = quotaState("systems", 5, 25);
    expect(allowedToAdd(s, 40)).toBe(20);
  });

  it("si caben todas, entran todas", () => {
    expect(allowedToAdd(quotaState("systems", 0, 25), 10)).toBe(10);
  });

  it("en el tope no entra ninguna", () => {
    expect(allowedToAdd(quotaState("systems", 25, 25), 10)).toBe(0);
  });

  it("por encima del tope tampoco entra ninguna (nunca un número negativo)", () => {
    expect(allowedToAdd(quotaState("systems", 40, 25), 10)).toBe(0);
  });

  it("sin tope entran todas", () => {
    expect(allowedToAdd(quotaState("systems", 10, null), 200)).toBe(200);
  });

  it("pedir 0 o menos no crea nada", () => {
    const s = quotaState("systems", 0, 25);
    expect(allowedToAdd(s, 0)).toBe(0);
    expect(allowedToAdd(s, -3)).toBe(0);
  });
});
