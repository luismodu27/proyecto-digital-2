/**
 * Firma del paquete de auditoría (Ed25519).
 *
 * POR QUÉ Ed25519 Y NO RSA: la clave pública son 32 bytes y la firma 64. Caben
 * en una línea de texto, lo que permite que un auditor verifique un paquete con
 * un script de diez líneas y sin instalar nada. Una verificación que exige montar
 * un entorno no la hace nadie, y una verificación que nadie hace no defiende nada.
 * Además está en Web Crypto nativo: cero dependencias en la pieza más sensible
 * del producto.
 *
 * LA CLAVE PRIVADA NO TIENE VALOR POR DEFECTO, igual que el dominio público y la
 * identidad del responsable. Sin `VAULT_SIGNING_KEY` el paquete se genera IGUAL,
 * pero SIN firma y diciéndolo en el propio manifiesto y en la interfaz. La
 * alternativa —generar una clave al vuelo— sería mucho peor: cada despliegue
 * firmaría con una clave distinta, ninguna verificaría, y el producto estaría
 * emitiendo firmas que no significan nada. Una firma que no se puede comprobar es
 * peor que ninguna firma, porque aparenta garantía.
 *
 * QUÉ PASA SI LA CLAVE SE FILTRA: quien la tenga puede fabricar paquetes que
 * parezcan emitidos por Attesta. Por eso el material de clave vive solo en una
 * variable de entorno de servidor, nunca en el repositorio ni en el cliente, y
 * por eso el manifiesto incluye la huella de la clave (`keyId`): al rotar, los
 * paquetes viejos siguen siendo verificables con la clave vieja publicada, y se
 * puede decir a partir de qué fecha dejó de ser de fiar una clave concreta.
 */

/** Nombre de la variable de entorno con la clave privada (PKCS#8, base64). */
export const SIGNING_KEY_ENV = "VAULT_SIGNING_KEY";

export type SignatureBlock = {
  algorithm: "Ed25519";
  /** Huella de la clave pública: primeros 16 bytes del SHA-256, en hex. */
  keyId: string;
  /** Clave pública en base64 (raw, 32 bytes), para verificar sin salir del ZIP. */
  publicKey: string;
  /** Firma en base64 (64 bytes) sobre los bytes canónicos del manifiesto. */
  signature: string;
};

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const b of view) binary += String.fromCharCode(b);
  return btoa(binary);
}

/**
 * El tipo de retorno lleva `<ArrayBuffer>` explícito, y no es cosmética: sin él,
 * TypeScript infiere `Uint8Array<ArrayBufferLike>`, que incluye `SharedArrayBuffer`
 * y que Web Crypto rechaza. El error sale en el punto de uso y no aquí, que es
 * donde de verdad está.
 */
function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value.trim());
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/** Huella estable de una clave pública. Se publica junto a ella. */
export async function keyFingerprint(publicKeyRaw: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", publicKeyRaw);
  return Array.from(new Uint8Array(digest).slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type SigningKey = {
  privateKey: CryptoKey;
  publicKeyRaw: Uint8Array<ArrayBuffer>;
  keyId: string;
};

/**
 * Carga la clave privada del entorno. Devuelve `null` si no hay clave — que es
 * un estado válido y esperado, no un error.
 *
 * Lanza SOLO si hay una clave pero es inválida: eso sí es un fallo de
 * configuración que debe verse en el acto y no degradar a "sin firma" en
 * silencio, porque quien la puso creía estar firmando.
 */
export async function loadSigningKey(env: Record<string, string | undefined>): Promise<SigningKey | null> {
  const raw = env[SIGNING_KEY_ENV]?.trim();
  if (!raw) return null;

  const pkcs8 = fromBase64(raw);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8,
    { name: "Ed25519" },
    false,
    ["sign"],
  );

  // La pública se deriva de la privada en el momento de generar la clave, no
  // aquí: Web Crypto no permite extraerla de una PKCS#8 importada. Por eso el
  // formato de la variable lleva las dos partes separadas por un punto.
  const publicRaw = env[`${SIGNING_KEY_ENV}_PUBLIC`]?.trim();
  if (!publicRaw) {
    throw new Error(
      `${SIGNING_KEY_ENV} está definida pero falta ${SIGNING_KEY_ENV}_PUBLIC. Sin la clave pública, nadie podría verificar lo que firmes.`,
    );
  }
  const publicKeyRaw = fromBase64(publicRaw);
  if (publicKeyRaw.length !== 32) {
    throw new Error(`${SIGNING_KEY_ENV}_PUBLIC no es una clave Ed25519 (se esperaban 32 bytes, hay ${publicKeyRaw.length}).`);
  }

  return { privateKey, publicKeyRaw, keyId: await keyFingerprint(publicKeyRaw) };
}

/** Firma unos bytes y devuelve el bloque que se guarda junto al manifiesto. */
export async function signBytes(
  key: SigningKey,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<SignatureBlock> {
  const signature = await crypto.subtle.sign({ name: "Ed25519" }, key.privateKey, bytes);
  return {
    algorithm: "Ed25519",
    keyId: key.keyId,
    publicKey: toBase64(key.publicKeyRaw),
    signature: toBase64(signature),
  };
}

/**
 * Verifica un bloque de firma contra unos bytes. Devuelve `false` ante cualquier
 * problema en vez de lanzar: quien verifica quiere un sí o un no, y una excepción
 * por un base64 mal formado no debe distinguirse de una firma falsa — ambas
 * significan "no me fío de esto".
 */
export async function verifyBytes(
  block: SignatureBlock,
  bytes: Uint8Array<ArrayBuffer>,
): Promise<boolean> {
  try {
    if (block.algorithm !== "Ed25519") return false;
    const publicKeyRaw = fromBase64(block.publicKey);
    if (publicKeyRaw.length !== 32) return false;

    // La huella tiene que corresponder a la clave incluida. Sin esto, alguien
    // podría cambiar la clave pública del paquete por la suya, firmar con la
    // suya, y el paquete se verificaría solo — quedando aparentemente válido
    // mientras el `keyId` seguiría diciendo el de Attesta.
    if ((await keyFingerprint(publicKeyRaw)) !== block.keyId) return false;

    const publicKey = await crypto.subtle.importKey(
      "raw",
      publicKeyRaw,
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    return await crypto.subtle.verify(
      { name: "Ed25519" },
      publicKey,
      fromBase64(block.signature),
      bytes,
    );
  } catch {
    return false;
  }
}

/**
 * Genera un par de claves nuevo y lo devuelve listo para pegar en el entorno.
 * Se usa desde `npm run vault:keygen`; no lo llama la aplicación.
 */
export async function generateKeyPairForEnv(): Promise<{
  privateKeyBase64: string;
  publicKeyBase64: string;
  keyId: string;
}> {
  const kp = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
  const raw = await crypto.subtle.exportKey("raw", kp.publicKey);
  return {
    privateKeyBase64: toBase64(pkcs8),
    publicKeyBase64: toBase64(raw),
    keyId: await keyFingerprint(new Uint8Array(raw) as Uint8Array<ArrayBuffer>),
  };
}
