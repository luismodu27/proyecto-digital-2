# Attesta — Compliance y Gobernanza Continua de IA

**Attesta** es un SaaS B2B de **compliance y gobernanza continua de IA** para el
**mid-market**, con cuña vertical en **RRHH/reclutamiento**: inventario de sistemas
de IA, clasificación de riesgo (EU AI Act), evidencia lista para auditoría y
monitoreo de cambios regulatorios.

## Documentación

- **[MEMORY.md](./MEMORY.md)** — memoria viva del proyecto (léela primero).
- **[CLAUDE.md](./CLAUDE.md)** — guía para el agente de desarrollo.
- **[docs/thesis.md](./docs/thesis.md)** — tesis original del fundador.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Vercel (objetivo)

## Empezar

```bash
npm install
npm run dev      # http://localhost:3000
```

- `/` — landing de lanzamiento.
- `/dashboard` — esqueleto del producto (resumen, inventario, riesgo, gap) con datos de ejemplo.

## Estado

✅ Landing + producto (dashboard) construidos, con **backend real opcional**
(Supabase: Postgres + Auth + RLS multi-tenant) y **modo demo** con datos de ejemplo.
✅ Auth y multi-tenancy, clasificación de riesgo, gap assessment, plan de acción,
export de evidencia a **PDF** (dossier / informe ejecutivo / gap), radar de
vigilancia regulatoria (Vigía + Analista), facturación (Stripe) y onboarding.

Ver **[MEMORY.md](./MEMORY.md)** para el roadmap y las decisiones, y
**[PENDIENTES.md](./PENDIENTES.md)** para lo que queda abierto.
