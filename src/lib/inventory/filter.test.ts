import { describe, expect, it } from "vitest";
import {
  DEFAULT_DIR,
  DEFAULT_QUERY,
  buildInventoryHref,
  filterSystems,
  hasActiveFilters,
  parseInventoryQuery,
  sortHref,
  type InventoryQuery,
} from "./filter";
import type { AiSystem } from "@/lib/mock-data";

/**
 * Reglas del inventario filtrable.
 *
 * Se codifica lo que el USUARIO espera, no la implementación: que buscar sin
 * acentos encuentre, que dos palabras sueltas encuentren, que el orden por
 * riesgo sea el regulatorio y no el alfabético, y —lo más importante— que un
 * parámetro inválido enseñe el inventario ENTERO y nunca una pantalla vacía,
 * que en una herramienta de expediente se lee como pérdida de datos.
 */

const sys = (over: Partial<AiSystem> & { name: string }): AiSystem => ({
  id: "SYS-000",
  owner: "RRHH",
  domain: "Contratación",
  vendor: "Interno",
  risk: "limited",
  compliance: 50,
  lastReviewed: "2026-01-01",
  ...over,
});

const SYSTEMS: AiSystem[] = [
  sys({
    id: "SYS-001",
    name: "Cribado de CVs — ATS",
    owner: "RRHH",
    domain: "Selección",
    vendor: "HireFlow",
    risk: "high",
    compliance: 42,
    lastReviewed: "2026-06-28",
    evidenceState: "declared",
  }),
  sys({
    id: "SYS-002",
    name: "Asistente de atención",
    owner: "Soporte",
    domain: "Atención al cliente",
    vendor: "OpenChat",
    risk: "limited",
    compliance: 88,
    lastReviewed: "2026-05-02",
    evidenceState: "evidenced",
  }),
  sys({
    id: "SYS-003",
    name: "Detección de emociones",
    owner: "Operaciones",
    domain: "Productividad",
    vendor: "MoodAI",
    risk: "unacceptable",
    compliance: 10,
    lastReviewed: "2026-02-14",
  }),
  sys({
    id: "SYS-004",
    name: "Traductor interno",
    owner: "Legal",
    domain: "Documentación",
    vendor: "Interno",
    risk: "minimal",
    compliance: 95,
    lastReviewed: "2026-07-01",
  }),
];

const query = (over: Partial<InventoryQuery> = {}): InventoryQuery => ({
  ...DEFAULT_QUERY,
  ...over,
});

const names = (rows: AiSystem[]) => rows.map((r) => r.name);

describe("parseInventoryQuery", () => {
  it("sin parámetros devuelve la query por defecto", () => {
    expect(parseInventoryQuery({})).toEqual(DEFAULT_QUERY);
  });

  it("un `risk` que no existe se ignora en vez de dejar la lista vacía", () => {
    // Un marcador viejo (`?risk=alto`, enum que ya no usamos) tiene que enseñar
    // el inventario entero. Filtrar por un valor imposible daría cero filas y
    // parecería que se han borrado los sistemas.
    const parsed = parseInventoryQuery({ risk: "alto" });
    expect(parsed.risk).toBeNull();
    expect(filterSystems(SYSTEMS, parsed)).toHaveLength(SYSTEMS.length);
  });

  it("lo mismo con un `evidence` desconocido", () => {
    const parsed = parseInventoryQuery({ evidence: "verificado-por-attesta" });
    expect(parsed.evidence).toBeNull();
    expect(filterSystems(SYSTEMS, parsed)).toHaveLength(SYSTEMS.length);
  });

  it("un `sort` inválido cae al orden por defecto", () => {
    expect(parseInventoryQuery({ sort: "precio" }).sort).toBe(DEFAULT_QUERY.sort);
  });

  it("una `dir` inválida cae a la dirección NATURAL de esa columna", () => {
    // No a "asc" a secas: entrar por «Riesgo» tiene que empezar por lo más
    // grave, y por «Preparación» por lo menos preparado.
    expect(parseInventoryQuery({ sort: "risk", dir: "arriba" }).dir).toBe("desc");
    expect(parseInventoryQuery({ sort: "name", dir: "" }).dir).toBe("asc");
    expect(parseInventoryQuery({ sort: "readiness", dir: "x" }).dir).toBe("asc");
  });

  it("acepta el primer valor si el parámetro llega repetido", () => {
    expect(parseInventoryQuery({ risk: ["high", "minimal"] }).risk).toBe("high");
  });

  it("recorta el texto de búsqueda a 120 caracteres", () => {
    expect(parseInventoryQuery({ q: "a".repeat(500) }).q).toHaveLength(120);
  });

  it("ignora los espacios sobrantes del texto", () => {
    expect(parseInventoryQuery({ q: "   ats   " }).q).toBe("ats");
  });
});

describe("búsqueda de texto", () => {
  it("sin texto devuelve todos los sistemas", () => {
    expect(filterSystems(SYSTEMS, query())).toHaveLength(SYSTEMS.length);
  });

  it("encuentra aunque se teclee sin acentos", () => {
    // La mitad del buscador que se nota cuando falta: en un inventario español
    // nadie escribe "Selección" con tilde en una caja de búsqueda.
    expect(names(filterSystems(SYSTEMS, query({ q: "seleccion" })))).toEqual([
      "Cribado de CVs — ATS",
    ]);
    expect(names(filterSystems(SYSTEMS, query({ q: "atencion" })))).toEqual([
      "Asistente de atención",
    ]);
  });

  it("encuentra aunque el dato tenga tilde y la búsqueda también", () => {
    expect(names(filterSystems(SYSTEMS, query({ q: "Detección" })))).toEqual([
      "Detección de emociones",
    ]);
  });

  it("ignora mayúsculas y minúsculas", () => {
    expect(filterSystems(SYSTEMS, query({ q: "CRIBADO" }))).toHaveLength(1);
  });

  it("combina varias palabras con Y, no como una frase literal", () => {
    // "cribado ats" es lo que la gente teclea; buscar la frase exacta no
    // encontraría "Cribado de CVs — ATS" y parecería roto.
    expect(names(filterSystems(SYSTEMS, query({ q: "cribado ats" })))).toEqual([
      "Cribado de CVs — ATS",
    ]);
    expect(filterSystems(SYSTEMS, query({ q: "cribado traductor" }))).toEqual([]);
  });

  it("busca también por código, responsable, dominio y proveedor", () => {
    // Justo los campos que la fila enseña: buscar por algo invisible en la
    // tabla haría preguntarse por qué sale ese resultado.
    expect(names(filterSystems(SYSTEMS, query({ q: "SYS-003" })))).toEqual([
      "Detección de emociones",
    ]);
    expect(names(filterSystems(SYSTEMS, query({ q: "soporte" })))).toEqual([
      "Asistente de atención",
    ]);
    expect(names(filterSystems(SYSTEMS, query({ q: "hireflow" })))).toEqual([
      "Cribado de CVs — ATS",
    ]);
    expect(names(filterSystems(SYSTEMS, query({ q: "productividad" })))).toEqual([
      "Detección de emociones",
    ]);
  });

  it("un término que aparece en varios sistemas los devuelve todos", () => {
    // "de" está en tres nombres: la búsqueda no puede quedarse en el primero.
    expect(filterSystems(SYSTEMS, query({ q: "de" }))).toHaveLength(3);
  });
});

describe("filtros", () => {
  it("filtra por nivel de riesgo", () => {
    expect(names(filterSystems(SYSTEMS, query({ risk: "unacceptable" })))).toEqual(
      ["Detección de emociones"],
    );
  });

  it("`evidence=none` son los que todavía no se han autoevaluado", () => {
    // Es el segmento accionable de la pantalla: lo que falta por clasificar.
    expect(names(filterSystems(SYSTEMS, query({ evidence: "none" })))).toEqual([
      "Detección de emociones",
      "Traductor interno",
    ]);
  });

  it("`evidence` con un estado concreto solo devuelve ese estado", () => {
    expect(names(filterSystems(SYSTEMS, query({ evidence: "evidenced" })))).toEqual(
      ["Asistente de atención"],
    );
  });

  it("los filtros se acumulan (Y, no O)", () => {
    expect(
      filterSystems(SYSTEMS, query({ risk: "high", evidence: "none" })),
    ).toEqual([]);
    expect(
      names(filterSystems(SYSTEMS, query({ q: "interno", risk: "minimal" }))),
    ).toEqual(["Traductor interno"]);
  });

  it("hasActiveFilters no cuenta el orden como filtro", () => {
    expect(hasActiveFilters(query())).toBe(false);
    expect(hasActiveFilters(query({ sort: "name", dir: "asc" }))).toBe(false);
    expect(hasActiveFilters(query({ q: "x" }))).toBe(true);
    expect(hasActiveFilters(query({ risk: "high" }))).toBe(true);
    expect(hasActiveFilters(query({ evidence: "none" }))).toBe(true);
  });
});

describe("orden", () => {
  it("por defecto ordena por riesgo, de lo más grave a lo menos", () => {
    expect(names(filterSystems(SYSTEMS, query()))).toEqual([
      "Detección de emociones", // inaceptable
      "Cribado de CVs — ATS", // alto
      "Asistente de atención", // limitado
      "Traductor interno", // mínimo
    ]);
  });

  it("el orden por riesgo es el REGULATORIO, no el alfabético", () => {
    // Si alguien ordenara por la cadena del enum, "high" iría antes que
    // "limited" y "minimal" antes que "unacceptable": el sistema prohibido
    // acabaría el último de la lista, que es justo el error que no podemos
    // permitirnos en una herramienta de riesgo.
    const rows = filterSystems(SYSTEMS, query({ sort: "risk", dir: "desc" }));
    expect(rows[0]!.risk).toBe("unacceptable");
    expect(rows.at(-1)!.risk).toBe("minimal");
  });

  it("invertir la dirección del riesgo pone lo mínimo primero", () => {
    const rows = filterSystems(SYSTEMS, query({ sort: "risk", dir: "asc" }));
    expect(rows[0]!.risk).toBe("minimal");
    expect(rows.at(-1)!.risk).toBe("unacceptable");
  });

  it("por preparación ascendente enseña primero lo menos preparado", () => {
    expect(
      filterSystems(SYSTEMS, query({ sort: "readiness", dir: "asc" })).map(
        (s) => s.compliance,
      ),
    ).toEqual([10, 42, 88, 95]);
  });

  it("por última revisión descendente enseña primero lo más reciente", () => {
    expect(
      filterSystems(SYSTEMS, query({ sort: "reviewed", dir: "desc" })).map(
        (s) => s.lastReviewed,
      ),
    ).toEqual(["2026-07-01", "2026-06-28", "2026-05-02", "2026-02-14"]);
  });

  it("por nombre ordena alfabéticamente", () => {
    expect(names(filterSystems(SYSTEMS, query({ sort: "name", dir: "asc" })))).toEqual(
      [
        "Asistente de atención",
        "Cribado de CVs — ATS",
        "Detección de emociones",
        "Traductor interno",
      ],
    );
  });

  it("los empates se rompen por nombre, siempre igual", () => {
    // Sin desempate, dos sistemas del mismo riesgo pueden intercambiarse entre
    // renders y la tabla parece inquieta sin que nadie haya tocado nada.
    const empates: AiSystem[] = [
      sys({ id: "A", name: "Zeta", risk: "high", compliance: 50 }),
      sys({ id: "B", name: "Alfa", risk: "high", compliance: 50 }),
      sys({ id: "C", name: "Mu", risk: "high", compliance: 50 }),
    ];
    expect(names(filterSystems(empates, query()))).toEqual(["Alfa", "Mu", "Zeta"]);
    expect(names(filterSystems([...empates].reverse(), query()))).toEqual([
      "Alfa",
      "Mu",
      "Zeta",
    ]);
  });

  it("no reordena el array de entrada", () => {
    // En modo demo la lista es el módulo compartido `AI_SYSTEMS`: ordenarla
    // in situ cambiaría el orden en TODAS las demás páginas.
    const original = [...SYSTEMS];
    filterSystems(SYSTEMS, query({ sort: "name", dir: "asc" }));
    expect(SYSTEMS).toEqual(original);
  });
});

describe("construcción de enlaces", () => {
  it("sin filtros la URL es limpia, sin parámetros redundantes", () => {
    expect(buildInventoryHref(DEFAULT_QUERY)).toBe("/dashboard/inventario");
  });

  it("omite el orden cuando coincide con el natural de esa columna", () => {
    expect(buildInventoryHref(query({ sort: "name", dir: "asc" }))).toBe(
      "/dashboard/inventario?sort=name",
    );
    expect(buildInventoryHref(query({ sort: "name", dir: "desc" }))).toBe(
      "/dashboard/inventario?sort=name&dir=desc",
    );
  });

  it("conserva los filtros vigentes al aplicar un parche", () => {
    const href = buildInventoryHref(query({ q: "ats", risk: "high" }), {
      evidence: "none",
    });
    expect(href).toContain("q=ats");
    expect(href).toContain("risk=high");
    expect(href).toContain("evidence=none");
  });

  it("un parche a null quita ese filtro", () => {
    expect(buildInventoryHref(query({ risk: "high" }), { risk: null })).toBe(
      "/dashboard/inventario",
    );
  });

  it("sortHref invierte la dirección si ya se ordena por esa columna", () => {
    const q = query({ sort: "name", dir: "asc" });
    expect(sortHref(q, "name")).toBe("/dashboard/inventario?sort=name&dir=desc");
  });

  it("sortHref entra por la dirección natural en una columna nueva", () => {
    const q = query({ sort: "name", dir: "asc" });
    expect(sortHref(q, "readiness")).toBe("/dashboard/inventario?sort=readiness");
    expect(DEFAULT_DIR.readiness).toBe("asc");
  });

  it("el ida y vuelta URL → query → URL no pierde nada", () => {
    const original = query({ q: "ats", risk: "high", sort: "readiness", dir: "desc" });
    const href = buildInventoryHref(original);
    const params = Object.fromEntries(
      new URLSearchParams(href.split("?")[1] ?? ""),
    );
    expect(parseInventoryQuery(params)).toEqual(original);
  });
});
