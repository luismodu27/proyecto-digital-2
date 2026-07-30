/**
 * Policy pack — Colorado ADMT Act (SB 26-189).
 *
 * Controles del DEPLOYER que usa tecnología de decisión automatizada (ADMT) para
 * influir materialmente en decisiones consecuentes sobre residentes de Colorado.
 * Pensado para el mid-market; precarga las brechas de un gap assessment.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Contenido investigado contra
 * fuente primaria (memo completo en `docs/research/colorado-sb26-189.md`,
 * snapshot 2026-07-30): ficha del bill en leg.colorado.gov y el texto del *Final
 * Act* (12-may-2026). Requiere revisión de un abogado de Colorado antes de GA.
 *
 * LO MÁS IMPORTANTE DE ESTE PACK, y la razón por la que hubo que investigarlo
 * antes de escribirlo: **casi todo el material publicado sobre "la ley de IA de
 * Colorado" describe una ley DEROGADA.** La SB 24-205 (2024) se aplazó al
 * 30-jun-2026 (SB 25B-004) y la SB 26-189 la **derogó y reexpidió** con efecto
 * 1-ene-2027. En la reescritura DESAPARECIERON:
 *   · el programa de gestión de riesgos,
 *   · la evaluación de impacto (impact assessment),
 *   · la **defensa afirmativa por seguir NIST AI RMF / ISO 42001** — el acto no
 *     menciona NIST ni ISO en ninguna parte, así que "cumplimos NIST" ya NO es un
 *     escudo legal en Colorado (sí sigue siendo una buena forma de trabajar),
 *   · el deber de **notificar al Attorney General** una discriminación algorítmica
 *     descubierta (los 90 días de la ley vieja),
 *   · y la **exención de pequeña empresa** (<50 empleados): ya no hay ningún umbral
 *     por tamaño, ingresos ni número de consumidores.
 * Incluir cualquiera de esos seis como control generaría trabajo inútil al cliente
 * y se caería en la primera revisión de un abogado. Por eso NO están aquí.
 *
 * TRAMPAS del vertical (por eso el pack existe):
 *  · **"Hay un humano al final, así que no aplica."** Error importado de
 *    California. En Colorado *materially influence* se satisface con que la salida
 *    sea un factor non-de minimis que afecte al resultado, **incluido puntuar,
 *    rankear, clasificar o recomendar**: el cribado que descarta el 80 % de los CV
 *    antes de que un reclutador mire influye materialmente. Y la *meaningful human
 *    review* es el **remedio que se ofrece al consumidor**, no una excepción que
 *    saque del alcance (justo al revés que el *meaningful human involvement* del
 *    reglamento ADMT de California — no son la misma pieza).
 *  · **Las exenciones sectoriales no cubren empleo.** Ni la de HIPAA ni la de
 *    seguros: un hospital o una aseguradora siguen dentro por su ATS.
 *  · **El proveedor puede no deberte nada.** El deber de documentación es del
 *    *developer* "doing business in Colorado"; si el tuyo no tiene nexo allí, o
 *    simplemente no entrega, tú sigues obligado a poder nombrar sistema, versión,
 *    desarrollador y fuentes de datos. La palanca es el contrato, no la ley.
 *  · **El reloj de retención va por DECISIÓN**, no por año natural.
 *
 * Ningún control lleva `prohibited: true`: esta ley no define prácticas prohibidas
 * (a diferencia del Art. 5 del EU AI Act).
 *
 * DEUDA CONOCIDA Y DECLARADA: el texto oficial solo existe en PDF y la
 * investigación se hizo por extracción de texto, con alta confianza en el contenido
 * y **media en la numeración fina de subsecciones**. Donde hubo discrepancia entre
 * extracciones (la vía FERPA y la cláusula de acción privada) se cita **la sección
 * sin subsección**, que es lo que sí está confirmado. Antes de GA hay que leer el
 * PDF enrolado con los ojos y afinar las citas.
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";
import type { PolicyPack } from "./types";

export const US_CO_ADMT_PACK: PolicyPack = {
  id: "us-co-admt",
  name: "Decisiones automatizadas — Colorado (SB 26-189)",
  tag: "EE. UU. · Colorado · ADMT",
  summary:
    "Obligaciones del deployer que usa tecnología de decisión automatizada (ADMT) para influir materialmente en decisiones consecuentes sobre residentes de Colorado: empleo, educación, vivienda, servicios financieros, seguros, salud y servicios públicos esenciales. Aplícalo a un sistema para precargar sus brechas.",
  note:
    "Exigible desde el 1-ene-2027, y solo para decisiones tomadas en o después de esa fecha: hoy nada de este pack es exigible todavía, y por eso conviene prepararlo ahora. OJO, es lo que más confusión genera: la SB 26-189 DEROGÓ y reescribió la ley de 2024 (SB 24-205), y con ella desaparecieron el programa de gestión de riesgos, la evaluación de impacto, la notificación al fiscal general y la defensa afirmativa por seguir NIST AI RMF o ISO 42001 — casi todo el material que circula describe esa ley derogada. Tampoco hay ya exención por tamaño de empresa. Lo que queda son deberes de aviso, explicación, corrección, revisión humana y registro. Dos piezas centrales (qué significa \"influir materialmente\" y qué debe decir la carta tras un resultado adverso) las fija un reglamento del Attorney General que debe adoptarse antes del 1-ene-2027: verifica su publicación antes de dar por cerradas tus plantillas y tu alcance. Buena noticia para quien ya trabaja con NYC LL144, California o el EU AI Act: la mayor parte de la evidencia (avisos versionados, actas de revisión humana, retención, documentación del proveedor) se reutiliza. Snapshot regulatorio: julio 2026. Orientativo, no asesoría legal — valida con un abogado de Colorado antes de GA.",
  controls: [
    {
      id: "co-alcance-covered",
      title:
        "Determina qué sistemas son \"covered ADMT\" para una decisión consecuente (orientativo)",
      description:
        "Por cada sistema del inventario, decide y documenta por escrito tres cosas: (1) si procesa datos personales y genera salidas —predicciones, recomendaciones, clasificaciones, rankings, puntuaciones— usadas para tomar, guiar o asistir una decisión; (2) si esa decisión cae en un dominio cubierto: empleo, matrícula u oportunidad educativa, arrendamiento o compra de vivienda en Colorado, servicio financiero o de préstamo, seguros, servicios de salud, o servicios gubernamentales esenciales y prestaciones públicas; (3) si la salida influye MATERIALMENTE, es decir, si es un factor non-de minimis que afecta al resultado. Revisa también las exclusiones del propio texto (antivirus, calculadoras, bases de datos, filtros de spam, correctores, hojas de cálculo sin aprendizaje automático, decisiones rutinarias o de bajo impacto, publicidad y marketing, y el uso del sistema solo para resumir u organizar información para revisión humana SIN producir puntuación, ranking, recomendación, clasificación ni inferencia) y anota cuál invocas y por qué. La clasificación es orientativa y se revisa cuando el Attorney General publique su regla sobre \"influir materialmente\". Evidencia = ficha de alcance por sistema con fecha, responsable, decisión, exclusión invocada y versión evaluada.",
      article: "C.R.S. §§6-1-1701(2), (3), (5), (6), (13)",
      severity: "alta",
    },
    {
      id: "co-nexo-colorado",
      title: "Delimita el nexo con Colorado y quién cuenta como \"consumer\"",
      description:
        "Documenta si tu organización hace negocios en Colorado y qué poblaciones evalúa con el sistema: empleados, candidatos, clientes, pacientes, estudiantes o solicitantes de vivienda. TRAMPA frecuente: la definición de consumidor incluye expresamente a los empleados y a los candidatos a empleo residentes en Colorado, así que un candidato que vive en Colorado cuenta aunque el puesto sea remoto o esté radicado en otro estado. No hay ningún umbral de tamaño que te deje fuera: la ley se dirige a cualquiera que haga negocios en Colorado y despliegue un covered ADMT. Evidencia = nota de alcance territorial con la lista de procesos y poblaciones afectadas, fecha y responsable.",
      article: "C.R.S. §§6-1-1701(4), (7)",
      severity: "media",
    },
    {
      id: "co-aviso-previo",
      title: "Avisa al consumidor ANTES de usar el sistema en su decisión",
      description:
        "Antes de que el sistema se use para influir materialmente en una decisión consecuente, entrega al consumidor un aviso claro y visible de que un covered ADMT se usó o se usará en una decisión que le afecta, junto con instrucciones para obtener información adicional. Conserva la plantilla, su número de versión, la fecha de publicación o entrega y el punto exacto del proceso donde se muestra (por ejemplo, el formulario de solicitud del ATS o el portal del empleado). Si ya operas en Nueva York, ojo a la diferencia: la LL144 exige diez días hábiles de antelación y Colorado dice \"antes\" sin plazo numérico — gana el requisito más estricto de los que te apliquen. Evidencia = plantilla versionada, captura del punto de entrega y registro de fecha y responsable.",
      article: "C.R.S. §6-1-1704(1)",
      severity: "alta",
    },
    {
      id: "co-aviso-punto-interaccion",
      title: "Decide y documenta por qué vía entregas ese aviso",
      description:
        "La ley admite satisfacer el aviso previo mediante un aviso público destacado y razonablemente accesible en los puntos de interacción con el consumidor (típicamente la página de empleo, el portal de candidatos o la web del servicio). Esto NO es un deber separado: es una VÍA de cumplir el aviso previo, y conviene tenerlo claro porque parte del material que circula lo presenta como una obligación autónoma. Decide qué vía usas —aviso individual, aviso público o ambos—, documenta el criterio y mantén el enlace vivo con fecha de última revisión. Evidencia = URL, fecha de publicación, historial de cambios y responsable.",
      article: "C.R.S. §6-1-1704(2)",
      severity: "media",
    },
    {
      id: "co-explicacion-30-dias",
      title:
        "Monta el flujo de explicación en 30 días tras un resultado adverso",
      description:
        "Cuando el sistema influye materialmente en un resultado adverso —denegación, terminación, revocación, reducción o restricción material del acceso, o términos, precio o compensación materialmente menos favorables— entrega al consumidor en un plazo de 30 días: (a) una descripción en lenguaje claro de la decisión y del papel que jugó el sistema; (b) instrucciones para solicitar el nombre, la versión y el desarrollador del sistema y los tipos, categorías y fuentes de los datos personales usados; y (c) una explicación de sus derechos y de cómo ejercerlos. Esto es un proceso con plazo, no un documento: necesita dueño, cola de casos y registro por caso. Es además la pieza genuinamente nueva frente a lo que ya haces para la UE — el derecho a explicación del Art. 86 del EU AI Act no lleva reloj. Evidencia = plantilla de carta o correo, registro por decisión adversa (fecha del resultado, fecha de envío, canal, responsable) y cola de casos con su plazo.",
      article: "C.R.S. §6-1-1704(3)",
      severity: "alta",
      conditional:
        "El contenido y el formato exactos, y el disparador preciso del plazo de 30 días, dependen del reglamento del Attorney General (obligado antes del 1-ene-2027): verifica su publicación antes de fijar la plantilla.",
    },
    {
      id: "co-correccion-datos",
      title: "Da acceso a los datos personales y corrige los incorrectos",
      description:
        "Tras un resultado adverso, ofrece al consumidor instrucciones para solicitar sus datos personales y para corregir los que sean factualmente incorrectos o materialmente inexactos, y ejecuta la corrección cuando proceda. Ojo al límite legal, porque evita prometer lo imposible: NO hay deber de \"corregir\" opiniones, predicciones, puntuaciones ni evaluaciones — solo los datos de hecho. Si rechazas una solicitud por ese motivo, documenta el motivo. Define además si una corrección que cambia un dato de entrada obliga a re-ejecutar la decisión. Evidencia = procedimiento escrito, registro de solicitudes con fecha y resolución (incluido el motivo de los rechazos) y prueba de la corrección aplicada.",
      article: "C.R.S. §§6-1-1705(1)(a)(i), (1)(c)",
      severity: "alta",
    },
    {
      id: "co-revision-humana",
      title: "Ofrece revisión humana significativa, con revisor real y formado",
      description:
        "Ofrece al consumidor la posibilidad de pedir revisión humana significativa y reconsideración de la decisión, en la medida en que sea comercialmente razonable. Para que la revisión sea la que describe la ley y no un sello: designa por nombre o rol a quien revisa, con autoridad efectiva para aprobar, modificar o anular la decisión; fórmalo y registra esa formación; dale acceso a información sobre las salidas del sistema y sus limitaciones materiales; y exige que considere la evidencia que aporte el consumidor. Documenta también cómo interpretas \"comercialmente razonable\" si acotas el alcance: esa interpretación es tu exposición, y es lo primero que se mira. TRAMPA: esta revisión es el REMEDIO que ofreces al consumidor, no una excepción que saque tu sistema del alcance de la ley — al revés que la figura equivalente en el reglamento de California. Evidencia = designación del revisor con fecha, registro de formación, plantilla de acta de revisión (qué se revisó, qué evidencia se consideró, resultado y fecha) y nota de criterio.",
      article: "C.R.S. §§6-1-1705(1)(a)(ii), 6-1-1701(15)",
      severity: "alta",
    },
    {
      id: "co-registros-3-anos",
      title: "Conserva el expediente de cada decisión al menos 3 años",
      description:
        "Conserva los registros razonablemente necesarios para acreditar tu preparación no menos de tres años DESDE LA FECHA DE CADA DECISIÓN consecuente. La trampa está en el reloj: mucha gente lo implementa como \"guardamos tres años de logs\" y después no puede reconstruir UNA decisión concreta. Lo que se pide es el expediente por decisión: qué aviso se mostró y en qué versión, qué salida produjo el sistema y con qué versión o configuración, quién decidió, qué explicación se envió, y qué solicitudes de corrección o de revisión hubo y cómo se resolvieron. Choca de frente con las políticas de \"borra los datos de candidatos cuanto antes\": hay que conciliarlo por escrito. Si además operas en California, allí el plazo laboral es de cuatro años — gana el más largo. Evidencia = política de retención con el reloj por decisión y el expediente por decisión.",
      article: "C.R.S. §6-1-1703",
      severity: "media",
    },
    {
      id: "co-evidencia-proveedor",
      title: "Exige y conserva el paquete documental del proveedor",
      description:
        "El deber de documentar es del desarrollador del sistema, no tuyo; tu control es contractual y probatorio. Exige por escrito y conserva: (a) la declaración de usos previstos y de usos dañinos o inapropiados conocidos; (b) las categorías de datos usados para entrenar; (c) las limitaciones y riesgos conocidos; (d) las instrucciones de uso, monitorización y revisión humana significativa; y (e) la información que necesitas para atender tus propios deberes — nombre, versión, desarrollador y tipos, categorías y fuentes de datos personales, que es exactamente lo que tendrás que entregar tras un resultado adverso. Registra qué pediste, qué recibiste, qué falta y qué respondió el proveedor. HONESTIDAD SOBRE ESTE CONTROL: la ley no obliga al deployer a obtener ni revisar esa documentación; es preparación de evidencia. Pero sin ella no puedes atender la explicación al consumidor, y en un litigio por discriminación la culpa se reparte según la culpa relativa de cada parte, así que el registro de qué exigiste es tu defensa. Evidencia = cláusula contractual o carta de requerimiento fechada, paquete recibido y registro de lo que el proveedor no entregó.",
      article: "C.R.S. §6-1-1702(1)",
      severity: "alta",
    },
    {
      id: "co-cambios-version",
      title: "Registra las actualizaciones materiales del sistema",
      description:
        "El desarrollador debe avisar de las actualizaciones materiales y de las modificaciones intencionadas y sustanciales del sistema en un plazo razonable (valen las notas de versión públicas si hay aviso directo). Monta el lado receptor, que es el que suele faltar: suscríbete a esas notas, registra cada cambio con su fecha, y re-evalúa el alcance, el aviso y la explicación cuando el cambio pueda alterar el papel del sistema en la decisión. Un sistema que cambia de versión sin que nadie lo anote convierte todo el expediente en no reconstruible. Evidencia = bitácora de versiones con fecha de aviso y decisión de re-evaluación.",
      article: "C.R.S. §§6-1-1702(2), 6-1-1701(12), (14)",
      severity: "media",
    },
    {
      id: "co-accesibilidad-avisos",
      title: "Haz los avisos accesibles y comprensibles",
      description:
        "Entrega los avisos y las divulgaciones de forma razonablemente accesible para consumidores con discapacidad y para consumidores con dominio limitado del inglés. Documenta cómo lo resuelves: formato accesible, traducciones disponibles, canal alternativo. Es un control barato de cerrar y caro de explicar si falta, porque afecta justo a quien más depende de entender la decisión. Evidencia = versiones accesibles y traducidas de las plantillas, más la nota de criterio.",
      article: "C.R.S. §6-1-1704(7)",
      severity: "media",
    },
    {
      id: "co-secreto-comercial",
      title: "Si retienes información por secreto comercial, avísalo",
      description:
        "No estás obligado a revelar un secreto comercial ni información protegida por ley estatal o federal. Pero si retienes información por ese motivo, debes NOTIFICÁRSELO al consumidor. Define de antemano qué se retiene y con qué base, y ten preparada una plantilla de aviso de retención: el olvido del aviso convierte una negativa perfectamente legítima en una omisión reprochable. Evidencia = criterio de retención documentado y registro de los casos en que se aplicó, con el aviso enviado.",
      article: "C.R.S. §6-1-1704(5)",
      severity: "baja",
    },
    {
      id: "co-solapes-sectoriales",
      title: "Documenta qué vía sectorial te aplica (y cuál NO te salva)",
      description:
        "Identifica si tu caso entra por una vía sectorial y documenta cuál, porque cambia lo que tienes que entregar. Crédito y préstamo: el acreedor que atiende los requisitos federales de ECOA y FCRA satisface esta parte sin aviso separado ni duplicado. Educación: el sujeto a FERPA puede atender los deberes a través de sus procedimientos existentes de inspección, revisión y enmienda del expediente del estudiante. Seguros: la práctica aseguradora se considera satisfecha por su propio régimen. Salud: las obligaciones no aplican a una entidad cubierta por HIPAA, y hay un deber de divulgación específico para la elegibilidad de asistencia financiera o atención con descuento. Dispositivos médicos regulados por la FDA: fuera. LA TRAMPA, y es la que más caro sale: NI la exención de HIPAA NI la de seguros cubren las decisiones de EMPLEO. Un hospital o una aseguradora siguen dentro por su ATS. Evidencia = nota de mapeo sectorial por sistema (qué vía, por qué, quién lo decidió, fecha).",
      article: "C.R.S. §§6-1-1708, 6-1-1704, 6-1-1705",
      severity: "media",
      conditional:
        "Solo si operas en seguros, salud, crédito o préstamo, o educación.",
    },
    {
      id: "co-vigilancia-reglamento-ag",
      title: "Vigila el reglamento del fiscal general y ten ruta de respuesta",
      description:
        "Asigna un responsable de seguir el desarrollo reglamentario del Attorney General —está obligado a adoptar reglas antes del 1-ene-2027 sobre qué significa \"influir materialmente\" y sobre el contenido de la divulgación posterior a un resultado adverso— y de revisar tu alcance, tus avisos y tus plantillas cuando se publiquen. Esas dos reglas deciden quién queda cubierto y qué hay que escribir en la carta, así que no son un detalle. Registra además en tu procedimiento el periodo de subsanación de 60 días tras una notificación de infracción, para que exista una ruta interna con dueño y plazo (ese periodo se deroga el 1-ene-2030, o sea que la red de seguridad tiene fecha de caducidad). Evidencia = entrada en el registro de vigilancia regulatoria con fuente, fecha de revisión y responsable, más el procedimiento de respuesta.",
      article: "C.R.S. §§6-1-1704(4), 6-1-1705(3), 6-1-1706",
      severity: "media",
    },
    {
      id: "co-trazabilidad-antidiscriminacion",
      title:
        "Deja rastro de tu configuración (buena práctica, no deber de esta ley)",
      description:
        "Esta ley NO exige programa de gestión de riesgos, evaluación de impacto, testing de sesgo ni auditoría independiente, y este control no pretende reintroducirlos por la puerta de atrás. Existe por otra razón: la responsabilidad por discriminación ilegal bajo OTRAS leyes sigue viva, y ahí la culpa se reparte según la culpa relativa de cada parte, quedando la del desarrollador limitada a los usos previstos, documentados, configurados o contratados por él. Traducido: todo lo que decidió tu organización —umbrales, configuración, desviaciones respecto de las instrucciones del proveedor, resultado de la revisión humana— es lo que se te va a imputar a ti. Documentarlo es preparación de evidencia, no cumplimiento de esta parte. Evidencia = registro de configuración y umbrales con fecha y responsable, y nota de las desviaciones respecto de las instrucciones del proveedor.",
      article: "C.R.S. §6-1-1707",
      severity: "baja",
    },
  ],
};

export const US_CO_ADMT_PACK_EN: PolicyPack = {
  id: "us-co-admt",
  name: "Automated decisions — Colorado (SB 26-189)",
  tag: "U.S. · Colorado · ADMT",
  summary:
    "Obligations of the deployer that uses automated decision-making technology (ADMT) to materially influence consequential decisions about Colorado residents: employment, education, housing, financial services, insurance, health care and essential government services. Apply it to a system to preload its gaps.",
  note:
    "Enforceable from 1 Jan 2027, and only for decisions made on or after that date: nothing in this pack is enforceable yet, which is precisely why it is worth preparing now. Watch out for the biggest source of confusion: SB 26-189 REPEALED and rewrote the 2024 law (SB 24-205), and with it went the risk management program, the impact assessment, the notification to the attorney general and the affirmative defense for following the NIST AI RMF or ISO 42001 — most of the material in circulation describes that repealed law. There is also no longer a small-business exemption. What remains are duties of notice, explanation, correction, human review and record-keeping. Two central pieces (what \"materially influence\" means, and what the letter after an adverse outcome must say) are set by an attorney general rule that must be adopted before 1 Jan 2027: verify its publication before treating your templates and your scope as settled. Good news for anyone already working with NYC LL144, California or the EU AI Act: most of the evidence (versioned notices, human-review records, retention, vendor documentation) is reused. Regulatory snapshot: July 2026. Indicative, not legal advice — validate with Colorado counsel before GA.",
  controls: [
    {
      id: "co-alcance-covered",
      title:
        "Determine which systems are a \"covered ADMT\" for a consequential decision (indicative)",
      description:
        "For each system in the inventory, decide and document in writing three things: (1) whether it processes personal data and generates outputs — predictions, recommendations, classifications, rankings, scores — used to make, guide or assist a decision; (2) whether that decision falls in a covered domain: employment, enrollment or educational opportunity, leasing or purchase of housing in Colorado, financial or lending service, insurance, health care services, or essential government services and public benefits; (3) whether the output MATERIALLY influences it, that is, whether it is a non-de minimis factor that affects the outcome. Also review the exclusions in the text itself (anti-virus, calculators, databases, spam filters, spell-checkers, spreadsheets without machine learning, routine or low-impact decisions, advertising and marketing, and using the system only to summarize or organize information for human review WITHOUT producing a score, ranking, recommendation, classification or inference) and note which one you invoke and why. The classification is indicative and gets revisited when the attorney general publishes the rule on \"materially influence\". Evidence = a scope record per system with date, owner, decision, exclusion invoked and version assessed.",
      article: "C.R.S. §§6-1-1701(2), (3), (5), (6), (13)",
      severity: "alta",
    },
    {
      id: "co-nexo-colorado",
      title: "Define your Colorado nexus and who counts as a \"consumer\"",
      description:
        "Document whether your organization does business in Colorado and which populations the system evaluates: employees, applicants, customers, patients, students or housing applicants. COMMON TRAP: the definition of consumer expressly includes employees and job applicants who are Colorado residents, so an applicant living in Colorado counts even if the role is remote or based in another state. No size threshold gets you out: the law reaches anyone doing business in Colorado who deploys a covered ADMT. Evidence = a territorial scope note listing the affected processes and populations, with date and owner.",
      article: "C.R.S. §§6-1-1701(4), (7)",
      severity: "media",
    },
    {
      id: "co-aviso-previo",
      title: "Notify the consumer BEFORE the system is used in their decision",
      description:
        "Before the system is used to materially influence a consequential decision, give the consumer a clear and conspicuous notice that a covered ADMT was or will be used in a decision affecting them, together with instructions for obtaining additional information. Keep the template, its version number, the publication or delivery date and the exact point in the process where it is shown (for example, the ATS application form or the employee portal). If you also operate in New York, mind the difference: LL144 requires ten business days' advance notice and Colorado says \"before\" with no numeric deadline — the strictest requirement that applies to you wins. Evidence = versioned template, capture of the delivery point, and a record of date and owner.",
      article: "C.R.S. §6-1-1704(1)",
      severity: "alta",
    },
    {
      id: "co-aviso-punto-interaccion",
      title: "Decide and document which route you use to deliver that notice",
      description:
        "The law allows the advance notice to be satisfied through a conspicuous, reasonably accessible public notice at the points of consumer interaction (typically the careers page, the applicant portal or the service website). This is NOT a separate duty: it is a ROUTE to satisfying the advance notice, and it is worth being clear about because some of the material in circulation presents it as a standalone obligation. Decide which route you use — individual notice, public notice, or both — document the reasoning, and keep the link live with a last-reviewed date. Evidence = URL, publication date, change history and owner.",
      article: "C.R.S. §6-1-1704(2)",
      severity: "media",
    },
    {
      id: "co-explicacion-30-dias",
      title: "Set up the 30-day explanation flow after an adverse outcome",
      description:
        "When the system materially influences an adverse outcome — denial, termination, revocation, material reduction or restriction of access, or materially less favorable terms, price or compensation — give the consumer, within 30 days: (a) a plain-language description of the decision and of the role the system played; (b) instructions for requesting the name, version and developer of the system and the types, categories and sources of the personal data used; and (c) an explanation of their rights and how to exercise them. This is a process with a deadline, not a document: it needs an owner, a case queue and a per-case record. It is also the piece that is genuinely new compared with what you already do for the EU — the right to explanation in Art. 86 of the EU AI Act carries no clock. Evidence = letter or email template, a per-adverse-decision record (outcome date, send date, channel, owner) and a case queue with its deadline.",
      article: "C.R.S. §6-1-1704(3)",
      severity: "alta",
      conditional:
        "The exact content and format, and the precise trigger for the 30-day clock, depend on the attorney general's rule (required before 1 Jan 2027): verify its publication before finalizing the template.",
    },
    {
      id: "co-correccion-datos",
      title: "Provide access to personal data and correct what is inaccurate",
      description:
        "After an adverse outcome, give the consumer instructions for requesting their personal data and for correcting data that is factually incorrect or materially inaccurate, and carry out the correction where appropriate. Mind the legal limit, because it stops you promising the impossible: there is NO duty to \"correct\" opinions, predictions, scores or assessments — only facts. If you refuse a request on that basis, document the reason. Also define whether a correction that changes an input requires the decision to be re-run. Evidence = written procedure, a log of requests with dates and outcomes (including the reason for refusals) and proof of the correction applied.",
      article: "C.R.S. §§6-1-1705(1)(a)(i), (1)(c)",
      severity: "alta",
    },
    {
      id: "co-revision-humana",
      title: "Offer meaningful human review, by a real and trained reviewer",
      description:
        "Offer the consumer the opportunity to request meaningful human review and reconsideration of the decision, to the extent commercially reasonable. For the review to be the one the law describes rather than a rubber stamp: designate by name or role who reviews, with actual authority to approve, modify or overturn the decision; train them and record that training; give them access to information about the system's outputs and its material limitations; and require that they consider the evidence the consumer provides. Also document how you interpret \"commercially reasonable\" if you narrow the scope: that interpretation is your exposure, and it is the first thing anyone looks at. TRAP: this review is the REMEDY you offer the consumer, not an exception that takes your system out of scope — the opposite of the equivalent figure in the California regulation. Evidence = reviewer designation with date, training record, review-record template (what was reviewed, what evidence was considered, outcome and date) and a reasoning note.",
      article: "C.R.S. §§6-1-1705(1)(a)(ii), 6-1-1701(15)",
      severity: "alta",
    },
    {
      id: "co-registros-3-anos",
      title: "Keep the file for each decision for at least 3 years",
      description:
        "Keep the records reasonably necessary to demonstrate your readiness for no less than three years FROM THE DATE OF EACH consequential decision. The trap is the clock: many organizations implement this as \"we keep three years of logs\" and then cannot reconstruct ONE specific decision. What is asked for is the per-decision file: which notice was shown and in which version, what output the system produced and with which version or configuration, who decided, what explanation was sent, and what correction or review requests came in and how they were resolved. It collides head-on with \"delete applicant data as soon as possible\" policies: reconcile that in writing. If you also operate in California, the employment retention period there is four years — the longer one wins. Evidence = retention policy with the per-decision clock, and the per-decision file.",
      article: "C.R.S. §6-1-1703",
      severity: "media",
    },
    {
      id: "co-evidencia-proveedor",
      title: "Require and keep the vendor's documentation package",
      description:
        "The duty to document falls on the system's developer, not on you; your control is contractual and evidentiary. Require in writing and keep: (a) the statement of intended uses and of known harmful or inappropriate uses; (b) the categories of data used for training; (c) known limitations and risks; (d) instructions for use, monitoring and meaningful human review; and (e) the information you need to meet your own duties — name, version, developer, and types, categories and sources of personal data, which is exactly what you will have to hand over after an adverse outcome. Record what you asked for, what you received, what is missing and what the vendor said. HONESTY ABOUT THIS CONTROL: the law does not require the deployer to obtain or review that documentation; this is evidence preparation. But without it you cannot answer the consumer's explanation request, and in discrimination litigation fault is apportioned by each party's relative fault, so the record of what you demanded is your defense. Evidence = dated contractual clause or request letter, the package received, and a log of what the vendor did not deliver.",
      article: "C.R.S. §6-1-1702(1)",
      severity: "alta",
    },
    {
      id: "co-cambios-version",
      title: "Log material updates to the system",
      description:
        "The developer must give notice of material updates and of intentional and substantial modifications to the system within a reasonable time (public release notes count if there is direct notice). Set up the receiving end, which is what usually goes missing: subscribe to those notes, log each change with its date, and re-assess scope, notice and explanation whenever a change could alter the system's role in the decision. A system whose version changes with nobody writing it down makes the whole file impossible to reconstruct. Evidence = a version log with the notice date and the re-assessment decision.",
      article: "C.R.S. §§6-1-1702(2), 6-1-1701(12), (14)",
      severity: "media",
    },
    {
      id: "co-accesibilidad-avisos",
      title: "Make the notices accessible and understandable",
      description:
        "Deliver notices and disclosures in a way that is reasonably accessible to consumers with disabilities and to consumers with limited English proficiency. Document how you handle it: accessible format, available translations, alternative channel. It is a cheap control to close and an expensive one to explain if missing, because it affects exactly the people who most depend on understanding the decision. Evidence = accessible and translated versions of the templates, plus the reasoning note.",
      article: "C.R.S. §6-1-1704(7)",
      severity: "media",
    },
    {
      id: "co-secreto-comercial",
      title: "If you withhold information as a trade secret, say so",
      description:
        "You are not required to disclose a trade secret or information protected under state or federal law. But if you withhold information on that basis, you must NOTIFY the consumer. Define in advance what gets withheld and on what basis, and have a withholding-notice template ready: forgetting the notice turns a perfectly legitimate refusal into a reproachable omission. Evidence = documented withholding criteria and a log of the cases where it was applied, with the notice sent.",
      article: "C.R.S. §6-1-1704(5)",
      severity: "baja",
    },
    {
      id: "co-solapes-sectoriales",
      title: "Document which sectoral route applies (and which does NOT save you)",
      description:
        "Identify whether your case comes in through a sectoral route and document which one, because it changes what you have to deliver. Credit and lending: a creditor that meets the federal ECOA and FCRA requirements satisfies this part without a separate or duplicative notice. Education: an entity subject to FERPA may meet the duties through its existing procedures for inspecting, reviewing and amending the student record. Insurance: insurance practice is treated as satisfied by its own regime. Health care: the obligations do not apply to a HIPAA covered entity, and there is a specific disclosure duty for financial assistance or discounted care eligibility. FDA-regulated medical devices: out of scope. THE TRAP, and it is the one that costs the most: NEITHER the HIPAA exemption NOR the insurance one covers EMPLOYMENT decisions. A hospital or an insurer is still in scope for its ATS. Evidence = a sectoral mapping note per system (which route, why, who decided, date).",
      article: "C.R.S. §§6-1-1708, 6-1-1704, 6-1-1705",
      severity: "media",
      conditional:
        "Only if you operate in insurance, health care, credit or lending, or education.",
    },
    {
      id: "co-vigilancia-reglamento-ag",
      title: "Watch the attorney general's rulemaking and have a response route",
      description:
        "Assign someone to follow the attorney general's rulemaking — they are required to adopt rules before 1 Jan 2027 on what \"materially influence\" means and on the content of the post-adverse-outcome disclosure — and to revisit your scope, your notices and your templates when they are published. Those two rules decide who is covered and what has to be written in the letter, so they are not a detail. Also record in your procedure the 60-day cure period after a notice of violation, so there is an internal route with an owner and a deadline (that period is repealed on 1 Jan 2030, so the safety net has an expiry date). Evidence = an entry in the regulatory watch log with source, review date and owner, plus the response procedure.",
      article: "C.R.S. §§6-1-1704(4), 6-1-1705(3), 6-1-1706",
      severity: "media",
    },
    {
      id: "co-trazabilidad-antidiscriminacion",
      title:
        "Leave a trail of your configuration (good practice, not a duty of this law)",
      description:
        "This law does NOT require a risk management program, an impact assessment, bias testing or an independent audit, and this control is not trying to reintroduce them through the back door. It exists for a different reason: liability for unlawful discrimination under OTHER laws is still live, and there fault is apportioned by each party's relative fault, with the developer's limited to the uses it intended, documented, configured or contracted for. Translated: everything your organization decided — thresholds, configuration, deviations from the vendor's instructions, the outcome of human review — is what gets attributed to you. Documenting it is evidence preparation, not compliance with this part. Evidence = a configuration and threshold log with date and owner, and a note of deviations from the vendor's instructions.",
      article: "C.R.S. §6-1-1707",
      severity: "baja",
    },
  ],
};
