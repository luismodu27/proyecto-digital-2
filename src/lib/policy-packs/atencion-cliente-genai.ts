/**
 * Policy pack — Atención al cliente e IA generativa de cara al público.
 *
 * Catálogo de controles para un DEPLOYER mid-market que despliega chatbots/
 * asistentes conversacionales de soporte y/o usa IA generativa para contenido
 * público (marketing, resúmenes, imágenes/audio/vídeo sintéticos). A diferencia
 * de los packs de RRHH, este NO es alto riesgo del Anexo III por regla general:
 * es el régimen de TRANSPARENCIA (Art. 50) + GPAI (provider vs deployer) + RGPD.
 * Precarga las brechas de un gap assessment.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Contenido revisado por el
 * subagente `compliance-domain-expert` (2026-07-21) contra el texto del EU AI Act
 * (Arts. 4, 5.1.a/b/f, 6(2)+Anexo III.1/III.5, 25, 50.1-50.4, Cap. V/Arts. 53-55)
 * y el RGPD (Arts. 5, 6, 9, 13-14, 22), las Guidelines de la Comisión sobre
 * transparencia del Art. 50 (borrador 8-may-2026) y el Code of Practice sobre
 * contenido generado por IA. Plazos: Art. 50 aplica el 2-ago-2026 y NO fue
 * aplazado por el Digital Omnibus (que solo movió el alto riesgo del Anexo III
 * al 2-dic-2027); verificado contra Gibson Dunn, Morrison Foerster, Inside Privacy
 * y el comunicado del Consejo de la UE.
 *
 * NOTA de producto: `clasificacion-triaje`, `practicas-prohibidas-triaje` y
 * `emociones-clientes-triaje` son TRIAJES, no brechas ordinarias. Sirven para
 * detectar si el sistema en realidad escala a alto riesgo (Anexo III) o a
 * práctica prohibida (Art. 5) — en cuyo caso NO se "prepara evidencia" con este
 * pack, sino que se reclasifica o se cesa el uso.
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";
import type { PolicyPack } from "./types";

export const ATENCION_CLIENTE_GENAI_PACK: PolicyPack = {
  id: "atencion-cliente-genai",
  name: "Atención al cliente e IA generativa (EU AI Act · transparencia)",
  tag: "UE · Transparencia (Art. 50)",
  summary:
    "Controles para chatbots de soporte al cliente e IA generativa de contenido público (riesgo limitado / transparencia del Art. 50, GPAI y RGPD; por regla general NO alto riesgo del Anexo III). Aplícalo a un sistema para precargar sus brechas.",
  note:
    "Plazos del EU AI Act (deployer): la alfabetización en IA (Art. 4) y las prohibiciones del Art. 5 ya son exigibles (desde el 2-feb-2025); la transparencia del Art. 50 (avisos de chatbot, deepfakes, contenido sintético) aplica el 2-ago-2026 y NO fue aplazada por el Digital Omnibus (que solo movió el alto riesgo del Anexo III al 2-dic-2027). Estos sistemas son, por regla general, de riesgo LIMITADO: no confundas transparencia con las obligaciones de alto riesgo. Las obligaciones GPAI (Cap. V) recaen en el proveedor del modelo, no en quien solo lo usa vía API/SaaS. Además del AI Act aplica siempre el RGPD. Este pack te deja lista la evidencia con antelación.",
  controls: [
    {
      id: "clasificacion-triaje",
      title: "Triaje de clasificación — confirmar que es riesgo limitado, no alto riesgo (triaje)",
      description:
        "Antes de aplicar el resto del pack, confirma que el sistema es de riesgo LIMITADO (transparencia). Un chatbot de soporte o la IA generativa de contenido son, por regla general, riesgo limitado. ESCALA a ALTO RIESGO del Anexo III (y requiere el pack/controles de alto riesgo, no este) si el sistema decide o co-decide sobre: elegibilidad a prestaciones o servicios públicos esenciales (Anexo III.5.a), solvencia o scoring crediticio (III.5.b), precio o evaluación de riesgo en seguros de vida/salud (III.5.c), o triaje de urgencias/emergencias (III.5.d); o si es un sistema de reconocimiento de emociones o de categorización biométrica (Anexo III.1). Evidencia = nota de triaje que declara la finalidad real del sistema y por qué se queda en riesgo limitado (o su reclasificación si escala).",
      article: "Art. 6(2) + Anexo III (1 y 5)",
      severity: "alta",
    },
    {
      id: "practicas-prohibidas-triaje",
      title: "Sin manipulación ni explotación de vulnerabilidades (triaje)",
      description:
        "Verifica que el asistente/generativa NO emplee técnicas subliminales, deliberadamente manipuladoras o engañosas que distorsionen materialmente la conducta del consumidor (p. ej. presionar de forma encubierta hacia una compra o renuncia de derechos, o hacer creer de forma engañosa que se habla con un humano para manipular), ni explote vulnerabilidades por edad, discapacidad o situación socioeconómica. Ambas son prácticas PROHIBIDAS por el AI Act (vigentes desde el 2-feb-2025): una práctica prohibida no se prepara para auditoría, se cesa. Evidencia = descripción de los mecanismos persuasivos/de diseño del sistema y confirmación de ausencia de estas técnicas (o, si se detectan, revisión jurídica y cese).",
      article: "Art. 5.1.a / 5.1.b",
      severity: "alta",
      conditional: "Prohibiciones ya vigentes (desde el 2-feb-2025).",
    },
    {
      id: "emociones-clientes-triaje",
      title: "Reconocimiento de emociones de clientes — no prohibido, pero escala a alto riesgo (triaje)",
      description:
        "Si el sistema infiere emociones de CLIENTES a partir de datos biométricos (p. ej. tono de voz o expresión facial en atención al cliente), ten en cuenta un matiz clave: NO está prohibido por el Art. 5.1.f (esa prohibición es solo para trabajadores y estudiantes, no clientes), PERO sí es un sistema de ALTO RIESGO del Anexo III.1.c y trata datos biométricos (categoría especial, RGPD Art. 9). Es decir, escala fuera del régimen de riesgo limitado de este pack: requiere el régimen de alto riesgo, la transparencia del Art. 50.3 y base jurídica reforzada del RGPD. Evidencia = confirmación de si el sistema infiere o no emociones; si lo hace, nota de reclasificación a alto riesgo y de tratamiento de datos biométricos.",
      article: "Art. 5.1.f (alcance) + Anexo III.1.c + RGPD Art. 9",
      severity: "alta",
      conditional:
        "Aplica solo si el sistema infiere emociones de clientes por datos biométricos. No prohibido, pero reclasifica a alto riesgo.",
    },
    {
      id: "alfabetizacion-ia",
      title: "Alfabetización en IA del personal",
      description:
        "Adopta medidas para que los agentes de soporte y quienes operan o supervisan el chatbot o la IA generativa (marketing, comunicación, atención al cliente) tengan un nivel suficiente de alfabetización en IA —capacidades, límites y riesgos como las alucinaciones—, proporcionado a su rol. Es un deber PROPIO y directo del deployer, exigible desde el 2 de febrero de 2025. Evidencia = registro de la formación u onboarding impartido (fecha, asistentes y contenidos).",
      article: "Art. 4",
      severity: "media",
      conditional: "Exigible desde el 2 de febrero de 2025 (ya vigente).",
    },
    {
      id: "aviso-chatbot",
      title: "Aviso de que se interactúa con una IA (chatbot)",
      description:
        "El usuario debe saber que habla con una IA y no con una persona, salvo que sea obvio. El deber de DISEÑAR el sistema para que informe es del PROVEEDOR (Art. 50.1). Como deployer que despliega un chatbot de un tercero, tu control práctico es verificar que ese aviso está ACTIVO y es visible en producción y conservar evidencia de que el proveedor lo cumple. ATENCIÓN: si construyes el chatbot internamente o lo personalizas sustancialmente y lo publicas bajo tu marca, puedes convertirte en proveedor (Art. 25) y asumir el 50.1 directamente. Evidencia = captura del aviso de IA activo en producción + confirmación/documentación del proveedor.",
      article: "Art. 50.1 (proveedor; deployer verifica)",
      severity: "alta",
      conditional:
        "Aplicable desde el 2-ago-2026. Si construyes/personalizas el chatbot bajo tu marca, el deber puede ser tuyo como proveedor.",
    },
    {
      id: "etiquetado-deepfakes",
      title: "Etiquetado de deepfakes (imagen/audio/vídeo)",
      description:
        "Deber PROPIO del deployer (aplicable desde el 2-ago-2026): si difundes imágenes, audio o vídeo generados o manipulados por IA que constituyen un deepfake (parecen auténticos y se asemejan a personas, objetos, lugares o eventos reales), debes revelar que el contenido es artificial (Art. 50.4). EXCEPCIÓN acotada: si forma parte de una obra evidentemente artística, creativa, satírica o de ficción, la obligación se REDUCE a revelar su existencia de forma que no estropee la obra (p. ej. en créditos o metadatos), pero NO desaparece. Evidencia = registro del contenido sintético difundido y de cómo se etiquetó, con la excepción aplicada cuando proceda.",
      article: "Art. 50.4 (deployer)",
      severity: "alta",
      conditional: "Aplicable desde el 2-ago-2026. Solo si difundes deepfakes de cara al público.",
    },
    {
      id: "etiquetado-texto-publico",
      title: "Etiquetado de texto de IA sobre asuntos de interés público",
      description:
        "Deber PROPIO del deployer (aplicable desde el 2-ago-2026): si publicas texto generado o manipulado por IA con el fin de informar al público sobre asuntos de INTERÉS PÚBLICO, debes revelar que es artificial (Art. 50.4). EXCEPCIÓN: no aplica si el contenido ha pasado por revisión editorial humana SUSTANTIVA y una persona física o jurídica asume la responsabilidad editorial de la publicación. Ojo: la Comisión ha aclarado que un mero «check» humano no basta; debe ser control editorial genuino y con responsabilidad clara. La mayoría del contenido comercial/marketing corriente no es «interés público», pero valóralo caso a caso. Evidencia = criterio documentado de cuándo aplicas la etiqueta y cuándo invocas la excepción editorial (quién asume la responsabilidad).",
      article: "Art. 50.4 (deployer)",
      severity: "media",
      conditional:
        "Aplicable desde el 2-ago-2026. Solo para texto de IA publicado para informar al público sobre asuntos de interés público.",
    },
    {
      id: "transparencia-emociones-biometrica",
      title: "Información de reconocimiento de emociones / categorización biométrica",
      description:
        "Deber PROPIO del deployer (aplicable desde el 2-ago-2026): si expones a clientes a un sistema de reconocimiento de emociones o de categorización biométrica, debes informarles de su funcionamiento (Art. 50.3), además de cumplir el RGPD (datos biométricos = categoría especial, Art. 9). Recuerda que un sistema así, aunque no prohibido para clientes, es alto riesgo del Anexo III (ver triaje de emociones). Evidencia = aviso de operación entregado a los clientes expuestos y base jurídica del RGPD documentada.",
      article: "Art. 50.3 (deployer) + RGPD Art. 9",
      severity: "media",
      conditional:
        "Aplicable desde el 2-ago-2026. Solo si usas reconocimiento de emociones o categorización biométrica.",
    },
    {
      id: "info-chatbot-rgpd",
      title: "Información de protección de datos en el chatbot (RGPD)",
      description:
        "Como responsable del tratamiento, informa a la persona usuaria en el punto de interacción: qué datos trata el chatbot, con qué finalidad, base jurídica, conservación y sus derechos (RGPD Arts. 13-14), con enlace accesible a la política de privacidad. Evidencia = texto informativo mostrado en el chat y su enlace a la información de protección de datos.",
      article: "RGPD Arts. 13-14",
      severity: "media",
    },
    {
      id: "base-juridica",
      title: "Base jurídica del tratamiento (RGPD)",
      description:
        "Determina y documenta la base jurídica del tratamiento de los datos que pasan por el chatbot o la IA generativa (RGPD Art. 6): normalmente ejecución del contrato o interés legítimo para la atención al cliente. Si tratas categorías especiales (p. ej. salud mencionada por el cliente) necesitas una condición del Art. 9. Evidencia = registro de actividades de tratamiento con la base jurídica identificada por finalidad.",
      article: "RGPD Art. 6 (y Art. 9)",
      severity: "media",
    },
    {
      id: "decision-automatizada",
      title: "Decisión no meramente automatizada (RGPD Art. 22)",
      description:
        "Si el chatbot toma decisiones con efecto jurídico o significativo sobre la persona sin intervención humana (p. ej. deniega automáticamente un reembolso, cancela un servicio o rechaza una reclamación), aplica el RGPD Art. 22: garantiza intervención humana real, el derecho de la persona a expresar su punto de vista, obtener explicación e impugnar. Evidencia = diseño del flujo que asegura la intervención humana y el canal de impugnación (o confirmación de que el chatbot no adopta decisiones significativas por sí solo).",
      article: "RGPD Art. 22",
      severity: "alta",
      conditional:
        "Aplica solo si el sistema adopta decisiones automatizadas con efecto significativo (p. ej. denegar un servicio/reembolso).",
    },
    {
      id: "minimizacion",
      title: "Minimización de datos en la conversación (RGPD)",
      description:
        "Limita los datos que el chatbot recoge y retiene a lo necesario para la finalidad (RGPD Art. 5.1.c): evita pedir o almacenar más datos personales de los precisos, y define una retención acotada de las transcripciones. Evidencia = configuración de recogida/retención y política de minimización aplicada al chatbot.",
      article: "RGPD Art. 5.1.c",
      severity: "media",
    },
    {
      id: "entrenamiento-conversaciones",
      title: "No entrenar el modelo con conversaciones de clientes sin base jurídica",
      description:
        "Reutilizar las conversaciones de clientes para entrenar o afinar modelos es un tratamiento nuevo: necesita base jurídica propia y respeta la limitación de finalidad (RGPD Arts. 5.1.b y 6); usar datos recabados para «dar soporte» con el fin distinto de «entrenar IA» sin base ni información es un riesgo real. Además, exige y conserva del proveedor su política sobre si usa tus datos/prompts para entrenar (muchos ofrecen «zero-retention»/opt-out). Evidencia = decisión documentada sobre el uso (o no) de las conversaciones para entrenamiento, su base jurídica e información, y la cláusula del proveedor sobre entrenamiento con tus datos.",
      article: "RGPD Arts. 5.1.b y 6 (limitación de finalidad)",
      severity: "alta",
    },
    {
      id: "marca-contenido-sintetico",
      title: "Marca de contenido sintético legible por máquina (exige al proveedor)",
      description:
        "Marcar la salida generada (texto, imagen, audio, vídeo) en un formato legible por máquina y detectable como artificial es obligación del PROVEEDOR del sistema generativo (Art. 50.2), no tuya como deployer. Tu control = exigir al proveedor que su salida incorpore esa marca/watermark interoperable y conservarlo como evidencia; te facilita además cumplir tu propio etiquetado del 50.4. Evidencia = confirmación del proveedor de que marca el contenido (documentación técnica / cláusula contractual).",
      article: "Art. 50.2 (proveedor; deployer exige)",
      severity: "media",
      conditional: "Aplicable desde el 2-ago-2026.",
    },
    {
      id: "gpai-evidencia-proveedor",
      title: "Documentación del modelo GPAI (exige y conserva del proveedor)",
      description:
        "Si solo USAS un modelo de propósito general (p. ej. GPT o Claude) vía API o un producto SaaS, eres deployer/usuario final, NO proveedor de GPAI: las obligaciones del Capítulo V (documentación técnica Art. 53, resumen público de los datos de entrenamiento Art. 53.1.d, política de copyright, riesgo sistémico Art. 55) recaen en el PROVEEDOR del modelo. Tu control = exigir y conservar del proveedor: documentación del modelo, política de uso aceptable, resumen de datos de entrenamiento y el mecanismo de marcado de contenido. LÍNEA a vigilar: si haces fine-tuning sustancial que cambie las capacidades del modelo y lo publicas bajo tu marca, puedes convertirte en proveedor (Art. 25 / guías GPAI) y asumir esas obligaciones. Evidencia = documentación del proveedor archivada + confirmación de que tu uso es «solo despliegue», no modificación sustancial bajo tu marca.",
      article: "Cap. V (proveedor) + Art. 25 (línea deployer→proveedor)",
      severity: "media",
    },
    {
      id: "exactitud-supervision",
      title: "Fiabilidad, supervisión humana y disclaimers (buena práctica)",
      description:
        "El AI Act NO impone a estos sistemas de riesgo limitado las obligaciones de exactitud/robustez del alto riesgo; que un chatbot alucine información falsa no es, en sí, un incumplimiento del AI Act. Pero sí es un riesgo real de protección al consumidor y responsabilidad contractual, así que se trata como BUENA PRÁCTICA de gobernanza (no como obligación del AI Act): exige al proveedor métricas de fiabilidad y sus límites, ofrece una ruta de escalado a un agente humano, y añade un aviso de que las respuestas son orientativas y pueden contener errores. Evidencia = métricas/limitaciones declaradas por el proveedor, diseño del escalado humano y texto del disclaimer.",
      article: "Buena práctica (protección al consumidor); no es obligación de alto riesgo del AI Act",
      severity: "media",
    },
    {
      id: "conservacion-evidencia",
      title: "Conservación de evidencia y responsabilidad proactiva",
      description:
        "Guarda registro de las decisiones de gobernanza y de la evidencia de transparencia: qué contenido de IA se etiquetó y cómo, los avisos de chatbot activos, la nota de triaje de clasificación, la formación (Art. 4) y las cláusulas exigidas al proveedor. Sirve para rendir cuentas (responsabilidad proactiva, RGPD Art. 5.2) y para demostrar la transparencia del Art. 50 ante una autoridad. Evidencia = expediente con los avisos, etiquetados, triaje y documentación del proveedor, fechados.",
      article: "RGPD Art. 5.2 (responsabilidad proactiva)",
      severity: "media",
    },
  ],
};

/**
 * English (validated) mirror of ATENCION_CLIENTE_GENAI_PACK. Content only:
 * `id`/`article`/`severity`/`conditional` logic kept identical to the ES pack;
 * `name`, `tag`, `summary`, `note`, titles and descriptions translated.
 * Deployer-vs-provider framing (Art. 50.1/50.2 = provider; 50.3/50.4 = deployer)
 * and prohibited-copy rules preserved. Triage controls remain triage.
 */
export const ATENCION_CLIENTE_GENAI_PACK_EN: PolicyPack = {
  id: "atencion-cliente-genai",
  name: "Customer service and generative AI (EU AI Act · transparency)",
  tag: "EU · Transparency (Art. 50)",
  summary:
    "Controls for customer-support chatbots and generative AI for public content (limited risk / Art. 50 transparency, GPAI and GDPR; as a general rule NOT high-risk under Annex III). Apply it to a system to preload its gaps.",
  note:
    "EU AI Act deadlines (deployer): AI literacy (Art. 4) and the Art. 5 prohibitions are already enforceable (since 2 Feb 2025); Art. 50 transparency (chatbot notices, deepfakes, synthetic content) applies on 2 Aug 2026 and was NOT postponed by the Digital Omnibus (which only moved Annex III high-risk to 2 Dec 2027). These systems are, as a general rule, LIMITED risk: do not confuse transparency with the high-risk obligations. The GPAI obligations (Chapter V) fall on the model provider, not on someone who merely uses it via API/SaaS. Beyond the AI Act, the GDPR always applies. This pack gets your evidence ready ahead of time.",
  controls: [
    {
      id: "clasificacion-triaje",
      title:
        "Classification triage — confirm it is limited risk, not high-risk (triage)",
      description:
        "Before applying the rest of the pack, confirm that the system is LIMITED risk (transparency). A support chatbot or generative AI for content are, as a general rule, limited risk. It ESCALATES to HIGH-RISK under Annex III (and requires the high-risk pack/controls, not this one) if the system decides or co-decides on: eligibility for essential public benefits or services (Annex III.5.a), creditworthiness or credit scoring (III.5.b), price or risk assessment in life/health insurance (III.5.c), or emergency triage (III.5.d); or if it is an emotion-recognition or biometric-categorisation system (Annex III.1). Evidence = triage note declaring the system's actual purpose and why it remains limited risk (or its reclassification if it escalates).",
      article: "Art. 6(2) + Anexo III (1 y 5)",
      severity: "alta",
    },
    {
      id: "practicas-prohibidas-triaje",
      title: "No manipulation or exploitation of vulnerabilities (triage)",
      description:
        "Verify that the assistant/generative AI does NOT employ subliminal, deliberately manipulative or deceptive techniques that materially distort the consumer's behaviour (e.g. covertly pushing towards a purchase or a waiver of rights, or deceptively making people believe they are talking to a human in order to manipulate them), nor exploit vulnerabilities due to age, disability or socio-economic situation. Both are practices PROHIBITED by the AI Act (in force since 2 Feb 2025): a prohibited practice is not prepared for audit, it is stopped. Evidence = description of the system's persuasive/design mechanisms and confirmation that these techniques are absent (or, if detected, legal review and cessation).",
      article: "Art. 5.1.a / 5.1.b",
      severity: "alta",
      conditional: "Prohibitions already in force (since 2 Feb 2025).",
    },
    {
      id: "emociones-clientes-triaje",
      title:
        "Emotion recognition of customers — not prohibited, but escalates to high-risk (triage)",
      description:
        "If the system infers the emotions of CUSTOMERS from biometric data (e.g. tone of voice or facial expression in customer service), bear in mind a key nuance: it is NOT prohibited by Art. 5.1.f (that prohibition covers only workers and students, not customers), BUT it is a HIGH-RISK system under Annex III.1.c and it processes biometric data (special category, GDPR Art. 9). That is, it escalates out of the limited-risk regime of this pack: it requires the high-risk regime, Art. 50.3 transparency and a reinforced GDPR legal basis. Evidence = confirmation of whether or not the system infers emotions; if it does, a note reclassifying it to high-risk and on the processing of biometric data.",
      article: "Art. 5.1.f (alcance) + Annex III.1.c + RGPD Art. 9",
      severity: "alta",
      conditional:
        "Applies only if the system infers customers' emotions from biometric data. Not prohibited, but reclassifies to high-risk.",
    },
    {
      id: "alfabetizacion-ia",
      title: "AI literacy of staff",
      description:
        "Take measures so that support agents and those who operate or oversee the chatbot or generative AI (marketing, communications, customer service) have a sufficient level of AI literacy —capabilities, limits and risks such as hallucinations—, proportionate to their role. This is a DIRECT, OWN duty of the deployer, enforceable since 2 February 2025. Evidence = record of the training or onboarding delivered (date, attendees and content).",
      article: "Art. 4",
      severity: "media",
      conditional: "Enforceable since 2 February 2025 (already in force).",
    },
    {
      id: "aviso-chatbot",
      title: "Notice that one is interacting with an AI (chatbot)",
      description:
        "The user must know they are talking to an AI and not a person, unless it is obvious. The duty to DESIGN the system so that it informs lies with the PROVIDER (Art. 50.1). As a deployer deploying a third party's chatbot, your practical control is to verify that this notice is ACTIVE and visible in production and to keep evidence that the provider complies with it. WARNING: if you build the chatbot in-house or substantially customise it and publish it under your brand, you may become a provider (Art. 25) and take on Art. 50.1 directly. Evidence = screenshot of the AI notice active in production + provider confirmation/documentation.",
      article: "Art. 50.1 (proveedor; deployer verifica)",
      severity: "alta",
      conditional:
        "Applicable from 2 Aug 2026. If you build/customise the chatbot under your brand, the duty may be yours as a provider.",
    },
    {
      id: "etiquetado-deepfakes",
      title: "Labelling of deepfakes (image/audio/video)",
      description:
        "The deployer's OWN duty (applicable from 2 Aug 2026): if you disseminate images, audio or video generated or manipulated by AI that constitute a deepfake (they appear authentic and resemble real persons, objects, places or events), you must disclose that the content is artificial (Art. 50.4). Narrow EXCEPTION: if it is part of an evidently artistic, creative, satirical or fictional work, the obligation is REDUCED to disclosing its existence in a way that does not spoil the work (e.g. in credits or metadata), but it does NOT disappear. Evidence = record of the synthetic content disseminated and of how it was labelled, with the exception applied where appropriate.",
      article: "Art. 50.4 (deployer)",
      severity: "alta",
      conditional:
        "Applicable from 2 Aug 2026. Only if you disseminate deepfakes to the public.",
    },
    {
      id: "etiquetado-texto-publico",
      title: "Labelling of AI text on matters of public interest",
      description:
        "The deployer's OWN duty (applicable from 2 Aug 2026): if you publish text generated or manipulated by AI for the purpose of informing the public on matters of PUBLIC INTEREST, you must disclose that it is artificial (Art. 50.4). EXCEPTION: this does not apply if the content has undergone SUBSTANTIVE human editorial review and a natural or legal person assumes editorial responsibility for the publication. Note: the Commission has clarified that a mere human «check» is not enough; it must be genuine editorial control with clear responsibility. Most ordinary commercial/marketing content is not «public interest», but assess it case by case. Evidence = documented criteria for when you apply the label and when you invoke the editorial exception (who assumes responsibility).",
      article: "Art. 50.4 (deployer)",
      severity: "media",
      conditional:
        "Applicable from 2 Aug 2026. Only for AI text published to inform the public on matters of public interest.",
    },
    {
      id: "transparencia-emociones-biometrica",
      title:
        "Emotion-recognition / biometric-categorisation information",
      description:
        "The deployer's OWN duty (applicable from 2 Aug 2026): if you expose customers to an emotion-recognition or biometric-categorisation system, you must inform them of its operation (Art. 50.3), in addition to complying with the GDPR (biometric data = special category, Art. 9). Remember that such a system, although not prohibited for customers, is high-risk under Annex III (see the emotions triage). Evidence = operation notice given to the exposed customers and a documented GDPR legal basis.",
      article: "Art. 50.3 (deployer) + RGPD Art. 9",
      severity: "media",
      conditional:
        "Applicable from 2 Aug 2026. Only if you use emotion recognition or biometric categorisation.",
    },
    {
      id: "info-chatbot-rgpd",
      title: "Data protection information in the chatbot (GDPR)",
      description:
        "As controller, inform the user at the point of interaction: what data the chatbot processes, for what purpose, legal basis, retention and their rights (GDPR Arts. 13-14), with an accessible link to the privacy policy. Evidence = information text shown in the chat and its link to the data-protection information.",
      article: "RGPD Arts. 13-14",
      severity: "media",
    },
    {
      id: "base-juridica",
      title: "Legal basis for the processing (GDPR)",
      description:
        "Determine and document the legal basis for processing the data that passes through the chatbot or generative AI (GDPR Art. 6): usually performance of the contract or legitimate interest for customer service. If you process special categories (e.g. health mentioned by the customer) you need an Art. 9 condition. Evidence = record of processing activities with the legal basis identified per purpose.",
      article: "RGPD Art. 6 (y Art. 9)",
      severity: "media",
    },
    {
      id: "decision-automatizada",
      title: "Decision not solely automated (GDPR Art. 22)",
      description:
        "If the chatbot takes decisions with a legal or significant effect on the person without human intervention (e.g. automatically denies a refund, cancels a service or rejects a claim), GDPR Art. 22 applies: guarantee genuine human intervention, the person's right to express their point of view, obtain an explanation and contest it. Evidence = flow design that ensures human intervention and the channel to contest (or confirmation that the chatbot does not take significant decisions on its own).",
      article: "RGPD Art. 22",
      severity: "alta",
      conditional:
        "Applies only if the system takes automated decisions with a significant effect (e.g. denying a service/refund).",
    },
    {
      id: "minimizacion",
      title: "Data minimisation in the conversation (GDPR)",
      description:
        "Limit the data the chatbot collects and retains to what is necessary for the purpose (GDPR Art. 5.1.c): avoid requesting or storing more personal data than needed, and define a limited retention of transcripts. Evidence = collection/retention configuration and a minimisation policy applied to the chatbot.",
      article: "RGPD Art. 5.1.c",
      severity: "media",
    },
    {
      id: "entrenamiento-conversaciones",
      title:
        "Do not train the model on customer conversations without a legal basis",
      description:
        "Reusing customer conversations to train or fine-tune models is a new processing: it needs its own legal basis and respects purpose limitation (GDPR Arts. 5.1.b and 6); using data collected to «provide support» for the different purpose of «training AI» without a basis or information is a real risk. Also, require and keep from the provider its policy on whether it uses your data/prompts to train (many offer «zero-retention»/opt-out). Evidence = documented decision on whether or not conversations are used for training, its legal basis and information, and the provider's clause on training with your data.",
      article: "RGPD Arts. 5.1.b y 6 (limitación de finalidad)",
      severity: "alta",
    },
    {
      id: "marca-contenido-sintetico",
      title:
        "Machine-readable synthetic-content marking (require from the provider)",
      description:
        "Marking the generated output (text, image, audio, video) in a machine-readable format detectable as artificial is an obligation of the PROVIDER of the generative system (Art. 50.2), not yours as deployer. Your control = require the provider to embed that interoperable mark/watermark in its output and keep it as evidence; it also helps you meet your own Art. 50.4 labelling. Evidence = provider confirmation that it marks the content (technical documentation / contractual clause).",
      article: "Art. 50.2 (proveedor; deployer exige)",
      severity: "media",
      conditional: "Applicable from 2 Aug 2026.",
    },
    {
      id: "gpai-evidencia-proveedor",
      title: "GPAI model documentation (require and keep from the provider)",
      description:
        "If you only USE a general-purpose model (e.g. GPT or Claude) via API or a SaaS product, you are a deployer/end user, NOT a GPAI provider: the Chapter V obligations (technical documentation Art. 53, public summary of the training data Art. 53.1.d, copyright policy, systemic risk Art. 55) fall on the model PROVIDER. Your control = require and keep from the provider: model documentation, acceptable-use policy, training-data summary and the content-marking mechanism. LINE to watch: if you do substantial fine-tuning that changes the model's capabilities and publish it under your brand, you may become a provider (Art. 25 / GPAI guidance) and take on those obligations. Evidence = archived provider documentation + confirmation that your use is «deployment only», not substantial modification under your brand.",
      article: "Cap. V (proveedor) + Art. 25 (línea deployer→proveedor)",
      severity: "media",
    },
    {
      id: "exactitud-supervision",
      title: "Reliability, human oversight and disclaimers (good practice)",
      description:
        "The AI Act does NOT impose on these limited-risk systems the high-risk accuracy/robustness obligations; a chatbot hallucinating false information is not, in itself, a breach of the AI Act. But it is a real consumer-protection and contractual-liability risk, so it is treated as GOOD governance PRACTICE (not as an AI Act obligation): require from the provider reliability metrics and their limits, offer an escalation route to a human agent, and add a notice that the answers are indicative and may contain errors. Evidence = reliability metrics/limitations declared by the provider, the human-escalation design and the disclaimer text.",
      article:
        "Buena práctica (protección al consumidor); no es obligación de alto riesgo del AI Act",
      severity: "media",
    },
    {
      id: "conservacion-evidencia",
      title: "Retention of evidence and accountability",
      description:
        "Keep a record of the governance decisions and of the transparency evidence: what AI content was labelled and how, the active chatbot notices, the classification triage note, the training (Art. 4) and the clauses required from the provider. It serves to demonstrate accountability (GDPR Art. 5.2) and to prove Art. 50 transparency before an authority. Evidence = file with the notices, labelling, triage and provider documentation, dated.",
      article: "RGPD Art. 5.2 (responsabilidad proactiva)",
      severity: "media",
    },
  ],
};
