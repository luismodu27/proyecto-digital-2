# 03 · Cómo trabajamos (flujo, verificación y disciplina)

> Este documento es el **cómo mecánico** de Attesta: el ciclo de trabajo, los comandos,
> las cinco comprobaciones que deciden si algo está "hecho", la filosofía de los tests y
> los guards, cómo se aplican las migraciones y qué significa exactamente "publicado".
> Su compañero [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) cubre el *cómo humano*
> (criterio, proactividad, comunicación). Lee también [`CLAUDE.md`](../../CLAUDE.md)
> (mapa técnico), [`MEMORY.md`](../../MEMORY.md) (memoria y bitácora) y
> [`PENDIENTES.md`](../../PENDIENTES.md) (tareas abiertas) al empezar cada sesión.
>
> La idea de fondo, que explica casi todo lo que sigue: **el fundador quiere los menores
> errores posibles, y eso no se consigue teniendo cuidado, se consigue con ritual.** Cada
> regla de aquí nació de un error real que costó tiempo y confianza. No son ceremonias:
> son las cicatrices del proyecto convertidas en procedimiento.

---

## 1. El loop de trabajo

Nunca trabajamos de un salto grande sin red. Se avanza en ciclos cortos y verificables:

> **planear → incremento pequeño → verificar → checkpoint → registrar**

| Paso | Qué significa | Por qué |
|------|---------------|---------|
| **Planear** | Entiende el objetivo y pártelo en incrementos completos. | Un plan claro evita rehacer trabajo y hace visible dónde hay una decisión del fundador. |
| **Incremento pequeño** | Un cambio coherente y *terminado*, no medio. | Lo pequeño se verifica entero; lo grande esconde regresiones. |
| **Verificar** | Corre las comprobaciones que apliquen (§3). No "parece que va": *se ejecuta*. | "Se aplica sin error" ≠ "funciona" (§6). Es la regla madre del proyecto. |
| **Checkpoint** | Para y pregunta antes de lo que es del fundador decidir (arquitectura, nombres, diseño, features grandes, fusionar a `main`, negocio/política). | Una aprobación **no se extiende al siguiente contexto**: que aprobara el PR #32 no autoriza el #33. |
| **Registrar** | Actualiza [`MEMORY.md`](../../MEMORY.md) §10 (bitácora) en cada decisión o corrección importante, y [`PENDIENTES.md`](../../PENDIENTES.md) cuando cambie el estado de una tarea. | **Dejar rastro es parte del trabajo.** La siguiente sesión —o el fundador— nunca debe empezar a ciegas. |

Regla #1 de trabajo de [`CLAUDE.md`](../../CLAUDE.md): **consulta `MEMORY.md` antes de
decidir nada y regístralo al terminar.**

---

## 2. Los comandos

Todos se ejecutan desde la raíz del repositorio.

```bash
npm run dev     # desarrollo con recarga (http://localhost:3000)
npm run build   # build de producción  ⚠️ necesita .env.local presente (ver §7, gotchas)
npm run start   # sirve el build ya hecho (usa PORT=xxxx para cambiar de puerto)
npm run lint    # ESLint
```

```bash
npm test          # Vitest sobre la lógica pura (~775 tests, unos segundos)
npm run test:watch
```

```bash
npm run check:copy      # guard de COPY PROHIBIDO (regla #1: Attesta NO certifica)
npm run verify:deploy   # ¿lo que dice el repo está PUBLICADO en main? (§8)
npm run verify:backend  # ejercita el backend real por API (usuarios *@attesta-test.dev)
```

`npm run dev/build/start/lint` son los de Next.js estándar. Los cuatro `check`/`verify`
son propios de Attesta y existen porque `build`/`lint`/`tsc` **compilan felizmente cosas
que están mal** (una regla legal invertida, un copy que insinúa certificación, una rama
sin fusionar). Cada uno tapa un agujero que los compiladores no ven.

---

## 3. La verificación completa = los 5 checks de CI

Antes de decir "hecho", **los cinco tienen que estar en verde**. Están todos en CI, así
que no es opcional: o pasan, o el trabajo no está terminado.

| # | Check | Comando | Qué protege |
|---|-------|---------|-------------|
| 1 | **Lint** | `npm run lint` | Estilo y errores de ESLint. |
| 2 | **Tipos** | `npx tsc --noEmit` | El contrato de la fachada de datos (los tres repos coinciden), tipos canónicos. |
| 3 | **Copy prohibido** | `npm run check:copy` | La regla #1 del producto: nada insinúa que Attesta certifica (§5). |
| 4 | **Tests** | `npm test` | La **expectativa regulatoria** codificada en lógica pura (§4). |
| 5 | **Build** | `npm run build` | Que compila de verdad para producción (necesita `.env.local`, §7). |

Para el **backend real** (modo conectado a Supabase) se añade una sexta comprobación que
CI no puede hacer: **`curl` por API**, no navegador (§9). Y al cerrar cualquier trabajo
que el fundador vaya a mirar, **`npm run verify:deploy`** (§8).

> Regla: "todos verdes o no está hecho". Un check en rojo no se "explica", se arregla.
> Si de verdad no puede pasar por una causa externa, se dice con su salida literal, no se
> maquilla (ver [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) §2, honestidad).

---

## 4. Filosofía de los tests y el ritual de mutación

**Qué cubren y qué no.** `npm test` (Vitest, ficheros `src/**/*.test.ts`) cubre **solo
lógica pura**: nada de componentes de React, nada de Supabase. Corre en entorno `node`
(sin jsdom), así que ~775 tests terminan en **unos pocos segundos**. Esto es deliberado:
una suite lenta se acaba desactivando, y una suite desactivada no protege nada.

**Por qué existen si ya está `tsc`.** Porque `build`, `lint` y `tsc` compilan tan felices
una **regla legal mal editada**. Un `if` invertido en `classify()` da un veredicto
equivocado sobre el EU AI Act **sin romper la compilación**. Por eso los tests codifican
la **expectativa regulatoria, no la implementación**. Ejemplos de lo que blindan:

- El **Art. 5** (prácticas prohibidas) manda sobre todo.
- El perfilado del **Art. 6.3 párr. 2** anula las excepciones de "no alto riesgo".
- **LL144** (Nueva York) exige auditoría **y** publicación — las dos, no se colapsan en una.
- El **catálogo curado** por el experto **siempre gana** al pipeline de vigilancia.
- Ninguna brecha se pierde al **deduplicar** el plan de acción.
- El **navegador no puede emitir `checkout_completed`** (los hechos de negocio se emiten en
  el servidor, donde son comprobables).
- **Paridad ES/EN** de packs, catálogo regulatorio, clasificador y audit-trail
  (`article`/`articles` se comparan por sus **números**, no por el literal: la prosa
  —"Anexo III" → "Annex III"— sí se traduce).

### El ritual de mutación (innegociable)

> **Un test que no falla al romper la regla no protege nada.**

Al añadir o tocar un test, hay que **demostrar que caza la regresión**:

1. Rompe la regla a propósito en el código (la *mutación*): invierte la puerta de
   perfilado, pon 13 meses en LL144, cambia `<` por `<=` en un vencimiento, deja que el
   pipeline gane al catálogo, abre `CLIENT_EVENTS`, quita un `prohibited` del espejo EN…
2. Corre el test. **Debe fallar.** Si pasa en verde con la regla rota, el test es un
   adorno: arréglalo hasta que falle.
3. **Revierte** la mutación. El test vuelve a verde.

Cuando se escribió la suite se validó exactamente así: se inyectaron **6 mutaciones** y
las 6 fallaron. Repetir ese gesto es lo que mantiene la suite honesta. Está escrito en la
bitácora ([`MEMORY.md`](../../MEMORY.md) §10) que "una comprobación que no distingue no es
una comprobación" — el ritual de mutación es su aplicación práctica a los tests.

---

## 5. Los guards que escanean el repositorio

Estos guards nacen del **modo de fallo dominante del proyecto**, nombrado por una auditoría
360°: no es código malo, es que **una decisión no llega a todos sus sitios** (se hallaron
trece instancias). El antídoto se había inventado dos veces sin generalizar; ahora es una
familia. **Regla nueva de trabajo:** *un arreglo que toca más de un fichero no está
terminado hasta que existe un guard que busque las instancias que no tocaste.*

| Guard | Archivo | Qué escanea y por qué falla |
|-------|---------|------------------------------|
| **Copy prohibido** | `scripts/check-prohibited-copy.mjs` (en CI, vía `npm run check:copy`) | Escanea `src/` y `marketing/` buscando el **patrón peligroso** (Attesta como sujeto que certifica, afirmaciones de cumplimiento del cliente, veredictos de aptitud, `% de cumplimiento`) en ES y EN. Falla si aparece. |
| **Subprocesadores / hosts** | `src/lib/legal/subprocessors.test.ts` | Escanea los destinos de salida reales (argumentos de `fetch(...)` y la allowlist de la CSP) y **falla si el producto habla con un host no declarado** en el registro de subprocesadores. Distingue *enviar datos* de *citar una URL*. |
| **Grants de BD** | `src/lib/security/db-grants.test.ts` | Escanea las migraciones y verifica que las funciones que no deben ser públicas revocan `EXECUTE` de `public` (no de `anon`, que es un no-op). |
| **Aridad de funciones** | `src/lib/security/db-function-arity.test.ts` | Escanea las migraciones y falla si una función de `private` se llama con un número de argumentos imposible (cazó `audit_hash(r, v_prev)` cuando pide diez). |
| **Toasts** | `src/lib/i18n/toasts.guard.test.ts` | Extrae toda clave `?toast=` del repo (literal y las dos ramas de un ternario) y falla si alguna no existe en **ambos** idiomas — un toast sin traducción es un usuario que actúa y no recibe feedback. |
| **Navegación** | `src/lib/dashboard/nav-gate.test.ts` | Verifica que la puerta de navegación del dashboard cubre todas las áreas — que no quede una sección accesible sin su control de acceso, o al revés. |
| **Formularios / diccionarios / CSP** | `src/lib/data/form.guard.test.ts`, `src/lib/i18n/dictionaries.guard.test.ts`, `src/lib/security/csp.test.ts` | Misma familia: verifican que claves, campos y política de seguridad no se queden a medias entre sitios. |

**El guard de copy prohibido merece una nota especial**, porque su diseño enseña el
patrón. **No es una lista negra de palabras**: escanear "certificado" o "marcado CE" a
secas produce ~18 falsos positivos legítimos en este repo (*exige al proveedor el marcado
CE*, *Attesta no es un certificador*, *garantiza intervención humana* del RGPD 22, *ley
aprobada por la Office of Administrative Law*…), y un guard con falsos positivos **se
desactiva en una semana**. Por eso detecta el patrón peligroso, ignora **negaciones**
("Attesta NO certifica") y **preguntas de FAQ**, y ofrece un escape hatch
(`attesta-copy-ok` en la línea, con motivo). Además **se autoprueba en cada ejecución**
(`MUST_CATCH` + `MUST_PASS` + aserción de cobertura), así que falla también si alguien
debilita una regex — un guard que no puede demostrar que funciona es falsa tranquilidad.
Complementa a `PROHIBITED_COPY` de `src/lib/analista/llm.ts`, que es el guard de *runtime*
sobre los borradores del LLM: uno vigila lo que **genera la máquina**, el otro lo que
**escribimos nosotros**.

---

## 6. Migraciones: manuales, probadas ejecutando, y en el orden correcto

Este es el terreno donde más caro se paga saltarse el ritual. Léelo entero.

### Cómo se aplican (manuales, siempre)

Las migraciones **las aplica el fundador a mano**, pegando `supabase/setup.sql` en el
**SQL Editor** de Supabase. No hay pipeline automático: la anon key del proyecto **no
permite DDL**. Como consecuencia, al añadir una migración `supabase/migrations/00NN_*.sql`:

1. **Concaténala también al final de `supabase/setup.sql`** (es el fichero completo que el
   fundador re-pega). Si no lo haces, tu migración simplemente **no existe** para él.
2. **Avísale explícitamente** de que hay una migración nueva que aplicar, y déjala anotada
   en [`PENDIENTES.md`](../../PENDIENTES.md) como tarea suya.

> `supabase/setup.sql` es "todas las migraciones concatenadas". El fundador lo pega
> **entero solo en una base de datos fresca**; en una base ya viva pega **solo la
> migración nueva** (o re-pega el fichero completo, que por eso debe ser re-ejecutable —
> ver abajo). Ambos usos exigen que el SQL sea idempotente.

### Cómo se prueban (ejecutando, no aplicando)

> **"Se aplica sin error" ≠ "funciona".** Es la lección más cara del proyecto, aprendida
> tres veces en un mismo día (bitácora [`MEMORY.md`](../../MEMORY.md) §10).

PostgreSQL **no valida el cuerpo de una función `plpgsql` al crearla**. Una migración con
una función rota (`audit_hash(r, v_prev)` cuando pide diez argumentos) **se aplica sin una
sola queja** y pasa las dos pasadas del banco de pruebas. El error solo aparece al
**ejecutarla**. Un cron que promete detectar manipulación del audit-trail estuvo horas sin
detectar nada, todo en verde, porque la verificación comprobaba *permisos* sin llamar a la
función con éxito ni una vez. Por eso, con **cada migración nueva**:

1. Levanta un **Postgres desechable** (`initdb` + un scaffold con `auth.users`,
   `organizations`, los roles `anon`/`authenticated` e `is_platform_admin()` basta para
   validar sintaxis, CHECKs y policies).
2. **Aplícala DOS veces, no una.** La primera pasada prueba que el SQL es correcto; la
   **segunda**, que es **re-ejecutable** — la propiedad que el fundador usa de verdad
   (re-pega el fichero tras corregir cualquier otra cosa). Ojo: `create policy` **no
   admite `if not exists`**, así que cada una va precedida de `drop policy if exists`. Así
   se cazó que la 0026 moría en la segunda pasada con *policy already exists*.
3. **EJECUTA la propiedad que la migración promete**, no solo la apliques. Siembra datos si
   hace falta (con `audit_log` vacío, una función rota y una buena parecen iguales porque
   el bucle no corre). La comprobación buena no es "¿se aplicó el SQL?" sino, p. ej.,
   "¿`checkedOrgs` es mayor que cero?".
4. **Nunca transcribas a mano** el cuerpo de una función que ya existe: extráelo con un
   script y **inyéctale** el cambio. Copiar a ojo fue el fallo original.

### Trampas de SQL ya cazadas (no repetir)

- **`security definer` + `search_path=''`:** cualifica con esquema **TODO**, incluidos
  casts de tipos (`::public.audit_action`, `::public.member_role[]`), no solo tablas.
  Olvidarlo rompió el onboarding y las invitaciones.
- **`greatest`/`least` NO se cualifican con esquema:** son construcciones del lenguaje,
  no funciones. `pg_catalog.least(...)` da *"function does not exist"*. Van **sin** prefijo
  incluso bajo `search_path=''` (a diferencia de `make_interval`, `now()`, casts…).
- **`revoke ... from anon` sobre una FUNCIÓN es casi siempre un no-op:** Postgres concede
  `EXECUTE` a **PUBLIC** por defecto, y `anon` lo hereda. Si una función no debe ser
  pública: `revoke all on function f(args) from public;` + `grant execute ... to <rol>;`
  — y el guard de autorización va **además** dentro de la función, nunca en su lugar.
- **El Postgres desechable NO reproduce los grants por defecto de Supabase**, así que no
  sirve para concluir nada sobre *permisos* de `anon`. Para afirmar algo sobre aislamiento
  hay que replicar esos grants en el scaffold o verificarlo contra el proyecto real.

---

## 7. Gotchas que muerden a diario

Más allá de las migraciones (§6), los que más tiempo ahorran conocer:

- **`npm run build` necesita `.env.local` presente.** `next build` inlinea las
  `NEXT_PUBLIC_*` en el bundle del cliente. Si compilas sin `.env.local`, el build queda
  **en modo demo** aunque el runtime tenga las variables. (Sobre modo demo/real → la
  fachada de datos en [`02-ARQUITECTURA.md`](./02-ARQUITECTURA.md).)
- **El dominio público no tiene default** (`src/lib/site-url.ts`). `NEXT_PUBLIC_APP_URL`
  manda; en un despliegue (`VERCEL` presente) sin ella el **build falla** a propósito.
  Un valor con barra final, ruta o esquema raro se **rechaza**, no se recorta. No
  reintroducir un `?? "https://…"` en ningún sitio: el default plausible *era* el bug.
- **Al añadir un getter a la fachada de datos, decláralo en los tres**: `index.ts`,
  `mock-repo.ts`, `supabase-repo.ts`. Si olvidas el repo demo, `tsc` falla señalando
  `data/index.ts` con *"Property 'getX' is missing"*.
- **Rutas con datos frescos** (countdown de vigilancia, audit-trail, sitemap) llevan
  `export const dynamic = "force-dynamic"`.
- **Tailwind v4** tree-shakea las variables `@theme` no usadas por ninguna clase. Para
  color inline dinámico usa un **mapa de hex** en el componente; el color semántico nuevo
  va por **token/tono** (`--tone-*`), nunca hex hardcodeado en clases.

---

## 8. SUBIDO ≠ PUBLICADO (la regla que reabre heridas si se ignora)

> **"Hecho" = fusionado en `main` + `npm run verify:deploy` en verde.** Nunca digas "está
> en producción" sin haberlo comprobado.

Vercel publica **`main`**, y el trabajo se hace en **ramas**. Durante **seis semanas** se
dio por bueno que `commit + push` equivalía a producción: los tests pasaban, las
migraciones se aplicaban, la web servía… el código de julio. El fundador aplicó
migraciones y buscó funciones que no existían en el aire. **Nadie mintió** — es que la
pregunta "¿esto está publicado?" no tenía forma barata de responderse, así que no se hacía.

`npm run verify:deploy` (`scripts/verify/deployed.mjs`) la responde en cinco segundos, de
**dos maneras independientes**:

1. Compara el **commit publicado** (`/api/version`, que Vercel rellena solo) con el commit
   local, y avisa si hay trabajo local sin publicar o una rama divergente.
2. Comprueba que las **rutas públicas** que el código dice tener respondan de verdad (es la
   comprobación que habría cazado el fallo: `/legal/privacidad` daba 404 en producción
   mientras existía en el repo desde hacía días).

**Ejecútalo al cerrar cualquier trabajo que el fundador vaya a mirar.** Aviso importante
del propio script: **no incluye rutas de `/dashboard`** — el middleware redirige a login
antes de resolverlas, así que un `307` no distingue "existe" de "no existe". La primera
versión las incluía y pasaban en verde con el vault **sin publicar**: un test que no
distingue es un adorno. Esas rutas quedan cubiertas por la comparación de commits (si el
publicado es el local, están todas por construcción).

---

## 9. Verificar el backend real: curl, no navegador

Cuando el trabajo toca el **modo conectado** (Supabase real, no demo), la verificación se
hace por **API con `curl`** (`npm run verify:backend`, `scripts/verify/backend.mjs`), con
usuarios de prueba `*@attesta-test.dev`. **No con navegador.**

El motivo es concreto: el Chromium headless de Playwright **no usa el proxy de salida** del
entorno, así que **no alcanza Supabase**. `curl` sí usa el proxy. Un flujo que "no funciona
en el navegador" casi siempre funciona por API — y es la API la que importa. Verifica el
flujo real por `curl`, no por captura de pantalla.

---

## 10. Git: ramas, PRs y convención de commits

### Rama y PR

- **Desarrolla en rama, nunca empujes a `main` sin permiso.** `main` es lo que Vercel
  publica; un push directo publica sin revisión.
- **Abre PR hacia `main`** solo cuando el fundador lo pida, y **fusiona solo con su visto
  bueno explícito**. Fusionar es de cara al exterior y difícil de revertir: es checkpoint
  (ver [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) §3). Y recuerda: **una aprobación
  no se extiende al siguiente PR.**
- Tras fusionar, cierra con `npm run verify:deploy` antes de decir "publicado" (§8).

### Mensajes de commit

Los commits llevan **cuerpo explicativo** (el *porqué*, no solo el *qué* — el historial de
este repo es prosa densa que explica cada decisión) y terminan con dos *trailers* fijos:

```
<título: qué cambia, en una línea>

<cuerpo: por qué, qué problema resuelve, cómo se verificó
—incluye el ritual de mutación o la ejecución de la migración si aplica>

Co-Authored-By: Claude <modelo> <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_<id>
```

- **`Co-Authored-By:`** atribuye la coautoría. **Usa el mismo valor que ya aparece en
  `git log`** para no romper la convención del repo — revisa el historial (`git log -1`)
  y copia el formato exacto vigente en vez de inventar uno nuevo.
- **`Claude-Session:`** enlaza la sesión de trabajo que produjo el commit, para poder
  reconstruir el contexto después.
- **Nunca pegues secretos** en el commit ni en el chat (claves `sk_live`, `service_role`,
  la privada de `VAULT_SIGNING_KEY`). Van por variables de entorno.

> Al abrir el PR, describe en cristiano qué resuelve y cómo se verificó, y enlaza las
> migraciones que el fundador deba aplicar. El PR es lo que él lee para decidir.

---

## 11. Checklist de cierre

Antes de reportar "hecho", recorre esto:

1. **Los 5 checks de CI en verde** (lint · tsc · check:copy · test · build). §3.
2. Si añadiste o tocaste tests: **ritual de mutación** hecho y revertido. §4.
3. Si el arreglo tocó más de un fichero: **existe un guard** que caza las instancias que
   no tocaste. §5.
4. Si hubo migración: **probada 2× + EJECUTADA** en Postgres desechable, y **concatenada en
   `setup.sql`** + avisada al fundador. §6.
5. Si toca backend real: **verificado por `curl`**, no navegador. §9.
6. Si el fundador lo va a mirar: **`npm run verify:deploy` en verde** y "hecho" solo si está
   **fusionado en `main`**. §8.
7. **Registrado** en [`MEMORY.md`](../../MEMORY.md) §10 (decisión/lección) y en
   [`PENDIENTES.md`](../../PENDIENTES.md) (estado de la tarea + lo que queda del fundador).
8. Reporte fiel: "hecho y verificado", "hecho a falta de X", o "falló, esto es lo que pasó"
   — nunca un "hecho" sin verificar.

---

## 12. En una frase

**Avanza en incrementos pequeños, verifica ejecutando (no aplicando), no confundas "subido"
con "publicado", y no des un arreglo por terminado hasta que un guard, un test con su
mutación, o `verify:deploy` en verde lo demuestren — porque en Attesta el error caro no es
el código malo, es la decisión que no llegó a todos sus sitios.**
