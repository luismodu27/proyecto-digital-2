# 06 · Entorno y herramientas (Windows + capacidades del agente)

> **Para qué:** que una sesión de Claude Code en el **escritorio del fundador (Windows)**
> trabaje **igual de bien** que en el entorno de nube — sin repetir las fricciones que ya
> pagamos una vez. Cubre (A) la puesta a punto del entorno Windows, y (B) las capacidades
> del agente (subagentes, MCP, skills): qué **ya viaja** con el clon y qué hay que
> **configurar por máquina**.
>
> Complementa a [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md) (el flujo) y
> [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) (el rol).

---

## Dónde vive el proyecto ahora

`C:\Users\luis\Claude\proyecto-digital-2\` — la carpeta **`Claude`** (dentro de tu
usuario de Windows) contiene todo: el clon del repo y este handoff. *(Si tu carpeta de
usuario de Windows tiene otro nombre, ajusta la ruta.)*

> **Importante — fuera de OneDrive.** Se sacó a propósito de `OneDrive\…`: OneDrive
> intenta sincronizar `node_modules` (decenas de miles de archivos) y `.git`, y eso
> ralentiza, bloquea archivos y puede corromper el repo. Mantenlo fuera de OneDrive.

---

## A · Puesta a punto del entorno Windows (una sola vez)

La sesión de escritorio tropezó con estas fricciones. Resueltas una vez, no vuelven:

| # | Fricción | Qué hacer |
|---|----------|-----------|
| 1 | **Node no estaba en el PATH** | Instala Node.js LTS desde [nodejs.org](https://nodejs.org) marcando *"Add to PATH"*, o añade `C:\Program Files\nodejs` al PATH a mano. Comprueba con `node -v` y `npm -v` en una terminal nueva. |
| 2 | **Credenciales de git** (el `push` se colgaba pidiendo login) | Git for Windows trae **Git Credential Manager**: el primer `git push` abre el navegador para iniciar sesión y luego recuerda. Alternativa cómoda: **GitHub Desktop** (login gráfico) o `gh auth login`. |
| 3 | **`gh` (GitHub CLI) no instalado** | Opcional, útil para abrir PRs desde la terminal: [cli.github.com](https://cli.github.com) → `gh auth login`. |
| 4 | **`unzip` ausente** | Lo usan **9 tests de integración del vault** (`src/lib/vault/*.test.ts`) para cruzar el ZIP firmado con una herramienta externa. Sin `unzip` esos 9 fallan **en local** (en CI/Linux pasan). Instálalo si quieres correrlos (viene con Git Bash; o con [Chocolatey](https://chocolatey.org): `choco install unzip`). |
| 5 | **`.env.local` no existe tras clonar** | No está en git a propósito (lleva las claves). Sin él, la app corre en **modo demo**. Para modo conectado / `verify:backend`, créalo en la raíz con al menos `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. El agente te guía. |

**Primer arranque tras clonar:**
```bash
npm install        # instala dependencias (necesita Node, #1)
npm run dev        # arranca en http://localhost:3000 (modo demo sin .env.local)
```

---

## B · Capacidades del agente: qué viaja con el clon y qué se configura

Regla general (verificada contra la doc oficial de Claude Code): **lo que vive en
`.claude/` o en `.mcp.json` dentro del repo VIAJA con el `git clone`; lo que es
configuración de tu máquina o lleva claves, NO.**

### B.1 · Subagentes — ✅ YA vienen en tu clon

Los **4 subagentes** viven en `.claude/agents/*.md`, están commiteados, y por tanto
**tu clon del escritorio ya los tiene**. Claude Code los descubre solo (sube desde la
carpeta actual buscando `.claude/agents/`).

| Subagente | Para qué | ¿Necesita MCP? |
|-----------|----------|----------------|
| **`compliance-domain-expert`** | Validar reglas de riesgo, textos legales y afirmaciones regulatorias (EU AI Act, ISO 42001, NIST, leyes de EE. UU.). **Consúltalo antes** de todo lo de compliance. | **No** — usa Read/Grep/WebSearch/WebFetch. **Funciona ya, sin configurar nada.** |
| **`product-architect`** | Arquitectura (datos, APIs, auth, multi-tenancy) antes de decisiones grandes. | Usa **Context7** (docs) — degrada bien sin él. |
| **`ui-designer`** | Diseño de pantallas/componentes (minimalista, serio). | Usa **Magic Patterns** (diseño). |
| **`frontend-engineer`** | Implementación Next.js + TS + Tailwind. | Usa **Context7** (docs). |

**Cómo se invocan:** normalmente **automático** — Claude delega en el subagente cuando tu
petición encaja con su `description`. También puedes pedirlo explícitamente ("usa el
`compliance-domain-expert` para validar esto").

**Si el agente de escritorio dice que "no está disponible":** casi siempre es que la
sesión de Claude Code **se abrió antes** de que existiera la carpeta (o antes de clonar).
Solución: **cierra y reabre `claude`** en la carpeta del proyecto, y ejecuta **`/doctor`**
(lista los agentes cargados y avisa de duplicados). Los archivos están ahí; es cuestión de
que la sesión los cargue al arrancar.

### B.2 · MCP servers — se configuran (y pueden viajar con el repo)

Los **MCP** son herramientas externas que el agente puede usar. En la nube tengo estos
relevantes; en el escritorio **no vienen solos**, pero se pueden declarar:

| MCP | Para qué | Quién lo usa |
|-----|----------|--------------|
| **Context7** | Documentación al día de librerías (Next.js, React, Supabase…). | `product-architect`, `frontend-engineer` |
| **Magic Patterns** | Explorar/generar diseño de UI. | `ui-designer` |
| **GitHub** | Leer/crear PRs, issues, revisar CI. | flujo de PRs |

**Dos formas de añadirlos:**

1. **Por máquina** (rápido, no viaja): en una sesión de Claude Code, comando `/mcp`; o en
   terminal `claude mcp add --scope user …`.
2. **En el repo, para que VIAJE con el clon** (recomendado si queremos que cualquier sesión
   los tenga): un fichero **`.mcp.json` en la raíz** del proyecto. Formato:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN:-}" }
    }
  }
}
```

> **Secretos — regla dura:** en `.mcp.json` **nunca** se escribe una clave a pelo (viaja
> por git). Se referencian **variables de entorno** con `${MI_VARIABLE}` (o
> `${MI_VARIABLE:-valor_por_defecto}`), y cada máquina las pone en su propio entorno.
> Claude Code las sustituye en tiempo de ejecución. Al abrir por primera vez un repo con
> `.mcp.json`, Claude Code muestra un **diálogo de confianza** que hay que aceptar.
> Verificación: `claude mcp list` / `claude mcp get <nombre>`.

**Estado actual:** **no** he commiteado un `.mcp.json` **a propósito** — no quiero dejarte
configuración con URLs/claves sin verificar (sería meter un problema, justo lo que evitamos).
Cuando quieras, confirmamos las URLs y claves exactas de Context7 y Magic Patterns y te lo
dejo commiteado con el patrón `${VAR}` de arriba. **Y lo importante:** el subagente que más
usarás para compliance (`compliance-domain-expert`) **no necesita ningún MCP**.

### B.3 · Skills

Las **skills** de Claude Code (crear PDF/Word/Excel, diseño, etc.) son de **tu instalación
de Claude Code** y son **iguales en cualquier máquina** — no hay que transferirlas. También
pueden existir skills **de proyecto** en `.claude/skills/<nombre>/SKILL.md` (viajan con el
clon), pero **este repo no tiene ninguna** por ahora (solo las 4 de subagentes). Si algún
día nos conviene una skill propia del proyecto, va ahí.

---

## C · Los 2 "rojos" de Windows que NO son regresiones

Si corres las verificaciones en Windows y ves dos rojos, **son del entorno, no del código**
(en CI/Linux dan verde):

1. **9 tests del vault en rojo** → falta `unzip` (ver A#4). Instálalo y desaparecen.
2. **`check:copy`** → **ya está arreglado** (era un bug de separadores de ruta `\` vs `/`
   en Windows; se normalizó en `scripts/check-prohibited-copy.mjs`). Ya funciona en Windows.

Todo lo demás (lint, tsc, build, el resto de tests, `verify:backend`) corre igual en Windows.

---

## Referencias oficiales

- Subagentes → https://code.claude.com/docs/en/sub-agents
- MCP servers y `.mcp.json` → https://code.claude.com/docs/en/mcp
- Skills → https://code.claude.com/docs/en/skills

---

**En una frase:** los **4 subagentes ya viajan con tu clon** (y el de compliance funciona
sin configurar nada); los **MCP** se añaden por máquina o —si quieres que viajen— con un
`.mcp.json` y variables de entorno para las claves; y las **skills** ya las tienes por ser
parte de Claude Code. Con el entorno Windows a punto (sección A), el escritorio trabaja
igual que la nube.
