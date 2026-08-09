# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> La memoria completa del proyecto vive en **[MEMORY.md](./MEMORY.md)** — **léela siempre
> antes de trabajar** y **actualízala** (bitácora §10) cuando el fundador dé una corrección o
> se tome una decisión clave. Este CLAUDE.md es solo el mapa técnico; el "por qué" está en MEMORY.
>
> **Tareas abiertas y cómo retomar → [PENDIENTES.md](./PENDIENTES.md)** (pendientes del fundador
> —Stripe, dominio/SMTP— y míos; consúltalo al empezar cada sesión).

## Resumen del proyecto

**Attesta** — SaaS B2B de **compliance y gobernanza continua de IA** para el **mid-market**,
con cuña vertical en **RRHH/reclutamiento**. Inventaría sistemas de IA, clasifica su riesgo
(EU AI Act + marcos de EE. UU.), genera evidencia lista para auditoría (dossier/informes PDF)
y vigila cambios regulatorios. ICP = **deployer** (quien usa la IA), no provider.

Detalles completos, ICP, MVP, posicionamiento y bitácora → **MEMORY.md**.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + TypeScript
- **Tailwind CSS v4** (config por CSS con `@theme` en `globals.css`; modo oscuro por `data-theme`)
- **Supabase** (Postgres + Auth + RLS), región UE — backend real, opcional (ver dual-mode abajo)
- Diseño: Magic Patterns (MCP) · Docs de librerías: Context7 (MCP)

## Comandos

```bash
npm run dev     # desarrollo (http://localhost:3000)
npm run build   # build de producción (⚠️ necesita .env.local presente, ver gotchas)
npm run start   # servir el build (usa PORT=xxxx para cambiar puerto)
npm run lint    # ESLint
```

```bash
npm run check:copy   # guard de COPY PROHIBIDO (regla #1: Attesta NO certifica)
```

```bash
npm test          # Vitest sobre la lógica pura (221 tests, <1 s)
npm run test:watch
```

La verificación completa es **lint + tsc + `check:copy` + `test` + build** (los cinco están en CI)
y, para el backend real, **curl por API** (usuarios `*@attesta-test.dev`) — ver gotchas.

```bash
npm run verify:deploy   # ¿lo que dice el repo está PUBLICADO? (ver abajo)
```

**⚠️ SUBIDO ≠ PUBLICADO. Léelo antes de decir "hecho".** Vercel publica **`main`**, y el trabajo
se hace en ramas. Durante seis semanas se dio por bueno que `commit + push` equivalía a
producción: los tests pasaban, las migraciones se aplicaban y la web servía el código de julio.
El fundador aplicó migraciones y buscó funciones que no existían en el aire. Nadie mintió — es
que la pregunta "¿esto está publicado?" no tenía forma barata de responderse, así que no se
hacía. Ahora sí: `npm run verify:deploy` compara el commit publicado (`/api/version`, que Vercel
rellena solo) con el local, y comprueba que las rutas públicas respondan. **Ejecutarlo al cerrar
cualquier trabajo que el fundador vaya a mirar**, y no decir "está en producción" sin él.
Ojo: NO incluye rutas de `/dashboard` — el middleware redirige a login antes de resolverlas, así
que un 307 no distingue "existe" de "no existe"; la primera versión las incluía y pasaban en
verde con el vault sin publicar.

**Tests (`npm test`, Vitest, `src/**/*.test.ts`).** Cubren solo **lógica pura** (nada de componentes
ni de Supabase; entorno `node`, sin jsdom, para que la suite corra en <1 s y nadie la desactive).
Existen porque `build`/`lint`/`tsc` compilan tan felices una **regla legal mal editada**: un `if`
invertido en `classify()` da un veredicto equivocado sobre el EU AI Act sin romper nada. Por eso los
tests codifican la **expectativa regulatoria**, no la implementación: el Art. 5 manda sobre todo, el
perfilado del Art. 6.3 párr. 2 anula las excepciones, LL144 exige auditoría **y** publicación (no se
colapsan), el catálogo curado **siempre gana** al pipeline de vigilancia, ninguna brecha se pierde al
deduplicar el plan de acción, y el navegador **no** puede emitir `checkout_completed`. Cubren además
la **paridad ES/EN** de packs, catálogo regulatorio, clasificador y audit-trail (`article`/`articles`
se comparan por sus **números**, no literalmente: la prosa —"Anexo III" → "Annex III"— sí se traduce).
Al escribirlos se validó que **detectan** las regresiones inyectando 6 mutaciones (invertir la puerta
de perfilado, 13 meses en LL144, `<` → `<=` en vencimientos, que el pipeline gane al catálogo, abrir
`CLIENT_EVENTS`, quitar un `prohibited` del espejo EN): las 6 fallaron. **Repetir ese ritual** al
añadir tests — un test que no falla al romper la regla no protege nada.

**Guard de copy prohibido (`scripts/check-prohibited-copy.mjs`, en CI).** Hace verificable la
regla #1 del producto. NO es una lista negra de palabras: escanear "certificado" o "marcado CE"
a secas da ~18 falsos positivos legítimos en este repo (*exige al proveedor el marcado CE*,
*Attesta no es un certificador*, *garantiza intervención humana* del RGPD 22, *ley aprobada
por…*), y un guard con falsos positivos se acaba desactivando. Detecta el **patrón peligroso**
(Attesta como sujeto que certifica, afirmaciones de cumplimiento del cliente, veredictos de
aptitud, `% de cumplimiento`) en **ES y EN**, ignorando **negaciones** ("Attesta NO certifica")
y **preguntas de FAQ**. Escape hatch: `attesta-copy-ok` en la línea, con motivo. Se
**autoprueba** en cada ejecución (`MUST_CATCH` con las reglas esperadas por muestra +
`MUST_PASS` + aserción de cobertura), así que falla también si alguien debilita una regex.
Complementa a `PROHIBITED_COPY` de `src/lib/analista/llm.ts`, que es el guard de *runtime*
sobre los borradores del LLM: uno vigila lo que genera la máquina, el otro lo que escribimos.

## Arquitectura (lo que hay que entender leyendo varios archivos)

**Dual-mode demo/real vía una fachada de datos.** Los componentes del dashboard **solo importan
de `src/lib/data`** y no saben qué backend hay detrás. `src/lib/data/index.ts` elige repo según
`isSupabaseConfigured` (`src/lib/supabase/config.ts` → hay `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY`):

- **MODO DEMO** (sin credenciales): `mock-repo.ts` sirve `src/lib/mock-data.ts`. Todo abierto,
  sin auth. Es lo que se ve en capturas y en la landing.
- **MODO CONECTADO** (con credenciales en `.env.local`): `supabase-repo.ts` lee datos reales;
  el middleware exige sesión + organización.

Al añadir un getter nuevo, decláralo en **los tres**: `index.ts`, `mock-repo.ts`, `supabase-repo.ts`.
El contrato está tipado: `index.ts` define `DataRepo = typeof supabaseRepo` (el repo real es la fuente
de verdad) y afirma que `mock-repo` lo implementa. Si olvidas un getter en el repo demo, `tsc` falla
señalando `data/index.ts` con *"Property 'getX' is missing"* — antes también fallaba, pero los tipos
degradaban a `any` y el error salía como *"implicitly has an 'any' type"* en páginas del dashboard,
lejos de la causa.
Los **write-paths** son Server Actions en `src/lib/data/*-actions.ts` (guardan modo demo; validan
uuid/fecha/enum; `revalidatePath`; toasts vía `?toast=`). Cada repo de supabase debe tener
**fallback seguro** si una tabla/columna aún no existe (devolver `[]`/base curada) para no romper
la app cuando una migración no está aplicada.

**Multi-tenancy + audit-trail.** Aislamiento por `organization_id` con **RLS**; un usuario puede
pertenecer a N organizaciones. El `audit_log` es **inmutable** (triggers `block_mutation`) y lo
rellenan triggers `write_audit` en cada tabla con `organization_id`. `src/lib/audit.ts` traduce
filas crudas a español legible.

**Intake compartible (migración 0027).** La otra mitad del problema de activación: quien contrata Attesta
no sabe qué IA usa cada área. Se emite un **enlace con token de capacidad** (24 bytes aleatorios en
base64url, generados en el servidor) y quien lo recibe rellena una ficha **sin cuenta**. Modelo de
seguridad, que es lo delicado porque es la ÚNICA escritura anónima del producto: lo enviado NO entra en el
inventario, cae en `intake_submissions` (bandeja) y un miembro autenticado la acepta —así el expediente y el
audit-trail siempre tienen un responsable con nombre—; `anon` no tiene NINGUNA policy de lectura y su única
puerta es la RPC `submit_intake` (`security definer`), que devuelve **el mismo `false`** para token
inexistente, caducado, revocado o agotado, para no ser un oráculo de tokens; el enlace caduca (30 días), se
revoca y tiene tope de envíos. Por el mismo motivo, `/intake/[token]` **no valida el token al renderizar**:
si lo hiciera, la URL diría qué enlaces existen. Va con `noindex`.

**Importación de inventario por CSV.** El parser vive aparte y es **puro**
(`src/lib/import/csv.ts`, con tests): autodetecta el delimitador (**Excel en español exporta con `;`** — la
causa nº 1 de "tu importador no funciona"), acepta cabeceras ES/EN con alias, se come el BOM, respeta comas
dentro de comillas y **valida e informa por filas** (número de línea + motivo) en vez de abortar el fichero.
El cliente previsualiza con la MISMA función que usa el servidor, pero el servidor **vuelve a parsear**: la
previsualización es UX, no validación. Trampa comprobada: en un insert múltiple, PostgREST exige que todas
las filas tengan **exactamente las mismas claves** (`PGRST102 All object keys must match`), así que
`import-actions.ts` enumera los seis campos siempre, con `null` — no omitir los nulos.

**Telemetría de producto = primera parte, catálogo cerrado, cero PII.** No hay PostHog/GA/Plausible: los
eventos se escriben en `product_events` (migración **0026**, misma BD en la UE) y el embudo se lee con la RPC
`product_funnel`, que lleva el guard de `is_platform_admin()` **dentro**. El catálogo de eventos vive en
`src/lib/telemetry/events.ts` y es **cerrado** (un nombre nuevo no compila); `CLIENT_EVENTS` marca los pocos que
el navegador puede emitir — los hechos de negocio (pago, alta de sistema) se emiten en el servidor, donde son
comprobables, para que nadie pueda falsear el embudo desde la consola. Tres emisores según el contexto:
`telemetry/server.ts` (`trackServer`, aplaza el insert con `after()`), `telemetry/service.ts` (`trackService`,
para webhooks/crons sin sesión) y `telemetry/client.ts` (`track`, `sendBeacon` + respeto de GPC/DNT).
`sanitizeProps` acota los metadatos y **descarta cualquier valor con `@`**: la fuga de PII más probable es colar
un correo sin darse cuenta. Nunca lanza: si 0026 no está aplicada, medir es un no-op y la app funciona igual.
El panel `/dashboard/telemetria` es interno (solo `platform_admins`, y en demo devuelve vacío a propósito).

**Capa GPAI del clasificador (Cap. V).** `classify()` devuelve un bloque `gpai` opcional cuando el sistema
declara un modelo de propósito general, y **no toca el nivel de riesgo**: el Cap. V es un régimen paralelo, así
que un chatbot con GenAI sigue siendo "limitado" por el Art. 50 — marcarlo como alto riesgo sería alarmismo y
regulatoriamente falso. Lo que añade son citas y deberes de **exigir evidencia al proveedor del modelo**
(Art. 53.1.b), más un aviso de **Art. 25** (fine-tuning o marca blanca ⇒ puede pasarse a *proveedor*). Se
**anexan a `citations`/`obligations`**, que ya se persisten, de modo que dossier e informe muestran la capa sin
tocar su código. El criterio del **tercio del cómputo** se cita siempre como **indicativo y de las directrices
de la Comisión (jul-2025)**, nunca como umbral del Reglamento; un test lo vigila.

**Observabilidad de las degradaciones (`src/lib/observability/log.ts`).** La fachada está llena de
`if (error) return []` deliberados —la app no puede romperse porque falte una migración—, pero borraban
la causa: "la tabla no existe", "la RLS está mal" y "Supabase está caído" se veían igual, una pantalla
vacía. `logDataFallback(at, error, detail?)` clasifica en **`migration-pending`** (códigos 42P01/42703/
42883/PGRST20x o el mensaje de *schema cache* → `warn`, es el estado esperado antes de aplicar una
migración), **`permission`** (42501, RLS) e **`incident`** (todo lo demás → `error`), y emite **una línea
JSON** (`{"src":"attesta","at":"getGapItems",…}`) que Vercel parsea sin configurar nada. Hay antirruido
de 5 min por (sitio + código) para que una migración pendiente no escriba una línea por render.
`logIncident` es para los `catch` de escritura. **Aquí NO entran datos de cliente**: solo el sitio, el
código y el mensaje de Postgres. No manda nada a terceros a propósito: enchufar Sentry es sustituir
`emit`, y sumar un subprocesador es decisión del fundador (coste + DPA), no un detalle de un commit.

**Cumplimiento propio (`src/lib/legal/`) = la lista de subprocesadores es CÓDIGO.** Las 4 páginas legales
(privacidad, cookies, subprocesadores, DPA) salen de datos tipados bilingües en `src/lib/legal/`, **no del
diccionario i18n** (frontera legal: el diccionario es chrome de UI). Rutas `/legal/[slug]` y `/en/legal/[slug]`,
con **slug distinto por idioma** (`privacidad`↔`privacy`) para que ambas indexen con su canonical. Lo que hace
que esto no envejezca: `subprocessors.ts` es el registro del que salen **a la vez** la página y un **guard**
(`subprocessors.test.ts`) que escanea el repo buscando destinos de salida —argumentos de `fetch(...)` y la
allowlist de la CSP— y **falla si el producto habla con un host no declarado**. Distingue *enviar datos* de
*citar una URL*, así que los enlaces a eur-lex/ilga.gov del contenido regulatorio no dan falsos positivos.
Separa **subencargados de datos de cliente** de los que solo ven el **corpus normativo público** (Voyage,
NVIDIA NIM), y un test vigila que esa clasificación no se afloje. La identidad del responsable
(`entity.ts`) **no tiene default plausible**, como `site-url.ts`: sin los 4 datos del art. 13.1.a, las páginas
salen con aviso de borrador visible + `noindex` + fuera del sitemap; con ellos, reales e indexables sin tocar
código. Ojo: `sitemap.ts` lleva `force-dynamic` **por eso** — si se prerenderiza, las páginas (dinámicas)
dejarían de ser `noindex` mientras el sitemap seguiría sin listarlas hasta el siguiente despliegue.

**Vault de evidencia + paquete firmado (`src/lib/vault/`).** Archivos reales detrás de cada control
(migración 0038: `evidence_files` + bucket privado; la ruta empieza por `organization_id` **porque la policy
del bucket compara esa primera carpeta** — no es nomenclatura, es el aislamiento). El paquete
(`/api/vault/package`) es un ZIP con la evidencia, el manifiesto y la firma Ed25519. **El adversario es la
organización auditada, no Attesta**: por eso firma Attesta, y por eso un manifiesto sin firma no valdría.
El **hash se calcula en el servidor** y se **recalcula al empaquetar** (si un archivo cambió por debajo, no
entra y la omisión se declara). La firma es sobre la **serialización canónica** (`canonicalJson`, ordenada en
profundidad): sin eso un verificador ajeno diría "firma inválida" sobre un paquete legítimo. Qué afirma —
custodia e integridad, nunca conformidad — va **dentro** del manifiesto y del README del ZIP. Sin
`VAULT_SIGNING_KEY` el paquete sale SIN firmar y lo dice en pantalla, en el nombre del fichero y dentro; no se
genera una clave al vuelo a propósito. Cero dependencias: ZIP a mano (`zlib.crc32`) y Web Crypto. Verificado
con `unzip`, Python y **OpenSSL** — probar un formato binario con el parser propio no demuestra nada. Y la
purga de organización borra también los objetos del almacenamiento, **antes** que la BD: no caen en cascada.

**Contenido legal = 100% determinista, cero LLM.** Las rutas que emiten texto regulatorio (dossier,
informe, radar de vigilancia, clasificación de riesgo, recomendaciones) se ensamblan solo con datos
reales del cliente + texto del AI Act ya verificado por el experto. Un texto legal alucinado es un
pasivo. La automatización futura (pipeline de vigilancia) **propone borradores** que un **humano
valida** antes de publicarse. Lógica clave: `risk-assessment.ts`, `recommendations.ts`,
`regulatory-watch.ts`, `policy-packs/`.

## Estructura

```
src/
  app/                         # rutas (App Router)
    page.tsx                   # landing (vertical RRHH)
    login/ onboarding/ reset-password/ auth/callback/   # auth
    dashboard/                 # app shell
      inventario/[id]/{editar,dossier}  riesgo/evaluar  gap/{informe,nuevo}
      plan/ packs/ equipo/ actividad/ informe/
      vigilancia/candidatos/   # radar regulatorio + bandeja del validador
  components/{ui,landing,dashboard,auth}/
  lib/
    data/          # FACHADA: index + mock-repo + supabase-repo + *-actions (server)
    supabase/      # clients (client/server/middleware) + config (isSupabaseConfigured)
    mock-data.ts   # datos demo + TIPOS canónicos (AiSystem, GapItem, ...)
    risk-assessment.ts regulatory-watch.ts recommendations.ts audit.ts
    policy-packs/rrhh.ts  task-reminders.ts
    telemetry/     # events (catálogo cerrado) + server/service/client + actions
supabase/
  migrations/*.sql   # 0001..0039 (esquema, RLS, audit, RPCs, vault, facturación, endurecimiento de grants)
  setup.sql          # todas las migraciones concatenadas (el fundador las pega en SQL Editor)
docs/{supabase.md,thesis.md}
```

## Subagentes disponibles (`.claude/agents/`)

- `compliance-domain-expert` — **consúltalo antes de** definir reglas de riesgo, textos legales o
  afirmaciones regulatorias en la UI (EU AI Act, ISO 42001, NIST AI RMF, leyes estatales EE. UU.).
- `product-architect` — arquitectura (datos, APIs, auth, multi-tenancy) antes de decisiones grandes.
- `ui-designer` — diseño UI creativo/minimalista (Magic Patterns).
- `frontend-engineer` — implementación Next.js + TS + Tailwind.

## Reglas de trabajo

1. **Consulta `MEMORY.md`** antes de decidir nada; **regístralo** en §10 al terminar.
2. Trabaja en **loop**: planear → incremento pequeño → verificar (build/lint/tsc/curl) → checkpoint → registrar.
3. **Checkpoints en decisiones clave** (arquitectura, diseño, nombre, features grandes); autónomo en lo demás.
4. Verifica APIs de librerías con **Context7** antes de escribir código contra ellas.
5. Diseño **creativo/minimalista pero original**, enterprise moderno, accesible; animaciones sutiles, nunca infantiles.

## Reglas de producto que NO se pueden violar

- **Attesta NO certifica.** Es system-of-record de evidencia + autoevaluación + preparación para
  auditoría. **Copy PROHIBIDO** en UI/PDF: *certificado, aprobado/apto, cumple/compliant, garantiza,
  sello de conformidad, marcado CE, validado/auditado por Attesta, libre de riesgo, asesoría legal.*
  **Copy SEGURO:** *autoevaluación, preparación para auditoría, % listo, brechas identificadas,
  clasificación orientativa, evidencia declarada.* Los verbos son de **la organización** ("tu
  organización declara…"), no de Attesta. Puntaje = "% listo / preparación", nunca "% cumplimiento".
- **Provider vs deployer:** nuestro ICP es **deployer**. En textos regulatorios, las obligaciones del
  proveedor (Arts. 9–15) se reencuadran como "exige/conserva evidencia del proveedor"; el foco propio
  es Arts. 14, 26, 27, 50, 86. No redactar como si el cliente fabricara el sistema.

## Gotchas conocidos

- **Migraciones = manuales.** El fundador las aplica pegando `supabase/setup.sql` en el SQL Editor
  (la anon key no permite DDL). Al añadir una migración, concaténala también en `setup.sql` y avisa.
- **`security definer` + `search_path=''`:** cualifica con esquema **TODO**, incluidos casts de tipos
  (`::public.audit_action`, `::public.member_role[]`), no solo tablas. Olvidarlo rompió el onboarding y
  las invitaciones (bugs ya corregidos).
- **Build necesita `.env.local`:** `next build` inlinea `NEXT_PUBLIC_*` en el cliente. Si compilas sin
  `.env.local`, el bundle queda en modo demo aunque runtime tenga las vars.
- **El dominio público no tiene default (`src/lib/site-url.ts`).** `NEXT_PUBLIC_APP_URL` manda; en un
  despliegue (`VERCEL` presente) sin ella el **build falla**; fuera de un despliegue se usa `localhost`.
  Un valor con barra final, ruta o esquema raro se **rechaza**, no se recorta. El default plausible que
  había antes era el bug: un cambio de dominio rompía canonical/hreflang/sitemap y los enlaces de los
  correos sin que nada se quejara. No reintroducir un `?? "https://…"` en ningún sitio.
- **Verificación del backend real = curl, no navegador.** El Chromium headless de Playwright NO usa el
  proxy de salida → no alcanza Supabase. Verifica el flujo real por API con `curl` (sí usa proxy),
  con usuarios de prueba `*@attesta-test.dev`.
- **Tailwind v4** tree-shakea las variables `@theme` no usadas por ninguna clase. Para color inline
  dinámico usa un **mapa de hex** en el componente, no `var(--color-...)` de un token no referenciado.
  Todo color semántico nuevo va por **token/tono** (`--tone-*`), nunca hex hardcodeado en clases.
- **Rutas con datos frescos** (countdown de vigilancia, audit-trail) llevan `export const dynamic = "force-dynamic"`.
- **`greatest`/`least` NO se pueden cualificar con esquema.** Son construcciones del lenguaje SQL, no funciones:
  `pg_catalog.least(...)` da *"function does not exist"*. Tampoco les afecta `search_path = ''`, así que en
  `security definer` van **sin** prefijo (a diferencia de `make_interval`, `now()`, casts, tablas…). Se detectó
  levantando un Postgres 16 desechable y aplicando la migración 0026 antes de dársela al fundador; **merece la
  pena hacerlo con cada migración nueva** (`initdb` + un scaffold con `auth.users`, `organizations`, los roles
  `anon`/`authenticated` y `is_platform_admin()` basta para validar sintaxis, CHECKs y policies).
- **Aplica cada migración DOS veces en el Postgres desechable, no una.** La primera pasada prueba que el SQL
  es correcto; la segunda, que es **re-ejecutable**, que es la propiedad que el fundador usa de verdad (re-pega
  el fichero tras corregir cualquier otra cosa). `create policy` **no admite `if not exists`**: cada una va
  precedida de `drop policy if exists`. Así se cazó que 0026 moría en la segunda pasada con *policy already
  exists*.
- **`revoke ... from anon` sobre una FUNCIÓN es casi siempre un no-op.** Postgres concede `EXECUTE` a **PUBLIC**
  por defecto en cada función nueva, y `anon` lo hereda por ahí. Si una función no debe ser pública:
  `revoke all on function f(args) from public;` + `grant execute ... to <rol que sí>;` — y el guard de
  autorización va **además** dentro de la función, nunca en su lugar. Corregido en 0028 para `product_funnel`
  y `is_platform_admin()`.
- **El Postgres desechable NO reproduce los grants por defecto de Supabase**, y por eso no sirve para concluir
  nada sobre *permisos*: allí `anon` no tiene nada, así que un SELECT anónimo da *permission denied*, mientras
  en Supabase (`grant select on all tables in schema public to anon` por defecto) da `200 []` — protegido por
  la **RLS sola**. Para afirmar algo sobre aislamiento hay que **replicar esos grants en el scaffold** o
  verificarlo contra el proyecto real; si no, se concluye "dos cerraduras" donde hay una.
