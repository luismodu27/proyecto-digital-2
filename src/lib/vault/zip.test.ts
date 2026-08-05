import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildZip } from "./zip";

/**
 * LA PRUEBA QUE DE VERDAD VALE ESTÁ AL FINAL: el ZIP se abre con `unzip` y con
 * la librería de Python, dos implementaciones ajenas.
 *
 * Comprobar un formato binario con el parser que uno mismo ha escrito no
 * demuestra nada: si el escritor pone mal un desplazamiento y el lector lo lee
 * igual de mal, el test pasa y el paquete es ilegible para el auditor. Y de un
 * paquete de auditoría, lo único que importa es que lo pueda abrir OTRO.
 */

const enc = (s: string) => new TextEncoder().encode(s);
const FECHA = new Date("2026-08-04T12:00:00.000Z");

function extraerCon(nombre: "unzip" | "python", zip: Uint8Array): Record<string, string> {
  const dir = mkdtempSync(join(tmpdir(), "attesta-zip-"));
  const ruta = join(dir, "p.zip");
  writeFileSync(ruta, zip);
  try {
    if (nombre === "unzip") {
      // `-p` vuelca a stdout; se listan y se leen uno a uno para poder mapear.
      const lista = execFileSync("unzip", ["-Z1", ruta], { encoding: "utf8" })
        .split("\n")
        .filter(Boolean);
      const out: Record<string, string> = {};
      for (const f of lista) {
        out[f] = execFileSync("unzip", ["-p", ruta, f], { encoding: "utf8" });
      }
      return out;
    }
    const salida = execFileSync(
      "python3",
      [
        "-c",
        `import zipfile,json,sys
z=zipfile.ZipFile(sys.argv[1])
bad=z.testzip()
if bad: raise SystemExit("CRC malo en "+bad)
print(json.dumps({n:z.read(n).decode("utf8") for n in z.namelist()}))`,
        ruta,
      ],
      { encoding: "utf8" },
    );
    return JSON.parse(salida);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("buildZip", () => {
  it("un ZIP vacío es válido", () => {
    const zip = buildZip([], FECHA);
    expect(zip.length).toBe(22); // solo el fin del directorio central
    expect(extraerCon("python", zip)).toEqual({});
  });

  it("rechaza rutas duplicadas en vez de producir un ZIP ambiguo", () => {
    expect(() =>
      buildZip(
        [
          { path: "a.txt", data: enc("uno") },
          { path: "a.txt", data: enc("dos") },
        ],
        FECHA,
      ),
    ).toThrow(/duplicada/);
  });

  /**
   * Determinismo: empaquetar dos veces el mismo contenido da bytes idénticos.
   * Es lo que permite comparar dos paquetes y demostrar que son el mismo — que es
   * exactamente lo que se le pide a un archivo de evidencia.
   */
  it("es determinista: mismo contenido y misma fecha, mismos bytes", () => {
    const entradas = [
      { path: "manifest.json", data: enc('{"a":1}') },
      { path: "evidencia/x.txt", data: enc("hola") },
    ];
    const a = buildZip(entradas, FECHA);
    const b = buildZip(entradas, FECHA);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  });

  it("cambia si cambia el contenido", () => {
    const a = buildZip([{ path: "x.txt", data: enc("hola") }], FECHA);
    const b = buildZip([{ path: "x.txt", data: enc("holA") }], FECHA);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
  });
});

describe("buildZip · lo abre software ajeno", () => {
  const entradas = [
    { path: "manifest.json", data: enc('{"format":"attesta-audit-package"}') },
    { path: "evidencia/política de RRHH.pdf", data: enc("contenido con acentos: ñáéíóú") },
    { path: "evidencia/sub/carpeta/otro.txt", data: enc("anidado") },
    { path: "vacio.txt", data: new Uint8Array(0) },
  ];

  it("`unzip` lo extrae con el contenido intacto", () => {
    const salida = extraerCon("unzip", buildZip(entradas, FECHA));
    expect(Object.keys(salida).sort()).toEqual(entradas.map((e) => e.path).sort());
    expect(salida["evidencia/política de RRHH.pdf"]).toBe("contenido con acentos: ñáéíóú");
    expect(salida["vacio.txt"]).toBe("");
  });

  /**
   * `testzip()` de Python comprueba el CRC32 de cada entrada. Si el CRC estuviera
   * mal calculado, `unzip` podría no quejarse pero esto sí: es la comprobación
   * que detecta que el paquete se corrompió por el camino.
   */
  it("Python valida el CRC de cada entrada", () => {
    const salida = extraerCon("python", buildZip(entradas, FECHA));
    expect(salida["evidencia/sub/carpeta/otro.txt"]).toBe("anidado");
    expect(salida["manifest.json"]).toContain("attesta-audit-package");
  });

  it("aguanta un archivo binario con todos los bytes posibles", () => {
    const binario = new Uint8Array(256);
    for (let i = 0; i < 256; i++) binario[i] = i;
    const zip = buildZip([{ path: "bin.dat", data: binario }], FECHA);
    const dir = mkdtempSync(join(tmpdir(), "attesta-zip-"));
    const ruta = join(dir, "p.zip");
    writeFileSync(ruta, zip);
    try {
      const hex = execFileSync(
        "python3",
        [
          "-c",
          `import zipfile,sys
z=zipfile.ZipFile(sys.argv[1])
assert z.testzip() is None
print(z.read("bin.dat").hex())`,
          ruta,
        ],
        { encoding: "utf8" },
      ).trim();
      expect(hex).toBe(Buffer.from(binario).toString("hex"));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
