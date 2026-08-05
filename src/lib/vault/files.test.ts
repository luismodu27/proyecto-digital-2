import { describe, expect, it } from "vitest";
import {
  MAX_FILE_BYTES,
  MAX_PACKAGE_BYTES,
  packagePath,
  safeFilename,
  selectForPackage,
  sha256Hex,
  validateUpload,
  type EvidenceFile,
} from "./files";

const file = (over: Partial<EvidenceFile> = {}): EvidenceFile => ({
  id: "11111111-2222-3333-4444-555555555555",
  filename: "politica.pdf",
  mime: "application/pdf",
  bytes: 1000,
  sha256: "a".repeat(64),
  uploadedAt: "2026-08-01T00:00:00.000Z",
  attachedTo: "Art. 26",
  gapItemId: null,
  aiSystemId: "sys",
  storagePath: "org/abc.pdf",
  ...over,
});

describe("safeFilename", () => {
  it("deja en paz un nombre normal", () => {
    expect(safeFilename("Política de RRHH.pdf")).toBe("Política de RRHH.pdf");
  });

  /**
   * EL QUE IMPORTA: «zip slip». Un nombre con `../` dentro de un ZIP puede
   * escribir fuera de la carpeta al extraerse. Y este ZIP lo abre un auditor en
   * su máquina, que es exactamente el trayecto donde eso hace daño.
   */
  it("desactiva el recorrido de rutas", () => {
    // El punto inicial se cae después, por la regla de "no empezar por punto".
    expect(safeFilename("../../etc/passwd")).toBe("_._etc_passwd");
    expect(safeFilename("..\\..\\windows\\system32")).toBe("_._windows_system32");
    expect(safeFilename("../../etc/passwd")).not.toContain("..");
    expect(safeFilename("../../etc/passwd")).not.toContain("/");
    expect(safeFilename("a/b/c.pdf")).toBe("a_b_c.pdf");
  });

  it("no deja que empiece por punto (ficheros ocultos)", () => {
    expect(safeFilename(".bashrc")).toBe("bashrc");
    expect(safeFilename("   .oculto.txt")).toBe("oculto.txt");
  });

  it("quita caracteres de control pero respeta los espacios normales", () => {
    expect(safeFilename("mal\u0000nom\u001fbre.pdf")).toBe("malnombre.pdf");
    // El espacio NO es un carácter de control. La primera versión de la clase
    // acabó siendo un rango que se comía el espacio, y eso destroza los nombres
    // reales ("Informe anual 2026.pdf").
    expect(safeFilename("Informe anual 2026.pdf")).toBe("Informe anual 2026.pdf");
  });

  it("acota la longitud", () => {
    expect(safeFilename("x".repeat(500)).length).toBe(120);
  });

  it("nunca devuelve una cadena vacía", () => {
    expect(safeFilename("")).toBe("archivo");
    expect(safeFilename("...")).toBe("archivo");
    expect(safeFilename("///")).toBe("archivo");
  });
});

describe("packagePath", () => {
  it("mete el id delante para que dos archivos con el mismo nombre no choquen", () => {
    const a = packagePath(file({ id: "aaaaaaaa-0000-0000-0000-000000000000" }));
    const b = packagePath(file({ id: "bbbbbbbb-0000-0000-0000-000000000000" }));
    expect(a).not.toBe(b);
    expect(a).toBe("evidencia/aaaaaaaa-politica.pdf");
  });

  it("la ruta del ZIP no puede escapar de la carpeta", () => {
    const ruta = packagePath(file({ filename: "../../evil.sh" }));
    expect(ruta).toBe("evidencia/11111111-_._evil.sh");
    expect(ruta.startsWith("evidencia/")).toBe(true);
    expect(ruta).not.toContain("..");
  });
});

describe("sha256Hex", () => {
  it("coincide con el vector conocido de 'abc'", async () => {
    expect(await sha256Hex(new TextEncoder().encode("abc"))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("la cadena vacía también tiene su hash conocido", async () => {
    expect(await sha256Hex(new Uint8Array(0))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("sale en minúsculas y con 64 caracteres (lo que exige el CHECK de la 0038)", async () => {
    const h = await sha256Hex(new TextEncoder().encode("x"));
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  /**
   * Una vista sobre un búfer mayor haría que se hasheara de más — un fallo
   * silencioso que produciría hashes que no cuadran con el archivo real.
   */
  it("hashea SOLO la vista, no el búfer entero que la contiene", async () => {
    const grande = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const vista = grande.subarray(0, 3);
    expect(await sha256Hex(vista)).toBe(await sha256Hex(new Uint8Array([1, 2, 3])));
  });
});

describe("validateUpload", () => {
  const anchor = { aiSystemId: "sys" };

  it("acepta lo razonable", () => {
    expect(validateUpload(1000, anchor)).toBeNull();
    expect(validateUpload(MAX_FILE_BYTES, anchor)).toBeNull();
  });

  it("rechaza el archivo vacío", () => {
    expect(validateUpload(0, anchor)).toBe("empty");
    expect(validateUpload(-1, anchor)).toBe("empty");
    expect(validateUpload(NaN, anchor)).toBe("empty");
  });

  it("rechaza por encima del tope, que es el mismo que el de la migración", () => {
    expect(validateUpload(MAX_FILE_BYTES + 1, anchor)).toBe("too-large");
  });

  it("rechaza un archivo sin anclaje: nadie lo encontraría", () => {
    expect(validateUpload(100, {})).toBe("no-anchor");
    expect(validateUpload(100, { gapItemId: null, aiSystemId: null })).toBe("no-anchor");
  });

  it("basta con uno de los dos anclajes", () => {
    expect(validateUpload(100, { gapItemId: "g" })).toBeNull();
  });
});

describe("selectForPackage", () => {
  it("si cabe todo, entra todo y no se omite nada", () => {
    const r = selectForPackage([file({ id: "a", bytes: 10 }), file({ id: "b", bytes: 20 })]);
    expect(r.included).toHaveLength(2);
    expect(r.omitted).toBe(0);
  });

  /** NINGÚN CORTE EN SILENCIO: el que no cabe se cuenta y se declara. */
  it("cuando no cabe todo, dice cuántos quedaron fuera", () => {
    const files = [
      file({ id: "a", bytes: 60, uploadedAt: "2026-08-03T00:00:00.000Z" }),
      file({ id: "b", bytes: 60, uploadedAt: "2026-08-02T00:00:00.000Z" }),
      file({ id: "c", bytes: 10, uploadedAt: "2026-08-01T00:00:00.000Z" }),
    ];
    const r = selectForPackage(files, 100);
    expect(r.included.map((f) => f.id)).toEqual(["a", "c"]);
    expect(r.omitted).toBe(1);
  });

  it("prioriza lo más reciente", () => {
    const files = [
      file({ id: "viejo", bytes: 100, uploadedAt: "2020-01-01T00:00:00.000Z" }),
      file({ id: "nuevo", bytes: 100, uploadedAt: "2026-01-01T00:00:00.000Z" }),
    ];
    expect(selectForPackage(files, 100).included.map((f) => f.id)).toEqual(["nuevo"]);
  });

  it("no muta la lista que recibe", () => {
    const files = [file({ id: "a", uploadedAt: "2020-01-01T00:00:00.000Z" }), file({ id: "b" })];
    selectForPackage(files, 10_000);
    expect(files[0].id).toBe("a");
  });

  it("un archivo que por sí solo no cabe no bloquea a los siguientes", () => {
    const files = [
      file({ id: "enorme", bytes: 999, uploadedAt: "2026-08-03T00:00:00.000Z" }),
      file({ id: "pequeño", bytes: 5, uploadedAt: "2026-08-02T00:00:00.000Z" }),
    ];
    const r = selectForPackage(files, 100);
    expect(r.included.map((f) => f.id)).toEqual(["pequeño"]);
    expect(r.omitted).toBe(1);
  });

  it("el tope del paquete es mayor que el de un archivo suelto", () => {
    expect(MAX_PACKAGE_BYTES).toBeGreaterThan(MAX_FILE_BYTES);
  });
});
