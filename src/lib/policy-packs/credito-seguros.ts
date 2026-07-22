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

/**
 * English (validated) mirror of CREDITO_SEGUROS_PACK. Content only:
 * `id`/`article`/`severity`/`conditional` logic kept identical to the ES pack;
 * `name`, `tag`, `summary`, `note`, titles and descriptions translated.
 * Deployer framing and prohibited-copy rules preserved. Key nuance kept faithful:
 * the FRIA (Art. 27) IS mandatory for the private deployer under Annex III 5.b/5.c.
 */
export const CREDITO_SEGUROS_PACK_EN: PolicyPack = {
  id: "credito-seguros",
  name: "Credit and insurance (EU AI Act)",
  tag: "EU · Scoring and underwriting",
  summary:
    "Controls for AI used in credit scoring of natural persons and in risk assessment and pricing for life and health insurance (high-risk, Annex III.5.b and 5.c). Apply it to a system to preload its gaps.",
  note:
    "EU AI Act deadlines (deployer): AI literacy (Art. 4) is already enforceable (since 2 Feb 2025); the Annex III.5.b/5.c high-risk obligations (Arts. 26/27/86) were postponed to 2 Dec 2027 by the Digital Omnibus, NOT to 2 Aug 2026 (a widespread misconception in the market). Unlike the HR packs, here the FRIA (Art. 27) DOES bind the deployer even if it is a private entity. Beyond the AI Act, your sectoral rules continue to apply in parallel (consumer credit 2023/2225, mortgage credit 2014/17/EU, IDD 2016/97, Solvency II) and so does the GDPR, including unisex insurance pricing (Test-Achats). This pack gets your evidence ready ahead of time.",
  controls: [
    {
      id: "clasificacion-alcance",
      title:
        "Scope of high-risk: only natural persons, only life and health (triage)",
      description:
        "Before applying the rest of the controls, confirm that the system falls under Annex III: 5.b covers assessing the creditworthiness or establishing the credit score of NATURAL PERSONS —scoring of companies/legal persons is out of scope—; 5.c covers risk assessment and pricing for NATURAL PERSONS in LIFE and HEALTH insurance —motor, home and other non-life lines are out of scope of 5.c (although they may be subject to the GDPR and sectoral rules)—. Borderline cases flagged by the Commission that do fall in: mortgage-linked life insurance, private long-term care and personal pension products with an impact on livelihood. Evidence = scope note identifying the specific use, the type of person assessed and the line of business, with the classification conclusion.",
      article: "Anexo III.5.b / 5.c",
      severity: "alta",
      conditional:
        "Classification triage. If the system does not assess natural persons, or the insurance is not life/health, check whether it falls outside 5.b/5.c before treating it as high-risk.",
    },
    {
      id: "exencion-fraude",
      title: "Financial-fraud detection exception (triage)",
      description:
        "Annex III.5.b expressly excludes systems used to detect financial fraud: an engine whose actual purpose is to detect fraud (transactional, money-laundering, impersonation) is NOT high-risk on this ground. Check the purpose honestly: if the same system also scores creditworthiness, the exception covers ONLY the fraud function, not the scoring function, which remains high-risk. Evidence = description of the system's purpose and documented confirmation of whether it operates as fraud detection, as creditworthiness scoring, or both (delimiting each function).",
      article: "Anexo III.5.b (fraud exception)",
      severity: "media",
      conditional:
        "Triage. Applies only if the provider/your organization invoke the fraud-detection exception to avoid classifying the system as high-risk.",
    },
    {
      id: "no-alto-riesgo-6-3",
      title: "The «not high-risk» filter (Art. 6.3) does not apply to profiling",
      description:
        "Do not assume that scoring or pricing escapes high-risk via Art. 6(3) (limited procedural task, improving a prior human activity, etc.). Art. 6(3) itself closes with an absolute exception: an Annex III system is ALWAYS considered high-risk when it performs profiling of natural persons —and assessing creditworthiness or setting premiums by individual risk is profiling. Evidence = note confirming that the system profiles natural persons and, therefore, that it cannot rely on the Art. 6(3) exception.",
      article: "Art. 6.3 (profiling exception)",
      severity: "media",
      conditional:
        "Triage. Document this conclusion if anyone proposes treating the system as «not high-risk».",
    },
    {
      id: "fria",
      title:
        "Fundamental rights impact assessment (FRIA) — MANDATORY here",
      description:
        "Unlike other high-risk uses, Art. 27 REQUIRES the FRIA from the deployer of Annex III 5.b and 5.c systems EVEN IF it is an ordinary private entity (bank, fintech, insurer). Carry it out BEFORE the first deployment and document: (a) your processes where the system is used; (b) period and frequency of use; (c) categories of persons and groups affected; (d) specific risks of harm to them (e.g. denial of credit, exclusion from cover, discriminatory prices); (e) human-oversight measures under the instructions for use; (f) measures in the event the risk materialises, with internal governance and a complaint mechanism. Notify the results to the market surveillance authority using the AI Office template (Art. 27.3). If you already have a GDPR DPIA, the FRIA complements it, it does not replace it (Art. 27.4). Evidence = signed and dated FRIA with the six items and a record of the notification.",
      article: "Art. 27",
      severity: "alta",
    },
    {
      id: "supervision-humana",
      title:
        "Effective human oversight in the decision (critical in denials)",
      description:
        "Designate a competent person, trained and with authority to review, not follow or override the AI's recommendation before a decision with impact —denial or increased cost of a loan, rejection or surcharge in an insurance policy. As a deployer, DESIGNATING that person is your obligation (Art. 26.2); that the system enables oversight is the provider's design (Art. 14). The oversight must be genuine, not an automatic rubber stamp. Evidence = designated person/role, their training and the review/override procedure, especially in unfavorable decisions.",
      article: "Art. 26.2 (and Art. 14)",
      severity: "alta",
    },
    {
      id: "decision-automatizada-art22",
      title:
        "Decision not solely automated (GDPR Art. 22 + SCHUFA)",
      description:
        "The automatic denial of credit or of cover is the textbook case of GDPR Art. 22: guarantee genuine human intervention and the affected person's right to express their point of view, obtain an explanation and contest it. The CJEU in SCHUFA (C-634/21) held that generating the score is already an automated decision under Art. 22 when a third party relies on it in a determinative way; if you use a bureau's score, verify who bears the Art. 22 obligation and that your final decision is not a mere reflection of the score. Evidence = flow design that guarantees meaningful human intervention and a documented channel to contest.",
      article: "GDPR Art. 22 (SCHUFA C-634/21)",
      severity: "alta",
    },
    {
      id: "no-discriminacion-credito",
      title: "Non-discrimination and proxy bias in credit",
      description:
        "The direct duty arises from anti-discrimination law (EU Directives 2000/43/EC on racial equality, 2004/113/EC on gender in goods and services, and national law): monitor that the scoring does not produce disparate impact on protected characteristics or through PROXIES (postcode as a proxy for origin or «redlining», name, device type, etc.). Also require from the provider evidence of its bias testing (a provider obligation, Art. 10, not yours as deployer). Evidence = your own disparate-impact analysis of the decisions + identification of possible proxies + bias documentation required from the provider.",
      article: "Anti-discrimination law (Art. 10 = provider)",
      severity: "alta",
      conditional: "Applies as a priority to credit scoring.",
    },
    {
      id: "tarifa-unisex-seguros",
      title: "Sex-neutral pricing in insurance (Test-Achats)",
      description:
        "In life and health insurance, AI pricing may not use sex as a risk factor that generates different premiums or benefits: the CJEU in Test-Achats (C-236/09) invalidated the exception in Art. 5.2 of Directive 2004/113/EC, imposing unisex pricing for new contracts from 21 Dec 2012. Verify that neither sex nor proxies for sex enter the pricing model with a differentiating effect. Evidence = confirmation of the pricing model's variables and that they do not produce premium differences by sex, directly or indirectly.",
      article: "Directiva 2004/113/CE (Test-Achats C-236/09)",
      severity: "alta",
      conditional: "Applies to insurance pricing (Annex III.5.c).",
    },
    {
      id: "datos-salud-especial",
      title: "Health data as a special category (GDPR Art. 9)",
      description:
        "Underwriting of health and life insurance processes health data —and sometimes genetic data—, a special category under the GDPR (Art. 9): its use requires an Art. 9.2 basis (often explicit consent or a legal provision), and several Member States restrict or prohibit the use of genetic data and certain health information by insurers. Confirm the legal basis and the national limits before feeding the model with these data. Evidence = identified Art. 9.2 basis, verified national limits and a record of the categories of health/genetic data processed.",
      article: "GDPR Art. 9",
      severity: "alta",
      conditional:
        "Applies to health and life insurance that process health/genetic data.",
    },
    {
      id: "explicacion-afectado",
      title: "Right to explanation of the individual decision (Art. 86)",
      description:
        "Set up the process to handle requests for a clear and meaningful explanation of the AI system's role in an individual high-risk decision with significant effects (denial of credit, rejection or surcharge of insurance). This Art. 86 right adds to the explanation already required by consumer-credit law (2023/2225) after a denial based on a database consultation. Evidence = procedure and response template for explanation requests, with a record of those issued.",
      article: "Art. 86",
      severity: "alta",
      conditional:
        "Enforceable under the Annex III high-risk regime (2 Dec 2027).",
    },
    {
      id: "info-afectado",
      title: "Information to the person affected by the decision",
      description:
        "Inform the person that they are subject to a high-risk AI system (a deployer obligation, Art. 26.11) and provide the GDPR data-protection information: purpose, legal basis, logic involved and data processed (Arts. 13-14). Evidence = notice given to the applicant/insured and a data-protection information template.",
      article: "Art. 26.11 (and GDPR Arts. 13-14)",
      severity: "media",
    },
    {
      id: "datos-entrada",
      title: "Relevant and representative input data",
      description:
        "To the extent that you control the input data (financial variables, history, data declared by the applicant, weightings), ensure that they are relevant, accurate and sufficiently representative for the intended purpose, and do not introduce spurious signals or proxies for protected characteristics. Evidence = description of the input data sources and their validation.",
      article: "Art. 26.4",
      severity: "media",
    },
    {
      id: "monitoreo",
      title: "Monitoring of operation and suspension upon risk",
      description:
        "Monitor the system's operation in accordance with the instructions; if you find that its use may present a risk (model drift, anomalous denial rate, emergent disparate impact), suspend use and inform the provider and, where appropriate, the authority, and report serious incidents. Evidence = record of reviews, incidents detected and actions taken.",
      article: "Art. 26.5",
      severity: "media",
    },
    {
      id: "logs",
      title: "Retention of the system's logs",
      description:
        "Keep the logs automatically generated by the system, to the extent they are under your control, for a period appropriate to the purpose and of at least 6 months (without prejudice to longer sectoral retention periods). Evidence = log retention policy and confirmation of the configured period.",
      article: "Art. 26.6",
      severity: "media",
    },
    {
      id: "instrucciones",
      title: "Use in line with the provider's instructions",
      description:
        "Use the system in accordance with the provider's instructions for use and its intended purpose (Art. 26.1). Using it for a purpose or population other than those intended may turn you into a provider (see the role control). Evidence = archived instructions for use and confirmation that real use conforms to the intended purpose.",
      article: "Art. 26.1",
      severity: "media",
    },
    {
      id: "alfabetizacion-ia",
      title: "AI literacy of staff",
      description:
        "Take measures so that those who operate or oversee the system (risk analysts, underwriters, credit committee) have a sufficient level of AI literacy —capabilities, limits and risks—, proportionate to their role. This is a DIRECT, OWN duty of the deployer, enforceable since 2 February 2025. Evidence = record of the training or onboarding delivered (date, attendees and content).",
      article: "Art. 4",
      severity: "media",
      conditional: "Enforceable since 2 February 2025 (already in force).",
    },
    {
      id: "dpia",
      title: "Data protection impact assessment (DPIA)",
      description:
        "The systematic evaluation and scoring of persons with legal or significant effects (credit, premiums) almost always require a prior DPIA under the GDPR (Art. 35, especially 35.3.a systematic and extensive evaluation based on automated processing). Carry it out before the processing; the Art. 27 FRIA complements it, it does not replace it. Evidence = signed DPIA with date, risks and mitigating measures.",
      article: "GDPR Art. 35",
      severity: "alta",
    },
    {
      id: "gobernanza-datos-sesgo",
      title:
        "Data governance and bias testing (require evidence from the provider)",
      description:
        "The governance of the training data and the bias testing on that data are the PROVIDER's design obligation (Art. 10): require from it documentation of the representativeness of the data, of the examination of possible biases and of the mitigation measures —critical in scoring/pricing, where a bias in the data carries over into decisions about people. Evidence = data governance and bias-testing documentation obtained from the provider and archived.",
      article: "Art. 10 (provider)",
      severity: "media",
    },
    {
      id: "exactitud-robustez",
      title:
        "Accuracy, robustness and cybersecurity (require evidence from the provider)",
      description:
        "An appropriate level of accuracy, robustness and cybersecurity is the provider's design obligation (Art. 15): require from it the declared metrics and their limits —especially the reliability of the score/risk prediction— and monitor in real use that performance is maintained (Art. 26.5). Evidence = metrics and limits declared by the provider + a record of your verification in use.",
      article: "Art. 15 (provider) + Art. 26.5",
      severity: "media",
    },
    {
      id: "documentacion",
      title: "Provider's technical documentation",
      description:
        "Require and keep as evidence the information the provider must supply to you: instructions for use and information derived from the technical documentation (Art. 11 / Annex IV), a provider obligation. It serves your FRIA, your human oversight and your accountability. Evidence = provider documentation and instructions archived.",
      article: "Art. 11 / Annex IV (provider)",
      severity: "media",
    },
    {
      id: "rol-proveedor-deployer",
      title:
        "Provider vs deployer role (own model or substantial modification)",
      description:
        "If you use a third party's scoring/pricing model you are a DEPLOYER (you require and keep the provider's evidence). You become a PROVIDER —with all the design obligations (Arts. 9-15)— if you put your brand on the system, substantially modify it or change its intended purpose (Art. 25), or if you train your own model. Delimit and document your role, because it radically changes your obligations. Evidence = note determining the role (deployer/provider) for each system, with the justification (use «as is», retraining, own brand, change of purpose).",
      article: "Art. 25",
      severity: "media",
    },
    {
      id: "normativa-sectorial",
      title: "Sectoral financial and insurance rules (still apply)",
      description:
        "Beyond the AI Act, your sectoral rules remain in force in parallel and may impose their own requirements: in credit, the Consumer Credit Directive (EU) 2023/2225 (creditworthiness-assessment obligation, rules on data use and the right to explanation/human review of scoring) and the Mortgage Credit Directive 2014/17/EU; in insurance, the IDD 2016/97 (distribution) and Solvency II (governance and risk management). This pack does not develop them; they are listed so that you verify how they fit with your sectoral supervisor. Evidence = identification of the applicable sectoral rules and confirmation of how they are addressed (or a supporting legal opinion).",
      article: "CCD 2023/2225 · MCD 2014/17/UE · IDD 2016/97 · Solvency II",
      severity: "media",
      conditional:
        "The detail depends on the product (consumer credit, mortgage, insurance) and on the national transposition.",
    },
  ],
};
