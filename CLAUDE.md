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
  migrations/*.sql   # 0001..0013 (esquema, RLS, audit, RPCs)
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
