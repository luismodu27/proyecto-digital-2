import { describe, expect, it } from "vitest";
import {
  BIAS_STATUS_LABEL,
  BIAS_STATUS_LABEL_BY_LOCALE,
  BIAS_STATUS_TONE,
  biasAuditStatus,
  biasStatusLabel,
  nextBiasAuditDue,
  publicationComplete,
  type BiasAudit,
} from "./bias-audit";

/**
 * NYC Local Law 144 exige TRES cosas a quien usa una AEDT: auditoría de sesgo
 * independiente **anual**, **publicación** del resumen y **aviso** a los
 * candidatos. El semáforo no puede colapsarlas: una auditoría hecha y no
 * publicada sigue siendo un incumplimiento, y decirle al cliente que está al día
 * sería justo el error que este producto existe para evitar.
 */

const HOY = new Date("2026-07-30T00:00:00Z");

function audit(over: Partial<BiasAudit> = {}): BiasAudit {
  return {
    isAedt: true,
    lastAuditDate: null,
    auditorName: null,
    auditorIndependenceConfirmed: false,
    summaryUrl: null,
    summaryPublishedDate: null,
    ...over,
  };
}

describe("nextBiasAuditDue — cadencia anual", () => {
  it("suma exactamente 12 meses a la última auditoría", () => {
    expect(nextBiasAuditDue("2026-03-15")).toBe("2027-03-15");
  });

  it("sin auditoría previa no hay vencimiento que calcular", () => {
    expect(nextBiasAuditDue(null)).toBeNull();
    expect(nextBiasAuditDue("no-es-una-fecha")).toBeNull();
  });
});

describe("biasAuditStatus", () => {
  it("si no es AEDT, la ley no aplica", () => {
    expect(biasAuditStatus(audit({ isAedt: false }), HOY)).toBe("no_aplica");
  });

  it("AEDT sin auditoría registrada es un hueco, no un 'vigente'", () => {
    expect(biasAuditStatus(audit({ lastAuditDate: null }), HOY)).toBe(
      "sin_auditoria",
    );
  });

  it("una auditoría de hace 2 meses está vigente", () => {
    expect(biasAuditStatus(audit({ lastAuditDate: "2026-05-30" }), HOY)).toBe(
      "vigente",
    );
  });

  it("una auditoría de hace más de 12 meses está vencida", () => {
    expect(biasAuditStatus(audit({ lastAuditDate: "2025-01-10" }), HOY)).toBe(
      "vencida",
    );
  });

  it("justo 12 meses menos un día sigue sin estar vencida", () => {
    // Última auditoría: 31-jul-2025 → vence 31-jul-2026 → hoy (30-jul) aún no.
    expect(biasAuditStatus(audit({ lastAuditDate: "2025-07-31" }), HOY)).not.toBe(
      "vencida",
    );
  });

  it("un vencimiento cercano avisa antes de que caduque", () => {
    // Vence el 5-ago-2026: dentro de la ventana de aviso.
    expect(biasAuditStatus(audit({ lastAuditDate: "2025-08-05" }), HOY)).toBe(
      "por_vencer",
    );
  });
});

describe("publicationComplete — la publicación es un requisito aparte", () => {
  it("hace falta URL Y fecha de publicación", () => {
    expect(
      publicationComplete(
        audit({ summaryUrl: "https://ejemplo.test/resumen", summaryPublishedDate: null }),
      ),
    ).toBe(false);
    expect(
      publicationComplete(
        audit({ summaryUrl: null, summaryPublishedDate: "2026-04-01" }),
      ),
    ).toBe(false);
    expect(
      publicationComplete(
        audit({
          summaryUrl: "https://ejemplo.test/resumen",
          summaryPublishedDate: "2026-04-01",
        }),
      ),
    ).toBe(true);
  });

  it("una auditoría vigente NO implica publicación hecha", () => {
    const a = audit({ lastAuditDate: "2026-05-30" });
    expect(biasAuditStatus(a, HOY)).toBe("vigente");
    expect(publicationComplete(a)).toBe(false);
  });
});

describe("etiquetas y tonos", () => {
  it("cada estado tiene etiqueta en ES y EN, y tono", () => {
    for (const status of Object.keys(BIAS_STATUS_LABEL) as (keyof typeof BIAS_STATUS_LABEL)[]) {
      expect(biasStatusLabel(status, "es").trim().length).toBeGreaterThan(0);
      expect(biasStatusLabel(status, "en").trim().length).toBeGreaterThan(0);
      expect(BIAS_STATUS_TONE[status]).toBeDefined();
    }
  });

  it("los dos idiomas cubren exactamente los mismos estados", () => {
    expect(Object.keys(BIAS_STATUS_LABEL_BY_LOCALE.en).sort()).toEqual(
      Object.keys(BIAS_STATUS_LABEL_BY_LOCALE.es).sort(),
    );
  });

  it("los estados problemáticos no se pintan como buenos", () => {
    expect(BIAS_STATUS_TONE.vencida).toBe("danger");
    expect(BIAS_STATUS_TONE.sin_auditoria).toBe("danger");
    expect(BIAS_STATUS_TONE.vigente).toBe("good");
  });
});
