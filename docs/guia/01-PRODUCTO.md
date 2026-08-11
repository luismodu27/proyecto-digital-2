# 01 · Qué es Attesta y por qué

> Guía de producto para quien retoma el proyecto. Aquí está el **qué** y, sobre todo, el
> **por qué**: el problema, a quién servimos, cómo nos posicionamos y las reglas de producto
> que **no se violan nunca**. Si vas a escribir copy de UI, textos de PDF o reglas de
> negocio, lee esto **antes** de tocar nada.
>
> Documentos hermanos: [`00-INICIO.md`](./00-INICIO.md) ·
> [`02-ARQUITECTURA.md`](./02-ARQUITECTURA.md) ·
> [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md) ·
> [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md) ·
> [`05-DECISIONES.md`](./05-DECISIONES.md) · tareas abiertas en
> [`../../PENDIENTES.md`](../../PENDIENTES.md).
> Fuentes canónicas de esta guía: `MEMORY.md` (§1–§6, §13), `CLAUDE.md` (resumen + reglas
> de producto), `src/app/page.tsx` / `src/components/landing/` (landing) y
> `src/lib/mock-data.ts` (tipos canónicos).

---

## 1. El problema que resolvemos

Las empresas están adoptando IA más rápido de lo que pueden gobernarla, y ahora esa IA
está regulada. El dolor es **agudo, caro y con presupuesto asignado** — la combinación que
hace vendible un producto B2B.

Cifras que sostienen el mensaje (usa **estas**, no otras; hay versiones envenenadas que
NO debes citar):

- **77%** de las empresas reconoce que su adopción de IA avanza más rápido que su capacidad
  de gobernarla (IBM, estudio de jun-2026, 2.000 CIO/CTO en 33 países).
  **No uses "78%"**: esa cifra venía de un press release de proveedor con conflicto de
  interés; la sustituye el 77% de IBM.
- **Más de la mitad** de las empresas no tiene un inventario formal de sus sistemas de IA
  (Cloud Security Alliance). **No uses "83%"**: no tiene fuente independiente sólida.
- Hoy el problema se resuelve a mano: **hojas de cálculo + consultores a ~$500/hora**.
- El coste de compliance para grandes empresas se estima en **$8–15M**.
- Las multas del EU AI Act llegan a **€35M o el 7% de la facturación** (Art. 99) — más
  duras que las del RGPD.

En una frase: quien despliega IA en decisiones que afectan a personas **está "en el
anzuelo"** regulatoriamente, y lo resuelve con Excel y consultoría cara porque no tiene
herramienta ni equipo dedicado.

---

## 2. Qué es Attesta

**En una frase:** Attesta es un SaaS B2B de **compliance y gobernanza continua de IA** para
el **mid-market** — un *system of record* que inventaría los sistemas de IA de una
organización, clasifica su riesgo, genera **evidencia lista para auditoría** y vigila los
cambios regulatorios.

**En un párrafo:** Attesta (el nombre evoca *attestation* — evidencia, no certificado) es la
plataforma donde una empresa mediana que usa IA de alto riesgo **registra, ordena y
demuestra** su gobernanza de IA sin necesitar un equipo GRC dedicado ni consultores a $500
la hora. Reúne en un solo lugar el **inventario** de todos los sistemas de IA en uso, una
**clasificación de riesgo orientativa** según el EU AI Act y los marcos aplicables de
EE. UU., un **audit-trail inmutable** con la evidencia declarada de cada control, la
**exportación a PDF** (dossier de gobernanza por sistema, informe ejecutivo de la
organización) y un **radar regulatorio** que avisa de cambios normativos. Attesta prepara a
la organización para una auditoría y le ahorra el papeleo — **no la certifica**: quien
declara y responde es siempre la organización, y Attesta es el registro que lo sostiene.

Cómo lo cuenta la landing (`src/components/landing/LandingPage.tsx`): hero → franja de
confianza → estadísticas del problema → **foco en reclutamiento** → módulos → plataforma →
cobertura regulatoria → por qué ahora → caso de uso → evidencia → verificación →
**honestidad** (sección explícita sobre lo que Attesta *no* hace) → precios → demo → FAQ →
lista de espera. La sección de **honestidad** no es adorno: es la regla #1 hecha marketing.

---

## 3. A quién servimos: el ICP es el *deployer*, no el *provider*

### 3.1 El cliente

- **Empresa:** mid-market, aprox. **200–2.000 empleados**, que usa IA en decisiones con
  impacto sobre personas (contratación, scoring de crédito, suscripción de seguros,
  diagnóstico, evaluación educativa) y que **no tiene un equipo GRC maduro**.
- **Comprador / champion:** responsable de Riesgo, Legal o Compliance, o un "Head of
  Data/AI" que de repente es responsable sin equipo. En la cuña vertical, el
  **responsable de RRHH/Talent + Legal**.
- **No es el ICP (todavía):** las grandes corporaciones con equipos GRC establecidos — ese
  es el terreno de los incumbentes. Attesta ataca el **whitespace desatendido** del
  mid-market.

### 3.2 Por qué *deployer* y no *provider* (esto es capital)

El EU AI Act distingue dos sujetos: el **provider** (quien fabrica/comercializa el sistema
de IA) y el **deployer** (quien lo usa bajo su autoridad). **Nuestro ICP es el deployer.**

Consecuencia práctica que atraviesa todo el producto y todos los textos: las obligaciones
que el Reglamento pone sobre el *provider* (grosso modo, Arts. 9–15: gestión de riesgos,
datos, documentación técnica, registros, transparencia, precisión/robustez del sistema)
**no las escribimos como si el cliente fabricara el sistema**. Se **reencuadran** como
*"exige y conserva la evidencia del proveedor"* — por ejemplo, exigir al proveedor el
marcado CE, la documentación técnica o la declaración de conformidad, y guardarla.

El foco propio del deployer son los **Arts. 14, 26, 27, 50 y 86** (supervisión humana,
obligaciones del deployer, evaluación de impacto en derechos fundamentales, transparencia,
derecho a explicación). Redactar una obligación de provider como si fuera del cliente es un
**error regulatorio**, no un matiz de estilo.

---

## 4. Posicionamiento y la cuña vertical

### 4.1 Cómo se vende

- **Ángulo primario: "seguridad + ahorro de consultoría"** (ROI, evitar los $500/h), **no**
  solo "miedo a la multa". Razón: el deadline puede aplazarse y el miedo se enfría; el
  ahorro y la tranquilidad no. De hecho, el **Digital Omnibus on AI** (adoptado en 2026)
  movió el deadline de obligaciones de alto riesgo del Anexo III de ago-2026 a **dic-2027**
  → hay más tiempo para construir bien, y el mensaje pasa de "urgencia inmediata" a
  **"obligación inevitable con ventana más larga"**.
- **Ángulo secundario:** esa obligación es inevitable; hay tiempo para hacerlo bien.
- **Land-and-expand:** EU AI Act → normas sectoriales → leyes de IA de EE. UU. → ISO 42001.
- **Canal:** consultores y auditores como **aliados** ("powered by" + reparto), no
  competencia.

### 4.2 La cuña: RRHH / reclutamiento

La estrategia es **cuña → plataforma**: entrar por un caso de uso concreto y afiladísimo, y
expandir. La cuña decidida por el fundador (2026-07-17) es **RRHH / reclutamiento**, en
concreto la **IA que filtra CVs y evalúa candidatos**.

Por qué es una cuña ideal:

- Es **alto riesgo directo** — el Anexo III del EU AI Act lista explícitamente el empleo.
- Hay marcos de EE. UU. que ya muerden hoy (NYC Local Law 144, Colorado SB 26-189, Illinois
  AIVIA, EEOC), lo que da urgencia real más allá de Europa.
- El comprador es identificable: RRHH/Talent + Legal en una empresa mediana.

Esto se ve en los datos demo de `src/lib/mock-data.ts`: los sistemas de ejemplo son "Cribado
de CVs — ATS", "Ranking de candidatos", "Entrevistas por vídeo con IA", "Chatbot de
reclutamiento", "Test psicométrico automatizado" — todos con `owner: "RRHH"` o
`"Talent Acquisition"` y `domain` de contratación. El **policy pack** vive en
`src/lib/policy-packs/rrhh.ts`. La landing tiene una sección dedicada (`RecruitmentFocus`).

---

## 5. El MVP y qué hace el producto

El *system of record* se organiza como una **torre de capas** (MEMORY.md §13). El **MVP
confirmado** es **Inventario + Clasificación de riesgo + Gap assessment exportable a PDF**;
también es el "servicio-cebo" vendible manualmente ("AI inventory + gap assessment") para
validar demanda. Sobre esa base ya está construido bastante más. Módulos:

| Módulo | Qué hace | Dónde vive (orientativo) |
| --- | --- | --- |
| **Inventario de sistemas de IA** | Catálogo de todos los modelos/sistemas en uso; alta manual, importación por CSV e **intake compartible** sin cuenta. | `dashboard/inventario`, `src/lib/import/csv.ts` |
| **Clasificación de riesgo** | Asistente que clasifica cada sistema según el EU AI Act (inaceptable / alto / limitado / mínimo) y marcos aplicables; incluye capa **GPAI** (Cap. V) para modelos de propósito general. | `src/lib/risk-assessment.ts`, `dashboard/riesgo/evaluar` |
| **Gap assessment + plan de acción** | Qué falta para estar preparado, con plan de remediación editable (responsable/fecha/estado, dedupe, recordatorios de vencimiento). | `src/lib/recommendations.ts`, `dashboard/gap`, `dashboard/plan` |
| **Evidencia + audit-trail + dossier** | Registro **inmutable** de cambios, evidencia declarada por control, **vault** de archivos con paquete firmado, y export a **PDF** (dossier de gobernanza por sistema + informe ejecutivo). | `src/lib/audit.ts`, `src/lib/vault/`, `dashboard/inventario/[id]/dossier`, `dashboard/informe` |
| **Vigilancia regulatoria (el foso)** | Radar de cambios normativos multi-marco (EU AI Act + 5 marcos de EE. UU. de IA-empleo), con acuse auditado y pipeline de candidatos que un **humano valida** antes de publicar. | `src/lib/regulatory-watch.ts`, `dashboard/vigilancia` |

Los **niveles de riesgo canónicos** están tipados en `src/lib/mock-data.ts`
(`type RiskLevel = "unacceptable" | "high" | "limited" | "minimal"`), con sus etiquetas
oficiales ES/EN (Inaceptable / Alto riesgo / Riesgo limitado / Riesgo mínimo). El campo de
puntuación de un sistema se llama `compliance: number` en el tipo `AiSystem`, **pero en la
UI se muestra siempre como "% listo / preparación para auditoría", nunca como "%
cumplimiento"** (ver la regla en §6). Los estados de evidencia son `declared` / `evidenced`
/ `reviewed` (`type EvidenceState`).

**Todo el contenido legal es 100% determinista, cero LLM.** Las rutas que emiten texto
regulatorio (dossier, informe, radar, clasificación, recomendaciones) se ensamblan solo con
datos reales del cliente + texto del AI Act ya verificado por el experto. Un texto legal
alucinado es un pasivo. La automatización futura (pipeline de vigilancia) **propone
borradores** que un **humano valida** antes de publicar — nunca se publica prosa legal
generada sin revisión.

---

## 6. Reglas de producto que NO se violan

Estas reglas están en `CLAUDE.md` y son **inviolables**. Un guard en CI las hace verificables
(`scripts/check-prohibited-copy.mjs`, `npm run check:copy`) y hay otro guard de runtime sobre
los borradores del LLM (`PROHIBITED_COPY` en `src/lib/analista/llm.ts`). No las trates como
recomendaciones de estilo: son el núcleo de la propuesta y de la honestidad del producto.

### 6.1 Attesta **NO certifica**

Attesta es system-of-record de evidencia + autoevaluación + preparación para auditoría.
**No** emite certificados, **no** aprueba, **no** dictamina que alguien cumple. La sección
"Honestidad" de la landing lo dice en voz alta a propósito.

### 6.2 Copy PROHIBIDO vs Copy SEGURO

En UI y en PDF, jamás uses el registro de la izquierda; usa el de la derecha.

| Copy PROHIBIDO (nunca) | Copy SEGURO (sí) |
| --- | --- |
| certificado, sello de conformidad, marcado CE (como algo que da Attesta) | autoevaluación, preparación para auditoría |
| aprobado / apto | brechas identificadas, evidencia declarada |
| cumple / *compliant* | % listo / preparación |
| garantiza, libre de riesgo | clasificación **orientativa** |
| validado / auditado **por Attesta** | evidencia declarada por la organización |
| % de cumplimiento | % listo / % de preparación |
| asesoría legal | (Attesta no da asesoría legal) |

**No escribas copy prohibido ni siquiera como ejemplo** en documentación, tests o comentarios
salvo que el guard lo requiera y esté marcado como negación/escape (`attesta-copy-ok` con
motivo). El guard **ignora negaciones** ("Attesta NO certifica") y preguntas de FAQ, así que
es correcto y necesario escribir la regla en negativo — pero no la afirmación peligrosa.

### 6.3 Los verbos son de la **organización**, no de Attesta

El sujeto que declara, evalúa y responde es siempre el cliente: *"tu organización
declara…"*, *"la organización evalúa…"*. Attesta **registra, ordena y presenta** — no juzga
ni afirma cumplimiento en nombre del cliente. Esto no es cosmética: es lo que mantiene a
Attesta como *registro de evidencia* y no como *certificador*, que es la línea que define el
producto (y su exposición legal).

### 6.4 Provider vs deployer (recordatorio operativo)

Como se explicó en §3.2: en textos regulatorios, las obligaciones del **provider** (Arts.
9–15) se reencuadran como *"exige/conserva evidencia del proveedor"*; el foco propio del
**deployer** son los Arts. 14, 26, 27, 50 y 86. No redactes como si el cliente fabricara el
sistema.

---

## 7. A quién sirve, en una línea

A la empresa **mediana** que usa IA de **alto riesgo** sobre personas (empezando por
**RRHH/reclutamiento**), cuyo responsable de Riesgo/Legal/Compliance necesita **ordenar,
demostrar y mantener** su gobernanza de IA — preparándose para una auditoría y ahorrándose la
consultoría cara — **sin que nadie confunda "estar preparado" con "estar certificado"**.

---

### Para seguir

- Cómo está construido todo esto por dentro → [`02-ARQUITECTURA.md`](./02-ARQUITECTURA.md).
- Cómo trabajamos (loop, verificación, "subido ≠ publicado") →
  [`03-FLUJO-DE-TRABAJO.md`](./03-FLUJO-DE-TRABAJO.md).
- Qué se te pide como agente → [`04-ROL-DEL-AGENTE.md`](./04-ROL-DEL-AGENTE.md).
- El "por qué" histórico de cada decisión → [`05-DECISIONES.md`](./05-DECISIONES.md) y la
  bitácora §10 de `MEMORY.md`.
