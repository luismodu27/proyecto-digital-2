import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getEvidenceFiles, getOrganizationName } from "@/lib/data";
import { getActiveOrg } from "@/lib/data/context";
import { logIncident } from "@/lib/observability/log";
import { trackServer } from "@/lib/telemetry/server";
import { buildManifest, canonicalJson, manifestBytes } from "@/lib/vault/manifest";
import { loadSigningKey, signBytes } from "@/lib/vault/signature";
import { packagePath, selectForPackage, sha256Hex } from "@/lib/vault/files";
import { buildZip, type ZipEntry } from "@/lib/vault/zip";
import { VERIFY_README } from "@/lib/vault/readme";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Paquete de auditoría: un ZIP con la evidencia, su manifiesto y la firma.
 *
 * QUÉ LO HACE ÚTIL, y por qué no es «descargar los archivos en un zip». Lo que
 * se entrega no son documentos, es una AFIRMACIÓN COMPROBABLE: «estos bytes, con
 * estos hashes, estaban en la cuenta de esta organización en esta fecha», firmada
 * por Attesta. El auditor no tiene que fiarse de la empresa auditada, que es el
 * único punto de desconfianza que de verdad existe en esa mesa.
 *
 * SE VUELVE A HASHEAR AL EMPAQUETAR, aunque el hash ya esté en la base de datos.
 * Parece redundante y es justo lo contrario: si el archivo del almacenamiento
 * hubiera cambiado por debajo (un fallo, una manipulación con acceso directo),
 * el manifiesto tomado de la base de datos daría fe de algo que ya no es cierto.
 * Comparar lo que se guardó con lo que se está metiendo en el ZIP convierte el
 * empaquetado en una verificación. Los que no cuadran NO se incluyen y se
 * declaran en el manifiesto.
 *
 * SIN CLAVE DE FIRMA el paquete se genera igual, sin firma, y lo dice — en el
 * ZIP y en el nombre del fichero. Ver `signature.ts`: una firma que no se puede
 * comprobar sería peor que ninguna.
 */
export async function GET() {
  if (!isSupabaseConfigured) {
    return Response.json({ error: "modo demo: no hay vault" }, { status: 400 });
  }

  const [org, orgName] = await Promise.all([getActiveOrg(), getOrganizationName()]);
  if (!org) {
    return Response.json({ error: "no autorizado" }, { status: 401 });
  }

  const todos = await getEvidenceFiles();
  const { included, omitted } = selectForPackage(todos);

  const supabase = await createClient();
  const entries: ZipEntry[] = [];
  const manifestFiles = [];
  let alterados = 0;

  for (const file of included) {
    const dl = await supabase.storage.from("evidence").download(file.storagePath);
    if (dl.error || !dl.data) {
      logIncident("vaultPackage.download", dl.error, file.id);
      alterados++;
      continue;
    }
    const bytes = new Uint8Array(await dl.data.arrayBuffer());

    // La verificación de la que habla la cabecera: lo guardado contra lo real.
    const real = await sha256Hex(bytes);
    if (real !== file.sha256) {
      logIncident(
        "vaultPackage.mismatch",
        new Error(`hash distinto para ${file.id}: ${file.sha256} vs ${real}`),
      );
      alterados++;
      continue;
    }

    const path = packagePath(file);
    entries.push({ path, data: bytes });
    manifestFiles.push({
      path,
      sha256: file.sha256,
      bytes: file.bytes,
      uploadedAt: file.uploadedAt,
      attachedTo: file.attachedTo,
    });
  }

  const omitidosTotal = omitted + alterados;
  const generatedAt = new Date().toISOString();
  const manifest = buildManifest({
    organizationId: org,
    organizationName: orgName ?? "Organización",
    generatedAt,
    files: manifestFiles,
    truncated:
      omitidosTotal > 0
        ? {
            omittedFiles: omitidosTotal,
            reason:
              alterados > 0
                ? "archivos que superaban el tamaño del paquete o cuyo hash no coincidía con el registrado"
                : "el paquete alcanzó su tamaño máximo",
          }
        : null,
  });

  const encoder = new TextEncoder();
  entries.push({
    path: "manifest.json",
    // El manifiesto va INDENTADO para que un humano lo lea, pero lo que se firma
    // es la forma canónica. Son dos representaciones del mismo objeto y el
    // README explica cómo pasar de una a otra; guardar solo la canónica haría
    // que nadie lo abriera, y guardar solo la indentada rompería la firma.
    data: encoder.encode(JSON.stringify(manifest, null, 2)),
  });
  entries.push({
    path: "manifest.canonical.json",
    data: encoder.encode(canonicalJson(manifest)),
  });

  let firmado = false;
  try {
    const key = await loadSigningKey(process.env as Record<string, string | undefined>);
    if (key) {
      const block = await signBytes(key, manifestBytes(manifest));
      entries.push({
        path: "signature.json",
        data: encoder.encode(JSON.stringify(block, null, 2)),
      });
      firmado = true;
    }
  } catch (err) {
    // Clave mal configurada: NO se firma, pero tampoco se calla. Ver signature.ts.
    logIncident("vaultPackage.signing", err);
  }

  entries.push({
    path: "LEEME-verificacion.txt",
    data: encoder.encode(VERIFY_README(firmado)),
  });

  let zip: Uint8Array;
  try {
    // Fecha fija = paquete determinista: dos descargas del mismo contenido dan
    // bytes idénticos y se pueden comparar entre sí.
    zip = buildZip(entries, new Date(generatedAt));
  } catch (err) {
    logIncident("vaultPackage.zip", err);
    return Response.json({ error: "no se pudo construir el paquete" }, { status: 500 });
  }

  await trackServer("audit_package_downloaded", {
    props: { files: manifestFiles.length, signed: firmado },
  });

  const fecha = generatedAt.slice(0, 10);
  const sufijo = firmado ? "" : "-SIN-FIRMAR";
  return new Response(zip as BodyInit, {
    status: 200,
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="attesta-evidencia-${fecha}${sufijo}.zip"`,
      "cache-control": "no-store",
    },
  });
}
