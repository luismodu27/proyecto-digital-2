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

/**
 * Nota "Alcance y método" para los informes en PDF. Encuadre revisado por el
 * subagente de compliance: foto a fecha, marco de referencia, el % NO es
 * cumplimiento, datos no verificados por Attesta, no es asesoría jurídica.
 * Compartida por el informe ejecutivo y el informe de gap para no divergir.
 */
export function ScopeNote({
  fecha,
  className = "",
}: {
  fecha: string;
  className?: string;
}) {
  return (
    <section
      className={`break-inside-avoid rounded-lg border border-line bg-paper-sunken/40 px-4 py-3 ${className}`}
    >
      <p className="text-xs leading-relaxed text-muted">
        <span className="font-medium text-ink-soft">Alcance y método</span> — Este
        informe cubre exclusivamente los sistemas de IA que la organización ha
        declarado en Attesta a fecha de {fecha}, y refleja su estado en ese momento.
        La clasificación de riesgo es orientativa y se basa en el marco del
        Reglamento Europeo de IA (EU AI Act) y, en su caso, en otros marcos
        aplicables, a partir de la información introducida por los responsables de la
        organización. El porcentaje de «preparación» indica el avance autodeclarado
        hacia la evidencia requerida; no es un porcentaje de cumplimiento ni un
        juicio de conformidad normativa. Los datos no han sido verificados de forma
        independiente por Attesta. Este documento es orientativo y no constituye
        asesoría jurídica; antes de tomar decisiones regulatorias conviene validarlo
        con personal cualificado.
      </p>
    </section>
  );
}
