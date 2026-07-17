# Conectar Attesta a Supabase

La app funciona en **modo demo** (datos de ejemplo) sin configurar nada. Para pasar
a datos reales que persisten, sigue estos pasos.

## 1. Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. **Elige región UE** (p. ej. Frankfurt) — nuestro ICP es europeo y el EU AI Act
   aplica; conviene residencia de datos en la UE.
3. Espera a que se aprovisione (~2 min).

## 2. Aplicar el esquema

En el panel de Supabase → **SQL Editor**, ejecuta en orden el contenido de:

```
supabase/migrations/0001_init.sql        # tablas + enums
supabase/migrations/0002_rls.sql         # seguridad multi-tenant (RLS)
supabase/migrations/0003_audit.sql       # audit-trail inmutable (triggers)
supabase/migrations/0004_onboarding.sql  # RPC crear organización
```

> Con el CLI de Supabase: `supabase db push` aplica todas las migraciones.

## 3. Variables de entorno

Copia `.env.example` a `.env.local` y rellena desde **Project Settings → API**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...   # anon public (seguro en cliente)
# SUPABASE_SERVICE_ROLE_KEY=...   # SECRETO, solo servidor. No lo subas al repo.
```

En cuanto existan `URL` + `ANON_KEY`, la capa de datos (`src/lib/data`) usa Supabase
en vez de los datos de ejemplo, automáticamente.

## 4. Modelo de seguridad (resumen)

- **Aislamiento por tenant** vía RLS de Postgres: cada usuario solo ve datos de las
  organizaciones donde es miembro (`memberships`). Defensa en la base de datos, no
  solo en la app.
- **Audit-trail inmutable**: los cambios se registran por triggers `security definer`;
  `audit_log` no admite UPDATE/DELETE (ni por el dueño). Roadmap: hash-chain (fase 2).
- **Roles**: `owner` / `admin` / `member` por organización.

## 5. Pendiente (siguiente incremento)

- Middleware de sesión + UI de login/registro + onboarding (RPC `create_org_and_owner`).
- Persistir la clasificación del asistente en `risk_assessments`.
- Alta/edición de sistemas y brechas (write-path) con registro en `audit_log`.
- Script de seed para poblar una organización demo.

> Referencia de diseño completa: reporte del subagente `product-architect` (ver bitácora
> en `MEMORY.md`, §10).
