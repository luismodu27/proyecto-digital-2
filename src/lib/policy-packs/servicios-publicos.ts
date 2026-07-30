/**
 * Policy pack — Prestaciones y servicios públicos esenciales (EU AI Act).
 *
 * Cubre el **Anexo III.5.a** (evaluar la elegibilidad de personas físicas para
 * prestaciones y servicios de asistencia pública esenciales —incluida la
 * sanidad—, y su concesión, reducción, revocación o reclamación) y, como bloque
 * condicional, el **Anexo III.5.d** (triaje de llamadas de emergencia y despacho
 * de servicios de primera intervención). Pensado para el DEPLOYER: la
 * administración, el ente instrumental o la entidad privada que presta el
 * servicio público y USA la IA.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Investigado contra fuente
 * primaria (memo completo en `docs/research/eu-anexo-iii-5a.md`, snapshot
 * 2026-07-30): Reglamento (UE) 2024/1689 en EUR-Lex, Reglamento (UE) 2026/1744
 * (Digital Omnibus), y las directrices publicadas de la Comisión. Necesita
 * revisión de abogado antes de GA.
 *
 * POR QUÉ EXISTE (problema de producto, no solo de contenido): el clasificador ya
 * mandaba "alto riesgo" a quien elegía el área de servicios y ayudas públicas, y
 * después esa persona llegaba al catálogo de packs y **no encontraba el suyo**.
 * Le decíamos que tenía una obligación grande y no le dábamos el paso siguiente.
 *
 * POR QUÉ NO SE LLAMA "servicios esenciales" (y es deliberado): porque induce el
 * error nº 1 de este punto del Anexo. El **III.5.a es público**: exige cuatro
 * elementos simultáneos —uso por o en nombre de una autoridad pública, prestación
 * pública de asistencia esencial, evaluar elegibilidad o conceder/reducir/revocar,
 * y personas físicas—. Una eléctrica o una teleco privada **no entran por aquí**:
 * el legislador protegió el acceso a esos servicios **a través** del scoring
 * crediticio (III.5.b, Recital 58), que es nuestro pack `credito-seguros`. Leer
 * "electricidad" en el recital y concluir que cualquier decisión de una eléctrica
 * es alto riesgo es exactamente el error que este nombre evita.
 *
 * QUÉ HACE DISTINTO A ESTE VERTICAL (por eso no bastaba con reusar `rrhh`):
 *  · **La FRIA del Art. 27 sí aplica de verdad.** En RRHH privado casi nunca; aquí
 *    el deployer suele ser organismo público o prestar un servicio público.
 *  · **El Art. 86 tiene aquí su caso más fuerte**: una persona a la que se le
 *    deniega una prestación. Verificado: la única exclusión del Art. 86 es el
 *    punto 2 del Anexo III, así que 5.a y 5.d están plenamente dentro.
 *  · **Registro en la base de datos de la UE (Art. 49.3)**: el deployer que es
 *    autoridad pública se registra a sí mismo y registra su uso — cosa distinta
 *    del registro del sistema que hace el proveedor (Art. 49.1). Y el punto 5 va a
 *    la sección **pública** del registro, no a la reservada (esa es solo para los
 *    puntos 1, 6 y 7).
 *  · **Motivación y recurso administrativo**: al deber europeo se le suma el
 *    derecho administrativo nacional, que es más antiguo y más exigente.
 *
 * DOS controles con `prohibited: true`, y no es alarmismo: son las dos prácticas
 * del Art. 5 que una administración puede cometer **sin mala fe**. La frontera del
 * Art. 5.1.c no es de intensidad sino de estructura (verificar requisitos de una
 * prestación concreta vs. puntuar transversalmente al ciudadano), y la del
 * Art. 5.1.d separa el control antifraude documental de la predicción de delito.
 *
 * DEUDA DECLARADA: (1) la fecha de aplicación del **Art. 49** (registro) es
 * incierta — el Art. 113 modificado aplaza las Secciones 1 a 3 del Cap. III y el
 * Art. 49 está en la Sección 5, así que podría aplicar antes que el resto; el
 * control pide verificarlo en vez de afirmar 2027. (2) No se consultaron las
 * Directrices de la Comisión sobre prácticas prohibidas (feb-2025), que son la
 * mejor fuente para afinar la frontera del Art. 5.1.c. (3) Todo se trabajó sobre
 * el texto en inglés.
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";
import type { PolicyPack } from "./types";

export const SERVICIOS_PUBLICOS_PACK: PolicyPack = {
  id: "servicios-publicos",
  name: "Prestaciones y servicios públicos esenciales (EU AI Act)",
  tag: "UE · Sector público",
  summary:
    "Controles para IA usada por una administración —o por quien actúa en su nombre— para evaluar la elegibilidad a prestaciones y servicios de asistencia pública esenciales, incluida la sanidad, y para concederlas, reducirlas o revocarlas (alto riesgo, Anexo III.5.a). Incluye un bloque condicional para el triaje de llamadas de emergencia (III.5.d). Aplícalo a un sistema para precargar sus brechas.",
  note:
    "Ojo al alcance antes de aplicarlo: el Anexo III.5.a es PÚBLICO y exige cuatro elementos a la vez —uso por o en nombre de una autoridad pública, prestación pública de asistencia esencial, evaluar elegibilidad o conceder/reducir/revocar, y personas físicas—. Los servicios esenciales PRIVADOS (luz, agua, telecomunicaciones) no entran por aquí: el Reglamento los protege a través del scoring crediticio, que es el pack de crédito y seguros. Plazos: la alfabetización en IA (Art. 4) y las prohibiciones del Art. 5 ya son exigibles desde el 2-feb-2025 —y las dos prohibiciones de este pack son las que una administración puede cometer sin mala fe—; la transparencia del Art. 50 aplica el 2-ago-2026; las obligaciones de alto riesgo (Arts. 14/26/27/86) el 2-dic-2027, fecha ya firme desde que el Digital Omnibus se publicó en el DOUE (Reglamento (UE) 2026/1744, 24-jul-2026). Tres particularidades frente a los packs de RRHH: la evaluación de impacto en derechos fundamentales (Art. 27) aquí SÍ suele aplicar; el derecho a explicación del Art. 86 tiene su caso más claro (una denegación de prestación); y puede haber deber de registro en la base de datos de la UE. Aplica además el RGPD y, sobre todo, el derecho administrativo nacional de motivación y recurso, que es más antiguo y más exigente que el Reglamento. Este pack te deja lista la evidencia con antelación.",
  controls: [
    /* ---------------- Triaje de prohibiciones (ya exigibles) ---------------- */
    {
      id: "puntuacion-social-prohibicion",
      title:
        "Puntuación social del ciudadano — práctica PROHIBIDA (triaje antes de nada)",
      description:
        "Comprueba, ANTES de usar el sistema, si construye una puntuación de la persona en lugar de verificar los requisitos de la prestación concreta. La diferencia no es de intensidad, es de estructura: evaluar si alguien cumple los requisitos de una ayuda es alto riesgo y legítimo; construir una puntuación transversal del ciudadano que se reutiliza entre departamentos puede ser una práctica PROHIBIDA. Contesta por escrito tres preguntas. (1) ¿El sistema produce una puntuación o perfil de la persona, o una verificación de requisitos? (2) ¿Esa puntuación se usa FUERA del contexto en que se recogieron los datos? Línea roja real: usar impagos de la tasa de basuras, absentismo escolar de los hijos o denuncias de convivencia para decidir una ayuda al alquiler. (3) ¿El trato desfavorable es proporcionado a la conducta y su gravedad? Ejemplo de desproporción: retirar una prestación de subsistencia completa por una irregularidad menor. La evaluación de elegibilidad con base legal y finalidad específica NO es puntuación social. Una práctica prohibida no se prepara para auditoría: se cesa. Evidencia = nota de triaje firmada y fechada que enumere las variables de entrada y su ORIGEN (qué trámite o base de datos las generó), declare si hay puntuación reutilizable entre departamentos, identifique la base legal específica de la evaluación, y —si hay reutilización de datos entre contextos— recoja el criterio jurídico que la ampare.",
      article: "Art. 5.1.c",
      severity: "alta",
      prohibited: true,
      conditional:
        "Prohibición ya vigente desde el 2-feb-2025: no espera a 2027.",
    },
    {
      id: "riesgo-penal-perfilado",
      title:
        "Antifraude que predice delito — práctica PROHIBIDA (triaje)",
      description:
        "La lucha contra el fraude en prestaciones es el uso de IA más extendido de este vertical y el que más cerca pasa de una prohibición. Comprueba si el sistema evalúa o predice el riesgo de que una persona COMETA UN DELITO basándose únicamente en su perfilado o en la evaluación de rasgos y características de personalidad: eso está prohibido. La vía practicable es la otra: un control de coherencia documental basado en HECHOS OBJETIVOS y verificables, directamente vinculados a una actividad concreta, no entra en la prohibición. Documenta de qué lado está el tuyo, con las variables en la mano. Si el sistema puntúa a la persona por lo que es o por su entorno en vez de por lo que consta en su expediente, requiere revisión jurídica y cese, no preparación. Evidencia = descripción de las señales y variables que usa el sistema, y determinación documentada de si son hechos objetivos del expediente o inferencias sobre la persona.",
      article: "Art. 5.1.d",
      severity: "alta",
      prohibited: true,
      conditional:
        "Solo si el sistema predice la probabilidad de que una persona cometa un delito. Prohibición vigente desde el 2-feb-2025.",
    },

    /* ------------------------ Alcance y clasificación ---------------------- */
    {
      id: "clasificacion-alcance",
      title: "Determina si el sistema entra por el Anexo III.5.a (orientativo)",
      description:
        "Verifica y documenta los CUATRO elementos, que deben darse a la vez: (1) el sistema lo usa una autoridad pública o alguien EN SU NOMBRE; (2) se trata de prestaciones y servicios de asistencia pública ESENCIALES, incluidos los servicios de asistencia sanitaria; (3) el sistema sirve para evaluar la elegibilidad, o para conceder, reducir, revocar o reclamar esas prestaciones; (4) las personas evaluadas son personas físicas. Casos típicos que entran: gestión de ayudas y prestaciones sociales, adjudicación de vivienda pública, becas, tarifas sociales, admisión a programas asistenciales, triaje de listas de espera sanitarias. Casos que NO entran por aquí: los servicios esenciales privados (una eléctrica, una teleco), que quedan cubiertos a través del scoring crediticio; y las decisiones de empleo del propio organismo, que van por el punto 4 del Anexo III. Evidencia = ficha de alcance por sistema con los cuatro elementos contestados, fecha, responsable y versión evaluada.",
      article: "Anexo III.5.a",
      severity: "alta",
    },
    {
      id: "no-alto-riesgo-6-3",
      title: "Si invocas la excepción del Art. 6.3, documenta por qué",
      description:
        "Un sistema que opera en un área del Anexo III NO es de alto riesgo si solo realiza una tarea procedimental estrecha, mejora el resultado de una actividad humana previa, detecta patrones de decisión sin sustituir la valoración humana, o hace una tarea preparatoria. TRAMPA que decide el caso: si el sistema efectúa PERFILADO de personas físicas, ninguna de esas excepciones puede aplicarse — siempre es alto riesgo. Y si invocas la excepción, tienes que documentar la evaluación ANTES de poner el sistema en servicio y conservarla. Evidencia = evaluación documentada con la excepción invocada, el razonamiento, la confirmación de que no hay perfilado, y fecha anterior a la puesta en servicio.",
      article: "Art. 6.3",
      severity: "media",
    },

    /* --------------------------- Tronco del deployer ----------------------- */
    {
      id: "alfabetizacion-ia",
      title: "Alfabetización en IA del personal",
      description:
        "Adopta medidas para que quienes operan o supervisan el sistema (personal de tramitación, trabajo social, inspección, admisiones) desarrollen su alfabetización en IA —capacidades, límites y riesgos—, proporcionadas a su rol. Es un deber PROPIO y directo del deployer, exigible desde el 2 de febrero de 2025. OJO, el estándar CAMBIÓ en 2026: el Digital Omnibus (Reglamento (UE) 2026/1744, DOUE 24-jul-2026) reescribió el Art. 4 — antes había que asegurar un «nivel suficiente» y ahora el deber es adoptar medidas que APOYEN el desarrollo de esa alfabetización; el texto dice expresamente que no obliga a alcanzar ningún nivel concreto. En la práctica cambia poco lo que haces y mucho lo que te pueden reprochar: se te mide por las medidas adoptadas, no por el resultado. Evidencia = registro de la formación u onboarding impartido (fecha, asistentes y contenidos).",
      article: "Art. 4",
      severity: "media",
      conditional: "Exigible desde el 2 de febrero de 2025 (ya vigente).",
    },
    {
      id: "instrucciones",
      title: "Uso conforme a las instrucciones del proveedor",
      description:
        "Usa el sistema conforme a las instrucciones de uso que entrega el proveedor, y consérvalas. Suena obvio y es la brecha más común en el sector público, por una razón concreta: entre la licitación, la implantación y las sucesivas configuraciones locales, el uso real acaba alejándose de lo previsto sin que nadie lo anote. Si tu organización lo usa fuera de esas instrucciones, documenta la desviación y su justificación — y ten presente que una desviación sustancial puede convertirte en PROVEEDOR (ver el control de cambio de rol). Evidencia = instrucciones de uso archivadas con su versión, y registro de desviaciones con fecha, motivo y responsable.",
      article: "Art. 26.1",
      severity: "alta",
    },
    {
      id: "supervision-humana",
      title: "Supervisión humana efectiva, no nominal",
      description:
        "Encomienda la supervisión a personas físicas con la competencia, la formación, la autoridad y el APOYO necesarios. El fallo más común de este vertical —y el más difícil de defender ante una auditoría— es la supervisión nominal: alguien que firma lo que dice el sistema porque tiene 300 expedientes al mes y ninguna forma práctica de discrepar. Para que la supervisión sea real hacen falta cuatro cosas comprobables: tiempo asignado por expediente, formación registrada, autoridad explícita para apartarse del resultado, y un canal para escalar dudas sin coste personal. Designar a esa persona es TU obligación; que el sistema permita supervisarlo es diseño del proveedor. Evidencia = designación nominal o por puesto, registro de formación, y la instrucción interna que reconoce la autoridad para apartarse del resultado.",
      article: "Art. 26.2 (y Art. 14)",
      severity: "alta",
    },
    {
      id: "revision-humana-registro",
      title: "Deja rastro de cuándo la persona se apartó del sistema",
      description:
        "Registra, expediente a expediente, si la persona que supervisa siguió o no la propuesta del sistema, y por qué cuando no la siguió. Es la única evidencia que demuestra que la supervisión del control anterior es real y no un sello: una tasa de discrepancia del 0 % durante un año no prueba que el sistema acierte, prueba que nadie está supervisando. Este registro es además lo que permite responder a una reclamación individual sin reconstruir nada a posteriori. Evidencia = campo de resultado de la revisión en el expediente (seguida / apartada / modificada) con motivo y responsable, y un indicador agregado de discrepancia revisado periódicamente.",
      article: "Art. 26.2 (y Art. 26.6)",
      severity: "alta",
    },
    {
      id: "datos-entrada",
      title: "Datos de entrada pertinentes y suficientemente representativos",
      description:
        "En la medida en que controles los datos de entrada, asegúrate de que son pertinentes y suficientemente representativos para la finalidad del sistema. En este vertical el problema real no es el modelo, son los DATOS ADMINISTRATIVOS DESACTUALIZADOS: un padrón que no refleja la convivencia actual, una base de renta con dos años de retraso, un histórico que arrastra errores de digitalización. Esa es la causa material de la mayoría de denegaciones injustas, y es responsabilidad tuya, no del proveedor. Documenta qué fuentes alimentan al sistema, con qué frecuencia se actualizan y qué pasa cuando una está caída o incompleta. Evidencia = inventario de fuentes de datos con su periodicidad de actualización y el procedimiento ante datos ausentes o desfasados.",
      article: "Art. 26.4",
      severity: "alta",
    },
    {
      id: "logs",
      title: "Conserva los registros automáticos (logs) el tiempo que haga falta",
      description:
        "Conserva los logs que el sistema genera automáticamente, mientras estén bajo tu control. El Reglamento fija un suelo de AL MENOS seis meses, y aquí está la trampa: seis meses es un suelo, no el plazo correcto. En prestaciones, el plazo útil es el de impugnación —vía administrativa más contencioso-administrativa—, que en la mayoría de Estados miembros supera con creces el medio año. Borrar a los seis meses exactos deja a tu organización sin poder acreditar cómo se decidió justo cuando alguien recurre. Fija el plazo por el calendario de recursos, no por el mínimo del Reglamento. Evidencia = política de conservación de logs que declare el plazo elegido y el motivo, y prueba de que el plazo se aplica.",
      article: "Art. 26.6",
      severity: "alta",
    },
    {
      id: "monitoreo",
      title: "Vigila el funcionamiento y sabe a quién avisar",
      description:
        "Vigila el funcionamiento del sistema conforme a las instrucciones del proveedor y ten definido a quién avisas y en cuánto tiempo si detectas un riesgo o un incidente grave: al proveedor, al distribuidor y a la autoridad de vigilancia del mercado. En el sector público hay que añadir una pregunta que nadie suele tener contestada: quién puede APAGAR el sistema y con qué procedimiento, si aparece un fallo sistemático a mitad de una campaña de ayudas. Evidencia = procedimiento de monitorización con responsable y periodicidad, ruta de escalado con destinatarios y plazos, y procedimiento de suspensión del uso.",
      article: "Art. 26.5",
      severity: "media",
    },
    {
      id: "info-afectado",
      title: "Informa a las personas de que hay un sistema de IA en su expediente",
      description:
        "Antes o en el momento de la decisión, informa a la persona afectada de que se está usando un sistema de IA de alto riesgo respecto de ella. TRAMPA verificada: el Reglamento dice que se informe cuando el sistema toma decisiones «o ASISTE» en la toma de decisiones, así que el argumento de «nosotros solo lo usamos como apoyo, decide una persona» NO exime de informar. En este vertical, además, el aviso debe convivir con la notificación administrativa formal: decide si va dentro de la resolución o como información previa en el procedimiento, y sé coherente. Evidencia = texto informativo con su versión, el punto del procedimiento donde se entrega, y fecha de implantación.",
      article: "Art. 26.11",
      severity: "alta",
    },
    {
      id: "explicacion",
      title: "Vía de explicación individual a quien recibe una denegación",
      description:
        "Toda persona afectada por una decisión adoptada sobre la base de la salida de un sistema de alto riesgo, cuando esa decisión produce efectos jurídicos o le afecta significativamente, tiene derecho a obtener del deployer explicaciones claras y significativas sobre el papel del sistema en el procedimiento y sobre los principales elementos de la decisión. Aquí está su caso más fuerte de todo el Reglamento: una persona a la que se le deniega una ayuda. Verificado: la única exclusión de este derecho es el punto 2 del Anexo III, o sea que este vertical está plenamente dentro. Monta la vía: quién responde, en qué plazo, con qué plantilla y qué se le entrega. Evidencia = procedimiento con responsable y plazo, plantilla de explicación, y registro de solicitudes atendidas.",
      article: "Art. 86",
      severity: "alta",
      conditional:
        "Exigible con el régimen de alto riesgo (2-dic-2027, firme desde el Omnibus: Reglamento (UE) 2026/1744). El derecho administrativo nacional a la motivación normalmente ya lo exige hoy.",
    },
    {
      id: "fria",
      title:
        "Evaluación de impacto en los derechos fundamentales (FRIA), reutilizando tu DPIA",
      description:
        "Antes de poner en servicio el sistema, realiza y documenta una evaluación de impacto en los derechos fundamentales. En este vertical SÍ suele aplicar, a diferencia de RRHH privado: alcanza a los organismos de Derecho público y a las entidades privadas que prestan servicios públicos. Contenido mínimo: descripción de tus procesos donde se usará, periodo y frecuencia de uso, categorías de personas afectadas, riesgos específicos de perjuicio para ellas, medidas de supervisión humana, y medidas si los riesgos se materializan. NOVEDAD ÚTIL de 2026, que responde a la pregunta más frecuente de quien ya tiene el RGPD hecho: el texto reformado autoriza expresamente REFERENCIAS CRUZADAS a la evaluación de impacto de protección de datos (DPIA) o incorporar partes de ella. No son el mismo documento —la DPIA mira la privacidad, la FRIA los derechos fundamentales en conjunto— pero ya no hay que duplicar lo que se solapa. Determina y documenta ADEMÁS si tu organización encaja en el ámbito: «en nombre de una autoridad pública» (Anexo III) y «entidad privada que presta servicios públicos» (Art. 27) son formulaciones distintas, y un contratista puramente técnico podría discutir la segunda. Evidencia = FRIA fechada y firmada, anterior a la puesta en servicio, con la determinación de ámbito y las referencias a la DPIA.",
      article: "Art. 27 (y Art. 27.4)",
      severity: "alta",
      conditional:
        "Aplica si el deployer es organismo de Derecho público o entidad privada que presta servicios públicos. Exigible con el régimen de alto riesgo (2-dic-2027).",
    },
    {
      id: "dpia",
      title: "Evaluación de impacto de protección de datos (RGPD)",
      description:
        "Un tratamiento a gran escala de datos de personas en situación de vulnerabilidad, con evaluación sistemática y automatizada de aspectos personales, exige evaluación de impacto de protección de datos. Es un deber del RGPD que aquí se activa casi siempre. El Reglamento de IA facilita el trabajo en la otra dirección: la información que el proveedor entrega sobre el sistema sirve para cumplir la obligación de DPIA. Hazla ANTES del tratamiento, y si la FRIA ya existe, enlázalas en lugar de repetirlas. Evidencia = DPIA fechada, con consulta al delegado de protección de datos, anterior al inicio del tratamiento.",
      article: "RGPD Art. 35 (y Art. 26.9)",
      severity: "alta",
    },
    {
      id: "decision-automatizada-art22",
      title: "Decisiones únicamente automatizadas: base jurídica y garantías",
      description:
        "Una persona tiene derecho a no ser objeto de una decisión basada ÚNICAMENTE en tratamiento automatizado que produzca efectos jurídicos o le afecte significativamente. Denegar, reducir o revocar una prestación entra de lleno. Y ojo a un matiz que el Tribunal de Justicia dejó claro: producir una PUNTUACIÓN que después determina de hecho la decisión ya puede constituir esa decisión automatizada, aunque formalmente firme una persona. Determina si tu caso lo es, identifica la base jurídica que lo permite (normalmente una norma con rango suficiente) y garantiza al menos intervención humana, expresión del punto de vista de la persona e impugnación de la decisión. Evidencia = determinación documentada, base jurídica citada, y descripción de las garantías realmente implantadas.",
      article: "RGPD Art. 22",
      severity: "alta",
    },
    {
      id: "datos-especiales",
      title: "Datos de salud, discapacidad u origen: base jurídica reforzada",
      description:
        "Si el sistema trata datos de salud, discapacidad, origen étnico, situación familiar sensible o afiliación, necesitas una excepción específica del RGPD para categorías especiales, y no basta el consentimiento en una relación tan desigual como la administrativa. En este vertical es lo habitual, no la excepción: la elegibilidad a muchas prestaciones se construye precisamente sobre esos datos. Identifica la excepción aplicable y las medidas adicionales adoptadas. Evidencia = registro de actividades de tratamiento con la categoría de datos, la excepción invocada y las garantías adicionales.",
      article: "RGPD Art. 9",
      severity: "alta",
      conditional:
        "Solo si el sistema trata datos de categorías especiales (salud, discapacidad, origen, etc.).",
    },
    {
      id: "no-discriminacion-prestaciones",
      title: "Vigila el reparto de denegaciones entre grupos",
      description:
        "Revisa periódicamente cómo se reparten las denegaciones, las reducciones y las revisiones por grupos de población, y documenta qué hiciste al respecto. No es un deber autónomo del Reglamento con ese nombre, sino la consecuencia práctica de tu deber sobre los datos de entrada más el derecho antidiscriminatorio nacional y europeo: un sistema alimentado con datos administrativos históricos reproduce las asimetrías de esos datos, y en prestaciones el resultado recae sobre quien menos capacidad tiene de recurrir. Si detectas un patrón, la evidencia valiosa no es el número sino qué decidiste hacer con él. Evidencia = revisión periódica documentada del reparto de resultados, con fecha, método y decisiones adoptadas.",
      article: "Art. 26.4 (y derecho antidiscriminatorio)",
      severity: "alta",
    },
    {
      id: "motivacion-recurso",
      title: "Motivación de la resolución y vía de recurso, en tus términos",
      description:
        "Al deber europeo de explicación se le suma el derecho administrativo nacional, que es más antiguo y normalmente más exigente: una resolución que deniega, reduce o revoca una prestación debe estar MOTIVADA, y una motivación que en la práctica se reduce a «el sistema lo determinó» no es motivación. Comprueba que la resolución expresa los hechos y la norma aplicada en términos que la persona pueda rebatir, que la vía de recurso está indicada con su plazo, y que quien resuelve el recurso puede acceder a lo que el sistema produjo. Este control varía por Estado miembro: adáptalo. Evidencia = plantilla de resolución motivada con su versión, e instrucción interna que prohíba motivar por remisión al sistema.",
      article: "Derecho administrativo nacional (y Art. 86)",
      severity: "alta",
      conditional:
        "El detalle varía por Estado miembro: adapta la plantilla a tu ordenamiento.",
    },
    {
      id: "registro-bd-ue",
      title: "Registro del USO en la base de datos de la UE",
      description:
        "Si tu organización es autoridad pública, institución de la UE u órgano actuando en su nombre, además de usar un sistema de alto riesgo tienes que registrarte y registrar TU USO en la base de datos de la UE. TRAMPA frecuente: es una obligación distinta del registro del SISTEMA que hace el proveedor — que el fabricante haya registrado su producto no te cubre a ti. Dato útil: el punto 5 del Anexo III va a la sección pública del registro, no a la sección reservada (esa es solo para los puntos 1, 6 y 7 — biometría, aplicación de la ley y migración). Si el sistema no está registrado por su proveedor, la obligación se convierte en abstenerse de usarlo e informar. Evidencia = constancia del registro con su fecha y el identificador asignado.",
      article: "Art. 49.3 (y Art. 26.8)",
      severity: "alta",
      conditional:
        "Solo si el deployer es autoridad pública o actúa en su nombre. ⚠️ La fecha de aplicación de este artículo no está clara: el aplazamiento del Omnibus alcanza a otras secciones del capítulo, así que el registro podría exigirse ANTES que el resto de obligaciones de alto riesgo. Verifícalo antes de planificar sobre 2027.",
    },
    {
      id: "transparencia-art50",
      title: "Transparencia si hay chatbot o contenido generado",
      description:
        "Si el procedimiento incluye un asistente conversacional o genera contenido con IA, las personas deben saber que interactúan con una máquina —salvo que sea evidente— y el contenido sintético debe ir marcado. Esta obligación NO se aplazó: aplica desde el 2 de agosto de 2026, antes que el régimen de alto riesgo. En una administración es especialmente sensible porque la confianza en el canal es parte del servicio. Evidencia = texto del aviso, punto donde se muestra y fecha de implantación.",
      article: "Art. 50",
      severity: "media",
      conditional:
        "Solo si hay chatbot, asistente conversacional o contenido generado. Exigible desde el 2-ago-2026.",
    },

    /* ------------------ Evidencia exigida al proveedor --------------------- */
    {
      id: "documentacion",
      title: "Exige al proveedor su documentación, y ponlo en el pliego",
      description:
        "Las obligaciones de documentación técnica y de instrucciones de uso son del PROVEEDOR, no tuyas. Tu control es exigirlas, conservarlas y —esto es lo específico del sector público— convertirlas en requisito de la CONTRATACIÓN, que es el único momento en que tienes verdadero poder de negociación. Pide: instrucciones de uso completas, características y limitaciones del sistema, nivel de exactitud declarado, medidas de supervisión humana previstas, y el marcado CE y la declaración de conformidad cuando procedan. Ponlo en el pliego con criterios verificables, no como declaración responsable genérica. Evidencia = paquete documental recibido con su versión, y las cláusulas correspondientes del pliego o del contrato.",
      article: "Art. 13 y Anexo IV (proveedor), vía Art. 26.1",
      severity: "media",
    },
    {
      id: "gobernanza-datos-sesgo",
      title: "Pide la evidencia de gobernanza de datos y sesgo del proveedor",
      description:
        "El proveedor debe haber sometido los conjuntos de datos de entrenamiento, validación y prueba a prácticas de gobernanza adecuadas, incluidas el examen de posibles sesgos que afecten a la salud, la seguridad o los derechos fundamentales. Exige y conserva esa evidencia. No es un trámite: en prestaciones, un sesgo del modelo se traduce en denegaciones concentradas en un grupo, y cuando eso aparece, la primera pregunta será qué preguntaste tú antes de comprar. Si el proveedor no lo entrega, registra la negativa — es un dato de riesgo, y también un argumento en la próxima licitación. Evidencia = documentación de gobernanza de datos y análisis de sesgo recibida, o registro de lo solicitado y no entregado.",
      article: "Art. 10 (proveedor)",
      severity: "alta",
    },
    {
      id: "rol-proveedor-deployer",
      title: "Comprueba que no te has convertido en proveedor sin saberlo",
      description:
        "Un deployer PASA A SER PROVEEDOR, con todas sus obligaciones, en tres supuestos: si pone su nombre o marca en el sistema, si lo modifica sustancialmente, o si cambia su finalidad prevista de forma que pase a ser de alto riesgo. En el sector público esto ocurre más de lo que parece, y casi siempre por el segundo o el tercero: se contrata un motor genérico y se le construye encima una lógica propia, o se reutiliza para una prestación distinta de aquella para la que se compró. Y hay un corolario que casi nadie ve: un ente instrumental que desarrolla la herramienta para otras administraciones es PROVEEDOR, no deployer, y le tocan los Arts. 9-15 completos. Determina y documenta tu rol para cada sistema. Evidencia = determinación de rol por sistema, fechada, con el razonamiento y las modificaciones realizadas.",
      article: "Art. 25",
      severity: "alta",
    },

    /* ------------- Bloque condicional: emergencias (Anexo III.5.d) --------- */
    {
      id: "emergencias-alcance",
      title: "Triaje de llamadas de emergencia: alcance y prioridad",
      description:
        "Si el sistema se usa para evaluar y clasificar llamadas de emergencia o para despachar o priorizar servicios de primera intervención —policía, bomberos, asistencia médica— o triaje de pacientes urgentes, entra por su propia letra del Anexo III y le aplica el mismo tronco de obligaciones. Lo que cambia es el modo de fallo: aquí el daño es físico e inmediato, no una denegación recurrible, y la ventana de supervisión son segundos, no días. Documenta qué decisiones toma el sistema (clasificar, priorizar, sugerir recurso) y cuáles quedan siempre en la persona. Evidencia = descripción del papel del sistema en el protocolo de despacho, con la frontera explícita de lo que nunca decide solo.",
      article: "Anexo III.5.d",
      severity: "alta",
      conditional:
        "Solo si el sistema clasifica llamadas de emergencia o despacha servicios de primera intervención.",
    },
    {
      id: "emergencias-supervision",
      title: "Supervisión y contraste en tiempo real (emergencias)",
      description:
        "En emergencias, la supervisión humana del tronco no se implanta igual: no hay tiempo para revisar un expediente. Lo que sí se puede montar, y es lo que se te va a pedir, son tres cosas: que el operador pueda anular la prioridad propuesta con un solo gesto y sin justificación previa, que las anulaciones queden registradas para revisarlas después, y que exista un procedimiento de degradación —qué se hace si el sistema falla o se cae a mitad de un turno—. Revisa periódicamente los casos en que la clasificación del sistema y la del operador discreparon: es la fuente de mejora más valiosa y la evidencia más convincente de que la supervisión existe. Evidencia = procedimiento de anulación y de degradación, registro de anulaciones, y acta de la revisión periódica de discrepancias.",
      article: "Art. 26.2 (y Art. 26.5)",
      severity: "alta",
      conditional:
        "Solo si el sistema clasifica llamadas de emergencia o despacha servicios de primera intervención.",
    },
  ],
};

export const SERVICIOS_PUBLICOS_PACK_EN: PolicyPack = {
  id: "servicios-publicos",
  name: "Public benefits and essential public services (EU AI Act)",
  tag: "EU · Public sector",
  summary:
    "Controls for AI used by a public administration — or by someone acting on its behalf — to evaluate eligibility for essential public assistance benefits and services, including health care, and to grant, reduce or revoke them (high risk, Annex III.5.a). Includes a conditional block for emergency call triage (III.5.d). Apply it to a system to preload its gaps.",
  note:
    "Mind the scope before applying it: Annex III.5.a is PUBLIC and requires four elements at once — use by or on behalf of a public authority, public provision of essential assistance, evaluating eligibility or granting/reducing/revoking, and natural persons. PRIVATE essential services (electricity, water, telecoms) do not come in here: the Regulation protects them through credit scoring, which is the credit and insurance pack. Deadlines: AI literacy (Art. 4) and the Art. 5 prohibitions are already enforceable since 2 Feb 2025 — and the two prohibitions in this pack are the ones a public administration can breach in good faith; Art. 50 transparency applies on 2 Aug 2026; the high-risk obligations (Arts. 14/26/27/86) on 2 Dec 2027, a date now settled since the Digital Omnibus was published in the Official Journal (Regulation (EU) 2026/1744, 24 Jul 2026). Three particularities versus the HR packs: the fundamental rights impact assessment (Art. 27) DOES usually apply here; the right to explanation in Art. 86 has its clearest case (a benefit denial); and there may be a duty to register in the EU database. The GDPR also applies and, above all, national administrative law on reasoned decisions and appeals, which is older and more demanding than the Regulation. This pack gets your evidence ready ahead of time.",
  controls: [
    {
      id: "puntuacion-social-prohibicion",
      title: "Social scoring of citizens — PROHIBITED practice (triage first)",
      description:
        "Check, BEFORE using the system, whether it builds a score of the person rather than verifying the requirements of the specific benefit. The difference is not one of intensity but of structure: assessing whether someone meets the requirements for a benefit is high risk and legitimate; building a cross-cutting citizen score that is reused across departments may be a PROHIBITED practice. Answer three questions in writing. (1) Does the system produce a score or profile of the person, or a check of requirements? (2) Is that score used OUTSIDE the context in which the data was collected? Real red line: using unpaid waste-collection fees, children's school absenteeism or neighbourhood complaints to decide a housing allowance. (3) Is the detrimental treatment proportionate to the conduct and its gravity? Example of disproportion: withdrawing an entire subsistence benefit over a minor irregularity. Eligibility assessment with a legal basis and a specific purpose is NOT social scoring. A prohibited practice is not prepared for audit: it is stopped. Evidence = a signed, dated triage note listing the system's input variables and their ORIGIN (which procedure or database generated them), stating whether a score reusable across departments exists, identifying the specific legal basis of the assessment, and — if data is reused across contexts — the legal reasoning supporting it.",
      article: "Art. 5.1.c",
      severity: "alta",
      prohibited: true,
      conditional: "Prohibition already in force since 2 Feb 2025: it does not wait for 2027.",
    },
    {
      id: "riesgo-penal-perfilado",
      title: "Anti-fraud that predicts crime — PROHIBITED practice (triage)",
      description:
        "Fighting benefit fraud is the most widespread use of AI in this vertical and the one that comes closest to a prohibition. Check whether the system assesses or predicts the risk of a person COMMITTING A CRIMINAL OFFENCE based solely on profiling or on assessing personality traits and characteristics: that is prohibited. The workable route is the other one: a documentary consistency check based on OBJECTIVE, verifiable FACTS directly linked to a specific activity does not fall under the prohibition. Document which side yours is on, with the variables in hand. If the system scores the person for what they are or for their environment rather than for what is on their file, it requires legal review and cessation, not preparation. Evidence = a description of the signals and variables the system uses, and a documented determination of whether they are objective facts from the file or inferences about the person.",
      article: "Art. 5.1.d",
      severity: "alta",
      prohibited: true,
      conditional:
        "Only if the system predicts the likelihood of a person committing a criminal offence. Prohibition in force since 2 Feb 2025.",
    },
    {
      id: "clasificacion-alcance",
      title: "Determine whether the system comes in under Annex III.5.a (indicative)",
      description:
        "Verify and document the FOUR elements, which must all hold: (1) the system is used by a public authority or by someone ON ITS BEHALF; (2) it concerns ESSENTIAL public assistance benefits and services, including health care services; (3) the system serves to evaluate eligibility, or to grant, reduce, revoke or reclaim those benefits; (4) the people assessed are natural persons. Typical cases that come in: management of social benefits and allowances, allocation of public housing, grants, social tariffs, admission to assistance programmes, triage of health waiting lists. Cases that do NOT come in here: private essential services (an electricity or telecoms company), which are covered through credit scoring; and the body's own employment decisions, which come in under point 4 of Annex III. Evidence = a scope record per system answering the four elements, with date, owner and version assessed.",
      article: "Annex III.5.a",
      severity: "alta",
    },
    {
      id: "no-alto-riesgo-6-3",
      title: "If you invoke the Art. 6.3 exception, document why",
      description:
        "A system operating in an Annex III area is NOT high risk if it only performs a narrow procedural task, improves the result of a previously completed human activity, detects decision patterns without replacing human assessment, or performs a preparatory task. THE TRAP that decides the case: if the system performs PROFILING of natural persons, none of those exceptions can apply — it is always high risk. And if you invoke the exception, you must document the assessment BEFORE putting the system into service and keep it. Evidence = documented assessment with the exception invoked, the reasoning, confirmation that there is no profiling, and a date preceding entry into service.",
      article: "Art. 6.3",
      severity: "media",
    },
    {
      id: "alfabetizacion-ia",
      title: "AI literacy of staff",
      description:
        "Take measures so that those who operate or oversee the system (case handlers, social workers, inspectors, admissions staff) develop their AI literacy — capabilities, limits and risks —, proportionate to their role. This is a DIRECT, OWN duty of the deployer, enforceable since 2 February 2025. NOTE, the standard CHANGED in 2026: the Digital Omnibus (Regulation (EU) 2026/1744, OJ 24 Jul 2026) rewrote Art. 4 — it used to require ensuring a \"sufficient level\" and the duty is now to take measures that SUPPORT the development of that literacy; the text expressly says it does not require achieving any specific level. In practice it changes little about what you do and a lot about what can be held against you: you are measured by the measures taken, not by the outcome. Evidence = record of the training or onboarding delivered (date, attendees and content).",
      article: "Art. 4",
      severity: "media",
      conditional: "Enforceable since 2 February 2025 (already in force).",
    },
    {
      id: "instrucciones",
      title: "Use in accordance with the provider's instructions",
      description:
        "Use the system in accordance with the instructions for use supplied by the provider, and keep them. It sounds obvious and it is the most common gap in the public sector, for a concrete reason: between the tender, the rollout and successive local configurations, actual use drifts away from what was intended without anyone writing it down. If your organization uses it outside those instructions, document the deviation and its justification — and bear in mind that a substantial deviation can turn you into a PROVIDER (see the role-change control). Evidence = instructions for use archived with their version, and a log of deviations with date, reason and owner.",
      article: "Art. 26.1",
      severity: "alta",
    },
    {
      id: "supervision-humana",
      title: "Effective human oversight, not nominal",
      description:
        "Assign oversight to natural persons with the necessary competence, training, authority and SUPPORT. The most common failure in this vertical — and the hardest to defend in an audit — is nominal oversight: someone who signs off whatever the system says because they have 300 files a month and no practical way to disagree. For oversight to be real, four verifiable things are needed: time allocated per file, recorded training, explicit authority to depart from the output, and a channel to escalate doubts without personal cost. Designating that person is YOUR obligation; making the system overseeable is the provider's design duty. Evidence = designation by name or post, training record, and the internal instruction acknowledging the authority to depart from the output.",
      article: "Art. 26.2 (and Art. 14)",
      severity: "alta",
    },
    {
      id: "revision-humana-registro",
      title: "Leave a trail of when the person departed from the system",
      description:
        "Record, file by file, whether the person overseeing followed the system's proposal or not, and why when they did not. It is the only evidence that shows the oversight in the previous control is real and not a rubber stamp: a 0% disagreement rate over a year does not prove the system is right, it proves nobody is overseeing. This record is also what lets you answer an individual complaint without reconstructing anything after the fact. Evidence = a review-outcome field in the file (followed / departed / modified) with reason and owner, plus an aggregate disagreement indicator reviewed periodically.",
      article: "Art. 26.2 (and Art. 26.6)",
      severity: "alta",
    },
    {
      id: "datos-entrada",
      title: "Input data that is relevant and sufficiently representative",
      description:
        "To the extent you control the input data, make sure it is relevant and sufficiently representative for the system's purpose. In this vertical the real problem is not the model, it is OUT-OF-DATE ADMINISTRATIVE DATA: a population register that does not reflect current household composition, an income database two years behind, a history carrying digitization errors. That is the material cause of most unjust denials, and it is your responsibility, not the provider's. Document which sources feed the system, how often they are refreshed, and what happens when one is down or incomplete. Evidence = inventory of data sources with their refresh frequency and the procedure for missing or stale data.",
      article: "Art. 26.4",
      severity: "alta",
    },
    {
      id: "logs",
      title: "Keep the automatically generated logs for as long as needed",
      description:
        "Keep the logs the system generates automatically, insofar as they are under your control. The Regulation sets a floor of AT LEAST six months, and here is the trap: six months is a floor, not the right period. In benefits, the useful period is the appeal window — administrative plus judicial review — which in most Member States comfortably exceeds half a year. Deleting at exactly six months leaves your organization unable to evidence how a decision was made precisely when someone appeals. Set the period by the appeals calendar, not by the Regulation's minimum. Evidence = a log retention policy stating the chosen period and the reason, and proof that it is applied.",
      article: "Art. 26.6",
      severity: "alta",
    },
    {
      id: "monitoreo",
      title: "Monitor operation and know who to alert",
      description:
        "Monitor the system's operation in accordance with the provider's instructions and have it defined who you alert and how quickly if you detect a risk or a serious incident: the provider, the distributor and the market surveillance authority. In the public sector one more question must be answered in advance, and rarely is: who can SWITCH THE SYSTEM OFF and by what procedure, if a systematic fault appears mid-campaign. Evidence = monitoring procedure with owner and frequency, escalation route with recipients and deadlines, and a procedure for suspending use.",
      article: "Art. 26.5",
      severity: "media",
    },
    {
      id: "info-afectado",
      title: "Tell people there is an AI system in their file",
      description:
        "Before or at the time of the decision, inform the affected person that a high-risk AI system is being used in respect of them. VERIFIED TRAP: the Regulation says to inform where the system makes decisions \"or ASSISTS\" in making them, so the argument that \"we only use it as support, a person decides\" does NOT exempt you. In this vertical the notice must also coexist with the formal administrative notification: decide whether it goes inside the decision or as advance information in the procedure, and be consistent. Evidence = the informational text with its version, the point in the procedure where it is delivered, and the rollout date.",
      article: "Art. 26.11",
      severity: "alta",
    },
    {
      id: "explicacion",
      title: "An individual explanation route for whoever receives a denial",
      description:
        "Any person affected by a decision taken on the basis of the output of a high-risk system, where that decision produces legal effects or significantly affects them, has the right to obtain from the deployer clear and meaningful explanations of the system's role in the procedure and of the main elements of the decision. This is its strongest case in the whole Regulation: someone denied a benefit. Verified: the only exclusion from this right is point 2 of Annex III, so this vertical is fully within scope. Set up the route: who answers, within what deadline, with which template and what is handed over. Evidence = procedure with owner and deadline, explanation template, and a log of requests handled.",
      article: "Art. 86",
      severity: "alta",
      conditional:
        "Enforceable under the high-risk regime (2 Dec 2027, settled by the Omnibus: Regulation (EU) 2026/1744). National administrative law on reasoned decisions normally already requires it today.",
    },
    {
      id: "fria",
      title: "Fundamental rights impact assessment (FRIA), reusing your DPIA",
      description:
        "Before putting the system into service, carry out and document a fundamental rights impact assessment. In this vertical it DOES usually apply, unlike private-sector HR: it reaches bodies governed by public law and private entities providing public services. Minimum content: description of your processes where it will be used, period and frequency of use, categories of persons affected, specific risks of harm to them, human oversight measures, and measures if the risks materialize. USEFUL 2026 NOVELTY, which answers the most frequent question from anyone who already has the GDPR done: the reformed text expressly authorizes CROSS-REFERENCES to the data protection impact assessment (DPIA) or incorporating parts of it. They are not the same document — the DPIA looks at privacy, the FRIA at fundamental rights as a whole — but overlapping work no longer has to be duplicated. ALSO determine and document whether your organization falls within scope: \"on behalf of a public authority\" (Annex III) and \"private entity providing public services\" (Art. 27) are different formulations, and a purely technical contractor could dispute the second. Evidence = dated and signed FRIA predating entry into service, with the scope determination and the references to the DPIA.",
      article: "Art. 27 (and Art. 27.4)",
      severity: "alta",
      conditional:
        "Applies if the deployer is a body governed by public law or a private entity providing public services. Enforceable under the high-risk regime (2 Dec 2027).",
    },
    {
      id: "dpia",
      title: "Data protection impact assessment (GDPR)",
      description:
        "Large-scale processing of data about people in vulnerable situations, with systematic and automated evaluation of personal aspects, requires a data protection impact assessment. It is a GDPR duty that is triggered here almost always. The AI Regulation helps in the other direction: the information the provider supplies about the system serves to meet the DPIA obligation. Do it BEFORE the processing, and if the FRIA already exists, link them instead of repeating them. Evidence = dated DPIA, with consultation of the data protection officer, predating the start of processing.",
      article: "GDPR Art. 35 (and Art. 26.9)",
      severity: "alta",
    },
    {
      id: "decision-automatizada-art22",
      title: "Solely automated decisions: legal basis and safeguards",
      description:
        "A person has the right not to be subject to a decision based SOLELY on automated processing which produces legal effects or similarly significantly affects them. Denying, reducing or revoking a benefit falls squarely within. And mind a nuance the Court of Justice made clear: producing a SCORE that then effectively determines the decision can already constitute that automated decision, even if a person formally signs it. Determine whether your case is one, identify the legal basis that permits it (normally a norm of sufficient rank) and guarantee at least human intervention, the person's right to express their point of view, and to contest the decision. Evidence = documented determination, legal basis cited, and a description of the safeguards actually implemented.",
      article: "GDPR Art. 22",
      severity: "alta",
    },
    {
      id: "datos-especiales",
      title: "Health, disability or origin data: reinforced legal basis",
      description:
        "If the system processes data on health, disability, ethnic origin, sensitive family circumstances or membership, you need a specific GDPR exception for special categories, and consent is not enough in a relationship as unequal as the administrative one. In this vertical this is the norm, not the exception: eligibility for many benefits is built precisely on that data. Identify the applicable exception and the additional measures adopted. Evidence = record of processing activities with the data category, the exception invoked and the additional safeguards.",
      article: "GDPR Art. 9",
      severity: "alta",
      conditional:
        "Only if the system processes special category data (health, disability, origin, etc.).",
    },
    {
      id: "no-discriminacion-prestaciones",
      title: "Watch how denials are distributed across groups",
      description:
        "Periodically review how denials, reductions and reviews are distributed across population groups, and document what you did about it. It is not a standalone duty of the Regulation under that name, but the practical consequence of your duty over input data plus national and European anti-discrimination law: a system fed with historical administrative data reproduces the asymmetries in that data, and in benefits the result falls on whoever has the least capacity to appeal. If you detect a pattern, the valuable evidence is not the number but what you decided to do about it. Evidence = documented periodic review of outcome distribution, with date, method and decisions taken.",
      article: "Art. 26.4 (and anti-discrimination law)",
      severity: "alta",
    },
    {
      id: "motivacion-recurso",
      title: "Reasoned decisions and appeal routes, in your own terms",
      description:
        "On top of the European duty to explain sits national administrative law, which is older and normally more demanding: a decision denying, reducing or revoking a benefit must be REASONED, and reasoning that in practice amounts to \"the system determined it\" is not reasoning. Check that the decision states the facts and the rule applied in terms the person can rebut, that the appeal route is stated with its deadline, and that whoever decides the appeal can access what the system produced. This control varies by Member State: adapt it. Evidence = reasoned decision template with its version, and an internal instruction prohibiting reasoning by reference to the system.",
      article: "National administrative law (and Art. 86)",
      severity: "alta",
      conditional:
        "The detail varies by Member State: adapt the template to your jurisdiction.",
    },
    {
      id: "registro-bd-ue",
      title: "Registration of the USE in the EU database",
      description:
        "If your organization is a public authority, an EU institution or a body acting on their behalf, in addition to using a high-risk system you must register yourself and register YOUR USE in the EU database. COMMON TRAP: this is a different obligation from the registration of the SYSTEM by the provider — the manufacturer having registered its product does not cover you. Useful detail: point 5 of Annex III goes in the public section of the register, not the restricted one (that is only for points 1, 6 and 7 — biometrics, law enforcement and migration). If the system is not registered by its provider, the obligation becomes refraining from using it and informing. Evidence = record of the registration with its date and the assigned identifier.",
      article: "Art. 49.3 (and Art. 26.8)",
      severity: "alta",
      conditional:
        "Only if the deployer is a public authority or acts on its behalf. ⚠️ The application date of this article is unclear: the Omnibus postponement reaches other sections of the chapter, so registration could be required BEFORE the rest of the high-risk obligations. Verify it before planning around 2027.",
    },
    {
      id: "transparencia-art50",
      title: "Transparency if there is a chatbot or generated content",
      description:
        "If the procedure includes a conversational assistant or generates content with AI, people must know they are interacting with a machine — unless it is obvious — and synthetic content must be marked. This obligation was NOT postponed: it applies from 2 August 2026, before the high-risk regime. In a public administration it is especially sensitive because trust in the channel is part of the service. Evidence = the notice text, where it is shown and the rollout date.",
      article: "Art. 50",
      severity: "media",
      conditional:
        "Only if there is a chatbot, conversational assistant or generated content. Enforceable from 2 Aug 2026.",
    },
    {
      id: "documentacion",
      title: "Require the provider's documentation, and put it in the tender",
      description:
        "The duties of technical documentation and instructions for use belong to the PROVIDER, not to you. Your control is to require them, keep them and — this is what is specific to the public sector — turn them into a PROCUREMENT requirement, which is the only moment when you have real negotiating power. Ask for: complete instructions for use, the system's characteristics and limitations, the declared level of accuracy, the human oversight measures foreseen, and the CE marking and declaration of conformity where applicable. Put it in the tender with verifiable criteria, not as a generic self-declaration. Evidence = documentation package received with its version, and the corresponding clauses of the tender or contract.",
      article: "Art. 13 and Annex IV (provider), via Art. 26.1",
      severity: "media",
    },
    {
      id: "gobernanza-datos-sesgo",
      title: "Ask the provider for its data governance and bias evidence",
      description:
        "The provider must have subjected the training, validation and testing datasets to appropriate governance practices, including examination of possible biases affecting health, safety or fundamental rights. Require and keep that evidence. It is not a formality: in benefits, a model bias translates into denials concentrated in one group, and when that surfaces, the first question will be what you asked before buying. If the provider does not deliver it, record the refusal — it is a risk datum, and also an argument in the next tender. Evidence = data governance and bias analysis documentation received, or a record of what was requested and not delivered.",
      article: "Art. 10 (provider)",
      severity: "alta",
    },
    {
      id: "rol-proveedor-deployer",
      title: "Check you have not become a provider without realizing",
      description:
        "A deployer BECOMES A PROVIDER, with all the attendant obligations, in three cases: if it puts its name or trademark on the system, if it substantially modifies it, or if it changes its intended purpose such that it becomes high risk. In the public sector this happens more than it seems, and almost always through the second or the third: a generic engine is procured and proprietary logic is built on top, or it is reused for a benefit other than the one it was bought for. And there is a corollary almost nobody sees: an in-house technical body that develops the tool for other administrations is a PROVIDER, not a deployer, and the full Arts. 9-15 apply to it. Determine and document your role for each system. Evidence = dated role determination per system, with the reasoning and the modifications made.",
      article: "Art. 25",
      severity: "alta",
    },
    {
      id: "emergencias-alcance",
      title: "Emergency call triage: scope and prioritization",
      description:
        "If the system is used to evaluate and classify emergency calls or to dispatch or prioritize first responder services — police, firefighters, medical assistance — or triage of emergency patients, it comes in under its own letter of Annex III and the same trunk of obligations applies. What changes is the failure mode: here the harm is physical and immediate, not an appealable denial, and the oversight window is seconds, not days. Document which decisions the system makes (classify, prioritize, suggest a resource) and which always remain with the person. Evidence = description of the system's role in the dispatch protocol, with an explicit boundary of what it never decides alone.",
      article: "Annex III.5.d",
      severity: "alta",
      conditional:
        "Only if the system classifies emergency calls or dispatches first responder services.",
    },
    {
      id: "emergencias-supervision",
      title: "Real-time oversight and cross-check (emergencies)",
      description:
        "In emergencies, the trunk's human oversight is not implemented the same way: there is no time to review a file. What can be built, and what will be asked of you, is three things: that the operator can override the proposed priority with a single action and without prior justification, that overrides are logged for later review, and that a degradation procedure exists — what happens if the system fails or goes down mid-shift. Periodically review the cases where the system's classification and the operator's diverged: it is the most valuable source of improvement and the most convincing evidence that oversight exists. Evidence = override and degradation procedures, override log, and minutes of the periodic divergence review.",
      article: "Art. 26.2 (and Art. 26.5)",
      severity: "alta",
      conditional:
        "Only if the system classifies emergency calls or dispatches first responder services.",
    },
  ],
};
