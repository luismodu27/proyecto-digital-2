import { describe, expect, it } from "vitest";
import type { AiSystem } from "@/lib/mock-data";
import {
  FRAMEWORK_META,
  FRAMEWORK_META_EN,
  JURISDICTION_ORDER,
  REGULATORY_EVENTS,
  REGULATORY_EVENTS_EN,
  REG_KIND_LABEL,
  REG_KIND_LABEL_EN,
  affectedSystems,
  daysUntil,
  frameworkLabel,
  isUpcoming,
  jurisdictionLabel,
  mergeCatalog,
  regKindLabel,
  regulatoryEventsBase,
  sortByDate,
  upcomingDeadlines,
  type RegulatoryEvent,
} from "./regulatory-watch";

/**
 * El radar regulatorio es la línea base de CONFIANZA: cada evento es una
 * afirmación sobre una norma real, con su cita y su fuente. Estos tests protegen
 * dos cosas distintas:
 *   · que el catálogo esté bien formado (fechas ISO, fuente con URL, citas), y
 *   · que el catálogo **curado en código siempre gane** al pipeline automático —
 *     la regla que impide que un borrador de máquina se cuele como norma.
 */

const HOY = new Date("2026-07-30T00:00:00Z");

function event(over: Partial<RegulatoryEvent> = {}): RegulatoryEvent {
  return {
    id: "evento-de-prueba",
    date: "2026-12-01",
    kind: "deadline",
    framework: "eu-ai-act",
    title: "Título",
    summary: "Resumen",
    impact: "Impacto",
    action: "Acción",
    articles: ["Art. 26"],
    source: { label: "DOUE", url: "https://example.test" },
    scope: { all: true },
    ...over,
  };
}

describe("catálogo curado — integridad", () => {
  it("los ids son únicos", () => {
    const ids = REGULATORY_EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda fecha es ISO YYYY-MM-DD y real", () => {
    for (const e of REGULATORY_EVENTS) {
      expect(e.date, e.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(new Date(`${e.date}T00:00:00Z`).getTime()), e.id).toBe(
        false,
      );
    }
  });

  it("todo evento cita al menos un artículo y trae fuente verificable", () => {
    for (const e of REGULATORY_EVENTS) {
      expect(e.articles.length, e.id).toBeGreaterThan(0);
      expect(e.source.url, e.id).toMatch(/^https?:\/\//);
      expect(e.source.label.trim().length, e.id).toBeGreaterThan(0);
    }
  });

  it("todo evento explica qué es, qué implica y qué hacer", () => {
    for (const e of REGULATORY_EVENTS) {
      expect(e.summary.trim().length, e.id).toBeGreaterThan(0);
      expect(e.impact.trim().length, e.id).toBeGreaterThan(0);
      expect(e.action.trim().length, e.id).toBeGreaterThan(0);
    }
  });

  it("el marco de cada evento existe en el registro de marcos", () => {
    for (const e of REGULATORY_EVENTS) {
      expect(FRAMEWORK_META[e.framework], e.id).toBeDefined();
    }
  });

  it("toda jurisdicción declarada está en el orden de la UI", () => {
    for (const meta of Object.values(FRAMEWORK_META)) {
      expect(JURISDICTION_ORDER, meta.label).toContain(meta.jurisdiction);
    }
  });
});

describe("paridad ES/EN del catálogo", () => {
  it("mismos eventos, mismos ids y en el mismo orden", () => {
    expect(REGULATORY_EVENTS_EN.map((e) => e.id)).toEqual(
      REGULATORY_EVENTS.map((e) => e.id),
    );
  });

  it("fecha, tipo, marco y artículos son datos: no cambian con el idioma", () => {
    for (const [i, e] of REGULATORY_EVENTS.entries()) {
      const en = REGULATORY_EVENTS_EN[i]!;
      expect(en.date, e.id).toBe(e.date);
      expect(en.kind, e.id).toBe(e.kind);
      expect(en.framework, e.id).toBe(e.framework);
      // Los artículos llevan prosa que sí se traduce ("Cap. V" → "Chapter V"),
      // así que se comparan las REFERENCIAS: mismo número de citas y mismos
      // números dentro. Un `99` que en EN fuera `98` sería una cita equivocada.
      expect(en.articles.length, e.id).toBe(e.articles.length);
      expect(en.articles.join(" ").match(/\d+/g) ?? [], e.id).toEqual(
        e.articles.join(" ").match(/\d+/g) ?? [],
      );
      expect(en.source.url, e.id).toBe(e.source.url);
    }
  });

  it("mismas claves de tipo y de marco en ambos idiomas", () => {
    expect(Object.keys(REG_KIND_LABEL_EN).sort()).toEqual(
      Object.keys(REG_KIND_LABEL).sort(),
    );
    expect(Object.keys(FRAMEWORK_META_EN).sort()).toEqual(
      Object.keys(FRAMEWORK_META).sort(),
    );
  });

  it("`regulatoryEventsBase` elige el catálogo del idioma", () => {
    expect(regulatoryEventsBase("en")).toBe(REGULATORY_EVENTS_EN);
    expect(regulatoryEventsBase("es")).toBe(REGULATORY_EVENTS);
    expect(regulatoryEventsBase()).toBe(REGULATORY_EVENTS);
  });
});

describe("mergeCatalog — el código curado siempre gana", () => {
  it("un evento publicado con id ya curado NO sustituye al curado", () => {
    const curado = event({ id: "mismo", title: "Texto verificado" });
    const publicado = event({ id: "mismo", title: "Borrador de la máquina" });
    const merged = mergeCatalog([publicado], [curado]);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.title).toBe("Texto verificado");
  });

  it("un evento publicado con id nuevo se añade al final", () => {
    const curado = event({ id: "curado" });
    const nuevo = event({ id: "nuevo" });
    const merged = mergeCatalog([nuevo], [curado]);
    expect(merged.map((e) => e.id)).toEqual(["curado", "nuevo"]);
  });

  it("sin base explícita usa el catálogo curado del idioma", () => {
    expect(mergeCatalog([]).map((e) => e.id)).toEqual(
      REGULATORY_EVENTS.map((e) => e.id),
    );
    expect(mergeCatalog([], undefined, "en").map((e) => e.id)).toEqual(
      REGULATORY_EVENTS_EN.map((e) => e.id),
    );
  });
});

describe("fechas y plazos", () => {
  it("daysUntil es 0 el mismo día y negativo en el pasado", () => {
    expect(daysUntil("2026-07-30", HOY)).toBe(0);
    expect(daysUntil("2026-07-31", HOY)).toBe(1);
    expect(daysUntil("2026-07-29", HOY)).toBe(-1);
  });

  it("un evento de hoy todavía cuenta como próximo", () => {
    expect(isUpcoming(event({ date: "2026-07-30" }), HOY)).toBe(true);
    expect(isUpcoming(event({ date: "2026-07-29" }), HOY)).toBe(false);
  });

  it("`upcomingDeadlines` solo trae plazos futuros, del más cercano al más lejano", () => {
    const res = upcomingDeadlines(HOY, [
      event({ id: "pasado", date: "2025-01-01" }),
      event({ id: "lejano", date: "2027-08-01" }),
      event({ id: "cercano", date: "2026-08-02" }),
      event({ id: "no-es-plazo", date: "2026-09-01", kind: "guidance" }),
    ]);
    expect(res.map((e) => e.id)).toEqual(["cercano", "lejano"]);
  });

  it("`sortByDate` no muta el array de entrada", () => {
    const input = [event({ id: "b", date: "2027-01-01" }), event({ id: "a", date: "2026-01-01" })];
    const copia = [...input];
    sortByDate(input);
    expect(input).toEqual(copia);
    expect(sortByDate(input, "desc").map((e) => e.id)).toEqual(["b", "a"]);
  });
});

describe("alcance del evento (a qué sistemas afecta)", () => {
  const sistemas = [
    { id: "s1", risk: "high" },
    { id: "s2", risk: "limited" },
    { id: "s3", risk: "minimal" },
  ] as unknown as AiSystem[];

  it("`all` afecta a todos", () => {
    expect(affectedSystems(event({ scope: { all: true } }), sistemas)).toHaveLength(3);
  });

  it("filtra por nivel de riesgo cuando el alcance lo acota", () => {
    const res = affectedSystems(
      event({ scope: { riskLevels: ["high"] } }),
      sistemas,
    );
    expect(res.map((s) => s.id)).toEqual(["s1"]);
  });

  it("una lista de niveles vacía no oculta sistemas (degradación segura)", () => {
    expect(
      affectedSystems(event({ scope: { riskLevels: [] } }), sistemas),
    ).toHaveLength(3);
  });
});

describe("etiquetas con reserva segura", () => {
  it("un marco desconocido de BD no rompe la UI: se muestra tal cual", () => {
    expect(frameworkLabel("marco-inventado")).toBe("marco-inventado");
    expect(jurisdictionLabel("marco-inventado")).toBe("Otras");
    expect(jurisdictionLabel("marco-inventado", "en")).toBe("Other");
  });

  it("todo tipo de evento tiene etiqueta en ambos idiomas", () => {
    for (const kind of Object.keys(REG_KIND_LABEL) as (keyof typeof REG_KIND_LABEL)[]) {
      expect(regKindLabel(kind, "es").trim().length).toBeGreaterThan(0);
      expect(regKindLabel(kind, "en").trim().length).toBeGreaterThan(0);
    }
  });
});
