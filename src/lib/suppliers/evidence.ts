/**
 * Catálogo de evidencia que un deployer puede reunir sobre sus proveedores de IA.
 *
 * LÓGICA PURA. Lo que este módulo existe para no equivocar es **el verbo**.
 *
 * Los packs llevan desde el principio el reencuadre correcto —las obligaciones
 * de diseño son del proveedor y el cliente las convierte en evidencia— pero
 * decían «exige» de casi todo, y eso no se sostiene: el Reglamento dirige la
 * documentación técnica del Anexo IV, el sistema de gestión de la calidad y el
 * de gestión de riesgos **a las autoridades y a los organismos notificados**, no
 * al responsable del despliegue. Prometer esa palanca se descubre en la primera
 * negociación con un proveedor grande, y ahí el producto pierde credibilidad
 * entera.
 *
 * De ahí que cada elemento lleve una **base jurídica** y que de ella salga el
 * verbo de la interfaz. Es el mismo tipo de campo que `requires` en la
 * navegación: una regla de negocio que sin nombre propio se diluye.
 *
 * La otra trampa que codifica: **casi nada caduca**. Ni el marcado CE, ni la
 * declaración de conformidad, ni las instrucciones de uso, ni el registro en la
 * base de datos de la UE. Los diez años de los Arts. 18, 23.5 y 47.1 son plazo
 * de **conservación** del proveedor, no de validez, y convertirlos en
 * `caduca = fecha + 10 años` produciría avisos falsos a mansalva. Lo único que
 * caduca de verdad es el certificado de organismo notificado (Art. 44.2).
 */
import { daysUntilDate } from "@/lib/date";

/**
 * Qué puede hacer el cliente de verdad con cada elemento.
 *
 * - `deliverable`   — la norma obliga al proveedor a hacérselo llegar. Verbo: **exige**.
 * - `publicSource`  — se comprueba en fuente pública sin depender del proveedor. Verbo: **verifica**.
 * - `contractOnly`  — no es exigible; se consigue negociando. Verbo: **pacta en contrato**.
 * - `existsNoAccess`— debe existir, pero su destinatario es otro (autoridades u
 *                     organismos notificados). Verbo: **registra que existe**.
 */
export const LEGAL_BASES = [
  "deliverable",
  "publicSource",
  "contractOnly",
  "existsNoAccess",
] as const;
export type LegalBasis = (typeof LEGAL_BASES)[number];

export type EvidenceSubject =
  | "provider"
  | "importer"
  | "distributor"
  | "authorizedRep"
  | "modelProvider";

export type EvidenceKind = {
  key: string;
  article: string;
  basis: LegalBasis;
  subject: EvidenceSubject;
  /** ¿Tiene fecha de expiración REAL? Ver la nota de cabecera. */
  expires: boolean;
  /** Solo aplica si por debajo hay un modelo de propósito general. */
  gpai?: boolean;
};

/**
 * Catálogo CERRADO. Un tipo nuevo se añade aquí y en el diccionario, o no
 * compila: mismo criterio que el catálogo de telemetría, y por el mismo motivo
 * (una lista abierta se degrada en semanas y deja de poder responder nada).
 */
export const EVIDENCE_KINDS: readonly EvidenceKind[] = [
  // --- Lo que la norma SÍ dirige al responsable del despliegue --------------
  {
    key: "instructions",
    article: "Art. 13",
    basis: "deliverable",
    subject: "provider",
    expires: false,
  },
  {
    key: "correctiveActions",
    article: "Art. 20.1",
    basis: "deliverable",
    subject: "provider",
    expires: false,
  },
  {
    key: "authorizedRep",
    article: "Art. 22 (identidad vía Art. 13.3.a)",
    basis: "deliverable",
    subject: "authorizedRep",
    expires: false,
  },

  // --- Lo que se comprueba en fuente pública --------------------------------
  {
    key: "ceMarking",
    article: "Art. 48",
    basis: "publicSource",
    subject: "provider",
    expires: false,
  },
  {
    key: "declarationOfConformity",
    article: "Art. 47 + Anexo VIII",
    basis: "publicSource",
    subject: "provider",
    expires: false,
  },
  {
    key: "euDatabase",
    article: "Arts. 49 y 71",
    basis: "publicSource",
    subject: "provider",
    expires: false,
  },
  {
    // El ÚNICO con caducidad real de todo el catálogo.
    key: "notifiedBodyCertificate",
    article: "Art. 44",
    basis: "publicSource",
    subject: "provider",
    expires: true,
  },

  // --- Lo que solo se consigue negociando -----------------------------------
  {
    key: "technicalDocumentation",
    article: "Anexo IV / Art. 11",
    basis: "contractOnly",
    subject: "provider",
    expires: false,
  },
  {
    key: "qualityManagement",
    article: "Art. 17",
    basis: "contractOnly",
    subject: "provider",
    expires: false,
  },
  {
    key: "riskManagement",
    article: "Art. 9",
    basis: "contractOnly",
    subject: "provider",
    expires: false,
  },
  {
    key: "dataGovernance",
    article: "Art. 10",
    basis: "contractOnly",
    subject: "provider",
    expires: false,
  },
  {
    // Importa más de lo que parece: el Art. 26.6 obliga a conservar los logs
    // "en la medida en que estén bajo tu control". Si el sistema lo opera el
    // proveedor, la norma no te salva; el contrato sí.
    key: "logAccess",
    article: "Art. 26.6 (vía contrato)",
    basis: "contractOnly",
    subject: "provider",
    expires: false,
  },
  {
    key: "dataProcessingAgreement",
    article: "RGPD Art. 28",
    basis: "contractOnly",
    subject: "provider",
    expires: false,
  },
  {
    key: "versionChangeNotice",
    article: "Art. 13.3.c (cambios predeterminados)",
    basis: "contractOnly",
    subject: "provider",
    expires: false,
  },

  // --- Existe, pero su destinatario es otro ---------------------------------
  {
    key: "importerRecords",
    article: "Art. 23.5",
    basis: "existsNoAccess",
    subject: "importer",
    expires: false,
  },
  {
    key: "distributorChecks",
    article: "Art. 24.1",
    basis: "existsNoAccess",
    subject: "distributor",
    expires: false,
  },

  // --- Capa GPAI -------------------------------------------------------------
  {
    // Su destinatario es el PROVEEDOR DEL SISTEMA que integra el modelo. Un
    // deployer puro no puede reclamarlo: o lo repercute su proveedor por
    // contrato, o él mismo integra el modelo y entonces sí es el destinatario.
    key: "gpaiIntegratorDocs",
    article: "Art. 53.1.b + Anexo XII",
    basis: "contractOnly",
    subject: "modelProvider",
    expires: false,
    gpai: true,
  },
  {
    // El único artefacto GPAI que se obtiene sin pedir nada a nadie.
    key: "gpaiTrainingSummary",
    article: "Art. 53.1.d",
    basis: "publicSource",
    subject: "modelProvider",
    expires: false,
    gpai: true,
  },
];

const BY_KEY = new Map(EVIDENCE_KINDS.map((k) => [k.key, k]));

export function evidenceKind(key: string): EvidenceKind | undefined {
  return BY_KEY.get(key);
}

/** ¿La organización declara haberlo conseguido, o consta que no? */
export const EVIDENCE_STATUSES = [
  "notRequested",
  "requested",
  "received",
  "verifiedPublicly",
  "refused",
  "notApplicable",
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

/**
 * Estados que cuentan como «lo tenemos». `refused` NO cuenta, pero tampoco es un
 * hueco: que un proveedor se niegue por escrito, con fecha, **es evidencia**, y
 * de las mejores para un expediente. Por eso tiene estado propio en vez de
 * quedarse en «no solicitado».
 */
const COVERED: ReadonlySet<EvidenceStatus> = new Set([
  "received",
  "verifiedPublicly",
]);

export type SupplierEvidence = {
  id: string;
  supplierId: string;
  systemId: string | null;
  systemName: string | null;
  kind: string;
  status: EvidenceStatus;
  requestedOn: string | null;
  receivedOn: string | null;
  /** Versión del documento y del sistema/modelo al que corresponde. Más útil
   *  que cualquier fecha: lo que invalida una instrucción es una versión nueva. */
  documentVersion: string | null;
  sourceUrl: string | null;
  /** Nunca se autocalcula. Solo tiene sentido en el certificado del Art. 44. */
  expiresOn: string | null;
  note: string | null;
};

/**
 * Cobertura como HECHO, nunca como porcentaje ni como nota.
 *
 * Un «% de cumplimiento del proveedor» violaría la regla #1 del producto y  attesta-copy-ok: comentario que explica por qué no se hace; no es copy de UI.
 * además no tiene ninguna base normativa: no existe un umbral a partir del cual
 * un proveedor «va bien». Lo que sí es cierto y comprobable es cuántos
 * elementos constan y cuántos faltan, y eso es lo que se devuelve.
 */
export type Coverage = {
  covered: number;
  refused: number;
  pending: number;
  notApplicable: number;
  total: number;
  /** Desglose por base jurídica: lo pendiente «por contrato» no se lee igual
   *  que lo pendiente de algo que el proveedor está obligado a darte. */
  pendingByBasis: Record<LegalBasis, number>;
};

export function coverage(items: SupplierEvidence[]): Coverage {
  const pendingByBasis: Record<LegalBasis, number> = {
    deliverable: 0,
    publicSource: 0,
    contractOnly: 0,
    existsNoAccess: 0,
  };
  let covered = 0;
  let refused = 0;
  let notApplicable = 0;
  let pending = 0;

  for (const it of items) {
    if (COVERED.has(it.status)) {
      covered += 1;
    } else if (it.status === "refused") {
      refused += 1;
    } else if (it.status === "notApplicable") {
      notApplicable += 1;
    } else {
      pending += 1;
      const basis = BY_KEY.get(it.kind)?.basis;
      if (basis) pendingByBasis[basis] += 1;
    }
  }

  return {
    covered,
    refused,
    pending,
    notApplicable,
    total: items.length,
    pendingByBasis,
  };
}

/** Ventana de preaviso del único vencimiento real del catálogo. */
export const CERT_WARN_DAYS = 90;

export type ExpiringEvidence = {
  item: SupplierEvidence;
  daysLeft: number;
};

/**
 * Elementos con vencimiento a la vista.
 *
 * Solo mira los tipos cuyo `expires` es `true`. Aunque alguien guarde una fecha
 * en un elemento que no caduca —por error o importando de otro sitio—, aquí no
 * genera aviso: la lista de vencimientos es de las pantallas que más rápido se
 * dejan de mirar si trae ruido.
 */
export function expiringEvidence(
  items: SupplierEvidence[],
  now: Date,
  windowDays: number = CERT_WARN_DAYS,
): ExpiringEvidence[] {
  const out: ExpiringEvidence[] = [];
  for (const item of items) {
    if (!BY_KEY.get(item.kind)?.expires) continue;
    const days = daysUntilDate(item.expiresOn, now);
    if (days === null || days > windowDays) continue;
    out.push({ item, daysLeft: days });
  }
  out.sort((a, b) => a.daysLeft - b.daysLeft || a.item.id.localeCompare(b.item.id));
  return out;
}

/* -------------------------------------------------------------------------- */
/* Art. 25 — cuándo el cliente deja de ser deployer                           */
/* -------------------------------------------------------------------------- */

/**
 * Los supuestos que convierten a un responsable del despliegue en PROVEEDOR, con
 * todas las obligaciones del Art. 16 encima. Es la trampa más cara para el
 * mid-market, y la más silenciosa: el tercero no exige tocar nada técnico —basta
 * con poner una herramienta genérica a cribar currículos—.
 *
 * Se exponen como catálogo para la interfaz, NO como un evaluador. El desenlace
 * es siempre el mismo texto fijo —«puede activar el Art. 25, requiere revisión
 * jurídica»— y nunca un veredicto: decidir si una modificación es «sustancial»
 * o si un pacto de marca blanca reasigna obligaciones es un juicio legal, y
 * fingir que lo resolvemos sería exactamente lo que la regla #1 prohíbe.
 */
export const ART25_TRIGGERS = [
  { key: "whiteLabel", article: "Art. 25.1.a", contractualCarveOut: true },
  { key: "substantialModification", article: "Art. 25.1.b", contractualCarveOut: false },
  { key: "purposeChange", article: "Art. 25.1.c", contractualCarveOut: false },
  { key: "fineTuning", article: "Cap. V + Recital 109", contractualCarveOut: false },
] as const;
