# Memorándum de investigación regulatoria — Policy pack "Servicios esenciales y prestaciones públicas" (EU AI Act, Anexo III.5)

> **Estado del documento:** borrador de investigación para construir el pack.
> **Fecha de la investigación:** 2026-07-30.
> **Autor:** subagente `compliance-domain-expert` (Attesta).
> **Naturaleza:** **orientación de compliance, NO asesoría legal.** Todo el contenido está
> pensado para preparar evidencia y autoevaluación; no emite veredictos de conformidad.
> **Método:** citas verificadas contra fuente primaria (texto del Reglamento (UE) 2024/1689 y
> guías oficiales). Lo que no se pudo verificar se marca como **INCERTIDUMBRE**, no se rellena.

**Índice**

- [A. Delimitación del ámbito](#a-delimitación-del-ámbito)
- [B. Controles del deployer](#b-controles-del-deployer)
- [C. Trampas del vertical](#c-trampas-del-vertical)
- [D. Plazos](#d-plazos)
- [E. Solape con packs existentes](#e-solape-con-packs-existentes)
- [F. Fuentes](#f-fuentes)

---

## A. Delimitación del ámbito

### A.1 Texto literal (fuente primaria)

**Chapeau del Anexo III** (verificado):

> "High-risk AI systems pursuant to Article 6(2) are the AI systems listed in any of the following areas:"

**Anexo III, punto 5 — texto literal EN de las cuatro letras** (verificado contra el texto del
Reglamento vía AI Act Explorer, ver §F):

> **(a)** "AI systems intended to be used by public authorities or on behalf of public authorities
> to evaluate the eligibility of natural persons for essential public assistance benefits and
> services, including healthcare services, as well as to grant, reduce, revoke, or reclaim such
> benefits and services;"
>
> **(b)** "AI systems intended to be used to evaluate the creditworthiness of natural persons or
> establish their credit score, with the exception of AI systems used for the purpose of detecting
> financial fraud;"
>
> **(c)** "AI systems intended to be used for risk assessment and pricing in relation to natural
> persons in the case of life and health insurance;"
>
> **(d)** "AI systems intended to evaluate and classify emergency calls by natural persons or to be
> used to dispatch, or to establish priority in the dispatching of, emergency first response
> services, including by police, firefighters and medical aid, as well as of emergency healthcare
> patient triage systems."

**Traducción operativa de III.5.a (no oficial, para el pack).** Sistemas de IA destinados a ser
utilizados **por autoridades públicas o en nombre de autoridades públicas** para **evaluar la
elegibilidad** de personas físicas a **prestaciones y servicios públicos de asistencia esenciales**,
incluidos los **servicios de asistencia sanitaria**, así como para **conceder, reducir, revocar o
reclamar** dichas prestaciones y servicios.

> ⚠️ **Nota de traducción.** La versión española oficial del Reglamento debe ser la que se cite en
> la UI. La traducción de arriba es funcional. **INCERTIDUMBRE MENOR (baja gravedad):** no se
> transcribió literalmente la versión ES del DOUE en esta pasada; antes de publicar el pack conviene
> pegar la redacción oficial ES de III.5.a y III.5.d desde EUR-Lex.

### A.2 Los cuatro elementos que hay que verificar en III.5.a

Un caso entra en III.5.a solo si se cumplen **los cuatro**. Este es el corazón del triaje del pack:

1. **Sujeto:** lo usa una **autoridad pública** o alguien **en nombre de** una autoridad pública
   ("by public authorities or on behalf of public authorities"). Esta cláusula es la que arrastra a
   contratistas, empresas públicas y ONG concertadas que gestionan el programa por delegación.
2. **Objeto:** **prestaciones y servicios públicos de asistencia esenciales** ("essential public
   assistance benefits and services"), **incluida la sanidad**.
3. **Función:** **evaluar la elegibilidad** de personas físicas, o **conceder / reducir / revocar /
   reclamar** la prestación. Nótese que la reclamación de lo indebidamente percibido (recobro,
   detección de sobrepagos que desemboca en reclamar) **está expresamente dentro**.
4. **Personas físicas** como afectados (no empresas).

**Consecuencia práctica nº 1:** si el sistema lo usa una empresa privada **para sí misma** y no en
nombre de una autoridad pública, III.5.a **no aplica** aunque el servicio sea "esencial".

**Consecuencia práctica nº 2:** el elemento 1 **no exige** que el deployer sea una administración;
exige que el uso sea *por* o *en nombre de* una autoridad pública. Un proveedor concertado que
tramita ayudas por cuenta del ayuntamiento entra.

### A.3 Casos de uso del mid-market que ENTRAN (III.5.a)

Con el matiz de que la calificación final depende del diseño concreto de cada sistema:

| Caso de uso | Por qué entra | Nota |
|---|---|---|
| Triaje/priorización de expedientes de **ayudas sociales** (renta mínima, ingreso mínimo vital, ayudas de emergencia) | Evalúa elegibilidad y condiciona concesión | Entra incluso si "solo prioriza": la letra cubre *evaluar la elegibilidad*, y un modelo que ordena la cola influye en la concesión efectiva |
| **Detección de sobrepagos / fraude en prestaciones** que lleva a suspender, revocar o **reclamar** | La letra menciona expresamente "reduce, revoke, or reclaim" | ⚠️ Ojo: la excepción de "detección de fraude financiero" está en **III.5.b**, no en 5.a — **no** se puede invocar para fraude en prestaciones. Ver C.6 |
| **Adjudicación de vivienda pública** / baremación de solicitudes de VPO | Recital 58 cita expresamente la vivienda (housing assistance) como asistencia pública esencial | |
| **Becas y ayudas al estudio** concedidas por una administración | Prestación pública de asistencia; evalúa elegibilidad | Solapa conceptualmente con `educacion` (III.3) solo si además decide *admisión*; ver §E |
| **Tarifa social / bono social** de luz, agua o transporte | Es una **prestación pública** aunque la ejecute una empresa: la elegibilidad la define y concede la autoridad | Entra por el "on behalf of"; ver A.5 para el matiz |
| **Triaje o priorización de listas de espera sanitarias** en un servicio público de salud | "including healthcare services" está en la propia letra | Si es triaje de **urgencias/emergencias**, va por III.5.d |
| **Asignación de plaza / horas de dependencia**, ayuda a domicilio, teleasistencia | Servicio de asistencia pública esencial; evalúa elegibilidad y grado | |
| **Admisión a programas asistenciales** (comedor social, inserción laboral subvencionada, ayudas de alquiler) | Elegibilidad a prestación pública | |
| **Verificación automatizada de requisitos** (renta, empadronamiento, unidad de convivencia) que produce la propuesta de resolución | Evalúa elegibilidad | Ver C.7: "solo comprueba requisitos" no exime por sí solo |

### A.4 Casos que NO entran en III.5.a (o entran por otra vía)

- **Scoring de crédito y solvencia** → es **III.5.b**, cubierto por el pack `credito-seguros`.
- **Suscripción y tarificación de seguros de vida y salud** → es **III.5.c**, mismo pack.
- **Seguros de hogar, auto o responsabilidad civil** → III.5.c está limitado a **vida y salud**;
  fuera del Anexo III por esta vía.
- **Detección de fraude financiero** → expresamente **excluida** en III.5.b (no en 5.a, ver arriba).
- **Chatbot informativo** de una administración que solo explica cómo pedir la ayuda y **no**
  evalúa elegibilidad ni resuelve → no es III.5.a. Le aplica **Art. 50** (transparencia) y, si es
  GenAI, la capa GPAI. Riesgo limitado, no alto.
- **Herramientas internas de back-office** sin efecto sobre la elegibilidad (clasificación de
  correo entrante, OCR de documentos, traducción) → no es III.5.a por sí solo. ⚠️ Frontera fina:
  si el OCR extrae la renta declarada y ese dato alimenta directamente la decisión, el conjunto sí
  es un sistema de alto riesgo (ver C.7 y el filtro del Art. 6.3).
- **Contratación pública** (adjudicación de contratos a empresas) → afecta a personas jurídicas,
  no a personas físicas destinatarias de asistencia.
- **Gestión de personal de la propia administración** (selección, promoción) → es **Anexo III.4**,
  cubierto por `rrhh` y `gestion-trabajadores`.

### A.5 La pregunta que más confusión genera: ¿entran los "servicios esenciales privados"?

**Respuesta corta: no por III.5.a.** El encabezado del punto 5 habla de servicios esenciales
privados *y* públicos, pero **ninguna de las cuatro letras** cubre de forma general el acceso a un
servicio privado esencial. El legislador cerró ese ámbito con dos letras concretas — **crédito
(5.b)** y **seguro de vida/salud (5.c)** — más el canal público de 5.a y las emergencias de 5.d.

**Apoyo textual:**

1. **La letra (a) está doblemente acotada:** por el sujeto ("by public authorities or on behalf of
   public authorities") **y** por el objeto ("essential **public** assistance benefits and
   services"). Una comercializadora eléctrica que decide con IA si te da un contrato no encaja en
   ninguno de los dos.
2. **El Recital 58 explica el mecanismo:** la razón por la que el scoring de crédito es alto riesgo
   es precisamente que **controla el acceso** a "financial resources or essential services such as
   **housing, electricity, and telecommunication services**". Es decir: el Reglamento protege el
   acceso a luz, vivienda y telecomunicaciones **a través** del control del scoring crediticio
   (5.b), no creando una categoría autónoma de "utilities". Esta es la clave del asunto y es lo que
   confunde a casi todo el mundo: se lee "electricidad" en el recital y se concluye, mal, que
   cualquier decisión de una eléctrica es alto riesgo.

**Regla operativa para el pack:**

> Si tu organización es una **empresa privada de un servicio esencial** (luz, agua, telecom) y usa
> IA para decidir sobre clientes: **no** estás en III.5.a. Comprueba si estás en **III.5.b**
> (¿la decisión se basa en evaluar solvencia o generar un score de crédito? → pack
> `credito-seguros`). Si además gestionas por delegación un **bono social o tarifa regulada** cuya
> elegibilidad define la administración, ese subsistema concreto **sí** puede caer en III.5.a por
> la cláusula "on behalf of public authorities" — y conviene tratarlo por separado del scoring
> comercial.

> ⚠️ **INCERTIDUMBRE (media).** El encabezado literal del punto 5 ("Access to and enjoyment of
> essential private services and essential public services and benefits") no se recuperó
> verbatim en esta pasada: se cita de memoria de la estructura del Anexo y **debe confirmarse**
> contra EUR-Lex antes de reproducirlo en la UI. El razonamiento de A.5 **no depende** de ese
> encabezado — se apoya en el texto de las letras y en el Recital 58, ambos verificados.

### A.6 III.5.d (emergencias): recomendación de alcance

**Recomendación: INCLUIR III.5.d como bloque acotado dentro del mismo pack, no como pack propio.**

Argumentos a favor de incluirlo:

- Comparte **exactamente el mismo perfil de deployer**: 112/emergencias, SAMUR/061, bomberos,
  policía local, servicios de salud. Es el mismo comprador que el de III.5.a en una administración.
- Comparte **todo el bloque troncal** de controles del deployer (Arts. 4, 5, 14+26.2, 26.1, 26.4,
  26.6, 26.11, 27, 49, 86, evidencia del proveedor). Un pack propio duplicaría el 80 % del
  contenido.
- La **FRIA (Art. 27)** aplica por la misma razón: el deployer es organismo público.
- El **volumen de mercado mid-market para 5.d es pequeño** en solitario: son pocas entidades y
  compran a pocos proveedores. No sostiene un pack propio.

Argumentos en contra (por qué el bloque debe ir **acotado y señalizado**, no diluido):

- El **modo de fallo es distinto**: en 5.a el daño es una denegación injusta y recurrible; en 5.d
  es un daño físico inmediato e irreversible (una llamada mal clasificada). La supervisión humana
  en 5.d es **en tiempo real y bajo presión de segundos**, no una revisión de expediente.
- El Art. 86 (explicación individual) **encaja mal** con 5.d: quien llama al 112 no va a pedir una
  explicación de la priorización; y hay normativa sectorial y de emergencias que puede desplazarlo.
- El **Art. 5.1.c (puntuación social)** casi no muerde en 5.d, mientras que en 5.a es el riesgo
  central.

**Diseño propuesto:** un pack cuyo tronco es III.5.a, con **2–3 controles marcados
`conditional: "solo si el sistema clasifica llamadas de emergencia o prioriza el despacho
(Anexo III.5.d)"`**. Así el usuario de 5.d encuentra su caso y no ve un pack que "no es el suyo",
y el usuario de 5.a no se come controles de triaje de emergencias que no le tocan.

**Nombre propuesto del pack:** `servicios-publicos` — *"Prestaciones y servicios públicos esenciales
(EU AI Act)"*, tag `UE · Sector público`.
Se descarta `servicios-esenciales` a secas porque induce justo el error de A.5 (un usuario de una
eléctrica privada creería que es su pack).

---

## B. Controles del deployer

### B.0 Criterio de severidad usado

- **alta** — su ausencia (i) incumple directamente un deber del deployer del Cap. III Sec. 3 y es
  verificable por una autoridad de vigilancia de mercado, **o** (ii) deja a la persona afectada sin
  defensa (denegación sin información, sin explicación, sin revisión humana real), **o** (iii) puede
  invalidar la resolución administrativa por falta de motivación.
- **media** — deber real pero con margen de forma, dependiente de un tercero, o de aplicación
  condicional.
- **baja** — higiene documental que facilita la auditoría pero no es exigible por sí sola.

Los controles marcados **`prohibited: true`** NO son brechas ordinarias: el objeto del control **es**
una práctica del Art. 5. No se "preparan para auditoría", se verifica su ausencia o se cesa el uso.
Quedan fuera del cómputo de "% listo".

---

### B.1 Bloque de triaje — prácticas prohibidas (Art. 5, ya exigible desde el 2-feb-2025)

#### 1. `puntuacion-social-prohibicion` — La frontera entre evaluar elegibilidad y puntuar socialmente

- **Cita:** `Art. 5.1.c` (con Recital 31)
- **Severidad:** alta · **`prohibited: true`**
- **Condicionalidad:** prohibición ya vigente desde el 2-feb-2025; no espera a 2027.

**Por qué existe.** Este es el error específico que una administración puede cometer sin mala fe.
Evaluar si una persona cumple los requisitos de una ayuda es **alto riesgo y legítimo** (III.5.a).
Construir una **puntuación transversal del ciudadano** que se reutiliza en otros departamentos es
**prohibido**. La diferencia no es de intensidad, es de estructura.

**Texto literal del Art. 5.1.c** (verificado): prohíbe la puesta en servicio o el uso de sistemas de
IA "for the evaluation or classification of natural persons or groups of persons **over a certain
period of time** based on their **social behaviour** or known, inferred or predicted **personal or
personality characteristics**", cuando la puntuación social produzca:
- **(i)** "detrimental or unfavourable treatment … in social contexts that are **unrelated to the
  contexts in which the data was originally generated or collected**"; o
- **(ii)** "detrimental or unfavourable treatment … that is **unjustified or disproportionate** to
  their social behaviour or its gravity".

**Carve-out verificado (Recital 31):** *"That prohibition should not affect lawful evaluation
practices of natural persons that are carried out for a specific purpose in accordance with Union
and national law."* Es decir: la evaluación de elegibilidad **con base legal y finalidad específica**
no es puntuación social.

**Las tres preguntas que deciden el caso** (esto es lo que el control debe hacer contestar por
escrito):

1. ¿El sistema produce una **puntuación de la persona** (perfil, "score de riesgo del ciudadano") o
   una **verificación de requisitos** de esa prestación concreta?
2. ¿Esa puntuación se usa **fuera del contexto** en el que se recogieron los datos? *Ejemplo de línea
   roja real: usar impagos de la tasa de basuras, absentismo escolar de los hijos o denuncias de
   convivencia para decidir una ayuda al alquiler.* Esto es el supuesto (i) casi textualmente.
3. ¿El trato desfavorable es **proporcionado** a la conducta y su gravedad? *Ejemplo: retirar una
   prestación de subsistencia completa por una irregularidad menor.* Supuesto (ii).

**Evidencia concreta que deja:** nota de triaje firmada y fechada por el responsable funcional que
(a) enumera las variables de entrada del sistema y **su origen** (qué trámite/base de datos las
generó), (b) declara si se produce una puntuación reutilizable entre departamentos, (c) identifica
la **base legal específica** de la evaluación (ley o reglamento de la prestación) y (d) si existe
reutilización de datos entre contextos, criterio jurídico que la ampare. Fecha + firma + versión del
sistema evaluada.

---

#### 2. `riesgo-penal-perfilado` — Predicción de fraude que se convierte en predicción de delito

- **Cita:** `Art. 5.1.d`
- **Severidad:** alta · **`prohibited: true`**
- **Condicionalidad:** solo si el sistema **predice la probabilidad de que una persona cometa un
  delito**. Un control de coherencia documental basado en hechos objetivos NO entra. Prohibición
  vigente desde el 2-feb-2025.

**Por qué existe.** La lucha contra el fraude en prestaciones es el uso de IA más extendido en este
vertical y el que más cerca pasa de una prohibición. El Art. 5.1.d prohíbe (verificado) el uso de un
sistema de IA "for making risk assessments of natural persons in order to assess or predict the risk
of a natural person **committing a criminal offence**, based **solely** on the profiling … or on
assessing their personality traits and characteristics".

**La excepción, que es la vía practicable** (verificada): la prohibición "shall not apply to AI
systems used to **support the human assessment** of the involvement of a person in a criminal
activity, which is **already based on objective and verifiable facts directly linked to a criminal
activity**."

**Traducción operativa:**
- **Permitido (y alto riesgo, III.5.a):** cruzar la renta declarada con datos tributarios y marcar
  discrepancias objetivas para revisión humana.
- **Zona roja:** puntuar el "riesgo de fraude" de un solicitante a partir de barrio, nacionalidad,
  composición del hogar, historial de contactos con servicios sociales — perfilado, no hechos.

⚠️ **Aviso de honestidad:** el fraude en prestaciones no siempre es un **delito** (a menudo es
infracción administrativa). Si el sistema predice una infracción administrativa y no un ilícito
penal, el Art. 5.1.d puede no morder, pero **el Art. 5.1.c sí sigue en juego** y el sistema es alto
riesgo en todo caso. El control debe pedir que se documente qué se está prediciendo, no dar el
veredicto. **INCERTIDUMBRE (media):** la calificación "delito" depende del Derecho nacional; requiere
criterio jurídico propio.

**Evidencia:** descripción documentada del objetivo del modelo (¿qué predice exactamente?), lista de
variables con marca de cuáles son hechos objetivos verificables y cuáles son proxies de perfil, y
constancia de que la salida **alimenta una revisión humana** y no una resolución automática.

---

#### 3. `vulnerabilidad-socioeconomica` — Sin explotación de la vulnerabilidad económica

- **Cita:** `Art. 5.1.b`
- **Severidad:** media · `prohibited: false` (es un control de "mantente dentro de los límites", no
  la práctica en sí — mismo criterio que `vulnerabilidades-menores` en el pack `educacion`)

**Contenido.** El Art. 5.1.b prohíbe (verificado) el uso de un sistema de IA que "exploits any of the
vulnerabilities of a natural person or a specific group of persons due to their **age, disability or
a specific social or economic situation**", distorsionando materialmente su conducta de forma que
cause un perjuicio importante. Este vertical es el único donde la vulnerabilidad **socioeconómica**
—expresamente citada en la letra— describe a **toda la población destinataria**. Aplica sobre todo a
sistemas conversacionales o de "nudging" que empujan a renunciar a una solicitud, aceptar una
prestación inferior o desistir de un recurso.

**Evidencia:** descripción de los mecanismos de interacción/persuasión del sistema (mensajes,
recordatorios, ordenación de opciones) y confirmación documentada de ausencia de técnicas de
desistimiento inducido.

---

### B.2 Bloque de alcance y clasificación

#### 4. `clasificacion-alcance` — Confirma los cuatro elementos del Anexo III.5.a

- **Cita:** `Anexo III.5.a` · **Severidad:** alta

Documenta por escrito que el sistema cumple (o no) los cuatro elementos: **(1)** lo usa una autoridad
pública o alguien **en su nombre**; **(2)** el objeto es una prestación o servicio **público de
asistencia esencial**, incluida la sanidad; **(3)** la función es **evaluar elegibilidad** o
**conceder / reducir / revocar / reclamar**; **(4)** los afectados son personas físicas. Los cuatro
deben darse. Si tu organización es una empresa privada de un servicio esencial (luz, agua, telecom)
que decide sobre sus propios clientes, **no** es III.5.a: comprueba III.5.b (solvencia) → pack
`credito-seguros`.

**Evidencia:** ficha de clasificación firmada con la respuesta a los cuatro elementos y el nombre de
la prestación o programa concreto.

---

#### 5. `no-alto-riesgo-6-3` — La excepción del Art. 6.3 y por qué aquí casi nunca funciona

- **Cita:** `Art. 6.3` (párr. 2, puerta de perfilado) · **Severidad:** media

El Art. 6.3 permite que un sistema del Anexo III **no** se considere alto riesgo si no plantea un
riesgo significativo por realizar solo una tarea procedimental estrecha, mejorar el resultado de una
actividad humana previa, detectar patrones de decisión sin sustituir la valoración humana, o realizar
una tarea preparatoria. **Pero el párrafo segundo cierra la puerta:** un sistema del Anexo III se
considera **siempre** alto riesgo cuando realiza **perfilado de personas físicas**.

**Consecuencia para este vertical:** casi cualquier evaluación de elegibilidad que combine
características personales para producir un resultado individualizado es perfilado. La excepción es
practicable solo en casos muy acotados (p. ej. OCR que transcribe un formulario sin valorar). Además,
invocar la excepción es una decisión del **proveedor**, que debe documentarla y registrar el sistema
(Art. 6.4 y Art. 49.2): si tu proveedor la invoca, **pídesela por escrito**.

**Evidencia:** si se invoca, la evaluación documentada del proveedor + tu propio análisis de por qué
no hay perfilado; si no se invoca, constancia de que se descartó.

---

### B.3 Bloque troncal — deberes propios del deployer

#### 6. `alfabetizacion-ia` — Alfabetización en IA del personal que tramita

- **Cita:** `Art. 4` (redacción modificada por el Reglamento (UE) 2026/1744) · **Severidad:** media
- **Condicionalidad:** ya exigible; **la redacción cambió el 27-jul-2026** (ver §D).

⚠️ **Cambio muy reciente y verificado.** El Digital Omnibus reescribió el Art. 4. Texto vigente
(verificado en EUR-Lex, Reglamento (UE) 2026/1744):

> "Providers and deployers of AI systems shall **take measures to support the development** of AI
> literacy of their staff and other persons dealing with the operation and use of AI systems on
> their behalf, taking into account their technical knowledge, experience, education and training
> and the context the AI systems are to be used in, and considering the persons or groups of persons
> on whom the AI systems are to be used. **This obligation does not require providers or deployers to
> guarantee any specific level of AI literacy of any individual.**"

Pasó de ser una obligación de **resultado** ("garantizar un nivel suficiente") a una de **medios**
("adoptar medidas para apoyar el desarrollo"). Sigue siendo vinculante y **no se aplazó**. En este
vertical, el destinatario no es "el equipo de IA": es **el personal de ventanilla y de instrucción de
expedientes**, que es quien decide si sigue o no la recomendación.

**Evidencia:** plan de formación con fechas, lista de asistentes por rol (tramitadores, instructores,
responsables de resolución), materiales, y constancia de la formación específica sobre los límites y
errores conocidos de **este** sistema.

---

#### 7. `instrucciones` — Uso conforme a las instrucciones de uso del proveedor

- **Cita:** `Art. 26.1` (con `Art. 13`) · **Severidad:** alta

Texto verificado del Art. 26.1: los deployers "shall take appropriate technical and organisational
measures to ensure they use such systems **in accordance with the instructions for use** accompanying
the systems". La trampa habitual aquí: usar el sistema para una prestación distinta de aquella para
la que se validó, o con una población distinta (p. ej. una herramienta diseñada para renta mínima
aplicada a ayudas de emergencia).

**Evidencia:** copia archivada de las instrucciones de uso (Art. 13) con su versión y fecha;
documento de "uso previsto declarado vs. uso real" firmado por el responsable funcional; registro de
cualquier desviación y su autorización.

---

#### 8. `supervision-humana` — Supervisión humana con competencia, formación y **autoridad**

- **Cita:** `Art. 26.2` (y `Art. 14`) · **Severidad:** alta

Texto verificado del Art. 26.2: "Deployers shall assign human oversight to natural persons who have
the **necessary competence, training and authority, as well as the necessary support**." Reparto de
roles que hay que dejar claro en el pack: **designar** a esa persona es deber tuyo (deployer); que el
sistema **permita** la supervisión es diseño del proveedor (Art. 14).

**Las cuatro condiciones que hacen la supervisión defendible:** (1) persona identificada por nombre o
puesto; (2) formada en las limitaciones concretas del sistema; (3) con **autoridad formal para
apartarse** de la recomendación sin pedir permiso ni justificar ante su superior cada desviación;
(4) con **tiempo material** para revisar — si un tramitador tiene 4 minutos por expediente, la
supervisión es decorativa.

**Evidencia:** designación nominal fechada, descripción del puesto que incluya la facultad de
anular, formación acreditada, y el procedimiento escrito de revisión/anulación.

---

#### 9. `revision-humana-registro` — Prueba de que la supervisión **no es nominal**

- **Cita:** `Art. 26.2` (+ `Art. 26.6` como soporte probatorio) · **Severidad:** alta

**Este es el control diferencial del pack.** El fallo más común y más difícil de defender es la
supervisión de sello: alguien que firma el 100 % de lo que propone el sistema. Un designado sin
desviaciones no prueba que el sistema acierte; prueba que nadie mira.

**Qué hacer:** medir y registrar periódicamente (mensual o trimestral) el **número de casos en que
el revisor se apartó de la recomendación**, con el motivo. Fijar de antemano qué se hace si la tasa
de desviación es ~0 % durante un periodo (revisar muestreo, formación o el propio diseño). Muestreo
de contraste: revisar a ciegas una muestra de expedientes sin ver la salida del sistema y comparar.

**Evidencia:** registro periódico con nº de decisiones asistidas, nº de desviaciones, motivos y
firma del responsable; acta de la revisión cuando la tasa es anómala.

⚠️ **Honestidad:** el AI Act **no exige literalmente medir la tasa de desviación**. Es la forma
práctica de acreditar el Art. 26.2 ante una auditoría. El pack debe presentarlo así — buena práctica
probatoria de un deber que sí existe, no un requisito inventado.

---

#### 10. `datos-entrada` — Datos de entrada relevantes y suficientemente representativos

- **Cita:** `Art. 26.4` · **Severidad:** alta

Texto verificado: "Deployers shall ensure that **input data is relevant and sufficiently
representative** in view of the intended purpose of the high-risk AI system", en la medida en que
controlen esos datos. En este vertical los datos de entrada son **registros administrativos**
(padrón, renta, unidad de convivencia, discapacidad, historial de prestaciones) y el problema real no
es el modelo: es que **el padrón está desactualizado** o que la unidad de convivencia está mal
codificada, y eso deniega ayudas a personas que sí tienen derecho.

**Evidencia:** inventario de las fuentes de datos de entrada con responsable, frecuencia de
actualización y fecha del último refresco; controles de calidad documentados; procedimiento para que
el solicitante pueda **corregir** un dato erróneo antes de la resolución.

---

#### 11. `logs` — Conservación de los registros generados automáticamente

- **Cita:** `Art. 26.6` · **Severidad:** alta

Texto verificado, con el plazo exacto: los deployers "shall keep the logs automatically generated by
that high-risk AI system to the extent such logs are under their control, for a period appropriate to
the intended purpose of the high-risk AI system, **of at least six months**, unless provided
otherwise in applicable Union or national law."

**Lectura correcta y no obvia:** seis meses es el **suelo**, no el plazo. La referencia real es "un
periodo apropiado a la finalidad". En prestaciones públicas, el plazo de recurso administrativo y
contencioso, y los plazos de revisión de oficio, suelen exceder ampliamente los seis meses: si borras
a los seis meses, te quedas sin poder reconstruir una resolución que todavía puede ser impugnada.
**Fija el plazo por el plazo de impugnación, no por el mínimo del Reglamento.**

**Evidencia:** política de retención escrita con el plazo elegido **y su justificación**;
confirmación de que los logs están bajo tu control (si están solo en el proveedor SaaS, cláusula
contractual de acceso y conservación); prueba de restauración/consulta de un log antiguo.

---

#### 12. `monitoreo` — Vigilancia del funcionamiento, suspensión y notificación de incidentes

- **Cita:** `Art. 26.5` · **Severidad:** media

Texto verificado (resumen fiel): vigilar el funcionamiento conforme a las instrucciones e informar al
proveedor cuando proceda; si hay motivos para considerar que el uso puede generar un riesgo en el
sentido del Art. 79.1, **informar sin demora al proveedor y a la autoridad de vigilancia de mercado y
suspender el uso**; ante un incidente grave, informar inmediatamente al proveedor y después al
importador/distribuidor y a la autoridad.

**Evidencia:** procedimiento de vigilancia con métricas y umbrales, buzón/registro de incidencias
detectadas por el personal de ventanilla (que es quien las ve primero), y el **procedimiento de
suspensión** con la persona autorizada a activarlo.

---

#### 13. `info-afectado` — Informar a la persona de que está sometida al sistema

- **Cita:** `Art. 26.11` (y `GDPR Arts. 13-14`) · **Severidad:** alta

Texto verificado del Art. 26.11: los deployers de sistemas del Anexo III "that make decisions or
assist in making decisions related to natural persons **shall inform the natural persons that they
are subject to the use of the high-risk AI system**". Nótese "**or assist**": no hace falta que la
decisión sea automática; basta con que el sistema asista.

**Evidencia (muy concreta):** el párrafo informativo insertado en el formulario de solicitud, en el
acuse de recibo y/o en la resolución, con su fecha de entrada en vigor y la versión del texto. Es una
de las pocas brechas que se cierra con un cambio de plantilla — y de las más fáciles de comprobar por
una autoridad.

---

#### 14. `explicacion` — Derecho a explicación de la decisión individual

- **Cita:** `Art. 86` · **Severidad:** alta
- **Condicionalidad:** exigible con el régimen de alto riesgo del Anexo III (2-dic-2027).

**Aquí está el caso más fuerte de todo el Reglamento.** Texto verificado del Art. 86.1: toda persona
afectada por una decisión adoptada por el deployer sobre la base de la salida de un sistema de alto
riesgo del Anexo III —**con excepción de los del punto 2**— que produzca efectos jurídicos o la
afecte significativamente de manera que considere que perjudica su salud, seguridad o derechos
fundamentales, tiene derecho a obtener del deployer "**clear and meaningful explanations of the role
of the AI system in the decision-making procedure and the main elements of the decision taken**".

**Confirmado:** la exclusión es solo el punto 2 del Anexo III (infraestructuras críticas), de modo que
**III.5.a y III.5.d están plenamente dentro**. Una denegación de prestación es el ejemplo de manual de
"efectos jurídicos".

**Matices que el control debe recoger (Art. 86.2 y 86.3, verificados):** no aplica cuando existan
excepciones o restricciones derivadas del Derecho de la Unión o nacional conforme al Derecho de la
Unión; y el artículo aplica **solo en la medida en que ese derecho no esté ya previsto** en otra norma
de la Unión. En la práctica: si tu procedimiento administrativo ya obliga a motivar la resolución,
**aprovéchalo** — pero el Art. 86 exige explicar específicamente **el papel del sistema de IA**, algo
que una motivación administrativa clásica no suele contener.

**Evidencia:** procedimiento y **plantilla de respuesta** que explique en lenguaje llano qué hizo el
sistema, qué factores pesaron y quién tomó la decisión final; registro de solicitudes recibidas y
respondidas con fechas; canal por el que se pide (que debe ser accesible para personas sin medios
digitales — población típica de este vertical).

---

#### 15. `fria` — Evaluación de impacto en derechos fundamentales (FRIA)

- **Cita:** `Art. 27` · **Severidad:** alta
- **Condicionalidad:** exigible con el régimen de alto riesgo del Anexo III (2-dic-2027). En este
  vertical, **aplica casi siempre** (a diferencia de RRHH privado).

**Ámbito verificado del Art. 27.1:** deben realizarla, antes del despliegue de un sistema de alto
riesgo del Art. 6.2 (excepto los del punto 2 del Anexo III), los deployers que sean **organismos de
Derecho público**, los que sean **entidades privadas que prestan servicios públicos**, y los
deployers de los sistemas del **Anexo III puntos 5(b) y 5(c)**.

**Por qué aquí aplica casi siempre y en RRHH privado no:** III.5.a exige por definición que el uso sea
"por autoridades públicas o en su nombre". Si eres la autoridad, eres organismo de Derecho público. Si
actúas en su nombre gestionando la prestación, encajas con alta probabilidad en "entidad privada que
presta servicios públicos".
⚠️ **INCERTIDUMBRE (media, y es la más relevante del memo):** "actuar en nombre de una autoridad
pública" (Anexo III.5.a) y "entidad privada que presta servicios públicos" (Art. 27.1) son
formulaciones **distintas**. Coinciden en la mayoría de los casos, pero un mero contratista técnico
podría discutir la segunda. El control debe pedir una **determinación documentada**, no afirmar el
resultado.

**Contenido mínimo (Art. 27.1, letras a–f — verificado):**
- **(a)** descripción de los procesos del deployer en los que se usará el sistema conforme a su
  finalidad prevista;
- **(b)** periodo de tiempo y frecuencia de uso previstos;
- **(c)** categorías de personas físicas y grupos que probablemente se vean afectados en el contexto
  concreto;
- **(d)** riesgos específicos de perjuicio para esas categorías, teniendo en cuenta la información
  facilitada por el proveedor conforme al **Art. 13**;
- **(e)** descripción de la aplicación de las medidas de **supervisión humana**, conforme a las
  instrucciones de uso;
- **(f)** medidas a adoptar si esos riesgos se materializan, incluidas las **disposiciones de
  gobernanza interna y los mecanismos de reclamación**.

**Más deberes verificados:** se realiza **antes del primer uso** y puede reutilizarse en casos
similares (Art. 27.2); hay que **notificar los resultados a la autoridad de vigilancia de mercado**
presentando la plantilla cumplimentada (Art. 27.3); la Oficina de IA desarrollará una plantilla de
cuestionario, incluso mediante una herramienta automatizada (Art. 27.5).

**Evidencia:** FRIA firmada y fechada que cubra a–f, con la lista de colectivos afectados (personas
en riesgo de exclusión, personas con discapacidad, migrantes, mayores), acuse de la notificación a la
autoridad, y el mecanismo de reclamación publicado.

---

#### 16. `dpia-fria-reutilizacion` — DPIA y FRIA: qué se puede reutilizar (y qué no)

- **Cita:** `Art. 27.4` (redacción del Reglamento (UE) 2026/1744) + `GDPR Art. 35` · **Severidad:** media

⚠️ **Novedad verificada y muy práctica.** El Digital Omnibus modificó el Art. 27.4. Texto vigente
(verificado en EUR-Lex, Reglamento (UE) 2026/1744):

> "If any of the obligations laid down in this Article is already met through the data protection
> impact assessment conducted pursuant to Article 35 of Regulation (EU) 2016/679 or Article 27 of
> Directive (EU) 2016/680, the deployer may, when conducting the fundamental rights impact assessment
> referred to in paragraph 1 of this Article, **include cross-references to the relevant sections of
> that data protection impact assessment or include relevant parts thereof** in the fundamental
> rights impact assessment."

**Respuesta a la pregunta práctica "¿se puede reutilizar la DPIA?":** **sí, parcialmente y por
remisión expresa** — la nueva redacción autoriza literalmente la referencia cruzada o la
incorporación de partes. Pero **no la sustituye**:

| Se reutiliza bien | No se reutiliza |
|---|---|
| Descripción del tratamiento y de los flujos de datos → Art. 27.1(a) y (b) | Los **derechos fundamentales no relacionados con datos**: no discriminación, buena administración, tutela judicial efectiva, derecho a prestaciones sociales |
| Categorías de interesados → parte de 27.1(c) | Las **medidas de supervisión humana** conforme a las instrucciones de uso → 27.1(e) |
| Medidas técnicas y organizativas de seguridad | La **gobernanza interna y el mecanismo de reclamación** → 27.1(f) |
| Análisis de riesgos de privacidad → parte de 27.1(d) | Los riesgos **colectivos o de grupo** (la DPIA es individual-céntrica) |

**Regla de una línea para la UI:** *la DPIA cubre el riesgo para los datos; la FRIA cubre el riesgo
para las personas.* Se solapan, no coinciden.

**Evidencia:** FRIA que cite expresamente las secciones de la DPIA que incorpora, con la fecha y
versión de esa DPIA, y las secciones específicas de la FRIA que no proceden de ella.

---

#### 17. `dpia` — Evaluación de impacto de protección de datos

- **Cita:** `GDPR Art. 35` (con `Art. 26.9` del AI Act) · **Severidad:** alta

La evaluación sistemática y automatizada de personas para decidir sobre prestaciones, sobre datos de
categorías especiales y a gran escala, cae de lleno en los supuestos del Art. 35.3 del RGPD. El
Art. 26.9 del AI Act (verificado) añade que el deployer **debe usar la información del Art. 13** (las
instrucciones de uso del proveedor) para cumplir su obligación de DPIA — es decir, la DPIA que no
incorpore la documentación del proveedor está incompleta.

**Evidencia:** DPIA firmada y fechada, consulta al DPD documentada, y constancia de que se usó la
documentación del proveedor.

---

#### 18. `decision-automatizada-art22` — Decisión no basada únicamente en tratamiento automatizado

- **Cita:** `GDPR Art. 22` · **Severidad:** alta

Una denegación, reducción o revocación de prestación es el ejemplo canónico de decisión con efectos
jurídicos. **Matiz clave que suele fallar:** en el asunto **SCHUFA (C-634/21)** el TJUE consideró que
la elaboración de un valor de probabilidad puede constituir por sí misma una "decisión" del Art. 22
cuando **desempeña un papel determinante** en la decisión del tercero. Aplicado aquí: si el tramitador
sigue el score en la práctica totalidad de los casos, decir "la decide una persona" no basta.

⚠️ **Nota de alcance:** SCHUFA es un caso de scoring crediticio; su ratio sobre "papel determinante" es
razonablemente trasladable pero no hay (a fecha de este memo) jurisprudencia del TJUE específica sobre
prestaciones sociales. **Certeza: media-alta.** Presentarlo como criterio interpretativo, no como
resolución de un caso idéntico.

**Evidencia:** base jurídica del Art. 22.2 invocada (normalmente 22.2(b), autorización por Derecho de
la Unión o del Estado miembro con medidas adecuadas de salvaguardia), diseño del flujo que acredita
intervención humana real (ver control 9), y canal para expresar el punto de vista e impugnar.

---

#### 19. `datos-especiales` — Datos de salud, discapacidad y categorías especiales

- **Cita:** `GDPR Art. 9` · **Severidad:** alta
- **Condicionalidad:** si el sistema trata datos de salud, discapacidad, origen étnico o situación
  social equivalente (habitual en dependencia, sanidad y ayudas de emergencia).

Determina y documenta la excepción del Art. 9.2 aplicable (típicamente 9.2(b) protección social,
9.2(g) interés público esencial o 9.2(h) fines de asistencia sanitaria o social), verifica que exista
la norma nacional que la habilita, y aplica minimización real: no todo dato disponible en el
expediente debe entrar en el modelo.

**Evidencia:** base del Art. 9.2 identificada con la norma nacional que la sustenta; lista de
variables sensibles usadas y justificación de cada una; registro de las descartadas.

---

#### 20. `no-discriminacion-prestaciones` — Vigilancia de resultados dispares

- **Cita:** `Art. 26.4` + Derecho antidiscriminación de la UE (`Art. 10` = deber del **proveedor**) ·
  **Severidad:** alta

El Recital 58 identifica expresamente el riesgo de estos sistemas: "may lead to discrimination between
persons or groups and may **perpetuate historical patterns of discrimination**, such as that based on
racial or ethnic origins, gender, disabilities, age or sexual orientation" (verificado). La
gobernanza del conjunto de datos de entrenamiento es deber del **proveedor** (Art. 10) — como deployer,
**exígela** y además vigila tus propios resultados.

**Evidencia:** análisis periódico de tasas de denegación/concesión por grupos (con la cautela de
protección de datos que exige medir sin crear un fichero de perfiles étnicos), umbral de alerta
definido y acta de las revisiones. Documentación de sesgo aportada por el proveedor.

---

#### 21. `motivacion-recurso` — Motivación de la resolución y vía de recurso

- **Cita:** Derecho administrativo nacional (+ `Art. 86` del AI Act) · **Severidad:** alta

**El riesgo legal más inmediato y más caro de este vertical no es la multa del AI Act: es la anulación
masiva de resoluciones** por falta de motivación. Una resolución denegatoria que dice "el sistema
determinó que no cumple los requisitos" no está motivada. Además, el interesado suele tener derecho de
acceso al expediente, lo que incluye el criterio aplicado.

⚠️ **Honestidad de fuente:** esto es Derecho **nacional** (procedimiento administrativo común), no el
AI Act. El pack debe decirlo así y remitir a la norma del Estado miembro. **Certeza alta sobre el
principio, sin cita concreta** porque varía por país.

**Evidencia:** modelo de resolución que incorpore los motivos concretos y los datos usados, con
indicación de recursos y plazos; constancia del acceso al expediente cuando se solicita.

---

#### 22. `registro-bd-ue` — Registro del uso en la base de datos de la UE

- **Cita:** `Art. 49.3` (y `Art. 26.8`) · **Severidad:** alta
- **Condicionalidad:** **solo** si el deployer es autoridad pública, institución/órgano/organismo de
  la Unión, **o persona que actúa en su nombre**. Exigible con el régimen de alto riesgo (2-dic-2027).

Texto verificado del Art. 49.3: antes de poner en servicio o usar un sistema de alto riesgo del Anexo
III (excepto el punto 2), "deployers that are **public authorities, Union institutions, bodies,
offices or agencies or persons acting on their behalf** shall **register themselves, select the system
and register its use** in the EU database referred to in Article 71."

Y el Art. 26.8 (verificado) cierra el círculo: si el sistema **no está registrado** en la base de datos
de la UE, el deployer **no debe usarlo** e informará al proveedor o al distribuidor.

**Doble deber que se confunde:** el **proveedor** registra el sistema (Art. 49.1); el **deployer
público** se registra a sí mismo y registra **su uso** (Art. 49.3). Son dos entradas distintas; que tu
proveedor esté registrado no te exime.
**Nota de alcance verificada:** la sección **no pública** de la base de datos está reservada a los
puntos 1, 6 y 7 del Anexo III (biometría, migración/asilo, aplicación de la ley) — el punto 5 va a la
sección **pública**, así que el registro de tu uso será visible.

**Evidencia:** justificante del registro con fecha y número de entrada; comprobación documentada de
que el sistema del proveedor está registrado antes del primer uso.

---

#### 23. `transparencia-art50` — Transparencia de la interacción y del contenido sintético

- **Cita:** `Art. 50` · **Severidad:** media
- **Condicionalidad:** solo si hay chatbot/asistente conversacional o contenido generado por IA.
  Exigible desde el **2-ago-2026** (no se aplazó).

Deberes que recaen sobre el **deployer** (verificado): informar a las personas expuestas cuando se usa
un sistema de reconocimiento de emociones o categorización biométrica (Art. 50.3); revelar que el
contenido es generado o manipulado artificialmente en el caso de ultrasuplantaciones (Art. 50.4); y
—**muy relevante para una administración**— revelar que un texto publicado **para informar al público
sobre asuntos de interés público** ha sido generado por IA, salvo que haya habido revisión editorial
humana y alguien asuma la responsabilidad editorial (Art. 50.4, párr. 2). La obligación de avisar de
que se interactúa con una IA (Art. 50.1) y de marcar el contenido sintético (Art. 50.2) recaen sobre
el **proveedor**: como deployer, **exígelas**.

**Evidencia:** aviso visible en el canal conversacional; política editorial de contenido asistido por
IA con responsable nombrado.

---

### B.4 Bloque de evidencia exigida al proveedor (Arts. 9-15 reencuadrados)

> Regla del pack: estos artículos son deberes del **proveedor**. Para el deployer se traducen en
> **exigir, recibir y conservar** la evidencia — y en dejar constancia de haberla pedido si no llega.

#### 24. `documentacion` — Instrucciones de uso y documentación técnica del proveedor

- **Cita:** `Art. 13` / `Art. 11` y `Anexo IV` (deberes del **proveedor**) · **Severidad:** media

Exige y archiva: instrucciones de uso completas, finalidad prevista, nivel de exactitud declarado y
métricas, limitaciones conocidas, colectivos para los que el sistema **no** está validado, medidas de
supervisión humana previstas (Art. 14) y la **declaración UE de conformidad y el marcado CE** que el
proveedor debe aportar. Sin esto no puedes hacer la FRIA (el Art. 27.1(d) remite expresamente al
Art. 13).

**Evidencia:** carpeta del expediente con la documentación recibida, fechada y versionada, y el
correo/registro de la solicitud si falta algo.

---

#### 25. `gobernanza-datos-sesgo` — Evidencia de gobernanza de datos y sesgo

- **Cita:** `Art. 10` (deber del **proveedor**) · **Severidad:** alta

Pide por escrito: procedencia de los datos de entrenamiento, representatividad respecto a la población
que **tú** atiendes, examen de sesgos realizado y resultados por subgrupos. Pregunta específica de este
vertical: *¿se validó el sistema con población comparable a la mía (renta, composición del hogar,
proporción de personas migrantes, ruralidad)?* Un modelo entrenado en otro país o en otra prestación
puede fallar sistemáticamente en la tuya.

**Evidencia:** respuesta escrita del proveedor con métricas por subgrupo, o constancia de la negativa
(que es en sí un hallazgo para el expediente y para el pliego).

---

#### 26. `exactitud-robustez` — Exactitud, robustez y ciberseguridad declaradas

- **Cita:** `Art. 15` (deber del **proveedor**) + `Art. 26.5` · **Severidad:** media

Obtén los niveles de exactitud declarados y las condiciones en que se degradan; comprueba que se
corresponden con tu uso real. Un umbral fijado para una prestación de baja cuantía puede ser
insuficiente para una que decide el sustento de una familia.

**Evidencia:** métricas declaradas archivadas + comparación con el rendimiento observado en tu propio
seguimiento.

---

#### 27. `rol-proveedor-deployer` — ¿Seguro que eres solo deployer?

- **Cita:** `Art. 25` · **Severidad:** alta

**Trampa mayor de este vertical.** Muchas administraciones **desarrollan internamente** o encargan a
medida su motor de elegibilidad: en ese caso **eres proveedor**, no deployer, y te aplican los
Arts. 9-15, 16 y ss. **directamente** (sistema de gestión de riesgos, gobernanza de datos,
documentación técnica, evaluación de la conformidad, marcado CE, registro del sistema). Verificado
(Art. 25.1): un deployer pasa a considerarse proveedor si **(a)** pone su nombre o marca en un sistema
de alto riesgo ya comercializado, **(b)** realiza una **modificación sustancial** en un sistema de alto
riesgo que sigue siendo de alto riesgo, o **(c)** modifica la finalidad prevista de un sistema —
incluido uno de propósito general— de modo que pase a ser de alto riesgo.

**Casos frecuentes que activan esto:** motor de reglas + modelo entrenado con tus propios expedientes;
reentrenamiento periódico con tus datos; encargo a medida entregado sin marcado CE; despliegue de un
LLM general reconfigurado para decidir elegibilidad (letra c).

**Evidencia:** determinación documentada del rol (proveedor / deployer / ambos) firmada, con la fecha
y el motivo; si eres proveedor, plan de las obligaciones adicionales.

---

#### 28. `clausulas-contratacion` — Trasladar las exigencias al pliego / al contrato

- **Cita:** `Art. 26.1` + `Art. 13` (vía contractual) · **Severidad:** media

El único momento con poder de negociación real es la **licitación**. Después, pedir la documentación
de sesgo a un proveedor ya adjudicado es una carta que no se contesta. Incluye en el pliego:
entrega de instrucciones de uso y documentación del Art. 13; declaración UE de conformidad y marcado
CE; compromiso de registro en la BD de la UE (Art. 49.1); acceso y conservación de **logs** por el
plazo que tú fijes (control 11); métricas de rendimiento por subgrupo; deber de notificarte
modificaciones sustanciales; y cooperación en caso de incidente grave (Art. 26.5).

**Evidencia:** cláusulas efectivamente incluidas en el pliego o contrato, con referencia al expediente
de contratación.

---

#### 29. `conservacion-evidencia` — Expediente de evidencia listo para auditoría

- **Cita:** `Art. 26.6` + gobernanza interna · **Severidad:** baja

Mantén en un solo lugar, con fecha y responsable: ficha de clasificación, FRIA, DPIA, designación de
supervisión, formación, instrucciones del proveedor, política de logs, registro en la BD de la UE,
plantilla de información al afectado y plantilla de explicación. Es lo que una autoridad de vigilancia
de mercado pide primero.

**Evidencia:** índice del expediente con enlaces y fechas de última revisión.

---

### B.5 Bloque condicional — Anexo III.5.d (emergencias)

> Se marcan con `conditional: "Solo si el sistema clasifica llamadas de emergencia o prioriza el
> despacho de servicios de primera intervención (Anexo III.5.d)."`

#### 30. `emergencias-alcance` — Clasificación de llamadas y priorización del despacho

- **Cita:** `Anexo III.5.d` · **Severidad:** alta · **Condicional**

Texto literal verificado: sistemas destinados a "evaluate and classify emergency calls by natural
persons or to be used to **dispatch, or to establish priority in the dispatching of**, emergency first
response services, including by police, firefighters and medical aid, **as well as of emergency
healthcare patient triage systems**". Entran por tanto: clasificación automática de llamadas al 112,
asignación de código de prioridad, sugerencia de recurso a movilizar, y **triaje de urgencias
hospitalarias**.

**Frontera útil:** el triaje de **urgencias** es III.5.d; la priorización de **listas de espera
programadas** encaja mejor en III.5.a como servicio sanitario público — la calificación cambia, las
obligaciones troncales del deployer no.

**Evidencia:** ficha de clasificación que identifique cuál de los tres supuestos (clasificar llamadas
/ priorizar despacho / triaje de urgencias) realiza el sistema.

---

#### 31. `emergencias-supervision` — Supervisión en tiempo real y protocolo de degradación

- **Cita:** `Art. 26.2` + `Art. 26.5` (y `Art. 14`) · **Severidad:** alta · **Condicional**

La supervisión humana en 5.d es **en segundos y bajo carga**, no una revisión de expediente: el
control debe exigir (1) que el operador pueda **elevar** la prioridad asignada por el sistema sin
fricción y sin justificar en el momento; (2) un **protocolo de contingencia** escrito para operar sin
el sistema (caída, degradación, saturación); (3) revisión posterior de los casos en que el sistema
infra-priorizó, con cierre documentado.

**Evidencia:** procedimiento operativo con la facultad de anulación explicitada, registro de
anulaciones, actas de los simulacros del protocolo de contingencia, y revisión de incidentes.

⚠️ **Nota:** en 5.d, el **Art. 86** encaja mal (quien llama al 112 no ejerce un derecho a explicación
en la práctica) y puede además estar desplazado por normativa sectorial o de seguridad pública
(Art. 86.2/86.3). El pack debe atenuar el control 14 para el caso 5.d en vez de exigirlo igual.

---

### B.6 Resumen: 31 controles propuestos

| # | id | Cita | Sev. | Prohibited | Condicional |
|---|---|---|---|---|---|
| 1 | `puntuacion-social-prohibicion` | Art. 5.1.c | alta | **sí** | vigente desde 2-feb-2025 |
| 2 | `riesgo-penal-perfilado` | Art. 5.1.d | alta | **sí** | solo si predice delito |
| 3 | `vulnerabilidad-socioeconomica` | Art. 5.1.b | media | no | vigente desde 2-feb-2025 |
| 4 | `clasificacion-alcance` | Anexo III.5.a | alta | no | — |
| 5 | `no-alto-riesgo-6-3` | Art. 6.3 | media | no | — |
| 6 | `alfabetizacion-ia` | Art. 4 | media | no | redacción nueva 27-jul-2026 |
| 7 | `instrucciones` | Art. 26.1 | alta | no | — |
| 8 | `supervision-humana` | Art. 26.2 (y Art. 14) | alta | no | — |
| 9 | `revision-humana-registro` | Art. 26.2 (+26.6) | alta | no | — |
| 10 | `datos-entrada` | Art. 26.4 | alta | no | — |
| 11 | `logs` | Art. 26.6 | alta | no | — |
| 12 | `monitoreo` | Art. 26.5 | media | no | — |
| 13 | `info-afectado` | Art. 26.11 | alta | no | — |
| 14 | `explicacion` | Art. 86 | alta | no | 2-dic-2027 |
| 15 | `fria` | Art. 27 | alta | no | organismo público / servicio público |
| 16 | `dpia-fria-reutilizacion` | Art. 27.4 | media | no | redacción nueva 27-jul-2026 |
| 17 | `dpia` | GDPR Art. 35 (+ Art. 26.9) | alta | no | — |
| 18 | `decision-automatizada-art22` | GDPR Art. 22 (SCHUFA C-634/21) | alta | no | — |
| 19 | `datos-especiales` | GDPR Art. 9 | alta | no | si hay datos de salud/discapacidad |
| 20 | `no-discriminacion-prestaciones` | Art. 26.4 + antidiscriminación | alta | no | — |
| 21 | `motivacion-recurso` | Derecho administrativo nacional (+ Art. 86) | alta | no | varía por Estado miembro |
| 22 | `registro-bd-ue` | Art. 49.3 (y Art. 26.8) | alta | no | solo autoridad pública o quien actúe en su nombre |
| 23 | `transparencia-art50` | Art. 50 | media | no | solo si hay chatbot/GenAI · 2-ago-2026 |
| 24 | `documentacion` | Art. 13 / Art. 11 y Anexo IV (proveedor) | media | no | — |
| 25 | `gobernanza-datos-sesgo` | Art. 10 (proveedor) | alta | no | — |
| 26 | `exactitud-robustez` | Art. 15 (proveedor) + Art. 26.5 | media | no | — |
| 27 | `rol-proveedor-deployer` | Art. 25 | alta | no | — |
| 28 | `clausulas-contratacion` | Art. 26.1 + Art. 13 (vía contractual) | media | no | — |
| 29 | `conservacion-evidencia` | Art. 26.6 + gobernanza interna | baja | no | — |
| 30 | `emergencias-alcance` | Anexo III.5.d | alta | no | **solo III.5.d** |
| 31 | `emergencias-supervision` | Art. 26.2 + 26.5 | alta | no | **solo III.5.d** |

**Si hay que recortar a ~22** (tamaño de los packs existentes), el orden de corte sugerido es:
`conservacion-evidencia` (29) → `exactitud-robustez` (26) → `vulnerabilidad-socioeconomica` (3) →
fusionar `dpia-fria-reutilizacion` (16) dentro de `fria` (15) → fusionar `clausulas-contratacion`
(28) dentro de `documentacion` (24). **No recortar** 1, 9, 13, 14, 15, 21, 22, 27: son los que
distinguen este pack.

## C. Trampas del vertical

Doce fallos concretos, ordenados por frecuencia × gravedad. Cada uno debería tener reflejo en la
`note` del pack o en la descripción de un control.

### C.1 "Ya tenemos la DPIA, la FRIA está cubierta"

**Falso, aunque ahora se parezca más.** El Art. 27.4 (redacción del Reglamento (UE) 2026/1744)
permite **referencias cruzadas** a la DPIA o **incorporar partes** de ella — no sustituirla. Lo que
la DPIA nunca cubre: derechos fundamentales no relacionados con datos (no discriminación, buena
administración, tutela judicial efectiva, acceso a prestaciones), las **medidas de supervisión
humana** conforme a las instrucciones de uso (27.1.e), la **gobernanza interna y el mecanismo de
reclamación** (27.1.f) y los riesgos **de grupo**. Además la FRIA tiene un deber que la DPIA no
tiene: **notificar los resultados a la autoridad de vigilancia de mercado** (Art. 27.3). Ver control
16.

### C.2 "Somos una administración, el proveedor ya lo trae todo hecho"

Lo que trae el proveedor es su parte: marcado CE, declaración UE de conformidad, documentación
técnica (Art. 11/Anexo IV), instrucciones de uso (Art. 13) y su propio registro (Art. 49.1). **Nada
de eso cubre** tus deberes: designar supervisión (26.2), datos de entrada (26.4), logs (26.6),
informar a los afectados (26.11), FRIA (27), **registrar tu uso** (49.3) y responder a solicitudes de
explicación (86). Son **no delegables** y ninguna cláusula contractual los traslada.

### C.3 El corolario que casi nadie ve: muchas administraciones son **proveedor**, no deployer

Un motor de elegibilidad desarrollado internamente, o encargado a medida y entregado sin marcado CE,
o un LLM general reconfigurado para decidir elegibilidad, convierte a la organización en
**proveedor** (Art. 25.1, y directamente por la definición de proveedor si lo desarrolla). Eso
multiplica las obligaciones: Arts. 9-15, evaluación de la conformidad, marcado CE, registro del
sistema. Es la trampa **más cara** de este vertical y la que el pack debe poner temprano (control 27).

### C.4 Usar una puntuación general del ciudadano para decidir prestaciones (Art. 5.1.c)

Frontera fina y consecuencias máximas: no es una brecha, es una **prohibición** con multas de hasta
35 M€ o el 7 % del volumen de negocio (Art. 99). El error típico no es diseñar un "sistema de crédito
social": es reutilizar un score construido para otra cosa (impagos municipales, absentismo, historial
de incidencias) para decidir una ayuda. Eso es literalmente el supuesto (i) del Art. 5.1.c: trato
desfavorable en **contextos sociales no relacionados** con aquellos en los que se generaron los datos.

**Precedente real:** el 5-feb-2020 el **Tribunal de Distrito de La Haya** paralizó **SyRI**, el
sistema neerlandés de detección de fraude en prestaciones que cruzaba bases de datos públicas para
predecir la probabilidad de fraude, por vulnerar el **Art. 8 CEDH** (la legislación no superaba el
test de necesidad y proporcionalidad); se desplegaba además de forma concentrada en barrios de renta
baja y con alta proporción de población migrante. Es anterior al AI Act y se resolvió por privacidad,
no por el Art. 5 — pero describe exactamente el sistema que hoy caería en III.5.a y rozaría el
Art. 5.1.c/5.1.d. Úsalo como advertencia, **no como precedente del AI Act**.
*(También suele citarse el caso neerlandés de las ayudas a la infancia —"toeslagenaffaire"—; sus
detalles y las sanciones concretas **no se verificaron en esta pasada**: no citar cifras.)*

### C.5 Supervisión humana **nominal**: el fallo más común y el más indefendible

Un tramitador que firma el 100 % de lo que propone el sistema, con 4 minutos por expediente y sin
autoridad práctica para apartarse, **no es supervisión humana**: es una firma. Ante una auditoría es
el hallazgo más difícil de rebatir porque los propios datos de la organización lo demuestran (cero
desviaciones). Y tiene doble filo: activa además el **Art. 22 del RGPD** — si el resultado del sistema
tiene "papel determinante" (razonamiento de **SCHUFA, C-634/21**), la decisión es, a efectos
prácticos, únicamente automatizada por mucho que haya una persona firmando. **Antídoto:** el control
9 (`revision-humana-registro`), medir y registrar la tasa de desviación.

### C.6 Creer que la excepción de fraude salva el sistema antifraude

La excepción de "detección de fraude financiero" está en **III.5.b** (solvencia), **no en III.5.a**.
Un sistema que detecta irregularidades en prestaciones y desemboca en **reducir, revocar o
reclamar** cae de lleno en la letra (a), que menciona esos tres verbos expresamente. Es un error
frecuente porque el pack `credito-seguros` sí tiene ese control (`exencion-fraude`) y se traslada por
analogía. **No se traslada.**

### C.7 "Nuestro sistema no decide, solo comprueba requisitos"

Dos razones por las que esto no exime:
1. El **Art. 26.11** habla de sistemas que "make decisions **or assist** in making decisions" — la
   obligación de informar al afectado se activa con la asistencia.
2. El **Art. 6.3 párr. 2** cierra la excepción de "tarea procedimental estrecha" siempre que haya
   **perfilado de personas físicas**, que es lo que hace casi cualquier motor de elegibilidad que
   combine características personales.

### C.8 Confundir el registro del proveedor con el registro del uso

**Dos entradas distintas** en la base de datos de la UE: el proveedor registra el **sistema**
(Art. 49.1); el deployer público se registra **a sí mismo y registra su uso** (Art. 49.3). Y el
Art. 26.8 añade que, si el sistema no figura registrado, el deployer **no debe usarlo**. Además, para
el punto 5 del Anexo III el registro va a la sección **pública** (la sección reservada es solo para
los puntos 1, 6 y 7): tu uso será visible, lo que sube el listón de calidad de lo que declares.

### C.9 Datos administrativos desactualizados: la causa real de las denegaciones injustas

En este vertical el fallo rara vez es el modelo: es que el **padrón** está desfasado, la unidad de
convivencia mal codificada o el dato de renta corresponde a un ejercicio antiguo. El Art. 26.4 pone
esto en el tejado del deployer ("input data … relevant and sufficiently representative", en la medida
en que lo controle). Además es lo que convierte un error técnico en una **resolución anulable**.

### C.10 "Servicios esenciales" leído como "cualquier servicio esencial, también privado"

Ver §A.5. Una comercializadora eléctrica no está en III.5.a. Puede estar en III.5.b si su decisión se
basa en evaluar solvencia. El Recital 58 protege el acceso a luz, vivienda y telecomunicaciones **a
través** del control del scoring crediticio, no creando una categoría de "utilities". Si el pack no
lo dice en la primera línea, atraerá al cliente equivocado.

### C.11 Borrar los logs a los seis meses exactos

Seis meses es el **mínimo** del Art. 26.6, no el plazo correcto. En prestaciones públicas los plazos
de recurso, revisión de oficio y responsabilidad patrimonial suelen superarlo con holgura: quien borre
al día 181 puede quedarse sin poder reconstruir la resolución que le están impugnando. Fija el plazo
por el plazo de impugnación aplicable.

### C.12 Leer "2 de diciembre de 2027" como "no hay que hacer nada"

Tres motivos por los que es falso: (1) el **Art. 5** (prohibiciones) y el **Art. 4** (alfabetización)
ya son exigibles desde el 2-feb-2025 y **no se aplazaron**; (2) el **Art. 50** aplica desde el
2-ago-2026; (3) en el sector público el **ciclo de contratación** —pliego, licitación, adjudicación,
despliegue— dura de 12 a 24 meses: si las cláusulas del control 28 no entran en el pliego de **este**
año, el sistema llegará a diciembre de 2027 sin la evidencia que hará falta. La ventana real de
actuación es ahora, no en 2027.

---

## D. Plazos

### D.1 ⚠️ HALLAZGO PRINCIPAL: el Digital Omnibus **ya se publicó en el DOUE**

Esto **resuelve el checkpoint abierto** en `MEMORY.md` §10 (entrada de 2026-07-25 del pack
`educacion`), que dejaba la fecha de 2027 como "adoptada y firmada pero pendiente de publicación".

| Dato | Valor | Certeza |
|---|---|---|
| Norma | **Reglamento (UE) 2026/1744** del Parlamento Europeo y del Consejo, **de 8 de julio de 2026**, por el que se modifican los Reglamentos (UE) 2024/1689, (UE) 2018/1139 y (UE) 2023/1230 en lo relativo a la simplificación de la aplicación de las normas armonizadas sobre inteligencia artificial (*Digital Omnibus on AI*) | **Alta** — título tomado de la ficha ELI de EUR-Lex |
| Publicación en el DOUE | **24 de julio de 2026** | **Alta** — EUR-Lex + confirmado por la Comisión y por varias firmas |
| Entrada en vigor | **27 de julio de 2026** (tercer día siguiente al de su publicación, por urgencia — Considerando 46) | **Alta** |

**Consecuencia editorial inmediata (acción de producto):** los **7 packs existentes** y la `note` del
pack `educacion` dicen "*sujeto a publicación en el DOUE*" / "*confirma su publicación antes de
planificar sobre 2027*". **Ese matiz ya está obsoleto desde el 24-jul-2026** y ahora resta credibilidad
en lugar de sumarla. Hay que actualizarlo a la referencia firme: *"aplazado al 2-dic-2027 por el
Reglamento (UE) 2026/1744 (DOUE 24-jul-2026, en vigor 27-jul-2026)"*. El pack nuevo debe nacer ya con
la redacción firme.

### D.2 Calendario aplicable a este vertical

| Fecha | Qué aplica | Relevancia para III.5.a/d | Certeza |
|---|---|---|---|
| **2-feb-2025** | **Art. 5** (prohibiciones) y **Art. 4** (alfabetización), Caps. I y II | Controles 1, 2, 3 y 6 son **exigibles hoy**. No esperan a 2027 | Alta |
| **2-ago-2025** | Gobernanza, GPAI, sanciones (salvo las de GPAI) | Contexto | Alta |
| **27-jul-2026** | Entrada en vigor del Reglamento (UE) 2026/1744. **Nueva redacción del Art. 4** (obligación de medios) y **nueva redacción del Art. 27.4** (referencias cruzadas a la DPIA) | Afecta a los controles 6 y 16 — **cambio de hace tres días** | Alta (texto verificado en EUR-Lex) |
| **2-ago-2026** | Fecha general de aplicación del AI Act; **Art. 50** (transparencia) | Control 23, si hay chatbot o contenido generado | Alta |
| **2-dic-2026** | Plazo del **Art. 50.2** (marcado legible por máquina de contenido sintético) para sistemas ya comercializados antes del 2-ago-2026 (vía Art. 111.4) · nuevas prohibiciones del Art. 5 sobre material íntimo no consentido y CSAM | Marginal aquí | **Media** — coincidente en varias fuentes secundarias, no verificado contra el articulado |
| **2-dic-2027** | **Secciones 1, 2 y 3 del Cap. III** para sistemas de alto riesgo del **Art. 6.2 y Anexo III** | **La fecha del pack.** Arts. 26, 27 y (por remisión) 86 | Alta |
| **2-ago-2028** | Mismas secciones para el alto riesgo del Art. 6.1 y Anexo I (IA embebida en producto) | No aplica a III.5 | Alta |

### D.3 Lo que **no** se aplazó (y es lo que hace vendible el pack hoy)

- **Art. 5** — prohibiciones. Controles 1, 2 y 3: exigibles desde el 2-feb-2025.
- **Art. 4** — alfabetización. Se **reescribió**, no se aplazó; la versión suavizada aplica desde el
  27-jul-2026 y sigue siendo vinculante para todo deployer.
- **Art. 50** — transparencia: 2-ago-2026.
- **RGPD** — Arts. 5, 9, 13-14, 22 y 35: plenamente aplicables **desde 2018**. Los controles 17, 18 y
  19 no tienen ninguna fecha futura detrás; son deberes vencidos.

> **Mensaje honesto para la UI:** *"El grueso del régimen de alto riesgo llega el 2-dic-2027, pero
> tres bloques de este pack ya son exigibles hoy (prohibiciones del Art. 5, alfabetización del
> Art. 4 y todo el bloque RGPD), y el ciclo de contratación pública es más largo que la ventana que
> queda."* Esto es preparación, no alarmismo.

### D.4 ⚠️ Incertidumbre relevante sobre fechas: el **Art. 49** (registro)

El Art. 113(2) modificado aplaza expresamente las **Secciones 1, 2 y 3** del Cap. III. El **Art. 49
está en la Sección 5** del Cap. III ("Normas, evaluación de la conformidad, certificados, registro"),
que **no aparece en la lista de secciones aplazadas** — lo que literalmente dejaría el deber de
registro del Art. 49.3 aplicándose desde el **2-ago-2026**, antes que las obligaciones sustantivas
que lo acompañan.

**No he podido verificar el texto íntegro del Art. 113 modificado** (EUR-Lex devuelve el documento
truncado para esta consulta). La lectura anterior es una **inferencia estructural, certeza media**.
**Recomendación para el pack:** en el `conditional` del control 22 escribir *"verifica la fecha
aplicable de registro: el aplazamiento del Reglamento (UE) 2026/1744 alcanza expresamente a las
Secciones 1, 2 y 3 del Cap. III, y el Art. 49 está en la Sección 5"* — es honesto y además es
accionable. **No** afirmar "2-dic-2027" para el registro sin comprobarlo.

---

## E. Solape con packs existentes

| Pack existente | Ámbito | Solape con el pack nuevo | Veredicto |
|---|---|---|---|
| `credito-seguros` | **Anexo III.5.b y III.5.c** | **El solape es de vecindad, no de contenido.** Comparten el tronco de controles del deployer (26.x, 27, 86) pero el caso de uso, el sujeto y las trampas son distintos | **No fusionar.** Sí añadir un puntero cruzado: "si tu decisión se basa en solvencia, tu pack es `credito-seguros`" |
| `educacion` | Anexo III.3 | **El solape más alto.** Ambos tienen deployer público, FRIA aplicable, registro en la BD de la UE y Art. 86 fuerte. ~13 de 31 controles son análogos | **No fusionar.** Las becas concedidas por una administración pueden tocar los dos: `educacion` si además decide **admisión o itinerario**; el nuevo si decide **la ayuda económica** |
| `rrhh` | Anexo III.4.a (reclutamiento) | Solo el tronco genérico. Una administración que selecciona personal usa `rrhh`, no este | **Sin conflicto** |
| `gestion-trabajadores` | Anexo III.4.b | Igual | **Sin conflicto** |
| `atencion-cliente-genai` | Art. 50 / GenAI | Un chatbot de la administración que **solo informa** pertenece a ese pack; si **evalúa elegibilidad**, al nuevo | **Sin conflicto**, con puntero cruzado en ambos sentidos |
| `us-hiring`, `us-ca-feha`, `us-ca-admt`, `us-co-admt` | EE. UU., empleo/ADMT | Ninguno | **Sin conflicto**. *(Nota: el encargo mencionaba 8 packs; en `index.ts` hay 9 — `us-co-admt` (Colorado) también está registrado)* |

### E.1 Qué es genuinamente nuevo en este pack

Ocho cosas que **no existen en ningún pack actual**:

1. **`puntuacion-social-prohibicion` (Art. 5.1.c)** — ningún pack aborda hoy la frontera
   elegibilidad/puntuación social. Es la aportación regulatoria más valiosa del pack.
2. **`riesgo-penal-perfilado` (Art. 5.1.d)** — el Art. 5.1.d no aparece en ningún pack.
3. **`revision-humana-registro`** — medir la tasa de desviación como prueba anti-supervisión-nominal.
4. **`motivacion-recurso`** — el puente con el Derecho administrativo, ausente en todos los packs
   porque hasta ahora ninguno tenía deployer público como caso central.
5. **`clausulas-contratacion`** — el pliego como momento de control; específico del sector público.
6. **`dpia-fria-reutilizacion` (Art. 27.4 modificado)** — norma de hace tres días; ningún pack la
   recoge.
7. **El bloque III.5.d** (controles 30-31) — emergencias, terreno virgen.
8. **La regla de deslinde de A.5** ("servicios esenciales privados no entran por 5.a") — hoy no está
   escrita en ninguna parte del producto y es la confusión nº 1 del punto 5.

### E.2 Efecto sobre el callejón sin salida del clasificador

El clasificador ya devuelve "alto riesgo" cuando el usuario elige el área de servicios esenciales.
Con este pack, ese veredicto pasa a tener destino en `/dashboard/packs`. **Recomendación adicional:**
si el clasificador distingue las letras de III.5, enrutar 5.b/5.c → `credito-seguros` y 5.a/5.d → el
pack nuevo. Si **no** las distingue, ese es el bug real que hay que arreglar junto con el pack: una
sola opción "servicios esenciales" que lleva a dos packs distintos volvería a dejar al usuario
eligiendo a ciegas.

---

## F. Fuentes

### F.1 Primarias (base de todas las afirmaciones de §A y §B)

| Fuente | Qué se verificó aquí | URL |
|---|---|---|
| **Reglamento (UE) 2026/1744** — *Digital Omnibus on AI*, ficha ELI de EUR-Lex | Título, fecha (8-jul-2026), publicación en DOUE (24-jul-2026), entrada en vigor (27-jul-2026), aplazamiento de las Secciones 1-3 del Cap. III a 2-dic-2027 (Anexo III) y 2-ago-2028 (Anexo I) | https://eur-lex.europa.eu/eli/reg/2026/1744/oj |
| **Reglamento (UE) 2026/1744** — texto HTML en EUR-Lex | **Texto literal** del Art. 4 modificado y del **Art. 27.4** modificado (referencias cruzadas a la DPIA) y del Art. 27.5 (plantilla de la Oficina de IA) | https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ%3AL_202601744 |
| **Comisión Europea** — *Shaping Europe's digital future*, marco regulador de la IA | Confirmación oficial de las nuevas fechas: Anexo III desde 2-dic-2027; Anexo I desde 2-ago-2028 | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai |
| **AI Act Explorer — Anexo III** (texto del Reglamento (UE) 2024/1689) | **Texto literal** de III.5.a, b, c, d y del chapeau; texto de III.3 para el deslinde con `educacion` | https://artificialintelligenceact.eu/annex/3/ |
| **AI Act Explorer — Art. 5** | Texto de 5.1.a, 5.1.b, 5.1.c (con (i) y (ii)) y 5.1.d con su excepción | https://artificialintelligenceact.eu/article/5/ |
| **AI Act Explorer — Recital 31** | Carve-out: la prohibición de puntuación social no afecta a prácticas lícitas de evaluación con finalidad específica conforme al Derecho de la Unión y nacional | https://artificialintelligenceact.eu/recital/31/ |
| **AI Act Explorer — Recital 58** | Fundamento del punto 5: acceso a recursos financieros y a servicios esenciales (vivienda, electricidad, telecomunicaciones) **vía** scoring crediticio; riesgo de perpetuar patrones históricos de discriminación; exclusión de la detección de fraude y del cálculo de capital prudencial | https://artificialintelligenceact.eu/recital/58/ |
| **AI Act Explorer — Art. 26** | Texto de 26.1, 26.2, 26.4, **26.6 (los "at least six months")**, 26.5, 26.8, 26.9, **26.11** | https://artificialintelligenceact.eu/article/26/ |
| **AI Act Explorer — Art. 27** | Ámbito del 27.1 (organismos de Derecho público, entidades privadas que prestan servicios públicos, y deployers de III.5.b y 5.c; excepción del punto 2), contenido a–f, 27.2, 27.3 | https://artificialintelligenceact.eu/article/27/ |
| **AI Act Explorer — Art. 49** | Texto de 49.1, 49.2, **49.3** (registro del deployer público y de su uso), 49.4 (sección no pública solo para los puntos 1, 6 y 7), 49.5 | https://artificialintelligenceact.eu/article/49/ |
| **AI Act Explorer — Art. 50** | Deberes de transparencia que recaen sobre el **deployer** (50.3, 50.4 y su párr. 2 sobre texto de interés público) | https://artificialintelligenceact.eu/article/50/ |
| **AI Act Explorer — Art. 25** | Condiciones (a), (b), (c) por las que un deployer pasa a considerarse **proveedor**; deberes del proveedor inicial (25.2) | https://artificialintelligenceact.eu/article/25/ |
| **AI Act Explorer — Art. 86** | Texto íntegro de 86.1, 86.2 y 86.3; confirmación de que la **única exclusión es el punto 2** del Anexo III | https://artificialintelligenceact.eu/article/86/ |

> Nota sobre `artificialintelligenceact.eu`: es el *AI Act Explorer* del **Future of Life Institute**,
> que reproduce el texto del Reglamento. Se trata como **primaria para el texto legal** y se usó
> EUR-Lex para todo lo relativo al Reglamento modificativo de 2026. **Antes de publicar el pack en
> producción conviene contrastar las citas ES contra el DOUE en español.**

### F.2 Secundarias (contexto, contraste y fechas — nunca base única de una afirmación)

| Fuente | Uso |
|---|---|
| NicFab, *Digital Omnibus on AI: Regulation (EU) 2026/1744 Is Published in the Official Journal* — https://www.nicfab.eu/en/posts/digital-omnibus-ai-official-journal/ | Contraste de fechas y del alcance de los cambios (Art. 4, Art. 27, Art. 111.4/50.2, Art. 113) |
| Orrick, *EU AI Act Update: Digital Omnibus Finalizes 8 Compliance Changes* — https://www.orrick.com/en/Insights/2026/07/EU-AI-Act-Update-Digital-Omnibus-Finalizes-8-Compliance-Changes | Lista de los 8 cambios; confirma que **no** se tocaron los Arts. 26, 49 ni el Anexo III |
| Hunton, *EU Digital Omnibus on AI Enters Into Force* — https://www.hunton.com/privacy-and-cybersecurity-law-blog/eu-digital-omnibus-on-ai-enters-into-force | Contraste del calendario |
| ASIL, *Netherlands District Court Rules Benefits Fraud Detection Tool Violates Human Rights* — https://asil.org/ilib/netherlands-district-court-rules-benefits-fraud-detection-tool-violates-human-rights/ | Caso **SyRI** (Tribunal de Distrito de La Haya, 5-feb-2020, Art. 8 CEDH) |
| Privacy International, *The SyRI case* — https://privacyinternational.org/news-analysis/3363/syri-case-landmark-ruling-benefits-claimants-around-world | Contraste del caso SyRI y su despliegue focalizado |
| van Bekkum & Zuiderveen Borgesius, *Digital welfare fraud detection and the Dutch SyRI judgment*, European Journal of Social Security (2021) — https://journals.sagepub.com/doi/full/10.1177/13882627211031257 | Análisis académico del caso |
| Securiti, ficha del Art. 27 — https://securiti.ai/eu-ai-act/article-27/ | Contraste del ámbito subjetivo del Art. 27.1 |

### F.3 No verificado en esta pasada (deuda explícita)

1. **Texto oficial en español** de III.5.a, III.5.d y de los artículos citados (se trabajó sobre el
   texto EN). Antes de publicar: pegar la redacción ES del DOUE.
2. **Encabezado literal del punto 5** del Anexo III ("Access to and enjoyment of essential private
   services and essential public services and benefits") — el razonamiento de §A.5 no depende de él,
   pero no debe reproducirse en la UI sin comprobarlo.
3. **Texto íntegro del Art. 113 modificado** → de ahí la incertidumbre de §D.4 sobre la fecha del
   Art. 49.
4. **Caso neerlandés de las ayudas a la infancia (toeslagenaffaire)**: no se verificaron sanciones ni
   cifras. No citarlas.
5. **Sin jurisprudencia del TJUE** específica sobre Art. 22 RGPD y prestaciones sociales; se traslada
   el razonamiento de SCHUFA (C-634/21) como criterio interpretativo, no como resolución de un caso
   idéntico.
6. **Directrices de la Comisión** sobre prácticas prohibidas (feb-2025) y sobre la clasificación de
   alto riesgo: no se consultaron en esta pasada. Serían la mejor fuente adicional para afinar la
   frontera del Art. 5.1.c y merecen una segunda pasada antes de GA.

---

## Aviso final

Este memorándum es **orientación de compliance, no asesoría legal**. Attesta **no certifica**, no
declara conformidad ni emite veredictos de aptitud: el contenido está pensado para que **la
organización cliente** documente su propia autoevaluación y prepare evidencia para una auditoría.
Toda afirmación regulatoria debe ser revisada por asesoría jurídica propia antes de tomar decisiones,
y las incertidumbres señaladas en §D.4 y §F.3 deben resolverse antes de publicar el pack.
