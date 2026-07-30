# Memorándum de investigación regulatoria — Colorado, IA en decisiones consecuentes

**Para:** equipo Attesta (construcción de policy pack)
**Fecha del snapshot:** 2026-07-30
**Objeto:** establecer el derecho vigente en Colorado y definir el contenido del pack
**Naturaleza:** orientación de compliance para preparación de evidencia y autoevaluación. **No es asesoría legal.** Todo el contenido debe pasar por revisión de abogado de Colorado antes de GA.
**Método y su límite (leer antes de citar nada de aquí):** el texto oficial del acto solo está publicado en PDF en `leg.colorado.gov`, y en este entorno **no hay renderizador de PDF**. Las citas y números de subsección se extrajeron del PDF oficial (*Final Act*, 12-may-2026) a través de un proxy de texto (`r.jina.ai`) con cuatro consultas distintas y cruzadas entre sí. Eso da confianza **alta sobre el contenido** y **media sobre la numeración fina de subsecciones** (hubo dos discrepancias entre extracciones, señaladas en §E.3). **Antes de publicar copy con estas citas, alguien debe leer el PDF enrolado con los ojos.**

---

## 0. Hallazgos de primer orden (lo que cambia decisiones)

1. **El número de bill de nuestras notas es CORRECTO: `SB 26-189`.** Firmada por el gobernador Polis el **14-may-2026**; estado en la web de la Asamblea: *"Became Law"*. Nuestras notas internas (`PENDIENTES.md §? "Pack Colorado AI Act (SB 26-189)"`, `regulatory-watch.ts`, landing) no necesitan corrección de número. Lo que faltaba —y ya está establecido— son **las secciones**: la ley vive en **C.R.S. §§ 6-1-1701 a 6-1-1709** (Parte 17 del Artículo 1 del Título 6, *derogada y reexpedida* por la SECCIÓN 1 del acto).
2. **El nombre "Colorado AI Act" ya es un nombre heredado, no el de la ley.** El título oficial de SB 26-189 es **"Automated Decision-Making Technology"**. La ley no regula "sistemas de IA de alto riesgo", regula **ADMT** que *materially influence* una *consequential decision*. **Recomendación de producto:** renombrar la etiqueta del marco a **"Colorado ADMT Act (SB 26-189)"** (hoy `regulatory-watch.ts` dice "Colorado AI Act (SB 26-189)"; es defendible pero invita a que el cliente busque material del régimen viejo).
3. **Fecha exigible: 1-ene-2027, y aplica a decisiones tomadas en/después de esa fecha.** Cláusula propia del acto (SECCIÓN 5(1) y 5(3)). Nuestro evento de radar `us-co-aiact-effective` fechado 2027-01-01 **es correcto**. ⚠️ La ficha web del bill mostró además un campo de *effective date* de **12-ago-2026** (regla genérica de "90 días tras el cierre de sesión"): **no usar ese campo**; la cláusula del propio acto manda.
4. **Desapareció todo el andamiaje "estilo EU AI Act".** El nuevo texto **no exige** programa de gestión de riesgos, **no exige** impact assessment, **no menciona NIST AI RMF ni ISO/IEC 42001** en ninguna parte, y **no impone deber de notificar al Attorney General** el descubrimiento de discriminación algorítmica. Los tres eran el corazón de la SB 24-205 y los tres murieron con ella. Consecuencia comercial directa: **no podemos vender "NIST AI RMF = defensa afirmativa en Colorado"** — ese *safe harbor* ya no existe (existía en la SB 24-205 § 6-1-1706(3)).
5. **Desapareció también la exención de pequeña empresa.** La SB 24-205 eximía parcialmente al deployer con **menos de 50 empleados a tiempo completo**. En SB 26-189 **no aparece ningún umbral** por empleados, ingresos ni número de consumidores: el sujeto es *"a person doing business in Colorado that deploys a covered ADMT"* (§ 6-1-1701(7)). Para nuestro ICP (200–2.000 empleados) esto es **peor** que antes: menos deberes, pero **sin puerta de salida por tamaño**.
6. **Ambigüedad de primer orden — la ventana 30-jun-2026 → 31-dic-2026.** La SB 25B-004 (sesión especial, firmada 28-ago-2025) movió la efectividad de la SB 24-205 a **30-jun-2026**. La SECCIÓN 1 de SB 26-189 deroga y reexpide la Parte 17 **con efecto 1-ene-2027** (SECCIÓN 5(1)), y en el texto extraído **no aparece ninguna cláusula** que adelante la derogación ni que toque el "30 de junio de 2026". Lectura literal: el texto de 2024 **estuvo técnicamente en los libros** desde el 30-jun-2026 y lo estará hasta el 31-dic-2026. Pero **múltiples despachos afirman lo contrario** ("nunca entró en vigor", "fue derogada antes de que llegara la fecha"). Y de hecho **nadie lo está aplicando**: en `xAI LLC v. Weiser` (D. Colo., demanda 9-abr-2026; DOJ intervino el 24-abr-2026) el tribunal aprobó el **27-abr-2026** una suspensión conjunta de la aplicación, y la SB 24-205 nunca tuvo acción privada (solo AG). **Postura recomendada para el pack:** no construir controles sobre el régimen viejo; incluir una nota que diga que si la organización usó IA en decisiones consecuentes en Colorado entre el 30-jun-2026 y el 31-dic-2026, **conserve los registros de esa ventana y pida lectura de abogado**, porque la exposición residual es una cuestión abierta y no una que podamos cerrar nosotros.
7. **La mitad del contenido operativo lo escribe el Attorney General, no la ley.** El acto ordena al AG adoptar reglas **antes del 1-ene-2027** sobre (a) el contenido/forma de la divulgación posterior a un resultado adverso (§ 6-1-1704(4)) y (b) la aclaración de **"materially influence"**, con presunciones y ejemplos (§ 6-1-1706(5)). Esas dos reglas deciden **quién queda cubierto** y **qué hay que escribir en la carta al consumidor**. Estado a hoy: pre-rulemaking abierto el **23-jun-2026**, comentarios cerrados el **13-jul-2026**; el AG anunció la fase formal (borrador + audiencia) "a final de verano". Por tanto: el pack se redacta como **orientativo y sujeto a los reglamentos del AG**, igual que hacemos con el Digital Omnibus.

---

## A. Ficha de la ley

| Campo | Dato | Fuente |
|---|---|---|
| Nombre oficial del acto | **"Automated Decision-Making Technology"** (SB 26-189) | primaria (ficha del bill + acto) |
| Nombre coloquial | "Colorado ADMT Act"; a veces "Colorado AI Act" por herencia | secundaria |
| Bill | **SB 26-189**, 2ª sesión ordinaria, 75ª Asamblea General | primaria |
| Estado | **Became Law** — firmada **14-may-2026** (aprobada por la Asamblea el 9-may-2026) | primaria |
| Código | **C.R.S. §§ 6-1-1701 – 6-1-1709**, Parte 17, Art. 1, Título 6 (*repeal and reenact, with amendments*) | primaria (SECCIÓN 1 del acto) |
| Otras secciones tocadas | C.R.S. § 6-1-105(1)(uuuu) (práctica comercial engañosa); C.R.S. § 10-3-1104.9(3)(e) (reglas del comisionado de seguros sobre avisos) | primaria (SECCIONES 2 y 3) |
| Efectividad | **1-ene-2027** (SECCIÓN 5(1)); **aplica a decisiones consecuentes tomadas en o después del 1-ene-2027** (SECCIÓN 5(3)) | primaria |
| Efectivo desde la firma | §§ 6-1-1704(4), 6-1-1705(3), 6-1-1706(6); § 10-3-1104.9(3)(e); SECCIONES 4, 5 y 6 — es decir, **las habilitaciones de reglamento y la apropiación** | primaria |
| Apropiación | **$46.190** al Department of Law, FY 2026-27 (≈0,4 FTE) | primaria |
| Predecesora | **SB 24-205** ("Consumer Protections for Artificial Intelligence", C.R.S. § 6-1-1701 y ss., 2024), aplazada a **30-jun-2026** por **SB 25B-004** (firmada 28-ago-2025) y **derogada/reexpedida** por SB 26-189 | primaria |
| Enforcement | **Exclusivo del Attorney General** vía Colorado Consumer Protection Act; la infracción es *deceptive trade practice*; **sin nueva acción privada** | primaria |
| Periodo de subsanación | **60 días** tras notificación de infracción, antes de que el AG pueda demandar; esa subsección **se deroga el 1-ene-2030** | primaria |

### Sujetos cubiertos

- **Deployer** — § 6-1-1701(7): *"a person doing business in Colorado that deploys a covered ADMT"*. **Sin umbral de tamaño.** Este es nuestro ICP.
- **Developer** — § 6-1-1701(8): *"a person doing business in Colorado that develops, offers, sells, leases, licenses, or otherwise makes commercially available a covered ADMT"*. Ojo al **"doing business in Colorado"**: un proveedor sin nexo en Colorado puede quedar **fuera** del deber del § 6-1-1702 (ver trampa C.4).
- **Consumer** — § 6-1-1701(4): incluye expresamente **empleados** y **candidatos a empleo residentes en Colorado**, e individuos evaluados en decisiones consecuentes por quien hace negocios en Colorado. → **el pack de RRHH es el caso central.**
- **No se encontró exclusión del sector público** ni definición que excluya a agencias estatales. *(Certeza media: ausencia verificada por extracción, no por lectura completa.)*

### Definiciones que deciden el alcance

- **ADMT** — § 6-1-1701(2): *"technology that processes personal data and uses computation to generate output, including predictions, recommendations, classifications, rankings, scores, or other information that is used to make, guide, or assist a decision"*. **Excluye** expresamente antimalware/antivirus, calculadoras, bases de datos, almacenamiento, firewalls, registro de dominios, red, filtros de spam/robocalls, corrector ortográfico, **hojas de cálculo sin ML/LLM**, caché y hosting web, herramientas de resumen/organización para revisión humana, y chatbots/LLM usados de forma informal (no contratados para decisiones consecuentes).
- **Covered ADMT** — § 6-1-1701(5): el ADMT **usado para *materially influence* una decisión consecuente**. Es el conmutador de cobertura.
- **Materially influence** — § 6-1-1701(13): la salida del ADMT es un **factor *non-de minimis*** usado para tomar la decisión y **afecta al resultado**, incluso **restringiendo, clasificando, puntuando, recomendando o rankeando** o alterando de forma significativa cómo se toma la decisión. **Pendiente de reglamento del AG.**
- **Consequential decision** — § 6-1-1701(3): decisión/determinación/acción sobre un consumidor relativa a la **provisión o acceso, elegibilidad, selección o compensación** en un *covered domain*; también precio, cost sharing, compensación o términos materiales **diferenciados**.
  **Excluye** (§ 6-1-1701(3)(b)): (I) decisiones rutinarias o de bajo impacto —programación de citas, personalización de aula, enrutamiento administrativo, triaje de atención al cliente, **comunicación** de decisiones, gestión de flujo de trabajo—; (II) publicidad, marketing, recomendación de producto, búsqueda, moderación de contenido; (III) hojas de cálculo que requieren análisis humano manual; (IV) **usar el ADMT para resumir, organizar o presentar información para revisión humana cuando el sistema NO produce puntuación, ranking, recomendación, clasificación, predicción ni otra inferencia**; y usos de ciberseguridad, prevención del fraude y sanciones económicas (salvo reconocimiento facial).
- **Covered domain** — § 6-1-1701(6): (a) matrícula u oportunidad **educativa**; (b) **empleo** u oportunidad de empleo que crea o puede crear relación empleador-empleado; (c) **arrendamiento o compra de vivienda** en Colorado; (d) **servicio financiero o de préstamo**; (e) **seguros** (suscripción, precio, cobertura, adjudicación de siniestros u otras determinaciones que afecten materialmente el acceso a prestaciones); (f) **servicios de salud**; (g) **servicios gubernamentales esenciales y prestaciones públicas**.
- **Adverse outcome** — § 6-1-1701(1): decisión que **deniega, termina, revoca o reduce/restringe materialmente** el acceso del consumidor, o que resulta en precio/coste/compensación diferenciados **materialmente menos favorables**.
- **Meaningful human review** — § 6-1-1701(15): revisión por una **persona designada por el deployer con autoridad para aprobar, modificar o anular** la decisión, **con formación**, que considera la evidencia y tiene acceso a información sobre las salidas del sistema y sus limitaciones materiales (sin obligar a revelar información propietaria). **Ojo: en Colorado esto es un REMEDIO que se ofrece al consumidor, no una excepción que te saque del alcance** (a diferencia del *meaningful human involvement* de la ADMT de California).
- Otras definidas: (9) employee, (10) employer, (11) FERPA, (12) intentional and substantial modification, (14) material update, (16) personal data, (17) trade secret.

### Developer vs deployer (y el reencuadre que usamos)

| | Qué le toca | Cómo lo escribimos nosotros |
|---|---|---|
| **Developer** (§ 6-1-1702) | Desde el **1-ene-2027**, poner a disposición de **cada deployer** documentación técnica: usos previstos y usos **dañinos o inapropiados conocidos**; categorías de datos de entrenamiento; limitaciones y riesgos conocidos; instrucciones de uso, monitorización y **revisión humana significativa**; e información para que el deployer atienda sus propios deberes. Avisar de *material updates* y *intentional and substantial modifications* en plazo razonable (notas de versión públicas valen si hay aviso directo). Conservar registros **≥3 años**. | **Nunca como deber propio del cliente.** Control de deployer: *"tu organización exige por escrito, recibe y conserva la documentación del § 6-1-1702 de cada proveedor, y registra qué falta"*. |
| **Deployer** (§§ 6-1-1703 a 6-1-1705) | Registros ≥3 años; aviso previo; explicación en 30 días tras resultado adverso; derechos de corrección y de revisión humana. | Deber propio. Es el cuerpo del pack. |
| **Reparto de culpa** (§ 6-1-1707) | En acciones por **discriminación ilegal bajo otras leyes** del estado, la culpa se **reparte según culpa relativa** entre developer y deployer; el developer responde **solo** en la medida en que su ADMT se usó de forma prevista/documentada/comercializada/configurada/contratada por él. | Argumento de por qué la documentación del proveedor y el registro de configuración **son tu evidencia**, no burocracia. |

---

## B. Obligaciones del DEPLOYER, una por una (candidatos a control del pack)

Convenciones: `id` en el estilo de los packs existentes; `article` corto para `gap_items.article`; severidad **alta** = deber operativo directo con exposición ante el AG (práctica engañosa) o derecho del consumidor asociado; **media** = condicional, documental de soporte o dependiente de reglamento; **baja** = higiene.
**Todas** las severidades se refieren al régimen **desde el 1-ene-2027**; a fecha de este memo **ninguna es exigible todavía** y así debe decirlo el `note` del pack.

### B.1 `co-admt-alcance-covered` — Determina qué sistemas son *covered ADMT* (orientativo)
- **Qué hacer:** por cada sistema del inventario, decide y **documenta por escrito** tres cosas: (1) si procesa datos personales y genera salidas usadas para tomar, guiar o asistir una decisión (ADMT); (2) si la decisión cae en un *covered domain* (empleo, educación, vivienda, financiero/préstamo, seguros, salud, servicios públicos esenciales); (3) si la salida es un factor *non-de minimis* que afecta al resultado (*materially influence*). Revisa también las exclusiones del § 6-1-1701(2) y (3)(b) y anota **cuál** aplicas y por qué. La clasificación es orientativa y se revisa cuando el AG publique su regla sobre *materially influence*.
- **Evidencia que deja:** ficha de alcance por sistema (fecha, responsable, decisión, exclusión invocada, versión del sistema evaluada) en el expediente del sistema.
- **Cita:** `C.R.S. § 6-1-1701(2), (3), (5), (6), (13)`
- **Severidad:** alta — de esta decisión cuelgan todos los demás controles.
- **Condicionalidad:** ninguna dentro del pack.

### B.2 `co-admt-nexo-colorado` — Delimita el nexo con Colorado y quién es "consumer"
- **Qué hacer:** documenta si tu organización *hace negocios en Colorado* y qué poblaciones evalúa: empleados, **candidatos residentes en Colorado**, clientes, pacientes, estudiantes, solicitantes de vivienda. Un candidato residente en Colorado cuenta aunque el puesto sea remoto o esté en otro estado.
- **Evidencia:** nota de alcance territorial y lista de procesos/poblaciones afectadas, con fecha y responsable.
- **Cita:** `C.R.S. § 6-1-1701(4), (7)`
- **Severidad:** media (es el gate que evita sobre-aplicar el pack, pero equivocarse por defecto es lo peligroso).

### B.3 `co-admt-aviso-previo` — Aviso claro y visible **antes** de usar el sistema
- **Qué hacer:** antes de que el *covered ADMT* se use para influir materialmente en una decisión consecuente, entrega al consumidor un **aviso claro y visible** de que se usó o se usará un *covered ADMT* en una decisión consecuente que le afecta, más **instrucciones para obtener información adicional**. Conserva la plantilla, la versión, la fecha de publicación/entrega y el punto del proceso donde se muestra (p. ej. formulario de solicitud del ATS, portal del empleado).
- **Evidencia:** plantilla versionada + captura del punto de entrega + registro de fecha/responsable.
- **Cita:** `C.R.S. § 6-1-1704(1)`
- **Severidad:** alta.

### B.4 `co-admt-aviso-punto-interaccion` — Vía de aviso público en los puntos de interacción
- **Qué hacer:** la ley admite satisfacer el aviso previo mediante un **aviso público destacado y razonablemente accesible en los puntos de interacción con el consumidor** (típicamente: página de empleo/careers, portal de candidatos, web de servicio). Decide y documenta **qué vía usas** (aviso individual, aviso público, o ambas) y mantén el enlace vivo con fecha de última revisión.
- **Evidencia:** URL, fecha de publicación, historial de cambios, responsable.
- **Cita:** `C.R.S. § 6-1-1704(2)`
- **Severidad:** media — es una **vía de cumplimiento del deber B.3**, no un deber separado. Redactarlo como obligación autónoma sería un error (y es exactamente el error que arrastra el material que describe la ley vieja).

### B.5 `co-admt-explicacion-30-dias` — Explicación en lenguaje claro **dentro de 30 días** de un resultado adverso
- **Qué hacer:** cuando el *covered ADMT* influye materialmente en un **resultado adverso** (denegación, terminación, revocación, reducción/restricción material, o términos materialmente peores), entrega al consumidor, **en 30 días**: (a) descripción en lenguaje claro de la decisión y **del papel que jugó el sistema**; (b) instrucciones para solicitar información sobre el nombre, versión y desarrollador del sistema y los **tipos, categorías y fuentes** de datos personales usados; (c) explicación de **sus derechos** y de cómo ejercerlos. Monta un flujo operativo con dueño, plazo y registro por caso.
- **Evidencia:** plantilla de carta/correo, registro por decisión adversa (fecha del resultado, fecha de envío, canal, quién), cola de casos con SLA.
- **Cita:** `C.R.S. § 6-1-1704(3)(a)-(c)`
- **Severidad:** alta.
- **Condicionalidad / incertidumbre:** el **contenido y formato** exactos están sujetos al reglamento del AG (§ 6-1-1704(4)), que puede diferenciar por dominio. Y hay que **verificar el disparador exacto del reloj de 30 días** (desde el resultado adverso vs. desde otra referencia) en el PDF enrolado antes de publicar el copy.

### B.6 `co-admt-correccion-datos` — Acceso y corrección de datos personales incorrectos
- **Qué hacer:** ante un resultado adverso, ofrece al consumidor **instrucciones para solicitar sus datos personales** y para **corregir datos personales factualmente incorrectos o materialmente inexactos**, y ejecuta la corrección cuando proceda. Ojo al límite legal: **no estás obligado a "corregir" opiniones, predicciones, puntuaciones ni evaluaciones protegidas**; si rechazas, documenta el motivo bajo ese límite. Si la corrección cambia el insumo, define si se re-ejecuta la decisión.
- **Evidencia:** procedimiento, registro de solicitudes (fecha, resolución, motivo del rechazo), evidencia de la corrección aplicada.
- **Cita:** `C.R.S. § 6-1-1705(1)(a)(i)`; límite en `§ 6-1-1705(1)(c)`
- **Severidad:** alta.

### B.7 `co-admt-revision-humana` — Oportunidad de **revisión humana significativa** y reconsideración
- **Qué hacer:** ofrece al consumidor la posibilidad de pedir **revisión humana significativa y reconsideración** de la decisión, *"to the extent commercially reasonable"*. Para que la revisión sea la que describe la ley: **designa por nombre/rol** a quien revisa, con **autoridad para aprobar, modificar o anular**, **fórmalo** (registra la formación), dale acceso a información sobre las salidas del sistema y sus **limitaciones materiales**, y exige que considere la evidencia aportada por el consumidor. Documenta también cómo interpretas *"commercially reasonable"* si limitas el alcance — esa interpretación es tu exposición.
- **Evidencia:** designación del revisor (rol + fecha), registro de formación, plantilla de acta de revisión (qué se revisó, qué evidencia se consideró, resultado, fecha), y nota de criterio sobre *commercially reasonable*.
- **Cita:** `C.R.S. § 6-1-1705(1)(a)(ii)` + definición en `§ 6-1-1701(15)`
- **Severidad:** alta.

### B.8 `co-admt-registros-3-anos` — Conserva registros **≥3 años por decisión**
- **Qué hacer:** conserva los registros razonablemente necesarios para demostrar la preparación de tu organización frente a esta Parte 17 **no menos de tres años desde la fecha de la decisión consecuente** (más si otra ley exige más). Alcance práctico: aviso entregado y su versión, salida del sistema y versión del modelo/configuración, quién decidió, explicación enviada, solicitudes de corrección/revisión y su resolución, documentación recibida del proveedor.
- **Evidencia:** política de retención con el reloj **por decisión** (no por año natural), y el expediente por decisión.
- **Cita:** `C.R.S. § 6-1-1703`
- **Severidad:** media (higiene documental con consecuencia probatoria directa; sube a alta en la práctica si el AG pregunta).
- **Trampa:** el reloj arranca en la **fecha de la decisión**, no en la de creación del documento, y choca con políticas de "borra los datos de candidatos cuanto antes". Si además operas en California, FEHA pide **≥4 años** → gana el plazo más largo.

### B.9 `co-admt-evidencia-proveedor` — Exige y conserva la documentación del **proveedor** (§ 6-1-1702)
- **Qué hacer:** este deber es del **developer**, no tuyo. Tu control es contractual y documental: **exige por escrito** y conserva (a) declaración general de usos previstos y **usos dañinos o inapropiados conocidos**; (b) categorías de datos usados para entrenar; (c) limitaciones y riesgos conocidos; (d) instrucciones de uso, monitorización y **revisión humana significativa**; (e) la información que necesitas para atender tus propios deberes (nombre, versión, desarrollador, tipos/categorías/fuentes de datos personales — justo lo que el § 6-1-1704(3)(b) te obliga a poder entregar). Registra **qué pediste, qué recibiste, qué falta y qué respondió el proveedor**.
- **Evidencia:** cláusula contractual o carta de requerimiento con fecha, paquete documental recibido, y un **registro de brechas del proveedor** (lo que no entregó).
- **Cita:** `C.R.S. § 6-1-1702(1)(a)-(e)` (deber del developer)
- **Severidad:** alta — sin esto, el B.5(b) es imposible de atender y el reparto de culpa del § 6-1-1707 juega en tu contra.
- **Matiz honesto:** el acto **no impone al deployer** el deber de obtener ni revisar esa documentación. Este control es **preparación de evidencia**, no una obligación literal del deployer; el pack debe decirlo así.

### B.10 `co-admt-cambios-version` — Vigila *material updates* y modificaciones sustanciales del proveedor
- **Qué hacer:** el developer debe avisar de **actualizaciones materiales** y **modificaciones intencionadas y sustanciales** en plazo razonable (valen notas de versión públicas si hay aviso directo). Monta el lado receptor: suscríbete a las notas de versión, registra cada cambio recibido con fecha, y **re-evalúa** el alcance (B.1), el aviso (B.3) y la explicación (B.5) cuando el cambio pueda alterar el papel del sistema en la decisión.
- **Evidencia:** bitácora de versiones del sistema con fecha de aviso y decisión de re-evaluación.
- **Cita:** `C.R.S. § 6-1-1702(2)` + definiciones `§ 6-1-1701(12), (14)`
- **Severidad:** media.

### B.11 `co-admt-accesibilidad-avisos` — Avisos accesibles y en idioma comprensible
- **Qué hacer:** entrega los avisos y divulgaciones de forma **razonablemente accesible** para consumidores con discapacidad y para consumidores con **inglés limitado**. Documenta cómo (formato accesible, traducciones disponibles, canal alternativo).
- **Evidencia:** versiones accesibles/traducidas de las plantillas + nota de criterio.
- **Cita:** `C.R.S. § 6-1-1704(7)`
- **Severidad:** media.

### B.12 `co-admt-secreto-comercial` — Retención de secreto comercial **con aviso al consumidor**
- **Qué hacer:** no estás obligado a revelar un secreto comercial ni información protegida por ley estatal o federal; **pero si retienes información por ese motivo, debes notificarlo al consumidor**. Define de antemano qué se retiene, con qué base, y usa una plantilla de aviso de retención.
- **Evidencia:** criterio de retención documentado + registro de casos en que se aplicó y aviso enviado.
- **Cita:** `C.R.S. § 6-1-1704(5)`
- **Severidad:** baja-media (higiene, pero el olvido del aviso convierte una negativa legítima en una omisión reprochable).

### B.13 `co-admt-solapes-sectoriales` — Documenta la vía sectorial que te aplica
- **Qué hacer:** identifica si tu caso entra por una vía sectorial y **documenta cuál**, porque cambia qué entregas:
  - **Crédito/préstamo:** el acreedor que atiende los requisitos federales de **ECOA** y **FCRA** satisface esta sección **sin aviso separado ni duplicado** (`§ 6-1-1704(6)`).
  - **Educación:** el deployer sujeto a **FERPA** puede atender los deberes a través de sus **procedimientos existentes de inspección, revisión y enmienda del expediente del estudiante** (`§ 6-1-1704(8)` y `§ 6-1-1705(2)` — *numeración a verificar*).
  - **Seguros:** el asegurador (y afiliadas) **se considera que satisface la Parte 17 en la práctica de seguros** (`§ 6-1-1708(1)(a)`), con aviso/divulgación si no se le considera así (`(1)(b)`); **pero los usos de empleo siguen dentro** (`§ 6-1-1708(2)`).
  - **Salud:** las §§ 6-1-1701 a 6-1-1706 **no aplican** a una *covered entity* de **HIPAA** — **salvo decisiones consecuentes de empleo** (`§ 6-1-1708(3)(a)`) — y hay un deber de divulgación para **elegibilidad de asistencia financiera / atención con descuento** (`§ 6-1-1708(3)(d)`).
  - **Dispositivos médicos FDA:** las §§ 6-1-1701 a 6-1-1706 **no aplican** (`§ 6-1-1708(4)`).
  - No se crean divulgaciones que choquen con **HIPAA** ni con **Gramm-Leach-Bliley** (`§ 6-1-1708(5)-(6)`).
- **Evidencia:** nota de mapeo sectorial por sistema (qué vía, por qué, quién lo decidió, fecha).
- **Cita:** `C.R.S. § 6-1-1708`; `§ 6-1-1704(6)`, `(8)`; `§ 6-1-1705(2)`
- **Severidad:** media.
- **Condicionalidad:** solo si operas en seguros, salud, crédito o educación.

### B.14 `co-admt-vigilancia-reglamento-ag` — Vigila el reglamento del AG y el reloj de subsanación
- **Qué hacer:** asigna un responsable de seguir el rulemaking del Attorney General (reglas obligadas **antes del 1-ene-2027** sobre la divulgación posterior a resultado adverso y sobre **"materially influence"**) y de re-revisar B.1/B.3/B.5 cuando se publiquen. Registra también en tu procedimiento el **periodo de subsanación de 60 días** tras una notificación de infracción del AG (y que esa subsección **se deroga el 1-ene-2030**), para que exista una ruta interna de respuesta con dueño.
- **Evidencia:** entrada en el registro de vigilancia regulatoria (fuente, fecha de revisión, responsable) + procedimiento de respuesta a notificación del AG.
- **Cita:** `C.R.S. § 6-1-1704(4)`, `§ 6-1-1705(3)`, `§ 6-1-1706(5)`, `§ 6-1-1706(3)`
- **Severidad:** media.

### B.15 (opcional, marcado como buena práctica) `co-admt-trazabilidad-antidiscriminacion`
- **Qué hacer:** la Parte 17 **no exige** programa de gestión de riesgos, impact assessment, testing de sesgo ni auditoría. Pero el § 6-1-1707 mantiene la responsabilidad por **discriminación ilegal bajo otras leyes** y reparte la culpa **según culpa relativa**, y limita la del developer a los usos previstos/documentados/configurados/contratados por él. Documenta por tanto: configuración y umbrales que eligió tu organización, desviaciones respecto de las instrucciones del proveedor, y el resultado de la revisión humana. Es **preparación de evidencia**, no una obligación de la Parte 17, y el control debe decirlo textualmente.
- **Cita:** `C.R.S. § 6-1-1707(1), (2), (5)`
- **Severidad:** baja (no exigible por esta ley).

**Lo que NO existe y no debe aparecer como control** (verificado contra el texto): programa de gestión de riesgos; impact assessment (ni contenido mínimo ni periodicidad); referencia a **NIST AI RMF** o **ISO/IEC 42001**; **defensa afirmativa** por seguir un marco reconocido; **notificación al Attorney General** al descubrir discriminación algorítmica (los 90 días de la SB 24-205 **desaparecieron**); declaración pública anual de gestión de riesgos; exención por número de empleados; acción privada.

---

## C. Trampas del vertical (lo que el mid-market hace mal aquí)

**C.1 Construir el pack —o el plan de acción— sobre la ley vieja.** Es la trampa nº 1 y es de contenido, no de forma: la mayoría del material publicado (incluidos artículos de 2025 y guías de proveedores) describe **impact assessments anuales, programa de riesgos alineado a NIST, aviso público de gestión de riesgos y notificación al AG en 90 días**. Nada de eso está en el derecho vigente para 2027. Si nuestro pack los incluye, generamos trabajo inútil y perdemos credibilidad en la primera revisión de un abogado de Colorado. *(Acción interna: `PENDIENTES.md` describe el pack como "gestión de riesgos + impact assessments"; hay que corregir esa descripción.)*

**C.2 "Somos pequeños, estamos exentos."** Falso a dos niveles. Primero, **el umbral ya no existe** (SB 26-189 no tiene exención por tamaño). Segundo, la exención vieja **nunca eximía de todo**: la SB 24-205 liberaba al deployer con <50 FTE solo de una **parte** (programa de riesgos / impact assessment) y **solo si** no entrenaba ni personalizaba sustancialmente el sistema con sus propios datos, lo usaba únicamente para los usos divulgados por el developer y ponía a disposición del consumidor el impact assessment del developer. El aviso al consumidor y el derecho a apelar seguían aplicando. *(Contraste basado en fuentes secundarias + PDF oficial de SB 24-205; certeza alta en la cifra de 50 FTE, media en la lista exacta de condiciones.)*

**C.3 "Cumplimos NIST AI RMF, tenemos safe harbor."** La defensa afirmativa por seguir el **NIST AI RMF** o un marco reconocido existía en la **SB 24-205** (§ 6-1-1706(3)), y exigía además **descubrir y subsanar** la infracción por medios propios (testing interno, red-teaming o feedback de usuarios). **No sobrevivió.** Lo que hay hoy es un **periodo de subsanación de 60 días** tras notificación del AG, y **se deroga el 1-ene-2030**. ISO 42001 y NIST siguen siendo valiosos como *cómo* hacer las cosas, y siguen siendo nuestro land-and-expand, pero **no como escudo legal en Colorado**.

**C.4 El ATS comprado a un tercero (nuestro caso típico de RRHH).** Tres cosas que la gente confunde:
- Los deberes de los §§ 6-1-1703 a 6-1-1705 **son tuyos como deployer**, comprado o construido; no se transfieren por contrato.
- El deber de documentación del § 6-1-1702 recae en el **developer "doing business in Colorado"**. Si tu proveedor no tiene nexo en Colorado, o simplemente **no entrega**, tú **sigues** obligado a poder decir el nombre, la versión, el desarrollador y los **tipos/categorías/fuentes de datos personales** (§ 6-1-1704(3)(b)) y a ofrecer revisión humana informada. → **la palanca es el contrato**, no la ley: pídelo en la renovación, ponlo como requisito de compra y **registra la negativa** si la hay (esa negativa es un dato de riesgo, y con el § 6-1-1707 delante, tu registro de qué pediste importa).
- Además, el acto **no obliga al deployer a revisar** esa documentación. Quien monte su preparación esperando que el proveedor "tenga que darlo todo" se queda sin evidencia y sin recurso.

**C.5 "Hay un humano al final, así que no aplica."** Error importado de California. En Colorado, *materially influence* se satisface con que la salida sea un factor **non-de minimis** que afecte al resultado, **incluyendo restringir, rankear, puntuar, recomendar o clasificar**. El cribado que descarta el 80% de los CV antes de que un reclutador mire **influye materialmente**. La única exclusión cercana (§ 6-1-1701(3)(b)(IV)) es estrecha: resumir/organizar/presentar información para revisión humana **sin producir puntuación, ranking, recomendación, clasificación, predicción ni inferencia**. Y el *meaningful human review* del § 6-1-1701(15) es el **remedio** que ofreces, no una excepción de alcance. Cuidado con copiar la lógica del *meaningful human involvement* del reglamento ADMT de California: **no es la misma pieza**.

**C.6 Hospitales, clínicas y aseguradoras que se creen fuera.** La exención HIPAA (§ 6-1-1708(3)(a)) **no cubre las decisiones de empleo**, y hay deber de divulgación para **elegibilidad de asistencia financiera/atención con descuento**. La vía de seguros (§ 6-1-1708(1)) se considera satisfecha **en la práctica de seguros**, pero los **usos de empleo siguen dentro** (§ 6-1-1708(2)). Traducción para el cliente: *"tu exención sectorial no cubre tu ATS"*.

**C.7 El reloj de retención mal montado.** Tres años **desde la fecha de cada decisión consecuente**. La gente lo implementa como "guardamos 3 años de logs" y luego no puede reconstruir **una** decisión concreta: qué versión del modelo, qué aviso se mostró, quién revisó. El expediente **por decisión** es lo que se pide.

**C.8 Esperar a enero para montar los flujos.** Dos de los deberes son de **proceso con SLA** (explicación en 30 días; revisión humana a petición) y uno es de **canal público** (aviso en el punto de interacción). No se improvisan en diciembre, y aplican a decisiones **desde el 1-ene-2027** — es decir, a la campaña de contratación que ya estará en marcha.

**C.9 Confundir esta ley con la ley de chatbots.** Colorado firmó además el **Chatbot Safety Act (HB 26-1263, firmada 1-jul-2026, efectiva 1-ene-2027)**, que va en el **mismo rulemaking** del AG. Es **otra** ley y **otro** pack (afecta a nuestro `atencion-cliente-genai`). No mezclar. *(Certeza: media-alta; fuente secundaria + la propia página de rulemaking del AG que trata ambas.)*

---

## D. Solape con los packs que ya tenemos

| Control de Colorado | Se solapa con | Qué reutilizar / qué NO duplicar |
|---|---|---|
| B.3/B.4 aviso previo | `us-hiring` (NYC LL144 aviso a candidato, 10 días hábiles), `us-ca-admt` (aviso previo §7220), `rrhh` (informar a trabajadores, Art. 26.7) | **Un solo artefacto de evidencia**: plantilla de aviso versionada + punto de entrega. Ojo: LL144 exige **10 días hábiles de antelación**; Colorado dice "antes" sin plazo numérico. Colorado admite la vía de **aviso público en el punto de interacción**; LL144 no la sustituye. |
| B.5 explicación en 30 días | `rrhh` (Art. 86 derecho a explicación), `us-ca-admt` (acceso a la lógica §7222) | **Genuinamente nuevo el plazo y el disparador**: 30 días desde resultado adverso, contenido tasado. El Art. 86 de la UE no tiene ese reloj. Reutilizar el mismo expediente por decisión. |
| B.6 corrección de datos | `us-ca-admt` (CCPA), RGPD Art. 16 en `rrhh` | Nuevo el **límite explícito** (no hay deber de corregir opiniones/predicciones/puntuaciones). Vale la pena mostrarlo porque evita promesas imposibles al consumidor. |
| B.7 revisión humana | `rrhh` (Art. 14 supervisión humana; Art. 22 RGPD), `us-ca-feha` (el ADS no sustituye la evaluación individualizada), `us-ca-admt` (revisión humana) | Reutilizar **designación del revisor + registro de formación + acta de revisión**. Nuevo: el qualifier *"to the extent commercially reasonable"* y la definición legal del revisor (autoridad para anular + formación + acceso a limitaciones). |
| B.8 registros 3 años | `us-ca-feha` (**≥4 años**, 2 CCR §11013), `rrhh` (logs Art. 26.6, ≥6 meses) | **No duplicar**: un solo control de retención por sistema con el **plazo más largo aplicable**; el pack de Colorado añade el reloj **por decisión**. |
| B.9/B.10 evidencia del proveedor | `rrhh` (exigir instrucciones de uso / documentación del proveedor), `us-ca-admt` (contrato con el vendedor §7051), capa GPAI (Art. 53.1.b) | Misma mecánica que ya usamos: *exige y conserva*. Añadir a la lista de requerimiento los **cinco ítems del § 6-1-1702(1)**. |
| B.13 vías sectoriales | `credito-seguros`, `educacion` | Nuevo: el **mapeo de vías** (ECOA/FCRA, FERPA, seguros, HIPAA, FDA) es específico de Colorado. Es contenido nuevo pero se apoya en los packs existentes. |
| B.14 vigilancia AG | `regulatory-watch.ts` | Añadir eventos de radar (ver §E) y un `conditional` en los controles afectados. |
| — | `us-hiring` (auditoría de sesgo independiente + publicación del resumen), `us-ca-feha` (testing de impacto dispar) | **Colorado NO exige auditoría de sesgo, ni publicación, ni testing.** No trasladar esos controles al pack de Colorado: sería inventar deberes. |
| — | `rrhh` (FRIA Art. 27, registro en base de datos UE, marcado CE del proveedor) | Sin equivalente en Colorado. |

**Resumen del solape:** de 14-15 controles, ~8 reutilizan artefactos de evidencia que el cliente ya genera para NYC/California/UE (aviso, revisión humana, retención, documentación del proveedor). **Genuinamente nuevo:** la explicación tasada en **30 días** tras resultado adverso, la **corrección de datos con el carve-out de puntuaciones**, la **retención de 3 años por decisión**, el **paquete documental del § 6-1-1702**, el **aviso de retención por secreto comercial**, la **accesibilidad/idioma de los avisos** y el **mapeo de vías sectoriales**. El pack debe decir en su `note` qué se reutiliza, para que el cliente no lo viva como trabajo nuevo.

---

## E. Plazos y estado — con honestidad calibrada

### E.1 Cronología verificada

| Fecha | Hecho | Certeza |
|---|---|---|
| 17-may-2024 | SB 24-205 firmada (efectividad prevista 1-feb-2026) | alta |
| 28-ago-2025 | **SB 25B-004** firmada: aplaza la efectividad a **30-jun-2026** | alta (ficha oficial del bill) |
| 09-abr-2026 | **xAI LLC v. Weiser** (D. Colo.): impugnación constitucional de la SB 24-205 | alta (secundaria coincidente) |
| 24-abr-2026 | El **DOJ** pide intervenir en apoyo de xAI (marco: EO 14365) | media-alta (secundaria) |
| 27-abr-2026 | El tribunal aprueba la **suspensión conjunta de la aplicación** | media-alta (secundaria) |
| 09-may-2026 | La Asamblea aprueba **SB 26-189** | alta |
| **14-may-2026** | **SB 26-189 firmada** — "Became Law". Habilitaciones de reglamento y apropiación **efectivas desde la firma** | alta (primaria) |
| 23-jun-2026 | El AG abre **pre-rulemaking** (ADMT Act + Chatbot Safety Act) | media-alta |
| 01-jul-2026 | **HB 26-1263** (Chatbot Safety Act) firmada; efectiva 1-ene-2027 | media |
| 13-jul-2026 | Cierran los comentarios de pre-rulemaking | media-alta |
| "final de verano" 2026 | Fase **formal** de rulemaking: aviso + reglas borrador + al menos una audiencia | media (anuncio del AG, vía secundaria) |
| **≤ 01-ene-2027** | El AG **debe** haber adoptado las reglas (§§ 6-1-1704(4), 6-1-1705(3), 6-1-1706(5)) | alta (primaria) |
| **01-ene-2027** | **SB 26-189 exigible**; aplica a decisiones consecuentes tomadas en/después de esa fecha; deber de documentación del developer (§ 6-1-1702) | alta (primaria) |
| ene-2028 y anual | El AG informa sobre acciones de enforcement | media-alta |
| **01-ene-2030** | Se **deroga** el periodo de subsanación de 60 días | alta (primaria) |

### E.2 Lo que está pendiente de trámite (redactar pidiendo verificación, nunca como certeza)

1. **Reglamento del AG** (obligatorio antes del 1-ene-2027) sobre **"materially influence"** —con presunciones y ejemplos— y sobre el contenido/forma de la divulgación posterior a resultado adverso. **Decide cobertura y copy.** Redacción para el pack: *"pendiente de los reglamentos del Attorney General; verifica su publicación antes de fijar plantillas y alcance"*.
2. **Litigio.** `xAI v. Weiser` sigue vivo; fuentes secundarias indican que xAI anunció una moción de medida cautelar **contra la propia SB 26-189** y que el AG ha dicho que no aplicará la ley hasta cerrar el rulemaking. **Esto es secundario y volátil: verificar el estado del expediente judicial antes de planificar.** No afirmar en producto que la ley "está suspendida".
3. **Presión federal de preemption** (EO 14365 y la intervención del DOJ en litigios contra leyes estatales de IA). Es un riesgo real sobre la fecha del 1-ene-2027, del mismo tipo que el Digital Omnibus en la UE: **se vigila, no se promete**.
4. **La ventana 30-jun-2026 → 31-dic-2026** (§0.6). Cuestión abierta; el pack la trata como nota de conservación de registros + lectura de abogado.

### E.3 Verificaciones que faltan antes de escribir código (deuda explícita)

1. **Leer el PDF enrolado con los ojos** y confirmar la numeración fina. Dos discrepancias detectadas entre extracciones: (a) la vía **FERPA** apareció una vez como `§ 6-1-1704(9)` y otra como `§ 6-1-1704(8)` (con "(9) no existe"); (b) la cláusula de **"no nueva acción privada"** apareció una vez como `§ 6-1-1709` y otra como `§ 6-1-1706(4)`. La primera lista de secciones incluía `6-1-1709 — No new private right of action`, así que lo más probable es que ambas cosas coexistan (1706(4) y 1709) o que una extracción confundiera el encabezado; **hay que resolverlo**, porque publicamos citas.
2. **Disparador exacto del reloj de 30 días** del § 6-1-1704(3).
3. **Ausencia de exclusión del sector público** y de umbral de tamaño: confirmadas por extracción negativa (más frágil que una cita positiva).
4. **Título exacto de la Parte 17 reexpedida** (para el `name` del pack y la etiqueta del marco).
5. Confirmar si `§ 6-1-1703` tiene una sola subsección (una extracción lo afirmó).

### E.4 Cambios sugeridos en lo que ya tenemos

- `regulatory-watch.ts`: renombrar el marco a **"Colorado ADMT Act (SB 26-189)"**; el evento `us-co-aiact-effective` a 2027-01-01 se mantiene; **añadir** dos eventos: *rulemaking del AG (reglas obligadas ≤ 1-ene-2027)* y *derogación del periodo de subsanación (1-ene-2030)*. Considerar un evento para **HB 26-1263** (chatbots) si abrimos ese frente.
- `PENDIENTES.md`: la descripción del pack ("gestión de riesgos + impact assessments") describe la **ley derogada**; corregirla a *"aviso previo + explicación en 30 días + revisión humana + corrección de datos + retención 3 años"*.
- Landing (`en.ts`/`es`): el chip "Colorado AI Act (SB 26-189 · 2027)" es correcto en número y fecha; si se toca, mejor "Colorado ADMT (SB 26-189 · 2027)".
- `us-hiring.ts`: la cabecera dice *"Colorado (aplazada a 2027) … solo en el radar"*. Sigue siendo cierto, pero cuando exista el pack propio conviene actualizar el comentario para que no parezca que Colorado sigue siendo el régimen viejo.

---

## F. Fuentes

### Primarias (texto legal y órganos oficiales)
- **Ficha oficial de SB 26-189** (título, estado "Became Law", firma 14-may-2026, versiones del texto): https://leg.colorado.gov/bills/sb26-189
- **Texto oficial — *Final Act* de SB 26-189** (PDF; base de todas las citas de §§ 6-1-1701 a 6-1-1709, extraído vía proxy de texto): https://leg.colorado.gov/bill_files/116432/download
- **Texto oficial — *Signed Act* de SB 26-189** (PDF, 14-may-2026): https://leg.colorado.gov/bill_files/116489/download
- **Ficha oficial de SB 25B-004** (aplazamiento de la SB 24-205 a 30-jun-2026; firmada 28-ago-2025): https://leg.colorado.gov/bills/sb25b-004
- **Texto oficial de SB 24-205** (ley derogada; contraste de exención <50 FTE, aviso al AG en 90 días, defensa afirmativa NIST/ISO): https://content.leg.colorado.gov/sites/default/files/2024a_205_signed.pdf
- **Colorado Attorney General — página de rulemaking de IA** (ADMT Act / Chatbot Safety Act / ADAI): https://coag.gov/ai/ *(devolvió 503 en el momento de la consulta — reintentar; es la fuente a citar para el estado del rulemaking)*
- **Colorado AG — formulario de comentarios ADMT/Chatbot**: https://coag.gov/ai/automated-decision-making-technology-act-and-chatbot-safety-act-form/
- **Colorado AG — "ADMT-Chatbot Pre-Rulemaking Considerations Document"** (jun-2026): https://coag.gov/app/uploads/2026/06/ADMT-Chatbot-Pre-Rulemaking-Considerations-Document.pdf *(no leído en detalle; lectura pendiente y muy recomendable)*
- **DOJ — Complaint in Intervention, *US v. Weiser*** (contexto de preemption federal): https://www.justice.gov/crt/media/1437846/dl *(no leído en detalle)*

### Secundarias (despachos y prensa especializada — usadas para contexto, cronología del litigio y contraste con la ley derogada; **ninguna sostiene por sí sola una cita de §A o §B**)
- Norton Rose Fulbright: https://www.nortonrosefulbright.com/en-us/knowledge/publications/18733d31/colorado-enacts-revised-ai-law
- Davis Wright Tremaine: https://www.dwt.com/blogs/privacy--security-law-blog/2026/05/colorado-ai-act-repeal-new-transparency-law
- Epstein Becker Green (enfoque empleadores): https://www.workforcebulletin.com/inside-colorados-senate-bill-26-189-impacts-and-implications-for-employers
- Seyfarth Shaw: https://www.seyfarth.com/news-insights/colorado-enacts-artificial-intelligence-replacement-law.html
- Holland & Knight: https://www.hklaw.com/en/insights/publications/2026/05/colorado-governor-signs-sb-189
- Crowell & Moring: https://www.crowell.com/en/insights/client-alerts/colorado-hits-reset-on-ai-regulation-sb-26-189-repeals-and-reenacts-the-colorado-ai-act *(403 al consultar)*
- Finnegan: https://www.finnegan.com/en/insights/articles/colorado-replaces-landmark-ai-act-an-overview-of-the-new-sb-26-189-framework.html
- Baker Botts: https://ourtake.bakerbotts.com/post/102msga/colorado-repeals-and-replaces-ai-act
- Consumer Finance Monitor (Ballard Spahr): https://www.consumerfinancemonitor.com/2026/05/12/colorado-rewrites-its-landmark-ai-law-unpacking-sb-26-189-and-what-it-means-for-businesses/
- McDermott: https://www.mcdermottlaw.com/insights/colorado-ai-law-in-flux-comprehensive-replacement-bill-signed-after-federal-court-blocks-predecessors-enforcement/
- Proskauer (Law and the Workplace) — litigio: https://www.lawandtheworkplace.com/2026/05/major-developments-put-colorados-ai-law-on-ice-ahead-of-implementation/
- EPIC: https://epic.org/colorado-legislature-again-amends-landmark-ai-law/
- Sandberg Phoenix (xAI v. Colorado): https://sandbergphoenix.com/the-uncertain-future-of-state-ai/
- Available Law (rulemaking, fechas de comentario; y HB 26-1263): https://availablelaw.com/blog/colorado-ai-rules-public-comment-2026 · https://availablelaw.com/blog/colorado-chatbot-law-hb26-1263
- Ogletree / Jackson Lewis / TrustArc / Fisher Phillips (contraste con SB 24-205: exención <50 FTE, 90 días al AG, defensa NIST)

---

## Nota final de encuadre para el copy del pack

- Los verbos son de la organización cliente: *"tu organización documenta / conserva / exige al proveedor / designa al revisor"*.
- Vocabulario: **autoevaluación, preparación para auditoría, brechas identificadas, evidencia declarada, clasificación orientativa**.
- El pack no afirma que la organización esté en regla, ni emite veredictos de aptitud; registra evidencia declarada y brechas.
- `note` sugerido del pack: *"Ley territorial de Colorado (SB 26-189, C.R.S. §§ 6-1-1701 y ss.). Exigible a decisiones consecuentes tomadas desde el 1-ene-2027; hoy no hay obligación en vigor. Contenido sujeto a los reglamentos del Attorney General, pendientes de publicación (deben adoptarse antes del 1-ene-2027) — verifica su estado antes de planificar. Snapshot regulatorio: julio 2026. Orientación de compliance, no asesoría legal."*
- Ningún control lleva `prohibited: true`: esta ley **no tiene prácticas prohibidas** (esa figura es del Art. 5 del EU AI Act).
