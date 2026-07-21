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
