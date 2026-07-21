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
