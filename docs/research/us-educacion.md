# Memorándum de investigación regulatoria — IA en educación, EE. UU.

**Para:** equipo Attesta (construcción del policy pack `us-educacion`)
**Fecha del snapshot:** 2026-07-30
**Objeto:** establecer el derecho vigente en EE. UU. sobre privacidad estudiantil + antidiscriminación aplicado a sistemas de IA, y definir el contenido del pack.
**ICP:** el **deployer** — centro educativo, distrito escolar (LEA), universidad, o la EdTech que despliega IA *para* ellos. Cuando una obligación recae sobre el proveedor, se reencuadra como *"exige y conserva evidencia contractual del proveedor"*.
**Naturaleza:** orientación de compliance para autoevaluación y preparación de evidencia. **No es asesoría legal.** Todo el contenido debe pasar por revisión de abogado de EE. UU. (privacidad estudiantil / derecho educativo) antes de GA.

> **Estado del documento: COMPLETO** (A-F). Escrito de forma incremental y verificado contra fuente
> primaria salvo donde se marca lo contrario. Los límites de método están en **§E.4** y las
> incertidumbres que más pesan, en **§F.3**. Nada marcado como *zona gris* o *pendiente de verificación
> primaria* debe pasar a copy de producto sin revisión.

---

## 0. Hallazgos de primer orden (lo que cambia decisiones)

1. **La regla COPPA revisada está HOY plenamente exigible.** Publicada el **22-abr-2025**, efectiva el
   **23-jun-2025**, con **fecha de cumplimiento pleno el 22-abr-2026** — que ya pasó hace tres meses. No es
   "lo que viene": es derecho aplicable con acción de la FTC detrás. Certeza **alta**. → El pack debe
   tratar COPPA como **exigible ya**, no como horizonte.
2. **El punto más citable y más vendible del pack: el consentimiento separado para entrenar IA.** La regla
   revisada exige **consentimiento parental verificable SEPARADO** para *divulgar* datos de un menor a
   terceros cuando esa divulgación no es *integral* al servicio; y la FTC declaró en el preámbulo que
   divulgar datos de menores **para entrenar o desarrollar tecnologías de IA no es *integral*** al
   servicio. Traducción operativa: **el consentimiento para usar la app NO cubre el entrenamiento del
   modelo del proveedor.** Ver §B y la trampa C.1 — con el matiz importante del **hueco del uso interno**.
3. **Aquí no hay clasificación de riesgo.** A diferencia del pack UE (Anexo III.3 ⇒ alto riesgo ⇒ Arts. 26/27),
   EE. UU. no clasifica el sistema: regula **qué datos tocas, con qué permiso, con qué contrato y con qué
   efecto discriminatorio**. El pack se estructura por **datos + contrato + equidad**, no por nivel de riesgo.
4. **El corazón del pack es la *school official exception* de FERPA** (`34 CFR § 99.31(a)(1)`): es lo que
   permite a un centro dar datos de estudiantes a una EdTech sin consentimiento de los padres — y solo se
   sostiene si el centro conserva **control directo** sobre el uso y el mantenimiento de esos datos. Un
   contrato estándar de proveedor **no** la satisface por sí solo. El centro **sigue siendo el responsable**.
5. **El sujeto obligado cambia según la norma, y eso hay que decirlo en cada control.** FERPA obliga al
   **centro/agencia educativa** que recibe fondos del ED. COPPA obliga al **operador** del servicio online.
   SOPIPA obliga al **operador** de un servicio K-12, no al centro. Un mismo cliente puede estar en los tres
   lados. → La **condicionalidad es obligatoria** en cada control de este pack.

---

## A. Mapa de aplicabilidad

> **Cómo leer esta tabla.** EE. UU. **no tiene ley federal de IA en educación**. Lo que hay es un
> mosaico: privacidad estudiantil federal + leyes estatales + antidiscriminación + accesibilidad, más
> guía no vinculante. Un mismo centro puede estar sujeto a **varias a la vez y en papeles distintos**
> (sujeto obligado en una, beneficiario de la protección en otra).

| # | Norma | ¿A quién obliga? | ¿Qué la activa? | Vigente desde | Quién la aplica |
|---|---|---|---|---|---|
| 1 | **FERPA** — 20 U.S.C. § 1232g; 34 CFR Part 99 | La **agencia o institución educativa** (distrito, colegio, universidad). El proveedor solo queda alcanzado **indirectamente**, vía la *school official exception* y el límite de redivulgación del § 99.33(a) | Recibir fondos bajo **cualquier programa administrado por el Secretario de Educación** de EE. UU. (incluye la práctica totalidad de K-12 públicos y de universidades con ayuda federal al estudiante, públicas y privadas) | 1974 (regs. 34 CFR Part 99) | **ED / Student Privacy Policy Office**. Sanción última: retirada de fondos federales. **No hay acción privada** (*Gonzaga Univ. v. Doe*, 536 U.S. 273 (2002)) |
| 2 | **PPRA** — 20 U.S.C. § 1232h; 34 CFR Part 98 | LEAs y centros que reciben fondos del ED | Encuestas sobre las **8 áreas protegidas** (creencias políticas, salud mental, conducta sexual, religión, etc.); recogida de datos de alumnos **para marketing**; exámenes físicos invasivos | 1978; ampliada por NCLB (2002) | ED / SPPO. Sin acción privada |
| 3 | **COPPA** — 15 U.S.C. §§ 6501-6506; **Regla: 16 CFR Part 312** | El **operador** del sitio/servicio online (típicamente la **EdTech**, no el centro). Un centro puede ser operador si opera su propio servicio online dirigido a <13 | Servicio online **dirigido a menores de 13** o con **conocimiento efectivo** de que recoge datos personales de un <13 | Ley 1998. **Regla revisada: publicada 22-abr-2025, efectiva 23-jun-2025, cumplimiento pleno exigible desde el 22-abr-2026** → **ya exigible hoy** | **FTC** + **fiscales generales estatales** (15 U.S.C. § 6504). Multa civil por infracción |
| 4 | **SOPIPA** — Cal. B&P Code §§ 22584-22585 | El **operador** de un sitio/servicio *"usado primariamente para fines escolares K-12 y diseñado y comercializado para fines escolares K-12"*, **con conocimiento efectivo**. **NO obliga al centro** | Nexo con California + ese perfil de servicio | 1-ene-2016 | Fiscal general de California / fiscales de distrito (UCL). Sin acción privada expresa en el propio § 22584 |
| 5 | **Leyes estatales de privacidad estudiantil** (~40 estados; SOPIPA es el arquetipo y ha sido copiada en buena parte) | Varía por estado: unas al **proveedor**, otras al **LEA**, muchas a ambos | Nexo con el estado (estudiantes residentes / contrato con LEA del estado) | Varía (mayoría 2014-2020) | Fiscal general estatal; algunas con deberes de inventario/publicación de contratos |
| 6 | **Title VI** — 42 U.S.C. § 2000d; 34 CFR Part 100 | Cualquier **receptor de asistencia financiera federal** | Discriminación por **raza, color u origen nacional**, incl. **impacto dispar** vía la regulación del § 100.3(b)(2) | 1964 | **ED / OCR**, DOJ. ⚠️ Ver §B.14 sobre el estado del impacto dispar |
| 7 | **Title IX** — 20 U.S.C. § 1681; 34 CFR Part 106 | Programas educativos que reciben fondos federales | Discriminación **por sexo** | 1972 | ED / OCR; **sí hay acción privada** implícita |
| 8 | **Section 504** — 29 U.S.C. § 794; 34 CFR Part 104 | Receptores de asistencia financiera federal | Discriminación por **discapacidad**; deber de **ajustes razonables** y comunicación accesible | 1973 | ED / OCR; acción privada |
| 9 | **ADA Título II** — 42 U.S.C. §§ 12131 ss.; 28 CFR Part 35 | **Entidades públicas**: distritos públicos, universidades públicas — **con o sin fondos federales** | Ser entidad pública estatal o local | 1990. **Regla web: 28 CFR §§ 35.200-35.205 (publicada 24-abr-2024), estándar WCAG 2.1 AA. Fechas de cumplimiento PRORROGADAS un año por regla interina del DOJ (Federal Register, 20-abr-2026): 26-abr-2027 (población ≥50.000) y 26-abr-2028 (resto y distritos especiales)** | DOJ; acción privada |
| 10 | **ADA Título III** — 42 U.S.C. §§ 12181 ss.; 28 CFR Part 36 | **Public accommodations**, incluidas escuelas y universidades **privadas** | Ser establecimiento privado del listado (incl. *"nursery, elementary, secondary, undergraduate, or postgraduate private school"*) | 1990 | DOJ; acción privada |
| 11 | **BIPA (Illinois)** — 740 ILCS 14 | **Entidades privadas** que recogen identificadores biométricos en Illinois | Recoger huella, escaneo facial/retina, geometría de mano o **voiceprint** — típico de **proctoring** y control de acceso | 2008 | **Acción privada con daños legales tasados** — el riesgo litigioso más real del vertical |
| 12 | **Guía federal de IA en educación** — informe OET *"AI and the Future of Teaching and Learning"* (may-2023); *Dear Colleague Letter* del ED sobre uso de fondos federales en IA (22-jul-2025) | Nadie, en sentido estricto | — | 2023 / 2025 | **GUÍA, NO LEY.** Útil como estándar de diligencia y como condición práctica de elegibilidad de fondos, no como obligación autónoma |

### Qué NO está en esta tabla, y por qué

- **No hay ley federal de IA en educación.** Ni clasificación por riesgo, ni evaluación de impacto
  obligatoria, ni registro. Cualquier copy que sugiera lo contrario es falso.
- **Leyes estatales generales de privacidad del consumidor** (CCPA/CPRA, VCDPA, CPA…): la mayoría
  **exceptúa** los datos cubiertos por FERPA y/o a las instituciones sin ánimo de lucro. No se
  incluyen aquí para no inflar el pack; se tratan en los packs `us-ca-*`. *(Certeza media: el alcance
  exacto de las exenciones FERPA varía por estado y no se ha verificado estado por estado.)*
- **Leyes estatales de IA de propósito general** (p. ej. Colorado ADMT, SB 26-189, exigible 1-ene-2027):
  su *covered domain* **incluye expresamente matrícula y oportunidad educativa**. Ese contenido vive en
  el pack de Colorado, no aquí, pero conviene un enlace cruzado en producto.

---

## B. Controles, uno por uno

> **Convenciones.**
> `id` en el estilo de los packs existentes (prefijo `us-edu-`). `article` corto para `gap_items.article`.
> **Severidad — criterio explícito:**
> **alta** = exigible **hoy** y con consecuencia directa identificable (retirada de fondos federales, acción
> de la FTC o de un fiscal general, o demanda con acción privada);
> **media** = exigible pero de consecuencia indirecta o documental de soporte, **o** condicionada a un
> hecho que muchos clientes no cumplirán;
> **baja** = higiene y buena práctica alineada con guía no vinculante.
> Los verbos son **de la organización cliente** ("tu organización declara/exige/conserva"), nunca de Attesta.

### B.0 Transversal

#### `us-edu-alcance-normativo` — Determina qué normas te aplican y déjalo por escrito
- **Qué hacer:** responde y documenta **cinco preguntas** con fecha y responsable: (1) ¿la organización
  recibe fondos bajo algún programa administrado por el Secretario de Educación de EE. UU.? → FERPA y PPRA;
  (2) ¿opera algún sitio o servicio online **dirigido a menores de 13** o del que tenga conocimiento
  efectivo de que recoge datos de <13? → COPPA como **operador**; (3) ¿es una **entidad pública**
  estatal o local? → ADA Título II (incluida la regla web); si es privada, ADA Título III;
  (4) ¿tiene estudiantes o contratos en **California**, **Illinois**, u otros estados con ley de
  privacidad estudiantil? → SOPIPA y equivalentes; (5) ¿algún sistema de IA toca datos de estudiantes
  **de Illinois** mediante rasgos biométricos? → BIPA.
- **Evidencia que deja:** ficha de alcance normativo por organización (no por sistema), revisada al menos
  anualmente y al firmar cada contrato nuevo de EdTech.
- **Cita:** `20 U.S.C. § 1232g(a)(3)`; `16 CFR § 312.2`; `42 U.S.C. § 12131`; `Cal. B&P § 22584(a)`
- **Severidad:** alta — de esta ficha cuelga la condicionalidad de todo el pack.
- **Condicionalidad:** ninguna. Es el control raíz.

#### `us-edu-inventario-ia-estudiantes` — Inventario de sistemas de IA que tocan datos de estudiantes
- **Qué hacer:** por cada sistema del inventario que procese datos de estudiantes, registra: proveedor,
  finalidad educativa declarada, **categorías de datos** que recibe, si genera puntuaciones o inferencias
  sobre estudiantes, si esos datos salen del entorno del centro, subprocesadores conocidos, y si el
  proveedor los usa para **mejorar su producto o entrenar modelos**. Esa última columna es la que activa
  la mitad de los controles de este pack.
- **Evidencia que deja:** el propio inventario con la columna de "uso secundario por el proveedor"
  respondida **por escrito por el proveedor**, no rellenada por suposición del centro.
- **Cita:** no hay mandato federal directo de inventario. Se apoya en el deber de **control directo** del
  `34 CFR § 99.31(a)(1)(i)(B)(2)` y en el `16 CFR § 312.8(c)` (diligencia sobre terceros).
- **Severidad:** media — no es un deber autónomo, pero sin él ningún otro control es demostrable.
- **Condicionalidad:** ninguna.

---

### B.1 FERPA — **solo si la organización recibe fondos federales del ED**

#### `us-edu-ferpa-school-official` — Designa al proveedor como *school official* con control directo (o consigue consentimiento)
- **Qué hacer:** este es **el corazón del pack**. Dar datos de estudiantes a una EdTech sin consentimiento
  de padres/estudiante elegible solo es lícito si el proveedor encaja en la *school official exception*, y
  esa excepción tiene **tres condiciones acumulativas** que hay que poder demostrar una por una:
  (1) el proveedor **presta un servicio o función institucional para la que el centro usaría empleados**;
  (2) está **bajo control directo del centro respecto del uso y el mantenimiento** de los expedientes; y
  (3) queda **sujeto al límite de redivulgación** del § 99.33(a).
  "Control directo" no es una firma: se demuestra con cláusulas que digan que el centro **determina las
  finalidades**, que el proveedor **no puede usar los datos para fines propios**, que hay **derecho de
  auditoría o de requerir información**, y que el centro puede **ordenar borrado y devolución**.
  Además el centro debe usar **métodos razonables** para que cada school official acceda **solo** a los
  expedientes en los que tiene un interés educativo legítimo (§ 99.31(a)(1)(ii)).
- **Evidencia que deja:** cláusula contractual citada por su número, mapa de roles/permisos del sistema,
  y acta de la revisión que concluyó que el proveedor cumple las tres condiciones.
- **Cita:** `34 CFR § 99.31(a)(1)(i)(B)` y `§ 99.31(a)(1)(ii)`
- **Severidad:** **alta** — es la base legal de la transferencia entera. Si cae, todo el tratamiento del
  proveedor queda sin cobertura.
- **Condicionalidad:** solo centros/agencias con fondos federales del ED **y** que compartan datos con un
  proveedor externo sin consentimiento individual.

#### `us-edu-ferpa-notificacion-anual` — Publica los criterios de "school official" e "interés educativo legítimo"
- **Qué hacer:** la notificación anual de derechos FERPA debe **especificar** los criterios con los que el
  centro determina quién es *school official* y qué es *legitimate educational interest*, e indicar que
  incluye a contratistas externos. Sin ese texto publicado, la excepción se apoya en el aire.
- **Evidencia que deja:** la notificación anual vigente, fechada, con el párrafo de criterios, y prueba de
  su difusión.
- **Cita:** `34 CFR § 99.7(a)(3)(iii)` — **verificada literalmente**: *"If the educational agency or
  institution has a policy of disclosing education records under § 99.31(a)(1), a specification of criteria
  for determining who constitutes a school official and what constitutes a legitimate educational
  interest."* Nótese que el deber **solo nace** si el centro tiene esa política de divulgación — lo que
  encadena este control con `us-edu-ferpa-school-official`.
- **Severidad:** media — documental, pero es lo primero que pide el ED en una queja.
- **Condicionalidad:** igual que el anterior.

#### `us-edu-ferpa-no-redivulgacion` — Prohíbe la redivulgación y lleva el registro de divulgaciones
- **Qué hacer:** el contrato debe prohibir que el proveedor redivulgue PII de expedientes educativos salvo
  instrucción del centro, y el centro debe **mantener el registro** de divulgaciones a terceros con la
  parte receptora y el interés legítimo invocado. Enumera expresamente los subprocesadores autorizados;
  "podrá compartir con afiliadas y socios" es exactamente lo que rompe este control.
- **Evidencia que deja:** cláusula anti-redivulgación, lista cerrada de subprocesadores, y el registro de
  divulgaciones del centro.
- **Cita:** `34 CFR § 99.33(a)`; registro: `34 CFR § 99.32`
- **Severidad:** alta.
- **Condicionalidad:** igual.

#### `us-edu-ferpa-inferencias-como-expediente` — Trata las salidas del sistema sobre un estudiante como expediente educativo
- **Qué hacer:** cuando un sistema de IA genera una **puntuación de riesgo, una predicción, una
  recomendación de intervención o una marca de sospecha** sobre un estudiante concreto, trátala como
  **education record**: guárdala con trazabilidad (qué versión del sistema, con qué datos de entrada,
  cuándo), inclúyela en el alcance del derecho de inspección, y no la dejes viviendo solo en el sistema del
  proveedor sin que el centro pueda recuperarla.
- **Razonamiento y su límite — esto es zona gris, y así hay que venderlo:** el argumento **fuerte** es
  textual: "education records" son los registros (1) **directamente relacionados con un estudiante** y (2)
  **mantenidos por la agencia o institución educativa *o por una parte que actúa por cuenta de ella***. Un
  proveedor amparado por la *school official exception* es, por definición, una parte que actúa por cuenta
  del centro; luego la inferencia que mantiene **encaja en la definición**. FERPA **no distingue** entre
  dato bruto y dato derivado. Lo que **no** existe es una resolución del ED que lo diga con esas palabras
  para salidas de IA: el PTAC ha publicado orientación sobre tecnología y privacidad estudiantil pero **no
  ha emitido una interpretación formal sobre inferencias generadas por IA**. → **Postura recomendada:**
  el pack afirma que la lectura defendible es tratarlas como expediente, **declara que es zona gris**, y
  pide lectura de abogado. No afirmamos que "es" un education record como si estuviera resuelto.
- **Evidencia que deja:** política escrita que define qué salidas del sistema se consideran expediente,
  y una muestra del expediente de un estudiante donde se vea la inferencia registrada.
- **Cita:** `34 CFR § 99.3` (definiciones de *education records* y *personally identifiable information*)
- **Severidad:** alta — si la lectura defendible es la correcta, no tratarlas así rompe a la vez el derecho
  de inspección, el de rectificación y el registro de divulgaciones.
- **Condicionalidad:** solo con fondos federales del ED, **y** solo si algún sistema genera salidas
  individualizadas sobre estudiantes identificables.

#### `us-edu-ferpa-acceso-y-rectificacion` — Vía real de inspección y de rectificación de una inferencia errónea
- **Qué hacer:** garantiza que un padre o estudiante elegible puede (a) **inspeccionar** lo que el sistema
  ha registrado sobre él y (b) **pedir la enmienda** de lo que sea **inexacto, engañoso o lesivo de su
  privacidad**, con decisión en plazo razonable y **derecho a audiencia** si se deniega. Operativamente:
  define quién recibe la solicitud, cómo se recupera el dato **del sistema del proveedor**, y quién decide.
- **Matiz que evita prometer de más:** el derecho de enmienda de FERPA cubre la **inexactitud del
  registro**, y la jurisprudencia ha sido reacia a usarlo para reabrir **juicios sustantivos** del educador
  (p. ej., discutir una nota). Aplicado a IA: se puede exigir corregir *"el sistema registró 14 faltas
  cuando fueron 4"*; es más discutible exigir corregir *"el modelo me puntuó como de alto riesgo"* si esa
  puntuación se documenta como opinión y no como hecho. **Consecuencia de producto:** el control se redacta
  como *"existe una vía de impugnación documentada"*, no como *"el estudiante puede anular la inferencia"*.
- **Evidencia que deja:** procedimiento escrito, formulario/canal, y **registro de solicitudes con su
  resolución** — esto último es lo que un auditor pide y casi nadie tiene.
- **Cita:** `34 CFR §§ 99.10, 99.20, 99.21`
- **Severidad:** alta — es un derecho individual con queja directa ante el ED.
- **Condicionalidad:** fondos federales del ED.

#### `us-edu-ferpa-directory-optout` — Respeta el opt-out de *directory information* también en las alimentaciones de IA
- **Qué hacer:** si el centro designa *directory information*, debe dar aviso público de **qué categorías**
  designa, del **derecho a rechazarlo** y del **plazo para hacerlo**. El fallo específico del vertical:
  el opt-out se respeta en el anuario y en la web, pero **no se propaga** a los exports que alimentan
  herramientas de IA. Propágalo: si un estudiante optó fuera, su ficha no entra en esos flujos.
- **Evidencia que deja:** aviso público vigente, lista de categorías designadas, y **prueba de que la
  marca de opt-out viaja al export** (una captura del filtro o del campo en el mapeo de datos).
- **Cita:** `34 CFR § 99.37`
- **Severidad:** media.
- **Condicionalidad:** fondos federales del ED **y** que el centro use la figura de directory information.

#### `us-edu-ferpa-desidentificacion` — No llames "anonimizado" a lo que no supera el estándar
- **Qué hacer:** si el proveedor dice que usa datos "anonimizados" o "agregados" para entrenar o mejorar,
  exige que el estándar sea el de FERPA: **eliminación de toda PII** *más* una **determinación razonable de
  que la identidad no es identificable**, considerando **otra información razonablemente disponible** y el
  efecto de **divulgaciones múltiples**. Un ID de estudiante sustituido por un código **sigue siendo
  reidentificable** si el código es estable y el proveedor tiene otros datos.
- **Evidencia que deja:** descripción escrita del método de desidentificación aportada por el proveedor,
  y la determinación razonada del centro (o su negativa a aceptarla).
- **Cita:** `34 CFR § 99.31(b)(1)`, y `§ 99.31(b)(2)` para códigos de registro en investigación educativa
- **Severidad:** media-alta — si la desidentificación no se sostiene, la cesión pierde su base y vuelve a
  necesitar consentimiento o la excepción de school official.
- **Condicionalidad:** fondos federales del ED **y** que exista uso secundario declarado por el proveedor.

---

### B.2 COPPA — **solo si tu organización es "operador" de un servicio dirigido a <13**

> **Antes de nada:** en la mayoría de los casos el **operador es la EdTech, no el centro**. Para un centro,
> estos controles se ejecutan casi siempre como **diligencia sobre el proveedor**. Para una EdTech que sea
> nuestro cliente, son deberes propios. El pack debe presentarlos con ese doble encuadre explícito.

#### `us-edu-coppa-rol-operador` — Determina y documenta si eres operador
- **Qué hacer:** decide por escrito, por servicio, si la organización es **operador**: ¿opera un sitio o
  servicio online **dirigido a menores de 13**, o tiene **conocimiento efectivo** de que recoge datos
  personales de un menor de 13? Ojo con la categoría **mixed audience** introducida por la regla revisada.
  Y ojo con la definición ampliada de *personal information*: incluye ahora expresamente **identificadores
  biométricos** (huella, patrón de retina o iris, datos genéticos, **voiceprints**, **plantillas o
  improntas faciales**, patrones de marcha) — relevante para proctoring, control de acceso y asistentes de
  voz en aula.
- **Evidencia que deja:** ficha de determinación por servicio, con la razón.
- **Cita:** `16 CFR § 312.2` (definiciones de *operator*, *website or online service directed to children*,
  *mixed audience website or online service*, *personal information*)
- **Severidad:** alta — decide si aplica el bloque entero.
- **Condicionalidad:** ninguna dentro del bloque; el bloque entero queda condicionado a esta respuesta.

#### `us-edu-coppa-consentimiento-separado-ia` — ★ Consentimiento separado antes de divulgar datos de menores para publicidad dirigida o para entrenar IA
- **Qué hacer:** este es **el control estrella del pack**. La regla revisada exige dar al padre la opción de
  consentir la **recogida y uso** de los datos del menor **sin** consentir su **divulgación a terceros**,
  salvo que esa divulgación sea **integral** al servicio; y cuando hay que dar esa opción, se necesita un
  **consentimiento parental verificable SEPARADO** para la divulgación. En el preámbulo de la regla, la FTC
  se pronunció sobre el punto que nos importa: divulgar datos personales de un menor **para entrenar o
  desarrollar tecnologías de IA no es "integral"** al servicio y, por tanto, **requiere ese consentimiento
  separado**. Operativamente: separa las casillas, registra cada consentimiento con su método de
  verificación y su fecha, y **prohíbe contractualmente** al proveedor cualquier uso de los datos para
  entrenar modelos sin ese consentimiento separado.
- **El hueco que hay que decir en voz alta (y que nos hace creíbles):** la exigencia está construida sobre
  la **divulgación a un tercero**. Si el operador usa los datos de menores para entrenar o mejorar **su
  propio** modelo, sin divulgarlos a nadie, **la letra de esta subsección no lo alcanza**. Eso **no**
  significa que sea libre: siguen aplicando el límite de retención del § 312.10, el deber de aviso del
  § 312.4 y la prohibición general de la sección 5 de la FTC Act sobre prácticas desleales o engañosas —
  y la FTC ha usado la **desgorgación de algoritmos** en otros casos. Pero como control, hay que redactarlo
  distinguiendo los dos supuestos, no fundiéndolos. *(Certeza: **alta** sobre el texto de la regla y la
  existencia de la declaración de la FTC en el preámbulo; **media** sobre la formulación literal exacta de
  esa frase del preámbulo — verificar en el Federal Register antes de citarla entrecomillada en producto.)*
- **Evidencia que deja:** captura del flujo de consentimiento mostrando **dos decisiones separadas**;
  registro de consentimientos (método, fecha, alcance); cláusula contractual de prohibición de
  entrenamiento; y respuesta **escrita del proveedor** a la pregunta "¿usa los datos de nuestros
  estudiantes para entrenar o mejorar sus modelos?".
- **Cita:** `16 CFR § 312.5(a)(2)`; métodos de verificación en `16 CFR § 312.5(b)`
- **Severidad:** **alta** — exigible desde el 22-abr-2026, con la FTC y los fiscales generales estatales
  detrás y multa civil por infracción.
- **Condicionalidad:** solo operadores de servicios dirigidos a <13 (o con conocimiento efectivo).
  Para un centro: se convierte en control de **diligencia contractual**.

#### `us-edu-coppa-autorizacion-escolar` — No des por hecho que el centro puede consentir por los padres
- **Qué hacer:** si el modelo de negocio descansa en que **el colegio autoriza** en lugar del padre,
  documenta expresamente en qué se apoya, porque **no se apoya en la Regla**. En la revisión de 2025 la FTC
  **propuso** codificar una *school authorization exception* (con definiciones de *"school"* y de
  *"school-authorized education purpose"*) y **finalmente NO la codificó**, declarando: *"To avoid making
  amendments to the COPPA Rule that may conflict with potential amendments to DOE's FERPA regulations, the
  Commission is not finalizing the proposed amendments to the Rule related to ed tech and the role of
  schools at this time."* La práctica sigue apoyándose en las **FAQ del personal de la FTC**, que admiten
  que el centro consienta cuando el uso es **exclusivamente educativo**. Verificación por ausencia: las
  excepciones al consentimiento previo del `§ 312.5(c)` **no incluyen** ninguna de autorización escolar.
- **Consecuencia práctica:** la autorización escolar es una **posición de riesgo asumido apoyada en guía de
  personal**, no una excepción reglamentaria. Limita el uso a fines estrictamente educativos, sin
  publicidad ni uso comercial, y **documenta la autorización del centro por escrito** con su alcance.
- **Evidencia que deja:** autorización escrita del centro con alcance delimitado; análisis interno que
  reconozca que la base es guía de personal de la FTC y no la Regla.
- **Cita:** `16 CFR § 312.5(c)` (**por ausencia** de excepción escolar); Statement of Basis and Purpose de la
  regla revisada (90 FR, 22-abr-2025)
- **Severidad:** alta — es una zona gris estructural del vertical, y el cliente debe saber que la asume.
- **Condicionalidad:** solo si se usa autorización escolar en lugar de consentimiento parental.

#### `us-edu-coppa-retencion-escrita` — Política escrita de retención y borrado, publicada
- **Qué hacer:** los datos de un menor **no pueden retenerse indefinidamente**. Hay que **establecer,
  implantar y mantener una política escrita de retención** que diga: (a) **para qué** se recogen, (b) la
  **necesidad de negocio** de conservarlos y (c) el **plazo de borrado**. Y hay que **publicarla en el aviso
  online**. Cuando dejan de ser razonablemente necesarios, se borran con medidas razonables de protección.
- **Evidencia que deja:** la política escrita, el enlace donde está publicada, y **registros de borrado
  ejecutado** (lo que casi nadie tiene: la política sin log de ejecución no demuestra nada).
- **Cita:** `16 CFR § 312.10`, en relación con `§ 312.4(d)`
- **Severidad:** alta — obligación nueva, autónoma, fácil de verificar por la FTC desde fuera (basta mirar
  el aviso publicado) y ya exigible.
- **Condicionalidad:** operadores COPPA.

#### `us-edu-coppa-programa-seguridad` — Programa escrito de seguridad de la información de menores
- **Qué hacer:** mantener un **programa escrito** de seguridad de la información de menores con, como
  mínimo: (1) **designar a uno o más empleados** que lo coordinen; (2) **evaluación anual de riesgos**
  internos y externos; (3) **salvaguardas proporcionadas al volumen y sensibilidad** de los datos de
  menores en riesgo; (4) **prueba y monitorización periódica** de su eficacia; y (5) **evaluación y
  modificación al menos anual**. Además, antes de compartir datos con un proveedor de servicios, hay que
  **dar pasos razonables para determinar que es capaz** de mantener la confidencialidad, seguridad e
  integridad, y **obtener garantías escritas** de que aplicará medidas razonables.
- **Evidencia que deja:** el programa escrito con nombre del coordinador, el informe de la evaluación anual
  de riesgos más reciente, los resultados de las pruebas, y las **garantías escritas de cada proveedor**.
- **Cita:** `16 CFR § 312.8(b)` y `§ 312.8(c)`
- **Severidad:** alta — obligación nueva y expresa desde la revisión; ya exigible.
- **Condicionalidad:** operadores COPPA.

#### `us-edu-coppa-aviso` — Aviso directo y aviso online alineados con lo que hace el sistema de IA
- **Qué hacer:** el aviso a padres y el aviso online deben decir **qué datos se recogen, cómo se usan, a
  quién se divulgan y para qué**. El fallo típico: se despliega una función de IA nueva sobre un producto ya
  consentido y **no se actualiza el aviso ni se recaba consentimiento por el cambio material**. Un cambio
  material en las prácticas de recogida, uso o divulgación **requiere nuevo consentimiento verificable**.
- **Evidencia que deja:** control de versiones del aviso con fechas, y **acta que vincule cada versión a un
  cambio funcional del sistema**.
- **Cita:** `16 CFR § 312.4`; consentimiento ante cambio material: `§ 312.5(a)(1)`
- **Severidad:** media-alta.
- **Condicionalidad:** operadores COPPA.

---

### B.3 SOPIPA y leyes estatales de privacidad estudiantil

> **El matiz que define este bloque:** SOPIPA **no obliga al centro**. Obliga al **operador** de un servicio
> *"usado primariamente para fines escolares K-12 y diseñado y comercializado para fines escolares K-12"*,
> con **conocimiento efectivo**. Para nuestro ICP deployer, SOPIPA se convierte por tanto en un control de
> **diligencia contractual**: no es "tu organización debe cumplir SOPIPA", es "tu organización verifica y
> deja constancia de que su proveedor está sujeto a SOPIPA y de que su contrato no contradice sus
> prohibiciones". Escribirlo al revés sería un error de encuadre — y de venta.

#### `us-edu-sopipa-prohibiciones-contrato` — Traslada al contrato las tres prohibiciones tajantes de SOPIPA
- **Qué hacer:** verifica que el contrato con el proveedor **prohíbe expresamente** las tres conductas que
  SOPIPA veta al operador: (1) **publicidad dirigida** basada en información obtenida por el uso del
  servicio; (2) **elaborar un perfil** del alumno, salvo **en apoyo de fines escolares K-12**; y (3)
  **vender la información del alumno**. Si el contrato calla, no basta con que la ley lo prohíba: el centro
  no tendrá remedio contractual ni evidencia de diligencia.
- **Evidencia que deja:** cláusula con las tres prohibiciones citada por su número, y la ficha del
  proveedor indicando si se ha autocalificado como sujeto a SOPIPA.
- **Cita:** `Cal. B&P Code § 22584(b)`
- **Severidad:** alta — son prohibiciones absolutas, no matizables por consentimiento.
- **Condicionalidad:** solo si el proveedor tiene **nexo con California** y su servicio encaja en la
  definición de operador K-12 del § 22584(a). No aplica a servicios de educación superior ni a herramientas
  de propósito general no diseñadas ni comercializadas para K-12.

#### `us-edu-sopipa-mejora-producto` — La "mejora del producto" solo con datos desidentificados
- **Qué hacer:** SOPIPA permite al operador usar **información desidentificada** para mejorar productos
  educativos y compartir **información agregada y desidentificada** para el desarrollo y la mejora de
  productos educativos. La lectura correcta es restrictiva: **la excepción es para datos desidentificados,
  no para datos del alumno**. Traducción al contrato: "podemos usar los datos para mejorar el servicio"
  sin calificar es una cláusula que hay que corregir; debe decir **desidentificados**, con el método
  descrito, y coordinarse con el estándar de FERPA (`us-edu-ferpa-desidentificacion`).
- **Evidencia que deja:** redacción final de la cláusula de mejora de producto, y descripción del método
  de desidentificación aportada por el proveedor.
- **Cita:** `Cal. B&P Code § 22584(e)` y `§ 22584(f)` *(certeza **alta** sobre el contenido; **media** sobre
  las letras exactas de estas dos subsecciones — verificar en el texto oficial antes de GA)*
- **Severidad:** media.
- **Condicionalidad:** igual que el anterior.

#### `us-edu-sopipa-seguridad-borrado` — Seguridad razonable y borrado a requerimiento del centro
- **Qué hacer:** verifica que el contrato refleja los dos deberes que SOPIPA impone al operador:
  **implantar y mantener medidas y prácticas de seguridad razonables** apropiadas a la naturaleza de los
  datos, y **borrar la información cubierta del alumno cuando el centro o la LEA lo solicite**. El segundo
  es el que hay que poder **ejercer y demostrar**: define quién en el centro puede pedirlo y **guarda la
  confirmación escrita del borrado**.
- **Evidencia que deja:** cláusula de seguridad y de borrado a requerimiento; procedimiento interno de
  solicitud; **certificados o confirmaciones de borrado recibidos**.
- **Cita:** `Cal. B&P Code § 22584(d)`
- **Severidad:** media-alta.
- **Condicionalidad:** igual.

#### `us-edu-estatal-privacidad-estudiantil` — Revisa la ley del estado donde están tus estudiantes
- **Qué hacer:** aproximadamente **40 estados** tienen ley de privacidad estudiantil, muchas modeladas
  sobre SOPIPA pero **no idénticas**: algunas obligan al **LEA** y no solo al proveedor, algunas exigen
  **publicar el listado de contratos con proveedores**, otras imponen **avisos de brecha** específicos o
  designar un responsable de privacidad de datos estudiantiles. Identifica los estados donde residen tus
  estudiantes y anota, por estado, qué obligación **te toca a ti** y no solo al proveedor.
- **Evidencia que deja:** tabla estado → obligación propia → estado de cumplimiento → fecha de revisión.
- **Cita:** varía por estado. **No citamos un número exacto de leyes ni una lista cerrada**: la cifra de
  "~40 estados" es de fuente **secundaria** (organizaciones de privacidad estudiantil) y el recuento
  cambia. En producto se dice **"la mayoría de los estados"**, no un número.
- **Severidad:** media.
- **Condicionalidad:** solo estados con ley aplicable. **Este control debe generar una brecha por estado,
  no una genérica**, o el cliente no sabrá qué hacer.

---

### B.4 Antidiscriminación, accesibilidad y equidad

> ⚠️ **Cambio regulatorio de hace seis días — leer antes de redactar copy.** El 24-jul-2026 el Departamento
> de Educación publicó una **regla final** (91 FR 46733; RIN 1870-AA20; **efectiva el mismo 24-jul-2026**,
> sin trámite previo de comentarios) que **elimina la responsabilidad por impacto dispar** de sus
> reglamentos de Title VI: deja **[Reserved]** el `34 CFR § 100.3(b)(2)`, sustituye "effect" por "purpose"
> en el `§ 100.3(b)(3)`, y suprime el `§ 100.3(b)(6)`, el `§ 100.3(c)(2)`, el `§ 100.3(c)(3)` y partes del
> `§ 100.5`. El ED declara que Title VI *"prohibits intentional discrimination and does not prohibit
> conduct or activities that have an unintentional disparate impact"*. Se dicta conforme a la **EO 14281**
> ("Restoring Equality of Opportunity and Meritocracy", 23-abr-2025).
> **Cómo lo tratamos:** (1) **no** eliminamos el control de equidad — lo **reencuadramos** y le **bajamos
> la severidad** en su rama Title VI; (2) recordamos que ya antes **no había acción privada** para hacer
> valer los reglamentos de impacto dispar de Title VI (*Alexander v. Sandoval*, 532 U.S. 275 (2001)) — el cambio reduce sobre todo la vía administrativa del OCR; (3) **Section 504, la ADA, Title IX
> y el derecho antidiscriminatorio estatal son estatutos distintos y NO están tocados por esta regla**, y
> ahí sigue el grueso de la exposición real del vertical; (4) marcamos que una regla final **sin notice and
> comment** es **candidata natural a impugnación bajo la APA** y su vigencia puede no ser estable.
> *(Certeza: **alta** sobre la publicación, el contenido y la fecha; **baja** sobre su permanencia.)*

#### `us-edu-equidad-resultados` — Mide resultados por grupo antes y durante el despliegue
- **Qué hacer:** antes de poner en producción un sistema que **selecciona, puntúa, prioriza o penaliza**
  estudiantes (admisión, becas, alertas tempranas, asignación de recursos, disciplina, detección de
  trampas), mide sus resultados **desagregados por grupo protegido** y repite la medición periódicamente.
  Documenta qué encontraste y qué hiciste. Si no puedes medir, documenta **por qué** y qué proxy usas.
- **Evidencia que deja:** informe de resultados desagregados con fecha y metodología; acta de la decisión
  tomada a la vista de esos resultados.
- **Cita:** `42 U.S.C. § 2000d` (Title VI, discriminación **intencional**); `20 U.S.C. § 1681` (Title IX);
  `29 U.S.C. § 794` (Section 504); derecho estatal aplicable.
  ⚠️ **No citar `34 CFR § 100.3(b)(2)`**: está `[Reserved]` desde el 24-jul-2026.
- **Severidad:** **media** — rebajada desde alta a raíz de la regla del 24-jul-2026 **en su rama federal
  Title VI**. Sigue siendo **alta** de hecho para organizaciones con exposición bajo **Section 504/ADA**,
  bajo **Title IX**, o bajo derecho antidiscriminatorio **estatal** (p. ej. California), donde el impacto
  dispar conserva vigor.
- **Condicionalidad:** solo sistemas que produzcan un resultado individualizado con efecto sobre el
  estudiante. Un corrector ortográfico no entra.

#### `us-edu-504-ada-ajustes` — Ajuste razonable y revisión humana en herramientas que evalúan conducta o atención
- **Qué hacer:** cualquier sistema que interprete **comportamiento, atención, mirada, voz, movimiento o
  ritmo** de un estudiante debe tener: (a) una **vía de ajuste razonable** anunciada antes del uso;
  (b) **revisión humana con autoridad real** antes de que una marca del sistema produzca consecuencia
  (sanción, nota, expediente); y (c) registro de las marcas y de su resolución. El daño típico y
  documentado por el OCR: un sistema penaliza a un estudiante **por su discapacidad** — el ejemplo que da
  el propio OCR es un monitor de ruido con IA que marca repetidamente a un estudiante **con hipoacusia**
  por hablar demasiado alto.
- **Evidencia que deja:** procedimiento de ajuste razonable publicado; **log de marcas del sistema con su
  resolución humana**; formación del revisor.
- **Cita:** `29 U.S.C. § 794` y `34 CFR Part 104` (Section 504); `42 U.S.C. §§ 12131 ss.` (ADA Título II) o
  `§§ 12181 ss.` (Título III) según sea entidad pública o privada
- **Severidad:** **alta** — hay acción privada, y este es el eje de exposición que **no** se ha reducido.
- **Condicionalidad:** solo sistemas que evalúen conducta, atención o rasgos del estudiante.

#### `us-edu-genai-no-redacta-504` — La IA generativa no redacta planes 504/IEP sin revisión individualizada
- **Qué hacer:** si se usa IA generativa para redactar planes 504 o IEP, borradores de evaluación o
  informes de progreso, exige **revisión y modificación individualizada** documentada por la persona
  responsable antes de su adopción. El OCR ha señalado expresamente que usar IA generativa para componer
  planes 504 **sin revisarlos ni adaptarlos** a las necesidades de cada estudiante puede vulnerar el deber
  de proporcionar una **educación pública apropiada y gratuita (FAPE)**, porque produce planes
  "cookie-cutter".
- **Evidencia que deja:** el plan firmado con **traza de la revisión humana** (qué se cambió respecto del
  borrador), no solo el plan final.
- **Cita:** `29 U.S.C. § 794`; `34 CFR Part 104`; guía del OCR *"Avoiding the Discriminatory Use of
  Artificial Intelligence"* (**guía, no ley**)
- **Severidad:** alta.
- **Condicionalidad:** solo si se usa IA generativa en documentación de educación especial.

#### `us-edu-detectores-texto-ia` — Política escrita sobre detectores de "texto escrito por IA"
- **Qué hacer:** si el centro usa detectores de texto generado por IA, adopta una política que establezca
  que **la salida del detector no es prueba suficiente** para una sanción académica; exige **evidencia
  adicional** y una **entrevista con el estudiante**; documenta la decisión; y registra los casos por
  grupo para detectar sesgo. Considera seriamente **no usarlos** para sancionar.
- **Por qué, con la evidencia:** el sesgo está documentado en literatura revisada: un estudio de Stanford
  (Liang et al., 2023) probó siete detectores GPT sobre 91 redacciones **TOEFL** de hablantes no nativos y
  88 de estudiantes estadounidenses de 8.º grado: **más de la mitad** de las redacciones TOEFL fueron
  clasificadas como generadas por IA (**~61 % de falsos positivos de media**), frente a precisión casi
  perfecta en las de nativos; **el 97,8 %** de las TOEFL fue marcada por **al menos un** detector. La causa
  es estructural (baja *perplexity* del texto de no nativos), no un defecto puntual corregible.
  → Exposición bajo **Title VI por origen nacional** (nótese: el impacto dispar reglamentario ya no está
  disponible ante el ED, pero un uso conocidamente sesgado y mantenido puede alimentar una alegación de
  **discriminación intencional**, y sí hay exposición estatal), y bajo **Section 504/ADA** para estudiantes
  neurodivergentes cuyo estilo de escritura se aparta de la media.
- **Evidencia que deja:** la política; el registro de casos con su resolución; y la constancia de que se
  informó al estudiante y se le dio oportunidad de responder.
- **Cita:** `42 U.S.C. § 2000d`; `29 U.S.C. § 794`. La evidencia de sesgo es **fuente secundaria
  académica**, no legal, y así debe presentarse.
- **Severidad:** alta — es la fuente nº 1 de conflicto real y de daño reputacional en el vertical hoy.
- **Condicionalidad:** solo si se usan detectores de IA con consecuencia académica.

#### `us-edu-ada-web-wcag` — Accesibilidad WCAG 2.1 AA del contenido web y las apps
- **Qué hacer:** si la organización es una **entidad pública** estatal o local (distrito público,
  universidad pública), su contenido web y sus **aplicaciones móviles** —incluidas las interfaces de las
  herramientas de IA que ofrece a estudiantes— deben conformarse a **WCAG 2.1 Nivel AA**. Inventaría las
  interfaces afectadas, audita, y **exige al proveedor** su declaración de conformidad (ACR/VPAT).
- **Fechas — actualizadas y con corrección reciente:** la regla se publicó el 24-abr-2024 con cumplimiento
  el 24-abr-2026 (población ≥50.000) y 26-abr-2027 (resto). El **DOJ prorrogó un año** ambas mediante
  **regla interina publicada el 20-abr-2026**: ahora **26-abr-2027** (≥50.000) y **26-abr-2028** (menores y
  distritos especiales). *(Certeza alta; verificar en ada.gov antes de cada release, porque este calendario
  ya se ha movido una vez.)*
- **Evidencia que deja:** inventario de interfaces, informe de auditoría de accesibilidad, VPAT/ACR de cada
  proveedor, y plan de remediación fechado.
- **Cita:** `28 CFR §§ 35.200-35.205` (ADA Título II, regla web)
- **Severidad:** alta — obligación con fecha cierta y acción privada.
- **Condicionalidad:** **solo entidades públicas**. Los centros privados van por ADA Título III, que **no**
  tiene un estándar técnico reglamentado equivalente *(certeza alta a fecha de hoy)*.

---

### B.5 Proctoring y biometría

> **Encuadre honesto.** En EE. UU. **no existe** una prohibición análoga al Art. 5.1.f del EU AI Act: el
> proctoring con inferencia de estados internos **no está prohibido**. Lo que hay es **exposición real por
> otras vías**, y hay que distinguirla de la especulación:
> **exposición real y documentada** → BIPA de Illinois (acción privada con daños tasados; hay oleada de
> demandas contra proveedores de proctoring y contra universidades) y Section 504/ADA;
> **exposición plausible pero menos asentada** → Cuarta Enmienda / registro irrazonable en centros
> **públicos**, teoría con litigio existente pero doctrina poco consolidada — **no la vendemos como
> establecida**.

#### `us-edu-biometria-bipa` — Aviso escrito, consentimiento escrito y política pública de retención antes de captar biometría
- **Qué hacer:** antes de que un sistema capte **geometría facial, iris/retina, huella, geometría de la
  mano o voiceprint** de un estudiante en Illinois: (1) **informar por escrito** de que se recogen y de la
  **finalidad y el plazo** concretos de uso y conservación; (2) obtener **consentimiento escrito**
  (vale firma electrónica desde la reforma de 2024); (3) tener publicada una **política escrita** con
  calendario de retención y **destrucción** —al cumplirse la finalidad o a los 3 años del último contacto,
  lo que ocurra antes—; y (4) **no vender ni lucrarse** con esos datos.
- **Por qué importa más que otros controles:** BIPA tiene **acción privada** con daños **tasados**:
  **1.000 $** por infracción negligente y **5.000 $** por intencional o temeraria, más honorarios. La
  reforma de 2024 (**Public Act 103-0769**, en vigor 2-ago-2024) limitó la exposición a **una sola
  recuperación por persona** cuando se recoge el mismo identificador por el mismo método —revirtiendo
  *Cothron v. White Castle*—, lo que **reduce** la cifra agregada pero **no elimina** la exposición de
  clase.
- **Dos precisiones del texto legal que cambian el análisis y que casi nadie aplica bien:**
  **(1) Las fotografías están EXCLUIDAS** de la definición. *"Biometric identifier"* es *"a retina or iris
  scan, fingerprint, voiceprint, or scan of hand or face geometry"*, y la ley **excluye expresamente
  fotografías**, datos demográficos e imágenes médicas. → Grabar la webcam de un examen **no es, por sí
  solo**, recoger un identificador biométrico; lo que activa BIPA es **derivar de esa imagen un escaneo de
  la geometría facial**, que es exactamente la teoría de las demandas contra proveedores de proctoring.
  **Consecuencia práctica:** la pregunta correcta al proveedor no es *"¿grabáis vídeo?"* sino
  ***"¿extraéis y almacenáis una plantilla de geometría facial o un voiceprint?"***. Ese matiz es el que
  distingue un control útil de uno decorativo.
  **(2) Hay una exención para instituciones financieras** sujetas a Gramm-Leach-Bliley. No es teórica en
  este vertical: un tribunal federal **desestimó** una demanda BIPA contra una universidad por considerarla
  *"financial institution"* regulada (vía su participación en ayuda financiera federal). → Para clientes de
  **educación superior**, esta defensa existe; **no la vendemos como cierta** (es una línea de casos, no
  doctrina asentada) pero el pack debe mencionarla para que el cliente la consulte con su abogado en vez de
  asumir exposición total.
- **Evidencia que deja:** el aviso escrito y el consentimiento **firmado por cada estudiante** (o su
  tutor), la política pública de retención y destrucción, el registro de destrucción ejecutada, y la
  **respuesta escrita del proveedor** sobre si extrae plantillas de geometría facial o voiceprints.
- **Cita:** `740 ILCS 14/10` (definición), `14/15(a)`, `14/15(b)`, `14/15(c)`; acción y daños:
  `740 ILCS 14/20`
- **Severidad:** alta.
- **Condicionalidad:** **solo si hay estudiantes en Illinois** **y** el sistema extrae un identificador
  biométrico en sentido estricto (no basta con grabar vídeo). Revisar además Texas CUBI y Washington
  HB 1493, que **no** tienen acción privada, y las leyes biométricas estatales más recientes.

#### `us-edu-proctoring-alternativa-y-apelacion` — Alternativa no biométrica y vía de apelación con revisión humana
- **Qué hacer:** ofrece una **alternativa razonable** al proctoring biométrico (examen presencial,
  supervisión humana, evaluación de diseño distinto) y anúnciala **antes** del examen; garantiza que
  **ninguna sanción académica** se deriva automáticamente de una marca del sistema sin **revisión humana**
  y sin oír al estudiante; y registra las marcas, su tasa por grupo y su resolución.
- **Evidencia que deja:** comunicación previa al estudiantado con la alternativa; procedimiento de
  apelación; **log de incidencias con resolución**; estadística de marcas por grupo.
- **Cita:** `29 U.S.C. § 794`; `34 CFR Part 104`; ADA (`42 U.S.C. §§ 12131 ss.` / `§§ 12181 ss.`)
- **Severidad:** alta.
- **Condicionalidad:** solo si se usa proctoring remoto con análisis automático.

---

### B.6 PPRA — **solo centros con fondos del ED**

#### `us-edu-ppra-encuestas-y-marketing` — Encuestas y recogida de datos para marketing
- **Qué hacer:** si una herramienta de IA administra **encuestas** a estudiantes que tocan alguna de las
  **ocho áreas protegidas** (afiliación política, problemas psicológicos, conducta o actitudes sexuales,
  conducta ilegal o autoinculpatoria, valoraciones críticas de otros, relaciones privilegiadas, prácticas
  religiosas, ingresos), o si **recoge datos de estudiantes para venderlos o usarlos con fines de
  marketing**, aplica el régimen de PPRA: consentimiento previo cuando la encuesta se financia con fondos
  del ED, y derecho de los padres a **inspeccionar el instrumento** y a **excluir** a su hijo.
  Caso vertical típico: chatbots de bienestar, encuestas SEL y "clima escolar" con analítica de IA.
- **Evidencia que deja:** el instrumento de la encuesta archivado, la política de notificación y opt-out,
  y el registro de notificaciones enviadas.
- **Cita:** `20 U.S.C. § 1232h`; `34 CFR Part 98`
- **Severidad:** media.
- **Condicionalidad:** solo centros con fondos del ED **y** que administren encuestas o recojan datos para
  marketing.

---

### B.7 Gobernanza alineada con la guía federal (**guía, no ley**)

#### `us-edu-politica-uso-ia` — Política escrita de uso de IA con humano en el circuito
- **Qué hacer:** adopta una política de uso de IA que cubra: usos permitidos y prohibidos, **quién decide**
  la adopción, revisión humana obligatoria antes de decisiones que afecten al estudiante, formación del
  personal, comunicación a familias y estudiantes, y revisión periódica. Alinéala con los principios que
  el ED viene repitiendo: iniciativas **lideradas por educadores**, éticas, **accesibles** para estudiantes
  con discapacidad, **transparentes** en su despliegue y conformes con las leyes federales de privacidad.
- **Evidencia que deja:** la política aprobada con fecha y órgano que la aprueba; registro de formación;
  actas de revisión.
- **Cita:** informe del **Office of Educational Technology**, *"Artificial Intelligence and the Future of
  Teaching and Learning: Insights and Recommendations"* (**may-2023**); *Dear Colleague Letter* del ED
  sobre uso de fondos federales de subvención en IA (**22-jul-2025**). **Ambos son guía, no ley** —
  no crean obligación exigible, pero sí definen el estándar de diligencia que un investigador del OCR o un
  auditor de subvención va a usar como referencia, y condicionan de hecho la elegibilidad del gasto.
- **Severidad:** **baja** como obligación jurídica; **media** en la práctica si la organización financia
  IA con fondos federales de subvención.
- **Condicionalidad:** ninguna, pero el gancho de fondos solo aplica a quien recibe subvenciones del ED.

---

## C. Trampas del vertical

> Cada trampa está **verificada** contra el análisis de §B. Se marca el **veredicto** (¿es realmente una
> trampa?) porque dos de las propuestas resultaron ser **más matizadas** de lo que parecían, y presentarlas
> como absolutas nos haría perder credibilidad ante el primer abogado que las lea.

### C.1 "Los padres ya aceptaron los términos de la app, así que el proveedor puede entrenar su modelo"
**Veredicto: es una trampa real, pero hay que enunciarla con precisión.**
Bajo la regla COPPA revisada, el consentimiento para **recoger y usar** los datos del menor **no cubre**
la **divulgación a terceros** que no sea *integral* al servicio, y hace falta un **consentimiento
verificable separado**. La FTC declaró en el preámbulo que divulgar datos de menores **para entrenar o
desarrollar IA no es integral**. → Un único "acepto los términos" no vale.
**Dónde está el matiz que casi todo el mundo cuenta mal:** la subsección se construye sobre la
**divulgación a un tercero**. Si el operador entrena **su propio** modelo con esos datos **sin divulgarlos**,
esta subsección concreta no lo alcanza. Sigue habiendo límites (retención del § 312.10, aviso del § 312.4,
cambio material del § 312.5(a)(1), y la sección 5 de la FTC Act), pero **no** es el mismo argumento.
→ **Copy correcto:** *"el consentimiento de uso no equivale a consentimiento de divulgación para
entrenamiento; pregunta a tu proveedor si el entrenamiento es interno o implica cesión, porque el análisis
cambia"*. **Copy incorrecto:** *"COPPA prohíbe entrenar IA con datos de menores"*. Es falso.
`16 CFR § 312.5(a)(2)`, `§ 312.10`

### C.2 "Firmamos el contrato estándar del proveedor, así que la *school official exception* está cubierta"
**Veredicto: trampa real, y probablemente la más cara del pack.**
La excepción exige **tres** condiciones acumulativas, y la que casi ningún contrato estándar de EdTech
satisface es el **control directo del centro sobre el uso y el mantenimiento** de los expedientes. Los
contratos redactados por el proveedor suelen reservarse derechos de uso propio ("para mejorar nuestros
servicios"), permitir **redivulgación a afiliadas y socios** sin lista cerrada, y no conceder al centro ni
derecho de auditoría ni capacidad de ordenar borrado. Cualquiera de esas tres cosas **rompe el control
directo** y deja la cesión sin base legal.
Añádase que el centro también debe **publicar los criterios** de school official e interés educativo
legítimo en su notificación anual (§ 99.7(a)(3)(iii)) — que solo nace si tiene esa política — y usar
**métodos razonables** para limitar el acceso a lo necesario (§ 99.31(a)(1)(ii)).
→ **Control:** que el gap assessment obligue a **citar la cláusula por su número**, no a marcar una casilla.
`34 CFR § 99.31(a)(1)(i)(B)`, `§ 99.31(a)(1)(ii)`, `§ 99.7(a)(3)(iii)`, `§ 99.33(a)`

### C.3 "Dejamos que el proveedor use los datos de nuestros estudiantes para mejorar su producto"
**Veredicto: trampa real, y la respuesta es distinta en cada una de las tres normas — eso es justo lo que
hace valioso el pack.**
- **FERPA:** el uso para fines **propios** del proveedor es incompatible con el **control directo**, que es
  precisamente lo que sostiene la excepción. Si el proveedor usa los datos para su producto, deja de actuar
  "por cuenta del centro". → No, salvo consentimiento o desidentificación que supere el `§ 99.31(b)(1)`.
- **SOPIPA:** permite mejorar productos educativos **solo con información desidentificada**, y compartir
  solo **agregada y desidentificada**. → No con datos del alumno; sí con datos desidentificados.
- **COPPA revisada:** si "mejorar el producto" implica **ceder** a un tercero para entrenar IA, hace falta
  **consentimiento separado**; si es entrenamiento estrictamente interno, la subsección de divulgación no
  aplica (ver C.1) pero sí el límite de retención y el deber de aviso.
→ **Regla práctica para el cliente:** la frase *"para mejorar nuestros servicios"* en un contrato de EdTech
es una **bandera roja de tres normas a la vez**. Hay que calificarla o suprimirla.
`34 CFR §§ 99.31(a)(1)(i)(B), 99.31(b)(1)`; `Cal. B&P § 22584(e)-(f)`; `16 CFR § 312.5(a)(2)`

### C.4 "Está anonimizado"
**Veredicto: trampa real.**
FERPA no se conforma con quitar el nombre: exige **eliminar toda PII** *y* una **determinación razonable de
que la identidad no es identificable**, teniendo en cuenta **otra información razonablemente disponible** y
el efecto acumulativo de **divulgaciones múltiples**. Un identificador estable sustituido por un código
sigue siendo reidentificable si quien lo recibe tiene más datos, y en un centro pequeño **la combinación de
curso + programa + fecha de nacimiento identifica sola**. La definición de PII del `§ 99.3` incluye
expresamente los **identificadores indirectos** y la información que "sola o en combinación" permita a una
persona razonable de la comunidad escolar identificar al estudiante con **certeza razonable**.
→ **Control:** exigir la **descripción del método** de desidentificación, no la palabra.
`34 CFR §§ 99.3, 99.31(b)`

### C.5 "El colegio puede consentir por los padres, la FTC lo permite"
**Veredicto: trampa real y poco conocida — es de las que más valor demuestra.**
La FTC **propuso** codificar la *school authorization exception* en la revisión de 2025 y **decidió no
hacerlo**, para no chocar con una eventual reforma de los reglamentos FERPA del ED. Las excepciones del
`§ 312.5(c)` **no incluyen** ninguna de autorización escolar (verificación **por ausencia** en el texto
vigente). La práctica se sostiene sobre **FAQ del personal de la FTC**, que no son ni reglamento ni
posición vinculante de la Comisión.
→ **Copy correcto:** *"la autorización escolar es una posición apoyada en guía de personal de la FTC, no en
la Regla; documenta su alcance y limítala a fines exclusivamente educativos"*.

### C.6 "Nuestro detector de IA es fiable"
**Veredicto: trampa real, con evidencia dura y con exposición legal — pero no exactamente la que se suele
citar.**
La evidencia de sesgo es sólida: **~61 % de falsos positivos** sobre redacciones TOEFL de hablantes no
nativos frente a precisión casi perfecta con nativos, y **97,8 %** de esas redacciones marcada por al menos
un detector (Liang et al., Stanford, 2023). La causa es **estructural**.
**El matiz jurídico que cambió hace seis días:** la vía clásica que se cita —**impacto dispar** bajo
Title VI por origen nacional— **ya no está disponible en los reglamentos del ED** desde el 24-jul-2026, y
además nunca tuvo acción privada (*Sandoval*). La exposición que **sí** queda: (a) **discriminación
intencional** bajo Title VI, alegable con más fuerza si la organización **conocía** el sesgo y siguió
sancionando; (b) **Section 504 / ADA** para estudiantes neurodivergentes o con discapacidad cuyo estilo de
escritura se aparta de la media — **intacta**; (c) **derecho antidiscriminatorio estatal**; (d) el proceso
académico debido y el daño reputacional, que en la práctica es lo que mueve al cliente.
→ **Copy correcto:** *"la salida del detector no es prueba suficiente"*. **Copy incorrecto:** *"usar
detectores de IA viola Title VI"*.

### C.7 "El consentimiento del proctoring está en los términos del examen"
**Veredicto: trampa real donde aplica BIPA; matizada en el resto.**
BIPA exige **aviso escrito específico** (que se recogen, **para qué** y **por cuánto tiempo**) y
**consentimiento escrito** — un clic de aceptación genérico de términos no equivale. Y exige una **política
pública** de retención y destrucción. Hay **acción privada con daños tasados** (1.000 $ / 5.000 $), y hay
oleada documentada de demandas contra proveedores de proctoring y contra universidades.
Fuera de Illinois el análisis cambia: Texas y Washington tienen ley biométrica **sin acción privada**, y en
la mayoría de estados no hay régimen específico.
→ **No** vender "el proctoring biométrico es ilegal en EE. UU.": es falso. Vender **"tienes una obligación
de aviso y consentimiento escrito específica, y en Illinois con daños tasados por estudiante"**.

### C.8 "Si el sistema se equivoca, el estudiante ya tiene el proceso de apelación de siempre"
**Veredicto: trampa real, con un límite que hay que respetar.**
Si las inferencias del sistema son expediente educativo (§B.1), el estudiante tiene derecho a
**inspeccionarlas** y a **pedir su enmienda** por inexactas o engañosas, con **audiencia** si se deniega. El
fallo operativo típico: el dato vive **solo en el sistema del proveedor** y el centro **no puede
recuperarlo** en 45 días, con lo que el derecho es nominal.
**El límite honesto:** el derecho de enmienda de FERPA se dirige a la **inexactitud del registro** y la
jurisprudencia ha sido reacia a convertirlo en una vía para reabrir **juicios sustantivos** del educador.
→ Prometer *"el estudiante puede exigir que se anule la puntuación del modelo"* es prometer de más.
`34 CFR §§ 99.10, 99.20, 99.21`

### C.9 "Lo desplegamos solo como piloto, aún no cuenta"
**Veredicto: trampa real y transversal.**
Ninguna de estas normas tiene una excepción de "piloto". FERPA se activa por la **divulgación** de PII, no
por la madurez del proyecto; COPPA por la **recogida**; BIPA por la **captación** del identificador
biométrico. Un piloto con datos reales de estudiantes activa las mismas obligaciones que producción. Lo que
sí cambia es el **volumen** del daño, no su existencia.

### C.10 (Descartada) "Las leyes estatales de privacidad del consumidor te obligan además de FERPA"
**Veredicto: NO la incluimos como trampa.** La mayoría de las leyes estatales generales de privacidad
**exceptúan** los datos cubiertos por FERPA y/o a las entidades sin ánimo de lucro, con variaciones por
estado que **no hemos verificado estado por estado**. Afirmar una acumulación general sería alarmismo.
Se deja como **incertidumbre declarada**, no como control ni como trampa.

---

## D. Contraste explícito con el pack UE (`educacion`, Anexo III.3)

**La frase que resume el contraste, y que sirve de copy:**
> En la UE el regulador pregunta **"¿qué tan peligroso es este sistema?"**.
> En EE. UU. pregunta **"¿de quién son estos datos, quién te dejó usarlos y a quién perjudicó el
> resultado?"**.

| Eje | Pack UE (`educacion`) | Pack EE. UU. (`us-educacion`) |
|---|---|---|
| **Unidad de análisis** | El **sistema** y su nivel de riesgo | Los **datos del estudiante** y el **contrato** con el proveedor |
| **Clasificación de riesgo** | Sí, central: Anexo III.3.a-d ⇒ **alto riesgo** | **No existe**. Ninguna norma federal clasifica sistemas de IA educativos |
| **Prohibiciones** | Sí: inferir emociones de estudiantes por biometría en centros educativos está **prohibido** (Art. 5.1.f, en vigor desde 2-feb-2025) | **Ninguna prohibición análoga.** El proctoring con inferencia de estados internos **no está prohibido**; la exposición llega por BIPA, ADA/504 y litigio |
| **Evaluación de impacto** | **FRIA obligatoria** (Art. 27) para deployers públicos o que prestan servicio público — el pack UE le da severidad alta | **No hay equivalente federal obligatorio.** Lo más parecido es voluntario o de guía (ED/OET, NIST AI RMF) |
| **Registro público** | Sí: deployers públicos registran en la base de datos de la UE (Art. 49.4) | **No hay registro.** Algunas leyes estatales exigen publicar **contratos con proveedores**, que es otra cosa |
| **Transparencia** | Art. 50: informar de que se interactúa con IA, marcar contenido sintético | Ningún deber federal general equivalente. La transparencia llega por el **aviso COPPA** (`§ 312.4`), la **notificación anual FERPA** (`§ 99.7`) y las leyes estatales |
| **Supervisión humana** | Deber expreso y autónomo (Arts. 14 y 26.2) | **No como deber autónomo.** Aparece **indirectamente**: como ajuste razonable bajo 504/ADA, como control de calidad de los planes 504 (FAPE) y como buena práctica en la guía del ED |
| **Antidiscriminación** | Integrada en el régimen de alto riesgo y en el RGPD (Art. 22, Considerando 71) | **Estatutos separados y anteriores**: Title VI, Title IX, Section 504, ADA. ⚠️ Y el brazo de **impacto dispar de Title VI está rescindido** en los reglamentos del ED desde el 24-jul-2026 |
| **Menores** | Protección reforzada del RGPD + Considerando 71 (decisiones únicamente automatizadas no deberían afectar a un menor) | **COPPA**, con un umbral duro de **<13 años** y sujeto = **operador**, no centro |
| **Quién es el obligado** | El **deployer**, de forma clara y unificada | **Depende de la norma**: el centro en FERPA/PPRA, el operador en COPPA/SOPIPA, la entidad pública en ADA II. Un mismo cliente cambia de papel según la norma |
| **Consecuencia** | Multa administrativa (hasta 15M€ / 3 % para deployers, Art. 99) | **Retirada de fondos federales** (FERPA), **multa civil de la FTC** (COPPA), **acción privada con daños tasados** (BIPA), **demanda** (504/ADA/Title IX) |
| **Calendario** | Alto riesgo Anexo III: **2-dic-2027** vía Digital Omnibus — ⚠️ el pack UE exige verificar la publicación en el DOUE antes de planificar sobre esa fecha | **Ya exigible hoy**: FERPA (1974), COPPA revisada (**22-abr-2026**), SOPIPA (2016). Lo único a futuro es la accesibilidad web ADA II (**2027/2028**) |

### Lo que sí se parece (y por tanto se reutiliza)

1. **El reencuadre provider→deployer es idéntico**, y es nuestro activo. En la UE: "exige la documentación
   del Art. 13 al proveedor". En EE. UU.: "exige la cláusula de control directo del § 99.31(a)(1)(i)(B)".
   Es el **mismo movimiento de producto**: convertir un deber ajeno en una **exigencia contractual propia**
   con evidencia archivable.
2. **La evidencia que se pide es del mismo tipo**: cláusula contractual, registro de consentimientos, mapa
   de datos, política de retención, acta de revisión humana, log de incidencias. El **modelo de datos de
   Attesta no necesita cambiar**.
3. **El proctoring es el caso caliente en las dos jurisdicciones**, por razones distintas — y esa es una
   buena historia comercial: *"lo mismo te expone en ambos sitios, pero por motivos que no se parecen"*.
4. **Las dos tienen un derecho de rectificación** frente a datos inexactos (RGPD Art. 16 / FERPA § 99.20),
   con el mismo límite práctico: sirve para corregir el **dato**, no para reabrir el **juicio**.

### Para un cliente con presencia en ambas jurisdicciones — el aviso que hay que darle

- **No hay reciprocidad.** Cumplir el EU AI Act **no** te acerca a FERPA ni a COPPA: son ejes distintos.
  Un sistema perfectamente documentado bajo el Art. 26 puede estar cediendo datos de estudiantes sin base
  bajo FERPA.
- **La dirección que sí transfiere valor es UE → EE. UU. en materia de *evidencia***, porque el rigor
  documental que exige el AI Act cubre de sobra lo que pide un investigador del OCR.
- **La dirección que NO transfiere es EE. UU. → UE en materia de *prohibiciones***: un centro
  estadounidense acostumbrado a proctoring con análisis de emociones está haciendo en la UE algo
  **prohibido**, no algo "de alto riesgo".
- **Cuidado con el umbral de edad:** COPPA corta en **<13**; el EU AI Act y el RGPD no usan ese umbral de la
  misma forma. Trasladar la política de una a otra deja huecos en ambos sentidos.

---

## E. Fuentes

**Regla:** toda afirmación de §A y §B debe apoyarse en una **primaria**. Donde solo hay secundaria, está
marcado en el propio control.

### E.1 Primarias — verificadas en esta sesión

| Fuente | Qué respalda | URL |
|---|---|---|
| **34 CFR § 99.3** (definiciones) | *Education records*, PII, *directory information*, *disclosure*. Base del control de inferencias | https://www.law.cornell.edu/cfr/text/34/99.3 |
| **34 CFR § 99.7** | Notificación anual; **(a)(3)(iii)** verificado literalmente | https://www.law.cornell.edu/cfr/text/34/99.7 |
| **34 CFR § 99.20** | Derecho de enmienda: *inaccurate, misleading, or in violation of privacy rights* | https://www.law.cornell.edu/cfr/text/34/99.20 |
| **34 CFR § 99.31** | *School official exception* **(a)(1)(i)(B)** con sus 3 condiciones; **(a)(1)(ii)** métodos razonables; **(b)** desidentificación | https://www.law.cornell.edu/cfr/text/34/99.31 |
| **34 CFR § 99.37** | *Directory information* y opt-out | https://www.law.cornell.edu/cfr/text/34/99.37 |
| **16 CFR § 312.2** | *Personal information* con **identificadores biométricos**; *mixed audience* | https://www.law.cornell.edu/cfr/text/16/312.2 |
| **16 CFR § 312.5** | **(a)(2)** consentimiento separado para divulgación a terceros; **(c)** las 9 excepciones — **verificación por ausencia**: no hay excepción escolar | https://www.law.cornell.edu/cfr/text/16/312.5 |
| **16 CFR § 312.8** | **(b)** programa escrito de seguridad (5 elementos); **(c)** diligencia sobre terceros | https://www.law.cornell.edu/cfr/text/16/312.8 |
| **16 CFR § 312.10** | Política **escrita** de retención y borrado, publicada en el aviso | https://www.law.cornell.edu/cfr/text/16/312.10 |
| **FTC — Statement of Basis and Purpose**, regla COPPA revisada | Cita literal de la **no codificación** de la *school authorization exception* | https://www.ftc.gov/system/files/ftc_gov/pdf/coppa_sbp_1.16_0.pdf · https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule |
| **ED — regla final Title VI**, 91 FR 46733 (24-jul-2026), RIN 1870-AA20 | Rescisión del impacto dispar: `§ 100.3(b)(2)` **[Reserved]**, supresión de `(b)(6)`, `(c)(2)`, `(c)(3)` y partes del `§ 100.5`; efectiva 24-jul-2026 | https://www.federalregister.gov/documents/2026/07/24/2026-15019/rescinding-portions-of-the-department-of-education-title-vi-regulations-to-align-with-the-statutory |
| **Cal. B&P Code § 22584** (SOPIPA) | Definición de *operator*, *covered information*, *K-12 school purposes*; prohibiciones **(b)**; seguridad y borrado **(d)**; usos permitidos **(e)/(f)** | https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=22584 |
| **ADA.gov — regla web Título II** | Estándar WCAG 2.1 AA y **prórroga** a 26-abr-2027 / 26-abr-2028 (IFR publicada 20-abr-2026) | https://www.ada.gov/resources/2024-03-08-web-rule/ |
| **DOJ — regla final Título II** (24-abr-2024) | Texto original de la regla y fechas previas | https://www.federalregister.gov/documents/2024/04/24/2024-07758/nondiscrimination-on-the-basis-of-disability-accessibility-of-web-information-and-services-of-state |
| **ED/OCR — *Avoiding the Discriminatory Use of Artificial Intelligence*** | Ejemplos oficiales: planes 504 generados por IA sin revisión; monitor de ruido que marca a estudiante con hipoacusia. **Guía, no ley** | https://www.ed.gov/media/document/avoiding-discriminatory-use-of-artificial-intelligence-112274.pdf |
| **ED — *Dear Colleague Letter*** sobre fondos federales e IA (22-jul-2025) | Principios: liderado por educadores, ético, accesible, transparente, conforme a privacidad. **Guía, no ley** | https://www.ed.gov/media/document/opepd-ai-dear-colleague-letter-7222025-110427.pdf |

### E.2 Primarias citadas pero **NO abiertas** en esta sesión (verificar antes de GA)

- **20 U.S.C. § 1232g** (FERPA, texto estatutario) y **20 U.S.C. § 1232h** + **34 CFR Part 98** (PPRA).
  Contenido de alta confianza y estable, pero no se leyó el texto en esta sesión.
- **15 U.S.C. §§ 6501-6506** (COPPA, estatuto) — incluido el **§ 6504** (aplicación por fiscales generales).
- ~~**740 ILCS 14** (BIPA)~~ → **RESUELTO durante la sesión.** El sitio oficial de la Asamblea de Illinois
  devolvió 404 y Justia devolvió 403 en acceso directo, pero el **texto estatutario sí se obtuvo** vía el
  proxy de texto sobre Justia. Verificados: la definición de `§ 14/10` (**con la exclusión expresa de
  fotografías**), los deberes de `§ 14/15(a)-(c)` y las cuantías de `§ 14/20`, más la **exención
  Gramm-Leach-Bliley**. Certeza **alta sobre el contenido**; queda como higiene contrastarlo en `ilga.gov`
  cuando el sitio responda. La reforma **PA 103-0769** sigue apoyada solo en secundarias concordantes.
- **34 CFR § 99.10** (inspección), **§ 99.21** (audiencia), **§ 99.32** (registro de divulgaciones),
  **§ 99.33(a)** (redivulgación). Contenido derivado de la lectura del § 99.31 y de conocimiento estable;
  **no se abrieron sus páginas**.
- **28 CFR §§ 35.200-35.205** (regla web ADA II). Fechas verificadas en ada.gov; **articulado no leído**.
- **EO 14281** "Restoring Equality of Opportunity and Meritocracy" (23-abr-2025) — citada dentro de la regla
  final del ED, no leída por separado.
- **ED/OET, *AI and the Future of Teaching and Learning*** (may-2023) — existencia y encuadre confirmados
  por múltiples fuentes; **el informe no se abrió**.

### E.3 Secundarias (contexto, confirmación cruzada; **nunca** base única de un control)

- Latham & Watkins, Hunton, Mayer Brown, Davis Polk, McDermott, Goodwin, Keller & Heckman, Finnegan,
  DWT — resúmenes de la revisión COPPA 2025 (fechas y cambios; **coinciden entre sí**).
- Norton Rose Fulbright (*Data Protection Report*), Akin, **Public Interest Privacy Center** — el ángulo
  **IA/entrenamiento** de COPPA. El PIPC es además la fuente que mejor articula el **hueco del uso
  interno** de la §C.1 y la crítica a la no codificación de la excepción escolar.
- Nelson Mullins, Holland & Knight, Harvard EELP tracker — EO 14281 y el desmontaje del impacto dispar.
- King & Spalding, Faegre Drinker, DWT, ABA — reforma BIPA de 2024 (**PA 103-0769**, 2-ago-2024) y
  *Cothron v. White Castle*.
- Faegre Drinker, Privacy World, classaction.org — oleada de litigio BIPA contra proctoring
  (**Respondus**, **ProctorU**) y contra universidades.
- **Liang et al. (Stanford), *GPT detectors are biased against non-native English writers*** (2023),
  arXiv:2304.02819 — **evidencia académica**, no legal: ~61 % de falsos positivos en redacciones TOEFL;
  97,8 % marcadas por al menos un detector. https://arxiv.org/pdf/2304.02819
- Liebert Cassidy Whitmore, Cooley, Lozano Smith, KingSpry — lecturas de la guía del OCR sobre IA.

### E.4 Nota de método y sus límites

1. **`ecfr.gov` y `federalregister.gov` no son accesibles directamente** desde este entorno (redirección a
   `unblock.federalregister.gov` a través del proxy). El CFR se leyó en el **mirror de Cornell LII**, que
   reproduce el texto vigente pero **no muestra las notas de enmienda**; el Federal Register se leyó a
   través del proxy de texto `r.jina.ai`, que **sí** devolvió el articulado y las instrucciones de
   modificación de la regla del ED. → Certeza **alta sobre el contenido**, **media sobre la vigencia
   exacta de la versión mostrada por Cornell**. Antes de GA, contrastar los §§ 312.x y 99.x en eCFR.
2. **Dos PDF oficiales no se pudieron extraer** (SBP de la FTC y guía del OCR): el contenido citado de
   ambos procede de fuentes secundarias concordantes **salvo** la cita literal de la no codificación de la
   excepción escolar, que **sí** se obtuvo del documento de la FTC vía `r.jina.ai`.
3. **Las letras de subsección de SOPIPA `(e)` y `(f)`** proceden de una única extracción. El **contenido**
   está confirmado; las **letras**, no del todo.
4. **Nada de este memo ha sido revisado por un abogado de EE. UU.** Es orientación de compliance para
   autoevaluación y preparación de evidencia — **no es asesoría legal**.

---

## F. Notas para quien implemente el pack

### F.1 Los 24 controles propuestos

| # | `id` | `article` | Sev. | Condicionalidad |
|---|---|---|---|---|
| 1 | `us-edu-alcance-normativo` | 20 U.S.C. § 1232g(a)(3) · 16 CFR § 312.2 | alta | — (raíz) |
| 2 | `us-edu-inventario-ia-estudiantes` | 34 CFR § 99.31(a)(1)(i)(B)(2) · 16 CFR § 312.8(c) | media | — |
| 3 | `us-edu-ferpa-school-official` | 34 CFR § 99.31(a)(1)(i)(B) | **alta** | fondos ED + cesión a proveedor |
| 4 | `us-edu-ferpa-notificacion-anual` | 34 CFR § 99.7(a)(3)(iii) | media | fondos ED + política de divulgación |
| 5 | `us-edu-ferpa-no-redivulgacion` | 34 CFR §§ 99.33(a), 99.32 | alta | fondos ED |
| 6 | `us-edu-ferpa-inferencias-como-expediente` | 34 CFR § 99.3 | alta | fondos ED + salidas individualizadas · **ZONA GRIS** |
| 7 | `us-edu-ferpa-acceso-y-rectificacion` | 34 CFR §§ 99.10, 99.20, 99.21 | alta | fondos ED |
| 8 | `us-edu-ferpa-directory-optout` | 34 CFR § 99.37 | media | fondos ED + usa directory information |
| 9 | `us-edu-ferpa-desidentificacion` | 34 CFR § 99.31(b)(1) | media-alta | fondos ED + uso secundario |
| 10 | `us-edu-coppa-rol-operador` | 16 CFR § 312.2 | alta | — (raíz del bloque COPPA) |
| 11 | `us-edu-coppa-consentimiento-separado-ia` ★ | 16 CFR § 312.5(a)(2) | **alta** | operador <13 |
| 12 | `us-edu-coppa-autorizacion-escolar` | 16 CFR § 312.5(c) (por ausencia) | alta | usa autorización escolar · **ZONA GRIS** |
| 13 | `us-edu-coppa-retencion-escrita` | 16 CFR § 312.10 | alta | operador <13 |
| 14 | `us-edu-coppa-programa-seguridad` | 16 CFR § 312.8(b)-(c) | alta | operador <13 |
| 15 | `us-edu-coppa-aviso` | 16 CFR §§ 312.4, 312.5(a)(1) | media-alta | operador <13 |
| 16 | `us-edu-sopipa-prohibiciones-contrato` | Cal. B&P § 22584(b) | alta | proveedor con nexo CA + servicio K-12 |
| 17 | `us-edu-sopipa-mejora-producto` | Cal. B&P § 22584(e)-(f) | media | ídem |
| 18 | `us-edu-sopipa-seguridad-borrado` | Cal. B&P § 22584(d) | media-alta | ídem |
| 19 | `us-edu-estatal-privacidad-estudiantil` | varía por estado | media | por estado — **una brecha por estado** |
| 20 | `us-edu-equidad-resultados` | 42 U.S.C. § 2000d · 20 U.S.C. § 1681 · 29 U.S.C. § 794 | **media** ⬇ | resultado individualizado · **rebajada 24-jul-2026** |
| 21 | `us-edu-504-ada-ajustes` | 29 U.S.C. § 794 · 34 CFR Part 104 · ADA | alta | evalúa conducta/atención |
| 22 | `us-edu-genai-no-redacta-504` | 29 U.S.C. § 794 · 34 CFR Part 104 | alta | GenAI en documentación 504/IEP |
| 23 | `us-edu-detectores-texto-ia` | 42 U.S.C. § 2000d · 29 U.S.C. § 794 | alta | usa detectores con consecuencia académica |
| 24 | `us-edu-ada-web-wcag` | 28 CFR §§ 35.200-35.205 | alta | **solo entidad pública** |
| 25 | `us-edu-biometria-bipa` | 740 ILCS 14/15, 14/20 | alta | **solo Illinois** · pendiente verif. primaria |
| 26 | `us-edu-proctoring-alternativa-y-apelacion` | 29 U.S.C. § 794 · ADA | alta | proctoring remoto automático |
| 27 | `us-edu-ppra-encuestas-y-marketing` | 20 U.S.C. § 1232h · 34 CFR Part 98 | media | fondos ED + encuestas/marketing |
| 28 | `us-edu-politica-uso-ia` | OET 2023 · DCL 22-jul-2025 (**guía**) | baja | — |

*(28 entradas; el "24" del encabezado se refiere a los controles **obligatorios**: 4 de ellos —2, 19, 28
y 20— son de refuerzo, condicionales o de guía y podrían fusionarse si el pack queda largo.)*

### F.2 Riesgos de **copy prohibido** específicos de este pack

`scripts/check-prohibited-copy.mjs` solo escanea `src`, así que este memo no lo activa, pero
`src/lib/policy-packs/us-educacion.ts` **sí** se escaneará. Puntos donde es fácil resbalar:

- **"FERPA compliant"** es el término de arte del mercado EdTech y va a querer colarse solo. **Prohibido.**
  Alternativa: *"declara haber documentado la excepción de school official"*.
- **"El proveedor está certificado bajo SOPIPA"** — SOPIPA **no tiene certificación**. Escribir
  *"el proveedor se ha autocalificado como sujeto a SOPIPA"*.
- **"Safe Harbor de COPPA"** existe de verdad (`16 CFR § 312.11`, programas aprobados por la FTC) — pero es
  del **operador**, no del centro, y **no** es un veredicto de cumplimiento del cliente. Si se menciona,
  encuadrarlo como *"evidencia declarada por el proveedor"*.
- **"Libre de sesgo" / "no discriminatorio"** al hablar de la revisión de equidad. Usar *"resultados
  medidos y documentados"*.
- Los verbos siguen siendo **de la organización**: *"tu organización exige al proveedor…"*, nunca
  *"Attesta verifica que el proveedor…"*.

### F.3 Las tres incertidumbres que más pesan

1. **¿Es una inferencia de IA un *education record*?** (control 6, el más vendible del bloque FERPA).
   La lectura textual es fuerte —*"maintained by… a party acting for the agency"* + FERPA no distingue dato
   bruto de derivado— pero **no hay pronunciamiento del ED ni del PTAC** para salidas de IA. Si el ED
   dijera lo contrario, se cae el encadenamiento con los controles 7 y 5. **Redactar siempre como zona
   gris.**
2. **La permanencia de la rescisión del impacto dispar** (24-jul-2026, 91 FR 46733). Es una **regla final
   sin notice and comment**, candidata natural a impugnación bajo la APA. Si se anula o se suspende, el
   control 20 vuelve a severidad alta. **Ponerle fecha de revisión corta en el radar de vigilancia** — es
   el evento regulatorio más volátil de todo el pack.
3. **El alcance real del entrenamiento interno bajo COPPA** (§C.1). Nuestro control 11 se apoya en el
   supuesto de **divulgación a terceros**, que es el que la Regla cubre sin discusión. El uso **interno**
   queda en un terreno donde solo tenemos la sección 5 de la FTC Act y precedentes de desgorgación de
   algoritmos. Si la FTC actúa contra un caso de entrenamiento estrictamente interno con datos de menores,
   sube a control autónomo. Hoy **no podemos afirmarlo como obligación**.

**Bonus (cuarta, resuelta a media sesión):** el texto de BIPA **sí se verificó** al final (§E.2), y al
hacerlo aparecieron dos matices que **habrían hecho el control incorrecto** si se hubiera escrito de
memoria: las **fotografías están excluidas** de la definición de identificador biométrico (luego "grabamos
la webcam" no activa BIPA por sí solo — lo activa extraer la **geometría facial**), y existe una **exención
de instituciones financieras** que un tribunal aplicó a una **universidad**. Es el mejor argumento de esta
sesión para no dar por sabido ningún texto legal: el control iba camino de decir lo contrario de la ley.
