/**
 * Identidad del responsable del tratamiento — la parte que NO se puede inventar.
 *
 * EL PROBLEMA. Un aviso de privacidad sin responsable identificado no es un aviso
 * de privacidad: el art. 13.1.a RGPD pide identidad y datos de contacto del
 * responsable, y es lo primero que mira quien evalúa a un proveedor. Pero el
 * nombre registral, el domicilio y el NIF de la sociedad son un hecho del mundo,
 * no una decisión de diseño. Ponerlos "de ejemplo" produce exactamente el peor
 * resultado posible: una página que PARECE completa, se indexa, se enseña en una
 * due-diligence y resulta ser falsa.
 *
 * LA DECISIÓN, igual que en `site-url.ts`: **no hay valor por defecto plausible**.
 * Si faltan los datos, no se inventa nada y no se falla el build tampoco (eso
 * bloquearía desplegar el resto del producto). Se hace lo intermedio y honesto:
 *
 *   · la página se sigue renderizando, porque su estructura ya vale de algo;
 *   · lleva un aviso VISIBLE de que es un borrador sin responsable identificado;
 *   · y se marca `noindex`, para que no pueda circular como si estuviera acabada.
 *
 * Es decir: se degrada de forma que el hueco sea imposible de pasar por alto, en
 * vez de rellenarse solo. Cuando el fundador constituya la sociedad y ponga las
 * variables, la página pasa a ser real e indexable sin tocar código.
 *
 * SON VARIABLES DE SERVIDOR (sin `NEXT_PUBLIC_`) a propósito: estas páginas se
 * renderizan en el servidor, así que no hace falta inlinearlas en el bundle, y
 * así se pueden corregir sin reconstruir.
 */

export type LegalEntity = {
  /** Denominación social completa. */
  name: string;
  /** Domicilio social. */
  address: string;
  /** Identificación fiscal (NIF/CIF/VAT). */
  taxId: string;
  /** Correo de contacto para asuntos de privacidad. */
  privacyEmail: string;
  /**
   * Representante en la UE (art. 27 RGPD). Solo aplica si el responsable NO está
   * establecido en la UE pero ofrece servicios a personas en la UE — que es
   * exactamente la situación a comprobar aquí. `null` = no procede o sin designar.
   */
  euRepresentative: string | null;
};

export type LegalEntityEnv = {
  LEGAL_ENTITY_NAME?: string;
  LEGAL_ENTITY_ADDRESS?: string;
  LEGAL_ENTITY_TAX_ID?: string;
  LEGAL_PRIVACY_EMAIL?: string;
  LEGAL_EU_REPRESENTATIVE?: string;
};

/** Los cuatro campos sin los cuales el aviso no cumple el art. 13.1.a-b. */
const REQUIRED = [
  "LEGAL_ENTITY_NAME",
  "LEGAL_ENTITY_ADDRESS",
  "LEGAL_ENTITY_TAX_ID",
  "LEGAL_PRIVACY_EMAIL",
] as const;

/**
 * Devuelve la entidad si está completa, o `null` si falta algún dato obligatorio.
 * `null` NO es un error: es la señal de "esto todavía es un borrador", y quien
 * renderiza la página decide qué enseñar. Nunca lanza.
 */
export function resolveLegalEntity(env: LegalEntityEnv): LegalEntity | null {
  const value = (key: (typeof REQUIRED)[number]) => env[key]?.trim() ?? "";
  if (REQUIRED.some((key) => value(key).length === 0)) return null;

  const rep = env.LEGAL_EU_REPRESENTATIVE?.trim();
  return {
    name: value("LEGAL_ENTITY_NAME"),
    address: value("LEGAL_ENTITY_ADDRESS"),
    taxId: value("LEGAL_ENTITY_TAX_ID"),
    privacyEmail: value("LEGAL_PRIVACY_EMAIL"),
    euRepresentative: rep && rep.length > 0 ? rep : null,
  };
}

/** Qué falta, para poder decirlo en el aviso de borrador en vez de callarlo. */
export function missingEntityFields(env: LegalEntityEnv): string[] {
  return REQUIRED.filter((key) => (env[key]?.trim() ?? "").length === 0);
}

export const LEGAL_ENTITY = resolveLegalEntity(process.env as LegalEntityEnv);

/**
 * ¿Se puede publicar como documento definitivo? Gobierna a la vez el aviso
 * visible y el `noindex`, para que no puedan divergir: un documento sin
 * responsable identificado nunca debería ser indexable.
 */
export const IS_LEGAL_PUBLISHABLE = LEGAL_ENTITY !== null;

/** Correo de contacto de privacidad, con caída al contacto general del pie. */
export const PRIVACY_CONTACT =
  LEGAL_ENTITY?.privacyEmail ?? "attesta.io.mx@gmail.com";
