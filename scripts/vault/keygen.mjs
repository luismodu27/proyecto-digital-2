/**
 * Genera el par de claves con el que Attesta firma los paquetes de auditoría.
 *
 *   npm run vault:keygen
 *
 * Imprime las dos variables listas para pegar en Vercel. La privada NO se guarda
 * en ningún fichero a propósito: si se escribiera en disco acabaría en un
 * backup, en un historial de shell o en el repositorio. De la pantalla al gestor
 * de secretos, y ya está.
 */
const kp = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
const pkcs8 = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
const raw = await crypto.subtle.exportKey("raw", kp.publicKey);

const b64 = (buf) => {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s);
};

const digest = await crypto.subtle.digest("SHA-256", raw);
const keyId = Array.from(new Uint8Array(digest).slice(0, 16))
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");

console.log(`
Par de claves Ed25519 para el vault de evidencia.
Huella (keyId): ${keyId}

Pega estas dos variables en Vercel (Settings → Environment Variables),
marcadas para Production. NO las guardes en ningún fichero del proyecto.

VAULT_SIGNING_KEY=${b64(pkcs8)}
VAULT_SIGNING_KEY_PUBLIC=${b64(raw)}

Al terminar, comprueba que /api/vault/key devuelve el mismo keyId de arriba.

CUIDADO AL ROTAR: los paquetes ya entregados se verifican con la clave con la
que se firmaron. Si cambias esta, guarda la anterior: sin ella, los paquetes
antiguos dejan de poder comprobarse y parecerán inválidos.
`);
