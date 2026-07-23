import { getExportBundle } from "@/lib/data";

// Genera el paquete al vuelo con los datos de la organización activa.
export const dynamic = "force-dynamic";

/** Slug seguro para el nombre de archivo a partir del nombre de la organización. */
function slug(s: string): string {
  const cleaned = s
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "") // quita acentos
    .replace(new RegExp("[^a-z0-9]+", "g"), "-")
    .replace(new RegExp("^-+|-+$", "g"), "")
    .slice(0, 40);
  return cleaned || "organizacion";
}

/**
 * Exportación de datos: descarga en JSON toda la evidencia declarada de la
 * organización activa (portabilidad y respaldo). Requiere sesión + organización
 * (en modo demo devuelve los datos de ejemplo). Es un volcado de los datos
 * propios del cliente, no un informe ni una certificación.
 */
export async function GET() {
  const bundle = await getExportBundle();
  if (!bundle) {
    return new Response(
      JSON.stringify({ error: "No autorizado o sin organización." }),
      { status: 401, headers: { "content-type": "application/json" } },
    );
  }

  const date = bundle.meta.exportedAt.slice(0, 10);
  const filename = `attesta-${slug(bundle.meta.organization)}-${date}.json`;

  return new Response(JSON.stringify(bundle, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
