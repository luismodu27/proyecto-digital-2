/**
 * Policy pack — Contratación con IA (EE. UU.).
 *
 * Controles del DEPLOYER (empleador) bajo las leyes estatales de EE. UU. que
 * regulan el uso de IA en contratación. A diferencia del EU AI Act, aquí el
 * empleador es el OBLIGADO DIRECTO (no hay reencuadre provider/deployer).
 *
 * Alcance: NYC Local Law 144 (AEDT) e Illinois (Human Rights Act enmendada por
 * HB 3773 + Artificial Intelligence Video Interview Act). Colorado (aplazada a
 * 2027) y la orientación federal EEOC (retirada en 2025) se siguen solo en el
 * radar de vigilancia, no como controles aquí.
 *
 * ⚠️ IMPORTANTE (regla dura del producto): Attesta NO realiza ni valida la
 * auditoría de sesgo; la ejecuta un AUDITOR INDEPENDIENTE. Attesta solo REGISTRA
 * la evidencia declarada (fecha, auditor, URL). "Auditoría realizada" ≠ "aprobada"
 * ≠ "sin discriminación".
 *
 * Orientación de compliance, NO asesoría legal. Contenido revisado por el
 * subagente `compliance-domain-expert` (2026-07-18) contra fuentes oficiales
 * (DCWP/NYC Rules, Illinois General Assembly). Casi todos los controles son
 * territoriales → van marcados con su condición de aplicabilidad.
 */

import type { PolicyPack } from "./types";

export const US_HIRING_PACK: PolicyPack = {
  id: "us-hiring",
  name: "Contratación con IA — EE. UU.",
  tag: "EE. UU. · Contratación",
  summary:
    "Obligaciones del empleador que usa IA para contratar en EE. UU. (NYC Local Law 144 e Illinois). Aplícalo a un sistema de selección para precargar sus brechas.",
  note: "Obligaciones territoriales: aplican según dónde contrates. Snapshot regulatorio: julio 2026. Orientativo, no asesoría legal.",
  controls: [
    {
      id: "identificar-aedt",
      title: "Identifica qué herramientas de selección son un AEDT (orientativo)",
      description:
        "Revisa cada herramienta de reclutamiento (cribado de CVs, ranking, scoring, ciertas video-entrevistas) y determina si encaja en la definición de «automated employment decision tool»: un proceso computacional que usa aprendizaje automático, modelado estadístico, IA o analítica de datos y que emite una puntuación, clasificación o recomendación que sustituye o pesa sustancialmente en la decisión sobre un candidato o empleado. Esa clasificación determina qué obligaciones de LL144 recaen sobre ti como empleador. Conserva el razonamiento de por qué una herramienta es o no un AEDT.",
      article: "NYC LL144 · 6 RCNY §5-300",
      severity: "alta",
      conditional:
        "Solo si evalúas a candidatos/empleados para un puesto en la Ciudad de Nueva York (o residentes de NYC).",
    },
    {
      id: "auditoria-sesgo-independiente",
      title:
        "Registra una auditoría de sesgo independiente de menos de 12 meses (orientativo)",
      description:
        "Antes de usar un AEDT, tu organización debe asegurar que la herramienta pasó una auditoría de sesgo realizada por un auditor independiente (sin implicación en desarrollar u operar la herramienta ni interés financiero) con antigüedad no mayor a un año. Attesta NO realiza ni valida la auditoría: registra la fecha, el nombre del auditor independiente y la URL del resumen como evidencia declarada. Nota clave: la ley exige realizar y publicar la auditoría, no «aprobarla»; una auditoría que muestre impacto adverso no impide por sí el uso bajo LL144, pero eleva tu exposición antidiscriminación (Title VII).",
      article: "NYC LL144 · 6 RCNY §5-301",
      severity: "alta",
      conditional: "Solo si la herramienta es un AEDT usado para puestos en NYC.",
    },
    {
      id: "publicar-resumen-auditoria",
      title: "Publica el resumen de resultados de la auditoría en tu sitio web (orientativo)",
      description:
        "Tu organización debe publicar en una sección accesible de su web, antes de usar el AEDT, el resumen de resultados de la última auditoría de sesgo (selection/scoring rates e impact ratios por sexo, raza/etnia y categorías interseccionales, la fecha de distribución de la herramienta y la fecha de la auditoría). Attesta guarda el enlace público y la fecha de publicación como evidencia; no aloja ni certifica el contenido.",
      article: "NYC LL144 · 6 RCNY §5-302",
      severity: "alta",
      conditional: "Solo si la herramienta es un AEDT usado para puestos en NYC.",
    },
    {
      id: "aviso-candidato-nyc",
      title: "Avisa al candidato con al menos 10 días hábiles de antelación (orientativo)",
      description:
        "Al menos 10 días hábiles antes de usar el AEDT, informa a cada candidato o empleado residente en NYC de: (a) que se usará un AEDT en su evaluación; (b) las características de trabajo o cualificaciones que la herramienta evaluará; (c) el tipo de datos recogidos y su fuente (y, si se solicita, la política de retención); y (d) que puede solicitar un proceso de selección alternativo o una adaptación. Conserva la plantilla del aviso y evidencia de su entrega.",
      article: "NYC LL144 · 6 RCNY §5-303",
      severity: "alta",
      conditional: "Solo si la herramienta es un AEDT usado para puestos en NYC.",
    },
    {
      id: "aviso-uso-ia-illinois",
      title: "Avisa del uso de IA a candidatos y empleados (Illinois, orientativo)",
      description:
        "Si usas IA en decisiones de empleo en Illinois (reclutamiento, contratación, promoción, formación, despido, disciplina o condiciones de empleo), debes notificar a la persona afectada que se está usando IA. Prepara y conserva un aviso claro. Cautela: los reglamentos de detalle de la IDHR (circunstancias, momento y forma exacta del aviso) están pendientes, por lo que el formato preciso es incierto; trátalo como orientativo y vigila su reaparición para ajustar el aviso.",
      article: "Illinois HRA (HB 3773) · 775 ILCS 5/2-102",
      severity: "media",
      conditional: "Solo si contratas o gestionas empleo en Illinois.",
    },
    {
      id: "evitar-efecto-discriminatorio-il",
      title:
        "Evita que la IA produzca efecto discriminatorio o use proxies como el código postal (orientativo)",
      description:
        "En Illinois es una violación de derechos civiles usar IA que tenga el efecto de discriminar por clase protegida en decisiones de empleo, y usar el código postal como proxy de clase protegida. La responsabilidad se basa en el efecto, no en la intención. Como deployer: entiende cómo decide tu herramienta, exige al proveedor evidencia de sus pruebas de sesgo/impacto adverso, elimina variables proxy y documenta tus revisiones.",
      article: "Illinois HRA (HB 3773) · 775 ILCS 5/2-102, 1-103",
      severity: "alta",
      conditional: "Solo si contratas o gestionas empleo en Illinois.",
    },
    {
      id: "aivia-consentimiento",
      title:
        "Obtén consentimiento y explica cómo funciona la IA antes de la video-entrevista (orientativo)",
      description:
        "Antes de una video-entrevista analizada por IA, tu organización debe: (a) avisar al candidato de que puede usarse IA para analizar el vídeo; (b) explicar cómo funciona la IA y qué tipos de características usa para evaluar; y (c) obtener su consentimiento. No puedes analizar con IA a quien no consienta; ofrece una alternativa. Conserva el consentimiento y el texto explicativo como evidencia (a menudo depende de que el proveedor te facilite ese texto).",
      article: "Illinois AIVIA · 820 ILCS 42/5",
      severity: "alta",
      conditional:
        "Solo si usas IA para analizar video-entrevistas de candidatos en Illinois.",
    },
    {
      id: "aivia-borrado-30",
      title: "Borra el vídeo en 30 días cuando el candidato lo solicite (orientativo)",
      description:
        "Si un candidato lo solicita, tu organización debe eliminar sus video-entrevistas dentro de los 30 días siguientes a la solicitud e instruir a cualquier tercero que recibió copias (incluidos backups) para que también las borre. Habilita un canal para recibir estas solicitudes y registra la fecha de solicitud y de borrado.",
      article: "Illinois AIVIA · 820 ILCS 42/15",
      severity: "media",
      conditional:
        "Solo si usas IA para analizar video-entrevistas de candidatos en Illinois.",
    },
    {
      id: "aivia-reporte-demografico",
      title:
        "Recoge y reporta datos demográficos si solo la IA decide quién avanza (orientativo)",
      description:
        "Si tu organización se basa únicamente en el análisis por IA para decidir qué candidatos avanzan a una entrevista presencial, debe recoger y reportar anualmente al Departamento de Comercio datos de raza y etnia de quienes recibieron o no recibieron la entrevista presencial. Solo aplica en ese supuesto acotado.",
      article: "Illinois AIVIA · 820 ILCS 42/20",
      severity: "baja",
      conditional:
        "Solo si usas IA como único criterio para seleccionar quién pasa a entrevista presencial en Illinois.",
    },
    {
      id: "conservar-evidencia-us",
      title: "Conserva evidencia de auditorías, avisos y consentimientos (orientativo)",
      description:
        "Mantén un registro trazable por herramienta y por candidato: fecha y auditor de la última auditoría de sesgo, URL del resumen publicado, plantillas y entregas de avisos, consentimientos AIVIA, solicitudes de borrado, y la evidencia de las pruebas de sesgo exigidas al proveedor. Es la base para responder a una reclamación o a una investigación del DCWP (NYC) o de la IDHR (Illinois). Attesta actúa como system of record de esa evidencia declarada, no como certificador.",
      article: "Transversal · 6 RCNY §§5-301 a 5-303; 820 ILCS 42; 775 ILCS 5",
      severity: "media",
      conditional: "Aplica siempre que uses IA en contratación en EE. UU.",
    },
    {
      id: "baseline-federal-antidiscriminacion",
      title: "Mantén las buenas prácticas antidiscriminación federales (orientativo)",
      description:
        "Con independencia del estado, las leyes federales antidiscriminación siguen aplicando a las herramientas de selección con IA: pruebas de impacto adverso (Title VII), adaptaciones razonables y evitar el «screen out» de personas con discapacidad (ADA), y edad (ADEA). La EEOC retiró en 2025 su guía específica sobre IA, pero las leyes de fondo no cambiaron: no asumas que «ya no hay regla federal».",
      article: "Federal · Title VII, ADA, ADEA",
      severity: "media",
      conditional: "Aplica siempre en EE. UU. (riesgo legal de fondo, no un deber de «auditar la IA»).",
    },
  ],
};

/**
 * English (validated) mirror of US_HIRING_PACK. Content only:
 * `id`/`article`/`severity`/`conditional` logic kept identical to the ES pack;
 * `name`, `tag`, `summary`, `note`, titles and descriptions translated. The
 * employer is the direct obligee (no provider/deployer reframing). Attesta does
 * NOT perform or validate the bias audit — that stays as an explicit negation.
 */
export const US_HIRING_PACK_EN: PolicyPack = {
  id: "us-hiring",
  name: "AI hiring — United States",
  tag: "US · Hiring",
  summary:
    "Obligations of the employer that uses AI to hire in the US (NYC Local Law 144 and Illinois). Apply it to a selection system to preload its gaps.",
  note: "Territorial obligations: they apply depending on where you hire. Regulatory snapshot: July 2026. Indicative, not legal advice.",
  controls: [
    {
      id: "identificar-aedt",
      title: "Identify which selection tools are an AEDT (indicative)",
      description:
        "Review each recruiting tool (CV screening, ranking, scoring, certain video interviews) and determine whether it fits the definition of an \"automated employment decision tool\": a computational process using machine learning, statistical modeling, AI or data analytics that issues a score, classification or recommendation that substitutes for or substantially weighs in the decision about a candidate or employee. That classification determines which LL144 obligations fall on you as an employer. Keep the reasoning for why a tool is or is not an AEDT.",
      article: "NYC LL144 · 6 RCNY §5-300",
      severity: "alta",
      conditional:
        "Only if you assess candidates/employees for a position in New York City (or NYC residents).",
    },
    {
      id: "auditoria-sesgo-independiente",
      title:
        "Record an independent bias audit less than 12 months old (indicative)",
      description:
        "Before using an AEDT, your organization must ensure that the tool passed a bias audit performed by an independent auditor (not involved in developing or operating the tool and with no financial interest) no more than one year old. Attesta does NOT perform or validate the audit: it records the date, the name of the independent auditor and the URL of the summary as declared evidence. Key note: the law requires conducting and publishing the audit, not \"passing\" it; an audit that shows adverse impact does not by itself prevent use under LL144, but it raises your anti-discrimination exposure (Title VII).",
      article: "NYC LL144 · 6 RCNY §5-301",
      severity: "alta",
      conditional: "Only if the tool is an AEDT used for positions in NYC.",
    },
    {
      id: "publicar-resumen-auditoria",
      title:
        "Publish the summary of audit results on your website (indicative)",
      description:
        "Your organization must publish, in an accessible section of its website, before using the AEDT, the summary of results of the most recent bias audit (selection/scoring rates and impact ratios by sex, race/ethnicity and intersectional categories, the date the tool was distributed and the date of the audit). Attesta keeps the public link and the publication date as evidence; it does not host or certify the content.",
      article: "NYC LL144 · 6 RCNY §5-302",
      severity: "alta",
      conditional: "Only if the tool is an AEDT used for positions in NYC.",
    },
    {
      id: "aviso-candidato-nyc",
      title:
        "Notify the candidate at least 10 business days in advance (indicative)",
      description:
        "At least 10 business days before using the AEDT, inform each candidate or employee residing in NYC of: (a) that an AEDT will be used in their assessment; (b) the job qualifications or characteristics the tool will assess; (c) the type of data collected and its source (and, if requested, the retention policy); and (d) that they may request an alternative selection process or an accommodation. Keep the notice template and evidence of its delivery.",
      article: "NYC LL144 · 6 RCNY §5-303",
      severity: "alta",
      conditional: "Only if the tool is an AEDT used for positions in NYC.",
    },
    {
      id: "aviso-uso-ia-illinois",
      title:
        "Notify the use of AI to candidates and employees (Illinois, indicative)",
      description:
        "If you use AI in employment decisions in Illinois (recruitment, hiring, promotion, training, dismissal, discipline or terms of employment), you must notify the affected person that AI is being used. Prepare and keep a clear notice. Caution: the IDHR's detailed rules (the exact circumstances, timing and form of the notice) are pending, so the precise format is uncertain; treat it as indicative and watch for its reappearance to adjust the notice.",
      article: "Illinois HRA (HB 3773) · 775 ILCS 5/2-102",
      severity: "media",
      conditional: "Only if you hire or manage employment in Illinois.",
    },
    {
      id: "evitar-efecto-discriminatorio-il",
      title:
        "Prevent the AI from producing a discriminatory effect or using proxies such as the ZIP code (indicative)",
      description:
        "In Illinois it is a civil rights violation to use AI that has the effect of discriminating on a protected class in employment decisions, and to use the ZIP code as a proxy for a protected class. Liability is based on effect, not intent. As a deployer: understand how your tool decides, require from the provider evidence of its bias/adverse-impact testing, remove proxy variables and document your reviews.",
      article: "Illinois HRA (HB 3773) · 775 ILCS 5/2-102, 1-103",
      severity: "alta",
      conditional: "Only if you hire or manage employment in Illinois.",
    },
    {
      id: "aivia-consentimiento",
      title:
        "Obtain consent and explain how the AI works before the video interview (indicative)",
      description:
        "Before an AI-analyzed video interview, your organization must: (a) notify the candidate that AI may be used to analyze the video; (b) explain how the AI works and what types of characteristics it uses to evaluate; and (c) obtain their consent. You may not analyze with AI anyone who does not consent; offer an alternative. Keep the consent and the explanatory text as evidence (this often depends on the provider supplying that text to you).",
      article: "Illinois AIVIA · 820 ILCS 42/5",
      severity: "alta",
      conditional:
        "Only if you use AI to analyze candidates' video interviews in Illinois.",
    },
    {
      id: "aivia-borrado-30",
      title:
        "Delete the video within 30 days when the candidate requests it (indicative)",
      description:
        "If a candidate requests it, your organization must delete their video interviews within 30 days of the request and instruct any third party that received copies (including backups) to also delete them. Enable a channel to receive these requests and record the date of the request and of the deletion.",
      article: "Illinois AIVIA · 820 ILCS 42/15",
      severity: "media",
      conditional:
        "Only if you use AI to analyze candidates' video interviews in Illinois.",
    },
    {
      id: "aivia-reporte-demografico",
      title:
        "Collect and report demographic data if AI alone decides who advances (indicative)",
      description:
        "If your organization relies solely on AI analysis to decide which candidates advance to an in-person interview, it must collect and annually report to the Department of Commerce the race and ethnicity data of those who did and did not receive the in-person interview. This applies only in that narrow scenario.",
      article: "Illinois AIVIA · 820 ILCS 42/20",
      severity: "baja",
      conditional:
        "Only if you use AI as the sole criterion to select who advances to an in-person interview in Illinois.",
    },
    {
      id: "conservar-evidencia-us",
      title:
        "Keep evidence of audits, notices and consents (indicative)",
      description:
        "Maintain a traceable record per tool and per candidate: date and auditor of the most recent bias audit, URL of the published summary, notice templates and deliveries, AIVIA consents, deletion requests, and the evidence of the bias testing required from the provider. It is the basis for responding to a claim or to an investigation by the DCWP (NYC) or the IDHR (Illinois). Attesta acts as the system of record for that declared evidence, not as a certifier.",
      article: "Cross-cutting · 6 RCNY §§5-301 to 5-303; 820 ILCS 42; 775 ILCS 5",
      severity: "media",
      conditional: "Applies whenever you use AI in hiring in the US.",
    },
    {
      id: "baseline-federal-antidiscriminacion",
      title:
        "Maintain federal anti-discrimination good practices (indicative)",
      description:
        "Regardless of the state, federal anti-discrimination laws still apply to AI selection tools: adverse-impact testing (Title VII), reasonable accommodations and avoiding \"screening out\" people with disabilities (ADA), and age (ADEA). The EEOC withdrew its specific AI guidance in 2025, but the underlying laws did not change: do not assume that \"there is no longer a federal rule\".",
      article: "Federal · Title VII, ADA, ADEA",
      severity: "media",
      conditional:
        "Applies always in the US (underlying legal risk, not a duty to \"audit the AI\").",
    },
  ],
};
