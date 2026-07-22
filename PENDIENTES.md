# PENDIENTES.md — Estado y tareas abiertas de Attesta

> **Documento vivo.** Reúne TODO lo que queda por hacer (tuyo y mío) para no perder
> el hilo entre sesiones. Se relaciona con:
> - **[MEMORY.md](./MEMORY.md)** — memoria completa + bitácora (§10) + cómo retomar (§11).
> - **[CLAUDE.md](./CLAUDE.md)** — mapa técnico del código.
> - **[docs/supabase.md](./docs/supabase.md)** — backend/migraciones.
>
> Última actualización: **2026-07-22**.

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

### 1.1-quinquies · Migración 0021 (guardas de membresías) — ✅ APLICADA (2026-07-21)
Trigger `enforce_membership_guards` (BEFORE UPDATE/DELETE en `memberships`) que impone en la BD "solo un owner
otorga/retira el rol owner" y "una organización nunca se queda sin owner". **Aplicada y verificada por SQL**
(función `enforce_membership_guards` `prosecdef=true` + `search_path=` vacío; trigger habilitado, `tgenabled='O'`).
Antes esas reglas vivían solo en la app y un **admin** podía saltárselas por API directa (auto-promoverse a owner
o expulsar al owner); ahora es defensa en profundidad **intra-tenant** a nivel de BD.

### 1.1-quater · Migración 0020 (audit-trail a prueba de manipulación) — ✅ APLICADA (2026-07-20)
El registro de actividad se **encadena con hashes SHA-256** (tamper-evident): cada evento incorpora el hash del
anterior, así que borrar o alterar cualquiera —incluso con acceso directo a la base— rompe la cadena y queda
demostrable. **Aplicada y verificada por API** (columnas `prev_hash`/`row_hash` presentes y función
`verify_audit_chain` activa). En **Dashboard → Actividad** se ve la tarjeta "Integridad de la cadena verificada".

### 1.1-ter · Migración 0019 (auditoría de sesgo NYC LL144) — ✅ APLICADA (2026-07-18)
Aplicada y **verificada por API** (las 6 columnas existen en `ai_systems`). El registro de auditoría de sesgo
con cuenta atrás ya está activo. Para usarlo: **Inventario → un sistema** → marca si es AEDT y registra fecha/
auditor/URL de su auditoría → verás el estado y la cuenta atrás ("vence en N días"), también en el dossier.

### 1.2 · Pagos con Stripe — ✅ LIVE configurado (2026-07-20)

> **✅ LIVE ACTIVO.** El fundador configuró Stripe en modo **Live** (producto/precio **$120 USD/mes**, webhook,
> variables en Vercel). Verificado por API: `POST /api/stripe/webhook` → `400 firma inválida` = llaves live
> cargadas y verificando firmas ✅. Cobros reales habilitados.
>
> **Falta comprobar el flujo de pago end-to-end** (cuando el fundador quiera): crear un **cupón 100% off** en
> Stripe Live y pasar por *Suscribirse* → "Add promotion code" → total $0 → suscripción `active` sin cobrar.
>
> **⚠️ Seguridad pendiente:** si el `sk_live` que está ahora en Vercel es **el mismo** que se expuso en el chat
> en una sesión anterior, **rótalo**: Stripe → *Developers → API keys* → Secret key → **Roll key** → pon el
> nuevo `sk_live` en `STRIPE_SECRET_KEY` (Vercel, Production) → **Redeploy**. La nueva nunca se pega en el chat.
>
> ---
> **Historial (modo Test, 2026-07-18):** verificado e2e con tarjeta `4242…` → webhook 200 → suscripción
> `active` → plan Preparación desbloqueado. Migración 0017 aplicada.
>
> **Causa del atasco (ya corregida):** había un **typo** en el nombre de la variable en Vercel
> (`STRPE_PRICE_ID` en vez de `STRIPE_PRICE_ID`). Al corregirlo + redeploy, empezó a funcionar.
>
> **Bug encontrado y arreglado al probar (multi-org):** un usuario en varias organizaciones pagaba con una
> org pero la sesión resolvía otra (gratis) → veía "Suscribirse" pese a estar `active`. Fix desplegado:
> `startCheckout` fija la cookie de org activa a la que paga, y `getActiveOrg` prioriza la org con
> suscripción activa cuando no hay elección explícita (commit 51ab9f1).
>
> **Diagnóstico rápido** (por si se rompe): `curl -sS -X POST https://attesta-io.vercel.app/api/stripe/webhook
> -d '{}'` → `firma inválida`/400 = configurado ✅ · `stripe no configurado`/503 = las llaves no están vivas.

**PENDIENTE (cuando quieras cobrar de verdad):** repetir la configuración con llaves **LIVE** de Stripe
(producto/precio live, `sk_live`/`pk_live`, webhook live → sus variables en Vercel) y **rotar** la `sk_live`
que se expuso en el chat. Mientras, en Test no se cobra dinero real.

<details><summary>Pasos originales de configuración (referencia)</summary>

1. **Aplica la migración** `supabase/migrations/0017_subscriptions.sql` en el SQL Editor de Supabase
   (solo ese archivo). *← YA APLICADA.*
2. Entra a Stripe en **`dashboard.stripe.com/test`** (modo Test / Sandbox).
3. **Products → Add product**: `Attesta — Preparación`, **120 USD** (¡moneda **USD**, no MXN!), *Recurring /
   Monthly* → copia el **Price ID** (`price_…`).
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

</details>

> ⚠️ Con las llaves puestas, **el bloqueo por plan está activo** para toda cuenta sin suscripción (es lo
> esperado). Inventario y riesgo siguen libres.

### 1.6 · Encender SSO / acceso corporativo (Google + Microsoft) — config sin código
Los botones **"Continuar con Google / Microsoft"** ya están construidos en login y registro; **aparecen solo
cuando pones su variable** en Vercel (degradación segura). Falta registrar las apps OAuth (una vez):

> **URL de retorno de Supabase (la necesitarás abajo):**
> `https://flesaxlgtvhewwcvzrxs.supabase.co/auth/v1/callback`

**Google (Google Workspace / cuentas Google):**
1. [Google Cloud Console](https://console.cloud.google.com) → crea un proyecto → **APIs y servicios → Pantalla
   de consentimiento OAuth** (tipo *External*, nombre "Attesta", correo de soporte).
2. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web**. En *URIs de redirección
   autorizados* pega la **URL de retorno de Supabase** de arriba. Guarda y copia **Client ID** y **Client Secret**.
3. Supabase → **Authentication → Providers → Google** → actívalo → pega Client ID + Secret → *Save*.
4. Vercel → *Environment Variables* (Production): **`NEXT_PUBLIC_SSO_GOOGLE=1`** → **Redeploy**.

**Microsoft (Microsoft 365 / Azure AD):**
1. [Azure Portal](https://portal.azure.com) → **App registrations → New registration**. Nombre "Attesta";
   *Supported account types*: cuentas de cualquier directorio + personales. *Redirect URI* (tipo **Web**): la
   **URL de retorno de Supabase** de arriba. Crea.
2. Copia el **Application (client) ID**. Luego **Certificates & secrets → New client secret** → copia el **Value**.
3. Supabase → **Authentication → Providers → Azure** → actívalo → pega el Application ID + Secret → *Save*.
4. Vercel → **`NEXT_PUBLIC_SSO_MICROSOFT=1`** → **Redeploy**.

**Importante (una sola vez):** Supabase → *Authentication → URL Configuration → Redirect URLs* debe incluir
`https://attesta-io.vercel.app/auth/callback` (probablemente ya está, se añadió para el reset de contraseña).
> Un usuario que entra por SSO por primera vez y aún no tiene organización cae automáticamente en el onboarding.

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

### 1.5-bis · Cron del Vigía (vigilancia regulatoria automática) — construido (2026-07-21)
Hasta ahora el **Vigía solo corría si un admin lo disparaba a mano** — el "foso automatizado" no se ejecutaba solo.
Ya está programado en `vercel.json`: cada **lunes 06:00 UTC** Vercel llama a `/api/reg-watch/vigia` (GET con
`Authorization: Bearer <CRON_SECRET>`) y el Vigía revisa las fuentes y encola candidatos. **Requisitos** (los mismos
del digest §1.5): `CRON_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` en Vercel. Sin `CRON_SECRET` el cron responde 401 y no
corre. **Decisión de diseño:** solo el **Vigía** (determinista, gratis) es automático; el **Analista** (enriquecido con
LLM, con coste) sigue siendo disparo manual del Validador — coherente con "propone borradores que un humano valida".
Si en el futuro quieres el pipeline entero automático, hay que encadenar `/api/reg-watch/analista` (avísame).

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

### 2.4 · i18n "INGLÉS TOTAL" — traducir TAMBIÉN el contenido regulatorio (en curso, 2026-07-22)
El fundador pidió que la versión inglesa NO deje NADA en español y funcione igual que la española.
Reconciliación con la regla dura: el contenido legal SÍ se traduce, pero **cada texto legal lo valida el
`compliance-domain-expert`** (no traducción mecánica). Patrón: cada módulo mantiene el ES canónico + añade
`_EN` validado + selector locale (`*_BY_LOCALE`/`fn(x,locale)`, default ES); la fachada de datos resuelve el
locale por cookie internamente.
- ✅ **Contenido `_EN` validado por experto:** policy-packs (5), risk-assessment, recommendations,
  regulatory-watch, audit. (commits `add6c02`, `d5ee3b9`).
- ✅ **Wiring Fase 1** (API locale en los 5 módulos) `e99e83a`; **Fase 2A** (fachada locale-aware +
  reportes/plan/packs/riesgo/actividad) `10c4347`.
- 🔄 **En curso:** chrome interno de páginas regulatorias (packs page, dossier/informe secciones+KPIs,
  actividad ChainStatusCard/formatAgo) usando selectores locale; y `mock-data` demo + ruta `/demo`.
- ⏳ **Pendiente — NARRATIVAS legales hand-written → experto + wiring:** resumen ejecutivo del dossier (s1–s5),
  `RATIONALE_FALLBACK`, `summaryParagraph` del informe, hero/briefing "Aclaración de plazos" de vigilancia,
  LegalNotes sin `_BY_LOCALE`, y el contenido regulatorio de las muestras de `mock-data` (SAMPLE gaps/assessments).
- ⏳ **Limpieza final:** `Anexo`→`Annex` y `Directiva…UE/CE`→`Directive…EU/EC` dentro de las estructuras `_EN`;
  **escaneo integral** de la versión EN hasta cero español; normalizar ortografía a americana.
- **Datos persistidos** (gap_items ya guardados, rationale de evaluaciones históricas, eventos publicados) se
  quedan en el idioma de guardado — no son retraducibles; es correcto (solo el contenido curado/computado en
  display sale por locale).

### 2.3 · Internacionalización ES/EN — Inc 0–5 HECHOS (en la rama, 2026-07-22)
Toda la UI (web pública + auth + dashboard) es bilingüe ES/EN. **En la rama `claude/init-3bwfhm`, NO desplegado a `main`**
(el fundador decidió publicar cuando dé el visto bueno). Ver MEMORY §10 (2026-07-22). ✅ Inc 0–3 web pública + SEO,
✅ Inc 4 auth por cookie, ✅ Inc 5a–5e dashboard (shell/nav/toasts, genéricos, formularios, chrome de páginas
regulatorias, enums de dominio).
- **Falta que el fundador decida:** publicar a producción (`main`) — es un hito coherente y completo por sí mismo.
- **Pendiente de validación del EXPERTO antes de exponer en EN** (hoy en español, degradación segura):
  1. Etiquetas de `regulatory-watch.ts`: `FRAMEWORK_*`, `JURISDICTION_*` y tipos de evento regulatorio (nombres de
     marcos/jurisdicciones y descripciones cargadas). El patrón `*_BY_LOCALE` ya está montado para los demás enums;
     solo falta añadir la columna EN validada aquí.
  2. **Inc 6 · Cuerpo de los PDF** (dossier/informe/gap-informe): decisión tomada = el cuerpo legal se mantiene en
     **español** aunque la UI esté en inglés (regla dura). `ScopeNote` ya es locale-aware y `LEGAL_*_BY_LOCALE` ya tienen
     EN validado; si en el futuro se quiere el documento entero en EN, requiere validación del experto del cuerpo completo.
- **Diferidos técnicos (míos):** (a) leer `headers()` en el root layout volvió dinámicas todas las rutas (la landing dejó
  de prerenderarse estática) — optimizable con root layouts separados por route-group si el TTFB lo pidiera; (b)
  auto-detección `Accept-Language` NO se implementó (decisión: no forzar redirección; como mucho un banner "View in
  English" fuera de MVP); (c) el toast `pack-applied` dice "policy pack RRHH" fijo aunque se aplique otro pack
  (preexistente, menor).

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

**Enterprise (Frente 3)**: selector de organización activa · audit-trail a prueba de manipulación (hash-chain
SHA-256, migración 0020) · **exportación de datos** (JSON portable en *Plan y facturación*, sin migración,
disponible en todos los planes a propósito) · **SSO social** (Google + Microsoft; código listo, se enciende
con config del fundador → §1.6). Futuro opcional: SAML empresarial (requiere Supabase Pro).

**Construido pero inactivo hasta configurar**: cobro por suscripción Stripe (migración 0017 + webhook +
paywall) y verificación de correo por código OTP.

El **foso automatizado** (Vigía + Analista + Validador) está completo y verificado — ver MEMORY.md §11.

---

## 📌 Cómo retomar en la próxima sesión

1. Lee **MEMORY.md** (§11 "RETOMAR AQUÍ") y este archivo.
2. Pregunta al fundador en qué punto está de los pendientes 🔴 (sobre todo Stripe y dominio).
3. Rama de trabajo: `claude/init-3bwfhm`; se pushea también a `main` (Vercel redespliega solo).
4. Verificación: `npm run build` + `npm run lint` + `npx tsc --noEmit` (no hay tests); backend real por curl.

---

## Deuda técnica pendiente (P4 — auditoría 2026-07-21)

Mantenibilidad, **sin impacto de usuario**; no urgente. Del escaneo completo:

- [ ] Unificar los **3 formateadores de cuenta-atrás** en español (`task-reminders.ts:dueLabel`,
  `BiasAuditBadge.tsx:countdownText`, `reminders/email.ts:countdown`) en un helper único en `lib/`.
- [ ] Fusionar **`daysUntil`** (`regulatory-watch.ts`) y **`daysUntilDate`** (`bias-audit.ts`) en una sola
  función que acepte `string | null`.
- [ ] Centralizar los **~7 formateadores de fecha** `toLocaleDateString("es-ES", …)` repartidos por páginas
  (facturación, informes, vigilancia, equipo, dossier) en 2-3 helpers nombrados (`fmtFechaLarga`/`fmtFechaCorta`).
- [ ] Reutilizar **`RISK_ORDER`** en los sitios que aún re-declaran el orden de niveles
  (`CandidateReviewControls.tsx`, `analista/llm.ts`, `reg-pipeline-actions.ts`).
- [ ] Feature-flag explícito / nota del módulo **`analista/`** (RAG con Voyage+LLM, a medio cablear; `TODO(B.1)`
  en `voyage.ts`) para que no quede como código semi-muerto.

### Seguridad — ítems BAJA documentados (auditoría 2026-07-21)
- [ ] `api/reminders/run`: exigir **POST** (o token CSRF) en el modo sesión (hoy acepta GET → CSRF de bajo
  impacto). Tocar cuando se active el cron de correos.
- [ ] `submitWaitlist`: **rate-limit / captcha** (hoy solo honeypot cliente) para evitar spam al fundador.
- [ ] `saveRiskAssessment`: recomputar `rationale/citations/obligations` en servidor desde `answers` (hoy se guardan
  tal cual llegan del cliente → integridad intra-tenant, sin XSS). Coherencia con "contenido legal determinista".

### Follow-ups de la tanda P1 (auditoría 2026-07-21)
- [ ] **CSP estricta con nonce** en `next.config.ts` (ya están HSTS/X-Frame-Options/nosniff/Referrer/Permissions).
  Requiere prueba en navegador: no romper el script de tema inline (`layout.tsx`), Stripe.js ni Supabase.
- [x] ~~**`.env.example` incompleto**~~ — ✅ hecho (2026-07-21): añadidas Stripe ×5, correo ×3, SSO ×2, `NEXT_PUBLIC_APP_URL`.
- [x] ~~**`select("*")` → columnas explícitas**~~ — ✅ hecho (2026-07-21): `getAiSystems` y `getGapItems` enumeran
  columnas (sin las 6 de bias-audit 0019, que no usan). `getSystemDossier` se deja con `*` **a propósito**: sí usa las
  columnas de sesgo y necesita el fallback seguro si 0019 no está aplicada.

### Follow-ups de la tanda P3 (2026-07-21) — lo que quedó abierto
Hecho en P3: skip-link landing, matiz Art. 6(3) en FAQ, `SubmitButton` (estados "enviando"), modal accesible de
descarte (fuera `window.prompt`), `engines`, `apiVersion` Stripe, React 19.2.7, README, borrado `patches/0005`.
Queda (bajo, deferido con motivo):
- [ ] **`tsconfig` `noUncheckedIndexedAccess`**: barrería muchos accesos indexados a datos del cliente (más seguridad
  de tipos real), pero surface decenas de errores → merece su propia tanda dedicada, no un cambio suelto.
- [x] ~~**Stats de `ProblemStats`**~~ — ✅ hecho (2026-07-21): las cifras 78 %/83 % venían de un press release de un
  proveedor (Vision Compliance, conflicto de interés). Sustituidas por fuentes citables: preparación → **Deloitte Legal**,
  encuesta EU AI Act 2024 (500 decisores en Alemania): **48,6 %** no se ha comprometido en serio
  (https://www.deloittelegal.de/dl/en/services/legal/research/umfrage-eu-ai-act-2024.html); inventario → **Cloud Security
  Alliance** 2026: **>50 %** sin inventario formal de IA
  (https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-high-risk-compliance-deadline-20/).
  El 35 M€/7 % se marca como dato del propio Art. 99. Nota al pie con fuentes y el caveat "Alemania".
- [ ] `npm audit`: 2 moderate en `postcss` **vendorizado por Next** (build-time, no accionable sin update de Next). Aceptado.
- [ ] Cosméticos: parpadeo de icono en `ThemeToggle` tras montaje; dots decorativos con hex fijo (semáforo macOS, intencional).

### Follow-ups de la 2ª verificación (2026-07-21) — BAJO no bloqueantes
Arreglados en el momento: 78% de `Hero`, 83% de `Modules`, cita Directiva 2024/1385 (adultos) en risk-assessment,
waterfall de `editar` (→Promise.all), contraste de nota, foco del modal de descarte, tablas con overflow, CI permissions.
Queda (BAJO, deferido):
- [ ] `getExportBundle`: plegar `list_audit_log` (lim 500) dentro del primer `Promise.all` (no depende de `systems`) →
  −1 round-trip en la exportación. Impacto bajo (acción administrativa fría).
- [ ] Quitar `"use client"` innecesario de `DeleteGapButton`/`DeleteSystemButton`/`RevokeInviteButton`/`RemoveMemberButton`
  (solo renderizan `ConfirmSubmit`/`<form action>`, que ya son client): saca unos bytes del bundle. Cleanup de altitud.
- [ ] Modal de descarte: foco RESTAURADO al cerrar ✅, pero sin **focus-trap** completo (Tab puede salir al fondo). Menor.
- [ ] Vercel: 2 crons semanales = límite del plan Hobby. Un 3er cron requeriría Pro. Informativo.

### Revisión crítica del panel (2026-07-21) — diferidos y lo que necesita INPUT del fundador
Ejecutado: Tier 0 (bugs "% listo" y plan de acción), Tier 2 (a11y), Tier 3-4 + parte de Tier 1 (web). Queda:
- [ ] **CREDIBILIDAD del footer (NECESITA TU INPUT).** Hoy el contacto es `attesta.io.mx@gmail.com`, `+52` e Instagram
  `@attesta.io`. Para un comprador enterprise UE es la señal #1 de "proyecto, no proveedor". Necesito de ti: **email en
  dominio propio** (p. ej. `hola@attesta.io`), y si quieres, **LinkedIn** en vez de/además de Instagram. No invento datos.
- [ ] **Prueba social / nombrar al experto (NECESITA TU INPUT).** Decidiste "reformular sin nombre" (hecho). Cuando tengas
  un nombre real + credencial, nombrarlo es la mayor palanca de credibilidad barata. También: contador honesto de waitlist.
- [ ] **Framing de lanzamiento (DECISIÓN TUYA).** Coexisten "Entrar" (producto abierto) y "Solicitar acceso anticipado"
  (waitlist). Apliqué tu mapa de CTAs por plan; si quieres, alineamos el Hero/waitlist a un único estado (abierto vs pre-).
- [ ] **Stats 78%/83% (PENDIENTE de decisión + fuente).** El fundador quiere reponerlos por ser "más nuevos". OJO: en la
  sesión previa se rastreó el 78% a una nota de prensa de un proveedor (Vision Compliance, conflicto de interés) y se
  sustituyó por Deloitte Legal (48,6%) + CSA (>50%). Antes de reponer, CONFIRMAR la fuente nueva y citarla (regla de marca).
- [ ] **`compliance_pct` → renombrar a `readinessPct`** (sugerencia del crítico): el campo nunca se renderiza pero el
  término "compliance/cumplimiento" es prohibido en la marca; un `{s.compliance}` mal colocado lo filtraría. Cosmético/deuda.
- [ ] **RiskWizard — gate de perfilado del Art. 6(3):** hoy "perfila personas" es una opción más del single-select de
  excepciones; debería ser una pregunta binaria previa que fuerce alto riesgo. MEDIA (defendibilidad del clasificador).
- [ ] **RiskWizard — cul-de-sac:** tras guardar solo ofrece "evaluar otro"/"volver"; añadir CTA "Detectar brechas con un
  policy pack" → `/dashboard/packs?system=<id>` para coser el flujo sin depender del checklist efímero. MEDIA.
- [ ] **Sign-off jurídico antes de GA:** el propio `LegalNote` admite "pendiente revisión por abogado UE". Revisar
  disclaimers + reglas del clasificador + los 5 packs con un abogado de IA UE antes de producción. (Fundador.)
- [ ] **Diseño (diferidos BAJA del crítico):** paleta de riesgo poco diferenciable en daltonismo (3 cálidos vecinos);
  hex hardcodeado en `HeroPreview` (puntos del navegador falso) y avatares de `WelcomeGuide` → tokens de tono; targets
  táctiles de la nav móvil ~32px (<44px reco); retorno de foco en `MobileNav`; posición del toast en móvil.
- [ ] **Ideas de foso (estratégico):** benchmarking anónimo cross-tenant (network effect), integraciones HRIS/model
  registry/ticketing (pegajosidad + activación), paquete de auditoría firmado (ZIP con manifiesto SHA-256 verificable).
- [ ] **Narrativa (mejoras no ejecutadas):** subir `UseCaseStory` aún más arriba (tras RecruitmentFocus); tabla comparativa
  "Attesta vs consultor vs Excel"; fuente para la cifra de mercado de `WhyNow` (o moverla a un deck de inversión).
- [ ] **Policy packs — tipo "prohibido" propio (a raíz del pack `gestion-trabajadores`, 2026-07-21).** El
  `emociones-prohibicion` (Art. 5.1.f) es práctica PROHIBIDA, no una brecha ordinaria; hoy `applyPolicyPack` lo inserta
  como `gap_item` "missing" que computa en "% listo" igual que los demás (se mitiga por copy: control de triaje). Más
  limpio sería un flag/severidad "prohibido" en `PolicyControl` que quede **fuera del cómputo de preparación** y se
  renderice como el nivel Inaceptable del dossier ("Práctica prohibida (Art. 5)" + "Revisión jurídica"). Requiere tocar
  `types.ts` + `applyPolicyPack` + la UI de `packs`/`gap` → tanda propia, no cambio suelto. Aplica también al control
  `transparencia-chatbot-emociones` del pack RRHH.
