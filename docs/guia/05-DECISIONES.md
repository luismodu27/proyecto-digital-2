# 05 · Decisiones clave: qué, por qué y para qué

> Este documento recoge las decisiones de **producto, arquitectura y disciplina** que
> más condicionan cómo se trabaja en Attesta. No es un changelog: es el **"por qué"** que
> hay detrás de cada elección, para que quien retome el proyecto no las deshaga por
> desconocimiento ni las repita a ciegas.
>
> Cada decisión es una **ficha corta**: **QUÉ** se decidió, **POR QUÉ** (la razón o el
> dolor que la motivó) y **PARA QUÉ** (qué problema evita o qué habilita).
>
> Fuentes: `MEMORY.md` §10 (bitácora) y las secciones de arquitectura de `CLAUDE.md`.
> Documentos hermanos: [00-INICIO.md](./00-INICIO.md) · [01-PRODUCTO.md](./01-PRODUCTO.md) ·
> [02-ARQUITECTURA.md](./02-ARQUITECTURA.md) · [03-FLUJO-DE-TRABAJO.md](./03-FLUJO-DE-TRABAJO.md) ·
> [04-ROL-DEL-AGENTE.md](./04-ROL-DEL-AGENTE.md) · tareas vivas en [PENDIENTES.md](../../PENDIENTES.md).

---

## Índice

**Producto y posicionamiento**
- [D1 · Attesta NO certifica: es un system-of-record de evidencia](#d1--attesta-no-certifica)
- [D2 · El ICP es el *deployer*, no el *provider*](#d2--el-icp-es-el-deployer)
- [D3 · Contenido legal 100% determinista, cero LLM](#d3--contenido-legal-100-determinista-cero-llm)

**Arquitectura de datos y backend**
- [D4 · Fachada de datos dual-mode (demo / conectado)](#d4--fachada-de-datos-dual-mode)
- [D5 · Migraciones manuales](#d5--migraciones-manuales)
- [D6 · Audit-trail inmutable + hash independiente de zona (0041)](#d6--audit-trail-inmutable--hash-independiente-de-zona)

**Confianza, cumplimiento propio y seguridad**
- [D7 · Telemetría de primera parte, catálogo cerrado, cero PII](#d7--telemetría-de-primera-parte)
- [D8 · Subprocesadores como código, con guard](#d8--subprocesadores-como-código)
- [D9 · Vault de evidencia firmado: el adversario es la organización auditada](#d9--vault-de-evidencia-firmado)

**Comportamiento del producto**
- [D10 · El arreglo del 202 del Vigía: el catálogo curado siempre gana](#d10--el-arreglo-del-202-del-vigía)
- [D11 · Morosidad estándar: un pago fallido no expulsa a quien paga](#d11--morosidad-estándar)

**Disciplina de trabajo**
- [D12 · SUBIDO ≠ PUBLICADO](#d12--subido--publicado)

---

## Producto y posicionamiento

<a id="d1--attesta-no-certifica"></a>
### D1 · Attesta NO certifica

**QUÉ.** Attesta es un **system-of-record de evidencia + autoevaluación + preparación para
auditoría**. **Nunca** certifica, aprueba, dictamina aptitud ni afirma que el cliente
"cumple". Hay una lista cerrada de **copy prohibido** en UI y PDF (*certificado,
aprobado/apto, cumple/compliant, garantiza, sello de conformidad, marcado CE,
validado/auditado por Attesta, libre de riesgo, asesoría legal*) y una de **copy seguro**
(*autoevaluación, preparación para auditoría, % listo, brechas identificadas, clasificación
orientativa, evidencia declarada*). Los verbos son de **la organización** ("tu organización
declara…"), no de Attesta. El puntaje es "% listo / preparación", nunca "% cumplimiento".

**POR QUÉ.** Certificar es una actividad regulada con responsabilidad legal. Si Attesta
"certificara", asumiría un pasivo que ni puede ni quiere cubrir, y engañaría al cliente
sobre el valor real del producto (ayudar a **prepararse**, no sustituir a un auditor).

**PARA QUÉ.** Evita responsabilidad legal y publicidad engañosa, y mantiene honesto el
posicionamiento. Es la **regla de producto nº 1**, y por eso está protegida por **dos
guards**: `scripts/check-prohibited-copy.mjs` (en CI, detecta el *patrón peligroso* en ES/EN
—Attesta como sujeto que certifica, veredictos de aptitud, `% de cumplimiento`— ignorando
negaciones y preguntas de FAQ) y `PROHIBITED_COPY` en `src/lib/analista/llm.ts` (guard de
runtime sobre los borradores del LLM). Uno vigila lo que escribimos; el otro, lo que genera
la máquina.

---

<a id="d2--el-icp-es-el-deployer"></a>
### D2 · El ICP es el *deployer*

**QUÉ.** El cliente objetivo es el **deployer** (quien *usa* la IA), no el **provider**
(quien la *fabrica*). En los textos regulatorios, las obligaciones del proveedor
(Arts. 9–15 del EU AI Act) se **reencuadran** como "exige/conserva evidencia del proveedor";
el foco propio son los Arts. **14, 26, 27, 50, 86**. Nunca se redacta como si el cliente
fabricara el sistema.

**POR QUÉ.** El mid-market que compra Attesta despliega IA de terceros (ATS, copilotos,
modelos vía API); casi nunca la construye. Tratarlo como provider genera obligaciones que no
le corresponden y erosiona la confianza en el producto.

**PARA QUÉ.** Alinea todo el contenido con la realidad del cliente y evita alarmismo
regulatorio. Es una fuente recurrente de bugs sutiles: confundir provider/deployer hizo que
el **Anexo IV** figurara como brecha del cliente en la demo cuando no lo es (corregido). Ante
cualquier duda sobre una obligación, consultar al subagente `compliance-domain-expert`.

---

<a id="d3--contenido-legal-100-determinista-cero-llm"></a>
### D3 · Contenido legal 100% determinista, cero LLM

**QUÉ.** Todo texto regulatorio que el producto emite (dossier, informe, radar de
vigilancia, clasificación de riesgo, recomendaciones) se **ensambla solo** con datos reales
del cliente + texto del AI Act ya verificado por el experto. **Ningún LLM** redacta contenido
legal que llegue al cliente. La automatización futura (pipeline de vigilancia) **propone
borradores** que un **humano valida** antes de publicar. Lógica clave: `src/lib/risk-assessment.ts`,
`src/lib/recommendations.ts`, `src/lib/regulatory-watch.ts`, `src/lib/policy-packs/`.

**POR QUÉ.** Un texto legal alucinado es un **pasivo**: si un PDF afirma algo falso sobre el
EU AI Act, el daño es directo y no se puede retirar. El determinismo también hace el contenido
**testeable** (los tests de Vitest codifican la expectativa regulatoria).

**PARA QUÉ.** Garantiza que la salida legal sea verificable, reproducible y auditable, y que
un error se cace con un test en lugar de descubrirse en producción. Cualquier LLM del producto
queda confinado a **borradores internos** con humano en el bucle.

---

## Arquitectura de datos y backend

<a id="d4--fachada-de-datos-dual-mode"></a>
### D4 · Fachada de datos dual-mode (demo / conectado)

**QUÉ.** Los componentes del dashboard **solo importan de `src/lib/data`** y no saben qué
backend hay detrás. `src/lib/data/index.ts` elige repo según `isSupabaseConfigured`
(`src/lib/supabase/config.ts`):

| Modo | Cuándo | Repo | Comportamiento |
|------|--------|------|----------------|
| **DEMO** | sin credenciales | `mock-repo.ts` (sirve `mock-data.ts`) | todo abierto, sin auth; es lo de las capturas y la landing |
| **CONECTADO** | con credenciales en `.env.local` | `supabase-repo.ts` | datos reales; middleware exige sesión + organización |

El contrato está tipado: `index.ts` define `DataRepo = typeof supabaseRepo` (el repo real es
la fuente de verdad) y afirma que `mock-repo` lo implementa. Al añadir un getter, se declara
en **los tres** (`index.ts`, `mock-repo.ts`, `supabase-repo.ts`). Los write-paths son Server
Actions en `src/lib/data/*-actions.ts`. Cada repo de Supabase debe tener **fallback seguro**
(devolver `[]`/base curada) si una tabla/columna aún no existe.

**POR QUÉ.** Se necesita una demo pública creíble **sin backend** y, a la vez, un producto
real con auth y RLS, sin duplicar la capa de presentación ni ensuciar los componentes con
lógica de "¿hay Supabase?".

**PARA QUÉ.** Permite enseñar el producto sin credenciales, desarrollar sin depender del
backend, y que una migración no aplicada **degrade** en vez de romper la app. El tipado
convierte "olvidé un getter en el repo demo" en un error de `tsc` claro y localizado en
`data/index.ts` (antes degradaba a `any` y el error salía lejos de la causa).

---

<a id="d5--migraciones-manuales"></a>
### D5 · Migraciones manuales

**QUÉ.** Las migraciones **no** se aplican por CI ni por CLI: el fundador las aplica pegando
`supabase/setup.sql` (todas concatenadas) en el **SQL Editor** de Supabase. Al añadir una
migración `supabase/migrations/NNNN_*.sql`, hay que **concatenarla también** en `setup.sql`
y **avisar** al fundador.

**POR QUÉ.** La `anon key` no permite DDL, y no se quiere dar a la automatización una llave de
administrador de la base de datos. El control lo tiene una persona.

**PARA QUÉ.** Mantiene el control del esquema en manos del fundador y obliga a una disciplina
de calidad: cada migración se prueba **dos veces** en un Postgres 16 desechable (la 1ª prueba
que es correcta; la 2ª, que es **re-ejecutable** —`create policy` no admite `if not exists`,
así que va precedida de `drop policy if exists`). Cuidado con las trampas de `security definer`
(cualificar con esquema **todo**, incluidos casts), `greatest`/`least` (que **no** se cualifican
con esquema) y los grants por defecto de Supabase (el Postgres desechable **no** los reproduce,
así que no sirve para concluir nada sobre *permisos*). Ver los gotchas en `CLAUDE.md`.

---

<a id="d6--audit-trail-inmutable--hash-independiente-de-zona"></a>
### D6 · Audit-trail inmutable + hash independiente de zona (0041)

**QUÉ.** El `audit_log` es **inmutable**: triggers `block_mutation` impiden UPDATE/DELETE, y
triggers `write_audit` lo rellenan automáticamente en cada tabla con `organization_id`. Cada
fila encadena un `prev_hash`/`row_hash` (SHA-256) formando una cadena verificable. La migración
**0041** corrige un fallo latente: `private.audit_hash` serializaba el instante metiendo un
`timestamptz` dentro de un `jsonb`, y esa conversión a texto usa la **zona horaria de la
sesión**. La función pasa a serializar el instante **siempre en UTC** con formato fijo
(`... at time zone 'UTC'` + `to_char`), y re-calcula toda la cadena con un backfill determinista
(igual que la 0020 al introducirla).

**POR QUÉ.** El mismo instante, hasheado en dos sesiones con zona distinta, producía dos hashes
distintos: la cadena se reportaría **ROTA sin que nadie la tocara** —una **falsa alarma de
manipulación**, de lo peor que puede pasar en este producto—. Hoy no ardía porque Supabase usa
UTC por defecto, pero un solo `SET TIME ZONE` bastaba. Además, la función estaba marcada
`immutable` sin serlo (su resultado dependía de un GUC de sesión).

**PARA QUÉ.** Da un audit-trail cuya integridad no depende del entorno, y una función que es
**inmutable de verdad**. Lección reforzada en la bitácora: se **demostró ejecutando** la
propiedad (hash idéntico bajo UTC y bajo `America/Mexico_City`; el viejo difería), no solo
aplicando el SQL —"se aplica sin error" y "funciona" son afirmaciones distintas—.

---

## Confianza, cumplimiento propio y seguridad

<a id="d7--telemetría-de-primera-parte"></a>
### D7 · Telemetría de primera parte, catálogo cerrado, cero PII

**QUÉ.** No hay PostHog/GA/Plausible. Los eventos se escriben en `product_events`
(migración 0026, **misma BD en la UE**) y el embudo se lee con la RPC `product_funnel`, que
lleva el guard de `is_platform_admin()` **dentro**. El catálogo de eventos
(`src/lib/telemetry/events.ts`) es **cerrado** (un nombre nuevo no compila); `CLIENT_EVENTS`
marca los pocos que el navegador puede emitir. Los **hechos de negocio** (pago, alta de
sistema) se emiten en el **servidor**, donde son comprobables. `sanitizeProps` acota los
metadatos y **descarta cualquier valor con `@`** (la fuga de PII más probable es colar un
correo). Nunca lanza: si 0026 no está aplicada, medir es un no-op.

**POR QUÉ.** Un producto de compliance no puede filtrar datos de sus clientes a un tercero
para medir su propio embudo, ni permitir que el embudo se falsee desde la consola del
navegador. Y no puede romperse porque una migración de telemetría no esté aplicada.

**PARA QUÉ.** Permite medir el producto **sin subprocesadores externos**, sin PII y sin que
nadie pueda inflar el funnel emitiendo eventos de negocio desde el cliente. El panel
`/dashboard/telemetria` es interno (solo `platform_admins`; en demo devuelve vacío a
propósito).

---

<a id="d8--subprocesadores-como-código"></a>
### D8 · Subprocesadores como código, con guard

**QUÉ.** Las 4 páginas legales (privacidad, cookies, subprocesadores, DPA) salen de **datos
tipados bilingües** en `src/lib/legal/`, **no** del diccionario i18n (frontera legal: el
diccionario es *chrome* de UI). `subprocessors.ts` es el registro del que salen **a la vez**
la página pública y un **guard** (`subprocessors.test.ts`) que **escanea el repo** buscando
destinos de salida —argumentos de `fetch(...)` y la allowlist de la CSP— y **falla si el
producto habla con un host no declarado**. Separa **subencargados de datos de cliente** de los
que solo ven el **corpus normativo público** (Voyage, NVIDIA NIM), y un test vigila que esa
clasificación no se afloje. La identidad del responsable (`entity.ts`) **no tiene default
plausible**: sin los 4 datos del Art. 13.1.a, las páginas salen con aviso de borrador +
`noindex` + fuera del sitemap.

**POR QUÉ.** Una lista de subprocesadores que se mantiene "a mano" **envejece**: se añade un
`fetch` a un host nuevo y la página legal queda mintiendo. Convertir la lista en la **fuente
de verdad ejecutable** hace imposible ese desfase.

**PARA QUÉ.** Garantiza que la declaración legal de subprocesadores **coincide con la
realidad del código**, y que añadir una salida de red no declarada **rompe el build**. El
guard distingue *enviar datos* de *citar una URL*, así que los enlaces a eur-lex/ilga.gov del
contenido regulatorio no dan falsos positivos.

---

<a id="d9--vault-de-evidencia-firmado"></a>
### D9 · Vault de evidencia firmado

**QUÉ.** Hay archivos reales detrás de cada control (migración 0038: `evidence_files` + bucket
privado; la ruta empieza por `organization_id` **porque la policy del bucket compara esa
primera carpeta** —es aislamiento, no nomenclatura—). El paquete (`/api/vault/package`) es un
ZIP con la evidencia, el manifiesto y una firma **Ed25519**. La firma es sobre la
**serialización canónica** (`canonicalJson`, ordenada en profundidad). El **hash se calcula
en el servidor** y se **recalcula al empaquetar**: si un archivo cambió por debajo, no entra y
la omisión se declara. Sin `VAULT_SIGNING_KEY`, el paquete sale **sin firmar** y lo dice en
pantalla, en el nombre del fichero y dentro. Cero dependencias (ZIP a mano con `zlib.crc32` +
Web Crypto). Verificado con `unzip`, Python y **OpenSSL**.

**POR QUÉ.** **El adversario es la organización auditada, no Attesta.** Un cliente podría
querer alterar la evidencia después de generarla; por eso **firma Attesta** y un manifiesto sin
firma no valdría. Qué afirma el paquete —**custodia e integridad, nunca conformidad**— va
**dentro** del manifiesto y del README del ZIP (coherente con [D1](#d1--attesta-no-certifica)).

**PARA QUÉ.** Da a un auditor externo un paquete cuya integridad puede verificar con
herramientas estándar, con la firma de un tercero (Attesta) que la organización no controla.
La firma sobre la forma canónica evita que un verificador ajeno diga "firma inválida" sobre un
paquete legítimo (mismo modo de fallo que motivó reducir las rutas del ZIP a ASCII: **acusar de
manipulación a quien no ha tocado nada**). La purga de organización borra los objetos del
almacenamiento **antes** que la BD, porque no caen en cascada.

---

## Comportamiento del producto

<a id="d10--el-arreglo-del-202-del-vigía"></a>
### D10 · El arreglo del 202 del Vigía: el catálogo curado siempre gana

**QUÉ.** El Vigía (radar regulatorio) sondea fuentes oficiales y detecta cambios. Antes trataba
cualquier respuesta `2xx` como "ok" (`res.ok`), incluido el **`202` del muro anti-bot** de
EUR-Lex: hasheaba esa página de bloqueo como si fuera el contenido real, dando **vigilancia
falsa** (creía vigilar algo que no estaba viendo). El arreglo trata el `202` como **error
honesto**, no como "sin cambios".

**POR QUÉ.** Un radar que reporta "todo en orden" mientras en realidad choca contra un muro
anti-bot es peor que uno que reporta el fallo: da falsa tranquilidad sobre una fuente legal.

**PARA QUÉ.** Hace el diagnóstico del Vigía **honesto**. Y aquí está la garantía de producto que
lo hace seguro: **el catálogo curado (por el experto) siempre gana** al pipeline de vigilancia, y
el Vigía **solo señala a la bandeja interna** del validador (`/dashboard/vigilancia/candidatos`);
nunca publica contenido legal por su cuenta (coherente con [D3](#d3--contenido-legal-100-determinista-cero-llm)).
Por eso, cuando el diagnóstico en producción reveló que 3 de 8 fuentes dan `error` desde la IP
de Vercel (bloqueo por IP, no webs caídas), **el cliente no se ve afectado**. El fallback de
EUR-Lex quedó como tarea aparte y no urgente (ver [PENDIENTES.md](../../PENDIENTES.md)). Un test
vigila que el catálogo curado gane al pipeline.

---

<a id="d11--morosidad-estándar"></a>
### D11 · Morosidad estándar: un pago fallido no expulsa a quien paga

**QUÉ.** Un pago fallido **no** corta el acceso al instante. Cuando falla un cobro, Stripe
marca la suscripción `past_due` y **reintenta** ~2 semanas (Smart Retries); mientras dura ese
ciclo, el cliente **conserva el acceso**. Solo cuando Stripe agota los reintentos y **cancela**
(`canceled`) —o deja `unpaid`— se retira. Lógica **pura** en `src/lib/billing/dunning.ts`:
`subscriptionGrantsAccess(status, currentPeriodEndISO, now)` concede acceso a `active`/`trialing`
siempre, y a `past_due` **mientras dure la gracia** (`current_period_end` + `DUNNING_GRACE_DAYS = 14`).
Sin fecha legible de periodo, se **concede**: nunca cortar a ciegas a quien podría estar pagando.
Los 14 días son un **tope de seguridad** por si un webhook de cancelación se pierde, no el reloj
principal.

**POR QUÉ.** **Antes hacía lo contrario**: `getOrgPlan` solo desbloqueaba con `active`/`trialing`,
así que en el instante en que Stripe marcaba `past_due`, el cliente caía a 'free' y veía la
pantalla "Suscríbete" **como si nunca hubiera pagado**. Cortar a un cliente que paga por un fallo
transitorio de tarjeta es peor para el negocio que unos días de servicio en riesgo.

**PARA QUÉ.** Alinea el producto con el estándar de la industria (Stripe Billing, Notion, Linear,
Vanta): tolerancia ante fallos transitorios de cobro. La lógica es **pura** (el instante `now`
entra como parámetro) para poder **fijarla con tests** como el resto de reglas de negocio. `isInDunning`
permite a la UI mostrar el aviso de "actualiza tu método de pago" sin cortar nada.

---

## Disciplina de trabajo

<a id="d12--subido--publicado"></a>
### D12 · SUBIDO ≠ PUBLICADO

**QUÉ.** "Hecho" **no** es *commit + push*. Es **fusionado en `main` + `npm run verify:deploy`
en verde**. Vercel publica **`main`**, y el trabajo se hace en ramas. `verify:deploy` compara
el commit publicado (`/api/version`, que Vercel rellena solo) con el local **y**, por separado,
comprueba que las rutas públicas respondan de verdad. Hay que ejecutarlo al cerrar cualquier
trabajo que el fundador vaya a mirar, y no decir "está en producción" sin él. **No** incluye
rutas de `/dashboard` (el middleware redirige a login antes de resolverlas, y un 307 no distingue
"existe" de "no existe").

**POR QUÉ.** Durante **seis semanas** todo el trabajo se fue a una rama y **`main` no se tocó**.
El fundador aplicaba migraciones y buscaba en el panel funciones que **no existían en producción**
(el vault, incidentes, proveedores, las páginas legales) mientras el repo, los tests, el CI y el
agente decían que estaba todo hecho. **Nadie mintió**: la pregunta "¿esto está publicado?" no
tenía forma barata de responderse, así que no se hacía. 41 commits en el limbo. Fue el fallo más
caro del proyecto, y no fue de código.

**PARA QUÉ.** Convierte "¿esto está publicado?" en una consulta de un segundo y hace imposible
volver a confundir el repositorio con producción. Lecciones asociadas grabadas en la bitácora:
(1) **un síntoma que abarca más de lo que tocaste apunta al transporte, no al cambio** (faltaba
*todo lo reciente a la vez*, no solo el vault); (2) **un test que no distingue no es un test** (la
1ª versión del verificador incluía rutas de dashboard que pasaban en verde con el vault sin
publicar); (3) el modo de fallo dominante del proyecto no es "código malo" sino **"la decisión no
llegó a todos sus sitios"** —el antídoto es un **guard que escanee el repo** buscando las
instancias que no tocaste (`subprocessors.test.ts`, `nav-gate.test.ts`, `db-grants.test.ts`,
`db-function-arity.test.ts`)—.

---

## Cómo usar estas decisiones

- **Antes de cambiar algo que roce una de estas fichas**, entiende el "por qué": casi todas
  nacieron de un fallo real que ya costó tiempo. Deshacerlas por desconocimiento reintroduce el
  problema.
- **Al tomar una decisión nueva** de arquitectura, producto, nombre o feature grande: haz
  **checkpoint** con el fundador y **regístrala** en `MEMORY.md` §10 (bitácora). Este documento
  es un resumen curado; la memoria viva es `MEMORY.md`.
- **Si un arreglo toca más de un fichero**, no está terminado hasta que exista un **guard** que
  busque las instancias que no tocaste.
- **Contenido legal o reglas de riesgo**: consulta al subagente `compliance-domain-expert` antes
  de afirmar nada regulatorio.
