import type { CorpusChunk } from "./index";
import data from "./eu-ai-act.data.json";

/**
 * Texto VERBATIM del EU AI Act (Reglamento (UE) 2024/1689), en inglés (el idioma
 * de las fuentes oficiales que vigilamos), a nivel de apartado. Verificado por el
 * `compliance-domain-expert` contra artificialintelligenceact.eu (espejo del
 * DOUE OJ L, 2024/1689). Foco deployer/RRHH: Arts. 5, 6, 14, 26, 27, 50, 86 +
 * Anexo III (empleo).
 *
 * ⚠️ Antes de producción: reverificar cada `content` carácter-por-carácter contra
 * el HTML/PDF oficial de EUR-Lex (única fuente con valor legal). El corpus es
 * texto crudo de la ley (fechas movidas por el Omnibus viven en el catálogo de
 * vigilancia, no aquí).
 */
export const EU_AI_ACT_CORPUS: CorpusChunk[] = (data as CorpusChunk[]).map(
  (c) => ({ ...c, framework: "eu-ai-act" }),
);

/**
 * Notas de encuadre deployer-vs-provider del `compliance-domain-expert`. NO son
 * corpus (no se indexan): son reglas que el prompt del Analista (B.2) debe seguir
 * al redactar, para no imputar al cliente-deployer obligaciones que son del
 * proveedor. El ICP de Attesta es el DEPLOYER.
 */
export const EU_AI_ACT_FRAMING_NOTES = `
- Art. 14 (supervisión humana): 14.1-14.3 son obligación de DISEÑO del PROVEEDOR
  ("shall be designed and developed... by the provider"). Para el deployer, el
  gancho propio es 14.4/14.5 + Art. 26.2 (asignar supervisión a personas
  competentes). NO decir que el deployer "diseña" el sistema; sí "exige/verifica
  que el proveedor habilitó la supervisión y asigna personas competentes".
- Art. 50.1 y 50.2 son del PROVEEDOR (interacción con IA; marcado de contenido
  sintético). Solo 50.4 es del DEPLOYER. En RRHH típico (cribado/ranking) 50.4
  casi nunca aplica; lo relevante suele ser Art. 26.11 (informar al candidato) +
  transparencia GDPR (Arts. 13/14). No imputar 50.2 al cliente-deployer.
- Art. 6.3 (excepción de alto riesgo): recordar el carve-out final: si el sistema
  hace profiling de personas físicas SIEMPRE es alto riesgo. En RRHH (perfilado
  de candidatos) esto casi siempre cierra la excepción. Invocarla obliga a
  DOCUMENTARLA (Art. 6.4 + registro Art. 49) → generar esa evidencia, no solo
  concluir "no es alto riesgo".
- Art. 27 (FRIA): NO es universal. Solo obliga a organismos de derecho público,
  entidades privadas que prestan servicios públicos, o deployers de Anexo III
  puntos 5(b)/(c) (crédito y seguros de vida/salud). Un empleador privado
  ordinario de RRHH normalmente NO está obligado. Marcar como "aplica solo si...".
- Art. 86 (derecho a explicación): derecho del AFECTADO frente al deployer; SÍ
  aplica a RRHH (excluye Anexo III punto 2, no el punto 4). Encuadrar como deber
  del deployer de poder explicar la decisión.
- Art. 26.7: obligación específica del empleador-deployer (informar a
  representantes de los trabajadores y trabajadores afectados) — gancho fuerte del
  vertical RRHH; combinar con Art. 26.11.
- Art. 5.1.f: es PROHIBICIÓN (no alto riesgo). Relevante para análisis de afecto/
  emociones en vídeo-entrevistas. Excepción tasada solo por motivos médicos o de
  seguridad. No confundir "inferir emociones" con "analizar competencias".
- Reglas de copy de Attesta SIEMPRE: clasificación orientativa, "orientación, no
  asesoría legal", verbos de la organización, nada de "certifica/cumple/garantiza".
`.trim();
