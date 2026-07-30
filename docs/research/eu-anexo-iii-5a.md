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

*(en elaboración — se añade a continuación)*

## C. Trampas del vertical

*(en elaboración)*

## D. Plazos

*(en elaboración)*

## E. Solape con packs existentes

*(en elaboración)*

## F. Fuentes

*(en elaboración)*
