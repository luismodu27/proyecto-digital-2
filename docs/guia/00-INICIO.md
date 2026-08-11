# 00 · Empieza aquí — Guía de Attesta

> **Puerta de entrada.** Si acabas de llegar a este proyecto (agente o persona),
> lee esto primero: te dice qué es Attesta, dónde está cada cosa y en qué orden
> leer. El objetivo de esta carpeta `docs/guia/` es que **arranques sin ambigüedad,
> como si siguieras la sesión anterior**, sin tropezar con los percances que ya
> pagamos una vez.

---

## Qué es Attesta (en un párrafo)

**Attesta** es un SaaS B2B de **compliance y gobernanza continua de IA** para el
**mid-market**, con cuña vertical en **RRHH/reclutamiento**. Inventaría los sistemas
de IA de una organización, clasifica su riesgo (EU AI Act + marcos de EE. UU.),
genera **evidencia lista para auditoría** (dossier e informes PDF) y vigila cambios
regulatorios. El cliente ideal (**ICP**) es el **deployer** —quien *usa* la IA—, no
el *provider*. Y hay una regla que lo gobierna todo: **Attesta NO certifica**; es un
*system of record* de evidencia + autoevaluación + preparación para auditoría.
El detalle está en [`01-PRODUCTO.md`](./01-PRODUCTO.md).

---

## Cómo leer esta guía (orden recomendado)

| # | Documento | Para qué |
|---|-----------|----------|
| **00** | **`00-INICIO.md`** (este) | Índice y puerta de entrada. Correlaciona todo. |
| **01** | [`01-PRODUCTO.md`](./01-PRODUCTO.md) | Qué es Attesta y **por qué**: problema, ICP (deployer), posicionamiento, MVP y las **reglas de producto que no se violan**. |
| **02** | [`02-ARQUITECTURA.md`](./02-ARQUITECTURA.md) | **Dónde está todo**: stack, estructura de `src/` y `supabase/`, la fachada de datos dual-mode, y una tabla "subsistema → dónde vive → qué hace". |
| **03** | [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md) | **Cómo trabajamos** (mecánica): el loop, los 5 checks de CI, tests + ritual de mutación, guards, migraciones manuales, "subido ≠ publicado". |
| **04** | [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) | **Tu rol y cómo trabaja el fundador**: proactividad con checkpoints, disciplina anti-errores, comunicación, cómo arrancar cada sesión. |
| **05** | [`05-DECISIONES.md`](./05-DECISIONES.md) | Las **decisiones clave** con su **qué / por qué / para qué**. El "porqué" del proyecto. |

**Si solo vas a leer dos:** [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) (cómo
comportarte) y [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md) (cómo no romper nada).

---

## Las fuentes canónicas del repo (y qué manda cada una)

Esta guía **complementa** —no reemplaza— tres documentos que ya viven en la raíz del
repositorio. Cuando haya duda, este es el reparto de autoridad:

| Documento | Rol | Autoridad |
|-----------|-----|-----------|
| [`../../CLAUDE.md`](../../CLAUDE.md) | **Mapa técnico** que Claude Code lee automáticamente al abrir el repo. Instrucciones operativas + gotchas. | Manda en lo técnico-operativo del día a día. |
| **`docs/guia/`** (esta carpeta) | **Estado vigente por temas**, para onboarding sin ambigüedad. | Manda como visión de conjunto y "cómo trabajamos". |
| [`../../MEMORY.md`](../../MEMORY.md) | **Memoria completa + bitácora histórica (§10)**: el registro cronológico de decisiones y correcciones, y el contexto de negocio (§1). | Manda para el **histórico** y el **porqué** original de cada cosa. |
| [`../../PENDIENTES.md`](../../PENDIENTES.md) | **Lista viva de tareas abiertas** (mías y del fundador) + plan por sprints. | Manda para saber **qué queda por hacer**. |

> Si actualizas un dato de estado (p. ej. un conteo, una migración aplicada),
> hazlo en el sitio canónico y evita duplicarlo: **la duplicación se desincroniza**.

---

## Pendientes sueltos (dónde mirar y qué hay abierto hoy)

La **lista viva** está en [`../../PENDIENTES.md`](../../PENDIENTES.md) (ver el bloque
`0-pre.6 · BLOQUE 3`) y el contexto de negocio de los pendientes del fundador en
[`../../MEMORY.md`](../../MEMORY.md) §1. A día de la última sesión, lo abierto se
agrupa así:

- **Decisión del fundador — Observabilidad externa (Sentry):** el enganche técnico
  está listo (sustituir `emit` en `src/lib/observability/log.ts`); implica **coste +
  un subprocesador nuevo** (DPA + `subprocessors.ts` + su guard + CSP). Es decisión suya.
- **Diferido, no urgente — Fallback de EUR-Lex para el Vigía:** 3 de las 8 fuentes
  (EUR-Lex + 2 de Illinois) dan error **desde la IP de Vercel** por bloqueo anti-bot,
  aunque sirven contenido a otras IPs. **El cliente no se ve afectado** (el catálogo
  curado siempre gana); solo se pierde la detección *automática* de cambios en esas 3.
  Mini-proyecto aparte (haría falta otra salida/IP o una vía oficial).
- **Tareas de configuración del fundador** (revisa el estado exacto en
  [`../../PENDIENTES.md`](../../PENDIENTES.md) / [`../../MEMORY.md`](../../MEMORY.md)
  §1 — algunas pueden estar ya hechas): datos de la sociedad para las páginas legales;
  DNS/`RESEND_FROM` para el correo transaccional; generar `VAULT_SIGNING_KEY` para el
  paquete firmado; y **aplicar a mano cualquier migración nueva** cuando la haya.

> **Regla de oro para no repetir el percance histórico:** "hecho" **no** es "subido".
> Es **fusionado en `main` + `npm run verify:deploy` en verde**. Detalle en
> [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md) §8.

---

## Cómo arrancar una sesión (versión corta)

1. Lee este índice, [`../../CLAUDE.md`](../../CLAUDE.md),
   [`../../MEMORY.md`](../../MEMORY.md) (al menos §1 y lo último de la bitácora §10) y
   [`../../PENDIENTES.md`](../../PENDIENTES.md).
2. Interioriza [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) (cómo comportarte) y
   [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md) (cómo verificar).
3. Mira las tareas abiertas, confirma en qué **rama** trabajas y si el último PR quedó
   **fusionado y publicado**.
4. Propón el plan del día en una línea y arranca por el incremento más valioso.
5. Al cerrar: verifica, **registra** en `MEMORY.md`/`PENDIENTES.md`, y reporta con
   precisión qué quedó hecho, qué a medias y qué pendiente del fundador.

El checklist completo de arranque y de cierre está en
[`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) §9 y
[`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md) §11.

---

## Nota sobre esta carpeta

Estos documentos viven en el **repositorio** (`docs/guia/`), que es la **fuente de
verdad**. Si trabajas en una copia local separada del escritorio, ten presente que
solo se mantiene al día si la sincronizas con el repo (lo ideal: que esa carpeta sea
un **clon** del repositorio, para que docs, código e historial de git vayan juntos y
nada se desincronice).

---

**En una frase:** empieza por [`01-PRODUCTO.md`](./01-PRODUCTO.md) para el *qué*, sigue
por [`04`](./04-ROL-DEL-AGENTE.md) y [`03`](./03-FLUJO-DE-TRABAJO.md) para el *cómo*, y
usa [`02`](./02-ARQUITECTURA.md) y [`05`](./05-DECISIONES.md) como referencia — con
`CLAUDE.md`, `MEMORY.md` y `PENDIENTES.md` siempre a mano.
