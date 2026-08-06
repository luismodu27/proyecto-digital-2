import { describe, expect, it } from "vitest";
import {
  bool,
  date,
  int,
  MAX_NAME,
  MAX_NOTE,
  MAX_URL,
  pick,
  pickStrict,
  text,
  url,
  uuid,
} from "./form";

const UUID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

describe("text", () => {
  /**
   * EL MOTIVO DEL MÓDULO. Antes ningún campo de texto tenía tope: un miembro
   * autenticado podía escribir megabytes en la nota de un proveedor. Postgres
   * los acepta, la factura sube y la pantalla que los pinta revienta.
   */
  it("trunca en vez de rechazar (no se castiga a quien pega de un documento)", () => {
    const largo = "a".repeat(50_000);
    expect(text(largo)?.length).toBe(MAX_NAME);
    expect(text(largo, MAX_NOTE)?.length).toBe(MAX_NOTE);
  });

  it("recorta espacios y convierte el vacío en null", () => {
    expect(text("  hola  ")).toBe("hola");
    expect(text("   ")).toBeNull();
    expect(text("")).toBeNull();
    expect(text(null)).toBeNull();
    expect(text(undefined)).toBeNull();
  });

  it("un File subido no se cuela como texto", () => {
    expect(text(new File(["x"], "x.txt") as unknown as FormDataEntryValue)).toBeNull();
  });
});

describe("uuid", () => {
  it("acepta un uuid y rechaza cualquier otra cosa", () => {
    expect(uuid(UUID)).toBe(UUID);
    expect(uuid(` ${UUID} `)).toBe(UUID);
    for (const bad of ["", "1", UUID.slice(0, -1), `${UUID}x`, "../etc", null]) {
      expect(uuid(bad)).toBeNull();
    }
  });
});

describe("date", () => {
  it("acepta una fecha ISO de calendario", () => {
    expect(date("2026-08-04")).toBe("2026-08-04");
    expect(date("2024-02-29")).toBe("2024-02-29"); // bisiesto real
  });

  /**
   * El caso que motiva la comprobación de calendario: `2026-02-31` pasa la
   * expresión regular y `new Date` NO falla — se desborda a marzo. Sin esto
   * llegaría a Postgres y reventaría a mitad de una escritura, en vez de
   * tratarse como lo que es: un campo mal rellenado.
   */
  it("rechaza fechas que encajan en el formato pero no existen", () => {
    for (const bad of ["2026-02-31", "2026-13-01", "2026-00-10", "2025-02-29"]) {
      expect(date(bad)).toBeNull();
    }
  });

  it("rechaza otros formatos", () => {
    for (const bad of ["04/08/2026", "2026-8-4", "2026-08-04T10:00:00Z", "", null]) {
      expect(date(bad)).toBeNull();
    }
  });
});

describe("bool", () => {
  it("entiende la casilla del navegador y el valor explícito", () => {
    expect(bool("on")).toBe(true);
    expect(bool("true")).toBe(true);
    expect(bool("false")).toBe(false);
    expect(bool("1")).toBe(false);
    expect(bool(null)).toBe(false);
  });
});

describe("pick / pickStrict", () => {
  const ROLES = ["owner", "admin", "member"] as const;

  it("pick cae al valor de reserva fuera del catálogo", () => {
    expect(pick("admin", ROLES, "member")).toBe("admin");
    expect(pick("root", ROLES, "member")).toBe("member");
    expect(pick(null, ROLES, "member")).toBe("member");
  });

  it("pickStrict devuelve null fuera del catálogo", () => {
    expect(pickStrict("admin", ROLES)).toBe("admin");
    expect(pickStrict("root", ROLES)).toBeNull();
  });

  /**
   * Guard contra el fallo silencioso: si `pick` dejara pasar lo desconocido, un
   * valor inventado llegaría al CHECK de Postgres y la escritura fallaría entera
   * — o peor, a una columna sin CHECK, y se quedaría ahí.
   */
  it("nunca devuelve algo que no esté en el catálogo", () => {
    for (const v of ["", "OWNER", "owner ", "admin;--", "root"]) {
      expect(ROLES).toContain(pick(v, ROLES, "member"));
      const strict = pickStrict(v, ROLES);
      expect(strict === null || (ROLES as readonly string[]).includes(strict)).toBe(true);
    }
  });
});

describe("url", () => {
  it("acepta http y https", () => {
    expect(url("https://ejemplo.es/doc.pdf")).toBe("https://ejemplo.es/doc.pdf");
    expect(url("http://ejemplo.es")).toBe("http://ejemplo.es");
  });

  /**
   * Estos valores acaban en un `href` de la interfaz y de los PDF. Un
   * `javascript:` ahí es un XSS almacenado firmado por la propia organización.
   */
  it("rechaza los esquemas que no se querría abrir", () => {
    for (const bad of [
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
    ]) {
      expect(url(bad)).toBeNull();
    }
  });

  it("rechaza lo que no es una URL absoluta y acota la longitud", () => {
    expect(url("ejemplo.es")).toBeNull();
    expect(url("")).toBeNull();
    expect(url(`https://ejemplo.es/${"a".repeat(MAX_URL * 2)}`)).toBeNull();
  });
});

describe("int", () => {
  it("acepta enteros dentro del rango", () => {
    expect(int("12", 0, 100)).toBe(12);
    expect(int("0", 0, 100)).toBe(0);
    expect(int("100", 0, 100)).toBe(100);
  });

  it("rechaza fuera de rango y lo que no es un entero", () => {
    for (const bad of ["101", "-1", "1.5", "1e3", "", "abc", null]) {
      expect(int(bad, 0, 100)).toBeNull();
    }
  });
});
