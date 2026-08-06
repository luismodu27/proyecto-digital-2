import { loadSigningKey } from "@/lib/vault/signature";
import { logIncident } from "@/lib/observability/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Clave pública con la que Attesta firma los paquetes de auditoría.
 *
 * ES PÚBLICA A PROPÓSITO Y NO REQUIERE SESIÓN. Quien necesita comprobar una
 * firma es el AUDITOR, que no tiene cuenta en Attesta y no debería necesitarla:
 * exigirle registrarse para verificar un documento que le han entregado
 * convertiría la verificación en un trámite, y un trámite es una verificación que
 * no se hace.
 *
 * El paquete ya incluye la clave dentro de `signature.json` para poder
 * verificarlo sin red. Esta ruta sirve para lo otro, que es lo que de verdad
 * cierra el círculo: comprobar que ESA clave es la de Attesta y no la de quien
 * fabricó el paquete. Sin este contraste, un paquete autofirmado por un tercero
 * verificaría perfectamente contra su propia clave.
 */
export async function GET() {
  let key = null;
  try {
    key = await loadSigningKey(process.env as Record<string, string | undefined>);
  } catch (err) {
    logIncident("vaultKey", err);
  }

  if (!key) {
    return Response.json(
      {
        configured: false,
        note: "Attesta no tiene clave de firma configurada: los paquetes se emiten SIN firmar y lo declaran en su interior.",
      },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }

  let publicKey = "";
  for (const b of key.publicKeyRaw) publicKey += String.fromCharCode(b);

  return Response.json(
    {
      configured: true,
      algorithm: "Ed25519",
      keyId: key.keyId,
      publicKey: btoa(publicKey),
      howTo:
        "Compara este keyId con el de signature.json dentro del paquete. Si no coinciden, el paquete no lo firmó Attesta.",
    },
    {
      status: 200,
      // Cacheable: es un dato público y estable, y así un auditor que verifique
      // varios paquetes no golpea el servidor una vez por cada uno.
      headers: { "cache-control": "public, max-age=3600" },
    },
  );
}
