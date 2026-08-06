import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Qué versión del código está PUBLICADA.
 *
 * POR QUÉ EXISTE, y es una lección cara. Durante semanas se dio por hecho que
 * "subido a la rama" significaba "en el aire". No lo significaba: Vercel publica
 * `main` y el trabajo vivía en una rama sin fusionar. El fundador aplicó
 * migraciones, redesplegó y buscó funciones que no existían en producción,
 * mientras el repositorio decía que todo estaba hecho. Nadie mentía: es que no
 * había NINGUNA forma de comprobar qué había publicado, así que la pregunta no
 * se hacía.
 *
 * Esta ruta convierte esa pregunta en una consulta de un segundo. Devuelve el
 * commit que Vercel usó para construir lo que se está sirviendo, y
 * `scripts/verify/deployed.mjs` lo compara con el commit local y con la lista de
 * rutas que el código dice tener.
 *
 * NO ES INFORMACIÓN SENSIBLE: el repositorio es privado, pero un hash de commit
 * no revela nada de él y sí permite que cualquiera del equipo compruebe qué hay
 * en producción sin entrar en Vercel. La alternativa —protegerlo— haría que no se
 * consultara, y una comprobación que no se hace no comprueba nada.
 */
export async function GET() {
  // Vercel las inyecta solo. En local no existen y se dice, en vez de mentir
  // con un valor por defecto.
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? null;
  const ref = process.env.VERCEL_GIT_COMMIT_REF ?? null;

  return NextResponse.json(
    {
      commit: sha,
      shortCommit: sha ? sha.slice(0, 7) : null,
      branch: ref,
      environment: process.env.VERCEL_ENV ?? "local",
      builtFrom: sha ? "vercel" : "local (sin metadatos de despliegue)",
    },
    { headers: { "cache-control": "no-store" } },
  );
}
