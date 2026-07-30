# PENDIENTES.md — Estado y tareas abiertas de Attesta

> **Documento vivo.** Reúne TODO lo que queda por hacer (tuyo y mío) para no perder
> el hilo entre sesiones. Se relaciona con:
> - **[MEMORY.md](./MEMORY.md)** — memoria completa + bitácora (§10) + cómo retomar (§11).
> - **[CLAUDE.md](./CLAUDE.md)** — mapa técnico del código.
> - **[docs/supabase.md](./docs/supabase.md)** — backend/migraciones.
>
> Última actualización: **2026-07-30**.

---

## 🗺️ 0. HOJA DE RUTA 360° — PLAN MAESTRO POR SPRINTS (auditoría 2026-07-30)

> **DECISIÓN DEL FUNDADOR (2026-07-30): se hace TODO, por sprints.** Esta sección es el plan maestro:
> no se descarta nada, solo se ordena. Fuente: auditoría 360° multi-agente (6 lentes en paralelo sobre el
> código real → 39 hallazgos → síntesis priorizada → crítico de completitud). Marca `[ ]`/`[x]` al avanzar.
>
> Reglas que aplican a todo lo de abajo: **Attesta NO certifica** (copy prohibido); **contenido legal
> determinista, cero LLM**; todo lo de "Foso/compliance" pasa **antes** por el `compliance-domain-expert`;
> las **apuestas grandes** llevan checkpoint del fundador antes de arrancar.

### 0.A · SPRINT 1 — blindaje de marca + conversión ✅ COMPLETADO (2026-07-30)
> Los 7 ítems hechos y desplegados. Verificación de cada uno: `tsc + lint + build + check:copy`.
> **Siguiente sprint → 0.B.**
- [x] ✅ **Guard automático contra copy PROHIBIDO en CI** (2026-07-30) — `scripts/check-prohibited-copy.mjs`
      + `npm run check:copy` + paso en `ci.yml`. **20 reglas ES+EN** que detectan el *patrón peligroso*
      (Attesta como sujeto que certifica, afirmación de cumplimiento del cliente, veredicto de aptitud,
      `% de cumplimiento`), **no la palabra suelta** — la lista negra simple daba 18 falsos positivos
      legítimos (marcado CE *del proveedor*, "no como certificador", "garantiza intervención humana" del
      RGPD 22, "ley aprobada por…") y un guard así se desactiva. Ignora **negaciones** y **preguntas de
      FAQ**; escape hatch `attesta-copy-ok` (usado en 5 líneas, con motivo). **Se autoprueba** en cada
      ejecución (muestras con reglas esperadas + cobertura de las 20 reglas) → falla si alguien debilita
      una regex. Verificado por ambos lados: atrapa 20 infracciones inyectadas y falla al romper una regla.
- [x] ✅ **Unificar la señal de conversión de la landing** — Hero y cabecera pasan a `/login?signup=1`
      (registro real) con copy "Empieza gratis"; Precios: Diagnóstico y Preparación al registro, Enterprise
      sigue en waitlist (requiere venta asistida). Nuevo `?signup=1` abre el formulario ya en modo registro
      (`AuthForm.initialMode`). De paso se corrigió un dato obsoleto: "Policy packs (5 dominios)" → "(8 packs
      · UE y EE. UU.)".
- [x] ✅ **Teaser de brechas en el plan gratuito** — el muro de Gap assessment ahora muestra cifras REALES
      (brechas abiertas · de severidad alta · sistemas afectados) sin revelar el detalle. `Paywall` acepta
      `stats`; `PaidGate` las recibe como **función** y solo las resuelve si bloquea (el usuario de pago no
      paga queries de un teaser que no verá), con try/catch. Excluye las prácticas prohibidas del Art. 5.
      De paso: el layout tenía el copy del muro **hardcodeado en español** → ahora sale del diccionario.
- [x] ✅ **Interfaz `DataRepo` compartida** — `index.ts` define `DataRepo = typeof supabaseRepo` (el repo real
      es la fuente de verdad, sin duplicar 22 firmas) y afirma que `mock-repo` lo implementa. **Matiz honesto:**
      `tsc` ya fallaba antes, pero con diagnósticos engañosos (los tipos degradaban a `any` y el error salía
      como *"implicitly has an 'any' type"* en páginas del dashboard). Ahora dice *"Property 'getActionTasks'
      is missing"* en `data/index.ts`. Verificado provocando ambos fallos: getter ausente y firma divergente.
- [x] ✅ **StatCards navegables** — "Alto riesgo" → `/dashboard/riesgo`; "% listo" → `/dashboard/gap`.
      El destino ideal (inventario **filtrado** por riesgo) espera al filtro del Sprint 4: no se enlaza a un
      parámetro que hoy se ignoraría.
- [x] ✅ **JSON-LD** — un `@graph` con Organization + SoftwareApplication + FAQPage, todo desde el diccionario
      (bilingüe gratis, sin duplicar copy); precio desde `PLAN_PRICE_LABEL`. Verificado sobre el **HTML
      servido**: 3 nodos, 8 preguntas, 2 ofertas (0/120) y `inLanguage=en` en `/en`. `ld+json` no es
      ejecutable → no necesita nonce de la CSP; se escapa `<` para que ningún texto pueda inyectar marcado.
- [x] ✅ **`createClient()` con `cache()`** — un cliente SSR por render en vez de uno por getter. `cache()` no
      cruza requests → sin riesgo de compartir sesión.

### 0.B · SPRINT 2 — activación + red de seguridad del contenido ⬅️ SIGUIENTE
- [ ] **Import CSV + enlace de intake compartible** — el alta manual uno-a-uno es el muro de activación #1
      (nadie teclea 30 sistemas); sin inventario, riesgo/gap/dossier quedan vacíos. `alto · M`
- [ ] **Tests con Vitest sobre la lógica pura** — `risk-assessment`, `recommendations`, `task-reminders`,
      `regulatory-watch`, `audit`, `bias-audit`. Hoy build+lint+tsc **no** detecta una regla legal mal editada:
      es la red de seguridad del contenido "cero LLM". ROI altísimo. `alto · M`
- [ ] **Logging / observabilidad de errores** — el patrón `if (error) return []` confunde "migración ausente"
      con "Supabase caído / RLS rota"; en producción un incidente es indistinguible de "aún no hay datos".
      Loggear con contexto o integrar Sentry. `alto · M`
- [ ] **Rama GPAI en el clasificador de riesgo** — GenAI es el caso de IA más común del mid-market y hoy cae en
      "limitado/mínimo", perdiendo la capa GPAI (Arts. 51-56) y la trampa del **Art. 25** (con fine-tuning
      sustancial pasas a proveedor). Vigente desde ago-2025. **Validar con el experto.** `alto · M`
- [ ] **Verificación local del JWT en el middleware (`getClaims`)** — hoy cada navegación paga una llamada de
      red a Supabase Auth en el camino crítico. `alto · M`

### 0.C · SPRINT 3 — monetización + compliance EE. UU.
- [ ] **Metering por nº de sistemas/asientos + Enterprise a medida** — hoy una org con 2 sistemas y otra con 50
      pagan lo mismo; captura el ACV enterprise (30-50k $/año de referencia vs. los ~120-350 $/mes actuales).
      `alto · M`
- [ ] **Pack Colorado AI Act (SB 26-189)** — 1ª ley estatal de EE. UU. con deberes reales de *deployer* (gestión
      de riesgos, evaluaciones de impacto, aviso, notificación al fiscal); reutiliza la mecánica deployer casi
      1:1. Confirmar nº de bill y secciones tras la reescritura 2026. `alto · M`
- [ ] **Pack Anexo III.5.a (servicios esenciales y ayudas públicas)** — hoy el clasificador manda "alto riesgo"
      ahí y el usuario llega a `/packs` **sin pack**: cul-de-sac. Utilities, aseguradoras de salud, prestaciones;
      FRIA (Art. 27) clara. `alto · M`
- [ ] **Pack US de educación (FERPA / COPPA / SOPIPA)** — empareja el pack UE de educación recién desplegado;
      venta cruzada al mismo comprador en dos jurisdicciones. `medio · M`

### 0.D · SPRINT 4 — producto/UX de profundidad
- [ ] **Búsqueda / filtro / orden en el inventario + vista apilada en móvil** — una tabla plana no escala a
      decenas de sistemas. `medio · M`
- [ ] **Navegación móvil tipo drawer** — hoy 11 pestañas con scroll horizontal; los ítems Enterprise con candado
      (upsell) quedan fuera de vista. `medio · M`
- [ ] **Registro de incidentes + revisión periódica de la autoevaluación** — cubre obligación real del deployer
      (Arts. 26.5 / 73) reusando audit-trail + recordatorios; añade recurrencia (retención). `medio · S`
- [ ] **Registro de proveedores / terceros (Capa 8)** — materializa el reencuadre deployer que ya está en todos
      los packs (marcado CE, model card, DPA, caducidad); palanca de expansión de plan. `medio · M`
- [ ] **Streaming con Suspense en el dashboard** — que la query más lenta no bloquee el shell entero. `medio · M`
- [ ] **Consolidar el onboarding** (modal + checklist + bienvenida compiten hoy en la 1ª sesión). `bajo · M`
- [ ] **`lang="es"` en bloques regulatorios** — parche WCAG barato mientras el output legal no exista en EN.
      `medio · S`
- [ ] **i18n de los muros de pago restantes** (descubierto en el Sprint 1) — 7 `layout.tsx` de secciones de pago
      (`plan`, `packs`, `vigilancia`, `equipo`, `actividad`, `organizaciones`, `seguridad`) tienen
      `feature`/`description` **hardcodeados en español**; en `/en` el muro sale mezclado. El de `gap` ya se
      migró al diccionario en el Sprint 1: replicar ese patrón. `medio · S`
- [ ] **`viewport`/`themeColor` + manifest mínimo + `noindex` en rutas de auth.** `bajo · S`
- [ ] **Sección "cómo verificamos el contenido legal"** — el mayor diferenciador honesto (determinista, doble
      pasada del experto, citas verbatim) se afirma pero no se demuestra. `medio · M`

### 0.E · SPRINT 5 — deuda técnica y robustez restante
- [ ] **Aislar la landing del `headers()` del root layout** — leer headers saca a TODA la app del render
      estático/CDN, empezando por la página de mayor coste de conversión (route-group propio o locale por ruta).
      `alto · L`
- [ ] **Validación con Zod en Server Actions** — hoy es artesanal (enums sin whitelist, sin límites de longitud).
      `medio · M`
- [ ] **Rate-limit distribuido (Upstash / Vercel KV)** — el `Map` en memoria no protege en serverless
      multi-instancia; crítico si se extiende a login/reset/checkout. `medio · M`
- [ ] **Fail-fast del dominio en build (`NEXT_PUBLIC_APP_URL`)** — sin la var, canonical/hreflang/sitemap apuntan
      al placeholder de Vercel y rompen la indexación **en silencio**. `medio · S`
- [ ] **Revisar `force-dynamic` de más y consolidar N queries en RPC** — abre caché con invalidación por tag.
      `bajo-medio · M/L`
- [ ] **Adelgazar fuentes (Fraunces / Geist_Mono)** — KB en el critical path del LCP. `bajo · S`

### 0.F · SPRINT 6 — los 8 huecos que el propio panel se dejó fuera (crítico de completitud)
> Confirmados contra el repo: **no hay** analítica, ni páginas legales/privacidad, ni Sentry, ni rutas de ayuda.
- [ ] **Telemetría de producto / funnel de activación** — hoy optimizamos conversión y activación **a ciegas**
      (sin PostHog/Plausible ni evento "clasificó 1er sistema → vio brechas → pagó"). Debería ir **antes** o a la
      par del Sprint 1 para poder medirlo. `alto · S-M`
- [ ] **Cumplimiento propio de Attesta** — no existe página de **privacidad**, **DPA**, lista de
      **subprocesadores** (Supabase UE, Stripe, proveedor de email) ni aviso de cookies. Vender gobernanza de IA
      a mid-market UE sin tu propio DPA **bloquea la compra** en due-diligence y es incoherente con la marca.
      `alto · M`
- [ ] **Ciclo de vida de facturación** (no solo el checkout) — pago fallido, reintentos, degradación de plan,
      cancelación, **idempotencia del webhook** y reconciliación Stripe↔DB. Es donde se pierde MRR en silencio.
      `alto · M`
- [ ] **Borrado / exportación de datos por tenant (GDPR + offboarding)** — no hay derecho de supresión ni
      portabilidad ni borrado de una org al darse de baja. Obligación legal directa **y** requisito que nuestros
      propios packs exigen a los clientes. `alto · M`
- [ ] **Soporte y documentación de usuario** — cero rutas help/docs y ningún canal de contacto in-app; el
      onboarding cubre el primer minuto, no la retención. `medio · M`
- [ ] **Backup / DR y runbook de incidentes** — sin política de backups verificados, RPO/RTO ni plan de
      restauración probado, el audit-log inmutable y la hash-chain son inútiles. `medio · M`
- [ ] **Motion GTM enterprise + captura de leads** — la landing solo tiene waitlist; el ACV de 30-50k $ no es
      self-serve (falta "reservar demo", captura cualificada, handoff a venta asistida). `medio · S-M`
- [ ] **Deliverability de email transaccional (SPF/DKIM/DMARC)** — recordatorios, invitaciones y reset dependen
      del correo; sin dominio autenticado caen en spam y rompen invitaciones/verificación en silencio. Ligado al
      SMTP pendiente del fundador (§1.3). `medio · S`

### 0.G · APUESTAS GRANDES — requieren CHECKPOINT del fundador antes de arrancar
- [ ] **⚠️ Test de sesgo EJECUTABLE (Fairlearn / Evidently)** — hoy solo se *registra* evidencia declarada; el
      cálculo (regla 4/5, paridad) lo hace un consultor a ~500 $/h. Integrarlo convierte a Attesta de "carpeta de
      evidencia" en herramienta que **produce** evidencia: la capa pegajosa de la cuña RRHH (NYC LL144 / FEHA).
      Riesgo: complejidad de integración y de encuadre ("tu organización declara", nunca "certificamos"). `alto · L`
- [ ] **⚠️ Vault de evidencia + paquete de auditoría firmado** — hoy cada control es un "done" autodeclarado
      **sin archivo adjunto**; sin el documento real el "% listo" no aguanta una auditoría. Incluye ZIP con
      manifiesto **SHA-256** verificable (la hash-chain del audit-trail ya existe). **El mayor salto de
      defensibilidad del producto.** `alto · L`
- [ ] **⚠️ Crosswalk ISO 42001 / NIST AI RMF** — mapear cada control a otros marcos: una evidencia sirve para N
      normas. Foso de upsell para equipos GRC; requiere tabla de correspondencias curada por el experto. `alto · L`
- [ ] **⚠️ Contenido regulatorio en INGLÉS (TAM EE. UU.)** — el chrome ya está traducido, pero el output legal se
      sirve solo en español por la "frontera legal". **No es traducir**: depende de que el experto valide cada
      texto legal EN. `alto · L` (cuello de botella = recurso experto)
- [ ] **⚠️ Ampliar el corpus de vigilancia + pipeline con fuente real** — el radar es el flywheel diferenciador,
      pero el "Analista" usa embeddings placeholder; ampliar a EBA/EIOPA, transposición nacional, ISO/NIST, donde
      ya se venden packs. Mantener siempre: la máquina **propone**, el humano **valida**. `medio · L`

### 0.H · Cómo retomar esta hoja de ruta tras un compact
1. Lee esta sección §0 completa (es el plan maestro; no se descarta nada).
2. El orden por defecto es **0.A → 0.B → 0.C → 0.D → 0.E → 0.F**, con **0.G** solo tras checkpoint del fundador.
3. Excepción recomendada: **la telemetría de 0.F** conviene adelantarla (medir antes de optimizar).
4. Cada ítem de *Foso/compliance* (packs, GPAI, crosswalk, corpus) pasa por el `compliance-domain-expert`
   **antes** de escribir texto regulatorio, y se registra en `MEMORY.md §10`.

---

## ⭐ 0-bis. Sesión 2026-07-23 — Landing, Vigilancia y BLINDAJE DE SEGURIDAD

**Todo desplegado a `main`.** Resumen para retomar:

### 0.1 · Landing + Vigilancia (8 PRs · #10–#15)
- Landing: card de **California** + chip de **Colorado (SB 26-189 · 2027)** en la rejilla de cobertura.
- Vigilancia (dashboard): banda de orientación (4 stats) · arreglo del hero duplicado · divisor "Ya en vigor" ·
  **estado interno visible** en hero/tarjetas (StatusChip) · **filtro por estado interno** en la cronología (`?s=`) ·
  **export del radar a PDF** (`/dashboard/vigilancia/informe` + botón "Descargar radar (PDF)").
- Home: widget de próximo hito enriquecido (estado interno + color de urgencia).
- **Decisión del fundador:** los artículos (Art./Anexo) del **dashboard se quedan en mono** (el rechazo del mono era
  SOLO para el landing).

### 0.2 · Seguridad (Fase 1 blindaje + red team, PRs #16–#22)
A petición del fundador ("que un hacker no pueda robar datos nuestros ni de usuarios"). **Auditoría + 3 rondas de red
team adversarial (83 agentes).** Resultado: **aislamiento entre organizaciones intacto en las 3 rondas**; se
encontraron y cerraron **2 fallas HIGH**; ronda 3 limpia (0 hallazgos).
- **Fase 1:** deps `npm audit` = 0 vulns (Next 16.2.11 + overrides sharp/postcss) · **CSP con nonce** (report-only
  estricto + enforce de lo seguro) · HSTS `preload` · **rate-limit** waitlist · cron `api/audit-verify` (tamper-detecting).
- **Fase 2 (red team):** (1) escalada **admin→owner** por INSERT directo (memberships/invitations) → **0024**;
  (2) **bypass de plan Enterprise** gratis por UPDATE directo → **0024 FIX 3 fue un no-op** (revoke de columna no recorta
  grant de tabla) → **rehecho bien en 0025** (revoke UPDATE de tabla + grant solo name/slug); (3) fuga LOW de estado de
  suscripción → **0025**; `plan.ts` dejó de fallar-abierto.
- **Regla aprendida:** verificar grants/revokes EJECUTANDO el exploit, no asumirlos.

### 0.3 · ✅ Migraciones 0023, 0024, 0025 — APLICADAS por el fundador (2026-07-23)
El fundador las pegó en el SQL Editor. Con esto las 2 fallas HIGH quedan **cerradas en la BD real**.

### 0.4 · 🔴 PENDIENTE TUYO restante de seguridad
- [ ] **Promover la CSP a `enforce`** — hoy la política estricta (anti-XSS) va en *Report-Only* (observa, no bloquea).
  Es un cambio de **1 línea** en `src/lib/security/csp.ts` (mover el bloque `reportOnly` a `enforced`). **Antes:**
  smoke-test en el preview de un PR → login (Supabase) + checkout (Stripe) + descargar radar, y confirmar que no hay
  violaciones que rompan. Avísame y lo hago + valido.

### 0.5 · 🟡 PENDIENTE MÍO / higiene continua de seguridad
- [ ] **Re-auditar tras conectar el flujo real de Stripe** (cobros/downgrades/reconciliación no se validan por código).
- [ ] **Regla continua:** toda tabla/función nueva nace con su **guard de pertenencia** por defecto (`org in
  (select private.user_orgs())`) — fue justo lo que le faltaba a `org_has_active_subscription`.

---

## 🔴 1. Pendiente TUYO (acciones manuales del fundador)

### 1.1 · Seguridad — rotar la clave de Stripe (URGENTE)
En una sesión anterior se pegó una **clave secreta LIVE de Stripe (`sk_live_…`) en el chat** →
tratarla como comprometida. **Rótala**: Stripe → *Developers → API keys* → en la Secret key →
**Roll key**. La nueva NUNCA se pega en el chat; va solo a variables de entorno de Vercel.

### 1.1-bis · Aplicar migración 0018 (diferenciación de planes) — RÁPIDO ⚠️ BLOQUEA EL GATING ENTERPRISE
La diferenciación de planes (free / preparación / enterprise) **ya está construida**, pero el
bloqueo por plan **solo se activa al aplicar la migración**. Sin aplicarla, la app sigue con acceso
completo (degradación segura). **Esto incluye las nuevas funciones Enterprise** (Multi-organización
`/dashboard/organizaciones` y SSO/controles avanzados `/dashboard/seguridad`, desplegadas 2026-07-22):
mientras 0018 no esté aplicada, `getOrgPlan` devuelve `enterprise` por defecto y **nadie queda
bloqueado**. Para que el gating por-organización que pidió el fundador surta efecto real:
aplicar 0018 **y** poner `organizations.plan = 'enterprise'` en las orgs que sí pagan Enterprise.
Para encenderla:
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

### 1.1-sexies · Migración 0022 (práctica prohibida en brechas) — ✅ APLICADA (2026-07-22)
Aplicada por el fundador y **verificada por API** (probe con la anon key: `select=prohibited` → HTTP 200; columna
inventada → HTTP 400 `42703 does not exist`, prueba de contraste). El gating queda activo. Añade la columna
`gap_items.prohibited` (boolean, default false) para que un control cuyo objeto es una **práctica
PROHIBIDA del Art. 5** (p. ej. reconocimiento de emociones en el trabajo, Art. 5.1.f) quede **fuera del cómputo de
"% listo"** y se trate como Inaceptable / revisión jurídica, en vez de contar como una brecha ordinaria. **Degradación
segura:** mientras no la apliques, la app funciona igual que hoy (todos los controles cuentan; el badge "Práctica
prohibida" se sigue viendo en la vista de *packs*, pero el ítem no se excluye del % ni aparece marcado en el gap/dossier
conectado). Para encenderla: pega **`supabase/migrations/0022_gap_prohibited.sql`** en el SQL Editor de Supabase (solo ese
archivo; es idempotente, `add column if not exists`). Sin impacto en datos existentes.

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

### 2.4 · i18n "INGLÉS TOTAL" — ✅ COMPLETADO y ✅ DESPLEGADO A PRODUCCIÓN (`main`, 2026-07-22)
El fundador pidió que la versión inglesa NO deje NADA en español y funcione igual que la española. **Hecho,
verificado y publicado a `main` (commit `c96aadb`)** a petición del fundador. Reconciliación con la regla dura: el contenido legal se tradujo, pero **cada texto legal lo validó el
`compliance-domain-expert`** (no traducción mecánica). Patrón: cada módulo mantiene el ES canónico + `_EN` validado +
selector locale (`*_BY_LOCALE`/`fn(x,locale)`, default ES); la fachada de datos resuelve el locale por cookie.
- ✅ Contenido `_EN` validado por experto: **5 policy-packs, risk-assessment, recommendations, regulatory-watch,
  audit, y las muestras demo de `mock-data`** (GAP_ITEMS, SAMPLE_ASSESSMENTS/ACTION_TASKS/AUDIT/REG_*/BIAS).
- ✅ Wiring: API locale en los 5 módulos (Fase 1); fachada locale-aware (getRegulatoryEvents/getAuditLog/
  applyPolicyPack + mock-repo getters); todos los consumidores (reportes, plan, packs, riesgo, RiskWizard incl. su
  bloque de resultado, vigilancia, actividad, informes, /demo, overview).
- ✅ Narrativas legales EN validadas (dossier s1–s5 + RATIONALE_FALLBACK, informe/gap-informe summaryParagraph,
  briefing de vigilancia, LegalNotes por locale). ✅ Limpieza: `Anexo`→`Annex`, `Directiva…UE`→`Directive…EU`,
  `«»`→`""`, ortografía americana — solo en las estructuras `_EN`.
- ✅ **Verificación:** escaneo integral en modo demo (build sin `.env.local`, cookie `NEXT_LOCALE=en`) de 23 rutas
  filtrando el payload RSC → **cero texto español** en la versión inglesa; el bloque de resultado del RiskWizard
  verificado con Playwright en 4 clasificaciones. tsc+lint+build exit 0. `/` sigue siendo la landing ES (por diseño;
  el inglés vive en `/en`).
- **Nota — datos persistidos:** en modo CONECTADO, los datos ya guardados por el usuario (gap_items, rationale de
  evaluaciones históricas, eventos publicados) se muestran en el idioma en que se guardaron — no son retraducibles.
  Solo el contenido curado/computado en display sale por locale. En modo demo (mock) todo sale EN.
- **Pendiente menor / diferido:** el enum `Effort` (bajo/medio/alto) en `RecommendationCard` — componente NO
  importado en la app (código muerto), no renderiza; traducir si algún día se usa. Sigue pendiente de validación del
  experto (si se quisiera) los enums de estado sueltos de `regulatory-watch` ya cubiertos por selector.

### 2.3 · Internacionalización ES/EN — Inc 0–5 HECHOS (en la rama, 2026-07-22)
Toda la UI (web pública + auth + dashboard) es bilingüe ES/EN. **En la rama `claude/init-3bwfhm`, NO desplegado a `main`**
(el fundador decidió publicar cuando dé el visto bueno). Ver MEMORY §10 (2026-07-22). ✅ Inc 0–3 web pública + SEO,
✅ Inc 4 auth por cookie, ✅ Inc 5a–5e dashboard (shell/nav/toasts, genéricos, formularios, chrome de páginas
regulatorias, enums de dominio).
- **Falta que el fundador decida:** publicar a producción (`main`) — es un hito coherente y completo por sí mismo.
- **Pendiente de validación del EXPERTO antes de exponer en EN** (hoy en español, degradación segura):
  1. ✅ **HECHO (2026-07-22).** Etiquetas de `regulatory-watch.ts` (`FRAMEWORK_*`, `JURISDICTION_*`, tipos de evento) +
     el catálogo `REGULATORY_EVENTS_EN` completo: traducidas y **firmadas por el `compliance-domain-expert`**
     (veredicto APROBADO; verificó denominaciones oficiales en EUR-Lex: Annex I/III, Directive 2011/93/EU, Regulation
     (EU) 2024/1689; pulido Ch.→Chapter aplicado). Se retiró el flag "pendiente de sign-off" del comentario de cabecera.
  2. **Inc 6 · Cuerpo de los PDF** (dossier/informe/gap-informe): decisión tomada = el cuerpo legal se mantiene en
     **español** aunque la UI esté en inglés (regla dura). `ScopeNote` ya es locale-aware y `LEGAL_*_BY_LOCALE` ya tienen
     EN validado; si en el futuro se quiere el documento entero en EN, requiere validación del experto del cuerpo completo.
- **Diferidos técnicos (míos):** (a) leer `headers()` en el root layout volvió dinámicas todas las rutas (la landing dejó
  de prerenderarse estática) — optimizable con root layouts separados por route-group si el TTFB lo pidiera; (b)
  auto-detección `Accept-Language` NO se implementó (decisión: no forzar redirección; como mucho un banner "View in
  English" fuera de MVP); (c) el toast `pack-applied` dice "policy pack RRHH" fijo aunque se aplique otro pack
  (preexistente, menor).

### 2.2 · Ampliar el foso — leyes de EE. UU. de contratación con IA — ✅ AMPLIADO (2026-07-22)
- ✅ **NYC LL144 + Illinois (HB 3773 + AIVIA)**: ya estaban en el pack `us-hiring` (11 controles, validado 2026-07-18).
- ✅ **California (2 packs nuevos, validados por el experto, 2026-07-22)**: `us-ca-feha` (FEHA/ADS en empleo, en vigor
  oct-2025, 11 controles) y `us-ca-admt` (CCPA/CPPA ADMT en empleo, empleador exigible ene-2027, 10 controles). Cableados
  en `index.ts` (ES+EN). Ver MEMORY §10 (2026-07-22).
- ✅ **Colorado**: el radar ya refleja **SB 26-189** (no la derogada SB 24-205) — no requirió corrección.
- **Pendiente antes de GA:** validación por **abogado de empleo/privacidad de California** de los 2 packs de CA (el experto
  dejó citas conservadoras en algunos números de sección por no poder parsear el PDF oficial; conviene confirmarlos).
- ✅ **Eventos de vigilancia (radar) de California — HECHO (2026-07-22).** 4 eventos validados por el experto (ES+EN) en
  `regulatory-watch.ts`: FEHA ADS en vigor (1-oct-2025), reglamento CCPA/CPPA ADMT vigente (1-ene-2026), cumplimiento del
  empleador ADMT (1-ene-2027), entrega de attestation de risk assessment a la CPPA (1-abr-2028). Nuevos marcos `us-ca-feha`
  y `us-ca-admt` + jurisdicción `us-ca` (aparecen solos en el toggle/chips porque derivan de `JURISDICTION_ORDER`; se corrigió
  además la lista blanca de `jurisdiction-actions.ts` para derivarla de `JURISDICTION_ORDER`). Default demo ahora incluye `us-ca`.
- **Follow-up OPCIONAL restante (no pedido):** **Texas TRAIGA** (HB 149, ene-2026) solo como **radar** — deberes finos al
  empleador privado, no da para pack. NO construir aún: bias-testing propio, ISO/NIST, shadow-AI.

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

**Enterprise por-organización (2026-07-22, desplegado a `main`)**: Multi-organización
(`/dashboard/organizaciones` — portfolio de entidades + crear entidad) y SSO/controles avanzados
(`/dashboard/seguridad` — placeholder honesto) como funciones **exclusivas de Enterprise**, gateadas
`requires="enterprise"`. El plan se resuelve por org activa → se aplica a todos los miembros y solo en
esa org; al cambiar a otra org sin Enterprise se bloquean. ⚠️ **Solo bloquea de verdad con la migración
0018 aplicada** (ver §1.1-bis). La página de Seguridad es un placeholder; el SSO corporativo real (SAML/
OIDC) aún no está cableado — el SSO **social** (Google/Microsoft) es cosa aparte (§1.6).

**Construido pero inactivo hasta configurar**: cobro por suscripción Stripe (migración 0017 + webhook +
paywall) y verificación de correo por código OTP.

El **foso automatizado** (Vigía + Analista + Validador) está completo y verificado — ver MEMORY.md §11.

---

## 📌 Cómo retomar en la próxima sesión

1. **Lee primero §0 — HOJA DE RUTA 360° (plan maestro por sprints).** Decisión del fundador (2026-07-30):
   **se hace todo, por sprints**. El orden por defecto es 0.A → 0.B → 0.C → 0.D → 0.E → 0.F; las apuestas
   grandes (0.G) solo tras checkpoint. Si no hay instrucción nueva, continúa por donde quedó el sprint en curso.
2. Lee **MEMORY.md** (§11 "RETOMAR AQUÍ") y el resto de este archivo.
3. Pregunta al fundador en qué punto está de los pendientes 🔴 (sobre todo Stripe y dominio).
4. Rama de trabajo: `claude/init-3bwfhm`; PR a `main` y merge al pasar CI (`verify`); Vercel redespliega solo.
5. Verificación: `npm run build` + `npm run lint` + `npx tsc --noEmit`; backend real por curl.
   (⚠️ Sprint 2 añade **Vitest** — cuando exista, incluir `npm test` en la verificación.)

---

## Deuda técnica pendiente (P4 — auditoría 2026-07-21)

Mantenibilidad, **sin impacto de usuario**; no urgente. Del escaneo completo:

- [ ] Unificar los **3 formateadores de cuenta-atrás** en español (`task-reminders.ts:dueLabel`,
  `BiasAuditBadge.tsx:countdownText`, `reminders/email.ts:countdown`) en un helper único en `lib/`.
  **DIFERIDO a propósito (2026-07-22):** son strings en español ("vence en N días"); con la app ya bilingüe, un
  helper es-ES fijo *cementaría* un hueco de i18n en vez de resolverlo. Hacerlo bien implica decidir si esos
  textos deben ser locale-aware → decisión de producto, no simple dedup. Se deja para esa tanda.
- [x] ~~Fusionar **`daysUntil`** (`regulatory-watch.ts`) y **`daysUntilDate`** (`bias-audit.ts`)~~ ✅ HECHO
  (2026-07-22). Nueva `src/lib/date.ts` con la implementación única (`parseIsoDateUTC` + `daysUntilDate(string|null)`);
  ambos módulos delegan (se probó que el cálculo era idéntico: medianoche UTC − medianoche UTC de hoy; `NaN`/`null`
  en fecha inválida). Firmas públicas intactas (`daysUntil` sigue devolviendo `number`). Verificado tsc+lint+build.
- [ ] Centralizar los **~7 formateadores de fecha** `toLocaleDateString("es-ES", …)` repartidos por páginas
  (facturación, informes, vigilancia, equipo, dossier) en 2-3 helpers nombrados (`fmtFechaLarga`/`fmtFechaCorta`).
  **DIFERIDO a propósito (2026-07-22):** mismo motivo que la cuenta-atrás — el `es-ES` fijo es un latente de i18n; el
  helper correcto es locale-aware (cambia el render en EN), que es cambio de comportamiento, no "sin impacto de usuario".
- [x] ~~Reutilizar **`RISK_ORDER`** en los sitios que aún re-declaran el orden de niveles
  (`CandidateReviewControls.tsx`, `analista/llm.ts`, `reg-pipeline-actions.ts`)~~ ✅ HECHO (2026-07-22). Las 4
  redeclaraciones locales de `RISK_LEVELS` (incluida la de `data/actions.ts`) ahora importan `RISK_ORDER` de
  `mock-data` (fuente única del orden de niveles). Verificado tsc+lint+build.
- [x] ~~Feature-flag explícito / nota del módulo **`analista/`**~~ ✅ Ya estaba (nota B.0/B.1 + `TODO(B.1)`
  en `voyage.ts`) para que no quede como código semi-muerto.

### Seguridad — ítems BAJA documentados (auditoría 2026-07-21)
- [ ] `api/reminders/run`: exigir **POST** (o token CSRF) en el modo sesión (hoy acepta GET → CSRF de bajo
  impacto). Tocar cuando se active el cron de correos.
- [x] ~~`submitWaitlist`: **rate-limit / captcha**~~ ✅ HECHO (2026-07-23). Throttle por IP (5/10min, ventana deslizante
  en memoria) + cota de longitud de email, además del honeypot cliente. Ver §0.2.
- [ ] `saveRiskAssessment`: recomputar `rationale/citations/obligations` en servidor desde `answers` (hoy se guardan
  tal cual llegan del cliente → integridad intra-tenant, sin XSS). Coherencia con "contenido legal determinista".

### Follow-ups de la tanda P1 (auditoría 2026-07-21)
- [x] ~~**CSP estricta con nonce**~~ ✅ CONSTRUIDA (2026-07-23) en el middleware (`src/lib/security/csp.ts`). Nonce por
  request; enforce de lo seguro (frame-ancestors/form-action/base-uri/object-src) + política estricta en **Report-Only**.
  **PENDIENTE:** promoverla a `enforce` tras smoke-test en preview (login/checkout/radar) — ver §0.4.
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
- [x] ~~`npm audit`: 2 moderate en `postcss`~~ ✅ HECHO (2026-07-23). Next 16.2.11 + `overrides` (`sharp ^0.35.0`,
  `postcss ^8.5.10`) → **0 vulnerabilidades**. Ver §0.2.
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
- [x] ~~**RiskWizard — gate de perfilado del Art. 6(3):**~~ ✅ HECHO (2026-07-22, validado por el experto). "Perfila
  personas" dejó de ser una opción del single-select de excepciones; ahora es una **pregunta binaria previa**
  (`profiling_gate`, solo si candidato a alto riesgo) que, si es "sí", fuerza alto riesgo con rationale dedicado
  (`high_profiling`) citando el Art. 6(3) párr. 2 — el perfilado anula toda excepción. La pregunta de excepción se
  omite cuando hay perfilado. ES+EN.
- [x] ~~**RiskWizard — cul-de-sac:**~~ ✅ HECHO (2026-07-22). Tras guardar, el bloque de éxito añade el CTA "Detectar
  brechas con un policy pack" → `/dashboard/packs?system=<id>`; la página de packs ahora honra `?system=` y
  preselecciona ese sistema en el formulario de aplicar pack.
- [ ] **Sign-off jurídico antes de GA:** el propio `LegalNote` admite "pendiente revisión por abogado UE". Revisar
  disclaimers + reglas del clasificador + los 5 packs con un abogado de IA UE antes de producción. (Fundador.)
- [ ] **Diseño (diferidos BAJA del crítico):** paleta de riesgo poco diferenciable en daltonismo (3 cálidos vecinos);
  hex hardcodeado en `HeroPreview` (puntos del navegador falso) y avatares de `WelcomeGuide` → tokens de tono; targets
  táctiles de la nav móvil ~32px (<44px reco); retorno de foco en `MobileNav`; posición del toast en móvil.
- [ ] **Ideas de foso (estratégico):** benchmarking anónimo cross-tenant (network effect), integraciones HRIS/model
  registry/ticketing (pegajosidad + activación), paquete de auditoría firmado (ZIP con manifiesto SHA-256 verificable).
- [ ] **Narrativa (mejoras no ejecutadas):** subir `UseCaseStory` aún más arriba (tras RecruitmentFocus); tabla comparativa
  "Attesta vs consultor vs Excel"; fuente para la cifra de mercado de `WhyNow` (o moverla a un deck de inversión).
- [x] ~~**Policy packs — tipo "prohibido" propio (a raíz del pack `gestion-trabajadores`, 2026-07-21).**~~ ✅ HECHO
  (2026-07-22, validado por el `compliance-domain-expert`). Nuevo flag `prohibited?: boolean` en `PolicyControl` y
  `GapItem`. Marcado **solo** `emociones-prohibicion` (Art. 5.1.f) — el experto confirmó que `transparencia-chatbot-emociones`
  sigue siendo brecha ordinaria de Art. 50 (su objeto es transparencia; la mención al Art. 5 es solo advertencia). Regla:
  marcar `prohibited` cuando el OBJETO del control ES la práctica del Art. 5, no cuando meramente se cita. Los ítems
  prohibidos quedan **fuera del cómputo de "% listo"** (`recomputeReadiness` los excluye) y se renderizan como **Inaceptable
  / "Práctica prohibida (Art. 5)"** con acción "Revisión jurídica / cese de uso" y nota de por qué no cuentan, en gap +
  dossier + packs (ES+EN). Persistencia por **migración 0022** (ver §1.1-sexies) con degradación segura si no está aplicada.
  - **Diferido menor (no bloqueante):** el "override/tope" que el experto recomendó (banner en la cabecera del sistema que
    domine el "% listo" mientras exista una práctica prohibida sin resolver) NO se implementó aún; hoy la señal es el badge
    Inaceptable + la nota. Y no se inyectó un ítem prohibido en el dataset demo (el badge sí se ve en la vista de *packs* en
    demo). Ambos, si se quieren, en una iteración futura.
