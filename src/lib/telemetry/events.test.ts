import { describe, expect, it } from "vitest";
import {
  ACTIVATION_FUNNEL,
  CLIENT_EVENTS,
  PRODUCT_EVENTS,
  isClientEvent,
  isProductEvent,
  normalizePath,
  sanitizeProps,
} from "./events";

/**
 * La telemetría toca dos cosas delicadas: la PRIVACIDAD de quien navega y la
 * integridad del embudo con el que se toman decisiones de negocio. Ambas se
 * defienden con funciones puras (whitelist + saneado), así que aquí es donde se
 * comprueban de verdad — la API responde siempre 204 a propósito y no sirve
 * como oráculo desde fuera.
 */

describe("catálogo de eventos", () => {
  it("los nombres son únicos y en snake_case corto", () => {
    expect(new Set(PRODUCT_EVENTS).size).toBe(PRODUCT_EVENTS.length);
    for (const e of PRODUCT_EVENTS) {
      expect(e, e).toMatch(/^[a-z][a-z0-9_]*$/);
      // El CHECK de la columna `event` acota a 64 caracteres.
      expect(e.length, e).toBeLessThanOrEqual(64);
    }
  });

  it("reconoce los eventos del catálogo y rechaza lo demás", () => {
    expect(isProductEvent("page_view")).toBe(true);
    expect(isProductEvent("me_lo_invento")).toBe(false);
    expect(isProductEvent(42)).toBe(false);
    expect(isProductEvent(null)).toBe(false);
    expect(isProductEvent(undefined)).toBe(false);
  });

  it("los eventos de cliente son un subconjunto del catálogo", () => {
    for (const e of CLIENT_EVENTS) expect(PRODUCT_EVENTS).toContain(e);
  });

  it("el navegador NO puede emitir hechos de negocio", () => {
    // Si esto se relajara, cualquiera podría inflar el embudo de ingresos desde
    // la consola y las métricas de conversión dejarían de valer nada.
    for (const e of [
      "checkout_completed",
      "checkout_started",
      "subscription_payment_failed",
      "org_created",
      "system_created",
      "risk_assessed",
      "pack_applied",
      "paywall_viewed",
      "waitlist_submit",
      "export_downloaded",
      "invite_sent",
    ] as const) {
      expect(isClientEvent(e), e).toBe(false);
      expect(isProductEvent(e), e).toBe(true);
    }
  });

  it("el embudo solo usa eventos del catálogo y sin repeticiones", () => {
    for (const e of ACTIVATION_FUNNEL) expect(PRODUCT_EVENTS).toContain(e);
    expect(new Set(ACTIVATION_FUNNEL).size).toBe(ACTIVATION_FUNNEL.length);
  });

  it("el embudo va de la visita al pago, en ese orden", () => {
    const i = (e: string) => ACTIVATION_FUNNEL.indexOf(e as never);
    expect(i("page_view")).toBe(0);
    expect(i("signup_submitted")).toBeGreaterThan(i("page_view"));
    expect(i("system_created")).toBeGreaterThan(i("org_created"));
    expect(i("checkout_completed")).toBe(ACTIVATION_FUNNEL.length - 1);
  });
});

describe("normalizePath — agrupa páginas, no las multiplica", () => {
  it("colapsa los uuid de las rutas dinámicas", () => {
    expect(
      normalizePath(
        "/dashboard/inventario/3f2504e0-4f89-41d3-9a0c-0305e82c3301/dossier",
      ),
    ).toBe("/dashboard/inventario/:id/dossier");
  });

  it("colapsa también un uuid final", () => {
    expect(
      normalizePath("/dashboard/inventario/3f2504e0-4f89-41d3-9a0c-0305e82c3301"),
    ).toBe("/dashboard/inventario/:id");
  });

  it("descarta la query: puede llevar tokens y no aporta al embudo", () => {
    expect(normalizePath("/auth/callback?code=secreto-de-verdad")).toBe(
      "/auth/callback",
    );
    expect(normalizePath("/dashboard/gap?toast=pack-applied#brechas")).toBe(
      "/dashboard/gap",
    );
  });

  it("colapsa ids numéricos largos pero no los tramos de una sola cifra", () => {
    expect(normalizePath("/informe/12345")).toBe("/informe/:id");
    expect(normalizePath("/paso/2")).toBe("/paso/2");
  });

  it("acota la longitud a lo que admite la columna", () => {
    expect(normalizePath(`/${"a".repeat(400)}`).length).toBeLessThanOrEqual(255);
  });

  it("no rompe con la raíz ni con una cadena vacía", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("")).toBe("/");
  });
});

describe("sanitizeProps — sin PII y acotado", () => {
  it("deja pasar string, número y booleano", () => {
    expect(sanitizeProps({ id: "hero_signup", n: 3, ok: true })).toEqual({
      id: "hero_signup",
      n: 3,
      ok: true,
    });
  });

  it("DESCARTA cualquier valor con arroba (la fuga de PII más probable)", () => {
    expect(sanitizeProps({ email: "persona@empresa.com" })).toEqual({});
    expect(sanitizeProps({ nota: "escríbeme a x@y.z" })).toEqual({});
  });

  it("descarta valores anidados y no primitivos", () => {
    expect(
      sanitizeProps({ obj: { a: 1 }, arr: [1, 2], nulo: null, fn: () => {} }),
    ).toEqual({});
  });

  it("descarta números no finitos", () => {
    expect(sanitizeProps({ a: NaN, b: Infinity })).toEqual({});
  });

  it("rechaza claves que no sean [a-z0-9_]", () => {
    expect(sanitizeProps({ "Con-Mayúsculas": "x", "espacio malo": "y" })).toEqual({});
  });

  it("recorta valores largos y limita el número de claves", () => {
    const out = sanitizeProps({ largo: "x".repeat(500) });
    expect((out.largo as string).length).toBe(64);

    const muchas: Record<string, string> = {};
    for (let i = 0; i < 40; i++) muchas[`k${i}`] = "v";
    expect(Object.keys(sanitizeProps(muchas)).length).toBeLessThanOrEqual(8);
  });

  it("ignora cadenas vacías o solo espacios", () => {
    expect(sanitizeProps({ a: "", b: "   " })).toEqual({});
  });

  it("una entrada que no es objeto devuelve un saco vacío, nunca lanza", () => {
    for (const input of [null, undefined, 42, "texto", [1, 2], true]) {
      expect(sanitizeProps(input)).toEqual({});
    }
  });
});
