import { describe, expect, it } from "vitest";
import {
  CSV_TEMPLATE_ES,
  MAX_IMPORT_ROWS,
  detectDelimiter,
  parseSystemsCsv,
  splitCsvLine,
} from "./csv";

/**
 * El importador es la puerta de entrada del producto: si falla, la cuenta se queda
 * con el inventario vacío y nada de lo demás sirve. Y los CSV reales son sucios
 * (Excel español con `;`, BOM, comas dentro de comillas, filas a medias), así que
 * lo que se prueba aquí es justamente el mundo real, no el caso feliz.
 */

describe("splitCsvLine", () => {
  it("respeta las comas dentro de comillas", () => {
    expect(splitCsvLine('"Cribado de CV, v2",RRHH', ",")).toEqual([
      "Cribado de CV, v2",
      "RRHH",
    ]);
  });

  it("entiende la comilla escapada (\"\")", () => {
    expect(splitCsvLine('"Dijo ""hola""",x', ",")).toEqual(['Dijo "hola"', "x"]);
  });

  it("conserva las columnas vacías", () => {
    expect(splitCsvLine("a,,c", ",")).toEqual(["a", "", "c"]);
  });

  it("funciona con punto y coma", () => {
    expect(splitCsvLine("a;b;c", ";")).toEqual(["a", "b", "c"]);
  });
});

describe("detectDelimiter", () => {
  it("detecta el punto y coma de Excel en español", () => {
    expect(detectDelimiter("nombre;responsable;ambito")).toBe(";");
  });

  it("detecta la coma estándar y el tabulador", () => {
    expect(detectDelimiter("nombre,responsable")).toBe(",");
    expect(detectDelimiter("nombre\tresponsable")).toBe("\t");
  });

  it("una sola columna cae a coma sin romperse", () => {
    expect(detectDelimiter("nombre")).toBe(",");
  });

  it("ignora los separadores que van dentro de comillas", () => {
    // Fuera de las comillas solo hay una coma, así que gana la coma aunque el
    // texto entrecomillado esté lleno de puntos y coma.
    expect(detectDelimiter('"a;b;c",d')).toBe(",");
    // Y al contrario: aquí el separador real es el punto y coma.
    expect(detectDelimiter('"a,b,c";d')).toBe(";");
  });
});

describe("parseSystemsCsv — cabeceras del mundo real", () => {
  it("acepta la plantilla propia", () => {
    const r = parseSystemsCsv(CSV_TEMPLATE_ES);
    expect(r.headerFound).toBe(true);
    expect(r.rows).toHaveLength(2);
    expect(r.rows[0]).toMatchObject({
      name: "Cribado de CV",
      owner: "RRHH",
      vendor: "HireFlow",
      actorRole: "deployer",
    });
  });

  it("acepta cabeceras en español con acentos y mayúsculas", () => {
    const r = parseSystemsCsv("Nombre;Responsable;Ámbito;Proveedor\nATS;RRHH;Contratación;HireFlow");
    expect(r.delimiter).toBe(";");
    expect(r.rows[0]).toMatchObject({ name: "ATS", domain: "Contratación" });
  });

  it("acepta cabeceras en inglés", () => {
    const r = parseSystemsCsv("name,owner,domain,vendor\nATS,HR,Hiring,HireFlow");
    expect(r.rows[0]).toMatchObject({ name: "ATS", owner: "HR" });
  });

  it("tolera columnas desordenadas y columnas desconocidas", () => {
    const r = parseSystemsCsv(
      "proveedor,notas internas,nombre\nHireFlow,lo que sea,ATS",
    );
    expect(r.rows[0]).toMatchObject({ name: "ATS", vendor: "HireFlow" });
  });

  it("se come el BOM que añade Excel", () => {
    const r = parseSystemsCsv("﻿nombre,responsable\nATS,RRHH");
    expect(r.headerFound).toBe(true);
    expect(r.rows[0]!.name).toBe("ATS");
  });

  it("funciona con saltos de línea de Windows", () => {
    const r = parseSystemsCsv("nombre,responsable\r\nATS,RRHH\r\nChatbot,Soporte");
    expect(r.rows).toHaveLength(2);
  });

  it("sin cabecera reconocible asume el orden de la plantilla y NO pierde la 1ª fila", () => {
    const r = parseSystemsCsv("ATS,RRHH,Contratación,HireFlow\nChatbot,Soporte,,OpenAI");
    expect(r.headerFound).toBe(false);
    expect(r.rows.map((x) => x.name)).toEqual(["ATS", "Chatbot"]);
  });
});

describe("parseSystemsCsv — datos sucios", () => {
  it("informa de la fila sin nombre en vez de abortar el fichero", () => {
    const r = parseSystemsCsv("nombre,responsable\nATS,RRHH\n,Soporte\nChatbot,Soporte");
    expect(r.rows.map((x) => x.name)).toEqual(["ATS", "Chatbot"]);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toMatchObject({ code: "missing-name", line: 3 });
  });

  it("los números de línea son los que ve el usuario en su editor", () => {
    const r = parseSystemsCsv("nombre\nATS\n\n,\n");
    expect(r.errors[0]!.line).toBe(4);
  });

  it("descarta duplicados dentro del propio fichero (sin distinguir acentos ni caja)", () => {
    const r = parseSystemsCsv("nombre\nCribado de CV\ncribado de cv\nCribado de CV");
    expect(r.rows).toHaveLength(1);
    expect(r.errors.filter((e) => e.code === "duplicate-in-file")).toHaveLength(2);
  });

  it("rechaza un nombre desmesurado con su motivo", () => {
    const r = parseSystemsCsv(`nombre\n${"x".repeat(300)}`);
    expect(r.rows).toHaveLength(0);
    expect(r.errors[0]!.code).toBe("name-too-long");
  });

  it("avisa si una fila trae muchísimas más columnas que la cabecera", () => {
    const r = parseSystemsCsv(`nombre,responsable\nATS,RRHH,${"x,".repeat(20)}`);
    expect(r.errors[0]!.code).toBe("too-many-columns");
  });

  it("ignora líneas en blanco sin contarlas como error", () => {
    const r = parseSystemsCsv("nombre\n\nATS\n\n\nChatbot\n");
    expect(r.rows).toHaveLength(2);
    expect(r.errors).toHaveLength(0);
  });

  it("un fichero vacío no rompe: cero filas y sin cabecera", () => {
    for (const input of ["", "   ", "\n\n"]) {
      const r = parseSystemsCsv(input);
      expect(r.rows).toEqual([]);
      expect(r.headerFound).toBe(false);
    }
  });

  it("recorta el fichero al tope y dice cuántas filas se quedaron fuera", () => {
    const filas = Array.from({ length: MAX_IMPORT_ROWS + 7 }, (_, i) => `Sistema ${i}`);
    const r = parseSystemsCsv(["nombre", ...filas].join("\n"));
    expect(r.rows).toHaveLength(MAX_IMPORT_ROWS);
    expect(r.truncated).toBe(7);
  });
});

describe("parseSystemsCsv — rol del actor (encuadre deployer)", () => {
  it("por defecto es deployer: nuestro ICP es quien USA la IA", () => {
    const r = parseSystemsCsv("nombre,rol\nATS,\nChatbot,cualquier cosa");
    expect(r.rows.map((x) => x.actorRole)).toEqual(["deployer", "deployer"]);
  });

  it("respeta 'proveedor'/'provider' cuando el cliente lo declara", () => {
    const r = parseSystemsCsv("nombre,rol\nModelo propio,proveedor\nOtro,PROVIDER");
    expect(r.rows.map((x) => x.actorRole)).toEqual(["provider", "provider"]);
  });
});
