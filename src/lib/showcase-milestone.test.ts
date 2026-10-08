import { describe, expect, it } from "vitest";
import { es } from "@/lib/i18n/dictionaries/es";
import { en } from "@/lib/i18n/dictionaries/en";
import { milestoneView } from "./showcase-milestone";

describe("hito destacado listo para pintar (milestoneView)", () => {
  const OCT_2026 = new Date("2026-10-07T15:00:00Z");

  it("junta la fecha del catálogo y la cuenta atrás, por idioma", () => {
    expect(milestoneView("es", es.common, OCT_2026)?.countdown).toBe("en 421 días");
    expect(milestoneView("en", en.common, OCT_2026)).toEqual({
      dateLabel: "Dec 2, 2027",
      countdown: "in 421 days",
    });
  });

  it("sin hito vigente no hay nada que pintar (las ilustraciones lo ocultan)", () => {
    expect(milestoneView("es", es.common, new Date("2028-01-01T00:00:00Z"))).toBeNull();
  });
});
