import { describe, expect, it } from "vitest";
import type { AiSystem, GapItem } from "@/lib/mock-data";
import {
  buildActionPlan,
  criticalPoints,
  priorityLabel,
  recommendationsForLevel,
} from "./recommendations";

/**
 * El plan de acción es lo que el cliente hace de verdad con Attesta. Dos riesgos
 * distintos a cubrir:
 *   · que una brecha se PIERDA en la deduplicación (el cliente creería que no
 *     tiene nada pendiente en ese artículo), y
 *   · que la prioridad no refleje la severidad (trabajar en el orden equivocado).
 */

function system(over: Partial<AiSystem> = {}): AiSystem {
  return {
    id: "SYS-001",
    name: "Cribado de CV",
    owner: "RRHH",
    domain: "Contratación",
    vendor: "HireFlow",
    risk: "high",
    compliance: 80,
    lastReviewed: "2026-06-01",
    ...over,
  };
}

function gap(over: Partial<GapItem> = {}): GapItem {
  return {
    id: "g1",
    requirement: "Supervisión humana efectiva",
    article: "Art. 26",
    status: "missing",
    severity: "alta",
    system: "SYS-001",
    ...over,
  };
}

describe("recommendationsForLevel", () => {
  it("los niveles con obligaciones devuelven recomendaciones completas", () => {
    for (const level of ["unacceptable", "high", "limited"] as const) {
      const recs = recommendationsForLevel(level);
      expect(recs.length, level).toBeGreaterThan(0);
      for (const r of recs) {
        expect(r.title.trim().length, `${level}/${r.id}`).toBeGreaterThan(0);
        expect(r.action.trim().length, `${level}/${r.id}`).toBeGreaterThan(0);
        expect(r.article.trim().length, `${level}/${r.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("riesgo mínimo no genera obligaciones: es lo correcto, no un hueco", () => {
    // El AI Act no impone deberes al riesgo mínimo. Inventar recomendaciones aquí
    // sería alarmismo, justo lo contrario de lo que vende el producto.
    expect(recommendationsForLevel("minimal")).toEqual([]);
    expect(recommendationsForLevel("minimal", "en")).toEqual([]);
  });

  it("el alto riesgo empieza por los deberes PROPIOS del deployer (Art. 26)", () => {
    // Orden intencional: los Arts. 9-15 son del proveedor y se reencuadran como
    // "exige/conserva evidencia"; lo primero que ve el cliente es lo suyo.
    const recs = recommendationsForLevel("high");
    expect(recs.some((r) => r.article.startsWith("Art. 26"))).toBe(true);
  });

  it("vienen ordenadas por prioridad (críticas primero)", () => {
    const orden = { crítica: 0, alta: 1, media: 2 } as const;
    const recs = recommendationsForLevel("high");
    const pesos = recs.map((r) => orden[r.priority]);
    expect(pesos).toEqual([...pesos].sort((a, b) => a - b));
  });

  it("ES y EN dan las MISMAS recomendaciones con textos distintos", () => {
    const es = recommendationsForLevel("high", "es");
    const en = recommendationsForLevel("high", "en");
    expect(en.map((r) => r.id)).toEqual(es.map((r) => r.id));
    expect(en.map((r) => r.priority)).toEqual(es.map((r) => r.priority));
    expect(en[0]!.action).not.toBe(es[0]!.action);
  });

  it("`criticalPoints` filtra solo las críticas", () => {
    const recs = recommendationsForLevel("high");
    expect(criticalPoints(recs).every((r) => r.priority === "crítica")).toBe(true);
  });
});

describe("buildActionPlan — prioridad según severidad y estado", () => {
  it("una brecha ausente de severidad alta es crítica", () => {
    const plan = buildActionPlan([system()], [gap({ severity: "alta" })]);
    expect(plan[0]!.priority).toBe("crítica");
  });

  it("una brecha PARCIAL pesa menos que la misma brecha ausente", () => {
    const orden = { crítica: 0, alta: 1, media: 2 } as const;
    const ausente = buildActionPlan([system()], [gap({ status: "missing" })])[0]!;
    const parcial = buildActionPlan([system()], [gap({ status: "partial" })])[0]!;
    expect(orden[parcial.priority]).toBeGreaterThan(orden[ausente.priority]);
  });

  it("las brechas hechas no generan trabajo", () => {
    const plan = buildActionPlan([system()], [gap({ status: "done" })]);
    expect(plan).toHaveLength(0);
  });

  it("un sistema de alto riesgo con baja preparación añade un punto crítico transversal", () => {
    const plan = buildActionPlan([system({ compliance: 20 })], []);
    expect(plan.map((r) => r.id)).toContain("priorizar-alto-riesgo");
    expect(plan[0]!.priority).toBe("crítica");
  });

  it("con buena preparación no se añade ese punto", () => {
    const plan = buildActionPlan([system({ compliance: 90 })], []);
    expect(plan.map((r) => r.id)).not.toContain("priorizar-alto-riesgo");
  });
});

describe("buildActionPlan — deduplicación sin perder brechas", () => {
  it("el mismo artículo en dos sistemas se agrupa citando ambos", () => {
    const plan = buildActionPlan(
      [system({ id: "SYS-001", name: "Cribado" }), system({ id: "SYS-002", name: "Chatbot" })],
      [
        gap({ id: "g1", system: "SYS-001", article: "Art. 26" }),
        gap({ id: "g2", system: "SYS-002", article: "Art. 26" }),
      ],
    );
    const art26 = plan.filter((r) => r.article.startsWith("Art. 26"));
    expect(art26).toHaveLength(1);
    expect(art26[0]!.systems).toEqual(
      expect.arrayContaining(["Cribado", "Chatbot"]),
    );
  });

  it("al agrupar se conserva la prioridad MÁS alta de las dos", () => {
    const plan = buildActionPlan(
      [system({ id: "SYS-001" }), system({ id: "SYS-002" })],
      [
        gap({ id: "g1", system: "SYS-001", article: "Art. 26", severity: "baja" }),
        gap({ id: "g2", system: "SYS-002", article: "Art. 26", severity: "alta" }),
      ],
    );
    expect(plan.find((r) => r.article.startsWith("Art. 26"))!.priority).toBe(
      "crítica",
    );
  });

  it("una brecha con artículo SIN remediación en catálogo no se descarta", () => {
    // Referencias de otras normas (RGPD, leyes estatales, Anexo) no tienen entrada
    // en el catálogo: la recomendación se genera con el propio requisito del pack.
    const plan = buildActionPlan(
      [system()],
      [gap({ article: "RGPD Art. 35", requirement: "Evaluación de impacto (DPIA)" })],
    );
    expect(plan).toHaveLength(1);
    expect(plan[0]!.title).toBe("Evaluación de impacto (DPIA)");
    expect(plan[0]!.article).toBe("RGPD Art. 35");
  });

  it("dos requisitos distintos del Art. 5 NO se colapsan en uno", () => {
    // El encuadre del Art. 5 depende del subapartado, así que no se deduplica por
    // artículo: si se colapsaran, una práctica prohibida desaparecería del plan.
    const plan = buildActionPlan(
      [system()],
      [
        gap({ id: "g1", article: "Art. 5.1.f", requirement: "No inferir emociones" }),
        gap({ id: "g2", article: "Art. 5.1.a", requirement: "No explotar vulnerabilidades" }),
      ],
    );
    expect(plan).toHaveLength(2);
  });

  it("una brecha sin artículo sigue apareciendo, con marcador visible", () => {
    const plan = buildActionPlan([system()], [gap({ article: "" })]);
    expect(plan).toHaveLength(1);
    expect(plan[0]!.article).toBe("—");
  });

  it("el plan queda ordenado por prioridad", () => {
    const orden = { crítica: 0, alta: 1, media: 2 } as const;
    const plan = buildActionPlan(
      [system({ compliance: 90 })],
      [
        gap({ id: "g1", article: "Art. 26", severity: "baja" }),
        gap({ id: "g2", article: "Art. 27", severity: "alta" }),
        gap({ id: "g3", article: "Art. 50", severity: "media" }),
      ],
    );
    const pesos = plan.map((r) => orden[r.priority]);
    expect(pesos).toEqual([...pesos].sort((a, b) => a - b));
  });
});

describe("priorityLabel", () => {
  it("traduce la prioridad sin cambiar el enum interno", () => {
    expect(priorityLabel("crítica", "es")).toBe("crítica");
    expect(priorityLabel("crítica", "en")).toBe("critical");
    expect(priorityLabel("alta", "en")).toBe("high");
    expect(priorityLabel("media", "en")).toBe("medium");
  });
});
