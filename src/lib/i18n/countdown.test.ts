import { describe, expect, it } from "vitest";
import { es } from "./dictionaries/es";
import { en } from "./dictionaries/en";
import { formatInDays } from "./countdown";

describe("cuenta atrás «en N días» (mismo formato que el panel)", () => {
  it("plural y singular en ES y EN", () => {
    expect(formatInDays(421, es.common)).toBe("en 421 días");
    expect(formatInDays(1, es.common)).toBe("en 1 día");
    expect(formatInDays(421, en.common)).toBe("in 421 days");
    expect(formatInDays(1, en.common)).toBe("in 1 day");
  });
});
