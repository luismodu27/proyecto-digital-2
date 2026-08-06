import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildManifest, canonicalJson, manifestBytes } from "./manifest";
import { generateKeyPairForEnv, loadSigningKey, signBytes, SIGNING_KEY_ENV } from "./signature";
import { buildZip, type ZipEntry } from "./zip";
import { packagePath, sha256Hex, type EvidenceFile } from "./files";
import { VERIFY_README } from "./readme";

/**
 * LA PRUEBA QUE JUSTIFICA EL VAULT ENTERO.
 *
 * Todo lo demás son tests de unidad sobre piezas nuestras, verificadas por
 * código nuestro. Esto arma un paquete completo —igual que la ruta de descarga—
 * y lo verifica con **OpenSSL**, que no es JavaScript, no es nuestro y es lo que
 * de verdad tendrá delante un auditor.
 *
 * Si esto pasa, la afirmación «cualquiera puede comprobar este paquete por su
 * cuenta» deja de ser una promesa de la landing y pasa a ser un hecho medido.
 */

const enc = (s: string) => new TextEncoder().encode(s);

/**
 * Envuelve una clave Ed25519 cruda (32 bytes) en el PEM que OpenSSL espera.
 * El prefijo DER de una SubjectPublicKeyInfo de Ed25519 es fijo, así que no hace
 * falta un codificador ASN.1 para esto.
 */
function pemPublicKey(raw: Uint8Array): string {
  const prefix = Buffer.from("302a300506032b6570032100", "hex");
  const der = Buffer.concat([prefix, Buffer.from(raw)]);
  const b64 = der.toString("base64").replace(/(.{64})/g, "$1\n");
  return `-----BEGIN PUBLIC KEY-----\n${b64}\n-----END PUBLIC KEY-----\n`;
}

async function armarPaquete(alterarUnByte = false) {
  const kp = await generateKeyPairForEnv();
  const key = (await loadSigningKey({
    [SIGNING_KEY_ENV]: kp.privateKeyBase64,
    [`${SIGNING_KEY_ENV}_PUBLIC`]: kp.publicKeyBase64,
  }))!;

  const contenidos = [
    { nombre: "politica-de-ia.pdf", datos: enc("%PDF-1.4 política de uso de IA") },
    { nombre: "registro supervisión.csv", datos: enc("fecha;revisor;resultado\n2026-08-01;Ana;ok") },
  ];

  const files: EvidenceFile[] = [];
  for (const [i, c] of contenidos.entries()) {
    files.push({
      id: `${"0".repeat(7)}${i}-1111-2222-3333-444444444444`,
      filename: c.nombre,
      mime: "application/octet-stream",
      bytes: c.datos.length,
      sha256: await sha256Hex(c.datos),
      uploadedAt: `2026-08-0${i + 1}T10:00:00.000Z`,
      attachedTo: `Art. 2${i} · Requisito`,
      gapItemId: null,
      aiSystemId: "sys",
      storagePath: `org/${i}`,
    });
  }

  const generatedAt = "2026-08-04T12:00:00.000Z";
  const manifest = buildManifest({
    organizationId: "11111111-1111-1111-1111-111111111111",
    organizationName: "ACME, S.L.",
    generatedAt,
    files: files.map((f) => ({
      path: packagePath(f),
      filename: f.filename,
      sha256: f.sha256,
      bytes: f.bytes,
      uploadedAt: f.uploadedAt,
      attachedTo: f.attachedTo,
    })),
  });

  const block = await signBytes(key, manifestBytes(manifest));

  const entries: ZipEntry[] = files.map((f, i) => ({
    path: packagePath(f),
    // La alteración simula lo único que este sistema existe para detectar: que
    // alguien cambie un documento después de que Attesta diera fe de su hash.
    data:
      alterarUnByte && i === 0
        ? enc("%PDF-1.4 política de uso de IA MANIPULADA")
        : contenidos[i].datos,
  }));
  entries.push({ path: "manifest.json", data: enc(JSON.stringify(manifest, null, 2)) });
  entries.push({ path: "manifest.canonical.json", data: enc(canonicalJson(manifest)) });
  entries.push({ path: "signature.json", data: enc(JSON.stringify(block, null, 2)) });
  entries.push({ path: "LEEME-verificacion.txt", data: enc(VERIFY_README(true)) });

  return { zip: buildZip(entries, new Date(generatedAt)), publicKeyRaw: key.publicKeyRaw };
}

function extraer(zip: Uint8Array): string {
  const dir = mkdtempSync(join(tmpdir(), "attesta-pkg-"));
  writeFileSync(join(dir, "p.zip"), zip);
  execFileSync("unzip", ["-q", "-o", join(dir, "p.zip"), "-d", dir]);
  return dir;
}

describe("paquete de auditoría · verificado por herramientas ajenas", () => {
  it("OpenSSL valida la firma del manifiesto", async () => {
    const { zip, publicKeyRaw } = await armarPaquete();
    const dir = extraer(zip);
    try {
      writeFileSync(join(dir, "pub.pem"), pemPublicKey(publicKeyRaw));
      const firma = JSON.parse(readFileSync(join(dir, "signature.json"), "utf8"));
      writeFileSync(join(dir, "sig.bin"), Buffer.from(firma.signature, "base64"));

      // `openssl pkeyutl -verify` con Ed25519: exactamente lo que haría alguien
      // que solo tiene el paquete y la clave pública.
      const salida = execFileSync(
        "openssl",
        [
          "pkeyutl", "-verify", "-pubin",
          "-inkey", join(dir, "pub.pem"),
          "-rawin", "-in", join(dir, "manifest.canonical.json"),
          "-sigfile", join(dir, "sig.bin"),
        ],
        { encoding: "utf8" },
      );
      expect(salida).toContain("Signature Verified Successfully");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("los hashes del manifiesto cuadran con los archivos del ZIP", async () => {
    const { zip } = await armarPaquete();
    const dir = extraer(zip);
    try {
      const manifest = JSON.parse(readFileSync(join(dir, "manifest.canonical.json"), "utf8"));
      for (const f of manifest.files) {
        const real = execFileSync("sha256sum", [join(dir, f.path)], { encoding: "utf8" })
          .split(" ")[0];
        expect(real, f.path).toBe(f.sha256);
      }
      expect(manifest.files.length).toBe(2);
      expect(manifest.truncated).toBeNull();

      /**
       * De extremo a extremo, la propiedad que hace que el bucle de arriba
       * funcione en CUALQUIER máquina: la ruta del manifiesto es la misma que
       * `unzip` deja en el disco porque es ASCII, y el nombre original —con su
       * acento— no se ha perdido, viaja en `filename`.
       *
       * Antes de esto, «registro supervisión.csv» se extraía como
       * «registro supervisi├│n.csv» en un entorno sin locale UTF-8 y `sha256sum`
       * respondía «No such file or directory» sobre un paquete impecable.
       */
      for (const f of manifest.files) {
        expect(f.path, "la ruta del ZIP debe ser ASCII").toMatch(/^[\x20-\x7e]+$/);
      }
      expect(manifest.files.map((f: { filename: string }) => f.filename)).toContain(
        "registro supervisión.csv",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  /**
   * EL ATAQUE QUE EL PRODUCTO EXISTE PARA DETECTAR: alguien cambia un documento
   * dentro del paquete después de recibirlo. La firma seguirá siendo válida
   * (el manifiesto no se tocó), pero el hash del archivo ya no cuadra — que es
   * justo lo que descubre el paso 1 del README.
   */
  it("un documento alterado se detecta al comparar su hash", async () => {
    const { zip } = await armarPaquete(true);
    const dir = extraer(zip);
    try {
      const manifest = JSON.parse(readFileSync(join(dir, "manifest.canonical.json"), "utf8"));
      const discrepancias = manifest.files.filter((f: { path: string; sha256: string }) => {
        const real = execFileSync("sha256sum", [join(dir, f.path)], { encoding: "utf8" }).split(" ")[0];
        return real !== f.sha256;
      });
      expect(discrepancias).toHaveLength(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("el README con las instrucciones viaja dentro del paquete", async () => {
    const { zip } = await armarPaquete();
    const dir = extraer(zip);
    try {
      const readme = readFileSync(join(dir, "LEEME-verificacion.txt"), "utf8");
      expect(readme).toContain("QUÉ NO AFIRMA");
      expect(readme).toContain("No es una certificación");
      expect(readme).toContain("sha256");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
