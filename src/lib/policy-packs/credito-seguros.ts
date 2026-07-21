/**
 * Policy pack — Crédito y seguros (scoring crediticio · suscripción de vida y salud).
 *
 * Catálogo de controles para un DEPLOYER (banco, fintech, aseguradora, prestamista
 * mid-market) que usa IA para (a) evaluar la solvencia / credit scoring de personas
 * físicas y (b) evaluación de riesgo y fijación de precios en seguros de VIDA y SALUD.
 * Ambos son ALTO RIESGO del Anexo III: punto 5.(b) (solvencia/scoring, con excepción de
 * detección de fraude) y punto 5.(c) (pricing de vida y salud). Precarga las brechas de
 * un gap assessment.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Contenido revisado por el subagente
 * `compliance-domain-expert` (2026-07-21) contra el texto literal del Anexo III.5.b/5.c,
 * el Art. 6(3), los Arts. 4/26/27/86 y los Arts. 10/11/15/25 (reencuadrados como evidencia
 * del proveedor), el RGPD (Arts. 5/9/13-14/22/35), la jurisprudencia del TJUE
 * (SCHUFA C-634/21, 7-dic-2023, sobre scoring como decisión automatizada del Art. 22;
 * Test-Achats C-236/09, 1-mar-2011, sobre tarifa unisex bajo la Directiva 2004/113/CE) y la
 * normativa sectorial (CCD 2023/2225, MCD 2014/17/UE, IDD 2016/97, Solvencia II). El texto
 * literal del Anexo III.5.b/5.c, la excepción de fraude y el alcance de la FRIA (Art. 27
 * aplica a deployers privados de 5.b/5.c) se verificaron contra artificialintelligenceact.eu.
 * Plazo del alto riesgo del Anexo III → 2-dic-2027 (Digital Omnibus) verificado contra
 * Gibson Dunn, White & Case y DLA Piper (Consejo de la UE, 29-jun-2026).
 *
 * NOTA de producto: la GRAN diferencia con los packs de RRHH es que aquí la FRIA (Art. 27)
 * SÍ es obligatoria para el deployer aunque sea entidad privada ordinaria (el Art. 27.1 la
 * exige expresamente a los deployers de sistemas del Anexo III 5.b y 5.c). Los tres primeros
 * controles son de TRIAJE de clasificación/exención: cerrar una brecha de triaje = "verifiqué
 * el alcance / la exención", no "preparé un sistema alto riesgo".
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";
import type { PolicyPack } from "./types";

export const CREDITO_SEGUROS_PACK: PolicyPack = {
  id: "credito-seguros",
  name: "Crédito y seguros (EU AI Act)",
  tag: "UE · Scoring y suscripción",
  summary:
    "Controles para IA de scoring crediticio de personas físicas y de evaluación de riesgo y pricing en seguros de vida y salud (alto riesgo, Anexo III.5.b y 5.c). Aplícalo a un sistema para precargar sus brechas.",
  note:
    "Plazos del EU AI Act (deployer): la alfabetización en IA (Art. 4) ya es exigible (desde el 2-feb-2025); las obligaciones de alto riesgo del Anexo III.5.b/5.c (Arts. 26/27/86) se aplazaron al 2-dic-2027 con el Digital Omnibus, NO al 2-ago-2026 (un error extendido en el mercado). A diferencia de los packs de RRHH, aquí la FRIA (Art. 27) SÍ obliga al deployer aunque sea una entidad privada. Además del AI Act sigue aplicando en paralelo tu normativa sectorial (crédito al consumo 2023/2225, crédito hipotecario 2014/17/UE, IDD 2016/97, Solvencia II) y el RGPD, incluida la tarifa unisex en seguros (Test-Achats). Este pack te deja lista la evidencia con antelación.",
  controls: [
    {
      id: "clasificacion-alcance",
      title: "Alcance del alto riesgo: solo personas físicas, solo vida y salud (triaje)",
      description:
        "Antes de aplicar el resto de controles, confirma que el sistema cae en el Anexo III: 5.b cubre evaluar la solvencia o establecer el credit score de PERSONAS FÍSICAS —el scoring de empresas/personas jurídicas queda fuera—; 5.c cubre la evaluación de riesgo y la fijación de precios de PERSONAS FÍSICAS en seguros de VIDA y SALUD —auto, hogar y demás ramos de no vida quedan fuera del 5.c (aunque pueden estar sujetos al RGPD y a la normativa sectorial)—. Casos límite señalados por la Comisión que sí entran: seguro de vida ligado a hipoteca, dependencia privada de largo plazo y productos de pensión personal con impacto en el sustento. Evidencia = nota de alcance que identifica el uso concreto, el tipo de persona evaluada y el ramo, con la conclusión de clasificación.",
      article: "Anexo III.5.b / 5.c",
      severity: "alta",
      conditional:
        "Triaje de clasificación. Si el sistema no evalúa a personas físicas, o el seguro no es de vida/salud, revisa si queda fuera del 5.b/5.c antes de tratarlo como alto riesgo.",
    },
    {
      id: "exencion-fraude",
      title: "Excepción de detección de fraude financiero (triaje)",
      description:
        "El Anexo III.5.b excluye expresamente los sistemas usados para detectar fraude financiero: un motor cuya finalidad real sea detectar fraude (transaccional, blanqueo, suplantación) NO es alto riesgo por esta vía. Comprueba con honestidad la finalidad: si el mismo sistema también puntúa la solvencia, la excepción cubre SOLO la función de fraude, no la de scoring, que sigue siendo alto riesgo. Evidencia = descripción de la finalidad del sistema y confirmación documentada de si opera como detección de fraude, como scoring de solvencia, o ambas (delimitando cada función).",
      article: "Anexo III.5.b (excepción de fraude)",
      severity: "media",
      conditional:
        "Triaje. Aplica solo si el proveedor/tu organización invocan la excepción de detección de fraude para no clasificar el sistema como alto riesgo.",
    },
    {
      id: "no-alto-riesgo-6-3",
      title: "El filtro de «no alto riesgo» (Art. 6.3) no aplica al perfilado",
      description:
        "No asumas que el scoring o el pricing escapan del alto riesgo por el Art. 6(3) (tarea procedimental limitada, mejora de una actividad humana previa, etc.). El propio Art. 6(3) cierra con una excepción absoluta: un sistema del Anexo III se considera SIEMPRE de alto riesgo cuando realiza perfilado de personas físicas —y evaluar solvencia o fijar primas por riesgo individual es perfilado. Evidencia = nota que confirma que el sistema perfila personas físicas y, por tanto, que no puede acogerse a la excepción del Art. 6(3).",
      article: "Art. 6.3 (excepción de perfilado)",
      severity: "media",
      conditional:
        "Triaje. Documenta esta conclusión si alguien propone tratar el sistema como «no alto riesgo».",
    },
    {
      id: "fria",
      title: "Evaluación de impacto en derechos fundamentales (FRIA) — OBLIGATORIA aquí",
      description:
        "A diferencia de otros usos de alto riesgo, el Art. 27 EXIGE la FRIA al deployer de sistemas del Anexo III 5.b y 5.c AUNQUE sea una entidad privada ordinaria (banco, fintech, aseguradora). Realízala ANTES del primer despliegue y documenta: (a) tus procesos donde se usa el sistema; (b) periodo y frecuencia de uso; (c) categorías de personas y grupos afectados; (d) riesgos específicos de perjuicio para ellos (p. ej. denegación de crédito, exclusión de cobertura, precios discriminatorios); (e) medidas de supervisión humana según las instrucciones de uso; (f) medidas ante la materialización del riesgo, con gobernanza interna y mecanismo de reclamación. Notifica los resultados a la autoridad de vigilancia del mercado con la plantilla de la Oficina de IA (Art. 27.3). Si ya tienes una DPIA del RGPD, la FRIA la complementa, no la sustituye (Art. 27.4). Evidencia = FRIA firmada y fechada con los seis apartados y constancia de la notificación.",
      article: "Art. 27",
      severity: "alta",
    },
    {
      id: "supervision-humana",
      title: "Supervisión humana efectiva en la decisión (crítica en denegaciones)",
      description:
        "Designa a una persona competente, formada y con autoridad para revisar, no seguir o anular la recomendación de la IA antes de una decisión con impacto —denegación o encarecimiento de un crédito, rechazo o sobreprima en un seguro. Como deployer, DESIGNAR a esa persona es tu obligación (Art. 26.2); que el sistema permita la supervisión es diseño del proveedor (Art. 14). La supervisión debe ser real, no un sello automático. Evidencia = persona/rol designado, su formación y el procedimiento de revisión/anulación, especialmente en decisiones desfavorables.",
      article: "Art. 26.2 (y Art. 14)",
      severity: "alta",
    },
    {
      id: "decision-automatizada-art22",
      title: "Decisión no meramente automatizada (GDPR Art. 22 + SCHUFA)",
      description:
        "La denegación automática de crédito o de cobertura es el caso de manual del RGPD Art. 22: garantiza intervención humana real y el derecho del afectado a expresar su punto de vista, obtener explicación e impugnar. El TJUE en SCHUFA (C-634/21) declaró que generar el score ya es una decisión automatizada del Art. 22 cuando un tercero se apoya de forma determinante en él; si usas un score de un bureau, verifica quién soporta la obligación del Art. 22 y que tu decisión final no sea un mero reflejo del score. Evidencia = diseño del flujo que garantiza intervención humana significativa y canal de impugnación documentado.",
      article: "GDPR Art. 22 (SCHUFA C-634/21)",
      severity: "alta",
    },
    {
      id: "no-discriminacion-credito",
      title: "No discriminación y sesgo por proxies en crédito",
      description:
        "El deber directo nace de la normativa antidiscriminación (Directivas UE 2000/43/CE de igualdad racial, 2004/113/CE de género en bienes y servicios, y ley nacional): vigila que el scoring no produzca impacto desigual por características protegidas ni a través de PROXIES (código postal como proxy de origen o «redlining», nombre, tipo de dispositivo, etc.). Exige además al proveedor evidencia de sus pruebas de sesgo (obligación del proveedor, Art. 10, no tuya como deployer). Evidencia = análisis de impacto desigual propio sobre las decisiones + identificación de posibles proxies + documentación de sesgo exigida al proveedor.",
      article: "Normativa antidiscriminación (Art. 10 = proveedor)",
      severity: "alta",
      conditional: "Aplica de forma prioritaria al scoring crediticio.",
    },
    {
      id: "tarifa-unisex-seguros",
      title: "Tarifa neutra por sexo en seguros (Test-Achats)",
      description:
        "En seguros de vida y salud, el pricing por IA no puede usar el sexo como factor de riesgo que genere primas o prestaciones distintas: el TJUE en Test-Achats (C-236/09) invalidó la excepción del Art. 5.2 de la Directiva 2004/113/CE, imponiendo la tarifa unisex para contratos nuevos desde el 21-dic-2012. Verifica que ni el sexo ni proxies del sexo entren en el modelo de pricing con efecto diferenciador. Evidencia = confirmación de las variables del modelo de pricing y de que no producen diferencias de prima por sexo, directa o indirectamente.",
      article: "Directiva 2004/113/CE (Test-Achats C-236/09)",
      severity: "alta",
      conditional: "Aplica al pricing de seguros (Anexo III.5.c).",
    },
    {
      id: "datos-salud-especial",
      title: "Datos de salud como categoría especial (RGPD Art. 9)",
      description:
        "La suscripción de seguros de salud y vida trata datos de salud —y a veces genéticos—, categoría especial del RGPD (Art. 9): su uso exige una base del Art. 9.2 (a menudo consentimiento explícito o previsión legal), y varios Estados miembros restringen o prohíben el uso de datos genéticos y de determinada información de salud por aseguradoras. Confirma la base jurídica y los límites nacionales antes de alimentar el modelo con estos datos. Evidencia = base del Art. 9.2 identificada, límites nacionales verificados y registro de las categorías de datos de salud/genéticos tratadas.",
      article: "GDPR Art. 9",
      severity: "alta",
      conditional: "Aplica a seguros de salud y de vida que traten datos de salud/genéticos.",
    },
    {
      id: "explicacion-afectado",
      title: "Derecho a explicación de la decisión individual (Art. 86)",
      description:
        "Prepara el circuito para atender solicitudes de explicación clara y significativa del papel del sistema de IA en una decisión individual de alto riesgo con efectos significativos (denegación de crédito, rechazo o sobreprima de seguro). Este derecho del Art. 86 se suma a la explicación que ya exige la normativa de crédito al consumo (2023/2225) tras una denegación basada en consulta de bases de datos. Evidencia = procedimiento y plantilla de respuesta a solicitudes de explicación, con registro de las emitidas.",
      article: "Art. 86",
      severity: "alta",
      conditional: "Exigible con el régimen de alto riesgo del Anexo III (2-dic-2027).",
    },
    {
      id: "info-afectado",
      title: "Información a la persona afectada por la decisión",
      description:
        "Informa a la persona de que está sujeta a un sistema de IA de alto riesgo (obligación del deployer, Art. 26.11) y facilita la información de protección de datos del RGPD: finalidad, base jurídica, lógica implicada y datos tratados (Arts. 13-14). Evidencia = aviso entregado al solicitante/asegurado y plantilla de información de protección de datos.",
      article: "Art. 26.11 (y GDPR Arts. 13-14)",
      severity: "media",
    },
    {
      id: "datos-entrada",
      title: "Datos de entrada pertinentes y representativos",
      description:
        "En la medida en que controlas los datos de entrada (variables financieras, historial, datos declarados por el solicitante, ponderaciones), asegúrate de que son pertinentes, exactos y suficientemente representativos para la finalidad prevista, y de no introducir señales espurias ni proxies de características protegidas. Evidencia = descripción de las fuentes de datos de entrada y su validación.",
      article: "Art. 26.4",
      severity: "media",
    },
    {
      id: "monitoreo",
      title: "Monitoreo del funcionamiento y suspensión ante riesgo",
      description:
        "Vigila el funcionamiento del sistema conforme a las instrucciones; si aprecias que su uso puede presentar un riesgo (deriva del modelo, tasa de denegación anómala, impacto desigual sobrevenido), suspende el uso e informa al proveedor y, cuando proceda, a la autoridad, y notifica los incidentes graves. Evidencia = registro de revisiones, incidencias detectadas y acciones tomadas.",
      article: "Art. 26.5",
      severity: "media",
    },
    {
      id: "logs",
      title: "Conservación de registros (logs) del sistema",
      description:
        "Conserva los logs generados automáticamente por el sistema, en la medida en que estén bajo tu control, durante un periodo adecuado a la finalidad y de al menos 6 meses (sin perjuicio de plazos sectoriales de conservación más largos). Evidencia = política de retención de logs y confirmación del periodo configurado.",
      article: "Art. 26.6",
      severity: "media",
    },
    {
      id: "instrucciones",
      title: "Uso conforme a las instrucciones del proveedor",
      description:
        "Usa el sistema conforme a las instrucciones de uso del proveedor y a su finalidad prevista (Art. 26.1). Usarlo para un propósito o población distintos de los previstos puede convertirte en proveedor (ver control de rol). Evidencia = instrucciones de uso archivadas y confirmación de que el uso real se ajusta a la finalidad prevista.",
      article: "Art. 26.1",
      severity: "media",
    },
    {
      id: "alfabetizacion-ia",
      title: "Alfabetización en IA del personal",
      description:
        "Adopta medidas para que quienes operan o supervisan el sistema (analistas de riesgo, suscriptores, comité de crédito) tengan un nivel suficiente de alfabetización en IA —capacidades, límites y riesgos—, proporcionado a su rol. Es un deber PROPIO y directo del deployer, exigible desde el 2 de febrero de 2025. Evidencia = registro de la formación u onboarding impartido (fecha, asistentes y contenidos).",
      article: "Art. 4",
      severity: "media",
      conditional: "Exigible desde el 2 de febrero de 2025 (ya vigente).",
    },
    {
      id: "dpia",
      title: "Evaluación de impacto de protección de datos (DPIA)",
      description:
        "La evaluación sistemática y el scoring de personas con efectos jurídicos o significativos (crédito, primas) casi siempre requieren una DPIA previa bajo el RGPD (Art. 35, en especial 35.3.a evaluación sistemática y exhaustiva basada en tratamiento automatizado). Realízala antes del tratamiento; la FRIA del Art. 27 la complementa, no la sustituye. Evidencia = DPIA firmada con fecha, riesgos y medidas mitigadoras.",
      article: "GDPR Art. 35",
      severity: "alta",
    },
    {
      id: "gobernanza-datos-sesgo",
      title: "Gobernanza de datos y pruebas de sesgo (exige evidencia al proveedor)",
      description:
        "La gobernanza de los datos de entrenamiento y las pruebas de sesgo sobre esos datos son obligación de diseño del PROVEEDOR (Art. 10): exígele documentación de la representatividad de los datos, del examen de posibles sesgos y de las medidas de mitigación —crítico en scoring/pricing, donde un sesgo en los datos se traslada a decisiones sobre personas. Evidencia = documentación de gobernanza de datos y pruebas de sesgo obtenida del proveedor y archivada.",
      article: "Art. 10 (proveedor)",
      severity: "media",
    },
    {
      id: "exactitud-robustez",
      title: "Exactitud, robustez y ciberseguridad (exige evidencia al proveedor)",
      description:
        "El nivel adecuado de exactitud, robustez y ciberseguridad es obligación de diseño del proveedor (Art. 15): exígele las métricas y sus límites declarados —especialmente la fiabilidad del score/predicción de riesgo— y vigila en uso real que el rendimiento se mantiene (Art. 26.5). Evidencia = métricas y límites declarados por el proveedor + registro de tu verificación en uso.",
      article: "Art. 15 (proveedor) + Art. 26.5",
      severity: "media",
    },
    {
      id: "documentacion",
      title: "Documentación técnica del proveedor",
      description:
        "Exige y conserva como evidencia la información que el proveedor debe facilitarte: instrucciones de uso e información derivada de la documentación técnica (Art. 11 / Anexo IV), obligación del proveedor. Te sirve para tu FRIA, tu supervisión humana y tu rendición de cuentas. Evidencia = documentación e instrucciones del proveedor archivadas.",
      article: "Art. 11 / Anexo IV (proveedor)",
      severity: "media",
    },
    {
      id: "rol-proveedor-deployer",
      title: "Rol proveedor vs deployer (modelo propio o modificación sustancial)",
      description:
        "Si usas un modelo de scoring/pricing de un tercero eres DEPLOYER (exiges y conservas evidencia del proveedor). Pasas a ser PROVEEDOR —con todas las obligaciones de diseño (Arts. 9-15)— si pones tu marca en el sistema, lo modificas sustancialmente o cambias su finalidad prevista (Art. 25), o si entrenas tu propio modelo. Delimita y documenta tu rol, porque cambia radicalmente tus obligaciones. Evidencia = nota que determina el rol (deployer/proveedor) por cada sistema, con la justificación (uso «tal cual», reentrenamiento, marca propia, cambio de finalidad).",
      article: "Art. 25",
      severity: "media",
    },
    {
      id: "normativa-sectorial",
      title: "Normativa financiera y aseguradora sectorial (sigue aplicando)",
      description:
        "Además del AI Act, tu normativa sectorial sigue vigente en paralelo y puede imponer requisitos propios: en crédito, la Directiva de Crédito al Consumo (UE) 2023/2225 (obligación de evaluación de solvencia, reglas sobre uso de datos y derecho a explicación/revisión humana del scoring) y la Directiva de Crédito Hipotecario 2014/17/UE; en seguros, la IDD 2016/97 (distribución) y Solvencia II (gobernanza y gestión de riesgos). No los desarrolla este pack; se listan para que verifiques su encaje con tu supervisor sectorial. Evidencia = identificación de la normativa sectorial aplicable y confirmación de su tratamiento (o dictamen que lo respalde).",
      article: "CCD 2023/2225 · MCD 2014/17/UE · IDD 2016/97 · Solvencia II",
      severity: "media",
      conditional:
        "El detalle depende del producto (crédito al consumo, hipoteca, seguro) y de la transposición nacional.",
    },
  ],
};
