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

### 1.2 · Pagos con Stripe (cuando estés en una computadora, en modo Test)
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

---

## 🟡 2. Pendiente MÍO (desarrollo, cuando desbloquees lo de arriba)

- **Verificar Stripe end-to-end**: en cuanto pongas las llaves, compruebo que el webhook responde y que
  la suscripción se sincroniza (paso 1.2.8). Avísame.
- **Reactivar el código OTP**: cuando tengas dominio + SMTP, re-encender la verificación (el código ya está
  hecho; es re-activar "Confirm email" + plantilla).
- **Landing (item 5, mejoras de conversión)**: hecho lo principal; queda pulir con más ejemplos/animaciones
  si quieres seguir iterando.

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
