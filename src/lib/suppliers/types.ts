/**
 * Tipos del registro de proveedores.
 *
 * Viven aparte del catálogo de evidencia (`evidence.ts`) para que `mock-data`
 * pueda importarlos sin arrastrar consigo la lógica ni sus dependencias.
 */
export type AiActRole =
  | "provider"
  | "importer"
  | "distributor"
  | "model_provider"
  | "third_party"
  | "unknown";

export type GdprRole = "controller" | "processor" | "joint" | "none" | "unknown";

export type Supplier = {
  id: string;
  name: string;
  country: string | null;
  aiActRole: AiActRole;
  outsideEu: boolean;
  authorizedRep: string | null;
  authorizedRepCheckedOn: string | null;
  gdprRole: GdprRole;
  contact: string | null;
  contractEndsOn: string | null;
  dpaSigned: boolean;
  /** Bandera roja del Art. 25.2: el contrato excluye el uso en alto riesgo. */
  excludesHighRiskUse: boolean;
  note: string | null;
};

export type { SupplierEvidence, EvidenceStatus } from "./evidence";
