import { describe, expect, it } from "vitest";
import { needsAttention, senderDomain, senderHealth } from "./sender";

/**
 * Lo que se protege: que "se envía desde el dominio de pruebas" no vuelva a ser
 * indistinguible de "todo correcto". Es el fallo que no da error — la API
 * responde 200 y el correo se va a spam — y por eso necesita un test que lo
 * distinga explícitamente en vez de confiar en que alguien lo mire.
 */

describe("senderDomain", () => {
  it("saca el dominio del formato con nombre", () => {
    expect(senderDomain("Attesta <hola@attesta.io>")).toBe("attesta.io");
  });

  it("saca el dominio de una dirección pelada", () => {
    expect(senderDomain("hola@attesta.io")).toBe("attesta.io");
  });

  it("normaliza a minúsculas", () => {
    expect(senderDomain("Attesta <Hola@Attesta.IO>")).toBe("attesta.io");
  });

  it("aguanta el signo @ dentro del nombre", () => {
    expect(senderDomain("El equipo @attesta <hola@attesta.io>")).toBe("attesta.io");
  });

  it("rechaza lo que no es un dominio", () => {
    expect(senderDomain("hola")).toBeNull();
    expect(senderDomain("hola@localhost")).toBeNull();
    expect(senderDomain("hola@")).toBeNull();
  });
});

describe("senderHealth", () => {
  it("sin llave, el envío está apagado", () => {
    expect(senderHealth({}).level).toBe("off");
  });

  /** EL CASO QUE JUSTIFICA EL MÓDULO. */
  it("con llave pero sin remitente, avisa del dominio compartido", () => {
    const h = senderHealth({ RESEND_API_KEY: "re_x" });
    expect(h.level).toBe("shared-domain");
    expect(needsAttention(h)).toBe(true);
  });

  it("detecta el dominio de pruebas aunque se declare explícitamente", () => {
    const h = senderHealth({
      RESEND_API_KEY: "re_x",
      RESEND_FROM: "Attesta <onboarding@resend.dev>",
    });
    expect(h.level).toBe("shared-domain");
  });

  it("detecta también un subdominio del de pruebas", () => {
    const h = senderHealth({
      RESEND_API_KEY: "re_x",
      RESEND_FROM: "Attesta <hola@mail.resend.dev>",
    });
    expect(h.level).toBe("shared-domain");
  });

  it("con dominio propio, correcto", () => {
    const h = senderHealth({
      RESEND_API_KEY: "re_x",
      RESEND_FROM: "Attesta <hola@attesta.io>",
    });
    expect(h.level).toBe("ok");
    expect(h).toMatchObject({ domain: "attesta.io" });
    expect(needsAttention(h)).toBe(false);
  });

  it("un RESEND_FROM mal escrito no cuela como correcto", () => {
    const h = senderHealth({ RESEND_API_KEY: "re_x", RESEND_FROM: "Attesta" });
    expect(h.level).toBe("shared-domain");
  });

  /**
   * `off` NO debe avisar: en desarrollo es el estado normal, y un aviso que salta
   * siempre se aprende a ignorar — que es exactamente cómo se pierde el aviso que
   * sí importaba.
   */
  it("no avisa cuando el envío simplemente está apagado", () => {
    expect(needsAttention(senderHealth({}))).toBe(false);
  });
});
