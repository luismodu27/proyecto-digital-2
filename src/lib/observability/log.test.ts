import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetLogThrottle,
  classifyDataError,
  logDataFallback,
  logIncident,
} from "./log";

/**
 * Lo que se protege aquí no es "que se loguee", es la CLASIFICACIÓN: si un
 * "Supabase caído" se etiquetara como "falta una migración", el aviso quedaría en
 * un `warn` y nadie lo mirararía. Y al contrario: si una migración pendiente se
 * marcara como incidente, el log se llenaría de falsos positivos y se dejaría de
 * leer, que es la forma habitual de morir de la observabilidad.
 */

let warn: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  __resetLogThrottle();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Última línea emitida, ya parseada. */
function lastLine(spy: typeof warn) {
  const call = spy.mock.calls.at(-1);
  return JSON.parse(String(call?.[0]));
}

describe("classifyDataError", () => {
  it("los códigos de esquema ausente son migración pendiente, no incidente", () => {
    for (const code of ["42P01", "42703", "42883", "PGRST202", "PGRST205"]) {
      expect(classifyDataError({ code }), code).toBe("migration-pending");
    }
  });

  it("42501 es un problema de permisos (RLS), que merece atención propia", () => {
    expect(classifyDataError({ code: "42501" })).toBe("permission");
  });

  it("cualquier otra cosa es un incidente", () => {
    expect(classifyDataError({ code: "08006", message: "connection failed" })).toBe(
      "incident",
    );
    expect(classifyDataError(new Error("fetch failed"))).toBe("incident");
    expect(classifyDataError(null)).toBe("incident");
  });

  it("cuando solo llega el mensaje, se reconoce el esquema ausente por texto", () => {
    // PostgREST a veces no trae `code`; sin esta red, una migración pendiente se
    // reportaría como caída de Supabase.
    expect(
      classifyDataError({ message: 'relation "product_events" does not exist' }),
    ).toBe("migration-pending");
    expect(
      classifyDataError({
        message: "Could not find the function public.product_funnel in the schema cache",
      }),
    ).toBe("migration-pending");
  });
});

describe("logDataFallback", () => {
  it("una migración pendiente es warn, no error", () => {
    const kind = logDataFallback("getProductFunnel", { code: "42P01" });
    expect(kind).toBe("migration-pending");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });

  it("un incidente sí es error", () => {
    logDataFallback("getAiSystems", { code: "08006", message: "caído" });
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("un fallo de RLS es error (o está mal configurada, o alguien la probó)", () => {
    logDataFallback("getAiSystems", { code: "42501" });
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("emite UNA línea JSON con el sitio, la clase y el código", () => {
    logDataFallback("getGapItems", { code: "42703", message: "no existe" }, "pista");
    const line = lastLine(warn);
    expect(line).toMatchObject({
      src: "attesta",
      at: "getGapItems",
      kind: "migration-pending",
      code: "42703",
      detail: "pista",
    });
  });

  it("no lanza aunque el error sea basura", () => {
    expect(() => logDataFallback("x", "texto suelto")).not.toThrow();
    expect(() => logDataFallback("x", undefined)).not.toThrow();
    expect(() => logDataFallback("x", 42)).not.toThrow();
  });

  it("distingue 'sin datos' de 'con error' cuando no hay error", () => {
    logDataFallback("getAiSystems", null);
    expect(lastLine(error).message).toMatch(/sin error/);
  });

  it("recorta mensajes enormes para no llenar el log", () => {
    logDataFallback("x", { code: "08006", message: "y".repeat(5000) });
    expect(lastLine(error).message.length).toBeLessThanOrEqual(300);
  });
});

describe("antirruido", () => {
  it("no repite la misma línea (mismo sitio y código) en la misma ventana", () => {
    for (let i = 0; i < 25; i++) logDataFallback("getGapItems", { code: "42703" });
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("pero sigue devolviendo la clasificación correcta cuando calla", () => {
    logDataFallback("getGapItems", { code: "42703" });
    expect(logDataFallback("getGapItems", { code: "42703" })).toBe(
      "migration-pending",
    );
  });

  it("un sitio distinto, o un código distinto, sí se emite", () => {
    logDataFallback("getGapItems", { code: "42703" });
    logDataFallback("getAiSystems", { code: "42703" });
    expect(warn).toHaveBeenCalledTimes(2);

    logDataFallback("getGapItems", { code: "08006" });
    expect(error).toHaveBeenCalledTimes(1);
  });
});

describe("logIncident", () => {
  it("siempre es error: si estamos en un catch, algo se rompió", () => {
    logIncident("createAiSystem", { code: "42703" });
    expect(error).toHaveBeenCalledTimes(1);
    expect(lastLine(error).kind).toBe("incident");
  });

  it("sabe leer un Error de JavaScript", () => {
    logIncident("startCheckout", new Error("Stripe no responde"));
    expect(lastLine(error).message).toBe("Stripe no responde");
  });

  it("no lanza con entradas raras", () => {
    expect(() => logIncident("x", null)).not.toThrow();
    expect(() => logIncident("x", { weird: true })).not.toThrow();
  });
});
