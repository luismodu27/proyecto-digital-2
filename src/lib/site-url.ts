/**
 * Dominio público del sitio, resuelto UNA vez y sin valor por defecto plausible.
 *
 * POR QUÉ NO HAY FALLBACK A UN DOMINIO CONCRETO: hasta ahora los tres sitios que
 * necesitan la URL absoluta —`layout.tsx` (metadataBase, OG), `i18n/metadata.ts`
 * (canonical + hreflang) y `reminders/email.ts` (enlaces de los correos)—
 * cada uno repetía `?? "https://attesta-io.vercel.app"`. Ese default es el
 * problema, no la red de seguridad: el día que el dominio cambie y a alguien se
 * le olvide la variable, la app **no se rompe**. Sigue funcionando y sirviendo
 * canonical, hreflang, sitemap y enlaces de correo apuntando al host viejo. Un
 * buscador lo lee como «la versión buena de esta página está en otro sitio» y
 * deja de indexar la nueva; los correos llevan a un dominio que quizá ya no
 * responde. Nada de eso da un error en ninguna parte: se descubre semanas
 * después, mirando por qué no entra tráfico.
 *
 * De ahí la regla: en un despliegue de verdad, **sin variable no hay build**.
 * Una build que falla se arregla en dos minutos; una indexación rota, no.
 *
 * Fuera de un despliegue (tu portátil, CI) sí se cae a `localhost`: ahí la URL
 * absoluta no la ve nadie y exigir la variable solo estorbaría.
 *
 * Un valor MAL escrito falla siempre, también en local: un `NEXT_PUBLIC_APP_URL`
 * con barra final produce `https://…//en`, y con una ruta dentro produce
 * canonicals que no existen. Si alguien se molestó en poner la variable, el
 * error es un typo y merece saberlo en el acto, no en Search Console.
 */

/** Lo que se usa cuando no hay despliegue detrás (dev y CI). */
export const LOCAL_SITE_URL = "http://localhost:3000";

export type SiteUrlEnv = {
  NEXT_PUBLIC_APP_URL?: string;
  /** Vercel la define en cualquier build suyo. Su presencia = «esto se despliega». */
  VERCEL?: string;
};

export class SiteUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SiteUrlError";
  }
}

const HINT =
  "Defínela en Vercel → Settings → Environment Variables con el dominio público " +
  "completo (p. ej. https://attesta.io), sin barra final y sin ruta.";

/**
 * Normaliza y valida un valor explícito. Devuelve el origen sin barra final.
 * Lanza `SiteUrlError` si no es una URL absoluta http(s) limpia.
 */
export function normalizeSiteUrl(raw: string): string {
  const value = raw.trim();
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new SiteUrlError(
      `NEXT_PUBLIC_APP_URL no es una URL absoluta: ${JSON.stringify(raw)}. ${HINT}`,
    );
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new SiteUrlError(
      `NEXT_PUBLIC_APP_URL debe usar http o https, no ${url.protocol.replace(":", "")}. ${HINT}`,
    );
  }
  // Una ruta, query o fragmento en la variable significa que se copió mal (p. ej.
  // pegando la URL de una página). Se rechaza en vez de recortarla en silencio:
  // adivinar la intención aquí es cómo se cuelan canonicals a medias.
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new SiteUrlError(
      `NEXT_PUBLIC_APP_URL debe ser solo el dominio, sin ruta ni parámetros: ${JSON.stringify(raw)}. ${HINT}`,
    );
  }
  return url.origin;
}

/**
 * Resuelve la URL del sitio a partir del entorno. Pura: recibe el entorno, no lo
 * lee, para poder probar los tres caminos sin tocar `process.env`.
 */
export function resolveSiteUrl(env: SiteUrlEnv): string {
  const raw = env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return normalizeSiteUrl(raw);

  // `VERCEL` presente = build de un despliegue. Aquí es donde la ausencia de la
  // variable deja de ser inofensiva, así que aquí es donde se para.
  if (env.VERCEL) {
    throw new SiteUrlError(
      "Falta NEXT_PUBLIC_APP_URL y este es un despliegue: sin ella, canonical, " +
        "hreflang, sitemap y los enlaces de los correos apuntarían a un dominio " +
        `equivocado sin que nada fallara. ${HINT}`,
    );
  }

  return LOCAL_SITE_URL;
}

/**
 * La URL del sitio para esta ejecución. Se evalúa al importar el módulo, que en
 * `next build` ocurre al compilar las rutas: por eso un despliegue sin variable
 * rompe el build en vez de publicar enlaces equivocados.
 */
export const SITE_URL = resolveSiteUrl(process.env as SiteUrlEnv);
