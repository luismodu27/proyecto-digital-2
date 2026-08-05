import { describe, expect, it } from "vitest";
import { buildManifest, canonicalJson, manifestBytes, type ManifestFile } from "./manifest";

/**
 * Lo que se protege aquí es la propiedad más frágil de todo el vault: que un
 * verificador INDEPENDIENTE —el script de un auditor, escrito en otro lenguaje—
 * reconstruya exactamente los mismos bytes y la firma cuadre.
 *
 * El modo de fallo no es una excepción: es una firma que no valida sobre un
 * paquete perfectamente legítimo. Y eso, en este contexto, se lee como una
 * acusación de fraude contra quien no ha hecho nada.
 */

const FILE: ManifestFile = {
  path: "evidencia/politica.pdf",
  sha256: "a".repeat(64),
  bytes: 1024,
  uploadedAt: "2026-08-01T10:00:00.000Z",
  attachedTo: "Art. 26 · Supervisión humana",
};

describe("canonicalJson", () => {
  it("ordena las claves alfabéticamente", () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  /**
   * EL QUE IMPORTA. `JSON.stringify(obj, Object.keys(obj).sort())` solo ordena el
   * primer nivel; los objetos anidados quedan como estén. Ese es el bug que no se
   * nota hasta que un verificador ajeno dice "firma inválida".
   */
  it("ordena también en profundidad, no solo el primer nivel", () => {
    const a = canonicalJson({ x: { z: 1, y: 2 }, w: [{ b: 1, a: 2 }] });
    const b = canonicalJson({ w: [{ a: 2, b: 1 }], x: { y: 2, z: 1 } });
    expect(a).toBe(b);
    expect(a).toBe('{"w":[{"a":2,"b":1}],"x":{"y":2,"z":1}}');
  });

  it("no mete espacios ni saltos de línea", () => {
    expect(canonicalJson({ a: [1, 2], b: "x" })).toBe('{"a":[1,2],"b":"x"}');
  });

  it("respeta el orden de los arrays (ahí el orden SÍ es contenido)", () => {
    expect(canonicalJson([3, 1, 2])).toBe("[3,1,2]");
  });

  it("escapa las cadenas como JSON", () => {
    expect(canonicalJson({ a: 'co"millas\n' })).toBe('{"a":"co\\"millas\\n"}');
    expect(canonicalJson({ a: "acentuación ñ" })).toBe('{"a":"acentuación ñ"}');
  });

  it("descarta undefined en vez de escribir basura", () => {
    expect(canonicalJson({ a: 1, b: undefined })).toBe('{"a":1}');
  });

  it("lanza ante lo que no se puede serializar (mejor romper que firmar otra cosa)", () => {
    expect(() => canonicalJson(() => 1)).toThrow();
    expect(() => canonicalJson(NaN)).toThrow();
    expect(() => canonicalJson(Infinity)).toThrow();
  });

  it("null y booleanos", () => {
    expect(canonicalJson({ a: null, b: true, c: false })).toBe('{"a":null,"b":true,"c":false}');
  });
});

describe("buildManifest", () => {
  const base = {
    organizationId: "11111111-1111-1111-1111-111111111111",
    organizationName: "ACME",
    generatedAt: "2026-08-04T12:00:00.000Z",
  };

  it("ordena los archivos por ruta, venga como venga la consulta", () => {
    const f = (path: string): ManifestFile => ({ ...FILE, path });
    const m1 = buildManifest({ ...base, files: [f("b.pdf"), f("a.pdf"), f("c.pdf")] });
    const m2 = buildManifest({ ...base, files: [f("c.pdf"), f("b.pdf"), f("a.pdf")] });
    expect(m1.files.map((x) => x.path)).toEqual(["a.pdf", "b.pdf", "c.pdf"]);
    expect(canonicalJson(m1)).toBe(canonicalJson(m2));
  });

  it("no muta el array que recibe", () => {
    const files = [{ ...FILE, path: "z.pdf" }, { ...FILE, path: "a.pdf" }];
    buildManifest({ ...base, files });
    expect(files[0].path).toBe("z.pdf");
  });

  it("cuenta archivos y bytes", () => {
    const m = buildManifest({
      ...base,
      files: [
        { ...FILE, path: "a.pdf", bytes: 100 },
        { ...FILE, path: "b.pdf", bytes: 250 },
      ],
    });
    expect(m.totals).toEqual({ files: 2, bytes: 350 });
  });

  it("un paquete vacío es válido y lo dice", () => {
    const m = buildManifest({ ...base, files: [] });
    expect(m.totals).toEqual({ files: 0, bytes: 0 });
    expect(m.files).toEqual([]);
  });

  it("declara el truncamiento en vez de callarlo", () => {
    const m = buildManifest({
      ...base,
      files: [FILE],
      truncated: { omittedFiles: 12, reason: "tope de tamaño del paquete" },
    });
    expect(m.truncated).toEqual({ omittedFiles: 12, reason: "tope de tamaño del paquete" });
  });

  /**
   * LA FRONTERA DE LA REGLA Nº 1, dentro del propio fichero. Si alguien reenvía
   * el JSON suelto, el matiz tiene que viajar con él: un paquete que se puede
   * malinterpretar fuera de su pantalla es un pasivo.
   */
  it("lleva dentro qué afirma y qué NO afirma, en los dos idiomas", () => {
    const m = buildManifest({ ...base, files: [FILE] });
    for (const locale of ["es", "en"] as const) {
      expect(m.attests[locale].length).toBeGreaterThan(40);
      expect(m.doesNotAttest[locale].length).toBeGreaterThan(40);
    }
    // Lo que afirma es CUSTODIA, no juicio.
    expect(m.attests.es.toLowerCase()).toContain("hace constar");
    expect(m.attests.es.toLowerCase()).toContain("almacenados");
    // Y lo que niega tiene que negarlo explícitamente.
    expect(m.doesNotAttest.es.toLowerCase()).toContain("no es una certificación");
    expect(m.doesNotAttest.en.toLowerCase()).toContain("not a certification");
    expect(m.doesNotAttest.es.toLowerCase()).toMatch(/no ha revisado/);
  });

  it("declara formato y versión (un verificador debe poder rechazar lo que no entienda)", () => {
    const m = buildManifest({ ...base, files: [] });
    expect(m.format).toBe("attesta-audit-package");
    expect(m.version).toBe(1);
  });
});

describe("manifestBytes", () => {
  it("es determinista: mismo manifiesto, mismos bytes", () => {
    const input = {
      organizationId: "org",
      organizationName: "ACME",
      generatedAt: "2026-08-04T12:00:00.000Z",
      files: [FILE],
    };
    const a = manifestBytes(buildManifest(input));
    const b = manifestBytes(buildManifest(input));
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  });

  it("cambia si cambia cualquier hash (si no, la firma no protegería nada)", () => {
    const input = {
      organizationId: "org",
      organizationName: "ACME",
      generatedAt: "2026-08-04T12:00:00.000Z",
      files: [FILE],
    };
    const a = manifestBytes(buildManifest(input));
    const b = manifestBytes(
      buildManifest({ ...input, files: [{ ...FILE, sha256: "b".repeat(64) }] }),
    );
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
  });
});
