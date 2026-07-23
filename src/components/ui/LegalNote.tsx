/**
 * Avisos legales estandarizados (encuadre "autoevaluación, no certificación").
 *
 * FRONTERA LEGAL: estos son textos legales deterministas. Viven aquí (NO en el
 * diccionario i18n) a propósito. Las versiones inglesas fueron validadas por el
 * experto de compliance (igual que las españolas). Pendiente revisión por
 * abogado UE antes de producción. No añadir traducciones sin validación experta.
 *
 * Los alias sin sufijo (`LEGAL_FOOTER`, `LEGAL_RESULT`, `LEGAL_PDF`) son la
 * versión española, que siguen usando el dashboard/PDF (aún en español). Para
 * texto según idioma, usa los mapas `*_BY_LOCALE`.
 */
import type { Locale } from "@/lib/i18n/config";

const LEGAL_RESULT_ES =
  "Resultado orientativo de una autoevaluación basada en la información que tu organización ha declarado. No es una certificación, auditoría ni determinación legal de cumplimiento del Reglamento Europeo de IA. Su exactitud depende de los datos introducidos.";
const LEGAL_RESULT_EN =
  "Indicative result of a self-assessment based on the information your organization has declared. It is not a certification, an audit, or a legal determination of compliance with the EU AI Act. Its accuracy depends on the data entered.";

const LEGAL_PDF_ES =
  "Documento generado a partir de datos autodeclarados por la organización. Refleja el estado y la evidencia declarados por sus responsables, no verificados de forma independiente por Attesta. No es un certificado de conformidad, una Declaración UE de Conformidad, un marcado CE ni asesoría legal.";
const LEGAL_PDF_EN =
  "Document generated from data self-declared by the organization. It reflects the status and evidence declared by the organization's own staff, not independently verified by Attesta. It is not a certificate of conformity, an EU Declaration of Conformity, a CE marking, or legal advice.";

const LEGAL_FOOTER_ES =
  "Attesta es una herramienta de autoevaluación y gestión de evidencia. No presta asesoría jurídica ni certifica el cumplimiento de ninguna normativa.";
const LEGAL_FOOTER_EN =
  "Attesta is a self-assessment and evidence-management tool. It does not provide legal advice and does not certify compliance with any law or regulation.";

export const LEGAL_RESULT_BY_LOCALE: Record<Locale, string> = {
  es: LEGAL_RESULT_ES,
  en: LEGAL_RESULT_EN,
};
export const LEGAL_PDF_BY_LOCALE: Record<Locale, string> = {
  es: LEGAL_PDF_ES,
  en: LEGAL_PDF_EN,
};
export const LEGAL_FOOTER_BY_LOCALE: Record<Locale, string> = {
  es: LEGAL_FOOTER_ES,
  en: LEGAL_FOOTER_EN,
};

// Alias en español (compatibilidad con el dashboard/PDF, aún en español).
export const LEGAL_RESULT = LEGAL_RESULT_ES;
export const LEGAL_PDF = LEGAL_PDF_ES;
export const LEGAL_FOOTER = LEGAL_FOOTER_ES;

export function LegalNote({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>{text}</p>
  );
}

/**
 * Nota "Alcance y método" para los informes en PDF. Encuadre revisado por el
 * subagente de compliance: foto a fecha, marco de referencia, el % NO es
 * cumplimiento, datos no verificados por Attesta, no es asesoría jurídica.
 * Compartida por el informe ejecutivo y el informe de gap para no divergir.
 */
export function ScopeNote({
  fecha,
  locale = "es",
  className = "",
}: {
  fecha: string;
  locale?: Locale;
  className?: string;
}) {
  const label = locale === "en" ? "Scope and method" : "Alcance y método";
  const body =
    locale === "en"
      ? `This report covers only the AI systems that the organization has declared in Attesta as of ${fecha}, and reflects their status at that time. The risk classification is indicative and is based on the EU AI Act framework and, where relevant, other applicable frameworks, drawing on the information entered by the organization's own staff. The "readiness" percentage indicates self-declared progress toward the required evidence; it is not a compliance percentage or a judgment of regulatory conformity. The data has not been independently verified by Attesta. This document is indicative and does not constitute legal advice; before making regulatory decisions, it should be validated with qualified personnel.`
      : `Este informe cubre exclusivamente los sistemas de IA que la organización ha declarado en Attesta a fecha de ${fecha}, y refleja su estado en ese momento. La clasificación de riesgo es orientativa y se basa en el marco del Reglamento Europeo de IA (EU AI Act) y, en su caso, en otros marcos aplicables, a partir de la información introducida por los responsables de la organización. El porcentaje de «preparación» indica el avance autodeclarado hacia la evidencia requerida; no es un porcentaje de cumplimiento ni un juicio de conformidad normativa. Los datos no han sido verificados de forma independiente por Attesta. Este documento es orientativo y no constituye asesoría jurídica; antes de tomar decisiones regulatorias conviene validarlo con personal cualificado.`;
  return (
    <section
      className={`break-inside-avoid rounded-lg border border-line bg-paper-sunken/40 px-4 py-3 ${className}`}
    >
      <p className="text-xs leading-relaxed text-muted">
        <span className="font-medium text-ink-soft">{label}</span> — {body}
      </p>
    </section>
  );
}
