import { describe, expect, it } from "vitest";
import { hashKey, rateLimit } from "./rate-limit";

/**
 * Solo se prueba lo que es lógica pura. `checkRateLimit` necesita Supabase, y su
 * propiedad clave —que dos instancias concurrentes no puedan pasarse del límite—
 * no se puede probar aquí porque vive en el `insert … on conflict` de la RPC.
 * Eso se verificó donde se podía: 30 conexiones simultáneas contra un Postgres
 * real con un límite de 10 dieron exactamente 10 permitidas y 20 denegadas.
 */

describe("rateLimit (capa en memoria)", () => {
  it("permite hasta el límite y deniega a partir de ahí", () => {
    const k = `t-${Math.random()}`;
    expect([1, 2, 3].map(() => rateLimit(k, 3, 60_000))).toEqual([true, true, true]);
    expect(rateLimit(k, 3, 60_000)).toBe(false);
    expect(rateLimit(k, 3, 60_000)).toBe(false);
  });

  it("cada clave lleva su propia cuenta", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(rateLimit(a, 1, 60_000)).toBe(true);
    expect(rateLimit(a, 1, 60_000)).toBe(false);
    expect(rateLimit(b, 1, 60_000)).toBe(true);
  });

  it("la ventana es deslizante: al caducar vuelve a permitir", async () => {
    const k = `w-${Math.random()}`;
    expect(rateLimit(k, 1, 30)).toBe(true);
    expect(rateLimit(k, 1, 30)).toBe(false);
    await new Promise((r) => setTimeout(r, 45));
    expect(rateLimit(k, 1, 30)).toBe(true);
  });

  /**
   * Guard sobre un fallo que compilaría y se vería bien: si un rechazo también
   * contara como intento, un emisor bloqueado que siga insistiendo mantendría la
   * ventana llena para siempre y no saldría nunca del bloqueo, aunque parase.
   */
  it("un rechazo no alarga el castigo", async () => {
    const k = `p-${Math.random()}`;
    const W = 100;
    expect(rateLimit(k, 1, W)).toBe(true); // t≈0, consume la única plaza

    // El intento rechazado va A MITAD de la ventana, no pegado al primero: es lo
    // que hace discriminante la prueba. Si el rechazo se anotara como intento,
    // en t≈130 seguiría dentro de su propia ventana y el emisor continuaría
    // bloqueado pese a haber parado — el castigo se renovaría solo, para siempre,
    // mientras insistiera.
    await new Promise((r) => setTimeout(r, W * 0.6));
    expect(rateLimit(k, 1, W)).toBe(false); // t≈60, rechazado

    await new Promise((r) => setTimeout(r, W * 0.7));
    // t≈130: el intento bueno (t≈0) ya caducó; el rechazado (t≈60) no habría
    // caducado todavía.
    expect(rateLimit(k, 1, W)).toBe(true);
  });
});

describe("hashKey", () => {
  it("es estable: la misma clave da el mismo hash (si no, no se cuenta nada)", async () => {
    expect(await hashKey("intake:1.2.3.4")).toBe(await hashKey("intake:1.2.3.4"));
  });

  it("distingue claves distintas", async () => {
    expect(await hashKey("intake:1.2.3.4")).not.toBe(await hashKey("intake:1.2.3.5"));
    expect(await hashKey("intake:1.2.3.4")).not.toBe(await hashKey("waitlist:1.2.3.4"));
  });

  /**
   * EL MOTIVO DE QUE EXISTA. Lo que viaja a la base de datos no puede contener
   * la dirección IP: un limitador necesita distinguir emisores, no registrarlos.
   */
  it("no deja rastro de la clave original", async () => {
    const h = await hashKey("intake:203.0.113.42");
    expect(h).not.toContain("203");
    expect(h).not.toContain("intake");
    expect(h).toMatch(/^[0-9a-f]{32}$/);
  });

  it("cabe en el límite de 128 caracteres que valida la RPC", async () => {
    const h = await hashKey("x".repeat(10_000));
    expect(h.length).toBe(32);
  });
});
