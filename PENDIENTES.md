# PENDIENTES.md — Estado y tareas abiertas de Attesta

> **Documento vivo.** Reúne TODO lo que queda por hacer (tuyo y mío) para no perder
> el hilo entre sesiones. Se relaciona con:
> - **[MEMORY.md](./MEMORY.md)** — memoria completa + bitácora (§10) + cómo retomar (§11).
> - **[CLAUDE.md](./CLAUDE.md)** — mapa técnico del código.
> - **[docs/supabase.md](./docs/supabase.md)** — backend/migraciones.
>
> Última actualización: **2026-07-18**.

---

## 🔴 1. Pendiente TUYO (acciones manuales del fundador)

### 1.1 · Seguridad — rotar la clave de Stripe (URGENTE)
En una sesión anterior se pegó una **clave secreta LIVE de Stripe (`sk_live_…`) en el chat** →
tratarla como comprometida. **Rótala**: Stripe → *Developers → API keys* → en la Secret key →
**Roll key**. La nueva NUNCA se pega en el chat; va solo a variables de entorno de Vercel.

### 1.1-bis · Aplicar migración 0018 (diferenciación de planes) — RÁPIDO
La diferenciación de planes (free / preparación / enterprise) **ya está construida**, pero el
bloqueo por plan **solo se activa al aplicar la migración**. Sin aplicarla, la app sigue con acceso
completo (degradación segura). Para encenderla:
1. Pega **`supabase/migrations/0018_org_plan.sql`** en el SQL Editor de Supabase (solo ese archivo).
2. A partir de ahí, las cuentas nuevas entran como **gratis** (solo Inventario + Riesgo). Tu cuenta,
   al ser `platform_admin`, **conserva acceso completo** automáticamente.
3. Para dar acceso de pago a un cliente **sin Stripe** (cortesía o Enterprise), en el SQL Editor:
   ```sql
   -- hallar el id de la org por el email de un miembro:
   select o.id, o.name, o.plan from public.organizations o
   join public.memberships m on m.organization_id = o.id
   join auth.users u on u.id = m.user_id
   where u.email = '<correo>';
   -- elevar el plan:
   update public.organizations set plan = 'preparacion' where id = '<org-uuid>';
   -- o 'enterprise'
   ```
4. Cuando Stripe esté activo (§1.2), una suscripción activa sube la org a **preparación** sola.

### 1.1-ter · Migración 0019 (auditoría de sesgo NYC LL144) — ✅ APLICADA (2026-07-18)
Aplicada y **verificada por API** (las 6 columnas existen en `ai_systems`). El registro de auditoría de sesgo
con cuenta atrás ya está activo. Para usarlo: **Inventario → un sistema** → marca si es AEDT y registra fecha/
auditor/URL de su auditoría → verás el estado y la cuenta atrás ("vence en N días"), también en el dossier.

### 1.2 · Pagos con Stripe (cuando estés en una computadora, en modo Test)

> **⏸️ ESTADO AL 2026-07-18 — a medio configurar, NO funciona todavía.**
> El fundador ya hizo (en modo Test): producto/precio $350, webhook, y **añadió las variables en
> Vercel**. PERO producción **sigue sin ver Stripe**: el webhook responde `{"error":"stripe no
> configurado"}` (HTTP 503) → `isStripeConfigured` es `false` en el deploy activo.
>
> **Diagnóstico exacto para retomar** (sin necesidad de sesión):
> ```bash
> curl -sS -X POST https://attesta-io.vercel.app/api/stripe/webhook -d '{}' -w "\n[HTTP %{http_code}]\n"
> ```
> - `stripe no configurado` / **503** → las llaves NO están vivas (estado actual). Falta algo abajo.
> - `firma inválida` / **400** → ✅ Stripe YA está configurado (las llaves están vivas); seguir a la prueba.
>
> **Causa más probable (por orden):**
> 1. **Falta REDEPLOY.** Las env vars solo entran con un deploy nuevo → Vercel → Deployments → último → ⋯ → **Redeploy**.
> 2. Las variables se marcaron solo para **Preview/Development**, no para **Production**. Reabrir cada
>    una y confirmar que **Production** está marcado.
> 3. Nombre/valor con typo o espacio. Deben ser exactos: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`,
>    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
> 4. Ojo: la prueba se hizo en una **URL de previsualización** (`...-a95qea6pd-attesta-io.vercel.app`),
>    no en producción. Probar SIEMPRE en `https://attesta-io.vercel.app`.
>
> **Cómo retomar:** volver a la computadora → aplicar 1-2-3 → Redeploy → correr el `curl` de arriba.
> Cuando devuelva `firma inválida`/400, avisar a Claude para verificar el pipeline de punta a punta.

La integración **ya está construida y desplegada, pero dormida** (se activa sola al poner las llaves).
Pasos, en orden:

1. **Aplica la migración** `supabase/migrations/0017_subscriptions.sql` en el SQL Editor de Supabase
   (solo ese archivo). *← probablemente aún no aplicada.*
2. Entra a Stripe en **`dashboard.stripe.com/test`** (modo Test / Sandbox).
3. **Products → Add product**: `Attesta — Preparación`, **350 USD**, *Recurring / Monthly* → copia el
   **Price ID** (`price_…`).
4. **Developers → API keys**: copia `pk_test_…` y `sk_test_…`.
5. **Developers → Webhooks → Add endpoint**:
   - URL: `https://attesta-io.vercel.app/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copia el **Signing secret** (`whsec_…`).
6. En **Vercel → Settings → Environment Variables** (Production) añade:
   | Variable | Valor |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_test_…` |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` |
   | `STRIPE_PRICE_ID` | `price_…` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
   - Y **confirma que exista** `SUPABASE_SERVICE_ROLE_KEY` (la que ya usa el radar de vigilancia;
     el webhook la necesita para escribir).
7. **Redeploy** en Vercel.
8. **Prueba**: inicia sesión (cuenta con organización), entra a Gap/Vigilancia → sale el **paywall** →
   *Plan y facturación* → *Suscribirse* → tarjeta de prueba `4242 4242 4242 4242` (fecha futura, CVC y
   CP cualesquiera) → al volver, recarga: suscripción **Activa** y paywall desbloqueado.
9. Cuando funcione en Test, repetir con llaves **live** para cobrar de verdad.

> ⚠️ Al poner las llaves, **el bloqueo por plan se activa** para toda cuenta sin suscripción (es lo
> esperado). Inventario y riesgo siguen libres.

### 1.3 · Correo de verificación por código (requiere dominio)
Hoy la **confirmación de correo está DESACTIVADA** (el registro entra directo). El flujo de **código OTP
ya está construido** en la app; para encenderlo hace falta:
1. **Comprar un dominio** propio (p. ej. `attesta.io` / `attesta.mx`, ~$10–15/año).
2. **Verificarlo en Resend** (registros DNS).
3. En **Supabase → Authentication → Providers → Email**: volver a activar **"Confirm email"** y
   configurar **custom SMTP** (con Resend).
4. Editar la plantilla **"Confirm signup"** para incluir el código:
   ```html
   <h2>Confirma tu cuenta en Attesta</h2>
   <p>Tu código de verificación es:</p>
   <p style="font-size:28px;font-weight:700;letter-spacing:8px;margin:16px 0">{{ .Token }}</p>
   <p>Introdúcelo en la app para activar tu cuenta. Caduca en 1 hora.</p>
   ```
Un dominio propio además: mejora la entrega de correos (no caen en spam) y desbloquea el punto 1.4.

### 1.4 · Notificaciones de solicitudes de acceso (waitlist)
El destinatario ya es **`attesta.io.mx@gmail.com`**. Para que lleguen, la cuenta de **Resend** debe estar
bajo ese mismo correo (o tener un dominio verificado). Si tu `RESEND_API_KEY` en Vercel es de otra cuenta,
las notificaciones al buzón nuevo **no llegarán** hasta verificar dominio.

### 1.5 · Recordatorios de gobernanza por correo (digest semanal) — construido, dormido
**Ya construido y desplegado** (env-gated): cada **lunes 08:00 UTC** un cron manda a cada organización un
digest con lo que necesita atención (auditorías de sesgo vencidas/por vencer + próximos plazos regulatorios).
Para **encenderlo** en Vercel → *Settings → Environment Variables* (Production):
1. **`RESEND_API_KEY`** — tu clave de Resend (la misma que la waitlist). Sin ella, el cron calcula pero no envía.
2. **`CRON_SECRET`** — cualquier cadena aleatoria larga. **Vercel la usa para autenticar el cron** (sin ella, el
   cron responde 403 y no envía). Imprescindible.
3. Confirmar que exista **`SUPABASE_SERVICE_ROLE_KEY`** (el cron lee organizaciones/sistemas y correos con ella).
4. (Recomendado) **`NEXT_PUBLIC_APP_URL`** = `https://attesta-io.vercel.app` para los enlaces del correo.
5. Redeploy. Para **probar sin esperar al lunes**: como platform_admin, abre `/api/reminders/run` (o `curl` con
   `Authorization: Bearer <CRON_SECRET>`). Devuelve un resumen (orgs, destinatarios, correos enviados). Si aún no
   hay `RESEND_API_KEY`, es un *dry-run* (cuenta pero no envía) — útil para comprobar que detecta bien.
> Deliverabilidad: sin dominio propio verificado en Resend, los correos salen de `onboarding@resend.dev` y pueden
> caer en spam. Verificar un dominio (§1.3) mejora esto y es lo mismo que hace falta para el código de correo.

---

## 🟡 2. Pendiente MÍO (desarrollo, cuando desbloquees lo de arriba)

- **Verificar Stripe end-to-end**: en cuanto pongas las llaves, compruebo que el webhook responde y que
  la suscripción se sincroniza (paso 1.2.8). Avísame.
- **Reactivar el código OTP**: cuando tengas dominio + SMTP, re-encender la verificación (el código ya está
  hecho; es re-activar "Confirm email" + plantilla).
- **Landing (item 5, mejoras de conversión)**: hecho lo principal; queda pulir con más ejemplos/animaciones
  si quieres seguir iterando.

### 2.1 · Diferido de la auditoría de calidad (2026-07-18)
La 1ª tanda de pulido ya está hecha (manejo de errores, toasts por tipo, carga/error del dashboard, empty-states).
Queda pendiente:
- ✅ **Copy prohibido en textos estáticos — HECHO (2026-07-18, revisado con el experto).** Neutralizados 3:
  `recommendations.ts` ("garantizar"→"alcanzar y mantener", Art. 15), `mock-data.ts` ("cumple el Art. 26"→"aborda
  las obligaciones del Art. 26"), `policy-packs/rrhh.ts` ("garantiza"→"asegura"). CONSERVADOS 2 (referencias
  correctas a obligación del proveedor): los "marcado CE" de `recommendations.ts:53` y `regulatory-watch.ts:286`
  (el verbo es del deployer: "exige/verifica que el proveedor lleve marcado CE"). El disclaimer de `LegalNote`
  usa los términos en negativo ("No es un certificado…") — correcto, se conserva.
- ✅ **`window.confirm` → modal propio — HECHO (2026-07-18).** Nuevo `ConfirmSubmit` (modal accesible con marca)
  aplicado a los 5 borrados (sistema, brecha, tarea, miembro, invitación). Verificado con captura.
- **Estados vacíos menores**: `riesgo/page.tsx` muestra las 4 secciones con "0 sistemas" en cuenta nueva.
- **TODOs de andamiaje**: `context.ts:21` (selector de org activa), `analista/voyage.ts` (placeholder de embeddings).

### 2.2 · Ampliar el foso — leyes de EE. UU. de contratación con IA (esperando visto bueno)
Recomendación del experto lista (ver MEMORY §10, 2026-07-18). **2º marco** = NYC LL144 + Illinois HB 3773 (en vigor),
con Attesta **registrando evidencia** de la auditoría independiente (NO auditando ni certificando). Colorado/EEOC
solo como radar. **Falta que el fundador apruebe el alcance**; luego se construye por incrementos reutilizando
`regulatory-watch.ts` + nuevo policy pack + modelo de evidencia. NO construir aún: bias-testing propio, ISO/NIST, shadow-AI.

---

## 🟢 3. Ideas / capas futuras del producto (no pedidas aún, para no olvidar)

- **Capa 0 — Descubrimiento de shadow-AI**: detectar sistemas de IA que la organización usa sin declarar.
- **Capa 4 — Pruebas de sesgo**: evaluación de sesgo/impacto (p. ej. con Evidently) para herramientas de RRHH.
- **Umbral de preparación**: hoy `AUDIT_READY_THRESHOLD = 80` (en `src/lib/mock-data.ts`, un solo sitio).
  Cambiar el número es una línea si quieres otro objetivo (p. ej. 85%).
- **Selector de organización activa** (usuario en varias orgs) — ya anotado en el código como TODO.

---

## ✅ 4. Hecho y desplegado (referencia rápida)

Lista de mejoras del fundador **completada** (1ª–3ª tanda): PDF en claro solo al imprimir · menú de cuenta
(logout / cambiar cuenta / volver al sitio) · registro con nombre+apellidos+confirmar contraseña · guía de
primer login con mini-ejemplos animados · demo pública `/demo` recortada a muestra (con volver-al-sitio en
móvil + tema claro/oscuro) · planes diferenciados **$350 USD/mes** + tabla comparativa · umbral de auditoría
80% · datos de contacto y notificaciones a `attesta.io.mx@gmail.com` · toasts con cierre.

**Construido pero inactivo hasta configurar**: cobro por suscripción Stripe (migración 0017 + webhook +
paywall) y verificación de correo por código OTP.

El **foso automatizado** (Vigía + Analista + Validador) está completo y verificado — ver MEMORY.md §11.

---

## 📌 Cómo retomar en la próxima sesión

1. Lee **MEMORY.md** (§11 "RETOMAR AQUÍ") y este archivo.
2. Pregunta al fundador en qué punto está de los pendientes 🔴 (sobre todo Stripe y dominio).
3. Rama de trabajo: `claude/init-3bwfhm`; se pushea también a `main` (Vercel redespliega solo).
4. Verificación: `npm run build` + `npm run lint` + `npx tsc --noEmit` (no hay tests); backend real por curl.
