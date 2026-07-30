/**
 * Tipos del intake compartible (enlaces + bandeja de envíos).
 *
 * Viven aparte de `mock-data.ts` porque son de un flujo de captación, no del
 * expediente regulatorio: un envío es una PROPUESTA de sistema hasta que alguien
 * de la organización la acepta y entra en el inventario.
 */

/** Enlace emitido por la organización para que alguien sin cuenta rellene fichas. */
export type IntakeLink = {
  id: string;
  /** El token en claro solo se conoce al crearlo y al listarlo (RLS lo protege). */
  token: string;
  label: string | null;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  submissions: number;
  maxSubmissions: number;
  /** Derivado: ni revocado, ni caducado, ni agotado. */
  active: boolean;
};

export type IntakeSubmissionStatus = "pending" | "accepted" | "discarded";

/** Ficha recibida por un enlace. NO es un sistema del inventario todavía. */
export type IntakeSubmission = {
  id: string;
  name: string;
  owner: string | null;
  domain: string | null;
  vendor: string | null;
  notes: string | null;
  submittedBy: string | null;
  status: IntakeSubmissionStatus;
  createdAt: string;
  /** Etiqueta del enlace por el que llegó, para saber de qué área viene. */
  linkLabel: string | null;
};
