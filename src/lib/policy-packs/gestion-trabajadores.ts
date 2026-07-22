/**
 * Policy pack — Gestión y monitorización de trabajadores (RRHH · people analytics).
 *
 * Catálogo de controles/obligaciones típicos de un sistema de IA que gestiona,
 * evalúa o monitoriza a trabajadores en una relación laboral YA existente
 * (evaluación de desempeño, asignación de tareas, promoción/terminación,
 * vigilancia). Es la otra mitad del Anexo III.4 del EU AI Act: el punto 4.(b),
 * frente al 4.(a) de selección/reclutamiento que cubre el pack `rrhh`.
 * Pensado para un DEPLOYER (empleador) mid-market. Precarga las brechas de un
 * gap assessment.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Contenido revisado por el
 * subagente `compliance-domain-expert` (2026-07-21) contra el texto del EU AI Act
 * (Anexo III.4.b y Arts. 4, 5.1.a/b/c/f, 14, 15, 26, 27, 50, 86), el RGPD
 * (Arts. 5, 13-14, 22, 35, 88) y la jurisprudencia del TEDH sobre vigilancia
 * laboral (Bărbulescu 2017, López Ribalda GS 2019). El texto literal del
 * Anexo III.4.b, el alcance de la prohibición de reconocimiento de emociones
 * (Art. 5.1.f) y los límites del social scoring (Art. 5.1.c) se verificaron
 * contra artificialintelligenceact.eu. Plazos del Digital Omnibus (alto riesgo
 * del Anexo III → 2-dic-2027) verificados contra Gibson Dunn, DLA Piper y
 * Covington (Consejo de la UE, 29-jun-2026).
 *
 * NOTA de producto: el control `emociones-prohibicion` es un TRIAJE, no una
 * brecha ordinaria. Inferir emociones en el trabajo es práctica PROHIBIDA
 * (Art. 5.1.f), no de alto riesgo: cerrar el control = "verifiqué que el sistema
 * NO infiere emociones o cesé su uso", nunca "preparé una práctica prohibida".
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";
import type { PolicyPack } from "./types";

export const GESTION_TRABAJADORES_PACK: PolicyPack = {
  id: "gestion-trabajadores",
  name: "Gestión y monitorización de trabajadores (EU AI Act)",
  tag: "UE · People analytics",
  summary:
    "Controles para IA de gestión, evaluación y monitorización de trabajadores (alto riesgo, Anexo III.4.b). Aplícalo a un sistema para precargar sus brechas.",
  note:
    "Plazos del EU AI Act (deployer): la alfabetización en IA (Art. 4) y las prohibiciones del Art. 5 —incluido el reconocimiento de emociones en el trabajo (Art. 5.1.f)— ya son exigibles (desde el 2-feb-2025); la transparencia del Art. 50 aplica el 2-ago-2026. Las obligaciones de alto riesgo del Anexo III.4.b (Arts. 14/26/27) se aplazaron al 2-dic-2027 con el Digital Omnibus, NO el 2-ago-2026 (un error extendido en el mercado). Además del AI Act aplica el RGPD y el derecho laboral nacional/convenios (Art. 88 RGPD), que pueden exigir consulta previa a los representantes. Este pack te deja lista la evidencia con antelación.",
  controls: [
    {
      id: "emociones-prohibicion",
      title: "Reconocimiento de emociones en el trabajo — práctica PROHIBIDA (triaje)",
      description:
        "Comprueba, ANTES de usar el sistema, si infiere emociones, afecto, estado de ánimo, estrés, atención o «compromiso» de trabajadores (p. ej. análisis de sentimiento de mensajes, tono de voz en llamadas, expresión facial o microexpresiones por webcam, señales de engagement). Inferir emociones de personas en el lugar de trabajo es una práctica PROHIBIDA por el AI Act, salvo fines médicos o de seguridad interpretados de forma estricta; una práctica prohibida no se prepara para auditoría, se cesa. Esto convierte a la herramienta en no comercializable ni utilizable en la UE (vigente desde el 2-feb-2025), no en un mero sistema de alto riesgo. Evidencia = confirmación documentada de si el sistema infiere o no emociones (funcionalidad declarada por el proveedor) y, si aplica, base médica/de seguridad y criterio jurídico que la respalde.",
      article: "Art. 5.1.f",
      severity: "alta",
      conditional:
        "Prohibición ya vigente (desde el 2-feb-2025). Si el sistema infiere emociones sin fin médico/seguridad, requiere revisión jurídica, no preparación.",
    },
    {
      id: "scoring-social-limite",
      title: "Puntuación de empleados dentro de límites (evitar social scoring prohibido)",
      description:
        "Si el sistema puntúa o clasifica a trabajadores a lo largo del tiempo, mantén el score ligado a datos laborales pertinentes y en su propio contexto (productividad, calidad, objetivos). Se acerca a la prohibición de «puntuación social» cuando incorpora datos ajenos al contexto laboral (vida privada, redes sociales, comportamiento social general) o produce un trato perjudicial desproporcionado o en ámbitos no relacionados con la conducta evaluada. Evidencia = descripción de las variables del score y su origen, y confirmación de que no cruza datos fuera de contexto con efectos desfavorables.",
      article: "Art. 5.1.c",
      severity: "media",
      conditional:
        "Prohibición ya vigente (desde el 2-feb-2025). Aplica solo si el sistema genera un score/clasificación de trabajadores.",
    },
    {
      id: "practicas-manipulativas",
      title: "Sin técnicas manipulativas ni explotación de vulnerabilidades",
      description:
        "Verifica que el sistema (p. ej. asignación de tareas/turnos gamificada, nudging de productividad) no emplee técnicas subliminales, engañosas o manipuladoras que distorsionen materialmente la conducta del trabajador, ni explote vulnerabilidades por edad, discapacidad o situación socioeconómica. Ambas son prácticas prohibidas. Evidencia = descripción de los mecanismos de incentivo/gamificación del sistema y confirmación de ausencia de estas técnicas.",
      article: "Art. 5.1.a / 5.1.b",
      severity: "media",
      conditional: "Prohibiciones ya vigentes (desde el 2-feb-2025).",
    },
    {
      id: "alfabetizacion-ia",
      title: "Alfabetización en IA del personal",
      description:
        "Adopta medidas para que quienes operan o supervisan la herramienta de gestión/monitorización (mandos, RRHH, People Analytics) tengan un nivel suficiente de alfabetización en IA —capacidades, límites y riesgos—, proporcionado a su rol. Es un deber PROPIO y directo del deployer, exigible desde el 2 de febrero de 2025. Evidencia = registro de la formación u onboarding impartido (fecha, asistentes y contenidos).",
      article: "Art. 4",
      severity: "media",
      conditional: "Exigible desde el 2 de febrero de 2025 (ya vigente).",
    },
    {
      id: "info-trabajadores",
      title: "Información a los trabajadores y a sus representantes",
      description:
        "Como empleador, antes de poner en servicio o usar la IA de alto riesgo en el lugar de trabajo, informa a los trabajadores afectados y a sus representantes de que estarán sujetos a ella. En este contexto de relación laboral viva suele ser además necesaria la consulta previa al comité de empresa/representantes conforme al derecho laboral nacional y a los convenios. Evidencia = comunicación a la plantilla y a los representantes (fecha y contenido) y, cuando proceda, acta de consulta.",
      article: "Art. 26.7",
      severity: "alta",
    },
    {
      id: "monitorizacion-proporcionada",
      title: "Monitorización proporcionada y minimización de datos",
      description:
        "Limita la monitorización a lo estrictamente necesario para la finalidad declarada: evita la vigilancia continua u omnipresente, minimiza los datos recogidos y prefiere la opción menos intrusiva (minimización, RGPD Art. 5.1.c). La proporcionalidad de la vigilancia laboral es exigible también por la jurisprudencia del TEDH (información previa, alcance limitado, ponderación de intereses). Evidencia = análisis de proporcionalidad documentado (finalidad, datos recogidos, alternativas menos intrusivas descartadas) y política de monitorización comunicada.",
      article: "GDPR Art. 5.1.c (proporcionalidad)",
      severity: "alta",
    },
    {
      id: "dpia",
      title: "Evaluación de impacto de protección de datos (DPIA)",
      description:
        "La monitorización sistemática de trabajadores y la evaluación/scoring de desempeño con perfilado casi siempre requieren una DPIA previa bajo el RGPD (Art. 35, en especial 35.3.b observación sistemática y evaluación a gran escala; los trabajadores se consideran colectivo vulnerable por el desequilibrio de poder). Realízala y documéntala antes de iniciar el tratamiento. Evidencia = DPIA firmada con fecha, riesgos y medidas mitigadoras.",
      article: "GDPR Art. 35",
      severity: "alta",
    },
    {
      id: "normativa-laboral-nacional",
      title: "Derecho laboral nacional y convenios (Art. 88 RGPD)",
      description:
        "Verifica las reglas específicas del país sobre tratamiento de datos de trabajadores: el RGPD (Art. 88) habilita a los Estados miembros y a los convenios colectivos a imponer requisitos adicionales (consulta a representantes, límites a la videovigilancia/geolocalización/control de comunicaciones, salvaguardas de dignidad). Estas reglas varían por país y pueden condicionar o prohibir usos concretos. Evidencia = identificación de la normativa laboral/convenio aplicable y confirmación de su cumplimiento (o dictamen que lo respalde).",
      article: "GDPR Art. 88",
      severity: "media",
      conditional:
        "El alcance depende de la jurisdicción y del convenio colectivo aplicable.",
    },
    {
      id: "supervision-humana",
      title: "Supervisión humana efectiva en la decisión",
      description:
        "Asigna la supervisión a una persona competente, formada y con autoridad para revisar, no seguir o anular la recomendación de la IA antes de una decisión de desempeño, asignación, promoción o terminación. Como deployer, DESIGNAR a esa persona es tu obligación (Art. 26.2); que el sistema permita la supervisión es diseño del proveedor (Art. 14). Evidencia = persona/rol designado, su formación y el procedimiento de revisión/anulación.",
      article: "Art. 26.2 (y Art. 14)",
      severity: "alta",
    },
    {
      id: "decision-automatizada",
      title: "Decisión no meramente automatizada (GDPR)",
      description:
        "Si hay decisiones con efecto significativo sobre el trabajador (p. ej. despido, sanción, denegación de promoción o asignación desfavorable automáticas), asegura una intervención humana real y el derecho del afectado a expresar su punto de vista, obtener explicación e impugnar (RGPD Art. 22). El AI Act lo refuerza con el derecho a una explicación clara del papel del sistema en decisiones de alto riesgo (Art. 86). Evidencia = diseño del flujo que garantiza intervención humana y canal de impugnación.",
      article: "GDPR Art. 22 (y Art. 86)",
      severity: "alta",
    },
    {
      id: "sesgo",
      title: "No discriminación y control de sesgo",
      description:
        "El deber directo del empleador nace de la normativa antidiscriminación (p. ej. Directivas UE 2000/78/CE, 2006/54/CE, 2000/43/CE y la ley nacional): vigila que la evaluación de desempeño, la asignación de tareas o las decisiones de promoción/terminación no produzcan impacto desigual por características protegidas (sexo, edad, origen, discapacidad) y documéntalo. Exige además al proveedor evidencia de sus pruebas de sesgo sobre los datos de entrenamiento (obligación del proveedor, Art. 10, no tuya como deployer). Evidencia = análisis de impacto desigual propio + documentación de sesgo exigida al proveedor.",
      article: "Normativa antidiscriminación (Art. 10 = proveedor)",
      severity: "alta",
    },
    {
      id: "transparencia-afectado",
      title: "Información a la persona afectada por la decisión",
      description:
        "Informa a la persona trabajadora de que está sujeta a un sistema de IA de alto riesgo (obligación del deployer, Art. 26.11) y facilita la información de protección de datos del RGPD: finalidad, base jurídica, lógica implicada y datos tratados (Arts. 13-14). Evidencia = aviso entregado al trabajador y plantilla de información de protección de datos.",
      article: "Art. 26.11 (y GDPR Arts. 13-14)",
      severity: "media",
    },
    {
      id: "explicacion",
      title: "Derecho a explicación de decisiones individuales (Art. 86)",
      description:
        "Prepara el circuito para atender solicitudes de explicación clara y significativa del papel del sistema de IA en una decisión individual de alto riesgo con efectos significativos (promoción, terminación, sanción, asignación). Evidencia = procedimiento y plantilla de respuesta a solicitudes de explicación, con registro de las emitidas.",
      article: "Art. 86",
      severity: "alta",
      conditional:
        "Exigible con el régimen de alto riesgo del Anexo III (2-dic-2027).",
    },
    {
      id: "datos-entrada",
      title: "Datos de entrada pertinentes y representativos",
      description:
        "En la medida en que controlas los datos de entrada (métricas de desempeño, registros de actividad/comportamiento, objetivos, ponderaciones), asegúrate de que son pertinentes, exactos y suficientemente representativos para la finalidad prevista, y de no introducir señales espurias (p. ej. proxies de características protegidas). Evidencia = descripción de las fuentes de datos de entrada y su validación.",
      article: "Art. 26.4",
      severity: "media",
    },
    {
      id: "transparencia-art50",
      title: "Transparencia de categorización biométrica (Art. 50)",
      description:
        "Deber PROPIO del deployer (aplicable desde el 2 de agosto de 2026): si expones a trabajadores a un sistema de categorización biométrica (permitido solo en supuestos acotados y con fin de seguridad), debes informarles de su funcionamiento (Art. 50.3); si difundes contenido generado o manipulado por IA, etiquétalo (Art. 50.4). ATENCIÓN: el uso más habitual en este ámbito —inferir emociones— NO se resuelve con transparencia: está prohibido (ver control de emociones). Evidencia = aviso de categorización biométrica entregado y registro del etiquetado de contenido.",
      article: "Art. 50.3/50.4 (deployer)",
      severity: "media",
      conditional:
        "Transparencia del Art. 50 aplicable desde el 2 de agosto de 2026. Aplica solo si hay categorización biométrica o contenido sintético difundido.",
    },
    {
      id: "documentacion",
      title: "Uso conforme a instrucciones y documentación del proveedor",
      description:
        "Usa el sistema conforme a las instrucciones de uso del proveedor (Art. 26.1). Exige y conserva como evidencia la información que debe facilitarte (instrucciones de uso e información del Anexo IV / Art. 11, obligación del proveedor). Evidencia = instrucciones de uso archivadas y confirmación de que el uso real se ajusta a la finalidad prevista.",
      article: "Art. 26.1 (Anexo IV/Art. 11 = proveedor)",
      severity: "media",
    },
    {
      id: "logs",
      title: "Conservación de registros (logs) del sistema",
      description:
        "Conserva los logs generados automáticamente por el sistema, en la medida en que estén bajo tu control, durante un periodo adecuado a la finalidad y de al menos 6 meses. Evidencia = política de retención de logs y confirmación del periodo configurado.",
      article: "Art. 26.6",
      severity: "media",
    },
    {
      id: "exactitud-robustez",
      title: "Exactitud, robustez y ciberseguridad (exige evidencia)",
      description:
        "El nivel adecuado de exactitud, robustez y ciberseguridad es obligación de diseño del proveedor (Art. 15): exígele las métricas y sus límites declarados —especialmente la fiabilidad de las inferencias sobre desempeño/comportamiento— y vigila en uso real que el rendimiento se mantiene (Art. 26.5). Evidencia = métricas y límites declarados por el proveedor + registro de tu verificación en uso.",
      article: "Art. 15 (proveedor) + Art. 26.5",
      severity: "media",
    },
    {
      id: "monitoreo",
      title: "Monitoreo del funcionamiento y revisión periódica",
      description:
        "Vigila el funcionamiento del sistema conforme a las instrucciones; si aprecias que su uso puede presentar un riesgo, suspende el uso e informa al proveedor y, cuando proceda, a la autoridad, y notifica los incidentes graves. Programa una revisión periódica (p. ej. anual o ante cambios). Evidencia = registro de revisiones, incidencias detectadas y acciones tomadas.",
      article: "Art. 26.5",
      severity: "media",
    },
    {
      id: "conservacion-evidencia",
      title: "Conservación de evidencia de tus propias decisiones",
      description:
        "Guarda registro de las decisiones y revisiones humanas (motivo de una evaluación, promoción, sanción o terminación asistida por IA, quién revisó y cuándo) para rendir cuentas (responsabilidad proactiva, RGPD Art. 5.2), responder a solicitudes de explicación (Art. 86) y defenderte ante reclamaciones laborales o de discriminación. Evidencia = expediente de decisión con la intervención humana registrada.",
      article: "GDPR Art. 5.2 (y Art. 86)",
      severity: "media",
    },
    {
      id: "fria",
      title: "Evaluación de impacto en derechos fundamentales (FRIA) — normalmente NO aplica",
      description:
        "La FRIA del AI Act NO es exigible a un empleador privado ordinario que usa IA para gestionar a su plantilla (Anexo III.4.b). Solo aplica si sois un organismo de Derecho público o una entidad privada que presta servicios públicos. Se incluye para dejar constancia de que se evaluó su aplicabilidad; en la mayoría de casos privados se marca como no aplicable. Evidencia = nota de aplicabilidad (público/servicio público sí; privado ordinario no).",
      article: "Art. 27",
      severity: "baja",
      conditional:
        "Solo si el deployer es organismo público o presta servicios públicos.",
    },
  ],
};

/**
 * English (validated) mirror of GESTION_TRABAJADORES_PACK. Content only:
 * `id`/`article`/`severity`/`conditional` logic kept identical to the ES pack;
 * `name`, `tag`, `summary`, `note`, titles and descriptions translated.
 * Deployer framing and prohibited-copy rules preserved. Art. 5.1.f is kept as a
 * PROHIBITION (triage: stop, don't prepare), not audit-readiness.
 */
export const GESTION_TRABAJADORES_PACK_EN: PolicyPack = {
  id: "gestion-trabajadores",
  name: "Worker management and monitoring (EU AI Act)",
  tag: "EU · People analytics",
  summary:
    "Controls for AI that manages, evaluates and monitors workers (high-risk, Annex III.4.b). Apply it to a system to preload its gaps.",
  note:
    "EU AI Act deadlines (deployer): AI literacy (Art. 4) and the Art. 5 prohibitions —including emotion recognition in the workplace (Art. 5.1.f)— are already enforceable (since 2 Feb 2025); Art. 50 transparency applies on 2 Aug 2026. The Annex III.4.b high-risk obligations (Arts. 14/26/27) were postponed to 2 Dec 2027 by the Digital Omnibus, NOT 2 Aug 2026 (a widespread misconception in the market). Beyond the AI Act, the GDPR and national labour law/collective agreements also apply (Art. 88 GDPR), which may require prior consultation of representatives. This pack gets your evidence ready ahead of time.",
  controls: [
    {
      id: "emociones-prohibicion",
      title:
        "Emotion recognition in the workplace — PROHIBITED practice (triage)",
      description:
        "Check, BEFORE using the system, whether it infers emotions, affect, mood, stress, attention or «engagement» of workers (e.g. sentiment analysis of messages, tone of voice in calls, facial expression or micro-expressions via webcam, engagement signals). Inferring the emotions of people in the workplace is a practice PROHIBITED by the AI Act, except for medical or safety purposes interpreted strictly; a prohibited practice is not prepared for audit, it is stopped. This makes the tool non-marketable and unusable in the EU (in force since 2 Feb 2025), not merely a high-risk system. Evidence = documented confirmation of whether or not the system infers emotions (functionality declared by the provider) and, where applicable, the medical/safety basis and the legal reasoning supporting it.",
      article: "Art. 5.1.f",
      severity: "alta",
      conditional:
        "Prohibition already in force (since 2 Feb 2025). If the system infers emotions without a medical/safety purpose, it requires legal review, not preparation.",
    },
    {
      id: "scoring-social-limite",
      title:
        "Scoring employees within limits (avoiding prohibited social scoring)",
      description:
        "If the system scores or classifies workers over time, keep the score tied to relevant work-related data and within its own context (productivity, quality, targets). It approaches the prohibition on «social scoring» when it incorporates data unrelated to the work context (private life, social media, general social behaviour) or produces disproportionate detrimental treatment or treatment in areas unrelated to the conduct being evaluated. Evidence = description of the score's variables and their origin, and confirmation that it does not cross-reference out-of-context data with unfavourable effects.",
      article: "Art. 5.1.c",
      severity: "media",
      conditional:
        "Prohibition already in force (since 2 Feb 2025). Applies only if the system generates a score/classification of workers.",
    },
    {
      id: "practicas-manipulativas",
      title: "No manipulative techniques or exploitation of vulnerabilities",
      description:
        "Verify that the system (e.g. gamified task/shift allocation, productivity nudging) does not employ subliminal, deceptive or manipulative techniques that materially distort the worker's behaviour, nor exploit vulnerabilities due to age, disability or socio-economic situation. Both are prohibited practices. Evidence = description of the system's incentive/gamification mechanisms and confirmation that these techniques are absent.",
      article: "Art. 5.1.a / 5.1.b",
      severity: "media",
      conditional: "Prohibitions already in force (since 2 Feb 2025).",
    },
    {
      id: "alfabetizacion-ia",
      title: "AI literacy of staff",
      description:
        "Take measures so that those who operate or oversee the management/monitoring tool (managers, HR, People Analytics) have a sufficient level of AI literacy —capabilities, limits and risks—, proportionate to their role. This is a DIRECT, OWN duty of the deployer, enforceable since 2 February 2025. Evidence = record of the training or onboarding delivered (date, attendees and content).",
      article: "Art. 4",
      severity: "media",
      conditional: "Enforceable since 2 February 2025 (already in force).",
    },
    {
      id: "info-trabajadores",
      title: "Information to workers and their representatives",
      description:
        "As an employer, before putting the high-risk AI into service or using it in the workplace, inform the affected workers and their representatives that they will be subject to it. In this context of an ongoing employment relationship, prior consultation of the works council/representatives under national labour law and collective agreements is also usually required. Evidence = communication to the workforce and representatives (date and content) and, where appropriate, minutes of the consultation.",
      article: "Art. 26.7",
      severity: "alta",
    },
    {
      id: "monitorizacion-proporcionada",
      title: "Proportionate monitoring and data minimisation",
      description:
        "Limit monitoring to what is strictly necessary for the stated purpose: avoid continuous or omnipresent surveillance, minimise the data collected and prefer the least intrusive option (minimisation, GDPR Art. 5.1.c). The proportionality of workplace surveillance is also required by ECtHR case law (prior information, limited scope, balancing of interests). Evidence = documented proportionality analysis (purpose, data collected, less intrusive alternatives discarded) and a communicated monitoring policy.",
      article: "GDPR Art. 5.1.c (proporcionalidad)",
      severity: "alta",
    },
    {
      id: "dpia",
      title: "Data protection impact assessment (DPIA)",
      description:
        "Systematic monitoring of workers and the evaluation/scoring of performance with profiling almost always require a prior DPIA under the GDPR (Art. 35, especially 35.3.b systematic observation and large-scale evaluation; workers are regarded as a vulnerable group owing to the power imbalance). Carry it out and document it before starting the processing. Evidence = signed DPIA with date, risks and mitigating measures.",
      article: "GDPR Art. 35",
      severity: "alta",
    },
    {
      id: "normativa-laboral-nacional",
      title: "National labour law and collective agreements (Art. 88 GDPR)",
      description:
        "Check the country-specific rules on processing workers' data: the GDPR (Art. 88) empowers Member States and collective agreements to impose additional requirements (consultation of representatives, limits on video surveillance/geolocation/monitoring of communications, dignity safeguards). These rules vary by country and may condition or prohibit specific uses. Evidence = identification of the applicable labour law/collective agreement and confirmation of compliance (or a supporting legal opinion).",
      article: "GDPR Art. 88",
      severity: "media",
      conditional:
        "The scope depends on the jurisdiction and the applicable collective agreement.",
    },
    {
      id: "supervision-humana",
      title: "Effective human oversight in the decision",
      description:
        "Assign oversight to a competent person, trained and with authority to review, not follow or override the AI's recommendation before a performance, allocation, promotion or termination decision. As a deployer, DESIGNATING that person is your obligation (Art. 26.2); that the system enables oversight is the provider's design (Art. 14). Evidence = designated person/role, their training and the review/override procedure.",
      article: "Art. 26.2 (y Art. 14)",
      severity: "alta",
    },
    {
      id: "decision-automatizada",
      title: "Decision not solely automated (GDPR)",
      description:
        "If there are decisions with a significant effect on the worker (e.g. automatic dismissal, sanction, denial of promotion or unfavourable assignment), ensure genuine human intervention and the affected person's right to express their point of view, obtain an explanation and contest it (GDPR Art. 22). The AI Act reinforces this with the right to a clear explanation of the system's role in high-risk decisions (Art. 86). Evidence = flow design that guarantees human intervention and a channel to contest.",
      article: "GDPR Art. 22 (y Art. 86)",
      severity: "alta",
    },
    {
      id: "sesgo",
      title: "Non-discrimination and bias control",
      description:
        "The employer's direct duty arises from anti-discrimination law (e.g. EU Directives 2000/78/EC, 2006/54/EC, 2000/43/EC and national law): monitor that performance evaluation, task allocation or promotion/termination decisions do not produce disparate impact on protected characteristics (sex, age, origin, disability) and document it. Also require from the provider evidence of its bias testing on the training data (a provider obligation, Art. 10, not yours as deployer). Evidence = your own disparate-impact analysis + bias documentation required from the provider.",
      article: "Normativa antidiscriminación (Art. 10 = proveedor)",
      severity: "alta",
    },
    {
      id: "transparencia-afectado",
      title: "Information to the person affected by the decision",
      description:
        "Inform the worker that they are subject to a high-risk AI system (a deployer obligation, Art. 26.11) and provide the GDPR data-protection information: purpose, legal basis, logic involved and data processed (Arts. 13-14). Evidence = notice given to the worker and a data-protection information template.",
      article: "Art. 26.11 (y GDPR Arts. 13-14)",
      severity: "media",
    },
    {
      id: "explicacion",
      title: "Right to explanation of individual decisions (Art. 86)",
      description:
        "Set up the process to handle requests for a clear and meaningful explanation of the AI system's role in an individual high-risk decision with significant effects (promotion, termination, sanction, assignment). Evidence = procedure and response template for explanation requests, with a record of those issued.",
      article: "Art. 86",
      severity: "alta",
      conditional:
        "Enforceable under the Annex III high-risk regime (2 Dec 2027).",
    },
    {
      id: "datos-entrada",
      title: "Relevant and representative input data",
      description:
        "To the extent that you control the input data (performance metrics, activity/behaviour logs, targets, weightings), ensure that they are relevant, accurate and sufficiently representative for the intended purpose, and do not introduce spurious signals (e.g. proxies for protected characteristics). Evidence = description of the input data sources and their validation.",
      article: "Art. 26.4",
      severity: "media",
    },
    {
      id: "transparencia-art50",
      title: "Transparency of biometric categorisation (Art. 50)",
      description:
        "The deployer's OWN duty (applicable from 2 August 2026): if you expose workers to a biometric-categorisation system (permitted only in narrowly defined cases and for a safety purpose), you must inform them of its operation (Art. 50.3); if you disseminate AI-generated or manipulated content, label it (Art. 50.4). WARNING: the most common use in this area —inferring emotions— is NOT resolved by transparency: it is prohibited (see the emotions control). Evidence = biometric-categorisation notice given and a record of content labelling.",
      article: "Art. 50.3/50.4 (deployer)",
      severity: "media",
      conditional:
        "Art. 50 transparency applicable from 2 August 2026. Applies only if there is biometric categorisation or disseminated synthetic content.",
    },
    {
      id: "documentacion",
      title: "Use in line with the provider's instructions and documentation",
      description:
        "Use the system in accordance with the provider's instructions for use (Art. 26.1). Require and keep as evidence the information the provider must supply to you (instructions for use and the Annex IV / Art. 11 information, a provider obligation). Evidence = archived instructions for use and confirmation that real use conforms to the intended purpose.",
      article: "Art. 26.1 (Annex IV/Art. 11 = proveedor)",
      severity: "media",
    },
    {
      id: "logs",
      title: "Retention of the system's logs",
      description:
        "Keep the logs automatically generated by the system, to the extent they are under your control, for a period appropriate to the purpose and of at least 6 months. Evidence = log retention policy and confirmation of the configured period.",
      article: "Art. 26.6",
      severity: "media",
    },
    {
      id: "exactitud-robustez",
      title: "Accuracy, robustness and cybersecurity (require evidence)",
      description:
        "An appropriate level of accuracy, robustness and cybersecurity is the provider's design obligation (Art. 15): require from it the declared metrics and their limits —especially the reliability of inferences about performance/behaviour— and monitor in real use that performance is maintained (Art. 26.5). Evidence = metrics and limits declared by the provider + a record of your verification in use.",
      article: "Art. 15 (proveedor) + Art. 26.5",
      severity: "media",
    },
    {
      id: "monitoreo",
      title: "Monitoring of operation and periodic review",
      description:
        "Monitor the system's operation in accordance with the instructions; if you find that its use may present a risk, suspend use and inform the provider and, where appropriate, the authority, and report serious incidents. Schedule a periodic review (e.g. annual or upon changes). Evidence = record of reviews, incidents detected and actions taken.",
      article: "Art. 26.5",
      severity: "media",
    },
    {
      id: "conservacion-evidencia",
      title: "Retention of evidence of your own decisions",
      description:
        "Keep a record of the decisions and human reviews (reason for an AI-assisted evaluation, promotion, sanction or termination, who reviewed and when) to demonstrate accountability (GDPR Art. 5.2), respond to explanation requests (Art. 86) and defend yourself against labour or discrimination claims. Evidence = decision file with the human intervention recorded.",
      article: "GDPR Art. 5.2 (y Art. 86)",
      severity: "media",
    },
    {
      id: "fria",
      title:
        "Fundamental rights impact assessment (FRIA) — usually does NOT apply",
      description:
        "The AI Act FRIA is NOT required of an ordinary private employer that uses AI to manage its workforce (Annex III.4.b). It only applies if you are a public-law body or a private entity providing public services. It is included to record that its applicability was assessed; in most private cases it is marked as not applicable. Evidence = applicability note (public body/public service yes; ordinary private no).",
      article: "Art. 27",
      severity: "baja",
      conditional:
        "Only if the deployer is a public body or provides public services.",
    },
  ],
};
