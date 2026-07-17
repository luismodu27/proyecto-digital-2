/**
 * Avisos legales estandarizados (encuadre "autoevaluación, no certificación").
 * Textos revisados por el subagente de compliance. Pendiente revisión por abogado UE
 * antes de producción.
 */

export const LEGAL_RESULT =
  "Resultado orientativo de una autoevaluación basada en la información que tu organización ha declarado. No es una certificación, auditoría ni determinación legal de cumplimiento del Reglamento Europeo de IA. Su exactitud depende de los datos introducidos.";

export const LEGAL_PDF =
  "Documento generado a partir de datos autodeclarados por la organización. Refleja el estado y la evidencia declarados por sus responsables, no verificados de forma independiente por Attesta. No es un certificado de conformidad, una Declaración UE de Conformidad, un marcado CE ni asesoría legal.";

export const LEGAL_FOOTER =
  "Attesta es una herramienta de autoevaluación y gestión de evidencia. No presta asesoría jurídica ni certifica el cumplimiento de ninguna normativa.";

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
