/**
 * ¿Está PUBLICADO lo que dice el repositorio?
 *
 *   npm run verify:deploy
 *
 * EL FALLO QUE ESTE SCRIPT EXISTE PARA IMPEDIR, y que ya ocurrió. Durante seis
 * semanas se dio por bueno que "commit + push" equivalía a "en producción". No
 * era así: Vercel publica `main` y el trabajo estaba en una rama sin fusionar. El
 * repositorio decía que todo estaba hecho, los tests pasaban, las migraciones se
 * aplicaban... y la web servía el código de julio. Nadie mintió: es que la
 * pregunta "¿esto está publicado?" no tenía forma barata de responderse, así que
 * no se hacía.
 *
 * Este script la hace en cinco segundos, y de dos maneras independientes:
 *
 *  1. Compara el COMMIT publicado (`/api/version`) con el commit local.
 *  2. Y, por si el commit no estuviera disponible, comprueba que las RUTAS que el
 *     código dice tener respondan de verdad. Es la comprobación que de verdad
 *     habría cazado el fallo: `/legal/privacidad` devolvía 404 en producción
 *     mientras existía en el repositorio desde hacía días.
 *
 * Las dos hacen falta. La primera es exacta pero depende de que la ruta exista
 * (no existía antes de este mismo commit); la segunda funciona siempre y es la
 * que se puede leer sin saber nada de git.
 */
import { execSync } from "node:child_process";

const BASE = (process.argv[2] ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://attesta-io.vercel.app")
  .replace(/\/+$/, "");

let pass = 0;
let fail = 0;
function check(label, ok, detail = "") {
  if (ok) {
    pass++;
    console.log(`✅ ${label}`);
  } else {
    fail++;
    console.log(`❌ ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

async function status(path) {
  try {
    const r = await fetch(BASE + path, { redirect: "manual" });
    return r.status;
  } catch (err) {
    return `error: ${String(err).slice(0, 60)}`;
  }
}

console.log(`\nComprobando lo PUBLICADO en ${BASE}\n`);

// ---------------------------------------------------------------------------
// 1. Commit publicado frente a commit local
// ---------------------------------------------------------------------------
let publicado = null;
try {
  const r = await fetch(`${BASE}/api/version`, { redirect: "manual" });
  if (r.ok) publicado = await r.json();
} catch {
  /* la ruta puede no existir todavía en producción: se dice abajo */
}

const local = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
const rama = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();

if (!publicado?.commit) {
  console.log(
    "⚠️  /api/version no responde: la versión publicada es ANTERIOR a que existiera\n" +
      "    esta comprobación. Las rutas de abajo dirán qué falta.\n",
  );
} else {
  console.log(`   publicado: ${publicado.shortCommit} (rama ${publicado.branch})`);
  console.log(`   local:     ${local.slice(0, 7)} (rama ${rama})\n`);

  const contiene = (() => {
    try {
      execSync(`git merge-base --is-ancestor ${publicado.commit} HEAD`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  })();

  check(
    "lo publicado forma parte del historial local (no es una rama divergente)",
    contiene,
    "producción tiene commits que aquí no están",
  );
  check(
    "no hay trabajo local sin publicar",
    publicado.commit === local,
    (() => {
      try {
        const n = execSync(`git rev-list --count ${publicado.commit}..HEAD`, {
          encoding: "utf8",
        }).trim();
        return `${n} commit(s) hechos y NO publicados`;
      } catch {
        return "no se pudo contar la diferencia";
      }
    })(),
  );
}

// ---------------------------------------------------------------------------
// 2. Las rutas que el código dice tener, ¿responden?
//
// La lista se escribe a mano y NO se deriva del sistema de ficheros a propósito:
// derivarla haría que una ruta nueva se añadiera sola y la comprobación dejaría
// de ser una decisión. Aquí, añadir una entrada es declarar "esto tiene que
// estar en producción", que es justo lo que se quiere obligar a pensar.
// ---------------------------------------------------------------------------
const RUTAS = [
  // Web pública
  ["/", 200, "landing"],
  ["/en", 200, "landing en inglés"],
  ["/legal/privacidad", 200, "aviso de privacidad (Sprint 6)"],
  ["/legal/cookies", 200, "cookies (Sprint 6)"],
  ["/legal/subprocesadores", 200, "subprocesadores (Sprint 6)"],
  ["/legal/tratamiento-de-datos", 200, "DPA (Sprint 6)"],
  ["/en/legal/privacy", 200, "privacidad en inglés"],
  // API pública
  ["/api/version", 200, "marcador de versión"],
  ["/api/vault/key", 200, "clave pública del vault (Sprint 6+)"],
];

console.log("");
for (const [ruta, esperado, que] of RUTAS) {
  const s = await status(ruta);
  check(`${ruta.padEnd(32)} ${que}`, s === esperado, `esperado ${esperado}, obtenido ${s}`);
}

/*
  POR QUÉ AQUÍ NO HAY NINGUNA RUTA DE `/dashboard`, aunque sería lo primero que
  uno pondría. Porque NO SE PUEDEN comprobar así: el middleware redirige a login
  antes de que Next resuelva la ruta, así que una página que no existe en el
  despliegue responde 307 exactamente igual que una que sí. La primera versión de
  este script las incluía y las cuatro pasaban en verde mientras el vault no
  estaba publicado — un test que no distingue no es un test, es un adorno que da
  falsa tranquilidad.

  Lo que SÍ cubre esas rutas es la comparación de commits de arriba: si el commit
  publicado es el local, están todas por construcción.
*/

console.log(`\n${pass} correctas · ${fail} fallos`);
if (fail > 0) {
  console.log(
    "\nSi fallan rutas que SÍ existen en el repositorio, lo más probable es que la\n" +
      "rama de trabajo no esté fusionada en la que Vercel publica (`main`).\n",
  );
}
process.exit(fail === 0 ? 0 : 1);
