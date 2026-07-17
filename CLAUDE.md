# CLAUDE.md

> Este archivo lo carga Claude Code automáticamente. La memoria completa del
> proyecto vive en **[MEMORY.md](./MEMORY.md)** — **léela siempre antes de trabajar**
> y **actualízala** cuando el fundador dé una corrección o se tome una decisión clave.

## Resumen del proyecto

SaaS B2B de **compliance y gobernanza continua de IA** para el **mid-market**.
Sistema de registro para inventariar sistemas de IA, clasificar su riesgo (EU AI Act),
generar evidencia de auditoría y monitorear cambios regulatorios.

Detalles completos, ICP, MVP, posicionamiento y bitácora → **MEMORY.md**.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Diseño: Magic Patterns (MCP) · Docs: Context7 (MCP)

## Reglas de trabajo

1. **Consulta `MEMORY.md`** antes de decidir nada.
2. Trabaja en **loop**: planear → ejecutar incremento pequeño → verificar → checkpoint → registrar.
3. **Checkpoints en decisiones clave** (arquitectura, diseño, nombre, features grandes).
4. Verifica APIs de librerías con **Context7** antes de escribir código contra ellas.
5. Diseño: **creativo/minimalista pero original**, estética enterprise moderna, accesible.
6. Registra toda corrección en el §10 de `MEMORY.md`.

## Subagentes disponibles (`.claude/agents/`)

- `compliance-domain-expert` — profundidad regulatoria (EU AI Act, ISO 42001, NIST AI RMF).
- `product-architect` — diseño de sistema y arquitectura técnica.
- `ui-designer` — diseño UI creativo/minimalista (Magic Patterns).
- `frontend-engineer` — implementación Next.js + TS + Tailwind.

## Comandos (se irán completando al scaffoldear la app)

```bash
# pendiente: npm run dev / build / lint / test
```
