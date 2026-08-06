import { describe, expect, it } from "vitest";
import { GRACE_DAYS, daysUntilPurge, type OrgDeletionState } from "./org-lifecycle";

/**
 * Lo que se protege: la cuenta atrás que ve alguien a punto de perder su
 * expediente. Un día de más es una promesa incumplida; un día de menos es un
 * susto. Y un número negativo, que es lo que sale de restar fechas sin pensar,
 * convierte "te quedan 2 días" en "te quedan -2 días" el día que el cron se
 * retrasa: justo cuando la pantalla tiene que seguir siendo útil.
 */

function state(requestedAt: string): OrgDeletionState {
  const purgeAt = new Date(
    new Date(requestedAt).getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  return { requestedAt, purgeAt, graceDays: GRACE_DAYS };
}

describe("daysUntilPurge", () => {
  it("recién solicitada, quedan los días completos de gracia", () => {
    const now = new Date("2026-08-04T10:00:00Z");
    expect(daysUntilPurge(state("2026-08-04T10:00:00Z"), now)).toBe(GRACE_DAYS);
  });

  it("a mitad del plazo, cuenta lo que falta", () => {
    const now = new Date("2026-08-07T10:00:00Z");
    expect(daysUntilPurge(state("2026-08-04T10:00:00Z"), now)).toBe(4);
  });

  it("redondea hacia ARRIBA: quedan horas, no cero días", () => {
    // Faltan 3 horas. Decir "0 días" haría creer que ya pasó el plazo.
    const now = new Date("2026-08-11T07:00:00Z");
    expect(daysUntilPurge(state("2026-08-04T10:00:00Z"), now)).toBe(1);
  });

  /** EL QUE IMPORTA: si el cron se retrasa, no puede salir un número negativo. */
  it("nunca es negativo aunque el plazo haya vencido", () => {
    const now = new Date("2026-09-01T10:00:00Z");
    expect(daysUntilPurge(state("2026-08-04T10:00:00Z"), now)).toBe(0);
  });

  it("justo en el instante del vencimiento son 0 días", () => {
    const now = new Date("2026-08-11T10:00:00Z");
    expect(daysUntilPurge(state("2026-08-04T10:00:00Z"), now)).toBe(0);
  });

  it("una fecha corrupta devuelve 0 en vez de NaN en pantalla", () => {
    const bad: OrgDeletionState = {
      requestedAt: "no es una fecha",
      purgeAt: "tampoco",
      graceDays: GRACE_DAYS,
    };
    expect(daysUntilPurge(bad, new Date("2026-08-04T10:00:00Z"))).toBe(0);
  });
});

describe("periodo de gracia", () => {
  /**
   * El plazo que promete el DPA es de 30 días MÁXIMO. Si alguien subiera la
   * gracia por encima de eso, la purga ocurriría fuera del plazo firmado y el
   * documento legal pasaría a ser falso sin que nada se quejara. Este test es el
   * único sitio donde esas dos cifras —una en SQL y en TypeScript, otra en un
   * texto legal— se miran a la cara.
   */
  it("cabe con holgura dentro de los 30 días que promete el DPA", () => {
    expect(GRACE_DAYS).toBeGreaterThan(0);
    expect(GRACE_DAYS).toBeLessThanOrEqual(14);
  });
});
