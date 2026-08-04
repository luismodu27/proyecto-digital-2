/**
 * Registro de subprocesadores — FUENTE DE VERDAD, no una página.
 *
 * POR QUÉ ES CÓDIGO Y NO UN MARKDOWN. Una lista de subprocesadores en un documento
 * suelto envejece el día que alguien añade un `fetch` a un servicio nuevo, y nadie
 * se entera hasta que un cliente pregunta en la due-diligence. Aquí la lista es un
 * módulo tipado del que salen **a la vez** la página pública y el guard de
 * `subprocessors.test.ts`, que escanea el código en busca de destinos de salida y
 * falla si alguno no está declarado. Añadir Sentry, PostHog o un proveedor de
 * correo nuevo rompe la suite hasta que se declara. Esa es toda la idea.
 *
 * LA DISTINCIÓN QUE IMPORTA (`flow`). No todo tercero al que sale una petición es
 * un subprocesador de datos de cliente:
 *
 *  · `customer-data` — trata datos de nuestros clientes o de sus usuarios. Estos
 *    son los subprocesadores en el sentido del art. 28.2 y 28.4 RGPD, y son los que
 *    obligan a informar al cliente antes de incorporar uno nuevo.
 *  · `corpus-only` — solo ve el **corpus regulatorio público** (texto del Reglamento,
 *    boletines oficiales) del radar de vigilancia. No recibe nada de ninguna
 *    organización cliente. Se declaran igual, porque ocultar un proveedor porque
 *    "no trata datos personales" es exactamente la clase de matiz que un comprador
 *    quiere comprobar por su cuenta, no que le contemos.
 *
 * `status` distingue lo que está **enchufado hoy** de lo que solo se activa si se
 * configura su variable de entorno. Un cliente que lee esta lista quiere saber
 * quién toca sus datos ahora, no quién podría tocarlos si activáramos una función.
 *
 * AL AÑADIR UNO: rellena `hosts` con los dominios reales a los que sale tráfico —
 * es lo que el guard compara — y actualiza `SUBPROCESSORS_UPDATED`.
 */
import type { Locale } from "@/lib/i18n/config";

/** Qué ve el proveedor. Ver el bloque de arriba: la distinción no es cosmética. */
export type SubprocessorFlow = "customer-data" | "corpus-only";

/**
 * `active` = tratando datos hoy. `gated` = solo si se configura su variable de
 * entorno; mientras no lo esté, no recibe absolutamente nada.
 */
export type SubprocessorStatus = "active" | "gated";

export type Subprocessor = {
  id: string;
  name: string;
  /** Para qué se usa. */
  purpose: Record<Locale, string>;
  /** Qué datos recibe. Concreto: "correo y nombre", no "datos de uso". */
  data: Record<Locale, string>;
  /** Dónde se tratan, y bajo qué garantía si sale de la UE. */
  location: Record<Locale, string>;
  flow: SubprocessorFlow;
  status: SubprocessorStatus;
  /**
   * Dominios a los que sale tráfico. Es la clave del guard: si el código habla con
   * un host que no aparece en ninguna entrada, el test falla. Admite comodín de
   * subdominio (`*.supabase.co`).
   */
  hosts: readonly string[];
  /** Página de privacidad del proveedor, para que el cliente la compruebe. */
  privacyUrl: string;
};

export const SUBPROCESSORS: readonly Subprocessor[] = [
  {
    id: "supabase",
    name: "Supabase",
    purpose: {
      es: "Base de datos, autenticación y almacenamiento de la aplicación. Es donde vive el inventario de sistemas de IA, la evidencia declarada y el registro de auditoría.",
      en: "Application database, authentication and storage. This is where the AI system inventory, declared evidence and audit log live.",
    },
    data: {
      es: "Todos los datos que tu organización introduce en Attesta, más el correo electrónico y los metadatos de sesión de cada persona usuaria.",
      en: "All data your organization enters into Attesta, plus each user's email address and session metadata.",
    },
    location: {
      es: "Unión Europea (proyecto alojado en región de la UE).",
      en: "European Union (project hosted in an EU region).",
    },
    flow: "customer-data",
    status: "active",
    hosts: ["*.supabase.co"],
    privacyUrl: "https://supabase.com/privacy",
  },
  {
    id: "vercel",
    name: "Vercel",
    purpose: {
      es: "Alojamiento de la aplicación y red de distribución. Sirve las páginas y ejecuta el código de servidor.",
      en: "Application hosting and content delivery. Serves the pages and runs the server-side code.",
    },
    data: {
      es: "Los datos de cada petición mientras se procesa (incluida la dirección IP en los registros técnicos de la plataforma). Attesta no guarda esos registros por su cuenta.",
      en: "The data of each request while it is being processed (including the IP address in the platform's technical logs). Attesta does not keep those logs itself.",
    },
    location: {
      es: "Ejecución en región de la UE. Vercel Inc. es una entidad estadounidense: la transferencia se ampara en las cláusulas contractuales tipo de su DPA.",
      en: "Execution in an EU region. Vercel Inc. is a US entity: the transfer relies on the standard contractual clauses in its DPA.",
    },
    flow: "customer-data",
    status: "active",
    hosts: [],
    privacyUrl: "https://vercel.com/legal/privacy-policy",
  },
  {
    id: "stripe",
    name: "Stripe",
    purpose: {
      es: "Procesamiento de pagos y gestión de la suscripción.",
      en: "Payment processing and subscription management.",
    },
    data: {
      es: "Correo electrónico de facturación, importe y estado de la suscripción. Los datos de la tarjeta los recoge Stripe directamente: no pasan por los servidores de Attesta ni se guardan en su base de datos.",
      en: "Billing email, amount and subscription status. Card details are collected by Stripe directly: they never pass through Attesta's servers and are not stored in its database.",
    },
    location: {
      es: "Irlanda y Estados Unidos, con cláusulas contractuales tipo.",
      en: "Ireland and the United States, under standard contractual clauses.",
    },
    flow: "customer-data",
    status: "gated",
    hosts: ["js.stripe.com", "api.stripe.com", "hooks.stripe.com"],
    privacyUrl: "https://stripe.com/privacy",
  },
  {
    id: "resend",
    name: "Resend",
    purpose: {
      es: "Envío de correo transaccional: invitaciones a la organización, recordatorios de tareas y verificación de la cuenta.",
      en: "Transactional email delivery: organization invitations, task reminders and account verification.",
    },
    data: {
      es: "Dirección de correo de quien recibe el mensaje y el contenido del propio mensaje.",
      en: "The recipient's email address and the content of the message itself.",
    },
    location: {
      es: "Estados Unidos, con cláusulas contractuales tipo.",
      en: "United States, under standard contractual clauses.",
    },
    flow: "customer-data",
    status: "gated",
    hosts: ["api.resend.com"],
    privacyUrl: "https://resend.com/legal/privacy-policy",
  },
  {
    id: "voyage",
    name: "Voyage AI",
    purpose: {
      es: "Cálculo de representaciones vectoriales del corpus regulatorio público, para que el radar de vigilancia pueda buscar por significado y no solo por palabra exacta.",
      en: "Computing vector representations of the public regulatory corpus, so the monitoring radar can search by meaning and not just by exact wording.",
    },
    data: {
      es: "Únicamente texto normativo público (Reglamento Europeo de IA, diarios oficiales, guías de la Comisión). Ningún dato de ninguna organización cliente.",
      en: "Public regulatory text only (EU AI Act, official journals, Commission guidance). No data from any customer organization.",
    },
    location: {
      es: "Estados Unidos. No se le transfiere ningún dato personal.",
      en: "United States. No personal data is transferred to it.",
    },
    flow: "corpus-only",
    status: "gated",
    hosts: ["api.voyageai.com"],
    privacyUrl: "https://www.voyageai.com/privacy",
  },
  {
    id: "llm-drafting",
    name: "NVIDIA NIM",
    purpose: {
      es: "Redacción de BORRADORES de resúmenes normativos para el radar de vigilancia. Ningún borrador se publica sin que una persona lo revise y lo apruebe.",
      en: "Drafting regulatory summaries for the monitoring radar. No draft is ever published without a person reviewing and approving it.",
    },
    data: {
      es: "Únicamente texto normativo público. Ningún dato de ninguna organización cliente. Los textos regulatorios que Attesta muestra a sus clientes no los genera un modelo de lenguaje.",
      en: "Public regulatory text only. No data from any customer organization. The regulatory text Attesta shows to its customers is not generated by a language model.",
    },
    location: {
      es: "Estados Unidos. No se le transfiere ningún dato personal. El proveedor es configurable: cualquier endpoint compatible con OpenAI.",
      en: "United States. No personal data is transferred to it. The provider is configurable: any OpenAI-compatible endpoint.",
    },
    flow: "corpus-only",
    status: "gated",
    hosts: ["integrate.api.nvidia.com"],
    privacyUrl: "https://www.nvidia.com/en-us/about-nvidia/privacy-policy/",
  },
] as const;

/** Fecha de la última revisión de esta lista (ISO). La usa la página pública. */
export const SUBPROCESSORS_UPDATED = "2026-08-04";

/** Todos los hosts declarados, aplanados. Lo consume el guard. */
export const DECLARED_HOSTS: readonly string[] = SUBPROCESSORS.flatMap(
  (s) => s.hosts,
);

/**
 * ¿Está declarado este host? Resuelve el comodín de subdominio (`*.supabase.co`
 * cubre `xyz.supabase.co`, y también el propio `supabase.co`).
 */
export function isDeclaredHost(host: string): boolean {
  return DECLARED_HOSTS.some((declared) => {
    if (declared === host) return true;
    if (!declared.startsWith("*.")) return false;
    const suffix = declared.slice(1); // ".supabase.co"
    return host.endsWith(suffix) || host === declared.slice(2);
  });
}

/** Los que tratan datos de cliente: el subconjunto que exige el art. 28 RGPD. */
export function customerDataSubprocessors(): readonly Subprocessor[] {
  return SUBPROCESSORS.filter((s) => s.flow === "customer-data");
}

/** Los que solo ven el corpus regulatorio público. */
export function corpusOnlySubprocessors(): readonly Subprocessor[] {
  return SUBPROCESSORS.filter((s) => s.flow === "corpus-only");
}
