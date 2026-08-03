import { describe, expect, it } from "vitest";
import type { AiSystem } from "@/lib/mock-data";
import {
  REVIEW_CADENCE_CHOICES,
  REVIEW_CADENCE_DEFAULT_DAYS,
  REVIEW_SOON_DAYS,
  REVIEW_TRIGGERS,
  collectReviewsDue,
  nextReviewDue,
  normalizeCadenceDays,
  reviewState,
} from "./review";
import { getDictionary } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n/config";

const NOW = new Date("2026-07-10T12:00:00Z");

const sys = (id: string, name: string, lastReviewed: string): AiSystem => ({
  id,
  name,
  owner: "RRHH",
  domain: "Contratación",
  vendor: "X",
  risk: "high",
  compliance: 50,
  lastReviewed,
});

describe("cadencia de revisión", () => {
  it("el defecto son 12 meses y está entre las opciones ofrecidas", () => {
    expect(REVIEW_CADENCE_DEFAULT_DAYS).toBe(365);
    expect(REVIEW_CADENCE_CHOICES).toContain(REVIEW_CADENCE_DEFAULT_DAYS);
  });

  it("cualquier valor fuera del catálogo cae en el defecto", () => {
    // Una cadencia de 0 o negativa marcaría el inventario entero como vencido
    // de golpe; propagar basura de la BD o del formulario no es una opción.
    expect(normalizeCadenceDays(0)).toBe(REVIEW_CADENCE_DEFAULT_DAYS);
    expect(normalizeCadenceDays(-30)).toBe(REVIEW_CADENCE_DEFAULT_DAYS);
    expect(normalizeCadenceDays("hola")).toBe(REVIEW_CADENCE_DEFAULT_DAYS);
    expect(normalizeCadenceDays(null)).toBe(REVIEW_CADENCE_DEFAULT_DAYS);
    expect(normalizeCadenceDays(999)).toBe(REVIEW_CADENCE_DEFAULT_DAYS);
    expect(normalizeCadenceDays(180)).toBe(180);
  });

  it("la próxima revisión se calcula sumando la cadencia a la última", () => {
    expect(nextReviewDue("2026-01-01", 365)).toBe("2027-01-01");
    expect(nextReviewDue("2026-01-01", 180)).toBe("2026-06-30");
    expect(nextReviewDue(null, 365)).toBeNull();
    expect(nextReviewDue("no-es-fecha", 365)).toBeNull();
  });
});

describe("estado de la revisión", () => {
  it("vencida en cuanto la fecha pasó, ni un día antes", () => {
    // Frontera exacta: hoy todavía NO está vencida.
    expect(reviewState("2025-07-10", 365, NOW)).toBe("due_soon"); // vence hoy
    expect(reviewState("2025-07-09", 365, NOW)).toBe("overdue");
  });

  it("avisa dentro de la ventana de preaviso y no antes", () => {
    const inWindow = "2025-08-08"; // vence 2026-08-08 → 29 días
    const outside = "2025-08-10"; // vence 2026-08-10 → 31 días
    expect(REVIEW_SOON_DAYS).toBe(30);
    expect(reviewState(inWindow, 365, NOW)).toBe("due_soon");
    expect(reviewState(outside, 365, NOW)).toBe("ok");
  });

  it("«nunca revisado» NO se confunde con «vencido»", () => {
    // Son casos distintos: uno no empezó, el otro se pasó. Colapsarlos esconde
    // el peor de los dos dentro del montón del otro.
    expect(reviewState(null, 365, NOW)).toBe("unknown");
    expect(reviewState("", 365, NOW)).toBe("unknown");
  });
});

describe("listado de revisiones pendientes", () => {
  it("deja fuera lo que está al día", () => {
    const due = collectReviewsDue([sys("A", "Al día", "2026-07-01")], 365, NOW);
    expect(due).toEqual([]);
  });

  it("ordena vencidas, luego nunca revisadas, luego próximas", () => {
    const list = [
      sys("C", "Próxima", "2025-08-01"),
      sys("A", "Vencida", "2024-01-01"),
      sys("B", "Nunca", ""),
    ];
    expect(collectReviewsDue(list, 365, NOW).map((r) => r.systemId)).toEqual([
      "A",
      "B",
      "C",
    ]);
  });

  it("dentro del mismo estado, lo que vence antes va primero", () => {
    const list = [
      sys("tarde", "Tarde", "2025-06-01"),
      sys("pronto", "Pronto", "2024-06-01"),
    ];
    expect(collectReviewsDue(list, 365, NOW).map((r) => r.systemId)).toEqual([
      "pronto",
      "tarde",
    ]);
  });
});

/**
 * Guard de HONESTIDAD, no de formato.
 *
 * El Reglamento NO fija ninguna periodicidad de revisión para el deployer: el
 * Art. 26.5 es un deber continuo sin cadencia y el Art. 27.2 dispara por cambio,
 * no por calendario. Toda cadencia que ofrezca Attesta es buena práctica, y el
 * marco que más se le acerca (NIST AI RMF GOVERN 1.5) dice literalmente que la
 * frecuencia la determina la organización.
 *
 * Sin este test, alguien puede reescribir el copy a «revisión obligatoria cada
 * 12 meses» y todo —tsc, lint, build, el resto de la suite— seguiría en verde.
 */
describe("la cadencia se presenta como buena práctica, nunca como obligación", () => {
  const marker: Record<string, RegExp> = {
    es: /buena pr[áa]ctica/i,
    en: /good practice/i,
  };

  for (const locale of LOCALES) {
    it(`${locale}: el texto de la cadencia lleva la marca de buena práctica`, () => {
      const t = getDictionary(locale).dashboard.pages.incidents;
      expect(t.cadenceNote).toMatch(marker[locale]);
    });

    it(`${locale}: el texto de la cadencia no la llama obligatoria`, () => {
      const t = getDictionary(locale).dashboard.pages.incidents;
      const forbidden =
        locale === "es"
          ? /\b(obligatori[oa]s?|exige|obliga|debes revisar)\b/i
          : /\b(mandatory|required by|must review)\b/i;
      expect(t.cadenceNote).not.toMatch(forbidden);
    });
  }
});

describe("disparadores por evento", () => {
  it("los que citan el Art. 27 están marcados como tales", () => {
    // La evaluación de impacto solo obliga a quien está sujeto al Art. 27.1
    // (públicos, servicios públicos y Anexo III 5.b/5.c). Programársela a un
    // cliente de RRHH privado sería inventarle un deber, así que la UI necesita
    // saber cuáles llevan condicional.
    const art27 = REVIEW_TRIGGERS.filter((t) => t.art27);
    expect(art27.length).toBeGreaterThan(0);
    expect(art27.every((t) => t.article?.startsWith("Art. 27.1"))).toBe(true);
  });

  it("ningún disparador que no sea del 27 cita el Art. 27", () => {
    const otros = REVIEW_TRIGGERS.filter((t) => !t.art27);
    expect(otros.every((t) => !t.article?.includes("27"))).toBe(true);
  });

  it("cada disparador tiene texto en los dos idiomas", () => {
    for (const locale of LOCALES) {
      const t = getDictionary(locale).dashboard.pages.incidents.triggers;
      for (const trig of REVIEW_TRIGGERS) {
        const text = t[trig.key as keyof typeof t];
        expect(text, `${locale} · ${trig.key}`).toBeTruthy();
      }
    }
  });
});
