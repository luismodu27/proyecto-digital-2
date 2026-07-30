/**
 * Policy pack — IA en educación, EE. UU. (FERPA · COPPA · SOPIPA · antidiscriminación).
 *
 * Pareja del pack `educacion` (Anexo III.3 del EU AI Act): mismo comprador —un
 * centro, un distrito, una universidad, o una EdTech que despliega IA para
 * ellos— y otra jurisdicción.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Investigado contra fuente
 * primaria (memo completo en `docs/research/us-educacion.md`, snapshot
 * 2026-07-30): eCFR vía el espejo de Cornell LII, Federal Register, textos de
 * FERPA/COPPA/PPRA, Cal. B&P § 22584 y 740 ILCS 14. Necesita revisión de abogado
 * de EE. UU. antes de GA.
 *
 * LA DIFERENCIA DE FONDO con el pack europeo, y hay que decírsela al cliente que
 * opera en las dos jurisdicciones porque **no es el mismo trabajo**: en la UE se
 * clasifica el sistema por riesgo, se hace una FRIA y hay prácticas prohibidas.
 * Aquí no hay ley federal de IA en educación ni clasificación de riesgo: lo que
 * hay es **privacidad del dato del estudiante + antidiscriminación + contrato**.
 * El artefacto central no es una evaluación, es una **cláusula**.
 *
 * FEDERALISMO — qué aplica a quién (el pack lo lleva en cada `conditional`):
 *  · **FERPA** solo a centros que reciben fondos federales del Departamento de
 *    Educación. Es la base legal de toda cesión de datos a una EdTech.
 *  · **COPPA** al *operador* de un servicio online dirigido a menores de 13. En
 *    la mayoría de los casos el operador es la EdTech, NO el centro: para un
 *    centro estos controles son **diligencia sobre el proveedor**.
 *  · **SOPIPA** obliga al *operador* con nexo en California, no al centro → para
 *    nuestro cliente es también un control **contractual**.
 *  · **Antidiscriminación** (Title VI, Title IX, Section 504, ADA) según la
 *    naturaleza del centro y el uso.
 *
 * DOS HECHOS RECIENTES QUE CAMBIAN EL PACK (y que la mayoría del material del
 * mercado todavía no recoge):
 *  1. **La regla COPPA revisada es plenamente exigible desde el 22-abr-2026.** Su
 *     punto más valioso: la FTC declaró que divulgar datos de un menor **para
 *     entrenar o desarrollar IA NO es "integral" al servicio**, luego exige
 *     consentimiento parental verificable **separado**. CUIDADO al vender esto:
 *     la exigencia se construye sobre la **divulgación a un tercero**, así que
 *     decir *"COPPA prohíbe entrenar IA con datos de menores"* sería **falso** —
 *     el entrenamiento estrictamente interno no lo alcanza esa subsección. El
 *     control lo distingue en vez de fundirlo.
 *  2. **El Departamento de Educación rescindió el impacto dispar de Title VI el
 *     24-jul-2026** (regla final sin trámite de comentarios). Por eso el control
 *     de equidad va en severidad **media** y NO cita la subsección derogada.
 *     Section 504, ADA y Title IX no están tocados, y ahí sigue el grueso de la
 *     exposición real. Al ser una regla final sin comentarios es candidata a
 *     impugnación: si se anula, el control vuelve a alta.
 *
 * ZONAS GRISES QUE SE REDACTAN COMO GRISES, no como resueltas:
 *  · **¿Una inferencia de IA es un `education record`?** El argumento textual es
 *    fuerte, pero no hay pronunciamiento del ED ni del PTAC sobre salidas de IA.
 *  · **¿Puede el colegio consentir por los padres bajo COPPA?** La FTC **propuso**
 *    codificar esa excepción escolar en la revisión y **no la codificó**. La
 *    práctica se apoya en FAQ de personal, no en reglamento.
 *
 * LECCIÓN DE MÉTODO que merece quedar escrita: el control de BIPA iba camino de
 * decir **lo contrario de la ley**. El texto **excluye expresamente las
 * fotografías** de la definición de identificador biométrico, así que grabar la
 * webcam no activa BIPA por sí solo — lo activa **extraer la geometría facial**, y
 * eso cambia entera la pregunta que hay que hacerle al proveedor. Apareció solo al
 * abrir el texto. Ningún texto legal se da por sabido.
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";
import type { PolicyPack } from "./types";

export const US_EDUCACION_PACK: PolicyPack = {
  id: "us-educacion",
  name: "IA en educación — EE. UU. (FERPA · COPPA · SOPIPA)",
  tag: "EE. UU. · Educación",
  summary:
    "Controles para un centro educativo, distrito o universidad de EE. UU. —o una EdTech que despliega IA para ellos— sobre privacidad del dato del estudiante, contratación de proveedores y antidiscriminación. Es la pareja del pack europeo de educación, con un enfoque distinto: aquí no hay clasificación de riesgo, hay contrato y dato. Aplícalo a un sistema para precargar sus brechas.",
  note:
    "Ojo a la aplicabilidad, porque casi ningún cliente está sujeto a todo: FERPA solo si recibes fondos federales del Departamento de Educación; COPPA solo si tu organización es OPERADOR de un servicio dirigido a menores de 13 —que normalmente es la EdTech y no el centro, así que para un centro son controles de diligencia sobre el proveedor—; SOPIPA obliga al operador con nexo en California, no al centro, así que también se ejecuta por contrato. Cada control lleva su condición. Dos hechos recientes que la mayoría del material todavía no recoge: la regla COPPA revisada es plenamente exigible desde el 22-abr-2026, y la FTC declaró que divulgar datos de un menor para entrenar IA no es «integral» al servicio, lo que exige consentimiento parental separado; y el Departamento de Educación rescindió el impacto dispar de Title VI el 24-jul-2026, por lo que el control de equidad baja de severidad — Section 504, ADA y Title IX no están tocados y ahí sigue el grueso de la exposición. Frente al pack europeo: allí se clasifica por riesgo y se hace una evaluación de impacto en derechos fundamentales; aquí el artefacto central es una cláusula contractual. Snapshot regulatorio: julio 2026. Orientativo, no asesoría legal — valida con abogado de EE. UU. antes de GA.",
  controls: [
    /* ------------------------------ Transversal ---------------------------- */
    {
      id: "us-edu-alcance-normativo",
      title: "Determina qué normas te aplican, y a qué sistemas (orientativo)",
      description:
        "Antes de nada, decide y documenta por escrito cuatro cosas: (1) si tu organización recibe fondos federales del Departamento de Educación, que es lo que activa FERPA; (2) si opera un servicio online dirigido a menores de 13, o tiene conocimiento efectivo de que recoge datos de ellos, que es lo que activa COPPA y normalmente señala a la EdTech y no al centro; (3) si hay nexo con California y servicio K-12, que activa SOPIPA sobre el proveedor; (4) si es entidad pública, que activa las obligaciones de accesibilidad web. Junto a esa determinación, mantén el inventario de qué sistemas de IA tocan datos de estudiantes, con qué proveedor, qué datos reciben y por qué contrato — sin ese inventario los demás controles no se pueden ejecutar, solo declarar. Evidencia = ficha de aplicabilidad fechada y firmada, más el inventario de sistemas con su proveedor, categorías de datos y contrato asociado.",
      article: "20 U.S.C. §1232g(a)(3); 16 CFR §312.2",
      severity: "alta",
    },

    /* --------------------------------- FERPA ------------------------------- */
    {
      id: "us-edu-ferpa-school-official",
      title:
        "Designa al proveedor como \"school official\" con control directo demostrable",
      description:
        "Es el corazón del pack. Ceder datos de estudiantes a una EdTech sin consentimiento de los padres o del estudiante elegible solo es lícito si el proveedor encaja en la excepción de school official, y esa excepción tiene TRES condiciones acumulativas que hay que poder demostrar una por una: (1) presta un servicio o función institucional para la que el centro usaría empleados; (2) está bajo control directo del centro respecto del uso y el mantenimiento de los expedientes; (3) queda sujeto al límite de redivulgación. «Control directo» no es una firma en un contrato: se demuestra con cláusulas que digan que el centro determina las finalidades, que el proveedor no puede usar los datos para fines propios, que hay derecho de auditoría o de requerir información, y que el centro puede ordenar borrado y devolución. Además el centro debe usar métodos razonables para que cada school official acceda solo a los expedientes en los que tiene un interés educativo legítimo. Evidencia = cláusula contractual citada por su número, mapa de roles y permisos del sistema, y acta de la revisión que concluyó que el proveedor reúne las tres condiciones.",
      article: "34 CFR §99.31(a)(1)(i)(B) y §99.31(a)(1)(ii)",
      severity: "alta",
      conditional:
        "Solo centros con fondos federales del ED que comparten datos con un proveedor externo sin consentimiento individual.",
    },
    {
      id: "us-edu-ferpa-notificacion-anual",
      title: "Publica los criterios de \"school official\" en tu notificación anual",
      description:
        "La notificación anual de derechos FERPA debe especificar los criterios con los que el centro determina quién es school official y qué constituye un interés educativo legítimo, e indicar que eso incluye a contratistas externos. Sin ese texto publicado, la excepción del control anterior se apoya en el aire. Detalle útil: el deber solo nace si el centro tiene esa política de divulgación — lo que encadena este control con el anterior y explica por qué van juntos. Es documental, y es lo primero que pide el Departamento de Educación ante una queja. Evidencia = notificación anual vigente y fechada, con el párrafo de criterios, y prueba de su difusión.",
      article: "34 CFR §99.7(a)(3)(iii)",
      severity: "media",
      conditional:
        "Solo centros con fondos del ED que tengan política de divulgación bajo la excepción de school official.",
    },
    {
      id: "us-edu-ferpa-no-redivulgacion",
      title: "Prohíbe la redivulgación y lleva el registro de divulgaciones",
      description:
        "El contrato debe prohibir que el proveedor redivulgue información personal de expedientes educativos salvo instrucción del centro, y el centro debe mantener el registro de divulgaciones a terceros con la parte receptora y el interés legítimo invocado. Enumera EXPRESAMENTE los subprocesadores autorizados: una cláusula que diga «podrá compartir con afiliadas y socios» es exactamente lo que rompe este control, y es la redacción por defecto de casi todos los contratos de EdTech. Evidencia = cláusula anti-redivulgación, lista cerrada de subprocesadores, y el registro de divulgaciones del centro.",
      article: "34 CFR §§99.33(a), 99.32",
      severity: "alta",
      conditional: "Solo centros con fondos del ED.",
    },
    {
      id: "us-edu-ferpa-inferencias-como-expediente",
      title:
        "Trata las salidas del sistema sobre un estudiante como expediente educativo",
      description:
        "Cuando un sistema de IA genera una puntuación de riesgo, una predicción, una recomendación de intervención o una marca de sospecha sobre un estudiante concreto, trátala como expediente educativo: guárdala con trazabilidad (qué versión del sistema, con qué datos de entrada, cuándo), inclúyela en el alcance del derecho de inspección, y no la dejes viviendo solo en los servidores del proveedor sin que el centro pueda recuperarla. ZONA GRIS, y hay que presentarla así: el argumento textual es fuerte —un expediente educativo es el que está directamente relacionado con un estudiante y es mantenido por el centro o por una parte que actúa por él, y la norma no distingue dato bruto de dato derivado— pero NO hay pronunciamiento del Departamento de Educación ni de su unidad de privacidad sobre las salidas de IA. Adoptar esta lectura es la posición prudente y es la que te deja preparado si se confirma; adoptar la contraria te deja sin nada si se confirma la primera. Evidencia = política que declare el criterio adoptado, y prueba de que las salidas son recuperables y trazables por el centro.",
      article: "34 CFR §99.3",
      severity: "alta",
      conditional:
        "Solo centros con fondos del ED cuyo sistema produzca salidas individualizadas. Zona gris: sin pronunciamiento del ED.",
    },
    {
      id: "us-edu-ferpa-acceso-y-rectificacion",
      title: "Vía de inspección y de enmienda que alcance a lo que produce la IA",
      description:
        "Los padres y los estudiantes elegibles pueden inspeccionar y revisar el expediente, y pedir su enmienda cuando sea inexacto o engañoso, con derecho a audiencia si el centro se niega y a incorporar una declaración propia. Lo específico aquí es la conexión con el control anterior: si una inferencia algorítmica es errónea —un falso positivo de riesgo de abandono, una marca de sospecha— tiene que existir una vía real para corregirla, no solo para el dato de origen. Comprueba que el procedimiento existente contempla ese supuesto y que el proveedor puede ejecutar la corrección aguas abajo. Evidencia = procedimiento de inspección y enmienda con plazos, y registro de solicitudes con su resolución.",
      article: "34 CFR §§99.10, 99.20, 99.21",
      severity: "alta",
      conditional: "Solo centros con fondos del ED.",
    },
    {
      id: "us-edu-ferpa-directory-optout",
      title: "Propaga el opt-out de directory information a los exports",
      description:
        "Si el centro publica información de directorio, los padres pueden oponerse. La brecha típica no está en la política sino en la ejecución: el opt-out se registra en el sistema académico y después NO se propaga al fichero que se exporta a la herramienta de IA, que acaba recibiendo datos de estudiantes cuyos padres se habían opuesto. Comprueba el camino completo del dato, no solo la casilla. Evidencia = registro de oposiciones y prueba de que la exclusión se aplica en cada export o integración.",
      article: "34 CFR §99.37",
      severity: "media",
      conditional:
        "Solo centros con fondos del ED que usen información de directorio.",
    },
    {
      id: "us-edu-ferpa-desidentificacion",
      title: "Si reutilizas datos \"anonimizados\", cumple el estándar real",
      description:
        "Ceder o reutilizar datos de estudiantes sin consentimiento como si estuvieran desidentificados exige un estándar concreto: que se hayan eliminado toda la información personalmente identificable y que el centro haya determinado razonablemente que un estudiante no es identificable teniendo en cuenta otra información razonablemente disponible. Quitar el nombre y el número de expediente NO basta: en un centro pequeño, la combinación de curso, grupo y una condición basta para identificar a alguien. Documenta la determinación, no la asumas. Evidencia = análisis de desidentificación fechado, con el método y el razonamiento sobre reidentificación.",
      article: "34 CFR §99.31(b)(1)",
      severity: "media",
      conditional:
        "Solo centros con fondos del ED que hagan uso secundario o cesión de datos supuestamente desidentificados.",
    },

    /* --------------------------------- COPPA ------------------------------- */
    {
      id: "us-edu-coppa-rol-operador",
      title: "Determina si tu organización es \"operador\" bajo COPPA",
      description:
        "Decide por escrito, servicio a servicio, si la organización opera un sitio o servicio online dirigido a menores de 13, o si tiene conocimiento efectivo de que recoge datos personales de un menor de 13. En la mayoría de los casos el operador es la EdTech y no el centro: si eres un centro, este bloque se ejecuta como diligencia sobre el proveedor; si eres una EdTech, son deberes propios. Dos novedades de la regla revisada que cambian el análisis: apareció la categoría de audiencia mixta, y la definición de información personal incluye ahora expresamente los IDENTIFICADORES BIOMÉTRICOS —huella, patrón de retina o iris, datos genéticos, huella de voz, plantillas faciales, patrones de marcha—, lo que alcanza de lleno al proctoring, al control de acceso y a los asistentes de voz en el aula. Evidencia = ficha de determinación por servicio con su razón.",
      article: "16 CFR §312.2",
      severity: "alta",
    },
    {
      id: "us-edu-coppa-consentimiento-separado-ia",
      title:
        "Consentimiento parental SEPARADO antes de divulgar datos de menores para entrenar IA",
      description:
        "El control más valioso de este pack. La regla revisada exige dar al padre la opción de consentir la recogida y el uso de los datos del menor SIN consentir su divulgación a terceros, salvo que esa divulgación sea integral al servicio; y cuando hay que dar esa opción, hace falta un consentimiento parental verificable SEPARADO para la divulgación. La FTC se pronunció sobre el punto que importa: divulgar datos personales de un menor para entrenar o desarrollar tecnologías de IA NO es integral al servicio. Operativamente: separa las casillas, registra cada consentimiento con su método de verificación y su fecha, y prohíbe contractualmente al proveedor cualquier uso de los datos para entrenar modelos sin ese consentimiento separado. EL HUECO QUE HAY QUE DECIR EN VOZ ALTA, porque decirlo es lo que nos hace creíbles: la exigencia se construye sobre la divulgación A UN TERCERO. Si el operador usa los datos para entrenar SU PROPIO modelo sin divulgarlos a nadie, la letra de esta subsección no lo alcanza — siguen aplicando el límite de retención, el deber de aviso y la prohibición general de prácticas desleales o engañosas, pero no esta. Afirmar que «COPPA prohíbe entrenar IA con datos de menores» sería inexacto. Evidencia = captura del flujo de consentimiento mostrando DOS decisiones separadas, registro de consentimientos con método y fecha, cláusula contractual de prohibición de entrenamiento, y respuesta ESCRITA del proveedor a la pregunta «¿usa los datos de nuestros estudiantes para entrenar o mejorar sus modelos?».",
      article: "16 CFR §§312.5(a)(2), 312.5(b)",
      severity: "alta",
      conditional:
        "Solo operadores de servicios dirigidos a menores de 13. Para un centro, se convierte en control de diligencia contractual. Exigible desde el 22-abr-2026.",
    },
    {
      id: "us-edu-coppa-autorizacion-escolar",
      title: "No des por hecho que el colegio puede consentir por los padres",
      description:
        "Si el despliegue descansa en que el CENTRO autoriza en lugar del padre, documenta expresamente en qué se apoya, porque no se apoya en la Regla. En la revisión, la FTC PROPUSO codificar una excepción de autorización escolar y finalmente NO la codificó, declarando que evitaba modificar la regla COPPA de forma que pudiera entrar en conflicto con potenciales cambios en el reglamento de FERPA. La práctica sigue apoyándose en preguntas frecuentes del personal de la FTC, que admiten que el centro consienta cuando el uso es exclusivamente educativo. Verificación por ausencia: las excepciones al consentimiento previo de la Regla no incluyen ninguna de autorización escolar. Consecuencia práctica: la autorización escolar es una posición de riesgo asumido apoyada en guía de personal, no una excepción reglamentaria. Limita el uso a fines estrictamente educativos, sin publicidad ni uso comercial, y documenta la autorización del centro por escrito con su alcance. Evidencia = autorización escrita del centro con alcance delimitado, y análisis interno que reconozca que la base es guía de personal y no la Regla.",
      article: "16 CFR §312.5(c)",
      severity: "alta",
      conditional:
        "Solo si el despliegue se apoya en la autorización del centro en lugar del consentimiento parental. Zona gris: la excepción escolar no está codificada.",
    },
    {
      id: "us-edu-coppa-retencion-escrita",
      title: "Política ESCRITA de retención, publicada en el aviso",
      description:
        "La regla revisada exige una política escrita de retención de los datos de menores que indique la finalidad, la necesidad de negocio y el plazo de borrado, y que esa política se publique en el aviso. Prohíbe expresamente la retención indefinida. Es un cambio concreto y comprobable: si tu proveedor no puede enseñarte esa política, o si dice «conservamos los datos mientras la cuenta esté activa» sin más, no cumple el estándar nuevo. Evidencia = política de retención escrita y publicada, con plazos por categoría de dato, y prueba de que el borrado se ejecuta.",
      article: "16 CFR §312.10",
      severity: "alta",
      conditional: "Solo operadores de servicios dirigidos a menores de 13.",
    },
    {
      id: "us-edu-coppa-programa-seguridad",
      title: "Programa ESCRITO de seguridad con sus cinco elementos",
      description:
        "La regla revisada exige un programa escrito de seguridad de la información razonable, con cinco elementos mínimos: un coordinador designado, una evaluación anual de riesgos, salvaguardas proporcionadas a esos riesgos, pruebas y monitorización periódicas, y una revisión anual del propio programa. Añade además la obligación de obtener garantías escritas de los proveedores que reciban los datos. Igual que el anterior, es verificable: pide el documento, no la afirmación. Evidencia = programa escrito con el coordinador nombrado, la última evaluación de riesgos fechada, y las garantías escritas de los proveedores.",
      article: "16 CFR §312.8(b)-(c)",
      severity: "alta",
      conditional: "Solo operadores de servicios dirigidos a menores de 13.",
    },
    {
      id: "us-edu-coppa-aviso",
      title: "Aviso alineado con lo que el sistema hace de verdad",
      description:
        "El aviso directo a los padres y el aviso online deben describir qué datos se recogen, cómo se usan y a quién se divulgan. La brecha aparece con el tiempo, no en el despliegue: se firma un aviso, después el producto añade una función de IA que usa los datos de otra manera, y nadie actualiza el aviso. Ata la revisión del aviso al ciclo de versiones del sistema. Evidencia = aviso vigente con su versión y fecha, y procedimiento que obligue a revisarlo ante un cambio funcional del sistema.",
      article: "16 CFR §§312.4, 312.5(a)(1)",
      severity: "media",
      conditional: "Solo operadores de servicios dirigidos a menores de 13.",
    },

    /* ------------------------ SOPIPA y leyes estatales --------------------- */
    {
      id: "us-edu-sopipa-prohibiciones-contrato",
      title: "Lleva al contrato las tres prohibiciones de SOPIPA",
      description:
        "SOPIPA obliga al OPERADOR del servicio K-12, no al centro, así que para un centro es un control contractual: exige que el contrato recoja las tres prohibiciones y que el proveedor se autocalifique como sujeto a la ley. Las tres son tajantes y no admiten consentimiento que las levante: no publicidad dirigida basada en información obtenida del servicio; no construir un perfil del estudiante salvo para fines educativos autorizados por el centro o los padres; y no vender ni alquilar la información del estudiante. Ojo con el copy: SOPIPA no tiene certificación, así que lo correcto es decir que el proveedor se ha autocalificado como sujeto a ella, no que «está certificado». Evidencia = cláusulas contractuales que reproduzcan las tres prohibiciones, y la declaración escrita del proveedor.",
      article: "Cal. B&P §22584(b)",
      severity: "alta",
      conditional:
        "Solo si el proveedor tiene nexo con California y el servicio es K-12.",
    },
    {
      id: "us-edu-sopipa-mejora-producto",
      title: "Mejora del producto: solo con datos desidentificados o agregados",
      description:
        "SOPIPA permite al operador usar la información para mantener, desarrollar y mejorar el servicio, pero acota con qué: la mejora del producto y el uso para demostraciones o marketing exigen datos desidentificados o agregados. Esta es la línea que más se cruza sin darse cuenta, porque «mejorar el servicio» es exactamente como los proveedores describen entrenar sus modelos. Pregúntalo de forma explícita y por escrito, y ata la respuesta al contrato: «¿usa datos identificables de nuestros estudiantes para mejorar el producto o entrenar modelos?». Evidencia = respuesta escrita del proveedor y cláusula que limite el uso de mejora a datos desidentificados o agregados.",
      article: "Cal. B&P §22584(e)-(f)",
      severity: "media",
      conditional:
        "Solo si el proveedor tiene nexo con California y el servicio es K-12.",
    },
    {
      id: "us-edu-sopipa-seguridad-borrado",
      title: "Seguridad razonable y borrado a requerimiento del centro",
      description:
        "El operador debe aplicar procedimientos y prácticas de seguridad razonables y proporcionados a la naturaleza de los datos, y debe BORRAR la información del estudiante cuando el centro o el distrito lo requiera. Ese derecho de borrado a requerimiento es la palanca práctica más útil que tiene un centro al terminar un contrato o al descartar un piloto: si no está en el contrato, recuperar o eliminar los datos depende de la buena voluntad del proveedor. Evidencia = cláusula de seguridad y de borrado a requerimiento, y constancia de su ejecución cuando se haya usado.",
      article: "Cal. B&P §22584(d)",
      severity: "media",
      conditional:
        "Solo si el proveedor tiene nexo con California y el servicio es K-12.",
    },
    {
      id: "us-edu-estatal-privacidad-estudiantil",
      title: "Comprueba la ley de privacidad estudiantil de TU estado",
      description:
        "Cerca de cuarenta estados tienen su propia ley de privacidad de datos del estudiante, y difieren en lo que más importa operativamente: qué proveedores quedan cubiertos, si exige inventario público de contratos, si obliga a notificar brechas en un plazo propio, y si prohíbe usos concretos. No hay atajo: identifica los estados donde residen tus estudiantes y trata cada uno como una comprobación separada. Si operas en varios, la práctica sensata es adoptar el estándar más estricto como línea base y documentar por qué. Evidencia = lista de estados aplicables con la norma identificada y la comprobación hecha, fechada.",
      article: "Legislación estatal de privacidad estudiantil (varía)",
      severity: "media",
      conditional:
        "Una comprobación por estado en el que residan tus estudiantes.",
    },

    /* ----------------- Antidiscriminación y accesibilidad ------------------ */
    {
      id: "us-edu-equidad-resultados",
      title: "Mide y documenta los resultados desagregados por grupo",
      description:
        "Revisa cómo se reparten los resultados del sistema por grupos de estudiantes —raza, origen nacional, sexo, discapacidad— y documenta qué hiciste con lo que viste. AVISO IMPORTANTE SOBRE EL ESTADO ACTUAL: el Departamento de Educación rescindió el 24 de julio de 2026 la regulación de impacto dispar de Title VI, mediante regla final y sin trámite de comentarios, de modo que hoy la vía de Title VI exige demostrar PROPÓSITO discriminatorio y no basta el efecto. Por eso este control va en severidad media y no en alta. Dos matices que evitan lecturas cómodas: la rescisión no toca Section 504, ADA ni Title IX, donde sigue el grueso de la exposición real; y por ser una regla final sin comentarios es candidata natural a impugnación judicial, así que la situación puede revertirse. Medir sigue siendo lo prudente, y además es lo que te permite responder si cambia. Evidencia = revisión periódica documentada de resultados por grupo, con fecha, método y decisiones adoptadas.",
      article: "42 U.S.C. §2000d; 20 U.S.C. §1681; 29 U.S.C. §794",
      severity: "media",
      conditional:
        "Solo si el sistema produce un resultado individualizado sobre estudiantes. Severidad rebajada el 24-jul-2026 por la rescisión del impacto dispar de Title VI; revisable si esa regla se impugna.",
    },
    {
      id: "us-edu-504-ada-ajustes",
      title: "Ajuste razonable y revisión humana para estudiantes con discapacidad",
      description:
        "Un sistema que evalúa conducta, atención, participación o ritmo de trabajo puede penalizar sistemáticamente a estudiantes con discapacidad o neurodivergentes: un alumno con TDAH que aparta la mirada, uno con tics que se marca como movimiento sospechoso, uno con ansiedad que teclea distinto. Esta es la exposición que NO se ha movido con el cambio de Title VI y donde de verdad está el riesgo. Define de antemano el ajuste razonable disponible, quién lo concede y en cuánto tiempo, y garantiza revisión humana antes de cualquier consecuencia académica o disciplinaria. Evidencia = procedimiento de ajuste con responsable y plazo, y registro de los casos en que se aplicó.",
      article: "29 U.S.C. §794; 34 CFR Part 104",
      severity: "alta",
      conditional:
        "Solo si el sistema evalúa conducta, atención o participación del estudiante.",
    },
    {
      id: "us-edu-genai-no-redacta-504",
      title: "La IA generativa no redacta un plan de apoyo sin revisión",
      description:
        "Usar IA generativa para redactar o proponer planes de adaptación curricular o de apoyo individualizado ahorra tiempo real y es una tentación grande. El límite es que esos planes exigen una determinación INDIVIDUALIZADA sobre las necesidades de ese estudiante concreto, y un borrador generado a partir de patrones no lo es. Permítelo como borrador si quieres, pero exige que quede constancia de la revisión sustantiva por la persona responsable, y que el documento final refleje datos del estudiante y no plantilla. Evidencia = procedimiento que declare el uso permitido de la IA en esos documentos, y constancia de revisión por caso.",
      article: "29 U.S.C. §794; 34 CFR Part 104",
      severity: "alta",
      conditional:
        "Solo si se usa IA generativa en la documentación de educación especial o de apoyo.",
    },
    {
      id: "us-edu-detectores-texto-ia",
      title: "Política sobre detectores de \"texto escrito por IA\"",
      description:
        "Los detectores de texto generado por IA producen falsos positivos, y no de forma uniforme: penalizan más a quien escribe en un inglés no nativo y a quien escribe de forma atípica por su neurodivergencia. Un falso positivo con consecuencia académica es un daño concreto sobre un estudiante concreto, y la exposición no es solo reputacional. Si tu centro los usa, escribe la política: que la salida del detector NUNCA sea prueba suficiente por sí sola, qué evidencia adicional se exige, quién decide, y qué vía de descargo tiene el estudiante antes de cualquier sanción. Evidencia = política escrita con esos cuatro puntos, y registro de casos con su desenlace.",
      article: "42 U.S.C. §2000d; 29 U.S.C. §794",
      severity: "alta",
      conditional:
        "Solo si se usan detectores de IA con consecuencia académica o disciplinaria.",
    },
    {
      id: "us-edu-ada-web-wcag",
      title: "Accesibilidad web de la herramienta (solo entidades públicas)",
      description:
        "Las entidades públicas —distritos y universidades públicas— deben hacer accesibles sus contenidos y aplicaciones web y móviles conforme al estándar WCAG 2.1 nivel AA. Las fechas se prorrogaron un año: 26 de abril de 2027 para las poblaciones de 50.000 habitantes o más, y 26 de abril de 2028 para el resto. Aplícalo a la herramienta de IA como a cualquier otra: si el panel donde un estudiante ve su resultado no es accesible, el problema no es del proveedor sino tuyo frente a tus estudiantes. Pídele al proveedor su informe de conformidad de accesibilidad y comprueba que cubre las pantallas que tus estudiantes usan de verdad. Evidencia = informe de accesibilidad del proveedor y plan de remediación con fechas.",
      article: "28 CFR §§35.200-35.205",
      severity: "alta",
      conditional:
        "Solo entidades públicas. Plazos: 26-abr-2027 (poblaciones ≥50.000) y 26-abr-2028 (resto).",
    },

    /* -------------------------- Proctoring y biometría --------------------- */
    {
      id: "us-edu-biometria-bipa",
      title: "Biometría en Illinois: la foto no basta, la geometría sí",
      description:
        "Si operas en Illinois, la ley de privacidad biométrica exige aviso escrito, finalidad y plazo de conservación comunicados, consentimiento escrito ANTES de la recogida, y una política pública de retención y destrucción. Y tiene acción privada, que es lo que la hace cara. MATIZ QUE CAMBIA LA PREGUNTA ENTERA, y que solo aparece leyendo el texto: las FOTOGRAFÍAS están expresamente EXCLUIDAS de la definición de identificador biométrico. Grabar la webcam durante un examen no activa la ley por sí solo; lo que la activa es EXTRAER LA GEOMETRÍA FACIAL a partir de esa imagen. Por eso la pregunta correcta al proveedor no es «¿grabáis vídeo?» sino «¿extraéis y almacenáis una plantilla de geometría facial, huella de voz o patrón de marcha, y dónde se guarda?». Existe además una exención de instituciones financieras que un tribunal federal llegó a aplicar a una universidad por su participación en programas de ayuda financiera federal: si te afecta, es materia de abogado, no de este pack. Evidencia = respuesta escrita del proveedor sobre qué extrae y almacena, aviso y consentimientos escritos, y política pública de retención.",
      article: "740 ILCS 14/10, 14/15, 14/20",
      severity: "alta",
      conditional:
        "Solo si hay estudiantes en Illinois y el sistema extrae identificadores biométricos.",
    },
    {
      id: "us-edu-proctoring-alternativa-y-apelacion",
      title: "Proctoring: alternativa no biométrica y vía de apelación",
      description:
        "El proctoring remoto automatizado concentra casi todos los riesgos de este pack a la vez: biometría, discapacidad, falsos positivos y consecuencias disciplinarias. Dos cosas lo hacen defendible y las dos son operativas, no documentales: que exista una ALTERNATIVA real y sin penalización para quien no puede o no quiere someterse al análisis biométrico —examen presencial, supervisión humana en directo—, y que exista una vía de apelación con revisión humana antes de cualquier sanción, con acceso del estudiante a qué se marcó exactamente. Ojo con el consentimiento: enterrarlo en los términos del examen no es consentimiento cuando la alternativa es no examinarse. Evidencia = descripción de la alternativa ofrecida y cómo se solicita, y procedimiento de apelación con plazos y responsable.",
      article: "29 U.S.C. §794; ADA",
      severity: "alta",
      conditional: "Solo si se usa proctoring remoto automatizado.",
    },

    /* ------------------------------ PPRA y política ------------------------ */
    {
      id: "us-edu-ppra-encuestas-y-marketing",
      title: "Encuestas sensibles y recogida de datos con fin comercial",
      description:
        "Si la herramienta pregunta a los estudiantes sobre materias protegidas —creencias, comportamientos o actitudes sensibles, salud mental, situación familiar— o recoge información para venderla o usarla con fines comerciales, hay deberes de aviso y de opción para los padres, y derecho a inspeccionar el instrumento. Los asistentes de bienestar emocional y las encuestas de clima escolar con IA caen aquí más a menudo de lo que sus compradores esperan. Evidencia = aviso a las familias con la opción ofrecida, y el instrumento disponible para inspección.",
      article: "20 U.S.C. §1232h; 34 CFR Part 98",
      severity: "media",
      conditional:
        "Solo centros con fondos del ED que usen encuestas sobre materias protegidas o recojan datos con fin comercial.",
    },
    {
      id: "us-edu-politica-uso-ia",
      title: "Política de uso de IA del centro (buena práctica, no ley)",
      description:
        "Publica una política de uso de IA que cubra qué usos están permitidos para el personal y para los estudiantes, qué datos nunca se introducen en una herramienta externa, quién aprueba una herramienta nueva y cómo se comunica a las familias. HONESTIDAD SOBRE ESTE CONTROL: se apoya en guía federal y en recomendaciones del Departamento de Educación, NO en una obligación legal — no hay ley federal de IA en educación. Está aquí porque es lo primero que pide una familia que pregunta y lo primero que enseña un centro cuando alguien reclama, y porque sin ella los demás controles no tienen dónde apoyarse. Evidencia = política publicada con fecha y responsable, y constancia de su comunicación a la comunidad educativa.",
      article: "Guía federal (Departamento de Educación) — no vinculante",
      severity: "baja",
    },
  ],
};

export const US_EDUCACION_PACK_EN: PolicyPack = {
  id: "us-educacion",
  name: "AI in education — U.S. (FERPA · COPPA · SOPIPA)",
  tag: "U.S. · Education",
  summary:
    "Controls for a U.S. school, district or university — or an EdTech deploying AI for them — on student data privacy, vendor contracting and non-discrimination. It is the counterpart to the EU education pack, with a different focus: there is no risk classification here, there is contract and data. Apply it to a system to preload its gaps.",
  note:
    "Mind applicability, because almost no client is subject to everything: FERPA only if you receive federal funds from the Department of Education; COPPA only if your organization is an OPERATOR of a service directed to children under 13 — which is normally the EdTech and not the school, so for a school these are vendor due-diligence controls; SOPIPA binds the operator with a California nexus, not the school, so it is also executed through the contract. Each control carries its condition. Two recent facts most material has not caught up with: the revised COPPA Rule is fully enforceable since 22 Apr 2026, and the FTC stated that disclosing a child's data to train AI is not \"integral\" to the service, which requires separate parental consent; and the Department of Education rescinded Title VI disparate impact on 24 Jul 2026, so the equity control drops in severity — Section 504, ADA and Title IX are untouched and that is where the real exposure remains. Versus the EU pack: there you classify by risk and run a fundamental rights impact assessment; here the central artifact is a contractual clause. Regulatory snapshot: July 2026. Indicative, not legal advice — validate with U.S. counsel before GA.",
  controls: [
    {
      id: "us-edu-alcance-normativo",
      title: "Determine which rules apply to you, and to which systems (indicative)",
      description:
        "First of all, decide and document in writing four things: (1) whether your organization receives federal funds from the Department of Education, which is what triggers FERPA; (2) whether it operates an online service directed to children under 13, or has actual knowledge that it collects their data, which triggers COPPA and normally points at the EdTech rather than the school; (3) whether there is a California nexus and a K-12 service, which triggers SOPIPA on the vendor; (4) whether it is a public entity, which triggers web accessibility obligations. Alongside that determination, maintain the inventory of which AI systems touch student data, with which vendor, what data they receive and under which contract — without that inventory the other controls can only be declared, not executed. Evidence = dated and signed applicability record, plus the system inventory with vendor, data categories and associated contract.",
      article: "20 U.S.C. §1232g(a)(3); 16 CFR §312.2",
      severity: "alta",
    },
    {
      id: "us-edu-ferpa-school-official",
      title: "Designate the vendor as a \"school official\" with demonstrable direct control",
      description:
        "This is the heart of the pack. Sharing student data with an EdTech without consent from parents or the eligible student is only lawful if the vendor fits the school official exception, and that exception has THREE cumulative conditions you must be able to demonstrate one by one: (1) it performs an institutional service or function for which the school would otherwise use employees; (2) it is under the direct control of the school with respect to the use and maintenance of the education records; (3) it is subject to the redisclosure limit. \"Direct control\" is not a signature on a contract: it is demonstrated with clauses saying the school determines the purposes, the vendor cannot use the data for its own ends, there is a right to audit or to request information, and the school can order deletion and return. The school must also use reasonable methods so that each school official accesses only the records in which they have a legitimate educational interest. Evidence = contractual clause cited by number, map of system roles and permissions, and minutes of the review concluding the vendor meets the three conditions.",
      article: "34 CFR §99.31(a)(1)(i)(B) and §99.31(a)(1)(ii)",
      severity: "alta",
      conditional:
        "Only schools with federal ED funds that share data with an external vendor without individual consent.",
    },
    {
      id: "us-edu-ferpa-notificacion-anual",
      title: "Publish the \"school official\" criteria in your annual notification",
      description:
        "The annual FERPA rights notification must specify the criteria the school uses to determine who is a school official and what constitutes a legitimate educational interest, and state that it includes external contractors. Without that published text, the exception in the previous control rests on air. Useful detail: the duty only arises if the school has that disclosure policy — which chains this control to the previous one and explains why they travel together. It is documentary, and it is the first thing the Department of Education asks for in a complaint. Evidence = current, dated annual notification with the criteria paragraph, and proof of its distribution.",
      article: "34 CFR §99.7(a)(3)(iii)",
      severity: "media",
      conditional:
        "Only schools with ED funds that have a disclosure policy under the school official exception.",
    },
    {
      id: "us-edu-ferpa-no-redivulgacion",
      title: "Prohibit redisclosure and keep the record of disclosures",
      description:
        "The contract must prohibit the vendor from redisclosing personally identifiable information from education records except at the school's direction, and the school must maintain the record of disclosures to third parties with the receiving party and the legitimate interest invoked. EXPRESSLY list the authorized subprocessors: a clause saying \"may share with affiliates and partners\" is exactly what breaks this control, and it is the default wording in nearly every EdTech contract. Evidence = anti-redisclosure clause, closed list of subprocessors, and the school's record of disclosures.",
      article: "34 CFR §§99.33(a), 99.32",
      severity: "alta",
      conditional: "Only schools with ED funds.",
    },
    {
      id: "us-edu-ferpa-inferencias-como-expediente",
      title: "Treat the system's outputs about a student as an education record",
      description:
        "When an AI system generates a risk score, a prediction, an intervention recommendation or a suspicion flag about a specific student, treat it as an education record: store it with traceability (which version of the system, with what inputs, when), include it within the scope of the right to inspect, and do not leave it living only on the vendor's servers where the school cannot retrieve it. GREY AREA, and it must be presented as such: the textual argument is strong — an education record is one directly related to a student and maintained by the school or by a party acting for it, and the rule does not distinguish raw from derived data — but there is NO pronouncement from the Department of Education or its privacy unit on AI outputs. Adopting this reading is the prudent position and leaves you ready if it is confirmed; adopting the opposite leaves you with nothing if the first one is. Evidence = policy stating the criterion adopted, and proof that the outputs are retrievable and traceable by the school.",
      article: "34 CFR §99.3",
      severity: "alta",
      conditional:
        "Only schools with ED funds whose system produces individualized outputs. Grey area: no ED pronouncement.",
    },
    {
      id: "us-edu-ferpa-acceso-y-rectificacion",
      title: "An inspection and amendment route that reaches what the AI produces",
      description:
        "Parents and eligible students can inspect and review the record, and request amendment where it is inaccurate or misleading, with a right to a hearing if the school refuses and to insert a statement of their own. What is specific here is the link to the previous control: if an algorithmic inference is wrong — a false positive for dropout risk, a suspicion flag — there must be a real route to correct it, not just the source data. Check that the existing procedure contemplates that case and that the vendor can execute the correction downstream. Evidence = inspection and amendment procedure with deadlines, and a log of requests with their outcome.",
      article: "34 CFR §§99.10, 99.20, 99.21",
      severity: "alta",
      conditional: "Only schools with ED funds.",
    },
    {
      id: "us-edu-ferpa-directory-optout",
      title: "Propagate the directory information opt-out to your exports",
      description:
        "If the school publishes directory information, parents may opt out. The typical gap is not in the policy but in execution: the opt-out is recorded in the student information system and then does NOT propagate to the file exported to the AI tool, which ends up receiving data on students whose parents had objected. Check the full path of the data, not just the checkbox. Evidence = register of objections and proof that the exclusion is applied in every export or integration.",
      article: "34 CFR §99.37",
      severity: "media",
      conditional: "Only schools with ED funds that use directory information.",
    },
    {
      id: "us-edu-ferpa-desidentificacion",
      title: "If you reuse \"anonymized\" data, meet the actual standard",
      description:
        "Sharing or reusing student data without consent as though it were de-identified requires a specific standard: that all personally identifiable information has been removed and that the school has made a reasonable determination that a student is not identifiable taking into account other reasonably available information. Removing the name and the student ID is NOT enough: in a small school, the combination of year, class and one condition is enough to identify someone. Document the determination, do not assume it. Evidence = dated de-identification analysis, with the method and the reasoning on re-identification.",
      article: "34 CFR §99.31(b)(1)",
      severity: "media",
      conditional:
        "Only schools with ED funds making secondary use or sharing of supposedly de-identified data.",
    },
    {
      id: "us-edu-coppa-rol-operador",
      title: "Determine whether your organization is an \"operator\" under COPPA",
      description:
        "Decide in writing, service by service, whether the organization operates a website or online service directed to children under 13, or has actual knowledge that it collects personal information from a child under 13. In most cases the operator is the EdTech and not the school: if you are a school, this block is executed as vendor due diligence; if you are an EdTech, they are your own duties. Two novelties in the revised Rule that change the analysis: the mixed audience category appeared, and the definition of personal information now expressly includes BIOMETRIC IDENTIFIERS — fingerprint, retina or iris pattern, genetic data, voiceprint, face templates, gait patterns — which reaches proctoring, access control and classroom voice assistants head-on. Evidence = a determination record per service with its reasoning.",
      article: "16 CFR §312.2",
      severity: "alta",
    },
    {
      id: "us-edu-coppa-consentimiento-separado-ia",
      title:
        "SEPARATE parental consent before disclosing children's data to train AI",
      description:
        "The most valuable control in this pack. The revised Rule requires giving the parent the option to consent to the collection and use of the child's data WITHOUT consenting to its disclosure to third parties, unless that disclosure is integral to the service; and where that option must be given, a SEPARATE verifiable parental consent is needed for the disclosure. The FTC spoke to the point that matters: disclosing a child's personal information to train or develop AI technologies is NOT integral to the service. Operationally: separate the checkboxes, log each consent with its verification method and date, and contractually prohibit the vendor from any use of the data to train models without that separate consent. THE GAP THAT MUST BE SAID OUT LOUD, because saying it is what makes us credible: the requirement is built on disclosure TO A THIRD PARTY. If the operator uses the data to train ITS OWN model without disclosing it to anyone, the letter of this subsection does not reach it — the retention limit, the notice duty and the general prohibition on unfair or deceptive practices still apply, but not this one. Claiming that \"COPPA prohibits training AI on children's data\" would be inaccurate. Evidence = capture of the consent flow showing TWO separate decisions, consent log with method and date, contractual no-training clause, and the vendor's WRITTEN answer to \"do you use our students' data to train or improve your models?\".",
      article: "16 CFR §§312.5(a)(2), 312.5(b)",
      severity: "alta",
      conditional:
        "Only operators of services directed to children under 13. For a school, it becomes a contractual due-diligence control. Enforceable since 22 Apr 2026.",
    },
    {
      id: "us-edu-coppa-autorizacion-escolar",
      title: "Do not assume the school can consent on the parents' behalf",
      description:
        "If the deployment rests on the SCHOOL authorizing instead of the parent, expressly document what that rests on, because it does not rest on the Rule. In the revision the FTC PROPOSED codifying a school authorization exception and ultimately did NOT codify it, stating that it was avoiding amendments to the COPPA Rule that might conflict with potential changes to the FERPA regulations. The practice still rests on FTC staff frequently asked questions, which accept school consent where the use is exclusively educational. Verification by absence: the Rule's exceptions to prior consent do not include any school authorization. Practical consequence: school authorization is an accepted-risk position supported by staff guidance, not a regulatory exception. Limit the use to strictly educational purposes, with no advertising or commercial use, and document the school's authorization in writing with its scope. Evidence = written school authorization with a defined scope, and an internal analysis acknowledging the basis is staff guidance and not the Rule.",
      article: "16 CFR §312.5(c)",
      severity: "alta",
      conditional:
        "Only if the deployment relies on school authorization instead of parental consent. Grey area: the school exception is not codified.",
    },
    {
      id: "us-edu-coppa-retencion-escrita",
      title: "WRITTEN retention policy, published in the notice",
      description:
        "The revised Rule requires a written retention policy for children's data stating the purpose, the business need and the deletion timeframe, and that the policy be published in the notice. It expressly prohibits indefinite retention. It is a concrete, checkable change: if your vendor cannot show you that policy, or says \"we keep the data while the account is active\" and nothing more, it does not meet the new standard. Evidence = written and published retention policy with timeframes per data category, and proof that deletion is executed.",
      article: "16 CFR §312.10",
      severity: "alta",
      conditional: "Only operators of services directed to children under 13.",
    },
    {
      id: "us-edu-coppa-programa-seguridad",
      title: "WRITTEN security program with its five elements",
      description:
        "The revised Rule requires a reasonable written information security program with five minimum elements: a designated coordinator, an annual risk assessment, safeguards proportionate to those risks, periodic testing and monitoring, and an annual review of the program itself. It also adds the obligation to obtain written assurances from vendors receiving the data. Like the previous one, it is verifiable: ask for the document, not the assertion. Evidence = written program with the coordinator named, the latest dated risk assessment, and the vendors' written assurances.",
      article: "16 CFR §312.8(b)-(c)",
      severity: "alta",
      conditional: "Only operators of services directed to children under 13.",
    },
    {
      id: "us-edu-coppa-aviso",
      title: "A notice aligned with what the system actually does",
      description:
        "The direct notice to parents and the online notice must describe what data is collected, how it is used and to whom it is disclosed. The gap appears over time, not at rollout: a notice is signed, then the product adds an AI feature that uses the data differently, and nobody updates the notice. Tie the notice review to the system's release cycle. Evidence = current notice with its version and date, and a procedure requiring review whenever the system changes functionally.",
      article: "16 CFR §§312.4, 312.5(a)(1)",
      severity: "media",
      conditional: "Only operators of services directed to children under 13.",
    },
    {
      id: "us-edu-sopipa-prohibiciones-contrato",
      title: "Take SOPIPA's three prohibitions into the contract",
      description:
        "SOPIPA binds the OPERATOR of the K-12 service, not the school, so for a school it is a contractual control: require that the contract carry the three prohibitions and that the vendor self-identify as subject to the law. All three are absolute and no consent lifts them: no targeted advertising based on information obtained from the service; no building a student profile except for educational purposes authorized by the school or the parents; and no selling or renting student information. Mind the copy: SOPIPA has no certification, so the correct phrasing is that the vendor has self-identified as subject to it, not that it is \"certified\". Evidence = contractual clauses reproducing the three prohibitions, and the vendor's written statement.",
      article: "Cal. B&P §22584(b)",
      severity: "alta",
      conditional:
        "Only if the vendor has a California nexus and the service is K-12.",
    },
    {
      id: "us-edu-sopipa-mejora-producto",
      title: "Product improvement: de-identified or aggregated data only",
      description:
        "SOPIPA lets the operator use the information to maintain, develop and improve the service, but limits what with: product improvement and use for demonstrations or marketing require de-identified or aggregated data. This is the line most often crossed unknowingly, because \"improving the service\" is exactly how vendors describe training their models. Ask explicitly and in writing, and tie the answer to the contract: \"do you use identifiable data from our students to improve the product or train models?\". Evidence = the vendor's written answer and a clause limiting improvement use to de-identified or aggregated data.",
      article: "Cal. B&P §22584(e)-(f)",
      severity: "media",
      conditional:
        "Only if the vendor has a California nexus and the service is K-12.",
    },
    {
      id: "us-edu-sopipa-seguridad-borrado",
      title: "Reasonable security and deletion at the school's request",
      description:
        "The operator must implement reasonable security procedures and practices proportionate to the nature of the data, and must DELETE student information when the school or district requests it. That deletion-on-request right is the most practically useful lever a school has when a contract ends or a pilot is dropped: if it is not in the contract, recovering or erasing the data depends on the vendor's goodwill. Evidence = security and deletion-on-request clauses, and a record of their execution where used.",
      article: "Cal. B&P §22584(d)",
      severity: "media",
      conditional:
        "Only if the vendor has a California nexus and the service is K-12.",
    },
    {
      id: "us-edu-estatal-privacidad-estudiantil",
      title: "Check YOUR state's student privacy law",
      description:
        "Around forty states have their own student data privacy law, and they differ in what matters most operationally: which vendors are covered, whether a public contract inventory is required, whether breach notification has its own deadline, and whether specific uses are prohibited. There is no shortcut: identify the states where your students reside and treat each as a separate check. If you operate in several, the sensible practice is to adopt the strictest standard as your baseline and document why. Evidence = list of applicable states with the identified statute and the check performed, dated.",
      article: "State student privacy legislation (varies)",
      severity: "media",
      conditional: "One check per state where your students reside.",
    },
    {
      id: "us-edu-equidad-resultados",
      title: "Measure and document outcomes disaggregated by group",
      description:
        "Review how the system's outcomes are distributed across student groups — race, national origin, sex, disability — and document what you did with what you saw. IMPORTANT NOTICE ON THE CURRENT STATE: on 24 July 2026 the Department of Education rescinded the Title VI disparate impact regulation, by final rule and without notice and comment, so today the Title VI route requires showing discriminatory PURPOSE and effect alone is not enough. That is why this control sits at medium and not high severity. Two nuances that block comfortable readings: the rescission does not touch Section 504, ADA or Title IX, where the real exposure remains; and being a final rule without comment it is a natural candidate for judicial challenge, so the situation may reverse. Measuring remains the prudent course, and it is also what lets you respond if it changes. Evidence = documented periodic review of outcomes by group, with date, method and decisions taken.",
      article: "42 U.S.C. §2000d; 20 U.S.C. §1681; 29 U.S.C. §794",
      severity: "media",
      conditional:
        "Only if the system produces an individualized outcome about students. Severity lowered on 24 Jul 2026 by the rescission of Title VI disparate impact; revisable if that rule is challenged.",
    },
    {
      id: "us-edu-504-ada-ajustes",
      title: "Reasonable accommodation and human review for students with disabilities",
      description:
        "A system that assesses behavior, attention, participation or work pace can systematically penalize students with disabilities or neurodivergent students: a student with ADHD who looks away, one with tics flagged as suspicious movement, one with anxiety who types differently. This is the exposure that did NOT move with the Title VI change and where the risk actually sits. Define the available reasonable accommodation in advance, who grants it and how quickly, and guarantee human review before any academic or disciplinary consequence. Evidence = accommodation procedure with owner and deadline, and a log of cases where it was applied.",
      article: "29 U.S.C. §794; 34 CFR Part 104",
      severity: "alta",
      conditional:
        "Only if the system assesses student behavior, attention or participation.",
    },
    {
      id: "us-edu-genai-no-redacta-504",
      title: "Generative AI does not draft a support plan without review",
      description:
        "Using generative AI to draft or propose accommodation or individualized support plans saves real time and is a strong temptation. The limit is that those plans require an INDIVIDUALIZED determination about that specific student's needs, and a draft generated from patterns is not one. Allow it as a draft if you wish, but require a record of substantive review by the responsible person, and that the final document reflect the student's own data rather than a template. Evidence = procedure stating the permitted use of AI in those documents, and a record of review per case.",
      article: "29 U.S.C. §794; 34 CFR Part 104",
      severity: "alta",
      conditional:
        "Only if generative AI is used in special education or support documentation.",
    },
    {
      id: "us-edu-detectores-texto-ia",
      title: "A policy on \"AI-written text\" detectors",
      description:
        "AI text detectors produce false positives, and not uniformly: they penalize non-native English writers and students who write atypically due to neurodivergence more often. A false positive with an academic consequence is concrete harm to a specific student, and the exposure is not merely reputational. If your school uses them, write the policy: that the detector's output is NEVER sufficient proof on its own, what additional evidence is required, who decides, and what route the student has to respond before any sanction. Evidence = written policy covering those four points, and a case log with outcomes.",
      article: "42 U.S.C. §2000d; 29 U.S.C. §794",
      severity: "alta",
      conditional:
        "Only if AI detectors are used with academic or disciplinary consequences.",
    },
    {
      id: "us-edu-ada-web-wcag",
      title: "Web accessibility of the tool (public entities only)",
      description:
        "Public entities — public districts and universities — must make their web and mobile content and applications accessible to the WCAG 2.1 level AA standard. The deadlines were extended by a year: 26 April 2027 for populations of 50,000 or more, and 26 April 2028 for the rest. Apply it to the AI tool as to anything else: if the panel where a student sees their result is not accessible, the problem is not the vendor's but yours towards your students. Ask the vendor for its accessibility conformance report and check it covers the screens your students actually use. Evidence = the vendor's accessibility report and a remediation plan with dates.",
      article: "28 CFR §§35.200-35.205",
      severity: "alta",
      conditional:
        "Public entities only. Deadlines: 26 Apr 2027 (populations ≥50,000) and 26 Apr 2028 (the rest).",
    },
    {
      id: "us-edu-biometria-bipa",
      title: "Biometrics in Illinois: the photo is not enough, the geometry is",
      description:
        "If you operate in Illinois, the biometric privacy law requires written notice, the purpose and retention period communicated, written consent BEFORE collection, and a public retention and destruction policy. And it carries a private right of action, which is what makes it expensive. THE NUANCE THAT CHANGES THE WHOLE QUESTION, and which only surfaces by reading the text: PHOTOGRAPHS are expressly EXCLUDED from the definition of biometric identifier. Recording the webcam during an exam does not trigger the law by itself; what triggers it is EXTRACTING FACIAL GEOMETRY from that image. So the right question to the vendor is not \"do you record video?\" but \"do you extract and store a face geometry template, voiceprint or gait pattern, and where is it kept?\". There is also a financial institution exemption that a federal court went so far as to apply to a university on account of its participation in federal financial aid programs: if that touches you, it is a matter for counsel, not for this pack. Evidence = the vendor's written answer on what it extracts and stores, written notices and consents, and a public retention policy.",
      article: "740 ILCS 14/10, 14/15, 14/20",
      severity: "alta",
      conditional:
        "Only if you have students in Illinois and the system extracts biometric identifiers.",
    },
    {
      id: "us-edu-proctoring-alternativa-y-apelacion",
      title: "Proctoring: a non-biometric alternative and an appeal route",
      description:
        "Automated remote proctoring concentrates nearly every risk in this pack at once: biometrics, disability, false positives and disciplinary consequences. Two things make it defensible and both are operational, not documentary: that a real alternative exists with no penalty for whoever cannot or will not undergo biometric analysis — an in-person exam, live human supervision — and that an appeal route exists with human review before any sanction, with the student able to see what exactly was flagged. Mind consent: burying it in the exam terms is not consent when the alternative is not sitting the exam. Evidence = description of the alternative offered and how it is requested, and an appeal procedure with deadlines and owner.",
      article: "29 U.S.C. §794; ADA",
      severity: "alta",
      conditional: "Only if automated remote proctoring is used.",
    },
    {
      id: "us-edu-ppra-encuestas-y-marketing",
      title: "Sensitive surveys and data collection for commercial purposes",
      description:
        "If the tool asks students about protected matters — beliefs, sensitive behaviors or attitudes, mental health, family circumstances — or collects information to sell or use commercially, there are notice and opt-out duties for parents, and a right to inspect the instrument. AI wellbeing assistants and school climate surveys land here more often than their buyers expect. Evidence = notice to families with the option offered, and the instrument available for inspection.",
      article: "20 U.S.C. §1232h; 34 CFR Part 98",
      severity: "media",
      conditional:
        "Only schools with ED funds using surveys on protected matters or collecting data for commercial purposes.",
    },
    {
      id: "us-edu-politica-uso-ia",
      title: "The school's AI use policy (good practice, not law)",
      description:
        "Publish an AI use policy covering which uses are permitted for staff and for students, what data is never entered into an external tool, who approves a new tool and how it is communicated to families. HONESTY ABOUT THIS CONTROL: it rests on federal guidance and Department of Education recommendations, NOT on a legal obligation — there is no federal AI-in-education law. It is here because it is the first thing a family asks for and the first thing a school shows when someone complains, and because without it the other controls have nothing to rest on. Evidence = published policy with date and owner, and a record of its communication to the school community.",
      article: "Federal guidance (Department of Education) — non-binding",
      severity: "baja",
    },
  ],
};
