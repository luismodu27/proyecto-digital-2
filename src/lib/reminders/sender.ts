/**
 * Salud del remitente de correo.
 *
 * EL FALLO SILENCIOSO QUE ESTO HACE VISIBLE. Sin `RESEND_FROM`, el remitente cae
 * a `onboarding@resend.dev`, que es el dominio compartido de pruebas de Resend.
 * Los correos SE ENVÍAN —la API devuelve 200, el código cree que todo va bien— y
 * acaban en spam con una probabilidad altísima, porque el dominio no está
 * autenticado para nosotros: SPF, DKIM y DMARC hablan de Resend, no de Attesta.
 *
 * Lo que se pierde en esa carpeta de spam no es un boletín: son las
 * **invitaciones al equipo** (alguien no puede entrar y no sabe por qué), los
 * **restablecimientos de contraseña** (alguien se queda fuera de su cuenta) y los
 * **recordatorios de vencimiento** (el producto deja de hacer justo lo que se
 * contrató). Y el síntoma que se ve desde dentro es: nada. Los logs dicen
 * "enviado". Por eso hace falta clasificarlo aquí y decirlo en voz alta, en vez
 * de esperar a que alguien se queje.
 *
 * Es lógica pura y sin dependencias a propósito: la usan la comprobación de
 * arranque, el panel interno y sus tests.
 */

export type SenderHealth =
  /** No hay llave: el envío está apagado. Estado legítimo en desarrollo. */
  | { level: "off"; reason: string }
  /** Se envía desde el dominio compartido de pruebas: llegará a spam. */
  | { level: "shared-domain"; reason: string; from: string }
  /** Remitente propio configurado. Falta comprobar el DNS, que no se ve desde aquí. */
  | { level: "ok"; from: string; domain: string };

/** Dominio de pruebas de Resend. Cualquier cosa bajo él es remitente prestado. */
const SHARED_DOMAINS = ["resend.dev", "onboarding.resend.dev"];

/** Extrae el dominio de un remitente en formato `Nombre <buzón@dominio>` o `buzón@dominio`. */
export function senderDomain(from: string): string | null {
  const match = from.match(/<([^>]+)>/);
  const address = (match ? match[1] : from).trim();
  const at = address.lastIndexOf("@");
  if (at < 0 || at === address.length - 1) return null;
  const domain = address.slice(at + 1).toLowerCase();
  // Un "dominio" sin punto no es un dominio: es un error de configuración.
  return domain.includes(".") ? domain : null;
}

export type SenderEnv = { RESEND_API_KEY?: string; RESEND_FROM?: string };

export function senderHealth(env: SenderEnv): SenderHealth {
  if (!env.RESEND_API_KEY?.trim()) {
    return {
      level: "off",
      reason:
        "Falta RESEND_API_KEY: no se envía ningún correo. Las invitaciones y los recordatorios no salen.",
    };
  }

  const from = env.RESEND_FROM?.trim();
  if (!from) {
    return {
      level: "shared-domain",
      reason:
        "Falta RESEND_FROM: se envía desde el dominio de pruebas de Resend. Los correos salen, pero acaban en spam.",
      from: "Attesta <onboarding@resend.dev>",
    };
  }

  const domain = senderDomain(from);
  if (!domain) {
    return {
      level: "shared-domain",
      reason: `RESEND_FROM no contiene una dirección válida (${from}).`,
      from,
    };
  }

  if (SHARED_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) {
    return {
      level: "shared-domain",
      reason:
        "El remitente usa el dominio compartido de pruebas de Resend. Los correos salen, pero acaban en spam porque el dominio no está autenticado para Attesta.",
      from,
    };
  }

  return { level: "ok", from, domain };
}

/**
 * ¿Hay que avisar de esto al fundador? `off` no: en desarrollo es lo normal y un
 * aviso que salta siempre se aprende a ignorar, que es como se pierde el aviso
 * que sí importaba.
 */
export function needsAttention(
  health: SenderHealth,
): health is Extract<SenderHealth, { level: "shared-domain" }> {
  return health.level === "shared-domain";
}
