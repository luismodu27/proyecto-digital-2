# Dónde está todo (arquitectura y mapa del código)

> Este documento es el **mapa navegable** del código de Attesta. Complementa a
> [`CLAUDE.md`](../../CLAUDE.md) (el mapa técnico que Claude Code lee solo en cada sesión):
> aquí no repetimos su prosa palabra por palabra, sino que te damos una vista completa
> —con rutas de archivo reales— para que sepas *a qué carpeta ir* ante cualquier tarea.
> Para el "qué es el producto" ve a [`01-PRODUCTO.md`](./01-PRODUCTO.md); para el "cómo se
> trabaja" a [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md); para el "por qué de cada
> decisión" a [`05-DECISIONES.md`](./05-DECISIONES.md).

---

## 1. El stack, y por qué cada pieza

| Pieza | Versión / forma | Papel |
|---|---|---|
| **Next.js** | 16, App Router, Turbopack | Framework full-stack. Las rutas son carpetas en `src/app/`. Server Components por defecto; los write-paths son **Server Actions**. |
| **React** | 19 | UI. |
| **TypeScript** | estricto | El contrato de la fachada de datos se *comprueba en compilación* (ver §3). Los tipos canónicos del dominio viven en `src/lib/mock-data.ts`. |
| **Tailwind CSS** | v4 (config por CSS) | Estilos. **No hay `tailwind.config.js`**: el tema se define con `@theme` en `src/app/globals.css`; modo oscuro por `data-theme`. Ojo con el tree-shaking de tokens no usados (ver Gotchas de `CLAUDE.md`). |
| **Supabase** | Postgres + Auth + RLS, región UE | Backend real **opcional**. La app arranca y se demuestra sin él (modo demo). |

**Idea rectora:** el producto tiene que **arrancar y demostrarse sin backend**. De ahí el
patrón dual-mode (§3) y las degradaciones seguras por todas partes (§6): si falta una
migración o una credencial, la app no revienta, se degrada.

---

## 2. Estructura de carpetas

### `src/app/` — rutas (App Router)

```
src/app/
  page.tsx                     landing (cuña vertical RRHH)
  login/ onboarding/ reset-password/ auth/callback/   auth
  intake/[token]/              intake anónimo compartible (sin cuenta) — noindex
  legal/  en/legal/            4 páginas legales, slug distinto por idioma
  demo/                        solicitud de demo
  api/                         Route Handlers (version, vault/package, crons, webhooks…)
  dashboard/                   la app autenticada (app shell)
    inventario/[id]/{editar,dossier}
    riesgo/evaluar   gap/{informe,nuevo}   plan/   packs/
    equipo/  actividad/  informe/  incidentes/  proveedores/
    evidencia/                 vault de evidencia
    facturacion/               planes y suscripción (Stripe)
    vigilancia/{candidatos,fuentes,informe}   radar regulatorio + bandeja del validador
    telemetria/                panel interno (solo platform_admins)
    organizaciones/  seguridad/  ayuda/
```

Rutas con datos frescos (countdown de vigilancia, audit-trail) llevan
`export const dynamic = "force-dynamic"`.

### `src/lib/` — la lógica (el corazón del repo)

```
src/lib/
  data/            FACHADA de datos (§3): index + mock-repo + supabase-repo + *-actions
  supabase/        clients (client/server/middleware/service) + config (isSupabaseConfigured)
  mock-data.ts     datos demo + TIPOS canónicos (AiSystem, GapItem, …)
  risk-assessment.ts  recommendations.ts  regulatory-watch.ts  audit.ts   contenido determinista (§9)
  policy-packs/    packs sectoriales (rrhh, us-hiring, credito-seguros, educacion…)
  reg-watch/       Vigía: detector de cambios regulatorios por hash (§8)
  analista/        Analista: pipeline LLM que PROPONE borradores (nunca publica solo)
  telemetry/       telemetría de producto de primera parte (§5)
  observability/   log.ts — clasificación de degradaciones (§6)
  legal/           cumplimiento propio: páginas legales + subprocesadores como código (§7)
  vault/           evidencia real + paquete ZIP firmado Ed25519 (§10)
  billing/         planes, límites, roles, morosidad (dunning) (§11)
  import/          csv.ts — parser de importación PURO (§4)
  intake/          lógica del intake compartible (§4-intake)
  incidents/ suppliers/ inventory/ reminders/ security/ help/ i18n/  soporte del dominio
```

### `supabase/` — el esquema

```
supabase/
  migrations/0001..0041.sql   esquema, RLS, audit, RPCs, vault, facturación, endurecimiento de grants
  setup.sql                   TODAS las migraciones concatenadas (el fundador las pega en el SQL Editor)
docs/{supabase.md, thesis.md}
```

**Regla de oro de las migraciones:** son **manuales** (la anon key no permite DDL). Al añadir
una migración, concaténala también en `setup.sql` y avisa. Detalles de sintaxis peligrosa
(`security definer` + `search_path=''`, `greatest`/`least` sin prefijo, `create policy` sin
`if not exists`, aplicar dos veces en un Postgres desechable) están en los Gotchas de
[`CLAUDE.md`](../../CLAUDE.md); léelos **antes** de escribir SQL.

---

## 3. La fachada de datos dual-mode (lo que TIENES que entender)

Es la pieza arquitectónica central. Los componentes del dashboard **solo importan de
`src/lib/data`** y no saben qué backend hay detrás.

`src/lib/data/index.ts` elige el repositorio según `isSupabaseConfigured`
(`src/lib/supabase/config.ts` → ¿hay `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY`?):

- **MODO DEMO** (sin credenciales): `mock-repo.ts` sirve `src/lib/mock-data.ts`. Todo abierto,
  sin auth. Es lo que se ve en la landing y en capturas.
- **MODO CONECTADO** (credenciales en `.env.local`): `supabase-repo.ts` lee datos reales; el
  middleware exige sesión + organización.

### El contrato está tipado — y esto es deliberado

En `index.ts`:

```ts
export type DataRepo = typeof supabaseRepo;              // el repo REAL es la fuente de verdad
const demoRepoImplementsContract: DataRepo = mockRepo;  // afirma que el demo lo implementa
```

El repo de Supabase es la fuente de verdad del contrato; la línea de asignación afirma en
compilación que `mock-repo` implementa la **misma** forma. Si olvidas un getter en el repo
demo, `tsc` falla señalando `data/index.ts` con *"Property 'getX' is missing"* (antes también
fallaba, pero los tipos degradaban a `any` y el error salía lejos, en páginas del dashboard).

### Cómo añadir un getter nuevo (los TRES sitios)

1. **`supabase-repo.ts`** — impleméntalo de verdad (lectura Supabase). Es la fuente del contrato.
2. **`mock-repo.ts`** — impleméntalo con datos de `mock-data.ts` (misma firma exacta).
3. **`index.ts`** — expórtalo como `export const getX = () => repo.getX()`.

Si te saltas el paso 2, `tsc` te lo dice apuntando a `index.ts`. Si te saltas el 3, el
componente no puede importarlo.

### Los write-paths: Server Actions en `src/lib/data/*-actions.ts`

Escrituras separadas por dominio: `import-actions.ts`, `intake-actions.ts`, `team-actions.ts`,
`vault-actions.ts`, `vigia-actions.ts`, `incident-actions.ts`, `supplier-actions.ts`, etc. Cada
acción: guarda modo demo, valida uuid/fecha/enum, hace `revalidatePath` y devuelve toasts vía
`?toast=`.

**Fallback seguro obligatorio:** cada lectura de `supabase-repo.ts` debe devolver `[]` o la
base curada si la tabla/columna aún no existe, para no romper la app cuando una migración no
está aplicada (esto conecta con la observabilidad, §6).

---

## 4. Multi-tenancy, RLS y audit-trail inmutable

- **Aislamiento por `organization_id` con RLS** (migración `0002_rls.sql`). Un usuario puede
  pertenecer a **N organizaciones**.
- **`audit_log` inmutable:** triggers `block_mutation` impiden update/delete; triggers
  `write_audit` en cada tabla con `organization_id` lo rellenan solos (`0003_audit.sql`, más
  cadena hash en `0020`/`0023`/`0041`). `src/lib/audit.ts` traduce filas crudas a español
  legible.
- **Importante sobre RLS y verificación:** el aislamiento de datos anónimos/entre-tenants se
  afirma con RLS + grants de Supabase, **no** con el Postgres desechable (que no reproduce los
  grants por defecto de Supabase). Para conclusiones sobre *permisos*, verifica contra el
  proyecto real por `curl` con usuarios `*@attesta-test.dev`. Ver Gotchas de `CLAUDE.md`.

---

## 5. Subsistemas clave: subsistema → dónde vive → qué hace

| Subsistema | Dónde vive | Qué hace y por qué |
|---|---|---|
| **Fachada de datos dual-mode** | `src/lib/data/{index,mock-repo,supabase-repo}.ts` + `*-actions.ts` | Única puerta de datos del dashboard; elige demo/real por `isSupabaseConfigured`. Contrato tipado (§3). |
| **Intake compartible** | `src/lib/intake/`, `src/lib/data/intake-actions.ts`, ruta `src/app/intake/[token]/`, migración `0027_intake_links.sql` | Enlace con **token de capacidad** (24 bytes base64url, generados en servidor) para que alguien sin cuenta rellene una ficha. Es la **única escritura anónima** del producto. Lo enviado NO entra al inventario: cae en `intake_submissions` (bandeja) y un miembro autenticado lo acepta. `anon` no tiene ninguna policy de lectura; su única puerta es la RPC `submit_intake` (`security definer`), que devuelve el **mismo `false`** para token inexistente/caducado/revocado/agotado (no ser oráculo de tokens). La ruta **no valida el token al renderizar** (la URL delataría qué enlaces existen). `noindex`. |
| **Importación CSV** | `src/lib/import/csv.ts` (+ `csv.test.ts`), `src/lib/data/import-actions.ts` | Parser **puro**. Autodetecta el delimitador (**Excel en español exporta con `;`** — causa nº 1 de "tu importador no funciona"), acepta cabeceras ES/EN con alias, come el BOM, respeta comas entre comillas, **valida e informa por filas** (línea + motivo) en vez de abortar. El cliente previsualiza con la MISMA función, pero el servidor **vuelve a parsear** (la previsualización es UX, no validación). En el insert múltiple, PostgREST exige **exactamente las mismas claves** por fila (`PGRST102`): `import-actions.ts` enumera los seis campos siempre, con `null`. |
| **Telemetría de producto** | `src/lib/telemetry/{events,server,service,client,actions}.ts` (+ `events.test.ts`), migración `0026_telemetry.sql`, panel `src/app/dashboard/telemetria/` | Primera parte, **catálogo cerrado**, cero PII. No hay PostHog/GA/Plausible: los eventos van a `product_events` (misma BD en la UE) y el embudo se lee con la RPC `product_funnel` (guard `is_platform_admin()` **dentro**). Catálogo cerrado en `events.ts` (un nombre nuevo no compila); `CLIENT_EVENTS` marca los pocos que el navegador puede emitir — los **hechos de negocio** (pago, alta de sistema) se emiten en servidor, comprobables. Tres emisores: `server.ts` (`trackServer`, aplaza con `after()`), `service.ts` (`trackService`, webhooks/crons sin sesión), `client.ts` (`track`, `sendBeacon` + respeto GPC/DNT). `sanitizeProps` descarta cualquier valor con `@` (fuga de PII más probable: un correo). Nunca lanza: si 0026 no está aplicada, medir es un no-op. |
| **Capa GPAI del clasificador (Cap. V)** | `src/lib/risk-assessment.ts` (fn `classify()`) | Devuelve un bloque `gpai` opcional cuando el sistema declara un modelo de propósito general, y **NO toca el nivel de riesgo** (el Cap. V es régimen paralelo: un chatbot con GenAI sigue "limitado" por el Art. 50). Añade citas y deberes de **exigir evidencia al proveedor del modelo** (Art. 53.1.b) + aviso de **Art. 25** (fine-tuning/marca blanca ⇒ podrías pasar a *proveedor*). Se **anexan a `citations`/`obligations`** ya persistidas, así dossier e informe lo muestran sin tocar su código. El **tercio del cómputo** se cita siempre como indicativo (directrices de la Comisión, jul-2025), nunca como umbral del Reglamento; un test lo vigila. |
| **Observabilidad de degradaciones** | `src/lib/observability/log.ts` (+ `log.test.ts`) | La fachada está llena de `if (error) return []` deliberados, pero borraban la causa. `logDataFallback(at, error, detail?)` clasifica en **`migration-pending`** (42P01/42703/42883/PGRST20x/*schema cache* → `warn`, estado esperado antes de aplicar migración), **`permission`** (42501, RLS) e **`incident`** (todo lo demás → `error`), y emite **una línea JSON** que Vercel parsea sin configurar nada. Antirruido de 5 min por (sitio+código). `logIncident` para los `catch` de escritura. **Aquí NO entran datos de cliente:** solo sitio, código y mensaje de Postgres. No manda nada a terceros a propósito. |
| **Cumplimiento propio / legal** | `src/lib/legal/{index,privacy,cookies,dpa,subprocessors,subprocessors-doc,entity}.ts` (+ `*.test.ts`), rutas `src/app/legal/` y `src/app/en/legal/` | Las 4 páginas legales (privacidad, cookies, subprocesadores, DPA) salen de **datos tipados bilingües** en `src/lib/legal/`, **NO del diccionario i18n** (frontera legal). Slug distinto por idioma (`privacidad`↔`privacy`) con su canonical. `subprocessors.ts` es el **registro-código** del que salen a la vez la página y un **guard** (`subprocessors.test.ts`) que escanea el repo (argumentos de `fetch(...)` + allowlist CSP) y **falla si el producto habla con un host no declarado**; distingue *enviar datos* de *citar una URL*. Separa subencargados de **datos de cliente** de los que solo ven el **corpus normativo público** (Voyage, NVIDIA NIM). `entity.ts` **sin default plausible** (como `site-url.ts`): sin los 4 datos del art. 13.1.a, las páginas salen con aviso de borrador + `noindex` + fuera del sitemap. `sitemap.ts` es `force-dynamic` por eso. |
| **Vault de evidencia + paquete firmado** | `src/lib/vault/{files,manifest,signature,zip,readme}.ts` (+ tests e integración), ruta API `src/app/api/vault/package/`, `src/app/dashboard/evidencia/`, migración `0038_evidence_vault.sql` (bucket en `0040`) | Archivos reales detrás de cada control. La ruta del objeto **empieza por `organization_id`** porque la policy del bucket compara esa primera carpeta (es el aislamiento, no nomenclatura). El paquete (`/api/vault/package`) es un ZIP con evidencia + manifiesto + **firma Ed25519**. **El adversario es la organización auditada, no Attesta:** por eso firma Attesta. El **hash se calcula en servidor** y se **recalcula al empaquetar** (si un archivo cambió por debajo, no entra y la omisión se declara). Firma sobre la **serialización canónica** (`canonicalJson`). Qué afirma —custodia e integridad, **nunca conformidad**— va dentro del manifiesto y del README. Sin `VAULT_SIGNING_KEY` el paquete sale SIN firmar y lo dice (no genera clave al vuelo). Cero dependencias (ZIP a mano con `zlib.crc32` + Web Crypto). Verificado con `unzip`, Python y OpenSSL. |
| **Vigilancia regulatoria — Vigía (detector)** | `src/lib/reg-watch/{vigia,run}.ts` (+ `vigia.test.ts`), `src/lib/data/vigia-actions.ts`, migraciones `0011`/`0014`, panel `src/app/dashboard/vigilancia/` | **Núcleo determinista, CERO LLM.** `vigia.ts` descarga una fuente, la **normaliza** (quita scripts/nonces/cache-busting), calcula un **hash SHA-256 estable** y compara con la última revisión: hash distinto = "algo cambió aquí". Puro, con `fetchImpl` inyectable. `run.ts` (server-only) lee la watchlist `reg_sources`, hashea cada fuente y llama al RPC `vigia_report`, que encola un candidato-señal si procede. Lo usan el cron post-deploy y el botón "Ejecutar Vigía ahora". |
| **Vigilancia regulatoria — Analista (proponente)** | `src/lib/analista/{run,ingest,llm,voyage}.ts` + `corpus/` | Pipeline que **PROPONE borradores** que un **humano valida** antes de publicar. Es el único punto donde entra LLM en vigilancia, y **nunca publica solo**. `llm.ts` incluye `PROHIBITED_COPY`, el guard de *runtime* sobre los borradores del LLM. |
| **Radar / contenido de vigilancia (determinista)** | `src/lib/regulatory-watch.ts` (+ `.test.ts`) | El texto del radar, countdown y catálogo curado que se muestra al cliente: 100% determinista. **El catálogo curado siempre gana** al pipeline de vigilancia (un test lo vigila). |
| **Facturación / Stripe + morosidad** | `src/lib/billing/{plan,limits,quota,roles,subscription,dunning,gate,actions}.ts` (+ tests), `src/lib/stripe/`, `src/app/dashboard/facturacion/`, webhook en `src/app/api/`, migraciones `0017`/`0018`/`0036` | Planes, límites por plan (`limits.ts`), cuotas (`quota.ts`), roles (`roles.ts`) y el `gate.tsx` que bloquea features. **`dunning.ts` (morosidad):** un pago fallido **NO corta el acceso al instante**. Stripe marca `past_due` y reintenta ~2 semanas (Smart Retries) conservando acceso; solo al **cancelar** (`canceled`/`unpaid`) se retira. Lógica **PURA** (el instante entra como parámetro) para fijarla con tests. `DUNNING_GRACE_DAYS = 14` es un **tope de seguridad** por si se pierde el webhook de cancelación, no el reloj principal (manda el estado). Corrige el bug anterior en que `past_due` tiraba al cliente a 'free' y le mostraba "Suscríbete". |

---

## 6. Contenido legal = 100% determinista, cero LLM

Las rutas que emiten texto regulatorio (dossier, informe, radar de vigilancia, clasificación
de riesgo, recomendaciones) se ensamblan **solo** con datos reales del cliente + texto del AI
Act ya verificado por el experto. **Un texto legal alucinado es un pasivo.** Lógica clave:
`src/lib/risk-assessment.ts`, `src/lib/recommendations.ts`, `src/lib/regulatory-watch.ts`,
`src/lib/policy-packs/`. La única automatización con LLM (el **Analista**, §5) *propone*
borradores que un humano valida antes de publicar.

Esto entronca con la **regla de producto que no se viola**: Attesta **NO certifica**. No
escribas copy prohibido (*certificado, aprobado/apto, cumple, garantiza, marcado CE, validado
por Attesta…*) ni siquiera en ejemplos. Los verbos son de **la organización** ("tu
organización declara…"). El puntaje es "% listo / preparación", nunca "% cumplimiento". El
ICP es **deployer**, no provider. Detalle completo en [`01-PRODUCTO.md`](./01-PRODUCTO.md) y en
la sección de reglas de `CLAUDE.md`; hay dos guards que lo hacen verificable:
`scripts/check-prohibited-copy.mjs` (copy en el repo, en CI) y `PROHIBITED_COPY` de
`src/lib/analista/llm.ts` (borradores del LLM en runtime).

---

## 7. Cómo se verifica todo (dónde mirar)

La verificación completa es **lint + tsc + `check:copy` + `test` + build** (los cinco en CI),
y para el backend real, **`curl` por API** (Playwright headless no alcanza Supabase por el
proxy). Los tests (`npm test`, Vitest, `src/**/*.test.ts`) cubren **solo lógica pura**
(entorno `node`, <1 s) y codifican la **expectativa regulatoria**, no la implementación.

**SUBIDO ≠ PUBLICADO:** Vercel publica `main` y el trabajo va en ramas. `npm run verify:deploy`
compara el commit publicado (`/api/version`) con el local y comprueba rutas públicas (no las de
`/dashboard`, que el middleware redirige). Ejecútalo al cerrar cualquier trabajo que el
fundador vaya a mirar. Todo esto se detalla en [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md).

---

## 8. Mapa mental de una petición (para orientarte rápido)

1. **¿Es una pantalla del dashboard?** → `src/app/dashboard/<área>/`. Lee datos importando de
   `src/lib/data` (nunca directamente de Supabase).
2. **¿Necesita un dato nuevo?** → añade el getter en los **tres** archivos de la fachada (§3).
3. **¿Escribe algo?** → Server Action en `src/lib/data/<dominio>-actions.ts` (validar, guardar
   demo, `revalidatePath`, toast).
4. **¿Toca esquema?** → migración nueva en `supabase/migrations/`, concaténala en `setup.sql`,
   avisa al fundador, y verifica la sintaxis en un Postgres desechable (Gotchas de `CLAUDE.md`).
5. **¿Es regla de riesgo, texto legal o afirmación regulatoria?** → consulta antes al subagente
   `compliance-domain-expert`, y escribe en la lógica **determinista** (§6), con test que falle
   si la regla se rompe.

---

## Documentos hermanos

- [`00-INICIO.md`](./00-INICIO.md) — punto de entrada.
- [`01-PRODUCTO.md`](./01-PRODUCTO.md) — qué es Attesta y para quién.
- [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md) — cómo trabajar y verificar.
- [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) — cómo comportarte como agente en este repo.
- [`05-DECISIONES.md`](./05-DECISIONES.md) — el porqué de las decisiones clave.
- [`../../PENDIENTES.md`](../../PENDIENTES.md) — tareas abiertas (archivo vivo).
- Fuentes canónicas del repo: [`CLAUDE.md`](../../CLAUDE.md), [`MEMORY.md`](../../MEMORY.md),
  `docs/supabase.md`, `docs/thesis.md`.
