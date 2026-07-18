# MEMORY.md — Memoria viva del proyecto

> **Propósito.** Este archivo es la memoria central del proyecto. Claude lo consulta
> **antes de cualquier decisión** y lo **actualiza cada vez que el fundador da una
> corrección o se toma una decisión importante**. Si algo aquí contradice una
> instrucción nueva del fundador, gana la instrucción nueva — y se registra aquí.
>
> **Regla de oro:** No repetir errores ya corregidos. Toda corrección se anota en
> el §9 (Bitácora de decisiones y correcciones).
>
> Última actualización: 2026-07-17

---

## 1. Qué es el proyecto (una frase)

Plataforma **SaaS B2B de compliance y gobernanza continua de IA** para empresas
**medianas (mid-market)** que despliegan IA de "alto riesgo" (RRHH, crédito,
seguros, salud, edtech) y que **no tienen un equipo GRC dedicado**.

**Nombre comercial:** **Attesta** (evoca *attestation* / evidencia lista para auditoría).

## 2. El problema (el dolor)

- **78%** de las organizaciones no ha dado pasos significativos hacia el cumplimiento del EU AI Act.
- **83%** no tiene un inventario formal de sus sistemas de IA.
- Hoy se resuelve con **hojas de cálculo + consultores a ~$500/hora**.
- Coste de compliance para grandes empresas estimado en **$8–15M**.
- Multas de hasta **€35M o 7% de facturación** (más duras que el GDPR).

**Traducción:** dolor agudo, caro y con presupuesto asignado.

## 3. Usuario / cliente objetivo (ICP)

- **Empresa:** mid-market (aprox. 200–2.000 empleados) que usa IA en decisiones
  con impacto sobre personas (contratación, scoring crediticio, suscripción de
  seguros, diagnóstico, evaluación educativa).
- **Comprador / champion:** responsable de Riesgo, Legal, Compliance o un "Head of
  Data/AI" que de repente está "en el anzuelo" sin equipo GRC.
- **No es el ICP (todavía):** las grandes empresas con equipos GRC maduros (ese es
  el terreno de los incumbentes). Nosotros atacamos el **whitespace desatendido**.

## 4. Producto — visión y alcance MVP

**Sistema de registro ("system of record") de la gobernanza de IA.** Módulos núcleo:

1. **Inventario de sistemas de IA** — catálogo de todos los modelos/sistemas en uso.
2. **Clasificación de riesgo** — asistente que clasifica cada sistema según EU AI Act
   (inaceptable / alto / limitado / mínimo) y marcos aplicables.
3. **Audit-trail / evidencia** — registro inmutable de cambios y documentación lista
   para auditoría.
4. **Monitoreo regulatorio** — seguimiento de cambios normativos (el "flywheel" de
   conocimiento que mejora con cada norma y cada cliente).
5. **Gap assessment** — qué falta para cumplir, con plan de remediación.

**MVP CONFIRMADO:** Inventario + Clasificación de riesgo + Gap assessment exportable
a PDF. Esto también es el **servicio-cebo** vendible manualmente ("AI inventory + gap
assessment") para validar demanda.

**Orden de construcción acordado:** (1) Landing impactante para validar mensaje y
captar leads + esqueleto del dashboard (app shell). (2) Backend real (datos) después.

## 5. Posicionamiento (cómo se vende)

- **Ángulo primario:** "seguro + ahorro de consultoría" (ROI, evitar $500/h), **no**
  solo "miedo a la multa". Razón: el deadline puede aplazarse y el miedo se enfría;
  el ahorro y la tranquilidad no.
- **Ángulo secundario:** obligación inevitable con ventana algo más larga → hay
  tiempo para construir bien.
- **Land-and-expand:** EU AI Act → normas sectoriales → leyes de IA de EE.UU. → ISO 42001.

## 6. Por qué ahora / contexto regulatorio

- **ACTUALIZADO (2026):** el **Digital Omnibus on AI** ya se ADOPTÓ (acuerdo 6–7 may 2026,
  Parlamento 16 jun, Consejo 29 jun; pendiente solo de publicación en el DOUE). El deadline
  de obligaciones de **alto riesgo (Anexo III) se movió de 2 ago 2026 → 2 dic 2027** (y a
  2 ago 2028 para IA embebida en productos del Anexo I). Certeza alta. → **amplía el tiempo
  para construir, no lo cierra.** El mensaje comercial se ajusta de "urgencia inmediata" a
  "obligación inevitable con ventana más larga" (vender preparación + ahorro, no miedo a multa).
- Leyes estatales de IA en EE.UU. sumándose.
- Mercado de software de gobernanza de IA: **$492M (2026) → $15.8B (2030)**, ~30–36% CAGR.

## 7. Stack técnico y decisiones de arquitectura

- **Frontend/Framework:** Next.js **16** (App Router, Turbopack) + React **19** + TypeScript.
- **Estilos:** Tailwind CSS **v4** (config por CSS con `@theme` en `globals.css`).
  ⚠️ v4 elimina tokens `@theme` no usados por ninguna clase → para color inline usa mapa de hex.
- **Diseño UI:** Magic Patterns (MCP) para explorar diseño creativo/minimalista y original.
- **Docs de librerías:** Context7 (MCP) — consultar SIEMPRE antes de asumir APIs.
- **Despliegue objetivo:** Vercel (por confirmar).
- **Datos/Backend:** **Supabase** (Postgres + Auth + RLS) — DECIDIDO. Región **UE**.
  Aislamiento multi-tenant por `organization_id` con RLS; audit-trail inmutable por triggers.
  Un usuario puede pertenecer a **varias organizaciones** (N). Capa de datos `src/lib/data`
  con switch demo/real (`isSupabaseConfigured`). Migraciones en `supabase/migrations/`.
  Guía: `docs/supabase.md`.

> Toda dependencia o API se verifica con Context7 antes de escribir código contra ella.

## 8. Principios de diseño (marca y UI)

- **Creativo / minimalista pero original.** Nada de plantillas genéricas.
- **Confianza y seriedad** — es un producto de compliance: transmitir rigor, claridad
  y control. Estética "enterprise moderno", no "startup de juguete".
- Jerarquía visual clara, mucho espacio en blanco, tipografía sólida, acento de color
  contenido.
- Accesibilidad (contraste, foco, semántica) desde el día uno.
- Consistencia total: los componentes se ven como un mismo sistema.

## 9. Método de trabajo (el loop)

1. **Consultar** este MEMORY.md.
2. **Planear** (dividir en subtareas; usar subagentes especializados de `.claude/agents/`).
3. **Ejecutar** el incremento más pequeño y valioso.
4. **Verificar** (tests / revisión / correr la app).
5. **Checkpoint** en decisiones clave → consultar al fundador.
6. **Registrar** decisiones y correcciones aquí.
7. Repetir hasta el resultado esperado.

Nivel de autonomía acordado: **checkpoints en decisiones clave** (arquitectura,
diseño, nombre, features grandes); autónomo en lo demás.

## 10. Bitácora de decisiones y correcciones

> Cada entrada: fecha · qué se decidió/corrigió · por qué.

- **2026-07-18** · **Foso — Incrementos 2 y 3: registro de auditoría de sesgo (NYC LL144) + dossier.**
  - **Incremento 2 (registro con caducidad):** migración **0019** (campos en `ai_systems`: `is_aedt`,
    `last_bias_audit_date`, `independent_auditor_name`, `auditor_independence_confirmed`,
    `bias_audit_summary_url`, `summary_published_date`; +setup.sql). Lógica en `src/lib/bias-audit.ts`:
    estado (no_aplica/sin_auditoria/vencida/por_vencer/vigente), **caducidad rotatoria de 12 meses por
    herramienta**, umbral `BIAS_AUDIT_WARN_DAYS=60`, publicación comprobada aparte del estado. Getter
    `getSystemBiasAudit` (supabase con **fallback seguro** si faltan columnas; mock null) + action
    `saveBiasAudit` (Attesta REGISTRA, no audita). `BiasAuditBadge` (estado + cuenta atrás). Sección en la
    ficha del sistema (`inventario/[id]/editar`, `force-dynamic`) para registrar la evidencia.
  - **Incremento 3 (dossier):** el dossier del sistema muestra, para un AEDT, la sección "Auditoría de sesgo —
    EE. UU. (NYC LL144)" con estado+countdown, auditor, publicación y disclaimer. `DossierData.biasAudit`
    poblado por supabase (desde `row.*`, seguro) y mock (`SAMPLE_BIAS_AUDITS` de ejemplo). **Verificado con
    captura en modo demo** (badge "Próxima a vencer · vence en 14 días").
  - **BUG pre-existente corregido (destapado al verificar):** `getCurrentUser` lanzaba en modo demo
    (`createClient` exige credenciales) → rompía dossier/informe y secciones con PaidGate en demo. Ahora
    devuelve null si `!isSupabaseConfigured`. La nueva `dashboard/error.tsx` capturó el fallo (validó el pulido).
  - **PENDIENTE del fundador:** aplicar **migración 0019** en el SQL Editor (aditiva y segura). Sin ella, la
    sección de auditoría de sesgo simplemente no aparece (degradación segura). **Foso = 3 incrementos COMPLETOS.**
- **2026-07-18** · **Foso — Incremento 1: policy pack "Contratación con IA — EE. UU." (APROBADO por el fundador).**
  El fundador dio luz verde a ampliar el foso con el 2º marco (leyes US de contratación con IA). Hallazgo: el
  **radar US ya existía** (NYC/IL/CO/EEOC con contenido verificado) + jurisdicciones + UI multi-marco → solo
  faltaba hacerlo accionable. Construido:
  - **Nuevo pack `policy-packs/us-hiring.ts`** (11 controles del **deployer**, verificados por el experto contra
    DCWP/NYC Rules + Illinois GA): NYC LL144 (identificar AEDT §5-300, auditoría de sesgo independiente <12m
    §5-301, publicar resumen §5-302, aviso al candidato ≥10 días hábiles §5-303) + Illinois HRA HB 3773 (aviso
    de IA, efecto discriminatorio/proxy ZIP) + AIVIA (consentimiento §42/5, borrado 30d §42/15, reporte demográfico
    §42/20) + baseline federal (Title VII/ADA/ADEA). **Encuadre clave: el deployer ES el obligado directo** (sin
    reencuadre provider); **Attesta REGISTRA la evidencia, NO audita ni certifica** (auditor independiente);
    controles territoriales → cada uno con su `conditional` de aplicabilidad; todo "orientativo".
  - **Infra de packs generalizada:** `policy-packs/types.ts` (tipos + `conditional`, `tag`, `note`) e `index.ts`
    (`POLICY_PACKS` + `getPolicyPack`); `rrhh.ts` migrado a tipos comunes; `applyPolicyPack` ahora por `packId`;
    `/dashboard/packs` lista AMBOS packs con la condición de cada control.
  - **2 erratas de cita corregidas** en el radar (halladas por el experto): NYC resumen publicado §5-303→**§5-302**;
    AIVIA borrado 820 ILCS 42/10→**/15**; HB 3773 → **Public Act 103-0804**. Build/lint/tsc verdes; desplegado.
  - **SIGUIENTE — Incremento 2 (requiere migración del fundador):** registro de evidencia de auditoría de sesgo con
    **caducidad rotatoria de 12 meses por herramienta** (campos en `ai_systems`: `is_aedt`, `last_bias_audit_date`,
    `independent_auditor_name`, `auditor_independence_confirmed`, `bias_audit_summary_url`, `summary_published_date`;
    derivados `next_bias_audit_due` = fecha+12 meses y `audit_status` sin_auditoria/vencida/por_vencer/vigente,
    umbral `BIAS_AUDIT_WARN_DAYS`). Publicación se comprueba aparte del estado de auditoría (no colapsar en un
    semáforo). Countdown `force-dynamic`, orientativo. Luego Incremento 3 (superficie en dossier/informe).
- **2026-07-18** · **Lote de pulido/confianza (1ª tanda de la auditoría de calidad).** El fundador pidió
  "pulido y confianza" + "ampliar el foso". Auditoría (subagente Explore) → arreglado lo de severidad ALTA:
  - **Server Actions dejaban de "fingir éxito":** `data/actions.ts` (createAiSystem, updateAiSystem,
    deleteAiSystem, createGapItem, deleteGapItem, updateGapStatus, applyPolicyPack, seedSampleData) y
    `team-actions.ts` (updateMemberRole, removeMember, revokeInvitation) ahora **comprueban el `error`**
    de Supabase y redirigen a un toast de error en vez de mostrar "✓ guardado" siempre. `updateGapStatus`
    además da feedback de éxito (antes: ninguno). Crítico en un producto de compliance ("lo guardé" = verdad).
  - **Toaster con tono por tipo** (`Toast.tsx`): éxito (verde/sello), **error (rojo/triángulo, `role=alert`)**,
    info (neutro). Antes TODO salía verde de éxito, incluidos los errores (team-error, cand-error, etc.).
    Nuevas claves: `system-error`, `gap-error`, `gap-updated`, `pack-error`, `seed-error`.
  - **Faltaban estados de carga y error:** nuevos `dashboard/loading.tsx` (esqueleto) y `dashboard/error.tsx`
    (frontera de error con marca + reintentar). Antes: pantalla en blanco / error genérico de Next.
  - **Remates:** empty-state en "Requieren atención" del resumen; copy de demo del sidebar menos "a medio hacer".
  - **DIFERIDO de la auditoría** (ver PENDIENTES): (a) **copy prohibido** en textos estáticos legales
    (recommendations.ts, regulatory-watch.ts, rrhh.ts, mock-data.ts) — delicado, hay que neutralizar solo
    los reales sin romper exactitud (algunos "marcado CE" son referencia correcta a obligación del proveedor);
    se revisa con el experto. (b) `window.confirm` nativo en borrados → modal propio. (c) TODOs de andamiaje.
- **2026-07-18** · **[CHECKPOINT PENDIENTE] Recomendación del experto para ampliar el foso.** Consultado el
  `compliance-domain-expert`: el 2º marco de mayor valor/menor riesgo = **leyes de EE. UU. de contratación con
  IA** (encaja con la cuña RRHH y, a diferencia del AI Act aplazado a dic-2027, **ya están en vigor**):
  **NYC Local Law 144** (auditoría de sesgo por tercero independiente + notificación al candidato) y
  **Illinois HB 3773** (en vigor 1 ene 2026, responsabilidad objetiva). **Colorado (SB 205→SB 189, aplazada a
  2027) y EEOC (guía retirada) = solo eventos de radar**, no módulo. Encuadre clave: aquí el **deployer ES el
  obligado directo** (más limpio que el AI Act) y **Attesta REGISTRA la evidencia de la auditoría independiente,
  NO la realiza ni certifica** (refuerza "Attesta no certifica"). NO construir aún: motor propio de bias-testing
  (pasivo legal), ISO 42001/NIST (voluntarios), shadow-AI (otra tecnología, secuenciar después). Reutiliza
  `regulatory-watch.ts` + nuevo `policy-packs/` + modelo de evidencia. **Falta el visto bueno del fundador**
  sobre el alcance antes de construir contenido legal.
- **2026-07-18** · **Diferenciación de planes por acceso (enforcement real, 3 niveles).** Hasta ahora el
  paywall era binario y solo se activaba con Stripe → todos veían todo. Ahora el acceso se rige por un
  **plan efectivo** por organización: `free` (Diagnóstico) < `preparacion` < `enterprise`.
  - **Nuevo `src/lib/billing/plan.ts`:** `getOrgPlan(orgId)` (cache) resuelve el nivel: modo demo →
    `enterprise` (muestra completa); **staff de Attesta (`platform_admins`) → `enterprise`** siempre
    (así el fundador NO se autobloquea); **suscripción Stripe activa → mín. `preparacion`**; si no, la
    columna `organizations.plan` (por defecto `free`). `orgHasTier(org, req)` compara por rango.
  - **Degradación segura:** si la columna `plan` aún no existe (migración 0018 sin aplicar), devuelve
    `enterprise` → nadie se bloquea. **El bloqueo por plan solo empieza al aplicar 0018.**
  - **Migración `0018_org_plan.sql`** (⚠️ el fundador la aplica; aditiva, sin drop): `organizations.plan`
    text default `'free'` + check. Concatenada en `setup.sql`. Incluye SQL de ayuda para elevar una org
    (`update organizations set plan='enterprise'/'preparacion' where id=...`) y para hallar el id por email.
  - **Gating actualizado:** `PaidGate` ahora acepta `requires` (default `preparacion`) y usa `orgHasTier`.
    Secciones de pago = **gap, plan, packs, vigilancia, equipo, actividad** (layouts) + **informe** y
    **dossier** (gate inline). Libres en `free`: **Resumen, Inventario, Riesgo**. (Coincide con la
    comparativa de la landing.) Nuevos layouts en `equipo/` y `actividad/`.
  - **UX:** la barra lateral muestra un **candado** en las secciones por encima del plan (siguen siendo
    clicables → llevan al paywall). El `Paywall` distingue nivel (Preparación / Enterprise). La página
    `/dashboard/facturacion` muestra el **nivel real** (Diagnóstico/Preparación/Enterprise) y su estado.
  - **Limpieza:** se retiraron `orgHasAccess`/`isBillingEnforced` de `subscription.ts` (su lógica vive
    ahora en `plan.ts`). Build/lint/tsc verdes.
  - **PENDIENTE del fundador:** aplicar **0018** en el SQL Editor. Su cuenta es `platform_admin` → conserva
    acceso completo automáticamente. Para dar Preparación/Enterprise a un cliente sin Stripe: `update`
    manual (ver comentarios de 0018). Con Stripe activo, la suscripción sube a Preparación sola.
- **2026-07-18** · **3ª tanda de detalles.** (1) Guía de primer login: los mini-ejemplos ahora
  animan por dentro (filas/KPIs escalonados, barras que se rellenan; keyframes `guide-row`/`guide-bar`,
  respeta reduce-motion). (2) **Umbral orientativo de preparación** `AUDIT_READY_THRESHOLD = 80`
  (en `mock-data.ts`, ajustable en un sitio) + `isAuditReady`; el `Meter` dibuja una marca de objetivo;
  se muestra en resumen (hint + caption "no es un juicio de cumplimiento"), inventario y demo. (3) Landing:
  **tabla comparativa** de planes (Diagnóstico/Preparación/Enterprise) capacidad por capacidad, columna
  Preparación resaltada. (4) **Demo `/demo`**: "Volver al sitio" visible también en móvil + **ThemeToggle**
  (claro/oscuro). Precio del plan = **$350 USD/mes** (cambiado desde €390). Stripe sigue construido y
  dormido (pendiente: el fundador lo configura desde una computadora, en modo Test).
- **2026-07-18** · **2ª tanda de mejoras + cobro por suscripción (Stripe).**
  - **Informe/dossier theme-aware:** dejaron de forzar blanco en pantalla (se veía informe
    claro sobre panel oscuro). Ahora usan tokens (`bg-paper-raised`, `--tone-*-fg`) y `@media
    print` fuerza claro SOLO al imprimir. Badges de riesgo → componente `RiskBadge`.
  - **AccountMenu** (barra lateral): avatar+iniciales, nombre+correo, menú con "Plan y
    facturación", "Ir al sitio público", "Cambiar de cuenta" (→login) y "Cerrar sesión".
    Nueva action `switchAccount()`.
  - **Guía de primer login** ahora con **mini-ejemplos visuales de UI** por sección.
  - **Verificación de correo por código (OTP):** tras signup (sin sesión) se pide el código;
    `verifyOtp(type='signup')` → sesión → onboarding; reenviar (`auth.resend`) + cambiar correo.
    **REQUIERE** que la plantilla "Confirm signup" de Supabase incluya `{{ .Token }}` (pendiente
    del fundador).
  - **Pagos = Stripe** (decisión del fundador). Alcance = **suscripción completa con bloqueo**.
    **Construido (env-gated, OFF hasta configurar):** migración **0017** (tabla `subscriptions`
    1/org + RLS + `org_has_active_subscription`), `src/lib/stripe/*` + `src/lib/billing/*`
    (`getOrgSubscription`, `orgHasAccess`, `isBillingEnforced` = supabase+stripe configurados),
    Server Actions `startCheckout`/`openBillingPortal`, webhook `/api/stripe/webhook`
    (service_role sincroniza estado), página `/dashboard/facturacion`, y **paywall** por plan
    (layouts en gap/plan/packs/vigilancia + gate en informe/dossier; inventario+riesgo libres).
    **El bloqueo solo se activa cuando `STRIPE_SECRET_KEY`+`STRIPE_PRICE_ID` estén en Vercel.**
  - **⚠️ SEGURIDAD:** el fundador pegó una **`sk_live_` en el chat** → se le pidió **rotarla**
    (Stripe → Developers → API keys → Roll). Las claves van SOLO a env de Vercel, nunca al repo.
  - **PENDIENTE del fundador:** (1) rotar `sk_live`; (2) crear Producto/Precio 350 USD/mes en Stripe
    y su webhook → añadir a Vercel `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
    `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (+ confirmar `SUPABASE_SERVICE_ROLE_KEY`);
    (3) aplicar migración **0017**; (4) plantilla "Confirm signup" con `{{ .Token }}`.
    Recomendado: probar TODO en **modo Test** de Stripe antes de pasar a live.
  - **Item 7 ✅ (hecho):** demo pública recortada a **muestra** en **`/demo`** (inventario + riesgo
    abiertos con datos mock; gap/plan/vigilancia/PDF como tarjetas bloqueadas con CTA de registro;
    "Explorar la demo" del hero → `/demo`). **Diferenciación de planes** en Pricing (gratis marcado
    como muestra con límites explícitos; Preparación "Todo lo gratis + desbloqueas:"; Enterprise idem).
  - **Verificación de correo → DESACTIVADA por ahora** (decisión del fundador): Supabase no deja
    editar plantillas sin SMTP propio, y el envío a cualquiera necesita dominio. Se apagó "Confirm
    email" en Supabase → el registro entra directo (la app ya lo soporta; el flujo de código OTP
    queda construido para cuando haya dominio+SMTP). **Nuevo buzón `attesta.io.mx@gmail.com`** =
    contacto del footer + destinatario de notificaciones de waitlist (ojo Resend: solo llega si es
    el correo de la cuenta Resend o hay dominio verificado) + platform_admin (SQL aplicado por el fundador).
- **2026-07-18** · **Lote de mejoras post-deploy (revisión a fondo del fundador).** Sobre la app en
  producción (`attesta-io.vercel.app`, modo conectado). Hechos y desplegados:
  - **Registro con identidad (item 3):** el signup pide **Nombre, Primer apellido, Segundo apellido**
    (opcional) + **Confirmar contraseña**; se guardan en `user_metadata` (`nombre`, `apellido_paterno`,
    `apellido_materno`, `full_name`, `display_name`). La barra lateral muestra el **nombre como apodo**
    sobre el correo (los roles en Equipo siguen por correo). `AuthForm.tsx` + `dashboard/layout.tsx`.
  - **Guía de primer login (item 7):** overlay animado (`WelcomeGuide.tsx`, 7 pasos, keyframe
    `guide-step`, respeta reduce-motion) que recorre cada apartado, con **Omitir**. Se muestra **solo la
    primera vez**: marca `user_metadata.guide_seen=true` (persiste por cuenta) + guardia en localStorage
    (anti-parpadeo). El layout la monta solo si `guide_seen !== true`.
  - **Waitlist → aviso al fundador:** `submitWaitlist` Server Action (`src/lib/landing/waitlist-actions.ts`)
    inserta en `waitlist` y **notifica por email al fundador** (`luisscmorenod@gmail.com`) vía **Resend**,
    **env-gated** (`RESEND_API_KEY`; sin dominio verificado se envía desde `onboarding@resend.dev` al propio
    correo del fundador, que Resend permite). Sin la key, la solicitud igual se guarda; nunca rompe el alta.
  - **Latencia (item 6):** `vercel.json` fija región de funciones en **`fra1`** (junto a Supabase UE, evita
    ida/vuelta transatlántica) + **dedup de `auth.getUser()`/org activa por request** con React `cache()`
    en `context.ts` (antes 3 llamadas seriadas por carga de dashboard).
  - Ya estaban de un lote previo (Batch A): PDF siempre en claro al imprimir (item 1), cerrar sesión +
    "Ir al inicio" en la barra (items 2/4), datos de contacto en el footer (item 8), toasts con "x" y
    auto-cierre (item 10), y fix de URLs muertas de Illinois (item 9, **migración 0016 pendiente de aplicar**).
  - **PENDIENTE del fundador:** (1) aplicar `0016_fix_illinois_urls.sql` en SQL Editor. (2) Para el aviso de
    waitlist: crear cuenta gratis en **resend.com**, generar API key y añadir `RESEND_API_KEY` en Vercel.
  - **DIFERIDO al final:** item 5 (mejorar la landing con ejemplos + animaciones).
- **2026-07-17** · Se define la tesis (compliance de IA mid-market) y el stack
  (Next.js + TypeScript + Tailwind). Autonomía: checkpoints en decisiones clave.
- **2026-07-17** · **Nombre = Attesta**. **MVP = Inventario + Riesgo + Gap (PDF)**.
  **Arranque = landing + app shell primero; backend después.**
- **2026-07-17** · Scaffold Next.js 16 + React 19 + Tailwind v4. Sistema de diseño
  (jade/ivory/sello) + **landing completa** (hero, problema, 3 módulos, por qué ahora,
  cómo funciona, waitlist) + **dashboard-esqueleto** (resumen, inventario, riesgo, gap)
  con datos de ejemplo. Build y lint en verde; verificado con capturas.
- **Aprendizaje:** Tailwind v4 tree-shakea variables `@theme` no referenciadas por
  clases → los colores inline por CSS var salían vacíos. Solución: mapa de hex en el
  componente. (Ver `src/app/dashboard/page.tsx`.)
- **2026-07-17** · **Revisión regulatoria de `src/lib/risk-assessment.ts`** (compliance-domain-expert).
  Faltaba una práctica prohibida del Art. 5: **predicción de delitos basada solo en perfilado**
  (Art. 5(1)(d)) → añadida. Afinados los matices de reconocimiento de emociones (excepción
  médica/seguridad) e identificación biométrica remota en tiempo real (fines policiales +
  excepciones tasadas). Añadida cita de **obligaciones del deployer (Art. 26)** en alto riesgo,
  clave porque el ICP son deployers, no providers. Verificado contra artificialintelligenceact.eu
  (Arts. 5 y 50). Anexo III y excepciones del Art. 6(3) ya eran correctos.
- **2026-07-17** · **Asistente de clasificación de riesgo** construido (`/dashboard/riesgo/evaluar`):
  cuestionario guiado de 3–4 pasos (prohibido → ámbito Anexo III → excepción Art. 6(3) → transparencia)
  con resultado (nivel + racional + obligaciones + citas). Aviso cuando alto riesgo + Art. 50 se suman.
  Lógica en `src/lib/risk-assessment.ts`, verificada por el subagente. Build y lint en verde; capturas OK.
- **Caveats del experto para el futuro** (no bloquean, pero mejoran el producto):
  1. La API devuelve un solo nivel; un sistema puede ser alto + limitado a la vez (transparencia se suma).
  2. Distinguir el **rol del cliente** (provider vs deployer): el ICP son deployers → foco en Arts. 26, 27, 50.
  3. La excepción del Art. 6(3) debe **documentarse** (Art. 6(4)+49(2)) → generar esa evidencia, no solo concluir.
- **2026-07-17** · **Backend Supabase — fundación lista para conectar** (diseño por
  `product-architect`). Migraciones SQL (`supabase/migrations/`): esquema (organizations,
  memberships, ai_systems, risk_assessments, gap_items, audit_log), RLS multi-tenant con
  funciones pivote `security definer`, audit-trail inmutable por triggers, y RPC de onboarding.
  Capa `src/lib/data` con switch demo/real: el dashboard ya lee de la fachada; **la demo
  sigue idéntica** sin credenciales. Clientes `@supabase/ssr` (browser/server). Build/lint verdes.
  Defaults adoptados: región UE, N orgs por usuario, audit por triggers (hash-chain en fase 2).
  **Falta credenciales del fundador** para activar (URL + anon key) + auth UI + write-path.
- **2026-07-17** · **Auth UI + middleware de sesión**. Pantallas `/login` (login+registro
  con toggle) y `/onboarding` (crear organización vía RPC), middleware que refresca sesión
  y protege `/dashboard` (no-op en modo demo), logout + email en el sidebar. Enlace "Entrar"
  en la landing. En MODO DEMO todo sigue abierto con datos de ejemplo; en modo conectado exige
  sesión + organización. Build/lint verdes; login verificado con captura (env dummy).
- **2026-07-17** · **Conexión Supabase + write-path (alta de sistemas)**. Proyecto Supabase
  del fundador conectado vía `.env.local` (URL + anon key; NO versionado). Verificado: red OK,
  anon key válida (auth settings 200). Esquema pendiente de aplicar por el fundador
  (`supabase/setup.sql` = las 4 migraciones concatenadas, para pegar en SQL Editor).
  Nuevo write-path: `src/lib/data/actions.ts` (`createAiSystem`, `saveRiskAssessment`) y
  página `/dashboard/inventario/nuevo` (form de alta, con guardas de modo demo). Botón
  "+ Registrar sistema" enlazado. Build/lint verdes.
  Ojo: la anon key NO permite DDL → el esquema lo aplica el fundador desde el panel.
- **2026-07-17** · **Verificación end-to-end del backend (API vía proxy)**. Se probó el flujo
  completo contra el Supabase real: signup → RPC `create_org_and_owner` → insert `ai_systems`
  → read aislado por org → **audit-trail** registrando cada cambio → inmutabilidad (RLS bloquea
  UPDATE/DELETE del audit_log) → **aislamiento multi-tenant** (usuario B ve `[]`). Todo ✅.
- **BUG encontrado y corregido en la verificación:** `write_audit` casteaba `::audit_action`
  sin esquema; con `search_path=''` no resolvía y rompía el onboarding. Fix: `::public.audit_action`
  (0003 + parche 0005 + setup.sql). Lección: **funciones `security definer` con `search_path=''`
  deben cualificar TODO con esquema** (tipos incluidos), no solo tablas.
- **2026-07-17** · **Cargador de datos de ejemplo** (`seedSampleData`): empty-state del inventario
  con botón "Cargar datos de ejemplo" (upsert idempotente por `code` + brechas enlazadas).
  Verificado a nivel de BD (upsert 201, gap 201, idempotencia OK).
- **Config Supabase requerida (fundador):** Auth → Email provider habilitado, "Allow new users
  to sign up" ON, "Confirm email" OFF (para MVP). Anon key + URL en `.env.local` (no versionado).
  ⚠️ El build DEBE hacerse con `.env.local` presente para inlinear `NEXT_PUBLIC_*` en el cliente.
- **Limitación del entorno:** el Chromium headless de Playwright NO usa el proxy de salida, así que
  no puede alcanzar Supabase → la verificación del flujo real se hace por API con `curl` (sí usa proxy).
- **2026-07-17** · **#1 Guardar clasificación de riesgo**: el wizard ahora persiste el
  resultado contra un sistema (selector + `saveRiskAssessment`) y actualiza `risk_level`.
  Verificado e2e (insert + update + audit). **#2 Export PDF del gap assessment**: vista de
  informe con formato de documento (`/dashboard/gap/informe`) + impresión a PDF del navegador
  (print CSS, sidebar oculto, marca Attesta). Verificado con captura y PDF real generado.
  Enfoque elegido: print-to-PDF (sin dependencias pesadas) en vez de @react-pdf/renderer.
- **2026-07-17** · **Motor de recomendaciones + Plan de acción** (idea del fundador: dar
  sugerencias de mejora, no solo diagnóstico). `src/lib/recommendations.ts` convierte nivel de
  riesgo + brechas en recomendaciones accionables (título, acción, artículo, prioridad, esfuerzo).
  Nueva vista `/dashboard/plan` (puntos críticos + priorizado + sistemas afectados) y sección
  "Puntos críticos y próximos pasos" en el asistente. Verificado por `compliance-domain-expert`.
- **Corrección clave del experto (rol provider vs deployer):** varias acciones estaban redactadas
  como si el cliente FABRICARA el sistema. Reescritas para el DEPLOYER: Arts. 9/10/11/12/13/15 →
  "verifica que el proveedor lo hizo / exige evidencia" (prioridad media); Arts. 14 y 26 críticas
  (deberes propios del deployer); **Art. 12** añade conservar logs ≥6 meses (Art. 26.6); **Art. 27
  (FRIA)** con alcance real (organismos públicos + Anexo III 5(b)/5(c): crédito y seguros vida/salud);
  **Art. 49** corregido: un deployer privado mid-market normalmente NO registra (lo hace el proveedor).
  Regla reforzada: distinguir SIEMPRE provider vs deployer en textos regulatorios (nuestro ICP = deployer).
- **2026-07-17** · **DECISIÓN DE PRODUCTO CLAVE (encuadre legal): Attesta NO certifica.**
  Motivo (planteado por el fundador): un cuestionario autodeclarado no puede sustentar un
  "aprobatorio/certificado" sin exponernos a responsabilidad. Encuadre correcto validado por
  el experto: Attesta es **herramienta de autoevaluación + preparación para auditoría + gestión
  de evidencia** (system of record), NO un organismo notificado. Bajo el AI Act solo un
  **organismo notificado** certifica (Anexo VII); el resto es autodeclaración del **proveedor**
  (Anexo VI, Declaración UE de Conformidad + marcado CE). Nuestro ICP (deployer) ni siquiera
  certifica: cumple deberes de uso (Art. 26) y debe **demostrarlos con evidencia**.
  - **Lenguaje PROHIBIDO en UI/PDF:** certificado, aprobado/apto/pasa, cumple/compliant,
    garantiza, sello de conformidad, marcado CE, validado/auditado por Attesta, libre de riesgo,
    asesoría/dictamen legal.
  - **Lenguaje SEGURO:** autoevaluación, preparación para auditoría, evidencia declarada,
    % listo / grado de preparación, brechas identificadas, clasificación **orientativa/indicativa**,
    obligaciones aplicables (orientativo), registro de evidencia, plan de remediación sugerido.
  - **Regla de copy:** verbos de la ORGANIZACIÓN ("tu organización declara…"), no de Attesta
    ("Attesta certifica…"). Evitar imperativos legales ("debes…") sin "(orientativo)".
  - **Puntaje:** "cumplimiento %" → **"preparación para auditoría / % listo"**.
  - **Modelo de evidencia** (Parte B, siguiente): por respuesta capturar quién atesta (persona+rol),
    fecha, estado, **nivel de respaldo: Declarado / Con evidencia / Revisado**, documento/enlace,
    artículo, sistema, nota. Indicador honesto "% de controles con evidencia".
  - **Versionar** cuestionario + fecha regulatoria del snapshot (la norma cambia — lo del Omnibus
    lo prueba). Invitar a re-evaluar ante cambios. Disclaimers en resultado, PDF y pie.
  - Disclaimers y ToS definitivos: **revisar con abogado UE** antes de producción.
- **2026-07-17** · **Captura de evidencia (Parte B del encuadre).** Al guardar una
  autoevaluación se registra **responsable que atesta** + **evidencia (nota/enlace)**, y se
  deriva el nivel de respaldo: **Declarado** (sin soporte) vs **Con evidencia** (hay nota/enlace)
  vs **Revisado** (futuro). Migración `0006_evidence.sql` (columnas en risk_assessments y
  ai_systems). Columna "Respaldo" en el inventario (EvidenceBadge). Ataca el riesgo de "casillas
  a favor sin cumplir": un check sin evidencia queda visible como "Declarado", no como aprobado.
  Pendiente: el fundador aplica 0006 en su instancia para activar el guardado con evidencia.
- **2026-07-17** · **Rediseño UI (3 fases).** (1) Fundación de movimiento: `Reveal`
  (scroll-reveal), `card-lift`, `float-soft`, todo respetando `prefers-reduced-motion`.
  Landing rediseñado: hero con mockup (`HeroPreview`), `TrustStrip`, `Pricing`, `FAQ`,
  favicon propio (`icon.svg`). (2) Dashboard: `RiskDonut`, micro-interacciones, medidores
  animados, sidebar con hover sutil. (3) Auth split-screen (`AuthShell`) para login/onboarding,
  sello en el formulario, y **toasts** sutiles (`Toaster`, disparados por `?toast=` tras server
  actions). Regla de diseño: animaciones **sutiles y suaves, nunca infantiles**.
- **2026-07-17** · **Modo oscuro.** Tokens de color conmutables por `data-theme` (override en
  `[data-theme="dark"]` + `@media prefers-color-scheme`). Sistema de **tonos** semánticos
  (`--tone-*`: danger/warn/gold/good/info/neutral) para que badges/estados adapten claro↔oscuro.
  `ThemeToggle` (usa `useSyncExternalStore`) en header y sidebar; script anti-parpadeo en el
  layout; respeta la preferencia del sistema. El informe PDF se mantiene claro siempre (documento).
  **Regla:** todo color semántico nuevo va por token o tono, NUNCA hex hardcodeado en clases.
- **Auth validación**: mensajes en español (traductor de errores de Supabase), validación por
  campo, mostrar/ocultar contraseña. Hueco pendiente: flujo "olvidé mi contraseña".
- **2026-07-17** · **Enfoque vertical RRHH (cuña) en el landing + demo.** Landing reposicionado
  a reclutamiento: eyebrow "Gobernanza de IA para RRHH", H1 "Contrata con IA sin miedo a la
  auditoría", subhead de cribado/entrevistas/scoring, TrustStrip con casos de uso de selección,
  nueva sección `RecruitmentFocus` (6 casos con su nivel de riesgo) y FAQ de RRHH. Demo (mock-data)
  reescrita a sistemas de reclutamiento (cribado CVs, ranking, entrevistas vídeo, chatbot, test
  psicométrico, agenda). Base regulatoria: IA de empleo/selección = alto riesgo (Anexo III).
  Siguiente para el vertical: "policy pack RRHH" (controles/obligaciones específicos de selección).
- **2026-07-17** · **CRUD completo de brechas.** Añadir (`/dashboard/gap/nuevo` + `createGapItem`)
  y eliminar (`deleteGapItem`, con confirmación) brechas, además del cambio de estado ya existente.
  Botón "+ Añadir brecha" y papelera por fila (modo conectado). Verificado e2e por API.
- **2026-07-17** · **Historial de evaluaciones por sistema.** En la página del sistema
  (`/dashboard/inventario/[id]/editar`) se muestra la línea de tiempo de sus `risk_assessments`
  (nivel, respaldo, quién atestó, fecha; la más reciente marcada "Vigente"), + botón "Evaluar"
  (deep-link `?system=`). `getSystemAssessments` en la capa de datos. Cierra el círculo de
  "system of record de evidencia". Verificado e2e por API.
- **2026-07-17** · **Sello nuevo + inversión por tema.** Sello (monograma A + check) como imagen
  (`public/sealmark.png` claro, `sealmark-dark.png` invertido). SealMark usa `var(--seal-img)`.
- **2026-07-17** · **Escritura completa (deja de ser solo lectura).** Editar sistema
  (`/dashboard/inventario/[id]/editar` + `updateAiSystem`), borrar sistema (`deleteAiSystem`,
  cascada a evaluaciones/brechas, con confirmación cliente), y cambiar estado de brecha
  (control segmentado Falta/Parcial/Cubierto + `updateGapStatus`). AiSystem ahora lleva `dbId`
  (uuid real) para rutear editar/borrar; solo visible en modo conectado. Verificado e2e por API.
- **2026-07-17** · **Policy pack RRHH** (`src/lib/policy-packs/rrhh.ts`): 14 controles de
  reclutamiento; vista `/dashboard/packs` + `applyPolicyPack` (precarga los controles como
  gap_items de un sistema, sin duplicar). **Verificado por el experto** con correcciones clave:
  - Reencuadre **provider vs deployer**: sesgo → **normativa antidiscriminación** (Directivas UE
    2000/78, 2006/54, 2000/43 + ley nacional), NO Art. 10 (=proveedor); supervisión → **Art. 26.2**
    (designar) + 14; transparencia al candidato → **Art. 26.11** + GDPR 13/14; logs → **Art. 26.6**;
    documentación → **Art. 26.1** (usar conforme). Del proveedor (Arts. 10/11/12/14/15) se **exige evidencia**.
  - Añadidos: derecho a **explicación (Art. 86)**, exactitud/robustez (26.5), monitoreo/incidentes (26.5),
    conservación de evidencia de decisiones (GDPR 5.2), **DPIA (GDPR 35)**.
  - **AVISO FUERTE:** inferir **emociones en el trabajo** (p. ej. análisis de afecto en vídeo-entrevistas)
    es **práctica PROHIBIDA** salvo fines médicos/seguridad (**Art. 5.1.f**) → control condicional, severidad alta.
  - **FRIA (Art. 27) normalmente NO aplica** a un empleador privado ordinario (solo público / servicios
    públicos / Anexo III 5(b)(c)) → incluido como "N/A" para dejar constancia.
- **2026-07-17** · **Generador de documentación técnica (Capa 3)** — el "reemplaza al consultor".
  Nueva ruta `/dashboard/inventario/[id]/dossier`: **Dossier de gobernanza de IA** por sistema,
  imprimible a PDF (reutiliza el patrón `PrintButton` del informe de gap). Ensamblado
  **determinista** (cero LLM, cero alucinación): 100% anclado en los datos reales del sistema y en
  el texto del EU AI Act ya verificado por el experto. 7 secciones: identificación · clasificación de
  riesgo (racional + respaldo + atestación) · obligaciones aplicables (`OBLIGATIONS_BY_LEVEL`) ·
  controles y brechas · plan de acción priorizado (`recommendationsForLevel`) · historial de
  evaluaciones · declaración de responsabilidad + nota legal (`LEGAL_PDF`). Capa de datos:
  `getSystemDossier(id)` en ambos repos (supabase por uuid, mock por código) + tipo `DossierData`.
  Entradas: enlace "Dossier" por fila en el inventario (demo y conectado, `dbId ?? id`) y botón
  "Generar dossier" en editar sistema. Funciona en modo demo y conectado. Build/lint verdes;
  verificado con capturas (alto riesgo con brechas + plan de 10 acciones, y riesgo mínimo con
  estados vacíos elegantes).
  - **Razón del enfoque determinista** (no LLM): en un producto de compliance el texto legal
    alucinado es un pasivo. El dossier debe ser 100% trazable a los datos del cliente y a normas
    verificadas. Redacción asistida por LLM se puede añadir como capa opcional en el futuro.
- **2026-07-17** · **Vigilancia regulatoria — radar v1 (Capa 7, el foso).** Nueva ruta
  `/dashboard/vigilancia`: catálogo CURADO de eventos del EU AI Act (`src/lib/regulatory-watch.ts`)
  + **motor de relevancia determinista** que mapea cada norma a los sistemas afectados del inventario
  ("afecta a N de tus sistemas", por nivel de riesgo). UI: hero de próximo plazo con cuenta atrás,
  grid de plazos futuros, cronología expandible (qué es / qué significa para ti / qué hacer /
  artículos / fuente oficial / sistemas afectados) con `<details>` nativo (sin JS cliente). Widget
  "próximo hito regulatorio" en el resumen + entrada "Vigilancia" en el sidebar. `dynamic = "force-dynamic"`
  para que el countdown sea fresco. Funciona en demo y conectado. Build/lint verdes; verificado con capturas.
  Mismo principio que el dossier: **contenido curado y trazable, cero LLM en la ruta legal**; la
  automatización futura (agentes Vigía→Analista→Actualizador→Validador con RAG/pgvector) alimentará
  ESTE modelo de datos.
  - **Verificado por el experto de compliance** contra fuentes oficiales. El calendario escalonado,
    el encuadre del Art. 5.1.f (emociones en vídeo-entrevistas) y la atribución Art. 26 (deployer)
    vs Arts. 9–15 (proveedor) ya eran correctos. Correcciones: evento del Omnibus `Art. 111` → **`Art. 113`**
    (el aplazamiento modifica las fechas de aplicación del 113; el 111 son transitorias) y `source` →
    nota oficial del **Consejo 29 jun 2026** (confirma 2 dic 2027 / 2 ago 2028); añadido `Cap. VII (gobernanza)`
    al evento de 2 ago 2025.
  - **Checkpoint del fundador RESUELTO (2026-07-17, por decisión del fundador + experto):**
    (a) **AÑADIDA** la nueva práctica prohibida del Art. 5 introducida por el Omnibus como evento
    `eu-omnibus-art5-intimate` — **imágenes íntimas no consentidas + CSAM** (Directiva 2011/93/UE),
    aplicable **2 dic 2026**, `scope: all`, sanción máxima (35 M€ / 7%). Encuadre honesto: prohibición
    transversal que NO afecta a herramientas de selección salvo que se genere/manipule imagen o vídeo.
    (b) **VERIFICADO el Art. 50:** el Omnibus **NO aplazó** la obligación del deployer (sigue el 2 ago 2026);
    la única gracia (hasta 2 dic 2026) es del **marcado del proveedor (Art. 50.2)** para IA generativa legada.
    Aclarado en el evento + fuente oficial (AI Act Service Desk de la Comisión). Certeza alta.
  - **Caveat pendiente del DOUE:** falta confirmar el **punto/letra exacto** del Art. 5 para la nueva
    prohibición (por eso `articles` cita solo "Art. 5", sin inventar el punto) y reconfirmar la fecha
    del 2 dic 2026 con el texto consolidado. Nota: 2 dic 2027 (alto riesgo) es fecha tope de un mecanismo
    condicional ("stop-the-clock" por normas armonizadas).
- **Pendiente v2 de vigilancia:** persistir "marcar como revisado" (tabla + audit-trail), multi-marco
  (ISO 42001, NIST, leyes estatales EE.UU.), y la automatización de ingesta (los 4 agentes + RAG/pgvector).
- **2026-07-17** · **Bucle de evidencia cerrado.** El asistente de riesgo ya persistía la evaluación
  (`saveRiskAssessment` con atestación + evidencia), pero la evidencia capturada (nota/enlace) **se
  guardaba y nunca se mostraba**: `getSystemAssessments` no la leía. Corregido de punta a punta:
  - `AssessmentRecord` ahora lleva `evidenceNote`/`evidenceUrl`; `getSystemAssessments` (supabase-repo)
    los incluye en el `select`. Verificado contra la BD real vía PostgREST (columnas válidas, 200).
  - Se **muestran** en el historial de la ficha del sistema (`AssessmentHistory`) y en la sección
    "Historial de evaluaciones" del **dossier** (nota + enlace clicable "Ver evidencia").
  - Tras guardar, el asistente hace `router.refresh()` y ofrece un enlace **"Ver dossier del sistema →"**.
  - **Datos de ejemplo de evaluaciones** (`SAMPLE_ASSESSMENTS` en mock-data) para SYS-001/002/005:
    el dossier y el historial ahora cuentan la historia completa en modo demo (bueno para venta/capturas).
  Build/lint verdes; verificado con captura (dossier de "Ranking de candidatos" con historial + evidencia).
  Loop completo: **inventario → evaluar → guardar (atestación + evidencia) → dossier/historial + audit-trail.**
- **2026-07-17** · **Roles / equipo (Capa 6).** Nueva ruta `/dashboard/equipo`: gestión de
  miembros de la organización sobre la fundación multi-tenant ya existente (memberships + RLS).
  - **Migración `0008_invitations.sql`** (⚠️ el fundador debe aplicarla): tabla `invitations`
    (org, email, role, status, unique(org,email)) + RLS (owner/admin), y 3 RPCs `security definer`:
    `invite_member(org,email,role)` (si el email ya tiene cuenta lo añade al instante; si no, deja
    invitación 'pending'; solo un owner puede otorgar owner), `claim_invitations()` (reclama por
    email al registrarse) y `list_org_members(org)` (miembros con email, uniendo `auth.users`).
    Añadida también al `supabase/setup.sql` concatenado.
  - **UI:** lista de miembros (email, RoleBadge, alta), formulario de invitar (owner/admin),
    selector de rol autoenviado, quitar miembro y revocar invitación (con confirmación), sección de
    invitaciones pendientes, y leyenda de roles. Guardas de negocio en las server actions
    (`team-actions.ts`): no dejar la org sin owner, solo un owner gestiona a otro owner.
  - **Claim automático** en el onboarding: un invitado que se registra entra directo a su org.
  - Modo demo: equipo de ejemplo de solo lectura con banner (la gestión requiere backend real).
  - `RoleBadge` nuevo (owner=good, admin=info, member=neutral). Build/lint verdes; demo verificado
    con captura.
  - **BUG encontrado y corregido en la verificación:** `invite_member` casteaba `::member_role[]`
    sin esquema; con `search_path=''` fallaba (`type "member_role[]" does not exist`). Fix:
    `::public.member_role[]` (mismo gotcha que el audit trigger 0005). `list_org_members` y
    `claim_invitations` ya estaban bien.
  - **Verificado e2e por API (2026-07-17):** invitar a email inexistente → 'invited' (pendiente) →
    signup + `claim_invitations` → 1 (entra como admin); reinvitar → 'already_member'; invitar a
    usuario existente → 'added' (alta instantánea); **aislamiento RLS OK** (admin lista miembros;
    member NO ve invitaciones). Fundador aplicó 0008 + re-ejecutó `invite_member` corregida.
  - Futuro: auditar cambios de membership en el audit-trail; selector de organización activa
    (hoy = primera membership).
- **2026-07-17** · **Registro de actividad — visor del audit-trail (Capa 10).** Nueva ruta
  `/dashboard/actividad`: hace visible el `audit_log` inmutable que ya rellenaban los triggers (0003).
  - **Migración `0009_audit_view.sql`** (⚠️ el fundador debe aplicarla): RPC `list_audit_log(org, lim)`
    `security definer` que lee el audit_log y une `actor_id` con el email de `auth.users` (no consultable
    por RLS), guardada por pertenencia a la org. Solo lectura; la inmutabilidad la garantizan los
    triggers `block_mutation` (0003). Añadida al `setup.sql`.
  - **Presentación:** `src/lib/audit.ts` convierte las filas crudas (jsonb) en texto legible en español:
    verbo por acción (creó/actualizó/eliminó), entidad por tabla (sistema/evaluación/brecha/miembro),
    etiqueta de la fila (nombre, requisito, nivel, rol) y **campos cambiados** en updates (mapa de
    columnas→nombre humano, filtrando ruido técnico). UI con feed, filtros por tipo, sello "Inmutable"
    y avatares. `dynamic = "force-dynamic"`.
  - Modo demo: actividad de ejemplo (`SAMPLE_AUDIT`). Build/lint verdes; demo verificado con captura.
  - **Verificado e2e por API (2026-07-17):** con un usuario de prueba se crearon/editaron sistema y
    brecha; `list_audit_log` devolvió las 4 entradas (incluida la membership del alta de org) con
    email del actor, acción y diff correctos (update de ai_systems → `name, risk_level`). Fue a la
    primera. Realiza de forma tangible la tesis "system of record de evidencia".
- **2026-07-17** · **Informe ejecutivo de organización (Capa 10, capstone).** Nueva ruta
  `/dashboard/informe`: PDF de una página para dirección/auditor que resume el estado de TODA la org,
  extendiendo el patrón del dossier del nivel *sistema* al nivel *organización*. Ensamblado
  determinista: 5 KPIs (sistemas, alto riesgo, preparación media, brechas abiertas, % con respaldo),
  distribución de riesgo (barras), sistemas prioritarios (alto riesgo <60%), brechas abiertas
  prioritarias, y próximos plazos regulatorios (reutiliza `upcomingDeadlines`/`affectedSystems`).
  Reutiliza `riskCounts`/`avgCompliance` + `PrintButton` + `LEGAL_PDF`. Entrada: botón "Informe
  ejecutivo" en la cabecera del resumen. Funciona en demo y conectado (sin migración). Build/lint
  verdes; verificado con captura. Es el entregable que el comprador (Legal/RRHH) enseña "hacia arriba".
- **2026-07-17** · **Landing actualizado al producto completo.** El landing se había quedado en los
  3 módulos originales. Cambios: (a) refresco de los 3 módulos core (`Modules`) — **corregido un
  overclaim**: decía "Marcos: AI Act, ISO 42001" cuando solo hacemos EU AI Act → ahora "Mapeo a
  artículos del AI Act"; pilar 3 menciona policy pack + plan por artículo. (b) Nueva sección
  **`Platform` ("El foso")**: "Gobernanza continua, no la foto de un día" con 4 diferenciadores
  (vigilancia regulatoria, dossier/informes automáticos, registro inmutable, equipo con roles).
  (c) Hero y HowItWorks (paso 4) mencionan generar evidencia/dossier y vigilar la norma. FAQ revisado:
  ya era honesto (no certificación, foco deployer, audit-trail) → sin cambios. Build/lint verdes;
  verificado con captura. Principio mantenido: nada de sobre-promesas (multi-marco ISO/NIST sigue
  siendo futuro, no se anuncia).
- **2026-07-17** · **Pulido del landing (2ª tanda).** (a) `HeroPreview` modernizado: sidebar actual
  (incluye Vigilancia/Equipo), cifras consistentes con la demo (6/4/59%) y nueva tira **"Próximo hito ·
  Transparencia (Art. 50) · en 16 días"** → el foso (vigilancia) asoma ya en el mockup del hero.
  (b) `Pricing`: el tier "Preparación" ahora lista **Vigilancia regulatoria** y **Dossier e informe
  ejecutivo (PDF)**. ProblemStats/FAQ ya eran correctos. Build/lint verdes; verificado con capturas.
- **2026-07-17** · **Vigilancia v2 — "marcar como revisado" (acuse de vigilancia).** owner/admin
  pueden marcar cada evento del radar con un estado interno (**Revisado / Plan en marcha / No aplica**),
  dejando evidencia de vigilancia activa. Y como se AUDITA, cada marca aparece en el registro de actividad.
  - **Migración `0010_regulatory_acks.sql`** (⚠️ aplicar; NO da aviso destructivo, es toda aditiva):
    tabla `regulatory_acks` (org, event_id text del catálogo, status, note, unique(org,event_id)) + RLS
    (miembros leen, owner/admin escriben) + **trigger de auditoría** `write_audit`. Añadida al setup.sql.
  - Data: `getRegulatoryAcks()` → `Record<eventId, RegAck>` (mock + supabase). Acción `setEventStatus`
    (`reg-actions.ts`): upsert o borra (status vacío), guarda owner/admin, sin redirect (revalida en sitio).
  - UI: pills de estado (Revisado=good, Plan=info, No aplica=neutral) en hero, tarjetas y cronología;
    en el detalle, control `EventStatusControl` (owner/admin) o badge de solo lectura. `audit.ts` mapea
    `regulatory_acks` → "revisión regulatoria «título del evento»" para que se lea bien en Actividad.
  - Demo: `SAMPLE_REG_ACKS` (Omnibus=Revisado, GPAI=No aplica). Build/lint verdes; demo verificado.
  - **Verificado e2e por API (2026-07-17):** marcar (insert 'reviewed' + nota) → leer por RLS → upsert
    a 'planned' (on_conflict merge) → **ambas operaciones salen en `list_audit_log`** (insert + update
    con `campos=['status']`, filtrando ruido) con el email del actor. Fundador aplicó 0010. Todo ✅.
- **2026-07-17** · **Automatización del foso — Fase A: la espina del pipeline (Capa 7).** El fundador
  eligió automatizar el foso. Principio innegociable: **la automatización PROPONE borradores; nada se
  publica como afirmación regulatoria sin validación humana** (el catálogo curado en código sigue siendo
  la línea base de confianza). Los 4 agentes: **Vigía** (detecta cambios en fuentes, determinista),
  **Analista** (lee el texto vía RAG → redacta borrador, necesita LLM+embeddings), **Actualizador**
  (mapea a nuestro esquema + `affectedSystems`, determinista), **Validador** (**un humano** aprueba/rechaza,
  auditado). El catálogo es **GLOBAL** (misma ley para todos) → el Validador es **personal de Attesta**
  (`platform_admins`), NO un cliente; por eso las tablas del pipeline no llevan `organization_id` y NO
  usan las policies por-org (y no pueden colgar el trigger `write_audit`, que lee `new.organization_id`
  → la trazabilidad va en la propia fila: `reviewed_by/at`, `status`).
  - **Migración `0011_reg_pipeline.sql`** (⚠️ aplicar; toda aditiva, sin `drop`, NO da aviso destructivo):
    `platform_admins` (quién valida; nadie se auto-inserta, alta por SQL) + `public.is_platform_admin()`
    (security definer); `reg_sources` (watchlist global, admin-only); `reg_events` (eventos **publicados**
    por el pipeline; **todo autenticado los lee**, solo admin escribe); `reg_candidates` (cola de
    borradores, admin-only) con `status` draft/approved/rejected/superseded + `provenance` jsonb; RPCs
    **`approve_reg_candidate(cand, event_id)`** (atómico: inserta en `reg_events` + marca aprobado) y
    **`reject_reg_candidate(cand, note)`**, ambos con guard `is_platform_admin`. Añadida al setup.sql.
    **Seed manual:** el fundador debe insertarse como validador → `insert into public.platform_admins
    (user_id) select id from auth.users where email = '<su-email>';`
  - **Read-path:** `regulatory-watch.ts` gana `mergeCatalog(published, curated)` (código SIEMPRE gana ante
    choque de id) y `upcomingDeadlines(now, events?)`. Getters `getRegulatoryEvents()` (base curada +
    `reg_events`), `getRegCandidates()`, `getIsPlatformAdmin()` (mock + supabase, con **fallback seguro**:
    si la tabla aún no existe, radar cae a la base curada y la bandeja no aparece — la app no se rompe
    aunque la migración no esté aplicada). Fachada + tipos `RegCandidate` en `mock-data.ts` (+2 de ejemplo).
  - **UI del Validador:** ruta `/dashboard/vigilancia/candidatos` (bandeja, gated a `is_platform_admin`;
    en demo se enseña con `SAMPLE_REG_CANDIDATES`). Cada candidato muestra impacto/acción/artículos +
    caja de **procedencia** (agente, modelo/"sin LLM", confianza %, fuente, cita) y controles
    **Publicar** (id de evento editable) / **Descartar** (con nota). Acciones `reg-pipeline-actions.ts`
    con toasts `cand-*`. Enlace "Bandeja de validación →" en el header del radar solo para validadores.
  - Build/lint verdes; **demo verificado con capturas** (radar intacto tras el merge + bandeja con los 2
    candidatos y controles). **Fundador aplicó la 0011 y se añadió como validador.**
  - **Verificado e2e por curl (2026-07-17):** (seguridad) un usuario normal ve `is_platform_admin=false`,
    lee `reg_events` (0) pero `reg_candidates`/`reg_sources` le devuelven [] por RLS, y `approve`/`reject`
    responden "no autorizado". (bucle positivo, con un validador de prueba promovido por SQL) aprobar un
    candidato draft → **lo publica en `reg_events`** (kind/date/scope correctos + `published_by`), marca el
    candidato `approved` con reviewer+event_id, y una 2ª aprobación se bloquea ("ya fue revisado").
    Limpieza hecha (evento+candidato borrados por el propio admin vía RLS). Todo ✅.
  - **Fase B (siguiente):** pgvector + embeddings + el Analista con Claude API. La dimensión del vector
    depende del proveedor (OpenAI 1536 / Voyage 1024) → **esa decisión de vendor/llave se toma al entrar
    en B**, no antes. Anthropic NO da embeddings; hará falta OpenAI o Voyage (coste → decisión del fundador).
- **2026-07-17** · **Vigilancia multi-marco — leyes de IA-empleo de EE. UU. (Capa 7).** El radar deja de
  ser mono-marco: ahora cubre EU AI Act **+ 5 marcos de EE. UU.** relevantes al vertical RRHH, con el
  contenido **curado y verificado por el `compliance-domain-expert` contra fuentes oficiales**.
  - **Arquitectura:** `RegFramework` pasa de 1 a 6 valores (`eu-ai-act`, `us-nyc-ll144`, `us-co-aiact`,
    `us-il-aivia`, `us-il-hra`, `us-eeoc`). Nuevo `FRAMEWORK_META` (label/short/jurisdiction) + helpers
    `frameworkLabel()`/`jurisdictionLabel()` con reserva segura, `JURISDICTION_ORDER`/`_LABEL`. Radar con
    **filtro por jurisdicción** (chips server-side vía `?j=`, aparece solo si hay >1 marco), **pill de
    marco** en hero/tarjetas/cronología, encabezado según filtro. Resumen e informe etiquetan jurisdicción.
    Fix: `rowToRegEvent` respeta el framework real (ya no fijo a EU). (commit `f83dcf3` + contenido).
  - **Contenido (7 eventos):** **NYC LL144** (en vigor desde 5-jul-2023: auditoría de sesgo <12m + aviso
    + publicación; obligación del **empleador-deployer**, no del vendor; §§ 20-870/874, 6 RCNY 5-300/304)
    con 2º evento de la **caducidad rotatoria** anual. **Colorado**: HALLAZGO CLAVE — la SB 24-205 (modelo
    estilo UE de "alto riesgo") fue aplazada y **DEROGADA Y REESCRITA por SB 26-189** (firmada 14-may-2026,
    efectiva **1-ene-2027**, régimen ADMT más ligero); 2 eventos (efectividad + registro de la derogación
    para no dar orientación caduca). **Illinois**: DOS leyes separadas en 2 frameworks — AIVIA (820 ILCS 42,
    video-entrevistas, desde 2020) y **IHRA/HB 3773** (antidiscriminación IA en empleo + prohíbe ZIP como
    proxy + aviso, desde 1-ene-2026). **EEOC**: incluido solo como CONTEXTO — es *guidance* retirada de
    eeoc.gov en ene-2025, NO ley; Title VII/ADA/ADEA siguen aplicando. Encuadre honesto deployer-vs-vendor
    en cada uno; disclaimers "orientación, no asesoría".
  - **Caveats registrados (importantes):** (a) los `riskLevels: ["high"]` de los eventos US son
    **conveniencia de enrutamiento**, NO una clasificación jurídica (esas leyes usan sus propios umbrales:
    AEDT/ADMT/decisión-consecuente). (b) Son **territoriales** (solo aplican con nexo NYC/CO/IL): hoy el
    radar los muestra a todo deployer con sistemas de alto riesgo → **v2: campo de jurisdicción/nexo por
    organización** para no sobre-alarmar (el filtro lo mitiga, el copy dice "si operas en X"). (c) **Colorado
    SB 26-189**: reconfirmar numeración C.R.S. consolidada y detalle de obligaciones del deployer antes de
    producción (certeza media). (d) Illinois: reconfirmar nº de ley pública de HB 3773 y deep-link IHRA.
  - Build/lint verdes; **demo verificado con capturas** (radar con chips de jurisdicción + 6 marcos; filtro
    NY deja solo los 2 eventos LL144). Detalle completo del experto en `scratchpad/us-frameworks.md`.
- **2026-07-17** · **Radar v2 — nexo de jurisdicción por organización (Capa 7).** Cierra el caveat
  territorial del multi-marco: las leyes US son territoriales, así que cada organización declara **dónde
  contrata** y el radar prioriza/filtra por esas jurisdicciones (para no sobre-alarmar a un cliente que
  solo opera en, p. ej., la UE).
  - **Migración `0012_org_jurisdictions.sql`** (⚠️ aplicar; aditiva, sin `drop`): columna
    `organizations.jurisdictions text[] default '{}'` + RPC **`set_org_jurisdictions(org, jur[])`**
    (security definer, guard owner/admin vía `user_has_role`, valida que los códigos ∈
    {eu,us-ny,us-co,us-il,us-federal} y deduplica). Añadida a setup.sql.
  - **Data:** `getOrgJurisdictions()` (supabase lee la columna; mock devuelve `["eu","us-ny"]` para la
    demo) + acción `setOrgJurisdictions` (`jurisdiction-actions.ts`, toasts `jur-*`). Fallback seguro: si
    la columna aún no existe, devuelve [] → el radar muestra todas (comportamiento previo, no rompe).
  - **UI radar:** modo de vista por `?j`: `all`→todas, `<cód>`→una, sin `?j`→**nexo** (o todas si vacío).
    Chips: "Mis jurisdicciones" (default), cada jurisdicción presente (con **punto** si está en el nexo),
    y "Todas". Configurador colapsable `JurisdictionSettings` (checkboxes, owner/admin — gated por
    `canManage`, por eso NO se ve en demo). El resumen y el informe también respetan el nexo.
  - Build/lint verdes; **demo verificado con capturas**: nexo UE+NY oculta CO/IL/Federal por defecto;
    "Todas" las revela. Fundador aplicó la 0012.
  - **Verificado e2e por curl (2026-07-17):** owner fija/actualiza/vacía sus jurisdicciones; la RPC
    **filtra códigos basura y deduplica** (`['eu','us-ny','marte','eu']`→`['eu','us-ny']`); un no-miembro
    recibe **"no autorizado"** y no cambia nada. Todo ✅.
- **2026-07-17** · **Plan de acción editable (Capa 2).** El plan deja de ser solo-lectura derivado: ahora
  es un **tablero de tareas** con responsable, fecha límite y estado, editable por el equipo. Las
  recomendaciones derivadas siguen como **SUGERENCIAS** que se añaden al plan con un clic (dedupe por
  `source_key`).
  - **Migración `0013_action_tasks.sql`** (⚠️ aplicar; aditiva, sin `drop`): tabla `action_tasks`
    (title, detail, article, `priority` critica/alta/media/baja, `status` todo/in_progress/blocked/done,
    `assignee_id`→auth.users, `due_date`, `ai_system_id`, `source` manual/recommendation, `source_key`).
    **Colaborativa** (RLS: cualquier miembro de la org lee y escribe, no solo owner/admin) + **trigger de
    auditoría** `write_audit` (lleva organization_id → sí audita). Añadida a setup.sql.
  - **Data:** `getActionTasks()` (resuelve email del responsable vía `list_org_members` y nombre del
    sistema vía join `ai_systems(name)`; mock = 3 tareas de ejemplo). Acciones `action-tasks-actions.ts`:
    create / updateStatus / updateAssignee / updateDueDate / delete (todas revalidan plan+dashboard+
    actividad; validan uuid/fecha/enum; **fallback seguro** si la tabla no existe → []). Toasts `task-*`.
    `audit.ts`: `action_tasks` → "tarea del plan «título»" + labels (estado/prioridad/responsable/fecha).
  - **UI (`/dashboard/plan` reescrita):** resumen por estado (abiertas/en curso/vencidas/hechas), alta
    manual colapsable, tablero ordenado por prioridad (hechas al final, con tachado y marca "vencida"),
    controles inline autoenvío (`TaskControls.tsx`: estado, responsable, fecha, eliminar), y sección de
    sugerencias con "+ Añadir al plan". Todo miembro edita (sin gating por rol).
  - Build/lint verdes; **demo verificado con capturas** (3 tareas + controles + sugerencias con dedupe —
    Art.14/Art.11 ya son tarea y no reaparecen como sugerencia). Fundador aplicó la 0013.
  - **Verificado e2e por curl (2026-07-17):** owner crea tarea; **un member** (no owner) le cambia
    estado+responsable+fecha (confirma RLS **colaborativa**); un extraño ve **0 filas** (aislamiento); el
    audit-trail registra insert (owner) + update (member, `campos=[status,due_date,assignee_id]`) con
    emails; owner elimina. Todo ✅.
- **2026-07-17** · **Recordatorios de vencimiento del plan (Capa 2).** Complemento del tablero editable:
  las tareas con fecha ahora "empujan" al resumen. **Sin backend nuevo** — puro cálculo sobre
  `getActionTasks()`, cero migración, cero coste.
  - **Helper puro `src/lib/task-reminders.ts`:** `isTaskOverdue()`, `bucketTaskDeadlines(tasks, now,
    soonDays=14)` → `{overdue, dueSoon}` (ignora hechas y sin fecha; ventana por defecto 14 días;
    vencidas de la más atrasada arriba, próximas de antes a después) y `dueLabel()` ("vence hoy/mañana",
    "vence en N días", "venció hace N días"). Reutiliza `daysUntil` de `regulatory-watch`.
  - **Widget `DeadlineReminders.tsx`** (presentacional, sin cliente) en el **resumen** del dashboard,
    debajo del hito regulatorio: título "Vencimientos del plan" + badge "N vencidas", filas con punto
    rojo(vencida)/ámbar(próxima), pill de prioridad y texto relativo; enlaza a `/dashboard/plan`. **No se
    renderiza si no hay ninguna.** Muestra hasta 5 (vencidas primero) y resume el resto ("y N tareas más").
  - **Refactor:** el `isOverdue` local de `plan/page.tsx` se sustituye por el `isTaskOverdue` compartido
    (una sola fuente de verdad para "vencida"); limpieza de imports muertos (`ActionTask`,
    `TASK_STATUS_ORDER`, `formatDate`).
  - **Demo:** cambiada la fecha de la tarea de ejemplo `task-demo-2` a una pasada (14-jul) para que el
    demo muestre 1 vencida + 1 próxima. Lint/tsc verdes; **verificado con capturas** (resumen y plan
    coherentes: badge "1 vencida", "venció hace 3 días" / "vence en 14 días").
- **2026-07-17** · **Pulido de auth — recuperación de contraseña + honeypot (parte 1 de "opción 3").**
  Flujo completo de "olvidé mi contraseña", sin dependencias externas.
  - **Ruta `src/app/auth/callback/route.ts`** (GET): callback de enlaces de correo (confirmación y
    recuperación). Robusto a los **dos** formatos de Supabase: `?code=` → `exchangeCodeForSession`;
    `?token_hash=&type=` → `verifyOtp`. Sanea `next` (debe empezar por `/` → **sin open-redirects**);
    enlace inválido → `/login?error=auth_link`.
  - **Páginas** (patrón login: server→`AuthShell`→form client, gate `isSupabaseConfigured`):
    `/reset-password` (pide correo → `resetPasswordForEmail` con `redirectTo=<origin>/auth/callback?next=/reset-password/update`)
    y `/reset-password/update` (fija la nueva vía `updateUser({password})`; si no hay sesión de
    recuperación → "Enlace no válido → Solicitar otro enlace"). Componentes `ResetRequestForm.tsx` /
    `ResetUpdateForm.tsx`.
  - **AuthForm:** enlace "¿Olvidaste tu contraseña?" (solo en login) + prop `initialError`; `login/page`
    ahora async, lee `?error=auth_link` y lo muestra.
  - **Anti-abuso sin dependencias:** honeypot (campo oculto `company`) en `ResetRequestForm` y
    `WaitlistCTA` (bot → finge éxito, no escribe). **Anti-enumeración**: la solicitud de recuperación
    siempre dice "revisa tu correo" salvo rate-limit o error de config de redirect (que sí se muestra
    porque no filtra cuentas). El rate-limit real de auth lo aplica Supabase server-side por defecto.
  - **Verificado:** build+lint+tsc verdes; **capturas** de las 3 pantallas (login con enlace, solicitud,
    update sin sesión→"Enlace no válido"). **e2e curl**: `updateUser({password})` con sesión → **200**;
    la contraseña **nueva inicia sesión ✓** y la **vieja se rechaza ✓**; guard anti open-redirect ✓.
    El endpoint `recover` con `redirect_to` a localhost da **400** (no allowlisted) — **esperado**.
  - **⚠️ CONFIG PENDIENTE DEL FUNDADOR (cuando haya deploy):** en Supabase → **Authentication → URL
    Configuration**, añadir a **Redirect URLs** la del callback desplegado (p. ej.
    `https://<dominio>/auth/callback`) y fijar el **Site URL**. Sin eso, `resetPasswordForEmail` con
    nuestro `redirectTo` responde 400. (El cambio de contraseña en sí ya funciona.) Opcional: plantilla
    de correo de recuperación con `token_hash` para robustez entre navegadores.
  - **Pendiente de la opción 3 (checkpoint):** **captcha** (Cloudflare Turnstile/hCaptcha) — requiere
    llave del proveedor (gratis) + activarlo en Supabase Auth; decisión del fundador.
- **2026-07-17** · **Vigía determinista — 1er agente del foso (Capa 7, Fase A.1).** Primer agente del
  pipeline de automatización: monitoriza las fuentes oficiales por **fetch + hash** y, cuando una
  cambia, **encola un candidato-señal** en la bandeja del Validador. **Cero LLM**: el Vigía no
  interpreta, solo detecta "algo cambió aquí"; el análisis semántico es del Analista (Fase B).
  - **Migración `0014_reg_vigia.sql`** (⚠️ aplicar; aditiva, sin `drop`): columnas de observabilidad en
    `reg_sources` (`last_change_at`, `last_status`, `fail_count`) + **unique(url)** para semilla
    idempotente; **watchlist semilla** de 8 fuentes oficiales (EUR-Lex, Comisión, AI Act Service Desk,
    NYC DCWP, Colorado GA, Illinois GA ×2, EEOC); RPC atómico **`vigia_report(src, new_hash, ok, err)`**
    `security definer` que registra el chequeo, detecta cambio por hash (1ª vez = `baseline` sin señal),
    y si cambió **encola un `reg_candidate` draft** (provenance `agent:'Vigía', model:null, confidence:0.35`)
    con **dedupe** (no floodea si ya hay draft pendiente de esa fuente). Guardado por `is_platform_admin()`
    **o** `service_role` (para el cron). Añadida a `setup.sql`.
  - **App (deploy-ready):** núcleo puro `src/lib/reg-watch/vigia.ts` (`normalizeHtml` conservador +
    `hashContent` SHA-256 + `fetchAndHash` con timeout/UA/`fetchImpl` inyectable) + orquestador `run.ts`
    (`runVigia(client)` lee watchlist activa, hashea y llama al RPC) + `supabase/service.ts` (cliente
    `service_role`, env-gated, server-only). **Route handler** `POST /api/reg-watch/vigia` (runtime node;
    CRON con `Bearer CRON_SECRET`+service_role **o** sesión de platform_admin). Acción manual
    `vigia-actions.ts` + botón `VigiaRunButton`.
  - **UI:** panel `/dashboard/vigilancia/fuentes` (watchlist con estado/última revisión/último cambio,
    gated a platform_admin; demo = `SAMPLE_REG_SOURCES` de solo lectura) + enlace de admin en el radar.
    **Gate de publicación:** un candidato-señal del Vigía (sin fecha/tipo) **no es publicable** hasta
    enriquecerlo → `CandidateReviewControls` muestra aviso en vez de un "Publicar" que rompería el RPC.
    Getters `getRegSources()` en los tres repos + tipo `RegSource` + toasts `vigia-*`.
  - **Verificado:** build + lint + tsc verdes; **prueba local del núcleo 9/9** (ruido volátil ignorado,
    cambio real detectado, hash determinista, fetch ok/404/error, máquina baseline→unchanged→changed).
  - **VERIFICADO e2e por curl (2026-07-17):** el fundador aplicó la `0014` (solo el archivo, NO el
    `setup.sql` entero — re-ejecutar el concat completo falla con `type "risk_level" already exists`
    porque la base ya tiene 0001–0013; regla nueva: para incrementales, pegar solo `00NN`). Con un
    platform_admin de prueba sobre una fuente desechable: 1ª vez `baseline` (sin candidato) → mismo hash
    `unchanged` → hash nuevo `changed` + **candidato-señal creado** (provenance Vigía, model null, conf
    0.35, kind/date null) → 2º hash con draft pendiente `deduped` → `ok=false` `error` + `fail_count`++
    sin tocar el hash. **Negativo:** un no-admin recibe `no autorizado` en `vigia_report` (400) y `[]` al
    leer `reg_sources` (RLS). Limpieza hecha (candidato + fuente de prueba borrados; las 8 fuentes reales
    intactas). Pendiente menor: el fundador borra el user de prueba `vigia-test@attesta-test.dev` +
    su fila en `platform_admins` (RLS no deja por API).
  - **Deferido al deploy:** `CRON_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` en Vercel + un cron que golpee
    el endpoint (el fetch real de fuentes necesita salida a internet sin el proxy del sandbox).
  - **Fase B (siguiente):** el **Analista** (pgvector + embeddings + Claude API) que lee la fuente
    cambiada y **enriquece** el candidato-señal (fecha, tipo, resumen, impacto, artículos) para hacerlo
    publicable. Decisión pendiente del fundador: proveedor de embeddings (OpenAI/Voyage) + budget.
- **2026-07-17** · **Editor de enriquecimiento del candidato-señal (cierra el bucle del Vigía).** El
  Vigía deja señales "algo cambió aquí" sin fecha/tipo (no publicables). Nuevo editor en la bandeja del
  Validador (`CandidateReviewControls` reescrito) para **completar** la señal (título, marco, tipo, fecha,
  resumen, impacto, acción, artículos, alcance por niveles de riesgo / toda la org) y **publicarla** como
  evento del radar, o **guardarla como borrador**. Server action `enrichCandidate` (`reg-pipeline-actions.ts`):
  `UPDATE reg_candidates` por RLS (platform_admin, solo `status='draft'`) + reutiliza `approve_reg_candidate`
  para publicar. **Sin migración** (la RLS de `reg_candidates` ya permite el update al validador). Toast
  `cand-saved`. El botón "Publicar" se deshabilita hasta que haya fecha+tipo (los exige el RPC). Build de
  producción + lint + tsc **verdes**. **Pendiente:** verificación e2e por curl (necesita un platform_admin
  de prueba → 1 línea de SQL del fundador para promoverlo); el usuario de prueba anterior ya se borró.
  Reutiliza primitivas ya verificadas en Fase A (update por RLS + `approve_reg_candidate`).
- **2026-07-17** · **Fase B del foso — B.0: fundación del Analista (SIN gasto).** Diseño por
  `product-architect`. El Analista tomará las señales del Vigía (`provenance.agent='Vigía'`, `kind` null,
  `draft`) y las enriquecerá vía RAG sobre el articulado, dejándolas `draft` para el validador humano
  (nada se publica solo; texto anclado a citas, nunca inventado).
  - **Migración `0015_reg_analista.sql`** (⚠️ aplicar SOLO el archivo, aditiva): `create extension vector`,
    tabla **`reg_knowledge_chunks`** (corpus verbatim + `embedding vector(1024)`, HNSW coseno, RLS admin,
    unique(framework,doc_ref,chunk_index) para ingesta idempotente), RPC **`match_reg_chunks`** (retrieval
    top-k por `<=>`, `security definer`) y RPC **`enrich_reg_candidate_ai`** (escribe el borrador enriquecido,
    guard `is_platform_admin OR service_role`, solo `draft`, fusiona provenance). Añadida a `setup.sql`.
    Gotcha respetado: `extensions.vector`, `extensions.vector_cosine_ops`, `OPERATOR(extensions.<=>)`.
  - **App:** `src/lib/analista/{config,voyage,claude,run}.ts` (clientes con **fallback seguro**: sin
    `VOYAGE_API_KEY`/`ANTHROPIC_API_KEY` no llaman a nada y el pipeline no se rompe) + route
    `/api/reg-watch/analista` (cron `CRON_SECRET`+service_role o platform_admin, clon del Vigía).
    `RegCandidateProvenance` gana `citations`/`retrieved_refs`/`embed_model`. `.env.example` documenta las
    llaves. Defaults: embeddings **voyage-4 (1024)**, drafting **claude-sonnet-5**.
  - **Verificado:** build de producción + lint + tsc **verdes**; ruta registrada. Sin coste (nada llama a
    APIs de pago en B.0). **Pendiente:** fundador aplica `0015`; luego verifico por curl (extensión+índice HNSW,
    `match_reg_chunks` con vector cero → [] sin error, `enrich_reg_candidate_ai` sobre un candidato de prueba,
    negativos de RLS). Necesita un platform_admin de prueba (1 línea SQL).
  - **Checkpoints ANTES de B.1/B.2 (donde empieza el gasto):** (1) embeddings **voyage-4** vs voyage-law-2
    (ambos 1024, no cambia el esquema); (2) drafting **Sonnet 5** ± gate Haiku; (3) corpus = articulado
    verbatim curado en repo **verificado por el compliance-domain-expert** (Arts. 5,6,14,26,27,50,86 + Anexo III);
    (4) contenido que analiza el Analista: re-fetch (actual) vs snapshot en `vigia_report`.
- **2026-07-17** · **Fase B.1 (corpus) + B.2 (el Analista) — código completo.**
  - **B.1 corpus:** `compliance-domain-expert` produjo el texto **VERBATIM** del AI Act (28 apartados: Arts.
    5.1.f, 6.2/6.3, Anexo III.4, 14.1-5, 26.1/2/3/5/6/7/11, 27.1-5, 50.1/2/4, 86.1-3), verificado contra
    artificialintelligenceact.eu (espejo del DOUE). En `corpus/eu-ai-act.data.json` (JSON tipado) + notas de
    encuadre deployer-vs-provider (`EU_AI_ACT_FRAMING_NOTES`) para el prompt. Infra de ingesta `ingest.ts`
    (chunk→embed→upsert idempotente por source_hash+model) + route `/api/reg-watch/ingest`.
    Caveat del experto: reverificar carácter-por-carácter contra EUR-Lex antes de producción.
  - **B.2 Analista:** `claude.ts` `draft()` vía **tool use forzado** (`propose_reg_event`, strict) con
    **grounding estricto** (los chunks = única fuente legal; cita-o-abstención; sin soporte →
    `insufficient_evidence`), reencuadre deployer, y **filtro determinista de copy prohibido** (si aparece
    "certifica/cumple/…" se descarta el borrador). Modelo **claude-sonnet-5**, `thinking:disabled`. `run.ts`
    ata el flujo: señal Vigía → fetch contenido → embed query → `match_reg_chunks` → draft → `enrich_reg_candidate_ai`.
    Verificado con el skill `claude-api` (contrato de la API). Inerte sin llaves (fallback seguro).
  - **Verificado:** build de producción + lint + tsc **verdes** en cada paso. **Sin coste** (nada llama a
    APIs de pago hasta que se configuren las llaves).
  - **PENDIENTE para correr en vivo (necesito del fundador, paso a paso cuando toque):** (1) aplicar `0015`;
    (2) `VOYAGE_API_KEY` + `ANTHROPIC_API_KEY`; (3) un platform_admin de prueba (1 línea SQL). Con eso YO
    ejecuto la ingesta (B.1) y paso una señal por el Analista (B.2) y verifico e2e por curl.
- **2026-07-17** · **Fase B.1 VERIFICADA e2e + Analista movido a LLM gratis (OpenAI-compatible).**
  - **B.1 verificado (Voyage, gratis):** el fundador aplicó la `0015` (fix `drop policy if exists` porque
    `create policy` no es idempotente) y promovió un validador de prueba. Ingesté los **28 apartados** del AI
    Act a `reg_knowledge_chunks` (embeddings voyage-4, dim 1024) → **count=28**; el corpus queda **en la base
    real** (dato de producción, NO se borra). **Retrieval probado:** consulta "obligaciones del deployer:
    supervisión humana + informar al candidato" → top-5 = **Art. 26.2, 26.3, 14.4, 26.7, 50.1** (los del
    deployer). El RAG recupera lo correcto. Modelo de embeddings confirmado: **voyage-4** existe y da 1024.
  - **B.2 — cambio de proveedor:** la llave de **Anthropic era válida pero la cuenta NO tiene crédito**
    ("credit balance too low"). El fundador pidió alternativa gratis → refactoricé el drafting a un endpoint
    **compatible con OpenAI + function calling**: `claude.ts` → **`src/lib/analista/llm.ts`**. Config agnóstica
    (`ANALISTA_API_KEY` / `ANALISTA_BASE_URL` / `ANALISTA_MODEL`), **por defecto NVIDIA NIM**
    (`https://integrate.api.nvidia.com/v1`, `meta/llama-3.3-70b-instruct`, gratis). Mismo grounding estricto
    (cita-o-abstención), reencuadre deployer y filtro de copy prohibido. `.env.example` actualizado. Build+lint+
    tsc verdes.
  - **PENDIENTE para cerrar B.2 (verificación en vivo):** el fundador saca una **API key gratis de NVIDIA**
    en **build.nvidia.com** (formato `nvapi-...`) y me la pasa. Con eso YO: paso una señal del Vigía por el
    Analista (fetch/contenido → embed query → match_reg_chunks → llm.draft → enrich_reg_candidate_ai) y
    verifico que el borrador sale con **citas reales, encuadre deployer y sin copy prohibido**. El validador de
    prueba **`analista-test@attesta-test.dev`** (uid `9f226580-bd52-4f3d-b459-9387968b582b`) sigue promovido en
    `platform_admins` para esa verificación. **Limpieza pendiente al terminar:** borrar ese user +
    `vigia-test` si quedó, y candidatos de prueba (el corpus se queda).
  - **Llaves que el fundador me pasó por chat (rotar tras verificar si quiere):** Voyage `pa-...`, Anthropic
    `sk-ant-...` (sin saldo, inútil por ahora). Supabase URL `flesaxlgtvhewwcvzrxs` + anon key (pública).
- **2026-07-17** · **DEPLOY A PRODUCCIÓN (Vercel) — modo real con login.** La app está **EN VIVO** en
  **https://attesta-io.vercel.app** (el fundador renombró el proyecto a `attesta-io`, acorde a la marca).
  - **Rama de producción = `main`** (antes solo tenía un README; se hizo `git push --force` de
    `claude/init-3bwfhm` → `main`, ahora ambas apuntan al mismo commit). Vercel despliega `main` → **cada
    push a main redespliega solo**. (Yo sigo trabajando en `claude/init-3bwfhm`; hay que mantener `main` al
    día para que la demo se actualice — empujar a ambas o fast-forward main.)
  - **Env vars en Vercel:** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (por eso arrancó en
    modo CONECTADO, verificado: `/dashboard`→307 a `/login`). Falta añadir para el cron del foso:
    `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `VOYAGE_API_KEY`, `ANALISTA_API_KEY` (+ opcional `ANALISTA_MODEL`).
  - **Supabase Auth URL Configuration:** Site URL + Redirect URL `.../auth/callback` (el fundador lo hizo).
  - **Fundador:** email **`luisscmorenod@gmail.com`** (registrado en prod, org creada). Se auto-promovió a
    `platform_admin` por SQL (con el email correcto). Usuarios de prueba `analista-test`/`vigia-test`: pendiente
    confirmar que se borraron (SQL dado).
  - **PENDIENTE / SIGUIENTE:** (a) **revisión/pulido a fondo** de la app en vivo (el fundador lo pidió: "que no
    falte nada, bien optimizado") — lista priorizada. (b) **cron automático** del Vigía/Analista (env vars +
    `vercel.json` con crons; ojo: las rutas son POST, el cron de Vercel manda GET → habría que añadir handler GET
    o adaptarlas). (c) Capas nuevas: 0 (shadow-AI) / 4 (sesgo, Evidently).
- _(las correcciones futuras del fundador se anotan aquí)_

## 11. Preguntas abiertas / próximos pasos de validación

> **▶▶ RETOMAR AQUÍ (2026-07-18):** La lista de mejoras del fundador (3 tandas) está **completa y
> desplegada**. Lo que queda vive, ordenado, en **[PENDIENTES.md](./PENDIENTES.md)** — léelo primero.
> Resumen: (1) **Stripe** construido pero dormido → el fundador lo configura en una computadora (modo
> Test): aplicar migración `0017`, crear producto/precio **$350 USD/mes**, llaves + webhook, env vars
> en Vercel, redeploy, probar con tarjeta `4242…`. (2) **Verificación de correo por código** construida
> pero desactivada → necesita **dominio propio + custom SMTP (Resend)** para reactivarse. (3) Ideas de
> capas futuras: shadow-AI (Capa 0), pruebas de sesgo (Capa 4). Rama `claude/init-3bwfhm` → push también
> a `main`. **Seguridad:** el fundador debe rotar una `sk_live` que se expuso en el chat. El bloque de
> abajo es el contexto del FOSO (sigue vigente).

> **▶ RETOMAR AQUÍ (2026-07-17, FASE B / FOSO COMPLETO):** El **foso automatizado está COMPLETO y
> verificado e2e**: Vigía (detecta) → señal → **Analista (RAG + LLM redacta borrador grounded)** → editor →
> Validador humano publica. Árbol limpio y sincronizado. **Migraciones aplicadas hasta la 0015.**
> **B.1 ✅ verificado:** corpus (28 apartados verbatim del AI Act) ingerido en la base real (Voyage voyage-4,
> 1024) + retrieval correcto (Arts. 26/14). **B.2 ✅ verificado e2e** (2026-07-17): señal Vigía → embed →
> `match_reg_chunks` → **NVIDIA NIM (function calling)** → borrador grounded (**citas ancladas a fragmentos
> reales, publicable kind+fecha, sin copy prohibido, usa Art. 26**) → `enrich_reg_candidate_ai` → candidato
> enriquecido con `provenance.agent='Analista'`. Drafting = `src/lib/analista/llm.ts` (OpenAI-compatible;
> **NVIDIA NIM gratis** por defecto; Groq/OpenRouter por env). **NOTA DE MODELO:** verifiqué con `llama-3.1-8b`
> (rápido) — floja (ensucia articles, desliza 'proveedor'); **producción usa `meta/llama-3.3-70b-instruct`**
> (default en config; el cron es async, la lentitud del free-tier da igual) + humano valida. Prompt ya
> reforzado (articles limpios + no 'proveedor').
> **⚠️ PENDIENTE DE LIMPIEZA (el fundador, 1 SQL):** borrar los users de prueba `analista-test@attesta-test.dev`
> (uid `9f226580-bd52-4f3d-b459-9387968b582b`) y su fila en `platform_admins`. El corpus y `reg_events` se
> quedan. **SIGUIENTE:** demo en Vercel (llaves = env vars, NO por chat; `CRON_SECRET`+service_role para el
> cron real del Vigía/Analista) o nueva capa (shadow-AI Capa 0, pruebas de sesgo Capa 4). Estado: **Capa 7
> (foso) 🟢🟢🟢** = Fase A + Fase B (Vigía+Analista+Validador) COMPLETA y verificada = Fase A del pipeline
> (candidato→Validador humano→`reg_events`; RLS blinda la cola; `platform_admin`) + **multi-marco** (EU AI Act
> + 5 marcos US de IA-empleo: NYC LL144, Colorado SB 26-189, Illinois AIVIA + IHRA, EEOC-contexto; verificado
> por el experto) + **nexo de jurisdicción por org** (0012). **Capa 2 🟢** = **plan de acción editable**
> (tablero `action_tasks`, colaborativo; 0013) + **recordatorios de vencimiento** (widget en el resumen;
> `task-reminders.ts` + `DeadlineReminders.tsx`; sin migración). **Auth 🟢** = **recuperación de contraseña**
> completa (`/reset-password` + `/auth/callback` + `/reset-password/update`; `updateUser` probado e2e) +
> **honeypot** anti-bots (recuperación + waitlist); **captcha DIFERIDO al deploy** (mi recomendación: honeypot
> + rate-limit server-side de Supabase bastan pre-lanzamiento; Turnstile necesita dominio).
> **CONTEXTO CLAVE:** el fundador operaba sin app corriendo (todo vía Supabase SQL Editor + mi verificación
> por curl con usuarios `*@attesta-test.dev`); AHORA quiere **publicar una demo en Vercel** para visualizar
> (más adelante). Flujo de migraciones: yo escribo `00NN` → él lo pega en SQL Editor (SOLO el archivo, no el
> `setup.sql` entero) → yo verifico por curl.
> **SIGUIENTES CANDIDATOS:** (1) **Fase B del foso — el Analista** (EN CURSO, es lo próximo): lee la fuente
> cambiada (que marca el Vigía) y **enriquece** el candidato-señal automáticamente (fecha, tipo, resumen,
> impacto, artículos) vía RAG sobre el texto de la norma. **Voyage ya con sign-up** (embeddings 1024) +
> pgvector + Claude API. Coste = primer gasto real, se revisa al construirlo. (2) ~~Enriquecimiento manual~~
> **HECHO** (editor en la bandeja). (3) Otra capa: descubrimiento de inventario / shadow-AI (Capa 0) o
> pruebas de sesgo con Evidently (Capa 4). (4) **Demo en Vercel** cuando el fundador quiera visualizar.
> **PENDIENTES DE CONFIG/DEPLOY:** (a) Deploy a Vercel. (b) Al desplegar: en Supabase → URL Configuration,
> añadir `https://<dominio>/auth/callback` a Redirect URLs + fijar Site URL (si no, `resetPasswordForEmail`
> da 400). (c) Captcha Turnstile (llave gratis + toggle en Supabase). (d) Idea del recordatorio: email de
> aviso de vencimientos (requiere deploy + proveedor de correo).

- ~~Nombre comercial~~ → **Attesta** ✅
- ~~Alcance del MVP~~ → confirmado ✅
- ~~Landing + app shell~~ → hecho ✅ (con datos de ejemplo)
- ~~Asistente de clasificación de riesgo~~ → hecho ✅ (lógica en memoria, sin persistir aún)
- ~~Backend/datos~~ → **Supabase conectado y verificado e2e** ✅ (esquema, RLS, auth, audit-trail).
- ~~Credenciales Supabase~~ → conectadas en `.env.local` ✅.
- ~~Auth UI (login/registro) + middleware + onboarding~~ → hecho y verificado ✅.
- ~~Write-path: alta de sistemas + seed de ejemplo~~ → hecho ✅.
- ~~Write-path: guardar la evaluación del asistente contra un sistema + edición de brechas~~ → hecho ✅.
  El **bucle de evidencia** está cerrado: se guarda con atestación + evidencia y se muestra en el
  dossier, el historial de la ficha y el audit-trail (con datos de ejemplo en demo).
- ~~Generador de documentación técnica (Capa 3)~~ → hecho ✅ (dossier de gobernanza por sistema,
  `/dashboard/inventario/[id]/dossier`, imprimible a PDF, determinista).
- ~~Vigilancia regulatoria — radar v1 (Capa 7)~~ → hecho ✅ (`/dashboard/vigilancia`, catálogo curado
  EU AI Act + motor de relevancia, verificado por el experto). Pendiente v2: acks persistidos,
  multi-marco y automatización de ingesta (4 agentes + RAG/pgvector).
- ~~Conectar formulario de waitlist~~ → hecho ✅ (tabla `waitlist`, RLS insert-only,
  verificado: insert 201, select bloqueado). Consultar leads desde el panel Supabase.
  Pendiente opcional: captcha/rate-limit contra spam.
- Exportación real a PDF + audit-trail íntegro.
- Autenticación y multi-tenancy.
- Validación real (del propio thesis):
  1. 15 entrevistas a responsables de riesgo/legal en mid-market que ya usan IA en decisiones.
  2. Vender un "AI inventory + gap assessment" manual como servicio-cebo (¿pagan $2–5k?).
  3. Umbral: **5 pre-ventas** antes de escribir producto pesado.

## 12. Glosario

- **EU AI Act** — reglamento europeo de IA; clasifica sistemas por riesgo.
- **Alto riesgo** — sistemas de IA con impacto significativo sobre derechos/seguridad
  (RRHH, crédito, etc.); sujetos a las obligaciones más estrictas.
- **Deployer** — quien **usa/despliega** un sistema de IA (nuestro cliente), distinto
  del **provider** que lo desarrolla.
- **GRC** — Governance, Risk & Compliance.
- **ISO 42001** — estándar de sistema de gestión de IA.
- **NIST AI RMF** — marco de gestión de riesgos de IA (EE.UU.).
- **SealMark/logo** — el sello es ahora una imagen (`/public/sealmark.png`, monograma "A" +
  check, jade con interior blanco), NO un SVG recolorable. El wordmark "Attesta" (Fraunces) NO
  cambia. Favicon = `src/app/icon.png`. Si se rediseña, reemplazar esos archivos.
- **Audit-trail** — registro cronológico e íntegro de acciones/cambios para auditoría.
- **Flywheel** — círculo virtuoso: más clientes y más normas → mejor base de conocimiento → más valor.
- **RAG** — el LLM responde leyendo el texto real de la norma, no de memoria.
- **Shadow AI** — IA que la empresa usa sin autorización/registro formal.
- **Drift** — degradación del comportamiento de un modelo en producción.
- **OPA/Rego** — motor de "política como código" (permitir/bloquear una acción).

## 13. Mapa de producto y automatización (doc de estrategia del fundador, jul-2026)

> Documento externo `plataformagobernanzaia.md` integrado como estrategia de referencia.
> Resumen operativo — el detalle completo está en ese archivo.

### 13.1 Torre de 10 capas · dónde estamos
- **Capa 0 Inventario** ✅ (con alta manual; falta descubrimiento automático / shadow-AI).
- **Capa 1 Clasificación de riesgo** ✅ (falta multi-marco: hoy solo EU AI Act).
- **Capa 2 Evaluaciones + plan de riesgo** 🟢 (cuestionario + **plan de acción editable**: tablero de tareas con responsable/fecha/estado + sugerencias derivadas con dedupe + **recordatorios de vencimiento** en el resumen —vencidas/próximas—; falta opcional: aviso por email, requiere deploy + proveedor de correo).
- **Capa 3 Evidencia + documentación + audit-trail** ✅ (audit-trail ✅, evidencia declarada ✅, export PDF ✅, **generador de documentación técnica / dossier de gobernanza por sistema ✅**; futuro opcional: redacción asistida por LLM y firma/versión del dossier).
- **Capa 4 Pruebas técnicas del modelo** ❌ (sesgo/explicabilidad/robustez — INTEGRAR, no construir).
- **Capa 5 Monitoreo continuo en producción** ❌ (drift, incidentes).
- **Capa 6 Supervisión humana / roles** 🟡 (roles owner/admin/member + **UI de equipo: invitar,
  cambiar rol, quitar, invitaciones + claim** ✅; faltan flujos de aprobación y auditoría de membership).
- **Capa 7 Vigilancia regulatoria multi-marco** 🟢 (el **foso** más fuerte; **radar v1 ✅** + **acuse auditado ✅** + **automatización Fase A ✅** (pipeline con Validador humano) + **Fase B ✅ VERIFICADA e2e** (Analista: pgvector `reg_knowledge_chunks` con 28 apartados verbatim del AI Act + embeddings Voyage + LLM OpenAI-compatible/NVIDIA NIM que redacta borradores grounded con citas reales y encuadre deployer) + **multi-marco ✅** — EU AI Act + 5 marcos de EE. UU. de IA-empleo (NYC LL144, Colorado SB 26-189, Illinois AIVIA + IHRA, EEOC-contexto) con filtro por jurisdicción, verificado por el experto + **nexo de jurisdicción por org ✅** (0012). Pendiente opcional: cron real (deploy), corpus multi-marco US, reverificar corpus contra EUR-Lex).
- **Capa 8 Riesgo de terceros/proveedores** ❌.
- **Capa 9 Gobernanza de agentes de IA** ❌ (frontera; casi nadie la cubre).
- **Capa 10 Reportes/colaboración** ✅ (dashboard + dossier PDF por sistema + **informe ejecutivo de
  organización** + **visor del audit-trail**; futuro: colaboración/comentarios, envío programado).

### 13.2 Roadmap (cuña → plataforma)
1. **Cuña (MVP)** = Inventario + gap (Capas 0-1) → **YA lo tenemos**.
2. **Papeleo** = documentación + evidencia + audit-trail (Capa 3) → **generador de documentación (dossier) ✅ hecho**.
3. **Pegajoso** = monitoreo + pruebas de sesgo/explicabilidad (Capas 4-5) → integrar Evidently/Fairlearn.
4. **Foso** = vigilancia regulatoria multi-marco (Capa 7) → **radar v1 ✅** (curado) + **pipeline Fase A ✅** (cola de candidatos + Validador humano); falta **Fase B** (embeddings/RAG + Analista LLM que llena la cola).
5. **Frontera** = gobernanza de agentes (Capa 9).

### 13.3 Limitaciones → ventajas (filosofía a mantener)
- **No certificamos** → somos el **system of record de evidencia** (ya decidido, §10).
- **No construimos ML/testing** → **INTEGRAMOS open-source** (Evidently, Fairlearn, Phoenix, SHAP, OPA). Nuestro valor único = (a) **capa de conocimiento regulatorio**, (b) **orquestación que lo entrelaza**, (c) **UX "de un botón"**.
- **ICP deployer** → la conformidad/marcado CE (Capa 3 del doc) es del proveedor, no nuestro foco; lo reframeamos a "exige y conserva evidencia".

### 13.4 Automatización — ruta LEAN que encaja con nuestro stack
- **Orquestación:** empezar con lógica en Next.js + Supabase (cron/webhooks); escalar a n8n/Make y luego Temporal + LangGraph.
- **Conocimiento/RAG:** **pgvector sobre nuestro Postgres de Supabase** (barato) para guardar el texto de las normas.
- **Razonamiento:** API de Claude directa con nuestros subagentes; la clave es RAG sobre la ley.
- **Módulo estrella:** *"ley nueva → preparación en horas"* con 4 agentes encadenados
  (Vigía → Analista → Actualizador → Validador con humano-en-el-bucle). Audit-trail ya lo tenemos.
- **Pruebas/enforcement:** integrar Evidently (gratis) y, más adelante, OPA/Rego.

### 13.5 Decisiones del fundador
- **VERTICAL = RRHH / reclutamiento** ✅ (2026-07-17). Cuña: IA que filtra CVs (alto riesgo
  directo, Anexo III empleo). Implicaciones futuras: mensajería, ejemplos y "policy pack"
  orientados a RRHH; ICP concreto = responsable de RRHH/Talent + Legal en empresa mediana.
- **REGIÓN = abierta** por ahora ✅ (foco en producto; decidir tras primeras entrevistas).
- **Precios de mercado (referencia):** mid-market gobernanza de IA **30–50k $/año**; pyme desde ~5k €/año. (Nuestro precio en la landing = 350 USD/mes, orientativo/early-access.)
- **Canal:** consultores/auditores como aliados ("powered by" + reparto), no competencia.

### 13.6 Corrección de fechas vs el doc
- El doc dice "deadline ago-2026, posible aplazamiento". **Actualizado:** el Omnibus ya se
  adoptó (2026) → alto riesgo **2 dic 2027** (ver §6). El mensaje es "ventana, no urgencia".
