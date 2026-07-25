/**
 * Policy pack — Educación y formación (EU AI Act).
 *
 * Catálogo de controles/obligaciones típicos de un sistema de IA usado por un
 * centro educativo o de formación (o por una plataforma EdTech que ellos
 * despliegan) para admisión, evaluación del aprendizaje, orientación del
 * itinerario o supervisión de exámenes (proctoring). Cubre el Anexo III.3 del
 * EU AI Act. Pensado para un DEPLOYER (el centro/comprador que USA la IA) del
 * mid-market. Precarga las brechas de un gap assessment.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Contenido investigado y
 * verificado en DOS pasadas por el subagente `compliance-domain-expert`
 * (2026-07-25): (1) redacción del draft contra el texto del EU AI Act (Anexo
 * III.3.a-d y Arts. 4, 5.1.a/b/f, 14, 26, 27, 49, 50, 86), el RGPD (Arts. 5, 13-14,
 * 22, 35 y Considerando 71) y la normativa antidiscriminación; (2) revisión
 * adversarial de las citas y el encuadre deployer/proveedor. El texto literal del
 * Anexo III.3.d (proctoring), el alcance de la prohibición de reconocimiento de
 * emociones en centros educativos (Art. 5.1.f) y el alcance del Art. 27.1 (FRIA) se
 * verificaron contra artificialintelligenceact.eu, EUR-Lex y despachos (FPF,
 * Gibson Dunn, White & Case, Freshfields).
 *
 * TRAMPAS clave de este vertical (por eso el pack existe):
 *  · Inferir emociones/atención/«compromiso» de estudiantes por biometría en un
 *    centro educativo es PRÁCTICA PROHIBIDA (Art. 5.1.f), no alto riesgo →
 *    `emociones-prohibicion` es `prohibited:true` (triaje: se cesa, no se prepara).
 *  · El proctoring (III.3.d) es alto riesgo GESTIONABLE si detecta comportamiento
 *    observable, pero cruza a la PROHIBICIÓN si infiere estados internos por
 *    biometría → se documenta la línea roja, no se afirma la clasificación.
 *  · A diferencia de RRHH, la FRIA (Art. 27) SÍ suele aplicar: muchos centros son
 *    organismos públicos o prestan un servicio público → severidad `alta`.
 *  · Hay menores → protección reforzada del RGPD y presunción del Considerando 71
 *    contra decisiones únicamente automatizadas sobre un menor.
 *
 * Plazos verificados: Art. 4 y Art. 5 vigentes desde 2-feb-2025; Art. 50 el
 * 2-ago-2026; alto riesgo del Anexo III aplazado al 2-dic-2027 por el Digital
 * Omnibus (adoptado por el Consejo 29-jun-2026 y firmado 8-jul-2026; su entrada en
 * vigor depende de la publicación en el DOUE → la `note` pide verificar ese estado
 * antes de basar decisiones en la fecha de 2027, coherente con la regla de marca de
 * no fingir certeza).
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";
import type { PolicyPack } from "./types";

export const EDUCACION_PACK: PolicyPack = {
  id: "educacion",
  name: "Educación y formación (EU AI Act)",
  tag: "UE · Educación",
  summary:
    "Controles para IA usada por centros educativos o EdTech en admisión, evaluación del aprendizaje y proctoring (alto riesgo, Anexo III.3). Aplícalo a un sistema para precargar sus brechas.",
  note:
    "Plazos del EU AI Act (deployer): la alfabetización en IA (Art. 4) y las prohibiciones del Art. 5 —incluido el reconocimiento de emociones de estudiantes en centros educativos (Art. 5.1.f)— ya son exigibles (desde el 2-feb-2025); la transparencia del Art. 50 aplica el 2-ago-2026. Las obligaciones de alto riesgo del Anexo III.3 (admisión, evaluación de aprendizaje, proctoring; Arts. 14/26/27/86) se aplazaron al 2-dic-2027 con el Digital Omnibus, NO el 2-ago-2026 (un error extendido en el mercado); el aplazamiento fue adoptado (Consejo, 29-jun-2026) y firmado (8-jul-2026): confirma su publicación en el DOUE antes de planificar sobre la fecha de 2027. DOS particularidades frente a RRHH: (1) la FRIA (Art. 27) aplica cuando el deployer es organismo de Derecho público o entidad privada que presta un servicio público (la educación se cita como servicio de naturaleza pública) — no a todo EdTech privado; (2) hay menores → protección reforzada del RGPD. Aplica además el RGPD y el derecho educativo nacional. Este pack te deja lista la evidencia con antelación.",
  controls: [
    {
      id: "emociones-prohibicion",
      title:
        "Reconocimiento de emociones de estudiantes — práctica PROHIBIDA (triaje)",
      description:
        "Comprueba, ANTES de usar el sistema, si infiere emociones, afecto, atención, aburrimiento, frustración, estrés, ansiedad o «compromiso»/engagement de estudiantes a partir de datos biométricos (p. ej. expresión facial o microexpresiones por webcam, seguimiento de la mirada, tono de voz, señales de atención). Inferir emociones de personas en centros educativos es una práctica PROHIBIDA por el AI Act, salvo fines médicos o de seguridad interpretados de forma estricta (una alerta de bienestar general no basta). «Centro educativo» se interpreta de forma amplia: todos los niveles, presencial u online, e incluso durante la admisión. Una práctica prohibida no se prepara para auditoría, se cesa: convierte a la herramienta en no utilizable en la UE (vigente desde el 2-feb-2025), no en un mero sistema de alto riesgo. Evidencia = confirmación documentada de si el sistema infiere o no emociones (funcionalidad declarada por el proveedor) y, si aplica, base médica/de seguridad y criterio jurídico que la respalde.",
      article: "Art. 5.1.f",
      severity: "alta",
      prohibited: true,
      conditional:
        "Prohibición ya vigente (desde el 2-feb-2025). Si el sistema infiere emociones de estudiantes sin fin médico/seguridad estricto, requiere revisión jurídica y cese, no preparación.",
    },
    {
      id: "proctoring-alto-riesgo",
      title: "Proctoring de exámenes: alto riesgo, con línea roja biométrica",
      description:
        "La supervisión automatizada para detectar comportamiento prohibido de estudiantes DURANTE los exámenes es un uso de alto riesgo (Anexo III.3.d). TRAMPA clave: si el proctoring detecta eventos o comportamientos observables (p. ej. una segunda persona en cámara, abandono de la ventana, ruido), puede gestionarse como alto riesgo; pero si infiere estados internos a partir de biometría (mirada, microexpresiones, «nerviosismo» o «probable intención de copiar»), cruza a la PROHIBICIÓN del Art. 5.1.f y no es preparable (ver control de emociones). La clasificación exacta de un producto depende de cómo funcione: documenta qué señales usa; una tarea procedimental estrecha podría no ser alto riesgo (filtro del Art. 6.3), salvo que perfile a los estudiantes. Nota: un antiplagio documental clásico (comparación de texto) normalmente NO entra en III.3.d, que se refiere a la vigilancia del examinando en tiempo real. Evidencia = descripción de las señales/entradas del proctoring y determinación documentada de si son observables (alto riesgo) o inferencia biométrica de estados internos (prohibido).",
      article: "Anexo III.3.d (y Art. 5.1.f)",
      severity: "alta",
      conditional:
        "Alto riesgo del Anexo III aplazado al 2-dic-2027 (Omnibus, sujeto a publicación en el DOUE); la prohibición del Art. 5.1.f (inferencia biométrica de emociones/atención) ya está vigente.",
    },
    {
      id: "vulnerabilidades-menores",
      title:
        "Sin explotación de la vulnerabilidad de los menores ni técnicas manipulativas",
      description:
        "Verifica que el sistema (p. ej. tutor adaptativo gamificado, nudging del aprendizaje, recomendadores) no emplee técnicas subliminales, engañosas o manipuladoras que distorsionen materialmente la conducta del alumno, ni explote vulnerabilidades derivadas de la edad (menores) o de una discapacidad. Ambas son prácticas prohibidas del AI Act. Como el alumnado suele ser menor de edad —colectivo especialmente protegido— mantén el diseño dentro de límites y prioriza el interés educativo. Evidencia = descripción de los mecanismos de incentivo/personalización del sistema y confirmación de ausencia de estas técnicas.",
      article: "Art. 5.1.a / 5.1.b",
      severity: "media",
      conditional: "Prohibiciones ya vigentes (desde el 2-feb-2025).",
    },
    {
      id: "fria",
      title:
        "Evaluación de impacto en derechos fundamentales (FRIA) — suele aplicar en educación",
      description:
        "A diferencia del empleador privado ordinario, en educación la FRIA del AI Act SÍ suele ser exigible: obliga a los deployers que son organismos de Derecho público (colegios/universidades públicas) y a las entidades privadas que prestan un servicio público (la educación se cita como servicio de naturaleza pública). NO alcanza automáticamente a todo EdTech privado ni a la formación corporativa interna. Determina primero si tu organización entra en el ámbito del Art. 27.1; si entra, antes del primer uso de la IA de alto riesgo del Anexo III.3 evalúa y documenta el impacto en derechos fundamentales: colectivos afectados (incl. menores), riesgos (discriminación, privacidad, debido proceso), medidas de supervisión humana y mitigaciones. Evidencia = FRIA firmada y fechada, o nota motivada de no aplicabilidad si sois entidad privada sin función de servicio público.",
      article: "Art. 27",
      severity: "alta",
      conditional:
        "Aplica si el deployer es organismo público o presta servicios públicos. Exigible con el régimen de alto riesgo (2-dic-2027, sujeto a publicación del Omnibus).",
    },
    {
      id: "dpia",
      title: "Evaluación de impacto de protección de datos (DPIA)",
      description:
        "La evaluación sistemática de estudiantes con perfilado y, sobre todo, el tratamiento de datos de menores a gran escala casi siempre requieren una DPIA previa bajo el RGPD (Art. 35, en especial 35.3.a evaluación sistemática y 35.3.b tratamiento a gran escala; los menores son colectivo vulnerable). Realízala y documéntala antes de iniciar el tratamiento. La DPIA (RGPD) y la FRIA (AI Act) son distintas pero pueden coordinarse. Evidencia = DPIA firmada con fecha, riesgos y medidas mitigadoras.",
      article: "GDPR Art. 35",
      severity: "alta",
    },
    {
      id: "datos-menores",
      title: "Protección reforzada de datos de menores",
      description:
        "El alumnado suele ser menor de edad: aplica salvaguardas reforzadas del RGPD y el interés superior del menor. Verifica la base jurídica del tratamiento y, cuando proceda, el consentimiento de los titulares de la patria potestad; minimiza los datos; evita usos secundarios (p. ej. publicidad o entrenamiento de modelos con datos de alumnos) sin base válida; y comprueba las reglas nacionales sobre edad de consentimiento digital. Evidencia = base jurídica documentada, política de datos de menores y confirmación de que no hay usos secundarios sin base.",
      article: "GDPR (datos de menores)",
      severity: "alta",
    },
    {
      id: "supervision-humana",
      title: "Supervisión humana efectiva en la decisión",
      description:
        "Asigna la supervisión a una persona competente, formada y con autoridad para revisar, no seguir o anular la recomendación de la IA antes de una decisión de admisión, calificación, asignación de itinerario o medida disciplinaria. Como deployer, DESIGNAR a esa persona es tu obligación (Art. 26.2); que el sistema permita la supervisión es diseño del proveedor (Art. 14). Evidencia = persona/rol designado (p. ej. profesorado, comité de admisiones), su formación y el procedimiento de revisión/anulación.",
      article: "Art. 26.2 (y Art. 14)",
      severity: "alta",
    },
    {
      id: "decision-automatizada",
      title: "Decisión no meramente automatizada (GDPR), con cautela reforzada para menores",
      description:
        "Si hay decisiones con efecto significativo sobre el estudiante (p. ej. denegación de admisión, calificación determinante o expulsión automáticas), asegura una intervención humana real y el derecho del afectado —o de sus representantes si es menor— a expresar su punto de vista, obtener explicación e impugnar (RGPD Art. 22). Cautela reforzada con menores: el Considerando 71 del RGPD establece que las decisiones únicamente automatizadas con efecto jurídico o significativo NO deberían afectar a un menor (presunción fuerte en contra de apoyarse en las excepciones del Art. 22.2). El AI Act lo refuerza con el derecho a una explicación clara del papel del sistema en decisiones de alto riesgo (Art. 86). Evidencia = diseño del flujo que garantiza intervención humana y canal de impugnación.",
      article: "GDPR Art. 22 (Considerando 71; y Art. 86)",
      severity: "alta",
    },
    {
      id: "explicacion",
      title: "Derecho a explicación de decisiones individuales (Art. 86)",
      description:
        "Prepara el circuito para atender solicitudes de explicación clara y significativa del papel del sistema de IA en una decisión individual de alto riesgo con efectos significativos (denegación de admisión, calificación determinante, expulsión o sanción asistida por IA). En el caso de menores, atiende también a sus representantes legales. Evidencia = procedimiento y plantilla de respuesta a solicitudes de explicación, con registro de las emitidas.",
      article: "Art. 86",
      severity: "alta",
      conditional:
        "Exigible con el régimen de alto riesgo del Anexo III (2-dic-2027, sujeto a publicación del Omnibus).",
    },
    {
      id: "sesgo",
      title: "No discriminación en admisión y evaluación, y control de sesgo",
      description:
        "El deber directo del centro nace de la normativa antidiscriminación (p. ej. Directivas UE 2000/43/CE, 2000/78/CE, 2006/54/CE y la ley nacional): vigila que la admisión, la evaluación del aprendizaje o la asignación de itinerarios no produzcan impacto desigual por características protegidas (origen étnico o racial, sexo, discapacidad, edad) ni por proxies socioeconómicos, y documéntalo. Exige además al proveedor evidencia de sus pruebas de sesgo sobre los datos de entrenamiento (obligación del proveedor, Art. 10, no tuya como deployer). Evidencia = análisis de impacto desigual propio + documentación de sesgo exigida al proveedor.",
      article: "Normativa antidiscriminación (Art. 10 = proveedor)",
      severity: "alta",
    },
    {
      id: "transparencia-afectado",
      title: "Información a estudiantes y a padres/tutores",
      description:
        "Informa a las personas afectadas de que están sujetas al uso de un sistema de IA de alto riesgo (obligación del deployer, Art. 26.11) y facilita la información de protección de datos del RGPD: finalidad, base jurídica, lógica implicada y datos tratados (Arts. 13-14). Cuando el estudiante es menor, dirige la información también a los titulares de la patria potestad o tutela, en lenguaje comprensible. Evidencia = aviso entregado (a alumnado y, si procede, a familias) y plantilla de información de protección de datos.",
      article: "Art. 26.11 (y GDPR Arts. 13-14)",
      severity: "media",
    },
    {
      id: "alfabetizacion-ia",
      title: "Alfabetización en IA del profesorado y administración",
      description:
        "Adopta medidas para que quienes operan o supervisan la herramienta (profesorado, personal de admisiones, administración) tengan un nivel suficiente de alfabetización en IA —capacidades, límites y riesgos—, proporcionado a su rol. Es un deber PROPIO y directo del deployer, exigible desde el 2 de febrero de 2025. Evidencia = registro de la formación u onboarding impartido (fecha, asistentes y contenidos).",
      article: "Art. 4",
      severity: "media",
      conditional: "Exigible desde el 2 de febrero de 2025 (ya vigente).",
    },
    {
      id: "datos-entrada",
      title: "Datos de entrada pertinentes y representativos",
      description:
        "En la medida en que controlas los datos de entrada (expedientes, respuestas de examen, criterios de admisión, ponderaciones), asegúrate de que son pertinentes, exactos y suficientemente representativos para la finalidad prevista, y de no introducir señales espurias (p. ej. proxies del origen o del nivel socioeconómico). Evidencia = descripción de las fuentes de datos de entrada y su validación.",
      article: "Art. 26.4",
      severity: "media",
    },
    {
      id: "transparencia-art50",
      title: "Transparencia de IA en la interacción (Art. 50)",
      description:
        "Deberes PROPIOS del deployer (aplicables desde el 2 de agosto de 2026): si expones a estudiantes a categorización biométrica o a un sistema de reconocimiento de emociones, debes informarles (Art. 50.3) —recuerda que inferir emociones de estudiantes está PROHIBIDO (ver control de emociones), la transparencia no lo habilita—; si difundes contenido generado o manipulado por IA en materiales educativos, etiquétalo (Art. 50.4). Lo que EXIGES al proveedor y conservas como evidencia: que un chatbot/tutor conversacional avise de que se interactúa con una IA (Art. 50.1) y que marque de forma legible por máquina el contenido que genere (Art. 50.2). Evidencia = avisos entregados y registro del etiquetado de contenido.",
      article: "Art. 50.3/50.4 (deployer) · 50.1/50.2 (proveedor)",
      severity: "media",
      conditional:
        "Transparencia del Art. 50 aplicable desde el 2 de agosto de 2026. Aplica si hay chatbot/tutor de IA, categorización biométrica o contenido sintético difundido.",
    },
    {
      id: "registro-bd-ue",
      title: "Registro en la base de datos de la UE (deployer público)",
      description:
        "Si tu organización es una autoridad, agencia u organismo público (p. ej. un centro público) y usas un sistema de IA de alto riesgo del Anexo III, debes registrarte en la base de datos de la UE y consignar su uso (obligación PROPIA del deployer público, Art. 49.4). Los deployers privados no tienen este deber de registro. Verifica primero si tu organización es un organismo público y, si lo es, prepara el alta. Evidencia = confirmación de la naturaleza pública/privada del deployer y, en su caso, constancia del registro.",
      article: "Art. 49.4",
      severity: "media",
      conditional:
        "Solo si el deployer es autoridad/organismo público. Ligado al régimen de alto riesgo (2-dic-2027, sujeto a publicación del Omnibus).",
    },
    {
      id: "documentacion",
      title: "Uso conforme a instrucciones y documentación del proveedor",
      description:
        "Usa el sistema conforme a las instrucciones de uso del proveedor (Art. 26.1). Exige y conserva como evidencia la información que debe facilitarte (instrucciones de uso e información del Anexo IV / Art. 11, obligación del proveedor). Distingue si tu centro es solo deployer (usa una herramienta EdTech de un tercero) o también proveedor (desarrolla la IA in-house o la comercializa), porque cambian tus obligaciones. Evidencia = instrucciones de uso archivadas y confirmación de que el uso real se ajusta a la finalidad prevista.",
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
        "El nivel adecuado de exactitud, robustez y ciberseguridad es obligación de diseño del proveedor (Art. 15): exígele las métricas y sus límites declarados —especialmente la fiabilidad de la evaluación automática del aprendizaje o de la detección durante exámenes— y vigila en uso real que el rendimiento se mantiene (Art. 26.5). Evidencia = métricas y límites declarados por el proveedor + registro de tu verificación en uso.",
      article: "Art. 15 (proveedor) + Art. 26.5",
      severity: "media",
    },
    {
      id: "monitoreo",
      title: "Monitoreo del funcionamiento y revisión periódica",
      description:
        "Vigila el funcionamiento del sistema conforme a las instrucciones; si aprecias que su uso puede presentar un riesgo, suspende el uso e informa al proveedor y, cuando proceda, a la autoridad, y notifica los incidentes graves. Programa una revisión periódica (p. ej. por curso académico o ante cambios). Evidencia = registro de revisiones, incidencias detectadas y acciones tomadas.",
      article: "Art. 26.5",
      severity: "media",
    },
    {
      id: "conservacion-evidencia",
      title: "Conservación de evidencia de tus propias decisiones",
      description:
        "Guarda registro de las decisiones y revisiones humanas (motivo de una admisión/denegación, calificación o medida disciplinaria asistida por IA, quién revisó y cuándo) para rendir cuentas (responsabilidad proactiva, RGPD Art. 5.2), responder a solicitudes de explicación (Art. 86) y defenderte ante reclamaciones de familias o de discriminación. Evidencia = expediente de decisión con la intervención humana registrada.",
      article: "GDPR Art. 5.2",
      severity: "media",
    },
  ],
};

/**
 * English (validated) mirror of EDUCACION_PACK. Content only: `id`/`article`/
 * `severity`/`conditional` logic kept identical to the ES pack; `name`, `tag`,
 * `summary`, `note`, titles and descriptions translated (not machine-translated:
 * `Anexo`→`Annex`, `RGPD`→`GDPR`, deployer/provider framing preserved). Art. 5.1.f
 * is kept as a PROHIBITION (triage: stop, don't prepare), not audit-readiness.
 */
export const EDUCACION_PACK_EN: PolicyPack = {
  id: "educacion",
  name: "Education and training (EU AI Act)",
  tag: "EU · Education",
  summary:
    "Controls for AI used by education providers or EdTech in admission, learning assessment and proctoring (high-risk, Annex III.3). Apply it to a system to preload its gaps.",
  note:
    "EU AI Act deadlines (deployer): AI literacy (Art. 4) and the Art. 5 prohibitions —including emotion recognition of students in education institutions (Art. 5.1.f)— are already enforceable (since 2 Feb 2025); Art. 50 transparency applies on 2 Aug 2026. The Annex III.3 high-risk obligations (admission, learning assessment, proctoring; Arts. 14/26/27/86) were postponed to 2 Dec 2027 by the Digital Omnibus, NOT 2 Aug 2026 (a widespread misconception in the market); the postponement was adopted (Council, 29 Jun 2026) and signed (8 Jul 2026): confirm its publication in the OJEU before planning around the 2027 date. TWO particularities versus HR: (1) the FRIA (Art. 27) applies when the deployer is a public-law body or a private entity providing a public service (education is cited as a service of a public nature) — not to every private EdTech; (2) there are minors → reinforced GDPR protection. The GDPR and national education law also apply. This pack gets your evidence ready ahead of time.",
  controls: [
    {
      id: "emociones-prohibicion",
      title: "Emotion recognition of students — PROHIBITED practice (triage)",
      description:
        "Check, BEFORE using the system, whether it infers emotions, affect, attention, boredom, frustration, stress, anxiety or \"engagement\" of students from biometric data (e.g. facial expression or micro-expressions via webcam, gaze tracking, tone of voice, attention signals). Inferring the emotions of people in education institutions is a practice PROHIBITED by the AI Act, except for medical or safety purposes interpreted strictly (a general well-being alert is not enough). \"Education institution\" is interpreted broadly: all levels, in-person or online, and even during admission. A prohibited practice is not prepared for audit, it is stopped: it makes the tool unusable in the EU (in force since 2 Feb 2025), not merely a high-risk system. Evidence = documented confirmation of whether or not the system infers emotions (functionality declared by the provider) and, where applicable, the medical/safety basis and the legal reasoning supporting it.",
      article: "Art. 5.1.f",
      severity: "alta",
      prohibited: true,
      conditional:
        "Prohibition already in force (since 2 Feb 2025). If the system infers students' emotions without a strict medical/safety purpose, it requires legal review and cessation, not preparation.",
    },
    {
      id: "proctoring-alto-riesgo",
      title: "Exam proctoring: high-risk, with a biometric red line",
      description:
        "Automated monitoring to detect prohibited student behavior DURING tests is a high-risk use (Annex III.3.d). Key trap: if the proctoring detects observable events or behaviors (e.g. a second person on camera, leaving the window, noise), it can be managed as high-risk; but if it infers internal states from biometrics (gaze, micro-expressions, \"nervousness\" or \"likely intent to cheat\"), it crosses into the PROHIBITION of Art. 5.1.f and is not preparable (see the emotions control). A product's exact classification depends on how it works: document which signals it uses; a narrow procedural task may not be high-risk (the Art. 6.3 filter), unless it profiles students. Note: a classic document plagiarism checker (text comparison) usually does NOT fall under III.3.d, which refers to real-time monitoring of the exam-taker. Evidence = description of the proctoring's signals/inputs and a documented determination of whether they are observable (high-risk) or biometric inference of internal states (prohibited).",
      article: "Annex III.3.d (and Art. 5.1.f)",
      severity: "alta",
      conditional:
        "Annex III high-risk postponed to 2 Dec 2027 (Omnibus, subject to OJEU publication); the Art. 5.1.f prohibition (biometric inference of emotions/attention) is already in force.",
    },
    {
      id: "vulnerabilidades-menores",
      title:
        "No exploitation of minors' vulnerability or manipulative techniques",
      description:
        "Verify that the system (e.g. gamified adaptive tutor, learning nudging, recommenders) does not employ subliminal, deceptive or manipulative techniques that materially distort the pupil's behavior, nor exploit vulnerabilities due to age (minors) or disability. Both are prohibited practices under the AI Act. As students are often minors —an especially protected group— keep the design within limits and prioritize the educational interest. Evidence = description of the system's incentive/personalization mechanisms and confirmation that these techniques are absent.",
      article: "Art. 5.1.a / 5.1.b",
      severity: "media",
      conditional: "Prohibitions already in force (since 2 Feb 2025).",
    },
    {
      id: "fria",
      title:
        "Fundamental rights impact assessment (FRIA) — usually applies in education",
      description:
        "Unlike the ordinary private employer, in education the AI Act FRIA is usually required: it obliges deployers that are public-law bodies (public schools/universities) and private entities providing a public service (education is cited as a service of a public nature). It does NOT automatically reach every private EdTech or internal corporate training. First determine whether your organization falls within the scope of Art. 27.1; if it does, before the first use of the Annex III.3 high-risk AI, assess and document the impact on fundamental rights: affected groups (incl. minors), risks (discrimination, privacy, due process), human-oversight measures and mitigations. Evidence = signed and dated FRIA, or a reasoned note of non-applicability if you are a private entity without a public-service function.",
      article: "Art. 27",
      severity: "alta",
      conditional:
        "Applies if the deployer is a public body or provides public services. Enforceable under the high-risk regime (2 Dec 2027, subject to Omnibus publication).",
    },
    {
      id: "dpia",
      title: "Data protection impact assessment (DPIA)",
      description:
        "The systematic evaluation of students with profiling and, above all, the large-scale processing of minors' data almost always require a prior DPIA under the GDPR (Art. 35, especially 35.3.a systematic evaluation and 35.3.b large-scale processing; minors are a vulnerable group). Carry it out and document it before starting the processing. The DPIA (GDPR) and the FRIA (AI Act) are distinct but can be coordinated. Evidence = signed DPIA with date, risks and mitigating measures.",
      article: "GDPR Art. 35",
      severity: "alta",
    },
    {
      id: "datos-menores",
      title: "Reinforced protection of minors' data",
      description:
        "Students are often minors: apply the GDPR's reinforced safeguards and the best interests of the child. Verify the legal basis for the processing and, where appropriate, the consent of holders of parental responsibility; minimize the data; avoid secondary uses (e.g. advertising or training models with pupils' data) without a valid basis; and check national rules on the digital age of consent. Evidence = documented legal basis, minors' data policy and confirmation that there are no secondary uses without a basis.",
      article: "GDPR (minors' data)",
      severity: "alta",
    },
    {
      id: "supervision-humana",
      title: "Effective human oversight in the decision",
      description:
        "Assign oversight to a competent person, trained and with authority to review, not follow or override the AI's recommendation before an admission, grading, pathway-assignment or disciplinary decision. As a deployer, DESIGNATING that person is your obligation (Art. 26.2); that the system enables oversight is the provider's design (Art. 14). Evidence = designated person/role (e.g. teaching staff, admissions committee), their training and the review/override procedure.",
      article: "Art. 26.2 (and Art. 14)",
      severity: "alta",
    },
    {
      id: "decision-automatizada",
      title:
        "Decision not solely automated (GDPR), with reinforced caution for minors",
      description:
        "If there are decisions with a significant effect on the student (e.g. automatic admission denial, decisive grading or expulsion), ensure genuine human intervention and the affected person's right —or that of their representatives if a minor— to express their point of view, obtain an explanation and contest it (GDPR Art. 22). Reinforced caution with minors: GDPR Recital 71 states that solely automated decisions with legal or significant effect should NOT concern a child (a strong presumption against relying on the Art. 22.2 exceptions). The AI Act reinforces this with the right to a clear explanation of the system's role in high-risk decisions (Art. 86). Evidence = flow design that guarantees human intervention and a channel to contest.",
      article: "GDPR Art. 22 (Recital 71; and Art. 86)",
      severity: "alta",
    },
    {
      id: "explicacion",
      title: "Right to explanation of individual decisions (Art. 86)",
      description:
        "Set up the process to handle requests for a clear and meaningful explanation of the AI system's role in an individual high-risk decision with significant effects (admission denial, decisive grading, expulsion or AI-assisted sanction). For minors, also attend to their legal representatives. Evidence = procedure and response template for explanation requests, with a record of those issued.",
      article: "Art. 86",
      severity: "alta",
      conditional:
        "Enforceable under the Annex III high-risk regime (2 Dec 2027, subject to Omnibus publication).",
    },
    {
      id: "sesgo",
      title: "Non-discrimination in admission and assessment, and bias control",
      description:
        "The institution's direct duty arises from anti-discrimination law (e.g. EU Directives 2000/43/EC, 2000/78/EC, 2006/54/EC and national law): monitor that admission, learning assessment or pathway assignment do not produce disparate impact on protected characteristics (racial or ethnic origin, sex, disability, age) or via socio-economic proxies, and document it. Also require from the provider evidence of its bias testing on the training data (a provider obligation, Art. 10, not yours as deployer). Evidence = your own disparate-impact analysis + bias documentation required from the provider.",
      article: "Anti-discrimination law (Art. 10 = provider)",
      severity: "alta",
    },
    {
      id: "transparencia-afectado",
      title: "Information to students and to parents/guardians",
      description:
        "Inform the affected persons that they are subject to the use of a high-risk AI system (a deployer obligation, Art. 26.11) and provide the GDPR data-protection information: purpose, legal basis, logic involved and data processed (Arts. 13-14). When the student is a minor, also address the information to holders of parental responsibility or guardianship, in understandable language. Evidence = notice given (to students and, where appropriate, families) and a data-protection information template.",
      article: "Art. 26.11 (and GDPR Arts. 13-14)",
      severity: "media",
    },
    {
      id: "alfabetizacion-ia",
      title: "AI literacy of teaching staff and administration",
      description:
        "Take measures so that those who operate or oversee the tool (teaching staff, admissions personnel, administration) have a sufficient level of AI literacy —capabilities, limits and risks—, proportionate to their role. This is a DIRECT, OWN duty of the deployer, enforceable since 2 February 2025. Evidence = record of the training or onboarding delivered (date, attendees and content).",
      article: "Art. 4",
      severity: "media",
      conditional: "Enforceable since 2 February 2025 (already in force).",
    },
    {
      id: "datos-entrada",
      title: "Relevant and representative input data",
      description:
        "To the extent that you control the input data (records, exam answers, admission criteria, weightings), ensure that they are relevant, accurate and sufficiently representative for the intended purpose, and do not introduce spurious signals (e.g. proxies for origin or socio-economic level). Evidence = description of the input data sources and their validation.",
      article: "Art. 26.4",
      severity: "media",
    },
    {
      id: "transparencia-art50",
      title: "Transparency of AI in the interaction (Art. 50)",
      description:
        "The deployer's OWN duties (applicable from 2 August 2026): if you expose students to biometric categorization or an emotion-recognition system, you must inform them (Art. 50.3) —remember that inferring students' emotions is PROHIBITED (see the emotions control), transparency does not enable it—; if you disseminate AI-generated or manipulated content in educational materials, label it (Art. 50.4). What you REQUIRE from the provider and keep as evidence: that a conversational chatbot/tutor warns that one is interacting with an AI (Art. 50.1) and that it marks the content it generates in a machine-readable way (Art. 50.2). Evidence = notices given and a record of content labeling.",
      article: "Art. 50.3/50.4 (deployer) · 50.1/50.2 (provider)",
      severity: "media",
      conditional:
        "Art. 50 transparency applicable from 2 August 2026. Applies if there is an AI chatbot/tutor, biometric categorization or disseminated synthetic content.",
    },
    {
      id: "registro-bd-ue",
      title: "Registration in the EU database (public deployer)",
      description:
        "If your organization is a public authority, agency or body (e.g. a public school) and you use an Annex III high-risk AI system, you must register in the EU database and record its use (an OWN obligation of the public deployer, Art. 49.4). Private deployers do not have this registration duty. First verify whether your organization is a public body and, if so, prepare the registration. Evidence = confirmation of the deployer's public/private nature and, where applicable, proof of registration.",
      article: "Art. 49.4",
      severity: "media",
      conditional:
        "Only if the deployer is a public authority/body. Tied to the high-risk regime (2 Dec 2027, subject to Omnibus publication).",
    },
    {
      id: "documentacion",
      title: "Use in line with the provider's instructions and documentation",
      description:
        "Use the system in accordance with the provider's instructions for use (Art. 26.1). Require and keep as evidence the information the provider must supply to you (instructions for use and the Annex IV / Art. 11 information, a provider obligation). Distinguish whether your institution is only a deployer (uses a third-party EdTech tool) or also a provider (develops the AI in-house or markets it), because your obligations change. Evidence = archived instructions for use and confirmation that real use conforms to the intended purpose.",
      article: "Art. 26.1 (Annex IV/Art. 11 = provider)",
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
        "An appropriate level of accuracy, robustness and cybersecurity is the provider's design obligation (Art. 15): require from it the declared metrics and their limits —especially the reliability of automated learning assessment or of detection during exams— and monitor in real use that performance is maintained (Art. 26.5). Evidence = metrics and limits declared by the provider + a record of your verification in use.",
      article: "Art. 15 (provider) + Art. 26.5",
      severity: "media",
    },
    {
      id: "monitoreo",
      title: "Monitoring of operation and periodic review",
      description:
        "Monitor the system's operation in accordance with the instructions; if you find that its use may present a risk, suspend use and inform the provider and, where appropriate, the authority, and report serious incidents. Schedule a periodic review (e.g. per academic year or upon changes). Evidence = record of reviews, incidents detected and actions taken.",
      article: "Art. 26.5",
      severity: "media",
    },
    {
      id: "conservacion-evidencia",
      title: "Retention of evidence of your own decisions",
      description:
        "Keep a record of the decisions and human reviews (reason for an AI-assisted admission/denial, grading or disciplinary measure, who reviewed and when) to demonstrate accountability (GDPR Art. 5.2), respond to explanation requests (Art. 86) and defend yourself against family or discrimination claims. Evidence = decision file with the human intervention recorded.",
      article: "GDPR Art. 5.2",
      severity: "media",
    },
  ],
};
