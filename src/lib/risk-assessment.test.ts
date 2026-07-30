import { describe, expect, it } from "vitest";
import {
  NONE,
  OBLIGATIONS_BY_LEVEL,
  OBLIGATIONS_BY_LEVEL_EN,
  OMNIBUS_ART5_EFFECTIVE,
  RISK_QUESTIONS,
  RISK_QUESTIONS_EN,
  RATIONALES,
  RATIONALES_EN,
  classify,
  isHighCandidate,
  visibleQuestions,
  type Answers,
} from "./risk-assessment";

/**
 * El clasificador es el corazón regulatorio del producto: de él salen el nivel de
 * riesgo, las citas y las obligaciones que el cliente verá en su dossier. Un `if`
 * invertido aquí no rompe el build, produce un veredicto equivocado sobre el EU
 * AI Act. Estos tests codifican las expectativas del marco, no la implementación.
 */

/** Fecha estable anterior al periodo transitorio del Omnibus (2-dic-2026). */
const BEFORE_OMNIBUS = new Date("2026-07-30T00:00:00Z");
const AFTER_OMNIBUS = new Date("2027-01-15T00:00:00Z");

const a = (answers: Answers): Answers => answers;

describe("Art. 5 — prácticas prohibidas", () => {
  it("cualquier práctica clásica marcada da riesgo inaceptable", () => {
    const r = classify(a({ prohibited: ["social_scoring"] }), BEFORE_OMNIBUS);
    expect(r.level).toBe("unacceptable");
  });

  it("manda sobre todo lo demás: gana al ámbito de alto riesgo", () => {
    const r = classify(
      a({ prohibited: ["emotion_workplace"], domain: ["employment"] }),
      BEFORE_OMNIBUS,
    );
    expect(r.level).toBe("unacceptable");
  });

  it('"ninguna" no cuenta como práctica marcada', () => {
    const r = classify(a({ prohibited: [NONE] }), BEFORE_OMNIBUS);
    expect(r.level).toBe("minimal");
  });

  it("prohibido no ofrece obligaciones de preparación: se cesa", () => {
    const r = classify(a({ prohibited: ["social_scoring"] }), BEFORE_OMNIBUS);
    expect(r.obligations).toEqual(OBLIGATIONS_BY_LEVEL.unacceptable);
    expect(r.obligations.join(" ")).toMatch(/Cesar|Prohibido/);
  });
});

describe("Art. 5 — las dos prácticas añadidas por el Digital Omnibus", () => {
  it("antes del 2-dic-2026 el motivo dice que aún no está vigente por el AI Act", () => {
    const r = classify(a({ prohibited: ["csam"] }), BEFORE_OMNIBUS);
    expect(r.level).toBe("unacceptable");
    expect(r.rationale).toBe(RATIONALES.prohibited_omnibus_pending);
  });

  it("desde el 2-dic-2026 el motivo cambia a vigente", () => {
    const r = classify(a({ prohibited: ["csam"] }), AFTER_OMNIBUS);
    expect(r.rationale).toBe(RATIONALES.prohibited_omnibus_in_force);
  });

  it("la fecha de corte es exactamente el 2-dic-2026 (no un día antes)", () => {
    const dayBefore = new Date(OMNIBUS_ART5_EFFECTIVE.getTime() - 1);
    expect(classify(a({ prohibited: ["csam"] }), dayBefore).rationale).toBe(
      RATIONALES.prohibited_omnibus_pending,
    );
    expect(
      classify(a({ prohibited: ["csam"] }), OMNIBUS_ART5_EFFECTIVE).rationale,
    ).toBe(RATIONALES.prohibited_omnibus_in_force);
  });

  it("mezclada con una prohibición clásica, el motivo es el clásico (ya vigente)", () => {
    const r = classify(
      a({ prohibited: ["csam", "social_scoring"] }),
      BEFORE_OMNIBUS,
    );
    expect(r.rationale).toBe(RATIONALES.prohibited_classic);
  });

  it("solo Omnibus añade sus citas propias; mezclado, no", () => {
    const soloOmnibus = classify(a({ prohibited: ["csam"] }), BEFORE_OMNIBUS);
    const mezclado = classify(
      a({ prohibited: ["csam", "social_scoring"] }),
      BEFORE_OMNIBUS,
    );
    expect(soloOmnibus.citations.length).toBeGreaterThan(mezclado.citations.length);
  });
});

describe("Anexo III — ámbitos de alto riesgo", () => {
  it("los ámbitos del Anexo III son candidatos a alto riesgo", () => {
    for (const domain of [
      "employment",
      "education",
      "credit",
      "insurance",
      "biometrics",
      "public_services",
      "law_enforcement",
      "migration",
      "justice",
      "critical_infra",
    ]) {
      expect(isHighCandidate(a({ domain: [domain] })), domain).toBe(true);
    }
  });

  it("un ámbito fuera del Anexo III no es candidato", () => {
    expect(isHighCandidate(a({ domain: ["marketing"] }))).toBe(false);
    expect(isHighCandidate(a({}))).toBe(false);
  });

  it("sin excepción real, el ámbito del Anexo III da alto riesgo", () => {
    const r = classify(a({ domain: ["employment"] }), BEFORE_OMNIBUS);
    expect(r.level).toBe("high");
  });

  it("una excepción real del Art. 6.3 rebaja el nivel", () => {
    const r = classify(
      a({ domain: ["employment"], exception: ["narrow_task"] }),
      BEFORE_OMNIBUS,
    );
    expect(r.level).not.toBe("high");
  });

  it("un valor de excepción inventado NO rebaja el nivel", () => {
    const r = classify(
      a({ domain: ["employment"], exception: ["me_lo_invento"] }),
      BEFORE_OMNIBUS,
    );
    expect(r.level).toBe("high");
  });
});

describe("Art. 6.3 párrafo 2 — el perfilado anula toda excepción", () => {
  it("con perfilado, el alto riesgo se mantiene aunque se alegue una excepción real", () => {
    const r = classify(
      a({
        domain: ["employment"],
        profiling_gate: ["yes"],
        exception: ["narrow_task"],
      }),
      BEFORE_OMNIBUS,
    );
    expect(r.level).toBe("high");
    expect(r.rationale).toBe(RATIONALES.high_profiling);
  });

  it("con perfilado se oculta la pregunta de excepción (no puede aplicar)", () => {
    const ids = visibleQuestions(
      a({ domain: ["employment"], profiling_gate: ["yes"] }),
    ).map((q) => q.id);
    expect(ids).not.toContain("exception");
  });

  it("las preguntas de Anexo III solo se ven en ámbitos del Anexo III", () => {
    const fuera = visibleQuestions(a({ domain: ["marketing"] })).map((q) => q.id);
    const dentro = visibleQuestions(a({ domain: ["employment"] })).map((q) => q.id);
    expect(fuera).not.toContain("profiling_gate");
    expect(dentro).toContain("profiling_gate");
  });
});

describe("Art. 50 — transparencia y riesgo mínimo", () => {
  it("una obligación de transparencia sin ámbito de Anexo III da riesgo limitado", () => {
    const r = classify(a({ transparency: ["chatbot"] }), BEFORE_OMNIBUS);
    expect(r.level).toBe("limited");
  });

  it('"ninguna" transparencia deja el riesgo en mínimo', () => {
    const r = classify(a({ transparency: [NONE] }), BEFORE_OMNIBUS);
    expect(r.level).toBe("minimal");
  });

  it("sin respuestas, el resultado es mínimo (nunca undefined)", () => {
    expect(classify(a({}), BEFORE_OMNIBUS).level).toBe("minimal");
  });
});

describe("encuadre deployer y completitud del resultado", () => {
  it("todo nivel devuelve motivo, citas y obligaciones no vacíos", () => {
    const casos: Answers[] = [
      { prohibited: ["social_scoring"] },
      { domain: ["employment"] },
      { transparency: ["chatbot"] },
      {},
    ];
    for (const answers of casos) {
      const r = classify(answers, BEFORE_OMNIBUS);
      expect(r.rationale.length, JSON.stringify(answers)).toBeGreaterThan(0);
      expect(r.citations.length, JSON.stringify(answers)).toBeGreaterThan(0);
      expect(r.obligations.length, JSON.stringify(answers)).toBeGreaterThan(0);
    }
  });

  it("las obligaciones de alto riesgo son deberes PROPIOS del deployer (Arts. 26/27/50)", () => {
    const texto = OBLIGATIONS_BY_LEVEL.high.join(" ");
    expect(texto).toMatch(/Art\. 26/);
    // Los deberes del proveedor (Arts. 9-15) se reencuadran como exigencia de
    // evidencia, nunca como algo que el cliente deba fabricar.
    expect(texto).toMatch(/Deber propio/);
  });

  it("las citas nunca vienen vacías de texto ni de artículo", () => {
    for (const answers of [
      { prohibited: ["csam"] },
      { domain: ["credit"] },
      { transparency: ["chatbot"] },
      {},
    ] as Answers[]) {
      for (const c of classify(answers, BEFORE_OMNIBUS).citations) {
        expect(c.article.trim().length).toBeGreaterThan(0);
        expect(c.text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("paridad ES/EN — el idioma cambia el texto, nunca el veredicto", () => {
  it("mismos ids de pregunta y en el mismo orden", () => {
    expect(RISK_QUESTIONS_EN.map((q) => q.id)).toEqual(
      RISK_QUESTIONS.map((q) => q.id),
    );
  });

  it("mismos valores de opción en cada pregunta", () => {
    for (const [i, q] of RISK_QUESTIONS.entries()) {
      expect(
        RISK_QUESTIONS_EN[i]!.choices.map((c) => c.value),
        `pregunta ${q.id}`,
      ).toEqual(q.choices.map((c) => c.value));
    }
  });

  it("mismas claves de motivo y de obligaciones", () => {
    expect(Object.keys(RATIONALES_EN).sort()).toEqual(
      Object.keys(RATIONALES).sort(),
    );
    expect(Object.keys(OBLIGATIONS_BY_LEVEL_EN).sort()).toEqual(
      Object.keys(OBLIGATIONS_BY_LEVEL).sort(),
    );
  });

  it("el nivel clasificado es idéntico en ES y EN", () => {
    const casos: Answers[] = [
      { prohibited: ["social_scoring"] },
      { prohibited: ["csam"] },
      { domain: ["employment"], profiling_gate: ["yes"] },
      { domain: ["employment"], exception: ["narrow_task"] },
      { domain: ["education"] },
      { transparency: ["chatbot"] },
      {},
    ];
    for (const answers of casos) {
      expect(
        classify(answers, BEFORE_OMNIBUS, "en").level,
        JSON.stringify(answers),
      ).toBe(classify(answers, BEFORE_OMNIBUS, "es").level);
    }
  });

  it("ningún texto EN quedó vacío", () => {
    for (const v of Object.values(RATIONALES_EN)) {
      expect(v.trim().length).toBeGreaterThan(0);
    }
    for (const list of Object.values(OBLIGATIONS_BY_LEVEL_EN)) {
      expect(list.length).toBeGreaterThan(0);
      for (const o of list) expect(o.trim().length).toBeGreaterThan(0);
    }
  });
});
