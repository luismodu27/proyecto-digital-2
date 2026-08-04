# PENDIENTES.md — Estado y tareas abiertas de Attesta

> **Documento vivo.** Reúne TODO lo que queda por hacer (tuyo y mío) para no perder
> el hilo entre sesiones. Se relaciona con:
> - **[MEMORY.md](./MEMORY.md)** — memoria completa + bitácora (§10) + cómo retomar (§11).
> - **[CLAUDE.md](./CLAUDE.md)** — mapa técnico del código.
> - **[docs/supabase.md](./docs/supabase.md)** — backend/migraciones.
>
> Última actualización: **2026-08-04**.

---

## 🗺️ 0. HOJA DE RUTA 360° — PLAN MAESTRO POR SPRINTS (auditoría 2026-07-30)

> **DECISIÓN DEL FUNDADOR (2026-07-30): se hace TODO, por sprints.** Esta sección es el plan maestro:
> no se descarta nada, solo se ordena. Fuente: auditoría 360° multi-agente (6 lentes en paralelo sobre el
> código real → 39 hallazgos → síntesis priorizada → crítico de completitud). Marca `[ ]`/`[x]` al avanzar.
>
> Reglas que aplican a todo lo de abajo: **Attesta NO certifica** (copy prohibido); **contenido legal
> determinista, cero LLM**; todo lo de "Foso/compliance" pasa **antes** por el `compliance-domain-expert`;
> las **apuestas grandes** llevan checkpoint del fundador antes de arrancar.

### 0.A · SPRINT 1 — blindaje de marca + conversión ✅ COMPLETADO (2026-07-30)
> Los 7 ítems hechos y desplegados. Verificación de cada uno: `tsc + lint + build + check:copy`.
> **Siguiente sprint → 0.B.**
- [x] ✅ **Guard automático contra copy PROHIBIDO en CI** (2026-07-30) — `scripts/check-prohibited-copy.mjs`
      + `npm run check:copy` + paso en `ci.yml`. **20 reglas ES+EN** que detectan el *patrón peligroso*
      (Attesta como sujeto que certifica, afirmación de cumplimiento del cliente, veredicto de aptitud,
      `% de cumplimiento`), **no la palabra suelta** — la lista negra simple daba 18 falsos positivos
      legítimos (marcado CE *del proveedor*, "no como certificador", "garantiza intervención humana" del
      RGPD 22, "ley aprobada por…") y un guard así se desactiva. Ignora **negaciones** y **preguntas de
      FAQ**; escape hatch `attesta-copy-ok` (usado en 5 líneas, con motivo). **Se autoprueba** en cada
      ejecución (muestras con reglas esperadas + cobertura de las 20 reglas) → falla si alguien debilita
      una regex. Verificado por ambos lados: atrapa 20 infracciones inyectadas y falla al romper una regla.
- [x] ✅ **Unificar la señal de conversión de la landing** — Hero y cabecera pasan a `/login?signup=1`
      (registro real) con copy "Empieza gratis"; Precios: Diagnóstico y Preparación al registro, Enterprise
      sigue en waitlist (requiere venta asistida). Nuevo `?signup=1` abre el formulario ya en modo registro
      (`AuthForm.initialMode`). De paso se corrigió un dato obsoleto: "Policy packs (5 dominios)" → "(8 packs
      · UE y EE. UU.)".
- [x] ✅ **Teaser de brechas en el plan gratuito** — el muro de Gap assessment ahora muestra cifras REALES
      (brechas abiertas · de severidad alta · sistemas afectados) sin revelar el detalle. `Paywall` acepta
      `stats`; `PaidGate` las recibe como **función** y solo las resuelve si bloquea (el usuario de pago no
      paga queries de un teaser que no verá), con try/catch. Excluye las prácticas prohibidas del Art. 5.
      De paso: el layout tenía el copy del muro **hardcodeado en español** → ahora sale del diccionario.
- [x] ✅ **Interfaz `DataRepo` compartida** — `index.ts` define `DataRepo = typeof supabaseRepo` (el repo real
      es la fuente de verdad, sin duplicar 22 firmas) y afirma que `mock-repo` lo implementa. **Matiz honesto:**
      `tsc` ya fallaba antes, pero con diagnósticos engañosos (los tipos degradaban a `any` y el error salía
      como *"implicitly has an 'any' type"* en páginas del dashboard). Ahora dice *"Property 'getActionTasks'
      is missing"* en `data/index.ts`. Verificado provocando ambos fallos: getter ausente y firma divergente.
- [x] ✅ **StatCards navegables** — "Alto riesgo" → `/dashboard/riesgo`; "% listo" → `/dashboard/gap`.
      El destino ideal (inventario **filtrado** por riesgo) espera al filtro del Sprint 4: no se enlaza a un
      parámetro que hoy se ignoraría.
- [x] ✅ **JSON-LD** — un `@graph` con Organization + SoftwareApplication + FAQPage, todo desde el diccionario
      (bilingüe gratis, sin duplicar copy); precio desde `PLAN_PRICE_LABEL`. Verificado sobre el **HTML
      servido**: 3 nodos, 8 preguntas, 2 ofertas (0/120) y `inLanguage=en` en `/en`. `ld+json` no es
      ejecutable → no necesita nonce de la CSP; se escapa `<` para que ningún texto pueda inyectar marcado.
- [x] ✅ **`createClient()` con `cache()`** — un cliente SSR por render en vez de uno por getter. `cache()` no
      cruza requests → sin riesgo de compartir sesión.

### 0.B · SPRINT 2 — activación + red de seguridad del contenido ✅ COMPLETADO (2026-07-30)
- [x] **Import CSV + enlace de intake compartible** — ✅ **HECHO (2026-07-30)**. Dos caminos, porque son dos
      problemas: el **CSV** sirve cuando la lista YA existe (parser puro con 25 tests: autodetecta el `;` de
      Excel español, cabeceras ES/EN, BOM, comas entrecomilladas, valida e informa **por filas**); el
      **enlace de intake** sirve para construirla preguntando a cada área sin darles cuenta (migración
      **0027**, token de capacidad, bandeja de revisión, `noindex`). Los dos en
      `/dashboard/inventario/importar`. 0027 **aplicada** ✅. `alto · M`
- [x] **Tests con Vitest sobre la lógica pura** — ✅ **HECHO (2026-07-30)**. 274 tests en 10 ficheros (221 al cerrar este ítem; el resto llegó con los ítems siguientes del sprint)
      (`npm test`, <1 s, en CI): `risk-assessment`, `recommendations`, `task-reminders`, `regulatory-watch`,
      `audit`, `bias-audit`, `telemetry/events` y **paridad de los 8 policy packs**. Codifican la expectativa
      REGULATORIA (Art. 5 manda; el perfilado del Art. 6.3 anula excepciones; LL144 = auditoría **y**
      publicación; el catálogo curado gana al pipeline) y la paridad ES/EN. Se verificó que detectan
      regresiones con **6 mutaciones inyectadas** (las 6 fallaron). Encontraron 3 cosas reales: el campo
      `article` sí se traduce en parte (comparar por números, no literal), `minimal: []` es correcto y no un
      hueco, y un `?? "/"` que nunca se activaba en `normalizePath`.
- [x] **Logging / observabilidad de errores** — ✅ **HECHO (2026-07-30)**. `src/lib/observability/log.ts`
      clasifica cada degradación en `migration-pending` (warn), `permission` (RLS, error) o `incident`
      (error) y emite **una línea JSON** por evento, con antirruido de 5 min. Instrumentados los 10
      caminos degradados de `supabase-repo`, más `getOrgPlan` (degradar a `free` una org que paga era un
      incidente de facturación invisible), `getActiveOrg`, las escrituras de `actions.ts` y la telemetría.
      Verificado contra el Supabase real: la telemetría sin migración 0026 emite
      `{"kind":"migration-pending","code":"PGRST205"}` y la app sigue funcionando.
      **Sentry NO se integró a propósito**: sumar un subprocesador es decisión tuya (coste + DPA);
      el enganche está listo (sustituir `emit`). `alto · M`
- [x] **Rama GPAI en el clasificador de riesgo** — ✅ **HECHO (2026-07-30)**. Pregunta nueva (paso 6) con
      cinco casos (tercero tal cual · autoalojado · fine-tuning · marca blanca · ninguno) y una **capa GPAI**
      en el resultado que NO cambia el nivel de riesgo (el Cap. V es un régimen paralelo; decir "alto riesgo
      porque usa ChatGPT" sería falso), sino que añade citas y deberes de **exigir evidencia al proveedor del
      modelo**, y avisa de la trampa del **Art. 25** cuando hay ajuste o marca blanca.
      ⚠️ **PENDIENTE DE VALIDACIÓN EXPERTA:** el texto lo verifiqué yo contra fuentes autorizadas —Arts. 51-56
      aplicables desde el 2-ago-2025 (multas con periodo de gracia hasta ago-2026; modelos previos hasta
      ago-2027); el Digital Omnibus **no** cambió los Arts. 53/55; el criterio de **un tercio del cómputo de
      entrenamiento** es de las **directrices de la Comisión (jul-2025)** y es explícitamente **indicativo**,
      no un umbral del Reglamento; el **Recital 109** limita las obligaciones al alcance de la modificación—
      pero **no ha pasado por el `compliance-domain-expert`** ni por el visto bueno del abogado (§ pendiente
      antes de GA). Está redactado como orientación y revisión jurídica, nunca como veredicto. `alto · M`
- [x] **Verificación local del JWT en el middleware (`getClaims`)** — ✅ **HECHO (2026-07-30)**. El
      middleware ya no pregunta a Supabase Auth por red en cada navegación: verifica la firma del JWT en
      local con WebCrypto. **Comprobado que aplica de verdad**: el proyecto ya firma con llaves
      asimétricas (`alg: ES256`, JWKS público), que es la condición para que sea local — no hace falta
      que toques nada. Verificado por curl con un usuario real `*@attesta-test.dev`: sin sesión
      `/dashboard`→`/login`, con sesión `/login`→`/dashboard`, y una cookie con JWT malformado se trata
      como "sin sesión" (no 500). `alto · M`

> **Cierre del Sprint 2 (6/6 ítems).** Todo verificado con lint + tsc + `check:copy` + **274 tests** + build,
> y los caminos reales por curl contra el Supabase de producción. Las dos migraciones del sprint —**0026** (telemetría)
> y **0027** (intake compartible)— están **aplicadas y verificadas por API** (§1.1-septies), igual que la
> **0028** que salió de ellas (§1.1-nonies). Lo aprendido en cada ítem está en `MEMORY.md §10`.
>
> Novedad de método que conviene conservar: **toda migración nueva se valida antes en un Postgres desechable**
> (ver gotcha en `CLAUDE.md`). En este sprint cazó tres bugs que habrían llegado al SQL Editor —`greatest`/`least`
> cualificados con esquema, un 500 a un anónimo con nombre en blanco, y policies no re-aplicables. Y una cuarta,
> que solo salió al verificar contra el Supabase **real**: `revoke ... from anon` sobre una función no revoca
> nada, porque `EXECUTE` se concede a **PUBLIC** por defecto (→ migración 0028, §1.1-nonies).

### 0.C · SPRINT 3 — monetización + compliance EE. UU. — ✅ COMPLETADO (4/4)
> **Cierre del Sprint 3 (4/4).** Metering por sistemas y asientos + tres packs nuevos: Colorado (SB 26-189),
> servicios públicos esenciales (Anexo III.5.a + III.5.d) y educación EE. UU. (FERPA/COPPA/SOPIPA). El catálogo
> pasa de 8 a **11 packs** y la landing lo declara sola (el número se deriva de `POLICY_PACKS.length`).
>
> **Lo más valioso del sprint no fue lo que se construyó, sino lo que se descartó tras investigar.** En
> Colorado, seis controles que nuestra propia ficha daba por buenos describían una **ley derogada**. En
> servicios esenciales, la ficha incluía utilities que **no entran** por ese punto del Anexo. Y en la UE los
> siete packs llevaban un matiz sobre el Digital Omnibus que **dejó de ser cierto** tres días antes. Tres
> errores de contenido regulatorio que ninguna herramienta de CI habría detectado, y que se habrían presentado
> al cliente como deberes legales.
>
> **Hábito que conviene conservar:** la investigación de los packs se escribe **de forma incremental dentro del
> repo** (`docs/research/`), después de perder un memo entero por un fallo de API justo antes de volcarlo. El
> trabajo largo se guarda mientras se hace.
>
> ✅ **Nada pendiente del fundador en este sprint:** las migraciones **0028** y **0029** están aplicadas y
> verificadas por API (2026-07-30). El metering está activo de punta a punta.


- [x] **Metering por nº de sistemas/asientos + Enterprise a medida** — ✅ **HECHO (2026-07-30)**.
      Cupos: **3 sistemas / 1 usuario** (Diagnóstico) · **25 / 5** (Preparación) · **a medida** (Enterprise, por
      SQL con las columnas `max_systems`/`max_seats` de la migración 0029). Aritmética pura y con tests en
      `billing/limits.ts` (26 tests, 6 mutaciones inyectadas y las 6 detectadas); resolución contra la BD en
      `billing/quota.ts`. Bloquea en los **cuatro** caminos que crean cosas (alta manual, CSV, aceptar ficha de
      intake, invitar) y avisa al 80 % con `QuotaMeter`. Tres decisiones que conviene no revertir sin pensarlo:
      (1) los cupos limitan **crear**, nunca **ver** — bajar de plan no oculta ni borra nada; (2) ante un error
      de la base de datos se **deja pasar** (al revés que en los entitlements: bloquear a quien paga por un
      fallo transitorio es peor que un sistema de más); (3) el CSV importa **lo que cabe** en vez de rechazar el
      fichero entero. Señal nueva `quota_blocked` en el embudo — mide intentos reales, no intenciones. `alto · M`
- [x] **Pack Colorado ADMT Act (SB 26-189)** — ✅ **HECHO (2026-07-30)**. `us-co-admt`, 15 controles ES+EN,
      noveno pack del catálogo. Investigación contra fuente primaria en `docs/research/colorado-sb26-189.md`.
      **Lo que más valor tuvo fue lo que NO se construyó**: la reescritura de 2026 eliminó el programa de gestión
      de riesgos, la evaluación de impacto, el aviso al fiscal en 90 días, la exención de pequeña empresa
      (<50 empleados) y la **defensa afirmativa por NIST AI RMF / ISO 42001** — el acto no menciona NIST ni ISO
      en ninguna parte. Casi todo el material publicado describe esa ley derogada, así que incluir cualquiera
      de esos seis habría generado trabajo inútil al cliente y se habría caído en la primera revisión de un
      abogado. **Consecuencia comercial: no podemos vender "NIST = puerto seguro en Colorado".** Lo que queda:
      aviso previo, explicación en 30 días tras resultado adverso, corrección de datos (con el límite de que no
      hay deber de corregir puntuaciones), revisión humana significativa, expediente por decisión 3 años y
      evidencia exigida al proveedor. Se actualizó además el radar (etiqueta → "Colorado ADMT Act"; el consejo
      pasó de "espera a saber el contenido" a "aplica el pack y no montes gestión de riesgos") y Colorado subió
      de "en el radar" a **cobertura declarada** en la landing. `alto · M`
      ⚠️ **Deuda declarada antes de GA:** el texto oficial solo existe en PDF y la investigación se hizo por
      extracción de texto — alta confianza en el contenido, **media en la numeración fina de subsecciones**.
      Donde hubo discrepancia (la vía FERPA y la cláusula de acción privada) se cita **la sección sin
      subsección**, que sí está confirmada. Hay que leer el PDF enrolado con los ojos y afinar. Igual que los
      demás packs, necesita revisión de abogado —de Colorado— antes de GA.
- [x] **Pack Anexo III.5.a (prestaciones y servicios públicos esenciales)** — ✅ **HECHO (2026-07-30)**.
      `servicios-publicos`, 25 controles ES+EN, décimo pack. Cierra el callejón sin salida: el clasificador ya
      distinguía `public_services` de `credit`/`insurance` (comprobado), así que el enrutado era correcto y lo
      que faltaba era el pack. **Corrección de alcance importante frente a como estaba escrita esta ficha:** los
      **servicios esenciales PRIVADOS (utilities) NO entran** por el III.5.a, que es público y exige cuatro
      elementos simultáneos; el Reglamento los protege **a través** del scoring crediticio (III.5.b, Recital 58),
      que ya cubre `credito-seguros`. Por eso el pack se llama "servicios públicos" y no "servicios esenciales":
      el nombre evita el error nº 1 de este punto. Incluye bloque condicional para **III.5.d** (triaje de
      llamadas de emergencia), donde el modo de fallo es distinto —daño físico inmediato, supervisión en
      segundos— y por eso son controles propios y no el tronco reutilizado. **Dos controles `prohibited`**
      (Art. 5.1.c puntuación social y Art. 5.1.d predicción de delito): son las dos prácticas que una
      administración puede cometer **sin mala fe**, y la frontera del 5.1.c no es de intensidad sino de
      estructura. `alto · M`
- [x] **Pack US de educación (FERPA / COPPA / SOPIPA)** — ✅ **HECHO (2026-07-30)**. `us-educacion`,
      26 controles ES+EN, undécimo pack. Es el más complejo de los cuatro porque combina **cuatro cuerpos
      normativos** con ámbitos distintos, y por eso cada control lleva su condición: FERPA solo con fondos
      federales del ED; COPPA solo si eres **operador** —que normalmente es la EdTech, no el centro, así que
      para un centro son controles de **diligencia sobre el proveedor**—; SOPIPA obliga al operador con nexo en
      California, también por contrato; y antidiscriminación según la naturaleza del centro.
      **Dos hechos recientes que el material del mercado aún no recoge y que cambian el pack:** (1) la regla
      COPPA revisada es **plenamente exigible desde el 22-abr-2026** y la FTC declaró que divulgar datos de un
      menor **para entrenar IA no es «integral»** al servicio → consentimiento parental **separado**; el control
      dice además, en voz alta, que **el entrenamiento estrictamente interno NO lo alcanza** esa subsección —
      afirmar "COPPA prohíbe entrenar IA con datos de menores" sería inexacto, y decirlo es lo que nos hace
      creíbles. (2) El Departamento de Educación **rescindió el impacto dispar de Title VI el 24-jul-2026**
      (regla final sin trámite de comentarios) → el control de equidad baja a severidad **media** y no cita la
      subsección derogada; Section 504, ADA y Title IX no están tocados y ahí sigue la exposición real.
      **Dos zonas grises redactadas COMO grises**, no como resueltas: si una inferencia de IA es un *education
      record* (sin pronunciamiento del ED), y si el colegio puede consentir por los padres bajo COPPA (la FTC
      propuso codificar esa excepción y **no** la codificó). `medio · M`

### 0.D · SPRINT 4 — producto/UX de profundidad ✅ CERRADO (2026-08-03)
- [x] **Búsqueda / filtro / orden en el inventario + vista apilada en móvil** — ✅ **HECHO (2026-08-02)**.
      El estado vive en la **URL** (`?q=&risk=&evidence=&sort=&dir=`) y no en el cliente: el enlace es
      compartible ("mándame los de alto riesgo sin clasificar"), el botón «atrás» hace lo que uno espera y todo
      funciona **sin JavaScript** (la caja es un `<form method="GET">` y los chips son enlaces). Eso desbloquea
      además que la tarjeta «Alto riesgo» del resumen lleve por fin al inventario **ya filtrado**, que era el
      destino que esperaba a este sprint.
      Decisiones que no se ven pero mandan: la búsqueda **pliega acentos** (en un inventario español, teclear
      "seleccion" y no encontrar "Selección" se lee como buscador roto) y combina términos con **Y** ("cribado
      ats" encuentra "Cribado de CVs — ATS"); el orden por riesgo usa el **orden regulatorio** y no el
      alfabético (por enum, `minimal` iría antes que `unacceptable` y lo prohibido acabaría el último de la
      lista); un parámetro **inválido enseña el inventario entero**, nunca cero filas —una pantalla vacía en una
      herramienta de expediente se lee como pérdida de datos—; y el vacío por filtro es una pantalla **distinta**
      del vacío por inventario. Lógica pura en `src/lib/inventory/filter.ts`, 35 tests, 6 mutaciones inyectadas
      y 6 detectadas. Se filtra en memoria a propósito (topes de 3/25/pactado ⇒ decenas de filas): bajarlo a
      Postgres duplicaría la lógica en los dos repos a cambio de nada medible.
- [x] **Navegación móvil tipo drawer** — ✅ **HECHO (2026-08-03)**. Barra superior `sticky` + cajón lateral en un
      **`<dialog>` nativo con `showModal()`**, que regala sin una línea de JS la trampa de foco, la inertización
      del fondo, Escape, la devolución del foco, el bloqueo de scroll y la capa superior (que de paso deshace el
      empate de cuatro `z-50` del repo). El upsell deja de depender del scroll: cabecera con el plan y «N
      secciones requieren un plan superior», e insignia **visible** con el nombre del plan en cada destino
      bloqueado. Siguen navegando al muro a propósito —ahí se emite `paywall_viewed` y vive el teaser con las
      cifras reales—, con un test que congela esa decisión. El catálogo y las reglas de bloqueo salen a
      `lib/dashboard/nav.ts` (puro) para poder probarlas: son reglas COMERCIALES y dentro de un componente
      `"use client"` no se podían. Revisado después con 5 lentes adversariales (32 candidatos → 18 confirmados
      tras doble verificación) y corregido todo; 18 mutaciones en total, 18 detectadas.
      **Cambio visible en escritorio que conviene saber:** el candado del rail ya no tiene `title=` (tooltip al
      pasar el ratón). Se quitó porque `title` no existe en táctil ni con teclado y duplicaba el anuncio del
      lector de pantalla; el texto sigue estando, en `sr-only`. Si prefieres recuperar el tooltip para el
      usuario de ratón, es una línea.
- [x] **Registro de incidentes + revisión periódica de la autoevaluación** — ✅ **HECHO (2026-08-03)**.
      Sección nueva `/dashboard/incidentes` (plan Preparación) + migración **0030** (`incidents` + columna
      `organizations.review_cadence_days`), lógica pura en `src/lib/incidents/` con 46 tests y **13 mutaciones
      inyectadas, 13 detectadas**.
      **La consulta al experto de dominio cambió el diseño tres veces, y las tres importan:**
      1. **Los plazos del Art. 73 (15 / 10 / 2 días) son DEL PROVEEDOR, no tuyos.** El deployer solo los asume
         cuando **no consigue contactar con el proveedor** (el «mutatis mutandis» del último inciso del 26.5).
         Un badge genérico de «te quedan 12 días» habría sido falso para casi todos los casos. Lo que hay: un
         **cronómetro ascendente** desde la fecha de conocimiento (el 26.5 dice «inmediatamente», no da días) y,
         cuando el incidente es grave, una referencia etiquetada **de quién es el plazo**. Solo al marcar
         «no se ha podido contactar con el proveedor» pasa a presentarse como propio.
      2. **La obligación de suspender el uso NO está en la rama del incidente grave**, sino en la del riesgo del
         Art. 79.1. Suena al revés y es el error fácil; `suspensionRequired()` mira `riskArt79` y no mira la
         gravedad, con test que rompe si alguien lo «arregla».
      3. **No existe cadencia de revisión obligatoria** en el Reglamento: el 26.5 es deber continuo y el 27.2
         dispara por cambio, no por calendario. La cadencia (6/12/24 meses, 12 por defecto) se presenta como
         **buena práctica** citando ISO/IEC 42001 y NIST AI RMF GOVERN 1.5 — y hay un guard que **lee el
         diccionario** y falla si ese copy se reescribe como obligación. Los **disparadores por evento** van en
         primer plano porque son los que la norma sí reconoce; los que citan el Art. 27 llevan su condicional
         (esa evaluación **no** la debe una empresa privada de RRHH).
      Otras decisiones que no se ven: **tres fechas separadas** (hecho, conocimiento, nexo causal) porque la del
      medio es la que arranca el reloj ajeno y es el dato de más valor probatorio; **cinco categorías** del
      Art. 3.49 y no cuatro (la letra (a) se parte en muerte / daño a la salud porque el 73 les da plazos
      distintos); `personal_data_breach` como bandera **independiente** para que nadie pierda las 72 h del RGPD
      creyendo que el aviso al proveedor valía por el de protección de datos; `ai_system_id` con `on delete set
      null` para que dar de baja la herramienta **no borre** el expediente. Encuadre temporal arriba del todo:
      el Art. 26 no es exigible para el Anexo III hasta **2-dic-2027**, así que esto es preparación y no una
      obligación vencida.
      De paso, **corregido el copy del Art. 26.6** en `recommendations.ts` (ES y EN): decía *«salvo que otra
      norma exija más»* y el texto legal dice *«salvo disposición en contrario»* — estrechaba la norma en una
      sola dirección. Y **un sistema de la demo pasa a tener la revisión de hace más de un año**
      (`SYS-003`, el peor preparado), porque si no la sección de revisión salía vacía en la demo.
      **Corrección posterior (misma fecha), encontrada verificando contra el Supabase real:** guardar la
      cadencia daba **42501 permission denied**. No era la RLS: la migración **0025** había restringido a
      propósito el `UPDATE` de `organizations` a una lista blanca de columnas (`name, slug`) para que ningún
      cliente pudiera escribirse su propia columna `plan` y ascenderse solo — y 0030 escribía por fuera de esa
      lista. Arreglado con la migración **0031**: RPC `set_review_cadence` `security definer` con el guard de
      owner/admin dentro, el mismo patrón que ya usaba `set_org_jurisdictions`. **El Postgres desechable no
      podía cazarlo** (no reproduce los grants por defecto de Supabase, así que no puede concluir nada sobre
      permisos); es la segunda vez que da un falso verde sobre permisos, después de 0026/0027 → 0028.
      Queda como **`npm run verify:backend`** (`scripts/verify/backend.mjs`, fuera de CI porque necesita
      credenciales reales): comprobaciones por API con dos usuarios `*@attesta-test.dev` en dos
      organizaciones, centradas en el **aislamiento** —que B no alcance el expediente de A ni leyendo, ni por
      id, ni escribiendo, ni por el audit-trail—. De paso destapó un test propio que **pasaba por el motivo
      equivocado**: el rechazo de una cadencia inválida venía del 42501, no del CHECK.
      **Ajustes de organización unificados (misma fecha).** La regla de "quién puede cambiar esto" vivía suelta
      en cada pantalla; ahora está en `src/lib/dashboard/settings-access.ts` (pura, con tests y 4 mutaciones
      detectadas) y la usan la cadencia de revisión y el nexo de jurisdicción. **Cambio de criterio visible:**
      a quien no puede cambiarlo se le enseña **el valor**, no una pantalla vacía —vigilancia ocultaba el nexo
      entero y el radar parecía incompleto sin explicación—. Es el mismo patrón que ya usaba el estado interno
      de cada evento regulatorio. Ojo: esto es **presentación**, no autorización; quien manda son las funciones
      `security definer` del servidor. Verificado forzando la rama de solo lectura sobre un build real, porque
      en demo esa rama no se renderiza nunca.
      **Deuda declarada del experto, antes de GA:** leer el **Art. 113 modificado** por el Reglamento (UE)
      2026/1744 palabra por palabra para confirmar que el Art. 73 queda **fuera** del aplazamiento (hoy es
      inferencia estructural, el mismo patrón ya abierto con el Art. 49); leer el **Art. 27.1 verbatim** para
      confirmar el ámbito subjetivo de la evaluación de impacto; y comprobar si la guía de la Comisión sobre el
      Art. 73 ya se adoptó (borrador de sep-2025, redactado solo para proveedores).
- [x] **Registro de proveedores / terceros (Capa 8)** — ✅ **HECHO (2026-08-03)**. Sección
      `/dashboard/proveedores` (plan Preparación) + migración **0032** (`suppliers` + `supplier_evidence`),
      catálogo de evidencia puro con 25 tests y **9 mutaciones inyectadas, 9 detectadas**.
      **El hallazgo del experto que cambió la feature entera:** el AI Act le da al responsable del despliegue
      **muchísima menos capacidad de exigir de la que nuestro copy sugería**. El único documento que el
      Reglamento le dirige son las **instrucciones de uso (Art. 13)** —que ya llevan dentro las métricas del
      Art. 15, la supervisión humana del Art. 14 y los mecanismos de registro del Art. 12—. El Anexo IV, el
      sistema de gestión de la calidad y el de gestión de riesgos van dirigidos a **autoridades y organismos
      notificados**. Por eso cada elemento del catálogo lleva una **base jurídica** de la que sale el verbo de
      la interfaz, y la pantalla agrupa por ese verbo: **exige** (4 elementos) · **verifica** en fuente pública
      (4) · **pacta en contrato** (8) · **registra que existe** (2). Agrupar por el verbo *es* el mensaje.
      **Palanca que no estábamos usando:** la base de datos del Art. 71 es **pública** e incluye copia de la
      declaración de conformidad y las instrucciones electrónicas (Anexo VIII A.11 y A.12). Hay un canal de
      verificación que no depende de la buena voluntad del proveedor, y ahora tiene estado propio.
      **Lo que NO se modela, a propósito:** ninguna caducidad salvo el certificado de organismo notificado
      (Art. 44) —ni el marcado CE, ni la declaración, ni las instrucciones, ni el registro en la BD de la UE
      caducan, y los 10 años de los Arts. 18/23.5/47.1 son **conservación del proveedor**, no validez; el campo
      de caducidad ni siquiera se ofrece donde no aplica, y el servidor lo descarta igual, así que hacen falta
      dos errores para que salga un aviso falso—; ninguna puntuación ni «% de cumplimiento» de proveedor (sin
      base normativa y copy prohibido: se cuentan elementos); y el desenlace del **Art. 25** es **texto fijo**
      —«puede activar el Art. 25, requiere revisión jurídica»— y nunca un veredicto.
      **Aviso que ahorra una discusión inútil:** para los puntos 2 a 8 del Anexo III (empleo, crédito,
      educación, servicios públicos) la evaluación de conformidad es por control interno y **no interviene
      ningún organismo notificado** (Art. 43.2). Si el proveedor no da número de certificado, casi nunca es que
      lo esconda: es que no existe.
      **Encuadre temporal:** los Arts. 23 y 24 (importador y distribuidor) también están aplazados a
      **2-dic-2027**, así que hoy esto es **preparación contractual** — y ese es justo el argumento: hazlo
      mientras renuevas contratos, que es cuando tienes palanca.
      **Fuera de alcance, a Sprint 5:** las cuatro banderas del Art. 25 **persistidas por sistema** (aquí van
      como bloque informativo, sin guardar) y el cruce sistema × proveedor × elemento (hoy la evidencia cuelga
      del proveedor, con enlace opcional al sistema).
- [x] **Streaming con Suspense en el dashboard** — ✅ **HECHO (2026-08-03)**. La portada hacía un solo
      `Promise.all` de diez consultas y no pintaba **nada** hasta la última. Ahora solo se espera el camino
      crítico —inventario, usuario y nombre de la organización— y de ahí salen ya la cabecera, tres de los
      cuatro KPIs, el donut de riesgo y «requieren atención»; lo demás baja por `<Suspense>`.
      **Medido, no supuesto:** inyectando una consulta lenta de 1,5 s, el shell pasa de **1742 ms a 321 ms**
      (respuesta completa igual, ~1,74 s en ambos). La primera medición dio un falso «ya iba rápido antes»
      porque el marcador que usé —el título de una sección— **también aparece en el diccionario serializado
      del payload RSC**; hay que medir contra algo que solo exista en el HTML renderizado (se usó el `href` de
      una tarjeta). Es la segunda vez que ese payload falsea una medición: conviene recordarlo.
      Decisiones: el **inventario no se transmite** (decide si la página es un panel o una bienvenida, y eso no
      se resuelve a medias) y baja por props a los bloques que lo necesitan, en vez de que cada uno lo vuelva a
      pedir; `getGapItems` pasa a llevar `cache()` porque lo miran dos bloques y sin eso el streaming habría
      duplicado la consulta —saldría más caro que lo que ahorra—; los esqueletos **reservan altura** salvo los
      de avisos, que no se renderizan cuando no hay nada que avisar y dejarían un hueco permanente; y el `now`
      baja por props para que dos `new Date()` no caigan a distinto lado de la medianoche y se contradigan en
      la misma pantalla.
- [x] **Consolidar el onboarding** — ✅ **HECHO (2026-08-03)**. El choque real era peor de lo que decía el
      ticket: quien entraba por primera vez tenía **cero sistemas**, así que recibía la **bienvenida a pantalla
      completa Y el modal del recorrido encima**. Dos bienvenidas simultáneas, una tapando a la otra, en el
      momento en que menos se toleran. Regla nueva —**una a la vez**— en `src/lib/dashboard/onboarding.ts`
      (pura, con tests y 3 mutaciones detectadas): con el inventario vacío manda la pantalla de bienvenida, que
      ya dice lo mismo y además ofrece los caminos para empezar; el recorrido guiado espera a que haya algo por
      lo que guiar, y ahí sí convive con el checklist, que no compite (uno explica, el otro sigue el avance).
      `getAiSystems` pasa a llevar `cache()` para que gatear el modal no cueste una consulta extra por ruta.
- [x] **~~`lang="es"` en bloques regulatorios~~ → 11 textos del pack de California sin traducir** —
      ✅ **HECHO (2026-08-02)**. **La premisa del ticket había caducado**: se escribió cuando el output legal
      solo existía en español, y desde entonces packs, clasificador, vigilancia, recomendaciones y audit-trail
      se tradujeron. Comprobado sirviendo un build de producción en modo demo y barriendo el **texto renderizado**
      (no el payload RSC, que engaña: lleva el `<title>` español del root layout) de 12 rutas del dashboard con
      la cookie `NEXT_LOCALE=en`: todo salía en inglés **salvo el pack de California**. Poner `lang="es"` a ciegas
      habría sido *peor* que no hacer nada — etiquetar como español un texto que ya es inglés estropea el lector
      de pantalla en la dirección contraria.
      Lo que sí había: **8 `conditional` + 2 `article` de `us-ca-admt` y 1 `article` de `us-ca-feha`** con el
      español copiado tal cual en el espejo EN. Traducidos, y **guard nuevo en `packs.test.ts`** con dos reglas
      —identidad literal ES/EN en `title`/`description`/`conditional`, y barrido de palabras funcionales
      españolas en TODOS los campos EN (incluido `article`, donde la identidad es legítima)—. Validado con
      3 mutaciones. Queda fuera, y es lo único que aún justificaría un `lang`: los **datos persistidos** del
      cliente (brechas aplicadas desde un pack, notas, evidencia), cuyo idioma no consta en la BD; arreglarlo
      de verdad es guardar el locale al escribir → **ticket propio, no un parche**.
- [x] **i18n de los muros de pago restantes** (descubierto en el Sprint 1) — ✅ **HECHO (2026-08-02)**. Los 5 que
      quedaban (`plan`, `packs`, `vigilancia`, `equipo`, `actividad`) ya leen del diccionario, replicando el
      patrón de `gap`; `organizaciones` y `seguridad` ya estaban migrados. Con guard
      (`src/lib/i18n/paywall.test.ts`): `tsc` solo cubre media regresión —deriva `Dictionary` de `es`, así que
      falta una clave no compila, pero **pegar el español dentro de `en.ts` sí compila**—, de modo que el test
      exige que las descripciones **difieran** entre lenguas y escanea los `layout.tsx` para que ningún muro
      nuevo vuelva a llevar el copy a mano. 3 mutaciones, 3 detectadas.
- [x] **`viewport`/`themeColor` + manifest mínimo + `noindex` en rutas de auth** — ✅ **HECHO (2026-08-02)**.
      Lo no obvio fue el `noindex`: al ponerlo hubo que **sacar esas rutas de `Disallow` en robots.txt**, porque
      `Disallow` prohíbe *rastrear* y no *indexar*, así que bloquearlas impedía que el buscador viera el propio
      `noindex` (las dos directivas se estorbaban). Siguen bloqueados `/auth` y `/api`, que son route handlers
      sin HTML donde colgar un meta. Verificado sobre el build servido en local.
- [x] **Sección "cómo verificamos el contenido legal"** — ✅ **HECHO (2026-08-03)**. Sección nueva en la
      landing (entre la de evidencia y la de honestidad), ES y EN. Cuatro pasos del proceso —fuente primaria
      antes que código, segunda pasada adversarial, ensamblado determinista sin modelo, guardas automáticas que
      se validan rompiéndolas a propósito—, un bloque de **lo que NO hacemos** (en esta categoría enumerar los
      límites convence más que enumerar capacidades: lo segundo lo promete cualquiera) y **un ejemplo real**:
      el régimen de IA de Colorado derogado, con media docena de obligaciones que dábamos por buenas y que
      describían una norma que ya no existía. Se eligió ese ejemplo porque es verificable y porque enseña lo
      que ninguna comprobación automática puede cazar: no es un fallo de código, es contenido.
      **Decisión que te dejo a ti:** hay una versión más fuerte de esta sección, con ejemplos explícitos de
      *«esto lo dijimos mal y lo corregimos»* (el «exige el Anexo IV» de anoche sería el mejor). Es más
      creíble y encaja con la marca, pero publicar «nos equivocamos» en la portada es una decisión de
      posicionamiento tuya, no mía, así que la sección va con el encuadre neutro («la ley cambia y lo
      detectamos»). Cambiarlo es reescribir un párrafo.

- [x] **Corrección de honestidad: el Anexo IV no es exigible** — ✅ **HECHO (2026-08-03)**, salida de la
      investigación del registro de proveedores. Decíamos *«exige al proveedor la documentación técnica del
      Anexo IV»* en recomendaciones, en dos packs, en el clasificador y en una tarea de la demo. **El
      Reglamento dirige esa documentación a autoridades y organismos notificados, no al responsable del
      despliegue.** Las citas eran correctas; lo que estaba mal era el **verbo**: le prometíamos al cliente una
      palanca que descubre que no tiene en su primera negociación con un proveedor grande. Reescrito partiendo
      por lo que se puede hacer de verdad con cada cosa: **exige** las instrucciones de uso (Art. 13, el único
      documento que la norma le dirige, y que ya lleva dentro las métricas del Art. 15, la supervisión humana
      del Art. 14 y los mecanismos de registro del Art. 12) · **verifica** lo público (marcado CE del Art. 48 y
      la ficha en la base de datos de la UE de los Arts. 49 y 71, que incluye copia de la declaración de
      conformidad) · **pacta en contrato** lo demás (Anexo IV, Arts. 9, 10, 17 y el acceso a los logs si el
      sistema lo opera el proveedor). Corregida también la capa GPAI: el destinatario del **Art. 53.1.b es el
      proveedor del SISTEMA que integra el modelo**, no el deployer — así que se bifurca según si el cliente
      integra el modelo él mismo o usa un producto de terceros.

### 0.E · SPRINT 5 — deuda técnica y robustez restante ⬅️ EN CURSO
- [x] **Guardar el idioma de lo que se escribe (`locale`)** — ✅ **HECHO (2026-08-04)**. Migración **0033**
      (pendiente de pegar, §1.1-undecies) sobre `gap_items`, `risk_assessments` **y `action_tasks`: el mismo
      defecto estaba en las tareas nacidas de una recomendación**, y dejarlo fuera habría obligado a una
      segunda migración. Se escribe en `applyPolicyPack`, `saveRiskAssessment` y `createActionTask` — los tres
      únicos momentos en que el idioma se sabe con certeza; después, la fila ya no lo dice.
      **La decisión que sostiene todo lo demás: `null` significa «no consta» y NO se rellena hacia atrás.**
      El default es español, pero rellenar a ciegas marcaría como españolas las filas de una organización que
      trabajase en inglés, y un `lang` equivocado es **peor que ninguno** (el lector de pantalla cambia de voz
      y pronuncia con la fonética que no es). Por eso `coerceStoredLocale` NO reutiliza `coerceLocale`: aquel
      cae al default porque hay que renderizar algo; aquí caer al default sería inventarse un dato. Hay un test
      que fija esa diferencia y una mutación que lo comprueba.
      Lo guardado **no se traduce al vuelo** —sería reescribir evidencia—: se muestra literal, se etiqueta con
      `lang` solo cuando el idioma consta Y difiere (WCAG 3.1.2), y un aviso por pantalla explica la mezcla para
      que no parezca un fallo. 10 tests nuevos, 5 mutaciones inyectadas y las 5 fallaron.
      Verificado en el HTML **renderizado** (no en el payload RSC, que contiene el diccionario y da falsos
      positivos): interfaz EN + contenido ES → 10 nodos `lang="es"` y el aviso; interfaz ES → solo el `<html
      lang="es">` del layout y ningún aviso. `verify:backend` pasa a 28/28 y se adapta solo a si la 0033 está
      aplicada o no.
- [x] **Aislar la landing del `headers()` del root layout** — ❌ **NO SE HACE. Decisión del fundador
      (2026-08-04): seguridad antes que velocidad.** El ítem daba por hecho que era solo rendimiento y no lo era.
      Un nonce es distinto en cada petición, así que **exige render dinámico**: la landing estática y la CSP con
      nonce en la landing son excluyentes, y la CSP estricta (§0.4) es justo lo que está en cola por activar.
      La alternativa que documenta Next —CSP por hashes con `experimental.sri`— es un flag **experimental** y
      además del compilador antiguo, mientras el proyecto compila con **Turbopack**: lo más probable es que no
      haga nada. En un producto de compliance, aflojar la CSP de la página pública para ganar milisegundos es
      mal negocio de cara a una due-diligence.
      **Y el premio era pequeño:** medido, renderizar la landing cuesta ~13 ms. Lo que de verdad pesa en esa
      página son sus **247 KB de HTML** (el payload RSC va inline), que es una palanca distinta y sin este
      conflicto — anotada abajo como ítem nuevo.
      Lo que sí salió de este ticket: el fallo de `lang` en `/` y la corrección del diagnóstico de §0.4, los dos
      ya arreglados y documentados.
- [ ] **Adelgazar el HTML de la landing (247 KB)** — sale del ítem anterior. El payload RSC viaja inline en el
      HTML, así que es coste en el critical path de la página de mayor valor de conversión. A investigar: cuánto
      de eso es el diccionario i18n serializado (que ya nos ha dado dos falsos positivos al medir) y cuánto son
      componentes cliente que podrían no serlo. `medio · M`
- [x] **Validación de entrada en las Server Actions** — ✅ **HECHO (2026-08-04). Sin Zod, y el ticket estaba
      medio equivocado.** Auditado sobre el código: los **enums SÍ tenían whitelist** en todas las acciones (eso
      se arregló en el blindaje del Sprint 2). Lo que era cierto del todo es lo otro: **ningún campo de texto
      tenía tope**. Un miembro autenticado —o una cuenta comprometida— podía escribir megabytes en la nota de un
      proveedor o el título de una tarea: Postgres los acepta encantado, la factura sube y la pantalla que los
      pinta revienta. Y había un defecto estructural detrás: los ayudantes (`uuid`, `date`, `text`, `on`) estaban
      **copiados en cuatro ficheros**, así que arreglar uno no arreglaba los demás.
      **Por qué no Zod:** hacía falta *un solo sitio con topes*, no un lenguaje de validación. Las acciones no
      devuelven errores por campo (redirigen con un toast), así que los mensajes ricos de un validador aquí
      valen cero, y el proyecto tiene seis dependencias directas a propósito. Si algún día hay que devolver
      errores por campo al formulario, ese es el momento de reconsiderarlo — queda escrito en el módulo.
      **`src/lib/data/form.ts`** con una regla de diseño explícita: **truncar el texto libre, rechazar lo que
      tiene estructura.** Un texto largo casi siempre es alguien pegando de un documento y abortar sería
      castigarle por un fallo nuestro de UI; en cambio un uuid, una fecha o una URL mal formados no tienen nada
      que salvar. **Media URL no es una URL corta, es una URL a otro sitio**, así que esas se rechazan por
      longitud en vez de recortarse.
      **Tres agujeros reales cerrados de paso:** (1) `bias_audit_summary_url` y `evidenceUrl` aceptaban
      cualquier esquema y acaban en un `href` del dossier — un `javascript:` ahí es un XSS almacenado firmado
      por la propia organización; ahora solo http/https. (2) Fechas como `2026-02-31` pasaban la expresión
      regular y llegaban a Postgres (`new Date` no falla: desborda a marzo); ahora se comprueban contra el
      calendario. (3) Los `id` que se interpolan en rutas de redirección (`/inventario/${id}/editar`) se validan
      como uuid: sin eso, un `../..` movía el destino.
      **9 ficheros de acciones** pasan ya por el módulo, cero helpers duplicados. 19 tests, **7 mutaciones
      inyectadas y las 7 fallaron**. Y un **guard sobre el código fuente** (`form.guard.test.ts`, se autoprueba)
      que falla si una acción nueva vuelve a leer texto sin tope — verificado reintroduciendo la regresión a
      mano: la caza y dice en qué fichero y en qué línea. `medio · M`
- [ ] **Rate-limit distribuido (Upstash / Vercel KV)** — el `Map` en memoria no protege en serverless
      multi-instancia; crítico si se extiende a login/reset/checkout. `medio · M`
- [x] **Fail-fast del dominio en build (`NEXT_PUBLIC_APP_URL`)** — ✅ **HECHO (2026-08-04)**.
      🔴 **Requiere una acción tuya antes de que esto llegue a `main` → §1.4.**
      El problema no era que faltara una comprobación: era que había un **default plausible**. Los tres sitios
      que necesitan la URL absoluta repetían `?? "https://attesta-io.vercel.app"`, así que el día que cambie
      el dominio y se olvide la variable, la app **no se rompe** — sigue sirviendo canonical, hreflang, sitemap
      y enlaces de correo apuntando al host viejo, que un buscador lee como «la buena está en otro sitio».
      Ahora hay un único `src/lib/site-url.ts`: la variable manda, en un despliegue sin ella **no hay build**,
      y fuera de un despliegue (tu portátil, CI) se usa `localhost` sin quejarse. Un valor mal escrito falla
      siempre —barra final, ruta dentro, esquema raro—; se **rechaza** en vez de recortarlo, porque adivinar
      la intención produce canonicals a medias que nadie mira hasta que cae el tráfico.
      11 tests, 5 mutaciones inyectadas y las 5 fallaron (la que más importa: volver a poner un default).
      Verificados los cuatro escenarios de build de verdad: despliegue sin variable → falla con el mensaje que
      dice qué poner; con variable → compila y canonical/hreflang/sitemap/robots salen con ese dominio; typo
      con ruta → falla; build local/CI → compila con `localhost`. `medio · S`
- [x] **Revisar `force-dynamic` y consolidar consultas** — ✅ **HECHO (2026-08-04)**. Las dos mitades del
      ticket acabaron en sitios distintos, una en código y otra en una decisión razonada.
      **Lo que se arregló, y no era N+1:** la fachada ya agrupaba bien (cero consultas dentro de bucles; el
      export usa `.in()` por lotes). El coste estaba en otro sitio y era **más caro**: cada getter que
      necesitaba el id del usuario preguntaba a **Supabase Auth por red**, y en el layout eso pasaba **tres
      veces** —`getCurrentUser`, `getUserOrgs` y `getCurrentRole`— antes de pedir un solo dato. Medida aislada
      contra el Supabase real: esa ida y vuelta cuesta **~90 ms, tanto como una consulta de datos entera**.
      Ahora se verifica el **JWT en local**, que es exactamente lo que ya hacía el middleware desde el Sprint 2,
      y `cache()` lo deduplica: **de 3 idas y vueltas de autenticación a 0** en el camino de lectura.
      **Medido, 21 muestras por ruta, con las distribuciones sin solaparse:** portada **505 → 402 ms (−20 %)**,
      equipo **597 → 498 ms (−17 %)**. Verificado antes que nada que sigue funcionando: sesión real por curl,
      `/dashboard` responde 200 y salen el correo, el nombre del perfil y el nombre de la organización.
      **Sobre la seguridad, sin adornos:** `getUser()` detecta una sesión revocada y la verificación local no,
      hasta que el token expira. Pero eso no protegía los datos — PostgREST valida el mismo JWT igual de local,
      así que la RLS los serviría por API de todas formas. Cambiaba cuándo se redirige una pantalla, no a qué
      se puede acceder.
      **Lo que NO se hace, y por qué:** quitar los `force-dynamic` sería un no-op —el layout raíz lee `headers()`
      y eso ya hace dinámica toda la app, decisión que tomaste tú al elegir seguridad en la landing— y abrir
      caché de ruta con invalidación por tag significaría **cachear HTML por inquilino**: un error en la clave
      de caché enseña el expediente de una organización a otra. En un producto multi-tenant de compliance esa
      apuesta no compensa por unos milisegundos. `bajo-medio · M/L`
- [x] **Adelgazar fuentes (Fraunces / Geist_Mono)** — ✅ **HECHO (2026-08-04)**. El peso no estaba donde
      decía el ticket: las tres familias se usan de verdad en la landing (titulares, texto y las tres etiquetas
      en mono), así que no sobraba ninguna. Lo que sobraba era un **eje**: Fraunces se cargaba con `SOFT`
      declarado y **ni una regla de CSS lo usaba** en todo el repositorio, o sea que el navegador se bajaba un
      eje entero para renderizarlo siempre en su valor por defecto. Quitarlo **no cambia un píxel** y baja el
      fichero de **117,9 KB a 65,8 KB**: el critical path de fuentes de la landing pasa de **169,1 KB a
      117,0 KB (−31 %)**, medido sobre los ficheros que la página referencia de verdad.
      Comprobado de paso que `font-display: swap` ya estaba activo (es el defecto de `next/font`), así que no
      hay texto invisible mientras cargan.
      **Tercera opción medida y NO tomada, por si algún día se quiere:** renunciar también a `opsz` y fijar los
      pesos deja el conjunto en **86,9 KB** (30 KB menos todavía). No se hace porque `opsz` es lo que hace que
      un titular grande y un texto pequeño de la misma serif no se vean como la misma letra estirada — eso ya
      no es optimizar, es cambiar el diseño, y es decisión tuya. `bajo · S`

### 0.F · SPRINT 6 — los 8 huecos que el propio panel se dejó fuera (crítico de completitud)
> Confirmados contra el repo: **no hay** analítica, ni páginas legales/privacidad, ni Sentry, ni rutas de ayuda.
- [x] **Telemetría de producto / funnel de activación** — ✅ **HECHO (2026-07-30, adelantado antes del Sprint 2)**.
      De **primera parte** (sin PostHog/Plausible/GA): migración `0026_telemetry.sql` (`product_events` + RPC
      `product_funnel`), catálogo cerrado de 13 eventos (`src/lib/telemetry/events.ts`), API `/api/telemetry`
      (whitelist de eventos de cliente + rate-limit + cuerpo acotado), y panel `/dashboard/telemetria` solo para
      `platform_admins`. Sin IP, sin user-agent, sin PII, y se respetan GPC/DNT. 0026 **aplicada** ✅ (2026-07-30): ya mide.
- [ ] **Cumplimiento propio de Attesta** — no existe página de **privacidad**, **DPA**, lista de
      **subprocesadores** (Supabase UE, Stripe, proveedor de email) ni aviso de cookies. Vender gobernanza de IA
      a mid-market UE sin tu propio DPA **bloquea la compra** en due-diligence y es incoherente con la marca.
      `alto · M`
- [ ] **Ciclo de vida de facturación** (no solo el checkout) — pago fallido, reintentos, degradación de plan,
      cancelación, **idempotencia del webhook** y reconciliación Stripe↔DB. Es donde se pierde MRR en silencio.
      `alto · M`
- [ ] **Borrado / exportación de datos por tenant (GDPR + offboarding)** — no hay derecho de supresión ni
      portabilidad ni borrado de una org al darse de baja. Obligación legal directa **y** requisito que nuestros
      propios packs exigen a los clientes. `alto · M`
- [ ] **Soporte y documentación de usuario** — cero rutas help/docs y ningún canal de contacto in-app; el
      onboarding cubre el primer minuto, no la retención. `medio · M`
- [ ] **Backup / DR y runbook de incidentes** — sin política de backups verificados, RPO/RTO ni plan de
      restauración probado, el audit-log inmutable y la hash-chain son inútiles. `medio · M`
- [ ] **Motion GTM enterprise + captura de leads** — la landing solo tiene waitlist; el ACV de 30-50k $ no es
      self-serve (falta "reservar demo", captura cualificada, handoff a venta asistida). `medio · S-M`
- [ ] **Deliverability de email transaccional (SPF/DKIM/DMARC)** — recordatorios, invitaciones y reset dependen
      del correo; sin dominio autenticado caen en spam y rompen invitaciones/verificación en silencio. Ligado al
      SMTP pendiente del fundador (§1.3). `medio · S`

### 0.G · APUESTAS GRANDES — requieren CHECKPOINT del fundador antes de arrancar
- [ ] **⚠️ Test de sesgo EJECUTABLE (Fairlearn / Evidently)** — hoy solo se *registra* evidencia declarada; el
      cálculo (regla 4/5, paridad) lo hace un consultor a ~500 $/h. Integrarlo convierte a Attesta de "carpeta de
      evidencia" en herramienta que **produce** evidencia: la capa pegajosa de la cuña RRHH (NYC LL144 / FEHA).
      Riesgo: complejidad de integración y de encuadre ("tu organización declara", nunca "certificamos"). `alto · L`
- [ ] **⚠️ Vault de evidencia + paquete de auditoría firmado** — hoy cada control es un "done" autodeclarado
      **sin archivo adjunto**; sin el documento real el "% listo" no aguanta una auditoría. Incluye ZIP con
      manifiesto **SHA-256** verificable (la hash-chain del audit-trail ya existe). **El mayor salto de
      defensibilidad del producto.** `alto · L`
- [ ] **⚠️ Crosswalk ISO 42001 / NIST AI RMF** — mapear cada control a otros marcos: una evidencia sirve para N
      normas. Foso de upsell para equipos GRC; requiere tabla de correspondencias curada por el experto. `alto · L`
- [ ] **⚠️ Contenido regulatorio en INGLÉS (TAM EE. UU.)** — el chrome ya está traducido, pero el output legal se
      sirve solo en español por la "frontera legal". **No es traducir**: depende de que el experto valide cada
      texto legal EN. `alto · L` (cuello de botella = recurso experto)
- [ ] **⚠️ Ampliar el corpus de vigilancia + pipeline con fuente real** — el radar es el flywheel diferenciador,
      pero el "Analista" usa embeddings placeholder; ampliar a EBA/EIOPA, transposición nacional, ISO/NIST, donde
      ya se venden packs. Mantener siempre: la máquina **propone**, el humano **valida**. `medio · L`

### 0.H · Cómo retomar esta hoja de ruta tras un compact
1. Lee esta sección §0 completa (es el plan maestro; no se descarta nada).
2. El orden por defecto es **0.A → 0.B → 0.C → 0.D → 0.E → 0.F**, con **0.G** solo tras checkpoint del fundador.
3. Excepción recomendada: **la telemetría de 0.F** conviene adelantarla (medir antes de optimizar).
4. Cada ítem de *Foso/compliance* (packs, GPAI, crosswalk, corpus) pasa por el `compliance-domain-expert`
   **antes** de escribir texto regulatorio, y se registra en `MEMORY.md §10`.

---

## ⭐ 0-bis. Sesión 2026-07-23 — Landing, Vigilancia y BLINDAJE DE SEGURIDAD

**Todo desplegado a `main`.** Resumen para retomar:

### 0.1 · Landing + Vigilancia (8 PRs · #10–#15)
- Landing: card de **California** + chip de **Colorado (SB 26-189 · 2027)** en la rejilla de cobertura.
- Vigilancia (dashboard): banda de orientación (4 stats) · arreglo del hero duplicado · divisor "Ya en vigor" ·
  **estado interno visible** en hero/tarjetas (StatusChip) · **filtro por estado interno** en la cronología (`?s=`) ·
  **export del radar a PDF** (`/dashboard/vigilancia/informe` + botón "Descargar radar (PDF)").
- Home: widget de próximo hito enriquecido (estado interno + color de urgencia).
- **Decisión del fundador:** los artículos (Art./Anexo) del **dashboard se quedan en mono** (el rechazo del mono era
  SOLO para el landing).

### 0.2 · Seguridad (Fase 1 blindaje + red team, PRs #16–#22)
A petición del fundador ("que un hacker no pueda robar datos nuestros ni de usuarios"). **Auditoría + 3 rondas de red
team adversarial (83 agentes).** Resultado: **aislamiento entre organizaciones intacto en las 3 rondas**; se
encontraron y cerraron **2 fallas HIGH**; ronda 3 limpia (0 hallazgos).
- **Fase 1:** deps `npm audit` = 0 vulns (Next 16.2.11 + overrides sharp/postcss) · **CSP con nonce** (report-only
  estricto + enforce de lo seguro) · HSTS `preload` · **rate-limit** waitlist · cron `api/audit-verify` (tamper-detecting).
- **Fase 2 (red team):** (1) escalada **admin→owner** por INSERT directo (memberships/invitations) → **0024**;
  (2) **bypass de plan Enterprise** gratis por UPDATE directo → **0024 FIX 3 fue un no-op** (revoke de columna no recorta
  grant de tabla) → **rehecho bien en 0025** (revoke UPDATE de tabla + grant solo name/slug); (3) fuga LOW de estado de
  suscripción → **0025**; `plan.ts` dejó de fallar-abierto.
- **Regla aprendida:** verificar grants/revokes EJECUTANDO el exploit, no asumirlos.

### 0.3 · ✅ Migraciones 0023, 0024, 0025 — APLICADAS por el fundador (2026-07-23)
El fundador las pegó en el SQL Editor. Con esto las 2 fallas HIGH quedan **cerradas en la BD real**.

### 0.4 · 🔴 PENDIENTE TUYO restante de seguridad
- [ ] **Promover la CSP a `enforce`** — hoy la política estricta (anti-XSS) va en *Report-Only* (observa, no bloquea).
  Sigue siendo un cambio de **1 línea** en `src/lib/security/csp.ts`. **Avísame y lo hago + valido.**

  **⚠️ Cómo leer el Report-Only de hoy (medido el 2026-08-04, no deducido).** Al mirarlo verás **violaciones de
  `script-src` en todas las páginas**, y la conclusión intuitiva —"no se puede promover, rompería la app"— es
  **exactamente la contraria a la verdad**. Lo que pasa: Next saca el nonce de la política que se manda como
  `Content-Security-Policy` (la aplicada), y la aplicada hoy es la "sin riesgo", que no lleva `script-src`. Sin
  nonce que encontrar, Next no se lo pone a sus ~44 scripts inline, y el Report-Only los reporta. **Al promover,
  el nonce pasa a viajar en esa cabecera y Next empieza a inyectarlo solo.** Comprobado ejecutándolo: de 44
  scripts inline sin nonce a **45 con él**, sin tocar una línea de la aplicación. Hay un test que vigila que el
  nonce siga siendo encontrable por el algoritmo de Next (`src/lib/security/csp.test.ts`).

  **El smoke-test sigue haciendo falta** —login (Supabase), checkout (Stripe), descargar radar— pero para cazar
  allowlists que falten (un dominio de terceros, un iframe), no para el `script-src` de Next.

  **Lo que la promoción SÍ decide, y es una elección tuya:** con nonce, la landing **no puede ser estática**
  (un nonce es distinto en cada petición, y una página estática se genera una vez). Es el cruce del ítem de
  rendimiento del Sprint 5 — ver §0.E.

### 0.5 · 🟡 PENDIENTE MÍO / higiene continua de seguridad
- [ ] **Re-auditar tras conectar el flujo real de Stripe** (cobros/downgrades/reconciliación no se validan por código).
- [ ] **Regla continua:** toda tabla/función nueva nace con su **guard de pertenencia** por defecto (`org in
  (select private.user_orgs())`) — fue justo lo que le faltaba a `org_has_active_subscription`.

---

## 🔴 1. Pendiente TUYO (acciones manuales del fundador)

### 1.1 · Seguridad — clave `sk_live` de Stripe — ✅ ROTADA (2026-07-30)
En una sesión anterior se pegó una **clave secreta LIVE de Stripe (`sk_live_…`) en el chat**. El fundador
la **rotó** (Stripe → *Developers → API keys* → Secret key → *Roll key*) y puso la nueva en las variables
de entorno de Vercel. La clave expuesta ya no sirve para nada.

**Regla que queda para siempre:** ninguna clave secreta (`sk_live`, `sk_test`, `service_role`, contraseñas)
se pega en el chat **nunca**. Van solo a variables de entorno. Si alguna vez se cuela una, se rota igual que
esta — el coste de rotar es un redeploy; el de no rotar, cobros ajenos en tu cuenta.

### 1.1-bis · Migración 0018 (diferenciación de planes) — ✅ APLICADA (verificada 2026-07-30)
**Verificada por API** con la anon key: `GET /rest/v1/organizations?select=plan` → **HTTP 200 `[]`**, mientras
que una columna inventada devuelve `42703 column … does not exist` (prueba de contraste, para no dar por
aplicado algo que solo devolvía vacío por RLS). La columna `organizations.plan` **existe**.

**Consecuencia importante: el gating por plan está ACTIVO.** Ya no se degrada a acceso completo. Ahora mismo:
- Tu cuenta es `platform_admin` → `getOrgPlan` devuelve `enterprise`, **conservas acceso completo**.
- Cualquier organización **sin** suscripción Stripe activa y **sin** `plan` elevado a mano está en **`free`**:
  solo ve **Inventario + Riesgo**; gap, plan, packs, vigilancia, dossier, informe, equipo y actividad
  quedan detrás del muro de pago.
- Una suscripción Stripe `active`/`trialing` sube la org a **preparación** automáticamente (§1.2, ya en LIVE).

Para dar acceso de pago a un cliente **sin Stripe** (cortesía o Enterprise), en el SQL Editor:
```sql
-- ver de un golpe qué plan tiene cada organización y quién está dentro:
select o.id, o.name, o.plan, u.email
from public.organizations o
join public.memberships m on m.organization_id = o.id
join auth.users u on u.id = m.user_id
order by o.name;

-- elevar el plan de una org:
update public.organizations set plan = 'preparacion' where id = '<org-uuid>';
-- o 'enterprise'
```

### 1.4-bis · 🔴 ANTES DE DESPLEGAR: define `NEXT_PUBLIC_APP_URL` en Vercel
**Qué:** Vercel → tu proyecto → *Settings → Environment Variables* → `NEXT_PUBLIC_APP_URL` =
`https://attesta-io.vercel.app` (o tu dominio propio cuando lo tengas), **sin barra final y sin ruta**.
Márcala para *Production* y *Preview*.

**Por qué ahora:** desde el commit del fail-fast, un despliegue **sin** esa variable **no compila** — a
propósito. Antes había un dominio por defecto escondido en el código, y eso hacía que un cambio de dominio
rompiera la indexación y los enlaces de los correos **sin dar ningún error**. Ahora avisa en el acto.

**Riesgo si no la pones:** el build de Vercel falla y no se publica nada nuevo. **La web actual sigue en
pie** (Vercel conserva el último despliegue bueno), así que no hay caída — pero tampoco despliegue, hasta
que la definas. Son dos minutos.

### 1.1-undecies · 🔴 Migración 0033 (idioma del contenido guardado) — PENDIENTE DE PEGAR
**Qué hace:** añade una columna `locale` a `gap_items`, `risk_assessments` y `action_tasks`. Nada más:
tres `alter table … add column if not exists` y sus comentarios. Es **aditiva y re-ejecutable**.

**Por qué hace falta.** El texto regulatorio que Attesta escribe en la base de datos —los controles de un
policy pack, la motivación de una evaluación, las tareas nacidas de una recomendación— se queda congelado
en el idioma en que se creó. Al cambiar la interfaz a inglés, ese texto seguía en español **y nadie sabía
en qué idioma estaba**, así que no se podía ni traducir después ni avisar al lector de pantalla.

**Cómo pegarla:** Supabase → SQL Editor → pegar `supabase/migrations/0033_content_locale.sql` (también está
al final de `supabase/setup.sql`). Validada en un Postgres 16 desechable en **dos pasadas** (correcta y
re-ejecutable) y comprobado que el CHECK acepta `null` y `es`/`en` y rechaza `fr` y `es-ES`.

**No corre prisa:** mientras no la pegues, la app funciona exactamente igual. Verificado por API contra el
Supabase real (`npm run verify:backend`, 28/28): la lectura con la columna falla, el reintento sin ella
funciona, y el idioma simplemente queda como «no consta». Al pegarla, vuelve a ejecutar `verify:backend`
—el script se adapta solo— y pasará a comprobar el CHECK de verdad.

### 1.1-decies · Migración 0029 (topes a medida para Enterprise) — ✅ APLICADA (verificada 2026-07-30)
**Verificada por API:** `organizations?select=plan,max_systems,max_seats` → **200**, mientras una columna
inventada da `42703 does not exist` (prueba de contraste). Ya se pueden pactar topes por organización.

*(Lo que NO se pudo verificar con la anon key: los dos `CHECK` de cordura. Si los quieres confirmar:
`select conname, pg_get_constraintdef(oid) from pg_constraint where conname in
('organizations_max_systems_check','organizations_max_seats_check');` — deben salir dos filas. No es crítico:
el código ignora por su cuenta cualquier tope ≤ 0.)*

Para cerrar un Enterprise a medida (el SQL está también dentro del propio archivo de migración):
   ```sql
   -- ver el consumo real de cada organización antes de pactar:
   select o.id, o.name, o.plan, o.max_systems, o.max_seats,
          (select count(*) from public.ai_systems s  where s.organization_id = o.id) as sistemas,
          (select count(*) from public.memberships m where m.organization_id = o.id) as miembros
     from public.organizations o order by sistemas desc;

   update public.organizations
      set plan = 'enterprise', max_systems = 200, max_seats = 40
    where id = '<org-uuid>';
   ```
3. **Al terminar un contrato, limpia el pacto** (`set max_systems = null, max_seats = null`): el número
   pactado gana sobre el plan, así que si se queda puesto seguirá aplicándose bajo un plan que ya no toca.

### 1.1-nonies · Migración 0028 (endurecer permisos) — ✅ APLICADA (verificada 2026-07-30)
**No arreglaba ninguna fuga: cerraba una segunda cerradura que 0026/0027 habían dejado sin echar.**
**Verificada por API:** `anon` recibe ahora `42501 permission denied` en `intake_links`, `intake_submissions`,
`product_events` (select) y en la función `product_funnel` — el corte ocurre en los permisos, antes de llegar
a la RLS. Y siguen abiertos los dos que deben estarlo: el insert de telemetría (**201**) y `submit_intake`
(**`false`/200**).

Salió al verificar 0026/0027 contra el Supabase **real** (no contra el Postgres de pruebas), y son dos
diferencias entre lo que el SQL *parecía* hacer y lo que hace:

1. **`revoke ... from anon` sobre una FUNCIÓN casi nunca revoca nada.** Postgres concede `EXECUTE` a
   **PUBLIC** por defecto en cada función nueva, y `anon` lo hereda por ahí. Comprobado: un anónimo **sí
   puede ejecutar** `product_funnel`; lo único que lo detiene es el guard `is_platform_admin()` que lleva
   **dentro** (le devuelve 0 filas). O sea: la protección real está, pero la línea `revoke` era decorativa.
   El mismo defecto estaba en `is_platform_admin()` desde la 0011.
2. **En Supabase, `anon` tiene `SELECT` por defecto sobre las tablas de `public`.** En el Postgres de
   pruebas no lo tiene, y por eso allí un SELECT anónimo daba *permission denied* y en producción da
   `200 []`. Las dos son seguras —la RLS no le concede ni una fila— pero **en producción la única capa es
   la RLS**. Si algún día alguien añade una policy permisiva por error, ahí sí habría fuga. Revocando el
   SELECT hacen falta **dos** errores para filtrar, no uno.

Lo que hace 0028: revoca de **PUBLIC** el `execute` de `product_funnel` e `is_platform_admin()` (y lo
reconcede a `authenticated`), y le quita a `anon` el `SELECT` sobre `intake_links`, `intake_submissions` y
`product_events`. **Lo que NO toca:** el `INSERT` anónimo en `product_events` (sin él no se miden las
visitas de la landing) ni el `EXECUTE` de `submit_intake` (es la puerta pública del intake, a propósito).

Validado en el Postgres desechable con los grants **imitando a Supabase** (`grant select on all tables to
anon` primero, para que el revoke tenga algo que revocar): antes → `anon` podía las 8 cosas; después → pierde
los 3 SELECT y los 2 `execute` internos, **conserva** el insert de telemetría y el `submit_intake`, y
`authenticated` no pierde nada. Aplicada dos veces sin error, y el camino anónimo del intake sigue
funcionando entero (token válido guarda y suma 1; los cinco casos malos devuelven el mismo `false`).

1. Pega **`supabase/migrations/0028_grant_hardening.sql`** en el SQL Editor (solo ese archivo).
2. No hay nada que comprobar en la UI: si todo sigue igual, funcionó. La telemetría debe seguir contando
   visitas de la landing (`/dashboard/telemetria`) y el formulario público de intake debe seguir enviando.

### 1.1-septies + octies · Migraciones 0026 y 0027 — ✅ APLICADAS (verificadas 2026-07-30)
**Verificadas por API contra tu Supabase real**, no solo dadas por buenas:
`product_events` → insert anónimo **201**; RPC `product_funnel` → **200**; `intake_links` e
`intake_submissions` → existen; y `submit_intake` con token inexistente, token demasiado corto, otro token
falso y nombre en blanco → **los cuatro devuelven el mismo `false` con HTTP 200** (no delata qué enlaces
existen). Queda una fila de sonda en `product_events` (`path = '/probe-migracion'`) de la propia
verificación; si te molesta en el panel, bórrala con:
`delete from public.product_events where path = '/probe-migracion';`

<details><summary>Cómo se aplicaron (referencia)</summary>

> **📎 Se entregó `attesta-migraciones-0026-0027.sql`** — un único archivo con las **dos** migraciones
> en orden, con instrucciones dentro. Pégalo completo en el SQL Editor y pulsa *Run*. También puedes
> pegar los dos ficheros por separado (`0026_telemetry.sql` y luego `0027_intake_links.sql`): es lo mismo.
>
> **Validado antes de entregártelo** en un Postgres 16 desechable: se aplicó **tres veces seguidas** sobre
> una base limpia sin un solo error, se comprobaron los objetos creados (3 tablas, 3 funciones, 9 políticas)
> y se probó el camino anónimo de 0027 — token válido → guarda y suma 1 al contador; token inexistente,
> revocado, caducado, agotado y nombre en blanco → **todos devuelven exactamente el mismo `false`**.
>
> **Corrección de esa validación:** allí se dijo que `anon` "ni siquiera puede leer las tablas
> (*permission denied*)". Eso era cierto **en el Postgres de pruebas**, pero **no en Supabase**, donde `anon`
> tiene `SELECT` por defecto sobre `public` y recibe `200 []` (cero filas por la RLS). Sigue siendo seguro,
> pero con **una** capa en vez de dos. Eso es lo que arregla la **0028** (§1.1-nonies).
>
> **Bug corregido en el momento** (por eso hacemos este ritual): 0026 no era **idempotente** — sus dos
> políticas se creaban sin `drop policy if exists`, y `create policy` no admite `if not exists`. Si hubieras
> pegado el archivo dos veces (cosa normal: se re-pega tras corregir cualquier otra cosa), la segunda habría
> muerto con *policy already exists*. Ya está arreglado en la migración y en `setup.sql`.

</details>

#### 0026 · Telemetría de producto
Panel en **`/dashboard/telemetria`** (en el menú lateral solo para tu cuenta, que es `platform_admin`).
Mide **desde el momento en que se aplicó**: no rellena el pasado, así que al principio hay pocos datos.

**Qué mide y qué NO:** mide visitas, clics en CTA, altas, primer sistema, evaluación de riesgo, muro de pago,
checkout y pago confirmado. **No** guarda IP, ni user-agent, ni correos, ni nombres de sistemas. El identificador
anónimo del navegador solo evita contar dos veces la misma visita, y si el visitante activa "Do Not Track" o GPC
no se emite nada. Pendiente asociado: declararlo en la futura página de **privacidad** (§0.F, medición de audiencia).

#### 0027 · Enlace de intake compartible
Vive en **`/dashboard/inventario/importar`**. Prueba de humo cuando quieras: crea un enlace con etiqueta
("RRHH"), cópialo y ábrelo en una ventana privada — debes ver el formulario público y poder enviar una ficha.
La ficha aparece en la bandeja de esa misma pantalla; al pulsar **"Añadir al inventario"** se crea el sistema
y queda registrado **a tu nombre** en Actividad (el anónimo nunca escribe en el expediente).

**Qué tener en cuenta al compartirlo:** el enlace es una llave — quien lo tenga puede enviar fichas (nada
más: no puede leer nada). Caduca a los **30 días**, admite hasta **100 envíos** y puedes **revocarlo** en
cualquier momento. Si sospechas que se filtró, revócalo y crea otro.

### 1.1-sexies · Migración 0022 (práctica prohibida en brechas) — ✅ APLICADA (2026-07-22)
Aplicada por el fundador y **verificada por API** (probe con la anon key: `select=prohibited` → HTTP 200; columna
inventada → HTTP 400 `42703 does not exist`, prueba de contraste). El gating queda activo. Añade la columna
`gap_items.prohibited` (boolean, default false) para que un control cuyo objeto es una **práctica
PROHIBIDA del Art. 5** (p. ej. reconocimiento de emociones en el trabajo, Art. 5.1.f) quede **fuera del cómputo de
"% listo"** y se trate como Inaceptable / revisión jurídica, en vez de contar como una brecha ordinaria. **Degradación
segura:** mientras no la apliques, la app funciona igual que hoy (todos los controles cuentan; el badge "Práctica
prohibida" se sigue viendo en la vista de *packs*, pero el ítem no se excluye del % ni aparece marcado en el gap/dossier
conectado). Para encenderla: pega **`supabase/migrations/0022_gap_prohibited.sql`** en el SQL Editor de Supabase (solo ese
archivo; es idempotente, `add column if not exists`). Sin impacto en datos existentes.

### 1.1-quinquies · Migración 0021 (guardas de membresías) — ✅ APLICADA (2026-07-21)
Trigger `enforce_membership_guards` (BEFORE UPDATE/DELETE en `memberships`) que impone en la BD "solo un owner
otorga/retira el rol owner" y "una organización nunca se queda sin owner". **Aplicada y verificada por SQL**
(función `enforce_membership_guards` `prosecdef=true` + `search_path=` vacío; trigger habilitado, `tgenabled='O'`).
Antes esas reglas vivían solo en la app y un **admin** podía saltárselas por API directa (auto-promoverse a owner
o expulsar al owner); ahora es defensa en profundidad **intra-tenant** a nivel de BD.

### 1.1-quater · Migración 0020 (audit-trail a prueba de manipulación) — ✅ APLICADA (2026-07-20)
El registro de actividad se **encadena con hashes SHA-256** (tamper-evident): cada evento incorpora el hash del
anterior, así que borrar o alterar cualquiera —incluso con acceso directo a la base— rompe la cadena y queda
demostrable. **Aplicada y verificada por API** (columnas `prev_hash`/`row_hash` presentes y función
`verify_audit_chain` activa). En **Dashboard → Actividad** se ve la tarjeta "Integridad de la cadena verificada".

### 1.1-ter · Migración 0019 (auditoría de sesgo NYC LL144) — ✅ APLICADA (2026-07-18)
Aplicada y **verificada por API** (las 6 columnas existen en `ai_systems`). El registro de auditoría de sesgo
con cuenta atrás ya está activo. Para usarlo: **Inventario → un sistema** → marca si es AEDT y registra fecha/
auditor/URL de su auditoría → verás el estado y la cuenta atrás ("vence en N días"), también en el dossier.

### 1.2 · Pagos con Stripe — ✅ LIVE configurado (2026-07-20)

> **✅ LIVE ACTIVO.** El fundador configuró Stripe en modo **Live** (producto/precio **$120 USD/mes**, webhook,
> variables en Vercel). Verificado por API: `POST /api/stripe/webhook` → `400 firma inválida` = llaves live
> cargadas y verificando firmas ✅. Cobros reales habilitados.
>
> **Falta comprobar el flujo de pago end-to-end** (cuando el fundador quiera): crear un **cupón 100% off** en
> Stripe Live y pasar por *Suscribirse* → "Add promotion code" → total $0 → suscripción `active` sin cobrar.
>
> **✅ Seguridad resuelta (2026-07-30):** la `sk_live` que se expuso en el chat fue **rotada** y la nueva está
> en `STRIPE_SECRET_KEY` (Vercel). Ver §1.1.
>
> ---
> **Historial (modo Test, 2026-07-18):** verificado e2e con tarjeta `4242…` → webhook 200 → suscripción
> `active` → plan Preparación desbloqueado. Migración 0017 aplicada.
>
> **Causa del atasco (ya corregida):** había un **typo** en el nombre de la variable en Vercel
> (`STRPE_PRICE_ID` en vez de `STRIPE_PRICE_ID`). Al corregirlo + redeploy, empezó a funcionar.
>
> **Bug encontrado y arreglado al probar (multi-org):** un usuario en varias organizaciones pagaba con una
> org pero la sesión resolvía otra (gratis) → veía "Suscribirse" pese a estar `active`. Fix desplegado:
> `startCheckout` fija la cookie de org activa a la que paga, y `getActiveOrg` prioriza la org con
> suscripción activa cuando no hay elección explícita (commit 51ab9f1).
>
> **Diagnóstico rápido** (por si se rompe): `curl -sS -X POST https://attesta-io.vercel.app/api/stripe/webhook
> -d '{}'` → `firma inválida`/400 = configurado ✅ · `stripe no configurado`/503 = las llaves no están vivas.

*(Nota histórica: este bloque describía la configuración en modo Test. Ya está en **LIVE** y la `sk_live`
expuesta está **rotada** — ver arriba y §1.1.)*

<details><summary>Pasos originales de configuración (referencia)</summary>

1. **Aplica la migración** `supabase/migrations/0017_subscriptions.sql` en el SQL Editor de Supabase
   (solo ese archivo). *← YA APLICADA.*
2. Entra a Stripe en **`dashboard.stripe.com/test`** (modo Test / Sandbox).
3. **Products → Add product**: `Attesta — Preparación`, **120 USD** (¡moneda **USD**, no MXN!), *Recurring /
   Monthly* → copia el **Price ID** (`price_…`).
4. **Developers → API keys**: copia `pk_test_…` y `sk_test_…`.
5. **Developers → Webhooks → Add endpoint**:
   - URL: `https://attesta-io.vercel.app/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copia el **Signing secret** (`whsec_…`).
6. En **Vercel → Settings → Environment Variables** (Production) añade:
   | Variable | Valor |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_test_…` |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` |
   | `STRIPE_PRICE_ID` | `price_…` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
   - Y **confirma que exista** `SUPABASE_SERVICE_ROLE_KEY` (la que ya usa el radar de vigilancia;
     el webhook la necesita para escribir).
7. **Redeploy** en Vercel.
8. **Prueba**: inicia sesión (cuenta con organización), entra a Gap/Vigilancia → sale el **paywall** →
   *Plan y facturación* → *Suscribirse* → tarjeta de prueba `4242 4242 4242 4242` (fecha futura, CVC y
   CP cualesquiera) → al volver, recarga: suscripción **Activa** y paywall desbloqueado.
9. Cuando funcione en Test, repetir con llaves **live** para cobrar de verdad.

</details>

> ⚠️ Con las llaves puestas, **el bloqueo por plan está activo** para toda cuenta sin suscripción (es lo
> esperado). Inventario y riesgo siguen libres.

### 1.6 · Encender SSO / acceso corporativo (Google + Microsoft) — config sin código
Los botones **"Continuar con Google / Microsoft"** ya están construidos en login y registro; **aparecen solo
cuando pones su variable** en Vercel (degradación segura). Falta registrar las apps OAuth (una vez):

> **URL de retorno de Supabase (la necesitarás abajo):**
> `https://flesaxlgtvhewwcvzrxs.supabase.co/auth/v1/callback`

**Google (Google Workspace / cuentas Google):**
1. [Google Cloud Console](https://console.cloud.google.com) → crea un proyecto → **APIs y servicios → Pantalla
   de consentimiento OAuth** (tipo *External*, nombre "Attesta", correo de soporte).
2. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web**. En *URIs de redirección
   autorizados* pega la **URL de retorno de Supabase** de arriba. Guarda y copia **Client ID** y **Client Secret**.
3. Supabase → **Authentication → Providers → Google** → actívalo → pega Client ID + Secret → *Save*.
4. Vercel → *Environment Variables* (Production): **`NEXT_PUBLIC_SSO_GOOGLE=1`** → **Redeploy**.

**Microsoft (Microsoft 365 / Azure AD):**
1. [Azure Portal](https://portal.azure.com) → **App registrations → New registration**. Nombre "Attesta";
   *Supported account types*: cuentas de cualquier directorio + personales. *Redirect URI* (tipo **Web**): la
   **URL de retorno de Supabase** de arriba. Crea.
2. Copia el **Application (client) ID**. Luego **Certificates & secrets → New client secret** → copia el **Value**.
3. Supabase → **Authentication → Providers → Azure** → actívalo → pega el Application ID + Secret → *Save*.
4. Vercel → **`NEXT_PUBLIC_SSO_MICROSOFT=1`** → **Redeploy**.

**Importante (una sola vez):** Supabase → *Authentication → URL Configuration → Redirect URLs* debe incluir
`https://attesta-io.vercel.app/auth/callback` (probablemente ya está, se añadió para el reset de contraseña).
> Un usuario que entra por SSO por primera vez y aún no tiene organización cae automáticamente en el onboarding.

### 1.3 · Correo de verificación por código (requiere dominio)
Hoy la **confirmación de correo está DESACTIVADA** (el registro entra directo). El flujo de **código OTP
ya está construido** en la app; para encenderlo hace falta:
1. **Comprar un dominio** propio (p. ej. `attesta.io` / `attesta.mx`, ~$10–15/año).
2. **Verificarlo en Resend** (registros DNS).
3. En **Supabase → Authentication → Providers → Email**: volver a activar **"Confirm email"** y
   configurar **custom SMTP** (con Resend).
4. Editar la plantilla **"Confirm signup"** para incluir el código:
   ```html
   <h2>Confirma tu cuenta en Attesta</h2>
   <p>Tu código de verificación es:</p>
   <p style="font-size:28px;font-weight:700;letter-spacing:8px;margin:16px 0">{{ .Token }}</p>
   <p>Introdúcelo en la app para activar tu cuenta. Caduca en 1 hora.</p>
   ```
Un dominio propio además: mejora la entrega de correos (no caen en spam) y desbloquea el punto 1.4.

### 1.4 · Notificaciones de solicitudes de acceso (waitlist)
El destinatario ya es **`attesta.io.mx@gmail.com`**. Para que lleguen, la cuenta de **Resend** debe estar
bajo ese mismo correo (o tener un dominio verificado). Si tu `RESEND_API_KEY` en Vercel es de otra cuenta,
las notificaciones al buzón nuevo **no llegarán** hasta verificar dominio.

### 1.5 · Recordatorios de gobernanza por correo (digest semanal) — construido, dormido
**Ya construido y desplegado** (env-gated): cada **lunes 08:00 UTC** un cron manda a cada organización un
digest con lo que necesita atención (auditorías de sesgo vencidas/por vencer + próximos plazos regulatorios).
Para **encenderlo** en Vercel → *Settings → Environment Variables* (Production):
1. **`RESEND_API_KEY`** — tu clave de Resend (la misma que la waitlist). Sin ella, el cron calcula pero no envía.
2. **`CRON_SECRET`** — cualquier cadena aleatoria larga. **Vercel la usa para autenticar el cron** (sin ella, el
   cron responde 403 y no envía). Imprescindible.
3. Confirmar que exista **`SUPABASE_SERVICE_ROLE_KEY`** (el cron lee organizaciones/sistemas y correos con ella).
4. (Recomendado) **`NEXT_PUBLIC_APP_URL`** = `https://attesta-io.vercel.app` para los enlaces del correo.
5. Redeploy. Para **probar sin esperar al lunes**: como platform_admin, abre `/api/reminders/run` (o `curl` con
   `Authorization: Bearer <CRON_SECRET>`). Devuelve un resumen (orgs, destinatarios, correos enviados). Si aún no
   hay `RESEND_API_KEY`, es un *dry-run* (cuenta pero no envía) — útil para comprobar que detecta bien.
> Deliverabilidad: sin dominio propio verificado en Resend, los correos salen de `onboarding@resend.dev` y pueden
> caer en spam. Verificar un dominio (§1.3) mejora esto y es lo mismo que hace falta para el código de correo.

### 1.5-bis · Cron del Vigía (vigilancia regulatoria automática) — construido (2026-07-21)
Hasta ahora el **Vigía solo corría si un admin lo disparaba a mano** — el "foso automatizado" no se ejecutaba solo.
Ya está programado en `vercel.json`: cada **lunes 06:00 UTC** Vercel llama a `/api/reg-watch/vigia` (GET con
`Authorization: Bearer <CRON_SECRET>`) y el Vigía revisa las fuentes y encola candidatos. **Requisitos** (los mismos
del digest §1.5): `CRON_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` en Vercel. Sin `CRON_SECRET` el cron responde 401 y no
corre. **Decisión de diseño:** solo el **Vigía** (determinista, gratis) es automático; el **Analista** (enriquecido con
LLM, con coste) sigue siendo disparo manual del Validador — coherente con "propone borradores que un humano valida".
Si en el futuro quieres el pipeline entero automático, hay que encadenar `/api/reg-watch/analista` (avísame).

---

## 🟡 2. Pendiente MÍO (desarrollo, cuando desbloquees lo de arriba)

- **Verificar Stripe end-to-end**: en cuanto pongas las llaves, compruebo que el webhook responde y que
  la suscripción se sincroniza (paso 1.2.8). Avísame.
- **Reactivar el código OTP**: cuando tengas dominio + SMTP, re-encender la verificación (el código ya está
  hecho; es re-activar "Confirm email" + plantilla).
- **Landing (item 5, mejoras de conversión)**: hecho lo principal; queda pulir con más ejemplos/animaciones
  si quieres seguir iterando.

### 2.1 · Diferido de la auditoría de calidad (2026-07-18)
La 1ª tanda de pulido ya está hecha (manejo de errores, toasts por tipo, carga/error del dashboard, empty-states).
Queda pendiente:
- ✅ **Copy prohibido en textos estáticos — HECHO (2026-07-18, revisado con el experto).** Neutralizados 3:
  `recommendations.ts` ("garantizar"→"alcanzar y mantener", Art. 15), `mock-data.ts` ("cumple el Art. 26"→"aborda
  las obligaciones del Art. 26"), `policy-packs/rrhh.ts` ("garantiza"→"asegura"). CONSERVADOS 2 (referencias
  correctas a obligación del proveedor): los "marcado CE" de `recommendations.ts:53` y `regulatory-watch.ts:286`
  (el verbo es del deployer: "exige/verifica que el proveedor lleve marcado CE"). El disclaimer de `LegalNote`
  usa los términos en negativo ("No es un certificado…") — correcto, se conserva.
- ✅ **`window.confirm` → modal propio — HECHO (2026-07-18).** Nuevo `ConfirmSubmit` (modal accesible con marca)
  aplicado a los 5 borrados (sistema, brecha, tarea, miembro, invitación). Verificado con captura.
- **Estados vacíos menores**: `riesgo/page.tsx` muestra las 4 secciones con "0 sistemas" en cuenta nueva.
- **TODOs de andamiaje**: `context.ts:21` (selector de org activa), `analista/voyage.ts` (placeholder de embeddings).

### 2.4 · i18n "INGLÉS TOTAL" — ✅ COMPLETADO y ✅ DESPLEGADO A PRODUCCIÓN (`main`, 2026-07-22)
El fundador pidió que la versión inglesa NO deje NADA en español y funcione igual que la española. **Hecho,
verificado y publicado a `main` (commit `c96aadb`)** a petición del fundador. Reconciliación con la regla dura: el contenido legal se tradujo, pero **cada texto legal lo validó el
`compliance-domain-expert`** (no traducción mecánica). Patrón: cada módulo mantiene el ES canónico + `_EN` validado +
selector locale (`*_BY_LOCALE`/`fn(x,locale)`, default ES); la fachada de datos resuelve el locale por cookie.
- ✅ Contenido `_EN` validado por experto: **5 policy-packs, risk-assessment, recommendations, regulatory-watch,
  audit, y las muestras demo de `mock-data`** (GAP_ITEMS, SAMPLE_ASSESSMENTS/ACTION_TASKS/AUDIT/REG_*/BIAS).
- ✅ Wiring: API locale en los 5 módulos (Fase 1); fachada locale-aware (getRegulatoryEvents/getAuditLog/
  applyPolicyPack + mock-repo getters); todos los consumidores (reportes, plan, packs, riesgo, RiskWizard incl. su
  bloque de resultado, vigilancia, actividad, informes, /demo, overview).
- ✅ Narrativas legales EN validadas (dossier s1–s5 + RATIONALE_FALLBACK, informe/gap-informe summaryParagraph,
  briefing de vigilancia, LegalNotes por locale). ✅ Limpieza: `Anexo`→`Annex`, `Directiva…UE`→`Directive…EU`,
  `«»`→`""`, ortografía americana — solo en las estructuras `_EN`.
- ✅ **Verificación:** escaneo integral en modo demo (build sin `.env.local`, cookie `NEXT_LOCALE=en`) de 23 rutas
  filtrando el payload RSC → **cero texto español** en la versión inglesa; el bloque de resultado del RiskWizard
  verificado con Playwright en 4 clasificaciones. tsc+lint+build exit 0. `/` sigue siendo la landing ES (por diseño;
  el inglés vive en `/en`).
- **Nota — datos persistidos:** en modo CONECTADO, los datos ya guardados por el usuario (gap_items, rationale de
  evaluaciones históricas, eventos publicados) se muestran en el idioma en que se guardaron — no son retraducibles.
  Solo el contenido curado/computado en display sale por locale. En modo demo (mock) todo sale EN.
- **Pendiente menor / diferido:** el enum `Effort` (bajo/medio/alto) en `RecommendationCard` — componente NO
  importado en la app (código muerto), no renderiza; traducir si algún día se usa. Sigue pendiente de validación del
  experto (si se quisiera) los enums de estado sueltos de `regulatory-watch` ya cubiertos por selector.

### 2.3 · Internacionalización ES/EN — Inc 0–5 HECHOS (en la rama, 2026-07-22)
Toda la UI (web pública + auth + dashboard) es bilingüe ES/EN. **En la rama `claude/init-3bwfhm`, NO desplegado a `main`**
(el fundador decidió publicar cuando dé el visto bueno). Ver MEMORY §10 (2026-07-22). ✅ Inc 0–3 web pública + SEO,
✅ Inc 4 auth por cookie, ✅ Inc 5a–5e dashboard (shell/nav/toasts, genéricos, formularios, chrome de páginas
regulatorias, enums de dominio).
- **Falta que el fundador decida:** publicar a producción (`main`) — es un hito coherente y completo por sí mismo.
- **Pendiente de validación del EXPERTO antes de exponer en EN** (hoy en español, degradación segura):
  1. ✅ **HECHO (2026-07-22).** Etiquetas de `regulatory-watch.ts` (`FRAMEWORK_*`, `JURISDICTION_*`, tipos de evento) +
     el catálogo `REGULATORY_EVENTS_EN` completo: traducidas y **firmadas por el `compliance-domain-expert`**
     (veredicto APROBADO; verificó denominaciones oficiales en EUR-Lex: Annex I/III, Directive 2011/93/EU, Regulation
     (EU) 2024/1689; pulido Ch.→Chapter aplicado). Se retiró el flag "pendiente de sign-off" del comentario de cabecera.
  2. **Inc 6 · Cuerpo de los PDF** (dossier/informe/gap-informe): decisión tomada = el cuerpo legal se mantiene en
     **español** aunque la UI esté en inglés (regla dura). `ScopeNote` ya es locale-aware y `LEGAL_*_BY_LOCALE` ya tienen
     EN validado; si en el futuro se quiere el documento entero en EN, requiere validación del experto del cuerpo completo.
- **Diferidos técnicos (míos):** (a) leer `headers()` en el root layout volvió dinámicas todas las rutas (la landing dejó
  de prerenderarse estática) — optimizable con root layouts separados por route-group si el TTFB lo pidiera; (b)
  auto-detección `Accept-Language` NO se implementó (decisión: no forzar redirección; como mucho un banner "View in
  English" fuera de MVP); (c) el toast `pack-applied` dice "policy pack RRHH" fijo aunque se aplique otro pack
  (preexistente, menor).

### 2.2 · Ampliar el foso — leyes de EE. UU. de contratación con IA — ✅ AMPLIADO (2026-07-22)
- ✅ **NYC LL144 + Illinois (HB 3773 + AIVIA)**: ya estaban en el pack `us-hiring` (11 controles, validado 2026-07-18).
- ✅ **California (2 packs nuevos, validados por el experto, 2026-07-22)**: `us-ca-feha` (FEHA/ADS en empleo, en vigor
  oct-2025, 11 controles) y `us-ca-admt` (CCPA/CPPA ADMT en empleo, empleador exigible ene-2027, 10 controles). Cableados
  en `index.ts` (ES+EN). Ver MEMORY §10 (2026-07-22).
- ✅ **Colorado**: el radar ya refleja **SB 26-189** (no la derogada SB 24-205) — no requirió corrección.
- **Pendiente antes de GA:** validación por **abogado de empleo/privacidad de California** de los 2 packs de CA (el experto
  dejó citas conservadoras en algunos números de sección por no poder parsear el PDF oficial; conviene confirmarlos).
- ✅ **Eventos de vigilancia (radar) de California — HECHO (2026-07-22).** 4 eventos validados por el experto (ES+EN) en
  `regulatory-watch.ts`: FEHA ADS en vigor (1-oct-2025), reglamento CCPA/CPPA ADMT vigente (1-ene-2026), cumplimiento del
  empleador ADMT (1-ene-2027), entrega de attestation de risk assessment a la CPPA (1-abr-2028). Nuevos marcos `us-ca-feha`
  y `us-ca-admt` + jurisdicción `us-ca` (aparecen solos en el toggle/chips porque derivan de `JURISDICTION_ORDER`; se corrigió
  además la lista blanca de `jurisdiction-actions.ts` para derivarla de `JURISDICTION_ORDER`). Default demo ahora incluye `us-ca`.
- **Follow-up OPCIONAL restante (no pedido):** **Texas TRAIGA** (HB 149, ene-2026) solo como **radar** — deberes finos al
  empleador privado, no da para pack. NO construir aún: bias-testing propio, ISO/NIST, shadow-AI.

---

## 🟢 3. Ideas / capas futuras del producto (no pedidas aún, para no olvidar)

- **Capa 0 — Descubrimiento de shadow-AI**: detectar sistemas de IA que la organización usa sin declarar.
- **Capa 4 — Pruebas de sesgo**: evaluación de sesgo/impacto (p. ej. con Evidently) para herramientas de RRHH.
- **Umbral de preparación**: hoy `AUDIT_READY_THRESHOLD = 80` (en `src/lib/mock-data.ts`, un solo sitio).
  Cambiar el número es una línea si quieres otro objetivo (p. ej. 85%).
- **Selector de organización activa** (usuario en varias orgs) — ya anotado en el código como TODO.

---

## ✅ 4. Hecho y desplegado (referencia rápida)

Lista de mejoras del fundador **completada** (1ª–3ª tanda): PDF en claro solo al imprimir · menú de cuenta
(logout / cambiar cuenta / volver al sitio) · registro con nombre+apellidos+confirmar contraseña · guía de
primer login con mini-ejemplos animados · demo pública `/demo` recortada a muestra (con volver-al-sitio en
móvil + tema claro/oscuro) · planes diferenciados **$350 USD/mes** + tabla comparativa · umbral de auditoría
80% · datos de contacto y notificaciones a `attesta.io.mx@gmail.com` · toasts con cierre.

**Enterprise (Frente 3)**: selector de organización activa · audit-trail a prueba de manipulación (hash-chain
SHA-256, migración 0020) · **exportación de datos** (JSON portable en *Plan y facturación*, sin migración,
disponible en todos los planes a propósito) · **SSO social** (Google + Microsoft; código listo, se enciende
con config del fundador → §1.6). Futuro opcional: SAML empresarial (requiere Supabase Pro).

**Enterprise por-organización (2026-07-22, desplegado a `main`)**: Multi-organización
(`/dashboard/organizaciones` — portfolio de entidades + crear entidad) y SSO/controles avanzados
(`/dashboard/seguridad` — placeholder honesto) como funciones **exclusivas de Enterprise**, gateadas
`requires="enterprise"`. El plan se resuelve por org activa → se aplica a todos los miembros y solo en
esa org; al cambiar a otra org sin Enterprise se bloquean. ✅ **Bloquea de verdad: la migración 0018 está
aplicada** (verificada 2026-07-30, §1.1-bis). La página de Seguridad es un placeholder; el SSO corporativo real (SAML/
OIDC) aún no está cableado — el SSO **social** (Google/Microsoft) es cosa aparte (§1.6).

**Construido pero inactivo hasta configurar**: cobro por suscripción Stripe (migración 0017 + webhook +
paywall) y verificación de correo por código OTP.

El **foso automatizado** (Vigía + Analista + Validador) está completo y verificado — ver MEMORY.md §11.

---

## 📌 Cómo retomar en la próxima sesión

1. **Lee primero §0 — HOJA DE RUTA 360° (plan maestro por sprints).** Decisión del fundador (2026-07-30):
   **se hace todo, por sprints**. El orden por defecto es 0.A → 0.B → 0.C → 0.D → 0.E → 0.F; las apuestas
   grandes (0.G) solo tras checkpoint. Si no hay instrucción nueva, continúa por donde quedó el sprint en curso.
2. Lee **MEMORY.md** (§11 "RETOMAR AQUÍ") y el resto de este archivo.
3. Pregunta al fundador en qué punto está de los pendientes 🔴 (sobre todo Stripe y dominio).
4. Rama de trabajo: `claude/init-3bwfhm`; PR a `main` y merge al pasar CI (`verify`); Vercel redespliega solo.
5. Verificación: `npm run lint` + `npx tsc --noEmit` + `npm run check:copy` + **`npm test`** +
   `npm run build`; backend real por curl. Para una **migración nueva**, valídala antes en un Postgres
   desechable (ver gotcha en `CLAUDE.md`), no directamente en el SQL Editor del fundador.

---

## Deuda técnica pendiente (P4 — auditoría 2026-07-21)

Mantenibilidad, **sin impacto de usuario**; no urgente. Del escaneo completo:

- [ ] Unificar los **3 formateadores de cuenta-atrás** en español (`task-reminders.ts:dueLabel`,
  `BiasAuditBadge.tsx:countdownText`, `reminders/email.ts:countdown`) en un helper único en `lib/`.
  **DIFERIDO a propósito (2026-07-22):** son strings en español ("vence en N días"); con la app ya bilingüe, un
  helper es-ES fijo *cementaría* un hueco de i18n en vez de resolverlo. Hacerlo bien implica decidir si esos
  textos deben ser locale-aware → decisión de producto, no simple dedup. Se deja para esa tanda.
- [x] ~~Fusionar **`daysUntil`** (`regulatory-watch.ts`) y **`daysUntilDate`** (`bias-audit.ts`)~~ ✅ HECHO
  (2026-07-22). Nueva `src/lib/date.ts` con la implementación única (`parseIsoDateUTC` + `daysUntilDate(string|null)`);
  ambos módulos delegan (se probó que el cálculo era idéntico: medianoche UTC − medianoche UTC de hoy; `NaN`/`null`
  en fecha inválida). Firmas públicas intactas (`daysUntil` sigue devolviendo `number`). Verificado tsc+lint+build.
- [ ] Centralizar los **~7 formateadores de fecha** `toLocaleDateString("es-ES", …)` repartidos por páginas
  (facturación, informes, vigilancia, equipo, dossier) en 2-3 helpers nombrados (`fmtFechaLarga`/`fmtFechaCorta`).
  **DIFERIDO a propósito (2026-07-22):** mismo motivo que la cuenta-atrás — el `es-ES` fijo es un latente de i18n; el
  helper correcto es locale-aware (cambia el render en EN), que es cambio de comportamiento, no "sin impacto de usuario".
- [x] ~~Reutilizar **`RISK_ORDER`** en los sitios que aún re-declaran el orden de niveles
  (`CandidateReviewControls.tsx`, `analista/llm.ts`, `reg-pipeline-actions.ts`)~~ ✅ HECHO (2026-07-22). Las 4
  redeclaraciones locales de `RISK_LEVELS` (incluida la de `data/actions.ts`) ahora importan `RISK_ORDER` de
  `mock-data` (fuente única del orden de niveles). Verificado tsc+lint+build.
- [x] ~~Feature-flag explícito / nota del módulo **`analista/`**~~ ✅ Ya estaba (nota B.0/B.1 + `TODO(B.1)`
  en `voyage.ts`) para que no quede como código semi-muerto.

### Seguridad — ítems BAJA documentados (auditoría 2026-07-21)
- [ ] `api/reminders/run`: exigir **POST** (o token CSRF) en el modo sesión (hoy acepta GET → CSRF de bajo
  impacto). Tocar cuando se active el cron de correos.
- [x] ~~`submitWaitlist`: **rate-limit / captcha**~~ ✅ HECHO (2026-07-23). Throttle por IP (5/10min, ventana deslizante
  en memoria) + cota de longitud de email, además del honeypot cliente. Ver §0.2.
- [ ] `saveRiskAssessment`: recomputar `rationale/citations/obligations` en servidor desde `answers` (hoy se guardan
  tal cual llegan del cliente → integridad intra-tenant, sin XSS). Coherencia con "contenido legal determinista".

### Follow-ups de la tanda P1 (auditoría 2026-07-21)
- [x] ~~**CSP estricta con nonce**~~ ✅ CONSTRUIDA (2026-07-23) en el middleware (`src/lib/security/csp.ts`). Nonce por
  request; enforce de lo seguro (frame-ancestors/form-action/base-uri/object-src) + política estricta en **Report-Only**.
  **PENDIENTE:** promoverla a `enforce` tras smoke-test en preview (login/checkout/radar) — ver §0.4.
- [x] ~~**`.env.example` incompleto**~~ — ✅ hecho (2026-07-21): añadidas Stripe ×5, correo ×3, SSO ×2, `NEXT_PUBLIC_APP_URL`.
- [x] ~~**`select("*")` → columnas explícitas**~~ — ✅ hecho (2026-07-21): `getAiSystems` y `getGapItems` enumeran
  columnas (sin las 6 de bias-audit 0019, que no usan). `getSystemDossier` se deja con `*` **a propósito**: sí usa las
  columnas de sesgo y necesita el fallback seguro si 0019 no está aplicada.

### Follow-ups de la tanda P3 (2026-07-21) — lo que quedó abierto
Hecho en P3: skip-link landing, matiz Art. 6(3) en FAQ, `SubmitButton` (estados "enviando"), modal accesible de
descarte (fuera `window.prompt`), `engines`, `apiVersion` Stripe, React 19.2.7, README, borrado `patches/0005`.
Queda (bajo, deferido con motivo):
- [ ] **`tsconfig` `noUncheckedIndexedAccess`**: barrería muchos accesos indexados a datos del cliente (más seguridad
  de tipos real), pero surface decenas de errores → merece su propia tanda dedicada, no un cambio suelto.
- [x] ~~**Stats de `ProblemStats`**~~ — ✅ hecho (2026-07-21): las cifras 78 %/83 % venían de un press release de un
  proveedor (Vision Compliance, conflicto de interés). Sustituidas por fuentes citables: preparación → **Deloitte Legal**,
  encuesta EU AI Act 2024 (500 decisores en Alemania): **48,6 %** no se ha comprometido en serio
  (https://www.deloittelegal.de/dl/en/services/legal/research/umfrage-eu-ai-act-2024.html); inventario → **Cloud Security
  Alliance** 2026: **>50 %** sin inventario formal de IA
  (https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-high-risk-compliance-deadline-20/).
  El 35 M€/7 % se marca como dato del propio Art. 99. Nota al pie con fuentes y el caveat "Alemania".
- [x] ~~`npm audit`: 2 moderate en `postcss`~~ ✅ HECHO (2026-07-23). Next 16.2.11 + `overrides` (`sharp ^0.35.0`,
  `postcss ^8.5.10`) → **0 vulnerabilidades**. Ver §0.2.
- [ ] Cosméticos: parpadeo de icono en `ThemeToggle` tras montaje; dots decorativos con hex fijo (semáforo macOS, intencional).

### Follow-ups de la 2ª verificación (2026-07-21) — BAJO no bloqueantes
Arreglados en el momento: 78% de `Hero`, 83% de `Modules`, cita Directiva 2024/1385 (adultos) en risk-assessment,
waterfall de `editar` (→Promise.all), contraste de nota, foco del modal de descarte, tablas con overflow, CI permissions.
Queda (BAJO, deferido):
- [ ] `getExportBundle`: plegar `list_audit_log` (lim 500) dentro del primer `Promise.all` (no depende de `systems`) →
  −1 round-trip en la exportación. Impacto bajo (acción administrativa fría).
- [ ] Quitar `"use client"` innecesario de `DeleteGapButton`/`DeleteSystemButton`/`RevokeInviteButton`/`RemoveMemberButton`
  (solo renderizan `ConfirmSubmit`/`<form action>`, que ya son client): saca unos bytes del bundle. Cleanup de altitud.
- [ ] Modal de descarte: foco RESTAURADO al cerrar ✅, pero sin **focus-trap** completo (Tab puede salir al fondo). Menor.
- [ ] Vercel: 2 crons semanales = límite del plan Hobby. Un 3er cron requeriría Pro. Informativo.

### Revisión crítica del panel (2026-07-21) — diferidos y lo que necesita INPUT del fundador
Ejecutado: Tier 0 (bugs "% listo" y plan de acción), Tier 2 (a11y), Tier 3-4 + parte de Tier 1 (web). Queda:
- [ ] **CREDIBILIDAD del footer (NECESITA TU INPUT).** Hoy el contacto es `attesta.io.mx@gmail.com`, `+52` e Instagram
  `@attesta.io`. Para un comprador enterprise UE es la señal #1 de "proyecto, no proveedor". Necesito de ti: **email en
  dominio propio** (p. ej. `hola@attesta.io`), y si quieres, **LinkedIn** en vez de/además de Instagram. No invento datos.
- [ ] **Prueba social / nombrar al experto (NECESITA TU INPUT).** Decidiste "reformular sin nombre" (hecho). Cuando tengas
  un nombre real + credencial, nombrarlo es la mayor palanca de credibilidad barata. También: contador honesto de waitlist.
- [ ] **Framing de lanzamiento (DECISIÓN TUYA).** Coexisten "Entrar" (producto abierto) y "Solicitar acceso anticipado"
  (waitlist). Apliqué tu mapa de CTAs por plan; si quieres, alineamos el Hero/waitlist a un único estado (abierto vs pre-).
- [ ] **Stats 78%/83% (PENDIENTE de decisión + fuente).** El fundador quiere reponerlos por ser "más nuevos". OJO: en la
  sesión previa se rastreó el 78% a una nota de prensa de un proveedor (Vision Compliance, conflicto de interés) y se
  sustituyó por Deloitte Legal (48,6%) + CSA (>50%). Antes de reponer, CONFIRMAR la fuente nueva y citarla (regla de marca).
- [ ] **`compliance_pct` → renombrar a `readinessPct`** (sugerencia del crítico): el campo nunca se renderiza pero el
  término "compliance/cumplimiento" es prohibido en la marca; un `{s.compliance}` mal colocado lo filtraría. Cosmético/deuda.
- [x] ~~**RiskWizard — gate de perfilado del Art. 6(3):**~~ ✅ HECHO (2026-07-22, validado por el experto). "Perfila
  personas" dejó de ser una opción del single-select de excepciones; ahora es una **pregunta binaria previa**
  (`profiling_gate`, solo si candidato a alto riesgo) que, si es "sí", fuerza alto riesgo con rationale dedicado
  (`high_profiling`) citando el Art. 6(3) párr. 2 — el perfilado anula toda excepción. La pregunta de excepción se
  omite cuando hay perfilado. ES+EN.
- [x] ~~**RiskWizard — cul-de-sac:**~~ ✅ HECHO (2026-07-22). Tras guardar, el bloque de éxito añade el CTA "Detectar
  brechas con un policy pack" → `/dashboard/packs?system=<id>`; la página de packs ahora honra `?system=` y
  preselecciona ese sistema en el formulario de aplicar pack.
- [ ] **Sign-off jurídico antes de GA:** el propio `LegalNote` admite "pendiente revisión por abogado UE". Revisar
  disclaimers + reglas del clasificador + los 5 packs con un abogado de IA UE antes de producción. (Fundador.)
- [ ] **Diseño (diferidos BAJA del crítico):** paleta de riesgo poco diferenciable en daltonismo (3 cálidos vecinos);
  hex hardcodeado en `HeroPreview` (puntos del navegador falso) y avatares de `WelcomeGuide` → tokens de tono; targets
  táctiles de la nav móvil ~32px (<44px reco); retorno de foco en `MobileNav`; posición del toast en móvil.
- [ ] **Ideas de foso (estratégico):** benchmarking anónimo cross-tenant (network effect), integraciones HRIS/model
  registry/ticketing (pegajosidad + activación), paquete de auditoría firmado (ZIP con manifiesto SHA-256 verificable).
- [ ] **Narrativa (mejoras no ejecutadas):** subir `UseCaseStory` aún más arriba (tras RecruitmentFocus); tabla comparativa
  "Attesta vs consultor vs Excel"; fuente para la cifra de mercado de `WhyNow` (o moverla a un deck de inversión).
- [x] ~~**Policy packs — tipo "prohibido" propio (a raíz del pack `gestion-trabajadores`, 2026-07-21).**~~ ✅ HECHO
  (2026-07-22, validado por el `compliance-domain-expert`). Nuevo flag `prohibited?: boolean` en `PolicyControl` y
  `GapItem`. Marcado **solo** `emociones-prohibicion` (Art. 5.1.f) — el experto confirmó que `transparencia-chatbot-emociones`
  sigue siendo brecha ordinaria de Art. 50 (su objeto es transparencia; la mención al Art. 5 es solo advertencia). Regla:
  marcar `prohibited` cuando el OBJETO del control ES la práctica del Art. 5, no cuando meramente se cita. Los ítems
  prohibidos quedan **fuera del cómputo de "% listo"** (`recomputeReadiness` los excluye) y se renderizan como **Inaceptable
  / "Práctica prohibida (Art. 5)"** con acción "Revisión jurídica / cese de uso" y nota de por qué no cuentan, en gap +
  dossier + packs (ES+EN). Persistencia por **migración 0022** (ver §1.1-sexies) con degradación segura si no está aplicada.
  - **Diferido menor (no bloqueante):** el "override/tope" que el experto recomendó (banner en la cabecera del sistema que
    domine el "% listo" mientras exista una práctica prohibida sin resolver) NO se implementó aún; hoy la señal es el badge
    Inaceptable + la nota. Y no se inyectó un ítem prohibido en el dataset demo (el badge sí se ve en la vista de *packs* en
    demo). Ambos, si se quieren, en una iteración futura.
