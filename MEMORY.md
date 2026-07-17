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

- Obligaciones de alto riesgo del EU AI Act con fecha (**2 ago 2026**).
- Propuesta **Omnibus** podría aplazar el deadline a **dic 2027** → amplía el tiempo
  para construir, no lo cierra.
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
- _(las correcciones futuras del fundador se anotan aquí)_

## 11. Preguntas abiertas / próximos pasos de validación

- ~~Nombre comercial~~ → **Attesta** ✅
- ~~Alcance del MVP~~ → confirmado ✅
- ~~Landing + app shell~~ → hecho ✅ (con datos de ejemplo)
- ~~Asistente de clasificación de riesgo~~ → hecho ✅ (lógica en memoria, sin persistir aún)
- ~~Backend/datos~~ → **Supabase**, fundación lista ✅ (falta conectar credenciales + auth + writes).
- **Credenciales Supabase del fundador** (URL + anon key) para activar el modo real.
- **Auth UI** (login/registro) + middleware de sesión + onboarding.
- **Write-path**: persistir clasificación de riesgo, alta/edición de sistemas y brechas.
- Conectar formulario de waitlist a un destino real (CRM / lista).
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
- **Audit-trail** — registro cronológico e íntegro de acciones/cambios para auditoría.
- **Flywheel** — círculo virtuoso: más clientes y más normas → mejor base de conocimiento → más valor.
