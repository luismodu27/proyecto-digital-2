import { describe, expect, it } from "vitest";
import {
  SIGNING_KEY_ENV,
  generateKeyPairForEnv,
  keyFingerprint,
  loadSigningKey,
  signBytes,
  verifyBytes,
} from "./signature";
import { buildManifest, manifestBytes } from "./manifest";

/**
 * Aquí no se prueba "que Ed25519 funcione" —eso lo garantiza Web Crypto— sino
 * las decisiones NUESTRAS alrededor: que sin clave se degrade en vez de
 * inventarse una, que una clave a medias falle ruidosamente, y que un paquete
 * manipulado no cuele.
 */

async function envWithKey() {
  const kp = await generateKeyPairForEnv();
  return {
    env: {
      [SIGNING_KEY_ENV]: kp.privateKeyBase64,
      [`${SIGNING_KEY_ENV}_PUBLIC`]: kp.publicKeyBase64,
    },
    kp,
  };
}

describe("carga de la clave", () => {
  it("sin clave devuelve null: es un estado válido, no un error", async () => {
    await expect(loadSigningKey({})).resolves.toBeNull();
    await expect(loadSigningKey({ [SIGNING_KEY_ENV]: "   " })).resolves.toBeNull();
  });

  /**
   * EL QUE IMPORTA. Si hay clave privada pero falta la pública, degradar a "sin
   * firma" en silencio sería lo peor: quien la configuró cree estar firmando, y
   * nadie podría verificar nada. Tiene que romper.
   */
  it("con clave privada pero sin pública, LANZA en vez de degradar en silencio", async () => {
    const { kp } = await envWithKey();
    await expect(
      loadSigningKey({ [SIGNING_KEY_ENV]: kp.privateKeyBase64 }),
    ).rejects.toThrow(/PUBLIC/);
  });

  it("rechaza una clave pública que no es Ed25519", async () => {
    const { kp } = await envWithKey();
    await expect(
      loadSigningKey({
        [SIGNING_KEY_ENV]: kp.privateKeyBase64,
        [`${SIGNING_KEY_ENV}_PUBLIC`]: btoa("demasiado corta"),
      }),
    ).rejects.toThrow(/32 bytes/);
  });

  it("con las dos, carga y expone la huella", async () => {
    const { env, kp } = await envWithKey();
    const key = await loadSigningKey(env);
    expect(key).not.toBeNull();
    expect(key!.keyId).toBe(kp.keyId);
    expect(key!.keyId).toMatch(/^[0-9a-f]{32}$/);
  });

  it("la huella es estable y distingue claves distintas", async () => {
    const a = await generateKeyPairForEnv();
    const b = await generateKeyPairForEnv();
    expect(a.keyId).not.toBe(b.keyId);
    const raw = Uint8Array.from(atob(a.publicKeyBase64), (c) => c.charCodeAt(0));
    expect(await keyFingerprint(raw)).toBe(a.keyId);
  });
});

describe("firmar y verificar", () => {
  const bytes = () =>
    manifestBytes(
      buildManifest({
        organizationId: "org",
        organizationName: "ACME",
        generatedAt: "2026-08-04T12:00:00.000Z",
        files: [
          {
            path: "a.pdf",
            sha256: "a".repeat(64),
            bytes: 10,
            uploadedAt: "2026-08-01T00:00:00.000Z",
            attachedTo: "Art. 26",
          },
        ],
      }),
    );

  it("una firma legítima verifica", async () => {
    const { env } = await envWithKey();
    const key = (await loadSigningKey(env))!;
    const data = bytes();
    const block = await signBytes(key, data);
    expect(await verifyBytes(block, data)).toBe(true);
  });

  it("si cambia UN byte del manifiesto, no verifica", async () => {
    const { env } = await envWithKey();
    const key = (await loadSigningKey(env))!;
    const data = bytes();
    const block = await signBytes(key, data);
    const alterado = new Uint8Array(data);
    alterado[alterado.length - 2] ^= 0x01;
    expect(await verifyBytes(block, alterado)).toBe(false);
  });

  /**
   * EL ATAQUE REAL. Alguien altera un archivo, recalcula el manifiesto, se firma
   * el paquete con SU propia clave y sustituye la pública del bloque. Sin
   * comprobar que la huella corresponda a la clave incluida, el paquete se
   * verificaría solo y parecería válido — con un `keyId` que ya no es el de
   * Attesta pero que nadie mira.
   */
  it("no cuela sustituir la clave pública por otra dejando el keyId de Attesta", async () => {
    const legitima = await envWithKey();
    const impostora = await envWithKey();
    const keyLeg = (await loadSigningKey(legitima.env))!;
    const keyImp = (await loadSigningKey(impostora.env))!;

    const data = bytes();
    const bloqueImpostor = await signBytes(keyImp, data);
    // Firma válida bajo la clave del impostor, pero con el keyId de Attesta.
    const falsificado = { ...bloqueImpostor, keyId: keyLeg.keyId };
    expect(await verifyBytes(falsificado, data)).toBe(false);
  });

  it("una firma de otra clave no verifica", async () => {
    const a = (await loadSigningKey((await envWithKey()).env))!;
    const b = (await loadSigningKey((await envWithKey()).env))!;
    const data = bytes();
    const blockA = await signBytes(a, data);
    const blockB = await signBytes(b, data);
    expect(await verifyBytes({ ...blockA, signature: blockB.signature }, data)).toBe(false);
  });

  it("un algoritmo distinto se rechaza sin mirar nada más", async () => {
    const { env } = await envWithKey();
    const key = (await loadSigningKey(env))!;
    const data = bytes();
    const block = await signBytes(key, data);
    expect(
      await verifyBytes({ ...block, algorithm: "RSA" as unknown as "Ed25519" }, data),
    ).toBe(false);
  });

  /** Basura de entrada = "no me fío", no una excepción que tumbe la página. */
  it("no lanza ante base64 corrupto: devuelve false", async () => {
    const data = bytes();
    await expect(
      verifyBytes(
        { algorithm: "Ed25519", keyId: "x".repeat(32), publicKey: "no-es-base64!!", signature: "%%%" },
        data,
      ),
    ).resolves.toBe(false);
  });

  it("el bloque de firma es autocontenido (lleva la clave para poder verificar sin red)", async () => {
    const { env } = await envWithKey();
    const key = (await loadSigningKey(env))!;
    const block = await signBytes(key, bytes());
    expect(block.publicKey.length).toBeGreaterThan(40);
    expect(block.signature.length).toBeGreaterThan(80);
    expect(block.algorithm).toBe("Ed25519");
  });
});
