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
- _(las correcciones futuras del fundador se anotan aquí)_

## 11. Preguntas abiertas / próximos pasos de validación

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
- **Capa 2 Evaluaciones + plan de riesgo** 🟡 (cuestionario + plan de acción; falta plan con tareas/responsables editable).
- **Capa 3 Evidencia + documentación + audit-trail** ✅ (audit-trail ✅, evidencia declarada ✅, export PDF ✅, **generador de documentación técnica / dossier de gobernanza por sistema ✅**; futuro opcional: redacción asistida por LLM y firma/versión del dossier).
- **Capa 4 Pruebas técnicas del modelo** ❌ (sesgo/explicabilidad/robustez — INTEGRAR, no construir).
- **Capa 5 Monitoreo continuo en producción** ❌ (drift, incidentes).
- **Capa 6 Supervisión humana / roles** 🟡 (roles owner/admin/member existen; faltan flujos de aprobación).
- **Capa 7 Vigilancia regulatoria multi-marco** 🟡 (el **foso** más fuerte; **radar v1 ✅**: catálogo curado EU AI Act + motor de relevancia + UI `/dashboard/vigilancia`; falta persistir acks, multi-marco y la **automatización de ingesta** — los 4 agentes + RAG/pgvector).
- **Capa 8 Riesgo de terceros/proveedores** ❌.
- **Capa 9 Gobernanza de agentes de IA** ❌ (frontera; casi nadie la cubre).
- **Capa 10 Reportes/colaboración** 🟡 (dashboard + PDF; faltan reportes a dirección/auditor).

### 13.2 Roadmap (cuña → plataforma)
1. **Cuña (MVP)** = Inventario + gap (Capas 0-1) → **YA lo tenemos**.
2. **Papeleo** = documentación + evidencia + audit-trail (Capa 3) → **generador de documentación (dossier) ✅ hecho**.
3. **Pegajoso** = monitoreo + pruebas de sesgo/explicabilidad (Capas 4-5) → integrar Evidently/Fairlearn.
4. **Foso** = vigilancia regulatoria multi-marco (Capa 7) → **radar v1 ✅** (curado); falta automatización de ingesta.
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
- **Precios de mercado (referencia):** mid-market gobernanza de IA **30–50k $/año**; pyme desde ~5k €/año. (Nuestro €390/mes en la landing es orientativo/early-access.)
- **Canal:** consultores/auditores como aliados ("powered by" + reparto), no competencia.

### 13.6 Corrección de fechas vs el doc
- El doc dice "deadline ago-2026, posible aplazamiento". **Actualizado:** el Omnibus ya se
  adoptó (2026) → alto riesgo **2 dic 2027** (ver §6). El mensaje es "ventana, no urgencia".
