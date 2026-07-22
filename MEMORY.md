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

- **77%** de las empresas reconoce que su adopción de IA avanza más rápido que su capacidad de gobernarla
  (**IBM**, estudio jun-2026, 2.000 CIO/CTO en 33 países). ⚠️ **NO uses "78%"** (a secas): esa cifra venía de un press
  release de proveedor (Vision Compliance, conflicto de interés); el 77% de IBM es la fuente creíble y más nueva que la
  sustituye (actualizado 2026-07-21, ver §10).
- **Más de la mitad** no tiene un inventario formal de sus sistemas de IA (Cloud Security Alliance, nota 2026).
  ⚠️ **NO uses "83%"**: no tiene fuente independiente sólida.
- Hoy se resuelve con **hojas de cálculo + consultores a ~$500/hora**.
- Coste de compliance para grandes empresas estimado en **$8–15M**.
- Multas de hasta **€35M o 7% de facturación** (Art. 99; más duras que el GDPR).

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

- **2026-07-22** · **P2 item 7: hero elevado.** Visual del hero mejorado (sin copy regulatorio): (1) el mock del
  producto flota ahora sobre un **suelo atmosférico** de gradiente (técnica Linear) con tokens `--color-brand-soft`/
  `--color-seal-soft` (theme-aware, nada de hex sueltos); (2) indicador **"En vivo"** con punto de pulso (`motion-safe:
  animate-ping`) junto al título del dashboard → sensación de "producto trabajando" (estilo Vanta). Verificado en tema
  claro y oscuro. Queda de P2: item 10 (sistema tipográfico).

- **2026-07-22** · **P2 (1er PR): sección de evidencia "Proof" + eyebrow de categoría + corrección de mono.**
  Continuación del estudio del landing. (1) Nueva sección **`Evidence`** tras "Cómo funciona": showcase de evidencia
  declarada (dossier PDF mock, entrada de audit-log inmutable con visual de cadena/sello, anillo SVG "% listo" al 78%),
  encuadre "evidencia que tu organización declara, no un veredicto nuestro" + disclaimer. Copy con vocabulario ya vetado
  (evidencia declarada, preparación para auditoría, clasificación orientativa); sin términos prohibidos. (2) **Decisión de
  titular** (checkpoint del fundador): se **mantiene** el H1 "Contrata con IA sin miedo a la auditoría" (gancho emocional +
  cuña RRHH) y el claim de categoría pasa al **eyebrow** ("El sistema de registro de tu gobernanza de IA · RRHH"). (3)
  **Corrección:** las pills de la rejilla `Coverage` pasaron de `font-mono` a sans, para honrar la decisión del fundador de
  NO usar mono en artículos/IDs (P1 las había dejado en mono por descuido). Bilingüe ES/EN; lint+tsc+build verdes.
  **Pendiente P2:** elevar visual del hero (item 7), refinar sistema tipográfico (item 10).

- **2026-07-22** · **Estudio comparativo del landing + mejoras P1 (contra Vanta/Drata/Secureframe y Linear/Stripe/Vercel).**
  A petición del fundador se hizo una crítica del landing comparándolo con las mejores páginas del sector y de diseño (dos
  agentes de investigación) + radiografía de nuestro landing. Veredicto: ya está en el tramo alto; faltan movimientos
  quirúrgicos. Documento visual publicado (artifact `https://claude.ai/code/artifact/b94a68fc-1bf7-4392-ab73-b733f83cf0b2`).
  **Implementado P1 (rama `claude/init-3bwfhm` → PR hacia main):** (1) nueva sección **Coverage** = rejilla de cobertura de
  marcos anclada al deployer (EU AI Act 14·26·27·50·86, ISO 42001, NIST AI RMF, NYC LL144, Illinois AIVIA/HB 3773) + banda
  "en el radar" (Colorado SB 205, Texas TRAIGA) + disclaimer; (2) **TrustStrip** rehecho: de "sectores" a 4 señales reales
  (cero LLM/determinista, datos UE, registro inmutable, revisado por experto); (3) micro-stats en tarjetas de Módulos
  (readiness/tiempo, copy seguro); (4) 3 verbos en "cómo funciona" ("Inventaría tu IA · Clasifica el riesgo · Prueba que
  estás listo"); (5) CTA "Explora la demo en vivo · sin llamada de ventas · sin registro". Copy regulatorio **validado por
  compliance-domain-expert** (Colorado/Texas → radar por aplazamiento/alcance; Illinois anclado en AIVIA+HB 3773).
  **Descartado por el fundador:** mono para etiquetas técnicas (Art. 26/IDs). **Follow-ups:** candidata card de California
  (packs FEHA/ADS + CCPA/CPPA ADMT ya existen); verificar que `regulatory-watch.ts` trate Colorado como radar (fecha
  1-ene-2027); P2 pendiente (elevar visual del hero, sección de evidencia "Proof", decisión de titular categoría, sistema
  tipográfico). Sign-off de abogado UE/EE.UU. sobre etiquetas de artículos sigue pendiente pre-GA.

- **2026-07-22** · **Documento maestro regenerado y actualizado + versión en inglés (artifacts).** A petición del
  fundador se actualizó la guía maestra (recorrido por cada pantalla con capturas reales anotadas) al estado actual del
  producto y se creó una versión paralela en inglés. Como las fuentes del artifact original eran efímeras (scratchpad),
  se regeneró: se recuperó el esqueleto de texto del artifact viejo (WebFetch + strip de data-URIs), se reusó su CSS/diseño
  verbatim, se reescribió el contenido (facturación $120, bilingüe ES/EN, gating Enterprise por-org con Organizaciones +
  Seguridad/SSO, 7 policy packs, foso EE. UU. con California FEHA/ADMT, práctica prohibida Art. 5 fuera del "% listo",
  gate de perfilado Art. 6(3), Vigía/Analista/Validador, hash-chain del audit-trail), y se tomaron **capturas nuevas en
  modo demo** (Playwright + headless_shell de /opt/pw-browsers; ES por defecto y EN con cookie NEXT_LOCALE=en) que se
  incrustaron como data-URIs vía script (sin cargar base64 en contexto). **URLs:**
  - ES (actualizado en su URL existente): `https://claude.ai/code/artifact/1911e70d-ca58-4424-b4b2-b9e720e5d544`
  - EN (nuevo): `https://claude.ai/code/artifact/7ecd0c31-642f-4a48-8eee-d2c8bd26b947`
  Pipeline de regeneración (body-es/en.html + build.mjs + capture*.mjs + shots/) quedó en el scratchpad **efímero**; si
  hay que rehacerlo, repetir capturas + embed. Ambos artifacts privados en claude.ai.

- **2026-07-22** · **Limpieza técnica (P4): fuente única de días-restantes y del orden de riesgo.** Sin impacto de
  usuario. (1) `daysUntil` (regulatory-watch) y `daysUntilDate` (bias-audit) duplicaban el mismo cálculo de días
  restantes → se extrajo a `src/lib/date.ts` (`parseIsoDateUTC` + `daysUntilDate`); ambos módulos delegan, firmas
  públicas intactas (probado equivalente). (2) Cuatro redeclaraciones locales de `RISK_LEVELS = [...]` (en
  `data/actions.ts`, `data/reg-pipeline-actions.ts`, `analista/llm.ts`, `CandidateReviewControls.tsx`) ahora usan
  `RISK_ORDER` de mock-data como fuente única del orden de niveles. **Diferidos a propósito:** los formateadores de
  fecha/cuenta-atrás en `es-ES` fijo — con la app ya bilingüe, unificarlos en un helper es-ES cementaría un hueco de
  i18n; el helper correcto es locale-aware (cambio de comportamiento), así que es decisión de producto, no dedup.

- **2026-07-22** · **Práctica prohibida (Art. 5) fuera del "% listo": nuevo flag `prohibited` en los policy packs.**
  Problema de integridad de marca: un control cuyo objeto ES una práctica PROHIBIDA del Art. 5 (riesgo inaceptable —
  p. ej. reconocimiento de emociones en el trabajo, Art. 5.1.f) se insertaba como `gap_item` "missing" que computaba en
  el "% listo" igual que una brecha ordinaria. Una práctica prohibida no se "prepara para auditoría", se cesa; contarla
  daba un falso confort. **Decisión (validada por el `compliance-domain-expert`):** flag `prohibited?: boolean` en
  `PolicyControl` + `GapItem`; se marca **solo cuando el OBJETO del control ES la práctica del Art. 5** (por eso solo
  `emociones-prohibicion`; `transparencia-chatbot-emociones` sigue como brecha ordinaria de Art. 50, y `scoring-social-limite`
  / `practicas-manipulativas` siguen como controles de "mantente dentro de límites"). Los ítems prohibidos quedan **fuera
  del cómputo** (`recomputeReadiness` los excluye; el dossier los saca de `openGaps`/`criticalOpen`) y se renderizan como
  **Inaceptable / "Práctica prohibida (Art. 5)"** con acción "Revisión jurídica / cese de uso" + nota de por qué no cuentan,
  en gap + dossier + packs (ES+EN, copy del experto). Persistencia por **migración 0022** (`gap_items.prohibited` boolean
  default false) con **degradación segura** triple: `applyPolicyPack` reintenta el insert sin la columna, `getGapItems`
  reintenta el select, y `recomputeReadiness` cae al cálculo clásico — si 0022 no está aplicada, la app funciona como hoy.
  Verificado con tsc+lint+build (exit 0). Diferido menor: el "override/tope" (banner que domine el % mientras haya una
  práctica prohibida sin resolver) y un ítem prohibido en el dataset demo — no bloqueantes.

- **2026-07-22** · **Radar de vigilancia de California (4 eventos ES+EN) — complemento de los 2 packs de CA.**
  A petición del fundador, se añadieron los eventos de radar de California a `regulatory-watch.ts` (validados por el
  `compliance-domain-expert` contra Civil Rights Council y CPPA): FEHA ADS en vigor (1-oct-2025), reglamento CCPA/CPPA
  ADMT vigente (1-ene-2026), cumplimiento del empleador ADMT (1-ene-2027) y entrega de attestation de risk assessment a la
  CPPA (1-abr-2028, redactado conservador). Se añadieron 2 marcos (`us-ca-feha`, `us-ca-admt`) y la jurisdicción `us-ca`
  a los tipos `RegFramework`/`RegJurisdiction` y a TODOS los `Record<…>` acoplados (FRAMEWORK_META/_EN, FRAMEWORK_LABEL/_EN,
  JURISDICTION_ORDER, JURISDICTION_LABEL/_EN). California aparece sola en el toggle de jurisdicciones y los chips porque
  ambos derivan de `JURISDICTION_ORDER`. **Corrección de paso:** `jurisdiction-actions.ts` tenía una lista blanca
  hardcodeada (`ALLOWED`) que NO incluía `us-ca` → una org real no podría guardar California; ahora deriva de
  `JURISDICTION_ORDER` (fuente única, no vuelve a desincronizarse). Default demo de `getOrgJurisdictions` ahora incluye
  `us-ca` para que se vea en la demo. Copy de marca respetado ("attestation" = nombre propio de la entrega a la CPPA §7157,
  no afirmación de Attesta). tsc+lint+build exit 0.

- **2026-07-22** · **Foso EE. UU. ampliado: 2 packs nuevos de California (FEHA/ADS + CCPA/CPPA ADMT). Ahora 7 packs.**
  El fundador pidió ampliar el foso de EE. UU. El experto verificó (fuentes de despachos + agencias, snapshot jul-2026) que el
  alcance que proponía `PENDIENTES §2.2` (NYC LL144 + Illinois) **ya estaba construido** (pack `us-hiring`) y que **Colorado
  ya está al día** (radar en SB 26-189, no SB 24-205 — la "corrección" del experto se basaba en MEMORY, no en el código real).
  Recomendación del experto para lo NUEVO: **California**, la jurisdicción de empleo más grande de EE. UU. y lo único **ya
  exigible**. Se construyeron 2 packs, cada uno redactado y validado por el `compliance-domain-expert` (regla dura):
  - **`us-ca-feha`** (11 controles) — California Civil Rights Council, regs de **Automated-Decision Systems en empleo** bajo
    **FEHA** (2 CCR §11008 y ss.), **en vigor desde 1-oct-2025**. Empleador = obligado directo (sin reencuadre provider/
    deployer, salvo el control de agentes/vendedores). Ejes: identificar ADS, impacto dispar (anti-bias testing como
    evidencia declarada — Attesta NO lo ejecuta), retención ≥4 años (§11013), el ADS no sustituye la evaluación
    individualizada, triaje de indagación médica/discapacidad, responsabilidad por agentes.
  - **`us-ca-admt`** (10 controles) — **CCPA/CPPA Automated Decisionmaking Technology (ADMT)** en decisiones significativas
    de empleo (Cal. Code Regs. tít. 11), vigente 1-ene-2026, **cumplimiento del empleador exigible 1-ene-2027**. Ejes:
    alcance ADMT + excepción "meaningful human involvement", aviso previo (§7220), risk assessment documentado (§7150 ss.,
    Attesta NO lo ejecuta/valida), opt-out (§7221, con sus excepciones asimétricas), acceso a la lógica (§7222), contrato
    con el vendedor (§7051), política de privacidad, auditoría de ciberseguridad (§7120, solo por umbral).
  - Cableados en `policy-packs/index.ts` (ES + `_EN`, mismo patrón). Copy de marca respetado (suavizado un "CCPA-compliant
    contract" → "contract that conforms to the CCPA" en EN; el resto eran negaciones/hechos sobre la norma). tsc+lint+build
    exit 0. **Estado del foso: 7 packs** (RRHH UE, gestión trabajadores, atención cliente/GenAI, crédito/seguros, EE.UU.
    contratación [NYC+IL], **California FEHA/ADS**, **California ADMT**).
  - **Pendiente antes de GA (en PENDIENTES):** validación por abogado de empleo/privacidad de California de ambos packs
    (igual que el resto). Follow-ups opcionales: Texas TRAIGA solo como radar; eventos de vigilancia (radar) para California.

- **2026-07-22** · **RiskWizard: gate binario de perfilado (Art. 6(3)) + CTA anti-cul-de-sac; y sign-off del experto del EN de vigilancia.**
  El fundador eligió dos frentes: mejorar el RiskWizard y cerrar la i18n EN de vigilancia. Ambos tocan contenido
  regulatorio → validados por el `compliance-domain-expert`.
  - **Gate del Art. 6(3) (defendibilidad del clasificador).** Antes, "perfila personas" era una opción más del
    single-select de excepciones → un sistema que hacía una tarea procedimental estrecha **y además** perfilaba podía
    escapar a "limitado". El experto confirmó (texto literal del **Art. 6(3), párr. 2**: "se considerará siempre de alto
    riesgo cuando efectúe la elaboración de perfiles de personas físicas") que el perfilado es un **override absoluto**.
    Implementado en `risk-assessment.ts`: nueva pregunta binaria `profiling_gate` (valores `yes`/`no`, `onlyIfHighCandidate`,
    antes de la de excepción, con `help` basado en la def. de perfilado del RGPD Art. 4(4)); si `yes` → alto riesgo directo
    con rationale dedicado `high_profiling` (ES+EN, cita Art. 6(3) párr. 2); `classify()` chequea el gate ANTES de leer la
    excepción (una excepción obsoleta se ignora); `visibleQuestions` oculta la excepción cuando hay perfilado; se **quitó**
    la opción `profiling` de la pregunta de excepción (redundante y reabría el hueco). ES+EN, wording del experto.
  - **CTA anti-cul-de-sac.** Tras guardar la autoevaluación, el bloque de éxito ofrece "Detectar brechas con un policy
    pack" → `/dashboard/packs?system=<id>`; `packs/page.tsx` ahora lee `?system=` y **preselecciona** ese sistema en el
    form de aplicar pack (cose el flujo riesgo→packs sin depender del checklist efímero).
  - **Sign-off EN de vigilancia (i18n).** Hallazgo: el EN de `regulatory-watch.ts` (labels + `REGULATORY_EVENTS_EN`) YA
    estaba traducido por la "INGLÉS TOTAL"; el archivo solo arrastraba un comentario obsoleto marcando los statute-tokens
    como "pendientes de sign-off". El experto revisó línea a línea contra EUR-Lex → **APROBADO** (Annex I/III, Directive
    2011/93/EU, Regulation (EU) 2024/1689 correctos; sin copy prohibido; framing deployer intacto). Se retiró el flag y se
    aplicó el único pulido sugerido (Ch.→Chapter en el evento GPAI, para consistencia con la prosa). `PENDIENTES §2.3.1` cerrado.
  - Verificado: tsc + eslint + build (exit 0). En la rama; pendiente decisión de publicar a `main`.

- **2026-07-22** · **Gating Enterprise por-organización: Multi-organización y SSO como funciones exclusivas.**
  El fundador pidió que la suscripción Enterprise se aplique **a todos los miembros** de la organización que la tiene,
  **solo en esa organización**, y que al **cambiar a otra org sin Enterprise** se **bloqueen** las funciones exclusivas.
  Hallazgo: el gating **ya era por-organización activa** (`getActiveOrg` cookie `attesta_org` → `getOrgPlan(orgId)` →
  `orgHasTier`; el plan vive en `organizations.plan`, es org-level → aplica a todos los miembros por igual; `switchOrg`
  cambia cookie + revalida → re-resuelve). El hueco: **ninguna función estaba marcada como enterprise-only** (todos los
  `PaidGate` usaban el default `preparacion`). El fundador confirmó (2 preguntas) que **solo** Multi-organización y SSO
  son exclusivas de Enterprise; Vigilancia/Plan/Packs **se quedan en Preparación** (descartó subirlas).
  - **Implementado:** 2 rutas nuevas gateadas `requires="enterprise"` (patrón `layout.tsx` + `PaidGate`, como vigilancia):
    (1) **`/dashboard/organizaciones`** — portfolio multi-entidad (lista orgs con plan/rol/activa + `switchOrg`) y
    **crear entidad** (`NewEntityForm` reutiliza la RPC `create_org_and_owner`; la nueva org nace `free` y **NO** se
    auto-cambia para no perder el acceso Enterprise de la activa). (2) **`/dashboard/seguridad`** — SSO + controles
    avanzados, **placeholder honesto** (estado "No configurado", incluye SAML/OIDC/dominios/aprovisionamiento, CTA
    "Solicitar activación" → facturación; sin fingir que está activo, dejando el gate listo). Sidebar: 2 items con
    `requires:"enterprise"` (candado automático) + `lockedTitleEnterprise`. i18n: namespaces `dashboard.organizations` y
    `dashboard.security` en es+en (100% dirigido por diccionario → sin fugas de español; el `Paywall` ya soportaba
    `tier="enterprise"`). **Sin cambios de BD** (columna `plan` = migración 0018 ya existe; RPC ya existe).
  - **Cómo se concede Enterprise a una org (manual, ventas "A medida"):** poner `organizations.plan = 'enterprise'` en
    Supabase. Stripe solo sube a `preparacion`; Enterprise no es self-serve por diseño.
  - Verificado: tsc + eslint + build (exit 0); ambas rutas compilan como dinámicas.

- **2026-07-22** · **"INGLÉS TOTAL": la versión EN no deja NADA en español (contenido regulatorio incluido).**
  El fundador pidió que la versión inglesa funcione igual que la española sin nada en español. Se reconcilió con la
  regla dura de "contenido legal validado por experto" traduciendo TODO el contenido regulatorio pero con el
  **`compliance-domain-expert` validando cada texto legal EN** (no traducción mecánica). Se añadió `_EN` validado a
  policy-packs (5), risk-assessment, recommendations, regulatory-watch, audit y las muestras demo de `mock-data`;
  cada módulo expone selector locale (`*_BY_LOCALE`/`fn(x,locale)`, default ES) y la **fachada de datos resuelve el
  locale por cookie internamente** (getRegulatoryEvents/getAuditLog/applyPolicyPack + mock-repo). Narrativas
  hand-written (dossier s1–s5, RATIONALE_FALLBACK, summaryParagraph de informes, briefing de vigilancia) con EN
  validado por locale. Bloque de resultado del RiskWizard traducido (verificado con Playwright). Limpieza:
  `Anexo→Annex`, `Directiva…UE→Directive…EU`, `«»→""`, ortografía americana, solo en `_EN`. **Verificado por escaneo
  integral** (build modo demo + cookie `NEXT_LOCALE=en`, 23 rutas, filtrando payload RSC) → cero texto español;
  tsc+lint+build exit 0. Sigue en la rama (no desplegado a `main`). **Límite conocido:** datos que el usuario ya
  guardó en modo conectado (gap_items, rationale histórico, eventos publicados) se muestran en su idioma de guardado
  (no retraducibles); en demo todo sale EN. Recordatorio: validación por abogado UE del EN sigue pendiente antes de GA
  (igual que el ES) — es orientación de producto, no asesoría legal.

- **2026-07-22** · **i18n ES/EN COMPLETA (web pública + auth + dashboard) — Inc 0–5, en la rama.** Cierre de la
  internacionalización que pidió el fundador (alcance web + dashboard, URLs `/en`). Estado: **todo en la rama
  `claude/init-3bwfhm`, NO desplegado a `main`** por decisión del fundador (se publica cuando él dé el visto bueno).
  Recorrido: **Inc 0–3** web pública (andamiaje, `<html lang>`, landing `/en`, SEO/hreflang) — ver entrada más abajo.
  **Inc 4** auth por cookie (login/onboarding/reset + `LocaleToggleCookie`). **Inc 5** dashboard por clusters:
  **5a** shell+`I18nProvider`+nav+toasts · **5b** genéricos/estados vacíos/onboarding/botones · **5c** formularios y
  controles simples · **5d** chrome exterior de páginas regulatorias (solo lista blanca; cuerpos legales en ES) ·
  **5e** enums de dominio locale-aware. Todos los sub-incrementos con tsc+lint+build exit 0 y verificados.
  - **Frontera legal mantenida en TODO el trabajo:** el contenido regulatorio determinista (policy-packs,
    risk-assessment, recommendations, regulatory-watch, audit, cuerpos de dossier/informe, articulado) permanece en
    español; los diccionarios i18n solo llevan chrome (guard de ESLint activo). Copy prohibido respetado también en
    inglés (readiness / self-assessment / "we don't certify"; framing deployer). Notas legales EN validadas por el experto.
  - **Pendiente de validación del experto antes de exponerlas en EN:** (1) etiquetas de `regulatory-watch.ts`
    (`FRAMEWORK_*`, `JURISDICTION_*`, tipos de evento) — hoy en ES; (2) **Inc 6**: cuerpo legal de los PDF (dossier/
    informe) — decisión = se mantiene en ES aunque la UI esté en EN (regla dura), con `ScopeNote`/`LEGAL_*` ya con EN
    validado disponible. Ver PENDIENTES §2.3.

- **2026-07-22** · **i18n dashboard — sub-incremento 5e (etiquetas de enum locale-aware, FINAL de la i18n del dashboard).**
  Las etiquetas canónicas ES de los mapas `*_LABEL` de dominio (que 5a–5d dejaron a propósito en español) ahora son
  **locale-aware** como terminología de UI (no afirmaciones legales). Patrón por enum: junto al mapa canónico ES (sin
  cambios → default seguro) vive un mapa EN privado, un `*_BY_LOCALE: Record<Locale, …>` y una función `xLabel(v, locale)`.
  Los módulos de dominio importan **solo `type Locale`** de `@/lib/i18n/config` (dirección permitida por el guard ESLint).
  **NO** se metió ninguna de estas etiquetas en el diccionario i18n.
  - **Enums traducidos (mapeo EN, terminología EU AI Act oficial donde aplica):** RiskLevel (`riskLabel`, mock-data):
    unacceptable→"Unacceptable risk", high→"High risk", limited→"Limited risk", minimal→"Minimal risk". EvidenceState
    (`evidenceLabel`): declared→"Declared", evidenced→"With evidence", reviewed→"Reviewed". GapSeverity (`severityLabel`,
    minúscula por CSS uppercase): alta→"high", media→"medium", baja→"low". TaskPriority (`taskPriorityLabel`):
    critica→"Critical", alta→"High", media→"Medium", baja→"Low". TaskStatus (`taskStatusLabel`): todo→"To do",
    in_progress→"In progress", blocked→"Blocked", done→"Done". MemberRole (`roleLabel`): owner→"Owner", admin→"Admin",
    member→"Member". BiasAuditStatus (`biasStatusLabel`, bias-audit): coincide con `dashboard.bias.labels` del dict.
    `dueLabel` (task-reminders) locale-aware con default ES ("overdue by N days"/"due today"/"due tomorrow"/"due in N days").
  - **Resolución del locale en consumidores:** SERVER pages resuelven `resolveLocale()` y pasan `label`/`locale`
    (`riesgo`, `inventario`, `dashboard` overview, `plan`, `gap`); `DeadlineReminders` (server) recibe `locale` por prop.
    CLIENT: `AssessmentHistory` usa su `useLocale()` ya existente. `EvidenceBadge` ganó prop `locale?` (default ES) que
    traduce también el estado "Sin clasificar"/"Unclassified". `RiskBadge`/`RoleBadge` siguen recibiendo `label` (patrón
    landing/equipo). `BiasAuditBadge` ya auto-resolvía (5b).
  - **Dejado en ES a propósito (frontera 5d / regulatorio):** el bloque de RESULTADO de `RiskWizard` (RISK_LABEL + RiskBadge
    conviven con "Resultado orientativo"/rationale ES → se mantiene coherente en ES); el editor de eventos de
    `CandidateReviewControls` (checkboxes de scope por nivel + "Toda la organización" son field-labels ES por 5d); los PDF
    `informe`/`dossier`/`gap/informe` y `/demo` (RISK/EVIDENCE/severity en ES); severidad en `packs` (contenido de policy);
    `audit.ts` (traduce a ES legible). **Zona gris NO tocada:** FRAMEWORK_*/JURISDICTION_*/tipos de evento de
    `regulatory-watch` (nombres propios/sustantivos regulatorios) → pendientes de revisión del experto.
  - Verificado: tsc + eslint + build (exit 0). Sin commit.

- **2026-07-22** · **i18n dashboard — sub-incremento 5d (chrome de páginas/componentes regulatorios).**
  Nuevo sub-namespace `dashboard.pages` (es/en) SOLO con chrome de navegación: títulos/subtítulos genéricos de
  `PageHeader`, botones de acción/navegación (descargar/imprimir/exportar/volver), estados vacíos de producto,
  encabezados de columna de tablas y micro-etiquetas. Traducido en: `riesgo/evaluar`, `plan`, `actividad` (solo el
  shell: header, filtros, badge de cadena, demo-notice, empty; el feed de auditoría y `ChainStatusCard`/`formatAgo`
  quedan en ES por venir de `audit.ts`), `vigilancia` (solo header + 2 botones de nav; radar/briefing/timeline en ES),
  `vigilancia/candidatos` y `vigilancia/fuentes` (header, nav, avisos de producto, empty, columnas, unidad), y los 3
  documentos PDF `informe`/`dossier`/`gap/informe` (SOLO back-link + botón de descarga + `feature`/`description` del
  Paywall en informe/dossier; **el cuerpo legal permanece íntegro en ES**). Componentes cliente: `RiskWizard` (solo
  navegación del asistente: "Paso X de Y", Atrás/Siguiente/Ver resultado, sr-only single/múltiple, botones de resultado;
  el bloque "Guardar autoevaluación" y todo el resultado regulatorio quedan en ES) y `CandidateReviewControls` (solo
  botones genéricos + modal de descarte; las etiquetas de campos del editor de eventos quedan en ES).
  - **Frontera legal respetada:** NO se tocó `risk-assessment`/`recommendations`/`regulatory-watch`/`policy-packs`/
    `mock-data` (RISK_LABEL, *_LABEL)/`audit.ts`/`bias-audit`/`LegalNote`. `Recommendations.tsx` se dejó intacto (su único
    wrapper "Esfuerzo:" está acoplado al valor `rec.effort` de `recommendations.ts`). `ScopeNote`/`LEGAL_*` de los PDF
    en ES (documento coherente en ES). Copy seguro también en EN (readiness, sin certified/compliant/guarantees; deployer).
  - Verificado: tsc + eslint + build (exit 0). Sin commit.

- **2026-07-22** · **i18n dashboard — sub-incremento 5b (genéricos, estados vacíos, onboarding, botones).**
  Ampliado el namespace `dashboard` de los diccionarios con sub-namespaces nuevos: `units`, `welcome`, `onboarding`,
  `guide`, `paywall`, `deadlines`, `risk`, `bias`, `confirm`, `buttons`. Traducidos SOLO como chrome: `WelcomeGuide`
  (tour completo, incl. las mini-UI ilustrativas —datos ficticios— siguiendo el precedente de la landing;
  números de artículo idénticos entre idiomas), `OnboardingChecklist`, `ConfirmSubmit`, `Paywall`, los 6 botones
  (Delete/Remove/Revoke/Print/Vigía) y `BiasAuditBadge`; y los server components `DashboardWelcome`,
  `DeadlineReminders`, `RiskDonut`.
  - **Client components** usan `useT()` (dentro del `<I18nProvider>` del layout, 5a). **Server components** reciben el
    slice por props desde su renderizador: `dashboard/page.tsx` resuelve `resolveLocale()` y pasa slices a
    DashboardWelcome/DeadlineReminders/RiskDonut + traduce el array `onboardingSteps`; `PaidGate` (gate.tsx) resuelve y
    pasa el slice a `Paywall`, y las 2 páginas que renderizan `Paywall` directo (informe, dossier) lo pasan también.
  - **Excepción deliberada:** `BiasAuditBadge` es un Server Component compartido por 2 páginas fuera de alcance
    (dossier, editar); se hizo **async y auto-resuelve el locale** (cookie) para no tocar esas páginas.
  - **Frontera legal (rule A):** `RISK_LABEL`/`TASK_PRIORITY_LABEL`/`BIAS_STATUS_LABEL` de `mock-data`/`bias-audit` NO
    se editan; las etiquetas de riesgo/estado se traducen por **slice de diccionario** pasado a la UI (mismo patrón que
    `RiskBadge` en la landing). `RiskDonut` cae al español (`RISK_LABEL`) si no se le pasa `labels` → `/demo` intacto.
    `dueLabel` (task-reminders) y `TASK_PRIORITY_LABEL` quedan en español (fuera de alcance). Deadline titles de
    `regulatory-watch` NO se traducen. **Sin funciones en los diccionarios** (cruzan la frontera RSC vía provider →
    interpolación por piezas prefijo/sufijo + plurales).
  - Verificado: tsc + eslint + build (exit 0). Pendiente 5c/5d: `feature`/`description` de los paywalls y el resto de
    las páginas siguen en español a propósito.

- **2026-07-22** · **Internacionalización ES/EN — web pública completa (Inc 0–3).** El fundador pidió que la
  página web también esté en inglés; eligió **alcance web + dashboard** y **URLs `/en`** (no solo toggle). Se
  consultó al `product-architect`: arquitectura **híbrida** — URL real `/en` solo para la web pública (SEO/hreflang);
  auth + dashboard resolverán el locale por **cookie `NEXT_LOCALE`** sin cambiar la URL (tras auth el SEO es irrelevante).
  - **Frontera legal (regla dura):** los diccionarios i18n (`src/lib/i18n/dictionaries/{es,en}.ts`) contienen **solo
    chrome de UI**. El contenido regulatorio determinista (policy-packs, risk-assessment, recommendations,
    regulatory-watch, dossier/informe) **no se traduce** hasta validación del experto. Se blindó con un **guard de
    ESLint** (`no-restricted-imports`) que prohíbe que `src/lib/i18n/**` importe esos módulos.
  - **Copy prohibido también en inglés:** la traducción respeta el marco seguro (*readiness, self-assessment, audit-ready,
    "we don't certify"*), nunca *certified/compliant/guarantees*; score = "% ready", framing **deployer**.
  - **Tipado:** `type Dictionary = typeof es` (sin `as const`) → falta de clave/firma en `en.ts` = error de `tsc`.
  - **Inc 0** andamiaje (config/resolve/actions/provider). **Inc 1** `<html lang>` dinámico vía header `x-attesta-locale`
    que pone el middleware (sin tocar la lógica de auth de `updateSession`); nota: leer `headers()` en el root layout
    vuelve las rutas dinámicas (landing deja de ser estática, aceptable). **Inc 2** landing entera data-driven por
    diccionario + ruta `/en` + `LocaleToggle` (URL) + `LandingPage(locale)`; `RiskBadge` acepta `label` opcional para
    traducir la etiqueta de riesgo en la landing sin tocar `mock-data`. Notas legales (`LegalNote.tsx`) con versiones EN
    **validadas por el experto de compliance** y mapas `*_BY_LOCALE` (el texto legal vive FUERA del diccionario).
    **Inc 3** SEO: `buildLandingMetadata(locale)` (title/description por idioma, canonical, hreflang es/en/x-default,
    OG `es_ES`/`en_US`), `sitemap.ts`, `robots.ts`. Verificado por curl en runtime (`/`→es, `/en`→en, sin fugas).
  - **Pendiente (Inc 4–5):** chrome de auth (login/onboarding/reset) por cookie e i18n del dashboard por clusters
    (nav, formularios, toasts, estados vacíos) — los módulos legales deterministas NO se tocan.

- **2026-07-21** · **Stat de la landing actualizado a fuente 2026 (IBM), a petición del fundador.**
  El fundador pidió reponer el 78%/83% por ser "más nuevo". Se buscó (WebSearch) y se confirmó que el **78% sigue
  proviniendo del mismo press release de proveedor** (Vision Compliance/Secure Privacy, conflicto de interés) → no se
  repone a secas. En su lugar se encontró y verificó en fuente primaria (**newsroom.ibm.com**, 8-jun-2026; 2.000 CIO/CTO,
  33 países) una cifra casi idéntica y creíble: **77% reconoce que su adopción de IA supera su capacidad de gobernarla**.
  Cambios: `ProblemStats` stat 1 (48,6% Deloitte 2024 → **77% IBM 2026** + pie de fuente); microcopy del `Hero`
  ("casi la mitad…" → "más de 3 de cada 4…"); el stat de inventario (>50% CSA 2026) se mantiene (no era antiguo).
  MEMORY §2 actualizado. Resultado: número potente que quería el fundador, pero de fuente independiente y más nueva.

- **2026-07-21** · **Revisión crítica (panel de 3 críticos) + correcciones Tier 0/2/3-4/1.**
  Tras los 5 packs, el fundador pidió desplegar un "crítico" experto sobre producto + web (veredictos sí/no/mejorable +
  ideas), entregar veredictos ANTES de tocar nada. Se desplegó un **panel de 3 críticos independientes** (conversión/
  mensaje, diseño/UX/a11y, producto/estrategia/compliance) en solo-lectura. Veredicto: contenido de compliance
  *superior*, diseño *por encima de la media*, pero **2 bugs que apagan el bucle de valor** + capa de credibilidad web
  floja. El fundador eligió ejecutar los 4 lotes.
  - **Tier 0 — bugs (commit 9d36523):** (1) `compliance_pct` ("% listo") solo lo fijaba `seedSampleData` → todo sistema
    real quedaba a 0% permanente. Fix: `recomputeReadiness` (done/total de gap_items) invocado tras aplicar pack y tras
    crear/editar/borrar brecha. (2) `buildActionPlan` hacía lookup exacto `REMEDIATION[article]` → descartaba casi todas
    las brechas de un pack (formato rico "Art. 26.2 (y Art. 14)", "GDPR Art. 35", "Anexo III.5.b"…). Fix:
    `remediationKeyFor` normaliza a la clave canónica solo para artículos-deployer con remediación validada (excluye
    Art. 5 de prohibición y GDPR/Anexo/leyes estatales); el resto genera la recomendación desde el propio requisito del
    control (texto validado del pack). Ninguna brecha se pierde y no se inventa texto legal.
  - **Tier 2 — a11y (commit 49ed007):** focus-trap + Escape + foco inicial + aria-live "Paso X de Y" en `WelcomeGuide`;
    `--color-muted` claro #6b756e→#5c665f (~5.5:1); ring de foco de inputs `ring-brand/30`→`ring-brand` (17 archivos,
    unificado con botones, 3:1).
  - **Tier 3-4 + Tier 1 (commit 46c69bd):** eliminado `HowItWorks` (duplicaba UseCaseStory), que hereda `#como-funciona`;
    nueva sección **"Cero alucinaciones. Por diseño."** (`Honestidad.tsx`, eleva el diferenciador determinista + reformula
    al experto SIN nombre, por decisión del fundador); **coherencia de CTA** (decisión del fundador): gratis→"Entrar",
    de pago→"Suscribirse", Enterprise→"Solicitar acceso"; foso visible ("Policy packs (5 dominios)" + Modules enumera los
    4 casos); FAQ +2 objeciones comerciales + matiz del plazo 2027 (Omnibus pendiente de DOUE); pulido dashboard
    (glifo→SVG, KPI Alto riesgo danger→warn, footer legal). **Moneda:** el fundador decidió MANTENER USD (sin subrayarlo).
  - **Pendiente de INPUT del fundador (no ejecutado, en PENDIENTES):** capa de credibilidad del footer (email de dominio
    propio en vez de Gmail, +52, Instagram→LinkedIn) — no se inventan datos. Diferidos técnicos: ver PENDIENTES.
  - Cada lote verificado con tsc + lint + build (exit 0) y en su propio commit.

- **2026-07-21** · **Foso — nuevo policy pack "Crédito y seguros" (APROBADO por el fundador).**
  Quinto pack, cuarto CASO DE USO, el de mayor valor por ticket. **Alto riesgo del Anexo III.5.b** (scoring de solvencia
  de personas físicas, con excepción de detección de fraude) y **5.c** (pricing de seguros de vida y salud). Comprador:
  banco/fintech/aseguradora mid-market.
  - **Nuevo pack `policy-packs/credito-seguros.ts`** (23 controles), verificado por el `compliance-domain-expert`
    (2026-07-21) contra el texto literal del Anexo III.5.b/5.c, Art. 6(3), Arts. 4/26/27/86 + 10/11/15/25 (proveedor),
    RGPD 5/9/13-14/22/35, jurisprudencia TJUE y normativa sectorial. Registrado en `index.ts` (tras
    `atencion-cliente-genai`, antes del pack de EE. UU.).
  - **LA gran diferencia con RRHH (verificada):** aquí la **FRIA (Art. 27) SÍ es OBLIGATORIA** aunque el deployer sea
    entidad privada ordinaria — el Art. 27.1 la exige expresamente a los deployers del Anexo III **5.b y 5.c** (RRHH es
    4.b, fuera de esa lista → no obligatoria). Control destacado, severidad alta, con los 6 apartados del 27.1 + la
    notificación a la autoridad (27.3) + complemento con la DPIA (27.4).
  - **Otros matices clave verificados:** (1) **SCHUFA** (TJUE C-634/21): generar el score YA es decisión automatizada del
    Art. 22 si un tercero se apoya en él de forma determinante. (2) **Test-Achats** (C-236/09 + Dir. 2004/113/CE):
    **tarifa unisex** obligatoria en seguros. (3) **Datos de salud** = categoría especial (RGPD Art. 9) en vida/salud.
    (4) **Exención de detección de fraude** del 5.b (triaje: no "limpia" la función de scoring si conviven). (5) Solo
    **personas físicas** (jurídicas fuera) y solo **vida/salud** (auto/hogar fuera). (6) **Art. 6(3)** NO permite escapar
    del alto riesgo porque hay perfilado. (7) Normativa sectorial (CCD 2023/2225, MCD 2014/17, IDD, Solvencia II) en un
    solo control "sigue aplicando en paralelo", sin sobre-desarrollar.
  - **Plazo:** alto riesgo Anexo III → **2-dic-2027** (Omnibus). Tres controles de triaje (clasificación/exención/6.3) →
    mismo follow-up de PENDIENTES (tipo fuera del cómputo de "% listo").
  - Verificado: tsc + lint + build (exit 0). **Estado del foso: 5 packs / 4 casos de uso** (selección UE, selección
    EE. UU., gestión de trabajadores, atención al cliente/generativa, crédito/seguros).

- **2026-07-21** · **Foso — nuevo policy pack "Atención al cliente e IA generativa" (APROBADO por el fundador).**
  Cuarto pack, tercer CASO DE USO. El fundador lo eligió para *ensanchar el embudo*: casi toda empresa mid-market tiene
  chatbot de soporte o usa IA generativa para contenido. **Régimen distinto** a los packs de RRHH: NO es alto riesgo del
  Anexo III por regla general, sino **transparencia (Art. 50) + GPAI (provider vs deployer) + RGPD** (riesgo limitado).
  - **Nuevo pack `policy-packs/atencion-cliente-genai.ts`** (18 controles), verificado por el `compliance-domain-expert`
    (2026-07-21) contra Arts. 4/5/6(2)+Anexo III/25/50.1-50.4/Cap. V, RGPD 5/6/9/13-14/22, las Guidelines de la Comisión
    sobre Art. 50 (borrador 8-may-2026) y despachos (Gibson Dunn, Morrison Foerster, Greenberg Traurig, Covington).
    Registrado en `index.ts` (tras `gestion-trabajadores`, antes del pack de EE. UU.); la UI de `/dashboard/packs` lo
    renderiza sola.
  - **Matices clave verificados (los que definen la honestidad del pack):** (1) **provider vs deployer** — 50.1 (aviso de
    chatbot) y 50.2 (marcar contenido sintético) son del **PROVEEDOR**; el deployer *verifica/exige y conserva evidencia*.
    50.3 (emociones/biométrica) y 50.4 (deepfakes + texto de interés público) son del **DEPLOYER**. (2) **Emociones de
    CLIENTES ≠ prohibido** (el Art. 5.1.f es solo trabajo/educación), PERO **escala a alto riesgo** (Anexo III.1.c) + RGPD
    Art. 9 → sale del régimen de este pack. (3) **Excepciones del 50.4**: obra artística/satírica (obligación *reducida*, no
    exenta) y texto con **control editorial humano sustantivo** (un mero «check» no basta). (4) **GPAI**: quien solo usa un
    modelo vía API/SaaS es deployer, NO proveedor (Cap. V recae en el proveedor del modelo); línea deployer→proveedor =
    fine-tuning sustancial bajo marca propia. (5) **Alucinaciones**: NO son incumplimiento del AI Act (no es alto riesgo) →
    encuadrado como **buena práctica** (protección al consumidor), sin inventar un artículo.
  - **Plazo confirmado:** Art. 50 aplica el **2-ago-2026** y **NO fue aplazado** por el Digital Omnibus (que solo movió el
    alto riesgo del Anexo III al 2-dic-2027). Tres controles de **triaje** (clasificación, prohibiciones, emociones) marcados
    como tal; aplica el mismo follow-up de PENDIENTES (tipo "prohibido"/"reclasifica" fuera del cómputo de "% listo").
  - Verificado: tsc + lint + build (exit 0). **Estado del foso: 4 packs / 3 casos de uso** (selección UE, selección EE. UU.,
    gestión de trabajadores, atención al cliente/generativa).

- **2026-07-21** · **Foso — nuevo policy pack "Gestión y monitorización de trabajadores" (APROBADO por el fundador).**
  Tras la 2ª verificación completa, el fundador eligió *ampliar el foso* con un 2º **caso de uso** (los dos packs previos
  —`rrhh` y `us-hiring`— eran la misma vertical: contratación). Vertical elegida por recomendación: **gestión de
  trabajadores** (people analytics), la *otra mitad* del **Anexo III.4**: el punto **4.(b)** (evaluación de desempeño,
  asignación de tareas, promoción/terminación, monitorización) frente al 4.(a) de selección. Razón estratégica:
  profundiza la cuña de RRHH, mismo comprador (People/RRHH), riesgo legal bajo (misma familia de artículos), venta
  natural a quien ya tiene un sistema de selección inventariado.
  - **Nuevo pack `policy-packs/gestion-trabajadores.ts`** (21 controles del **deployer**), verificado por el
    `compliance-domain-expert` (2026-07-21) contra el texto literal del Anexo III.4.b, Arts. 4/5/14/15/26/27/50/86,
    RGPD Arts. 5/13-14/22/35/**88** y TEDH (Bărbulescu 2017, López Ribalda GS 2019). Registrado en `index.ts`
    (`POLICY_PACKS`, entre los dos packs UE); la UI de `/dashboard/packs` lo renderiza sola.
  - **Añadidos vs RRHH:** `emociones-prohibicion` (Art. 5.1.f), `scoring-social-limite` (Art. 5.1.c),
    `practicas-manipulativas` (Art. 5.1.a/b), `monitorizacion-proporcionada` (RGPD 5.1.c + TEDH),
    `normativa-laboral-nacional` (Art. 88 RGPD — consulta a representantes, mosaico nacional), `explicacion` (Art. 86).
    **Eliminado** lo específico de selección (datos = CVs, transparencia-candidato, chatbot). **Subido a `alta`**
    `info-trabajadores` (aquí es central: relación laboral viva + representantes + consulta previa).
  - **Trampa clave (verificada):** inferir emociones en el trabajo (Art. 5.1.f) es práctica **PROHIBIDA**, no de alto
    riesgo → "se cesa, no se prepara". Igual que RRHH, se refleja por **copy** (control de **triaje**: cerrar la brecha =
    "verifiqué que NO infiere emociones / cesé el uso", no "preparé una práctica prohibida"). Plazos confirmados: Art. 4 y
    Art. 5 vigentes desde 2-feb-2025; Art. 50 el 2-ago-2026; alto riesgo Anexo III aplazado al **2-dic-2027** (Omnibus).
  - **Follow-up estructural anotado en PENDIENTES** (deuda BAJA): el `applyPolicyPack` inserta todo control como
    `gap_item` "missing" que computa en "% listo"; un tipo "prohibido" propio (fuera del cómputo, como el nivel
    Inaceptable del dossier) sería más limpio que resolverlo por copy. No se implementó ahora (fuera de alcance del pack).
  - Verificado: tsc + lint + build (exit 0).

- **2026-07-21** · **Resuelto merge del PR #3 + análisis profundo (6 auditorías) + tanda P1.**
  **Merge:** la base del PR (`claude/startup-project-setup-612pzs`) traía un Vigía temprano paralelo; se resolvió a
  favor de esta rama (foso completo `reg-watch/` + `analista/`) y se descartaron los duplicados de la base
  (`lib/vigia/`, `lib/supabase/admin.ts`, `api/cron/vigia`, seed redundante, getters `getRegSources`/`RegSourceRow`
  duplicados). **Auditoría** (correctitud, rendimiento, seguridad, compliance, frontend/a11y, infra/GitHub): 0 P0, sin
  fugas cross-tenant, RLS/audit sólidos; ver el informe completo en la sesión. **Tanda P1 desplegada:**
  (1) **Cabeceras de seguridad** en `next.config.ts` (HSTS, X-Frame-Options DENY, nosniff, Referrer/Permissions-Policy,
  `poweredByHeader:false`); CSP estricta con nonce queda pendiente (necesita prueba en navegador: script de tema inline
  + Stripe.js + Supabase). (2) **CI** en `.github/workflows/ci.yml` (lint + tsc + build en PRs y push a main; build en
  modo demo, verificado exit 0). (3) **Cron del foso**: el Vigía no corría solo — se añadió handler **GET solo-cron**
  (Bearer `CRON_SECRET`, sin sesión → sin CSRF) en `api/reg-watch/vigia` + cron semanal en `vercel.json`
  (`0 6 * * 1`). Decisión: **solo el Vigía es automático** (determinista, gratis); el **Analista sigue manual**
  (LLM con coste + filosofía humano-en-el-bucle). Requiere `CRON_SECRET` en Vercel (mismo secreto que reminders).
  (4) **Rendimiento**: `getIsPlatformAdmin` y un helper `listOrgMembersRaw` envueltos en `cache()` (dedup del RPC por
  render en dashboard/plan/vigilancia); `getExportBundle` pasa de N+1 (2 consultas por sistema) a **2 consultas batch**
  (`.in(...)`) para toda la org. tsc + lint + build OK.

- **2026-07-21** · **2ª verificación completa (6 auditorías) + arreglos.** Se repitió el análisis profundo tras las
  tandas P1→P3. Resultado: correctitud/seguridad/rendimiento/infra **sin regresiones** (CI verde en los 10 runs;
  optimizaciones confirmadas funcionando; fachada 22/22/22). **Defectos cazados y corregidos:** (1) ALTO — la corrección
  de las stats había quedado **incompleta**: el "78%" seguía vivo en `Hero.tsx` y el "83%" en `Modules.tsx` (contradecían
  el 48,6%/>50% ya corregido en `ProblemStats`) → ambos reescritos con las cifras creíbles ("casi la mitad" / "más de la
  mitad"). Actualizado también §2 de este MEMORY para que nadie reutilice las cifras viejas. (2) MEDIO — en
  `risk-assessment.ts` la **Directiva 2011/93/UE estaba mal atribuida** (es solo CSAM/menores); para imágenes íntimas de
  adultos es la **Directiva (UE) 2024/1385** → citas separadas en los 2 rationales y en el array. (3) MEDIO — waterfall en
  `inventario/[id]/editar` (3 round-trips en cascada) → `Promise.all` (1). **BAJO arreglados:** contraste de la nota de
  `ProblemStats` (text-muted→ink-soft), restauración de foco al cerrar el modal de descarte, 3 tablas de informes con
  `overflow-x-auto print:overflow-visible`, `permissions: contents:read` en el CI. Fuente CSA (>50% sin inventario)
  verificada (nota real del 13-mar-2026 "Enterprise Readiness Gap"). tsc + lint + build OK.

- **2026-07-21** · **Stats de la landing con fuente creíble.** Las cifras 78 %/83 % de `ProblemStats` (que primero
  suavizamos a "~") venían en realidad de un **press release de un proveedor de compliance** (Vision Compliance) — mismo
  conflicto de interés que si Attesta publicara su propio "todos sin preparar". Se investigó y sustituyó por fuentes
  citables e independientes: **Deloitte Legal**, encuesta EU AI Act 2024 (500 decisores en Alemania) → **48,6 %** no se
  ha comprometido en serio; **Cloud Security Alliance** 2026 → **>50 %** sin inventario formal de IA. Nota al pie con
  ambas fuentes + caveat de que Deloitte es Alemania; el 35 M€/7 % se atribuye al propio Art. 99. `CountUp` ahora pasa
  `decimals` (para "48,6 %"). Decisión del fundador: priorizar fuente sólida sobre número redondo. URLs en PENDIENTES.

- **2026-07-21** · **Diferido de P2 + tanda P3 (UX/a11y + infra).** **Diferido:** `getAiSystems`/`getGapItems` con
  columnas explícitas (fuera las 6 de bias-audit 0019 que no usan); `getSystemDossier` se queda con `*` a propósito
  (sí las usa + fallback seguro). **P3 UX/a11y:** (a) **skip-link** "Saltar al contenido" en la landing (ya lo tenía el
  dashboard); (b) matiz **Art. 6(3)** en la FAQ ("por regla general, de alto riesgo… excepción acotada que casi nunca
  aplica al perfilado"); (c) **`SubmitButton`** reutilizable (`useFormStatus`: disabled + aria-busy + texto "…")
  aplicado a los formularios de creación/seed (inventario nuevo/editar, gap/nuevo, seed del welcome y del inventario);
  (d) **modal accesible de descarte** en `CandidateReviewControls` (textarea etiquetado + Escape + foco) en vez de
  `window.prompt`. **P3 infra:** `engines: node>=20`; `apiVersion` de Stripe pineada (`2026-06-24.dahlia`, evita
  cambios silenciosos del SDK); React 19.2.4→**19.2.7** (patch); README actualizado (Attesta, estado real); borrado
  `supabase/patches/0005` (redundante, ya plegado en 0003). **Deferido (documentado en PENDIENTES):** `tsconfig`
  `noUncheckedIndexedAccess` (barrería muchos accesos indexados, requiere su propia tanda), stats de `ProblemStats` sin
  fuente (decisión de contenido del fundador), npm audit moderate (postcss vendorizado por Next, no accionable), y los
  ítems BAJA de seguridad (reminders GET, rate-limit waitlist, recompute de `saveRiskAssessment`). tsc + lint + build OK.

- **2026-07-21** · **Tanda P2 (correctness + coherencia de compliance + dark mode + perf/bundle).**
  **Bugs de datos:** (a) `gap/page.tsx` mostraba el **UUID crudo** como "Sistema afectado" para sistemas sin `code`
  (creados por el usuario) → ahora resuelve el nombre con `getAiSystems()` (mismo patrón que el PDF) + singular/plural;
  (b) el **selector de sistema del Plan** usaba `s.id` (= code) y `cleanUuid` lo descartaba en silencio → ahora usa
  `getSystemsForSelect()` (uuid real), como `gap/nuevo`. **Compliance (revisado por el experto):** (c) FAQ landing
  "auditoría **inmutable**" → "**verificable** (SHA-256, alteración detectable)", coherente con el reencuadre honesto
  ya adoptado; (d) `RiskWizard`: para nivel **Inaceptable** el bloque ya no dice "priorizar para cumplir" sino
  "Acción inmediata: una práctica prohibida no se prepara, se cesa"; (e) **nuevas prohibiciones Art. 5 del Digital
  Omnibus** (imágenes íntimas no consentidas / CSAM) añadidas al clasificador: nivel `unacceptable` **siempre**, pero
  `rationale` **consciente de fecha** vía `OMNIBUS_ART5_EFFECTIVE` (2-dic-2026) — antes de esa fecha el texto dice
  "aún no en vigor por el AI Act, pero ya ilícito penal (Directiva 2011/93/UE)"; hints con reencuadre deployer para no
  autoclasificar por uso normal de RRHH; se de-ancló la fecha "2-feb-2025" hardcodeada del dossier Inaceptable (sería
  falsa para esas 2 prácticas). **Dark mode:** 3 bordes `#bfdccf` → `var(--tone-good-bd)` y `text-[#a3271f]` →
  `var(--tone-danger-fg)` (contraste AA). **Rendimiento/bundle:** `supabase-js` sale del bundle del dashboard — los
  writes de flags de onboarding (`guide_seen`/`onboarding_dismissed`) pasan a una Server Action `setUserFlag`
  (`data/user-actions.ts`). **Docs:** `.env.example` completado (11 vars: Stripe/correo/SSO/app URL). Diferido:
  `select("*")`→columnas (P2, en PENDIENTES). tsc + lint + build OK.

- **2026-07-21** · **Landing / conversión.** (a) `WhyNow`: timeline reordenado cronológicamente y liderando con lo
  ya exigible (Art. 4, feb 2025) y el **plazo más cercano (Art. 50 · 2-ago-2026)**, que faltaba; el hito de 2027
  reafirma el foso ("no es agosto de 2026, un error extendido en el mercado"). Fechas verificadas, copy a altitude
  seguro sin misatribuir deployer/proveedor. (b) `WaitlistCTA`: **fila de confianza honesta** (Región UE · contenido
  del EU AI Act revisado por experto · "no certificamos: preparación honesta") en el punto de conversión — sin
  logos/testimonios inventados. (c) A11y: `WaitlistCTA` (aria-invalid/describedby, role=alert/status) y `AuthForm`
  (errores por campo enlazados con aria-describedby + role=alert en los 5 campos).

- **2026-07-21** · **Arreglos P3 (UX/a11y) y P4 (deuda).** **P3:** botón primario con hover por brillo (antes
  `brand-strong`, menta claro en oscuro → texto blanco ilegible); **menú móvil** (hamburguesa) en la landing;
  skip-link + landmark `<main>` en el dashboard; encuadre **deployer/proveedor** en `OBLIGATIONS_BY_LEVEL.high`
  (deberes propios vs "exige y conserva evidencia del proveedor", revisado por el experto); semántica del asistente
  de riesgo (`role="group"` + `aria-labelledby` + `aria-pressed` + aviso sr-only single/múltiple). **P4:** paleta de
  riesgo unificada en `RISK_HEX` (mock-data) consumida por RiskDonut y UseCaseStory (antes duplicada); `RISK_ORDER`
  reutilizado en RiskDonut. **P4 pendiente (mantenibilidad, sin impacto de usuario — checklist en PENDIENTES §Deuda):**
  unificar los 3 formateadores de cuenta-atrás y los 7 de fecha, fusionar `daysUntil`/`daysUntilDate`, y feature-flag
  explícito del módulo `analista/` (RAG a medio cablear). Los 2 ítems BAJA de seguridad (reminders GET/CSRF,
  rate-limit del waitlist) también quedan documentados sin tocar (tocan cron/email aún no activo).

- **2026-07-21** · **Arreglos P2 (correctness de datos).** (a) El widget "Próximo hito" del dashboard y el PDF
  ejecutivo usaban `upcomingDeadlines(now)` sobre el catálogo curado, ignorando los eventos publicados por el
  pipeline (que sí salen en el radar). Ahora ambos pasan `getRegulatoryEvents()` → fuente única con la vigilancia.
  (b) Pluralización en el PDF ejecutivo ("en 1 día", "dentro de N días") y en el "hace N años" de Actividad.
  (c) `getGapItems` (supabase-repo) valida `status` contra el enum con fallback "missing" (red simétrica a la de
  `severity`), para que STATUS_META[status] no rompa en dossier/gap ante un valor inesperado.

- **2026-07-21** · **Escaneo completo del producto (5 auditorías en paralelo) + arreglos P0/P1.** Correctness,
  seguridad, UX/a11y, copy y deuda técnica. Sin bugs de crash ni fugas cross-tenant. **P0 (commit):** copy
  "cumplimiento"→"preparación" (`recommendations.ts`), landing "audit-trail inmutable"→"verificable" (coherente con
  el reencuadre tamper-evident), hex hardcodeados→tokens `--tone-*` en KPIs/Meter/RiskWizard/inventario-nuevo (dark
  mode roto en pantallas núcleo), y el error crudo de Supabase del onboarding traducido con `friendlyError`
  (extraído a `lib/friendly-error.ts`, compartido con AuthForm) + `role="alert"`. **P1 seguridad (todo
  intra-tenant, RLS ya impedía cruce):** (a) `actions.ts` — `saveRiskAssessment` valida `level` contra el enum,
  verifica pertenencia del sistema y añade `.eq(organization_id)`; `createGapItem`/`applyPolicyPack` validan
  UUID+pertenencia del `systemId` (helper `systemBelongsToOrg`). (b) **Migración 0021** (trigger
  `enforce_membership_guards`, BEFORE UPDATE/DELETE): impone en la BD "solo owner otorga/retira owner" y "nunca sin
  owner", que antes vivían solo en la app y un admin podía saltarse por PostgREST directo. Solo UPDATE/DELETE (los
  INSERT de onboarding/invitaciones van por SD y no se tocan); contextos de confianza con `auth.uid()` nulo se
  saltan las guardas para no romper mantenimiento/DBA. **Pendiente**: fundador aplica 0021 (PENDIENTES §1.1-quinquies).

- **2026-07-21** · **Dossier por sistema: resumen ejecutivo narrativo + nota de alcance.** Tercer y último
  entregable con narrativa (build+lint+tsc + captura en impresión). El dossier ahora abre con un párrafo
  **determinista** que sintetiza el sistema: identidad (qué usa la organización, dominio, proveedor, rol declarado),
  clasificación orientativa + preparación + respaldo, brechas abiertas (o el matiz "pendiente de verificación
  independiente" si no hay), atestación de la evaluación vigente, y —solo si es AEDT de empleo NY— la sujeción a la
  auditoría de sesgo anual de la LL144. Debajo, la `ScopeNote` compartida.
  - **Copy revisado por `compliance-domain-expert`** (3ª ronda). Salvedad crítica: para nivel **"Inaceptable"
    (Art. 5)** el encuadre de "preparación/brechas" es engañoso (una práctica prohibida no se prepara para
    auditoría). Variante dedicada que enuncia la prohibición (no comercializable ni usable en la UE desde 2-feb-2025)
    y redirige a asesoría jurídica; además los KPIs de ese caso dejan de rotular "Preparación %/Brechas abiertas" y
    muestran "Práctica prohibida (Art. 5)" + "Revisión jurídica". La frase LL144 se condiciona explícitamente a
    jurisdicción/uso NY ("en la medida en que… decisiones de empleo… en Nueva York") con "auditor independiente".

- **2026-07-21** · **Informe de gap: de tabla plana a documento de evidencia auditable.** Antes era un header + 4
  KPIs + una tabla plana de todas las brechas. Ahora (build+lint+tsc + captura en impresión):
  - **Resumen ejecutivo narrativo** (determinista) + **nota "Alcance y método"** (extraída a `ScopeNote` en
    `LegalNote.tsx`, compartida con el informe ejecutivo para no divergir; el informe se refactorizó para usarla).
  - **Agrupado por sistema** y ordenado por urgencia (más brechas abiertas de sev. alta primero); dentro de cada
    sistema, abiertas antes que cubiertas, por severidad y artículo. Cada sistema muestra su cobertura (% cubierto)
    y un chip si tiene sev. alta abierta. **Chips de tono** para severidad y estado (tokens `--tone-*`).
  - **KPI de cobertura** (% cubierto) + barra global. KPIs renombrados a la terminología correcta.
  - **Copy revisado por `compliance-domain-expert`** (2ª ronda): corrigió que **NO se llame "brecha" a un control
    cubierto** — el universo son "controles evaluados", solo los abiertos son brechas (renombrado KPI "Brechas
    totales"→"Controles evaluados"). Reforzado el encuadre de no-cumplimiento ("cubrir un control refleja evidencia
    autodeclarada… no constituye un juicio de cumplimiento… pendiente de verificación independiente… no descarta
    controles/sistemas aún no evaluados"). `{alta}` = solo abiertas de sev. alta. Pluralización determinista.
  - `force-dynamic` añadido (el informe depende de la fecha de corte).

- **2026-07-21** · **Reportes/evidencia: el informe ejecutivo lee como un brief de dirección, no un dashboard impreso.**
  Foco elegido por el fundador (el PDF es el entregable que justifica el precio). Cambios (build+lint+tsc en verde,
  verificado con captura en emulación de impresión):
  - **Resumen ejecutivo narrativo** (`informe/page.tsx`): párrafo **ensamblado de forma determinista** (cero LLM) a
    partir de los datos ya declarados (total, alto riesgo, preparación media, % con respaldo, brechas, sistemas bajo
    umbral, próximo hito). Pluralización y ramas condicionales; caso sin sistemas contemplado.
  - **Nota "Alcance y método"**: qué cubre el informe (foto a fecha), en qué marco se basa (EU AI Act + otros en su
    caso), que el % NO es cumplimiento y que no es asesoría jurídica. Va arriba, visible; `LEGAL_PDF` sigue de pie fino.
  - **Copy revisado por `compliance-domain-expert`**: sin términos prohibidos, verbos de la organización, encuadre
    deployer correcto. El experto detectó una **incoherencia de umbral**: el texto decía "80% listo" pero la variable
    `priority` filtra <60%. Corregido con un contador propio `belowReady` que sale de `AUDIT_READY_THRESHOLD` (una sola
    fuente), y el subtítulo de "Sistemas que requieren atención" ahora reconcilia los dos cortes (60% urgente / 80%
    orientativo) para que un auditor no lo lea como error.
  - **PDF más profesional** (`globals.css`): `@page` con márgenes 16/14mm; `@media print` evita títulos huérfanos
    (`break-after:avoid`) y filas partidas (`break-inside:avoid`). Beneficia dossier, informe y evidencia de gap.

- **2026-07-20** · **Activación / primer día: dashboard más honesto y con más caminos de salida.** Foco elegido
  por el fundador: convertir registros en usuarios activos. Cambios (todos verificados con build+lint+tsc):
  - **Bug de credibilidad corregido:** el stat "Brechas abiertas" del resumen estaba **hardcodeado a `4`** —
    una cuenta vacía mostraba 4 brechas inexistentes (mal en una demo a un prospecto). Ahora cuenta las brechas
    reales abiertas (`gaps.status !== "done"`).
  - **Tarjetas de stats navegables:** `StatCard` acepta `href` opcional (se vuelve `Link` con hover + flecha);
    "Sistemas de IA" → inventario, "Brechas abiertas" → gap. El resumen pasa a ser un punto de partida.
  - **Empujón al paso 2 (clasificar riesgo):** en el inventario, cada sistema **sin clasificar** muestra un CTA
    "Clasificar" que abre el asistente EU AI Act preseleccionado (`?system=<dbId>`). Antes solo había "Dossier",
    así que un sistema recién registrado se quedaba sin siguiente paso obvio.
  - **`EvidenceBadge` honesto:** un sistema sin autoevaluación mostraba "Declarado" por defecto (simulaba
    respaldo). Ahora muestra "Sin clasificar" (borde punteado, muted) — coherente con el nuevo CTA. Solo afecta
    a sistemas sin `evidenceState`; los usos con estado concreto (historial) no cambian.
  - **(07-21) Estado de bienvenida cálido** (`DashboardWelcome.tsx`): cuando la cuenta no tiene sistemas, el
    resumen ya no muestra widgets en cero (donut vacío, "requieren atención"), sino un hero con saludo por
    nombre (solo si hay nombre real en el perfil), la misión con el nombre de la org, el recorrido en 3 pasos
    (Inventaría → Clasifica → Prepara evidencia), CTA primario "Registrar tu primer sistema" + "Explorar con
    datos de ejemplo" (`seedSampleData`, solo conectado) y un enlace al próximo hito regulatorio. Verificado
    por captura en claro y oscuro. El resto del resumen (stats, checklist, donut) reaparece al tener ≥1 sistema.

- **2026-07-20** · **Foso ampliado: pack RRHH-EU completado (Art. 4 + Art. 50) + briefing "aclaración de plazos".**
  Verificado con el `compliance-domain-expert` (fuentes). Hallazgo: el radar ya reflejaba bien el Digital Omnibus
  (alto riesgo Anexo III → **2-dic-2027**, NO 2-ago-2026) y Colorado (SB 26-189 → 1-ene-2027, se queda en radar,
  NO se promueve a pack). El hueco estaba en el **policy pack de RRHH**:
  - **Nuevo control Art. 4 (alfabetización en IA)** — deber propio del deployer, vigente desde 2-feb-2025, evidencia
    = registros de formación. Es el control más barato y universal; faltaba por completo.
  - **Afinado el control Art. 50**: separa el deber PROPIO del deployer (50.3/50.4, aplicable 2-ago-2026) de lo que
    se EXIGE al proveedor (50.1/50.2), y conserva la prohibición del Art. 5.1.f. Añadidos `conditional` con fechas y
    un `note` de plazos al pack. (RRHH pasa de 14 a 15 controles.)
  - **Briefing "Aclaración de plazos"** en el radar (`vigilancia/page.tsx`, determinista, force-dynamic): corrige el
    error de mercado "2-ago-2026 = alto riesgo" contrastando con el aplazamiento a dic-2027 y enfocando lo vivo
    (Art. 4 ya vigente + Art. 50 en N días). Solo se muestra con la UE en vista y mientras el alto riesgo siga por
    venir. **Ese "reflejar bien lo que el mercado dice mal" ES el foso.**
  - Copy sin términos prohibidos (verbos de la organización, "orientación no asesoría legal"). NO construido:
    pack de Colorado, motor de bias-testing, ISO/NIST, shadow-AI (postura del experto mantenida).

- **2026-07-20** · **Precio de Preparación: $350 → $120 USD/mes (early-access, más accesible).** Decisión del
  fundador para bajar la barrera de entrada y atraer más clientes al arrancar. Cambiado en el código: default
  `PLAN_PRICE_LABEL` (`stripe/config.ts`) y la tarjeta de la landing (`Pricing.tsx`). La UI de facturación y el
  paywall usan `PLAN_PRICE_LABEL`, así que quedan en $120 solos. **En Stripe LIVE el producto/precio se crea a
  120 USD** (ojo: moneda USD, la cuenta liquida en MXN). Si alguna vez se fijó `NEXT_PUBLIC_PLAN_PRICE` en Vercel,
  actualizarla o quitarla (si no, pisaría el default).

- **2026-07-20** · **SSO / acceso corporativo (login social Google + Microsoft).** Botones "Continuar con
  Google/Microsoft" en login y registro (`SsoButtons.tsx`, logos oficiales, temas claro/oscuro verificados por
  captura). Usa `supabase.auth.signInWithOAuth` (provider `google`/`azure`); el retorno lo maneja el
  `/auth/callback` existente (ya soportaba el intercambio PKCE `?code=`) → `/dashboard`; el layout del dashboard
  rebota a `/onboarding` si el usuario nuevo aún no tiene org. Callback ampliado para errores del proveedor
  (`?error=` → `/login?error=sso`).
  - **Alcance elegido (checkpoint del fundador):** login **social** (Workspace/M365), NO SAML empresarial. SAML
    exige Supabase Pro + config por cliente; se deja como futuro cuando un enterprise lo pida.
  - **Degradación segura:** cada botón se enciende con `NEXT_PUBLIC_SSO_GOOGLE` / `NEXT_PUBLIC_SSO_MICROSOFT` en
    Vercel (la app no puede saber si el proveedor está configurado en Supabase). Sin la variable, no aparece.
  - **Pendiente del fundador (§1.6 PENDIENTES):** registrar las apps OAuth en Google Cloud / Azure, pegarlas en
    Supabase → Providers, y poner las variables `NEXT_PUBLIC_SSO_*=1` en Vercel. Sin código.

- **2026-07-20** · **Exportación de datos (portabilidad enterprise).** Botón "Descargar JSON" en *Plan y
  facturación* que baja **toda la evidencia declarada** de la organización activa en un JSON portable:
  meta, verificación de integridad de la cadena, sistemas (con historial de evaluaciones + auditoría de sesgo),
  brechas, plan de acción, equipo, revisiones regulatorias y registro de actividad. Route handler
  `src/app/api/export/route.ts` (GET, force-dynamic, `Content-Disposition: attachment`); getter `getExportBundle`
  en la fachada (index + mock + supabase) que **compone getters existentes** (deduplicados por el cache de
  getActiveOrg); tipos `ExportBundle`/`ExportedSystem` en mock-data. Verificado e2e en modo demo por curl
  (HTTP 200, filename `attesta-<org>-<fecha>.json`, JSON válido y completo) + captura de la tarjeta.
  - **Decisión — NO se bloquea por plan:** exportar tus **propios** datos es portabilidad/respaldo (buen argumento
    de confianza y saludable ante RGPD), no una "herramienta" de pago. Disponible en todos los planes a propósito.
  - Sin migración: es solo lectura. El registro de actividad se exporta hasta el tope de `list_audit_log` (500).

- **2026-07-20** · **Audit-trail a prueba de manipulación (tamper-evident, hash-chain SHA-256).** El `audit_log`
  ya era inmutable por triggers (`block_mutation`); ahora además es **verificable**: cada evento incorpora el hash
  del anterior (cadena por organización). Alterar o borrar cualquier fila —incluso con acceso directo a la BD—
  rompe la cadena y queda demostrable. Migración **0020** (columnas `prev_hash`/`row_hash`, función única
  `private.audit_hash` compartida por trigger/backfill/verificación, `write_audit` encadenado con
  `pg_advisory_xact_lock` por org para no bifurcar, backfill de filas históricas, RPC `public.verify_audit_chain`).
  App: getter `verifyAuditChain` en la fachada (con degradación segura si la migración no está aplicada → devuelve
  null) + tarjeta de verificación en vivo en `/dashboard/actividad`.
  - **Copy revisado con el experto de compliance:** el reencuadre honesto y más fuerte es **detectable, no
    inmutable** (*tamper-evident* ≠ *tamper-proof*): "inmutable"→"Cadena íntegra"; subtítulo → "…encadenado con
    SHA-256: cualquier alteración posterior es detectable"; título de tarjeta → "Integridad de la cadena verificada".
    Ningún término prohibido; el sujeto es **la cadena/el registro**, nunca la conformidad (no se afirma que la org
    "cumple"). Es evidencia de integridad **técnica**, no un sello de conformidad.
  - **Pendiente del fundador:** aplicar `supabase/migrations/0020_audit_chain.sql` en el SQL Editor (solo ese archivo).

- **2026-07-18** · **Stripe FUNCIONANDO (modo Test) + bug multi-org del cobro corregido.** El fundador configuró
  Stripe (producto/precio $350, webhook, variables en Vercel) pero producción daba `503 "stripe no configurado"`.
  **Causa:** un **typo** en el nombre de la variable (`STRPE_PRICE_ID` en vez de `STRIPE_PRICE_ID`) → corregido +
  redeploy → webhook pasó a `400 firma inválida` = configurado. Prueba e2e OK: tarjeta `4242` → webhook 200 →
  suscripción `active` → plan Preparación desbloqueado. (Migración 0017 ya aplicada.)
  - **Bug encontrado y corregido al probar (multi-org):** un usuario en varias orgs pagaba con una org, pero al
    volver la sesión resolvía OTRA (gratis) → veía "Suscribirse" pese a estar `active` para la org correcta.
    **Fix (commit 51ab9f1):** `startCheckout` fija la cookie de org activa (`attesta_org`) a la que se suscribe;
    `getActiveOrg` prioriza la org con suscripción activa cuando el usuario no eligió una explícitamente. Verificado
    por el fundador ("ya está todo perfecto"). Lo destapó el selector de organización recién añadido.
  - **PENDIENTE (cobro real):** repetir con llaves **LIVE** + **rotar la `sk_live`** expuesta. Ver PENDIENTES §1.2.

- **2026-07-18** · **Frente 2 cerrado (SEO/OG) + Frente 3 iniciado (selector de org activa).**
  - **SEO/Open Graph:** `metadataBase` corregido (era placeholder `attesta.example`) al dominio real;
    metadata enriquecida (title template, keywords, twitter summary_large_image, siteName, locale, canonical).
    **Imagen OG con la identidad REAL de Attesta** (a petición del fundador): en vez de una imagen dinámica con
    tipografía genérica, se generó una estática con la app real (sello propio `sealmark.png` + tipografía
    **Fraunces**) → `src/app/opengraph-image.png` + `twitter-image.png` (+ alt). Verificado (se sirve 200, meta OK).
  - **Selector de organización activa (Frente 3, enterprise):** cierra el TODO de multi-org. `getActiveOrg` ahora
    respeta la cookie `attesta_org` **solo si el usuario sigue siendo miembro** (validación de seguridad); si no,
    la primera (orden estable). Nuevos `getUserOrgs` (fachada) y `switchOrg` (`org-actions.ts`, valida membresía
    antes de fijar cookie + revalida layout). UI: sección "Organización" en `AccountMenu` (activa marcada, demás
    clicables; solo si >1), threaded por Sidebar+layout. Verificado con captura. Build/lint/tsc verdes.
  - **Pendiente Frente 3 (si se sigue):** exportar datos, SSO, cadena-hash del audit-log. **Frentes previos:**
    recordatorios por correo (§1.5 config) y checklist de activación ya hechos.

- **2026-07-18** · **Activación (Frente 2): checklist de primeros pasos en el resumen.** `OnboardingChecklist`
  (client) sobre el resumen: 4 pasos hasta el primer valor (registrar sistema · clasificar riesgo · detectar
  brechas · invitar equipo) con barra de progreso. Refleja estado real (systems/gaps/members vía la fachada),
  se oculta solo al completarse o con "Ocultar" (localStorage + `user_metadata.onboarding_dismissed`, patrón
  rAF anti-flash como WelcomeGuide). Pasos de pago con chip "Preparación" (nudge de conversión → paywall).
  Verificado con captura (estado 1/4). Build/lint/tsc verdes. **Quedan del Frente 2** (si se quiere seguir):
  SEO/Open Graph de la landing y pulir empty-states menores. **Frente 3 pendiente:** selector de org activa.

- **2026-07-18** · **Recordatorios de gobernanza por correo (digest semanal) — nuevo, env-gated.** El fundador
  eligió 3 frentes nuevos (recordatorios, activación/conversión, enterprise); se empieza por recordatorios.
  Hace real la promesa de "gobernanza continua": un cron semanal (lunes 08:00 UTC, `vercel.json`) manda a cada
  organización un digest con lo que necesita atención — **auditorías de sesgo vencidas/por vencer** (NYC LL144)
  y **próximos plazos regulatorios** (con nº de sistemas afectados). Determinista, reutiliza `bias-audit.ts` +
  `regulatory-watch` (`upcomingDeadlines`/`affectedSystems`). `src/lib/reminders/collect.ts` (qué avisar, ventana
  30 días) + `email.ts` (render HTML/texto + envío Resend, env-gated) + `/api/reminders/run` (auth: Bearer
  `CRON_SECRET` o platform_admin; `service_role` para leer orgs/sistemas y correos de owners/admins; *dry-run* si
  no hay Resend). **Dormido hasta configurar** `RESEND_API_KEY` + `CRON_SECRET` (+ confirmar `SERVICE_ROLE`) en
  Vercel — ver PENDIENTES §1.5. Auth/env-gating verificados por curl (403/500); build/lint/tsc verdes.
  **Siguiente de los 3 frentes:** activación/conversión, luego preparar-enterprise (selector de org activa).

- **2026-07-18** · **Documento maestro (guía completa) como artifact interactivo.** A petición del fundador,
  guía HTML autocontenida con la identidad de Attesta: qué es, problema, ICP/cuña, principios (no certifica),
  recorrido guiado por CADA pantalla con **capturas reales anotadas** (señalamientos numerados + leyenda),
  planes, foso y glosario. Capturas tomadas en modo demo (build sin `.env.local`); imágenes JPEG incrustadas
  como data URIs vía script (sin cargar base64 en contexto). Publicado como artifact privado en claude.ai.
  Fuentes/plantilla en scratchpad (efímero); si hay que regenerarlo, rehacer capturas + `embed.mjs`.

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
