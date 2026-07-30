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

describe("capa GPAI (Cap. V) — régimen paralelo, no un nivel de riesgo", () => {
  it("usar GenAI NO sube el nivel de riesgo", () => {
    // Decir "alto riesgo porque usa ChatGPT" sería alarmismo y falso: el Cap. V es
    // un régimen aparte cuyas obligaciones son del PROVEEDOR del modelo.
    const sinGpai = classify(a({ transparency: ["interacts"] }), BEFORE_OMNIBUS);
    const conGpai = classify(
      a({ transparency: ["interacts"], gpai: ["third_party"] }),
      BEFORE_OMNIBUS,
    );
    expect(conGpai.level).toBe(sinGpai.level);
    expect(conGpai.level).toBe("limited");
  });

  it("tampoco convierte en 'limitado' un sistema de riesgo mínimo", () => {
    expect(classify(a({ gpai: ["third_party"] }), BEFORE_OMNIBUS).level).toBe(
      "minimal",
    );
  });

  it("añade citas y obligaciones a las listas principales (las lee el dossier)", () => {
    const base = classify(a({ domain: ["employment"] }), BEFORE_OMNIBUS);
    const conGpai = classify(
      a({ domain: ["employment"], gpai: ["third_party"] }),
      BEFORE_OMNIBUS,
    );
    expect(conGpai.citations.length).toBeGreaterThan(base.citations.length);
    expect(conGpai.obligations.length).toBeGreaterThan(base.obligations.length);
    expect(conGpai.citations.some((c) => c.article.includes("51-56"))).toBe(true);
  });

  it("sin modelo GPAI declarado, no hay capa ni ruido en las listas", () => {
    for (const answers of [{}, { gpai: [NONE] }, { gpai: ["inventado"] }] as Answers[]) {
      const r = classify(answers, BEFORE_OMNIBUS);
      expect(r.gpai, JSON.stringify(answers)).toBeUndefined();
      expect(r.citations.some((c) => c.article.includes("51-56"))).toBe(false);
    }
  });

  it("el aviso de cambio de rol (Art. 25) salta SOLO con fine-tuning o marca blanca", () => {
    const rol = (choice: string) =>
      classify(a({ gpai: [choice] }), BEFORE_OMNIBUS).gpai?.providerRisk;
    expect(rol("third_party")).toBe(false);
    expect(rol("self_hosted")).toBe(false);
    expect(rol("finetuned")).toBe(true);
    expect(rol("own_brand")).toBe(true);
  });

  it("el aviso de rol añade obligaciones extra y marca revisión jurídica", () => {
    const conRiesgo = classify(a({ gpai: ["finetuned"] }), BEFORE_OMNIBUS);
    const sinRiesgo = classify(a({ gpai: ["third_party"] }), BEFORE_OMNIBUS);
    expect(conRiesgo.obligations.length).toBeGreaterThan(sinRiesgo.obligations.length);
    expect(conRiesgo.obligations.join(" ")).toMatch(/[Rr]evisión jurídica/);
  });

  it("cada opción trae su propia explicación, no un texto genérico", () => {
    const notas = ["third_party", "self_hosted", "finetuned", "own_brand"].map(
      (c) => classify(a({ gpai: [c] }), BEFORE_OMNIBUS).gpai!.note,
    );
    expect(new Set(notas).size).toBe(4);
    for (const n of notas) expect(n.trim().length).toBeGreaterThan(0);
  });

  it("el criterio de cómputo se presenta como INDICATIVO, nunca como umbral legal", () => {
    // Es de las directrices de la Comisión (jul-2025), no del Reglamento. Afirmarlo
    // como umbral sería exactamente el tipo de texto legal que no podemos publicar.
    const r = classify(a({ gpai: ["finetuned"] }), BEFORE_OMNIBUS);
    const texto = `${r.gpai!.note} ${r.obligations.join(" ")} ${r.citations.map((c) => c.text).join(" ")}`;
    // Debe calificarse siempre como indicativo/orientativo…
    expect(texto).toMatch(/indicativ|orientativ/i);
    // …y atribuirse a su fuente real (directrices de la Comisión), que es lo que
    // impide leerlo como si el Reglamento fijara un umbral de cómputo.
    expect(texto).toMatch(/directrices de la Comisión/);
    expect(texto).toMatch(/no un umbral legal/);
  });

  it("una práctica PROHIBIDA no recibe capa GPAI: no se prepara, se cesa", () => {
    const r = classify(
      a({ prohibited: ["social_scoring"], gpai: ["finetuned"] }),
      BEFORE_OMNIBUS,
    );
    expect(r.level).toBe("unacceptable");
    expect(r.gpai).toBeUndefined();
  });

  it("la capa GPAI funciona igual en EN y el nivel no cambia con el idioma", () => {
    for (const choice of ["third_party", "finetuned"]) {
      const es = classify(a({ gpai: [choice] }), BEFORE_OMNIBUS, "es");
      const en = classify(a({ gpai: [choice] }), BEFORE_OMNIBUS, "en");
      expect(en.level).toBe(es.level);
      expect(en.gpai?.providerRisk).toBe(es.gpai?.providerRisk);
      expect(en.gpai?.note).not.toBe(es.gpai?.note);
      expect(en.citations.length).toBe(es.citations.length);
      expect(en.obligations.length).toBe(es.obligations.length);
    }
  });

  it("las obligaciones GPAI se redactan como deberes del DEPLOYER", () => {
    // Los deberes del Cap. V son del proveedor del modelo: los nuestros son
    // exigirle evidencia, no fabricar la documentación del modelo.
    const texto = classify(a({ gpai: ["third_party"] }), BEFORE_OMNIBUS)
      .obligations.join(" ");
    expect(texto).toMatch(/Exige al proveedor|Deber propio/);
  });
});
