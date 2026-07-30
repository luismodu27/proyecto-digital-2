# Memorándum de investigación regulatoria — IA en educación, EE. UU.

**Para:** equipo Attesta (construcción del policy pack `us-educacion`)
**Fecha del snapshot:** 2026-07-30
**Objeto:** establecer el derecho vigente en EE. UU. sobre privacidad estudiantil + antidiscriminación aplicado a sistemas de IA, y definir el contenido del pack.
**ICP:** el **deployer** — centro educativo, distrito escolar (LEA), universidad, o la EdTech que despliega IA *para* ellos. Cuando una obligación recae sobre el proveedor, se reencuadra como *"exige y conserva evidencia contractual del proveedor"*.
**Naturaleza:** orientación de compliance para autoevaluación y preparación de evidencia. **No es asesoría legal.** Todo el contenido debe pasar por revisión de abogado de EE. UU. (privacidad estudiantil / derecho educativo) antes de GA.

> **Estado del documento:** en construcción incremental. Las secciones se escriben en disco a medida
> que se verifican. Cualquier apartado marcado `⚠️ SIN VERIFICAR` no debe pasar a producto.

---

## 0. Hallazgos de primer orden (lo que cambia decisiones)

1. **La regla COPPA revisada está HOY plenamente exigible.** Publicada el **22-abr-2025**, efectiva el
   **23-jun-2025**, con **fecha de cumplimiento pleno el 22-abr-2026** — que ya pasó hace tres meses. No es
   "lo que viene": es derecho aplicable con acción de la FTC detrás. Certeza **alta**. → El pack debe
   tratar COPPA como **exigible ya**, no como horizonte.
2. **El punto más citable y más vendible del pack: el consentimiento separado para entrenar IA.** La regla
   revisada exige **consentimiento parental verificable SEPARADO** para *divulgar* datos de un menor a
   terceros cuando esa divulgación no es *integral* al servicio; y la FTC declaró en el preámbulo que
   divulgar datos de menores **para entrenar o desarrollar tecnologías de IA no es *integral*** al
   servicio. Traducción operativa: **el consentimiento para usar la app NO cubre el entrenamiento del
   modelo del proveedor.** Ver §B y la trampa C.1 — con el matiz importante del **hueco del uso interno**.
3. **Aquí no hay clasificación de riesgo.** A diferencia del pack UE (Anexo III.3 ⇒ alto riesgo ⇒ Arts. 26/27),
   EE. UU. no clasifica el sistema: regula **qué datos tocas, con qué permiso, con qué contrato y con qué
   efecto discriminatorio**. El pack se estructura por **datos + contrato + equidad**, no por nivel de riesgo.
4. **El corazón del pack es la *school official exception* de FERPA** (`34 CFR § 99.31(a)(1)`): es lo que
   permite a un centro dar datos de estudiantes a una EdTech sin consentimiento de los padres — y solo se
   sostiene si el centro conserva **control directo** sobre el uso y el mantenimiento de esos datos. Un
   contrato estándar de proveedor **no** la satisface por sí solo. El centro **sigue siendo el responsable**.
5. **El sujeto obligado cambia según la norma, y eso hay que decirlo en cada control.** FERPA obliga al
   **centro/agencia educativa** que recibe fondos del ED. COPPA obliga al **operador** del servicio online.
   SOPIPA obliga al **operador** de un servicio K-12, no al centro. Un mismo cliente puede estar en los tres
   lados. → La **condicionalidad es obligatoria** en cada control de este pack.

---

## A. Mapa de aplicabilidad

> **Cómo leer esta tabla.** EE. UU. **no tiene ley federal de IA en educación**. Lo que hay es un
> mosaico: privacidad estudiantil federal + leyes estatales + antidiscriminación + accesibilidad, más
> guía no vinculante. Un mismo centro puede estar sujeto a **varias a la vez y en papeles distintos**
> (sujeto obligado en una, beneficiario de la protección en otra).

| # | Norma | ¿A quién obliga? | ¿Qué la activa? | Vigente desde | Quién la aplica |
|---|---|---|---|---|---|
| 1 | **FERPA** — 20 U.S.C. § 1232g; 34 CFR Part 99 | La **agencia o institución educativa** (distrito, colegio, universidad). El proveedor solo queda alcanzado **indirectamente**, vía la *school official exception* y el límite de redivulgación del § 99.33(a) | Recibir fondos bajo **cualquier programa administrado por el Secretario de Educación** de EE. UU. (incluye la práctica totalidad de K-12 públicos y de universidades con ayuda federal al estudiante, públicas y privadas) | 1974 (regs. 34 CFR Part 99) | **ED / Student Privacy Policy Office**. Sanción última: retirada de fondos federales. **No hay acción privada** (*Gonzaga Univ. v. Doe*, 536 U.S. 273 (2002)) |
| 2 | **PPRA** — 20 U.S.C. § 1232h; 34 CFR Part 98 | LEAs y centros que reciben fondos del ED | Encuestas sobre las **8 áreas protegidas** (creencias políticas, salud mental, conducta sexual, religión, etc.); recogida de datos de alumnos **para marketing**; exámenes físicos invasivos | 1978; ampliada por NCLB (2002) | ED / SPPO. Sin acción privada |
| 3 | **COPPA** — 15 U.S.C. §§ 6501-6506; **Regla: 16 CFR Part 312** | El **operador** del sitio/servicio online (típicamente la **EdTech**, no el centro). Un centro puede ser operador si opera su propio servicio online dirigido a <13 | Servicio online **dirigido a menores de 13** o con **conocimiento efectivo** de que recoge datos personales de un <13 | Ley 1998. **Regla revisada: publicada 22-abr-2025, efectiva 23-jun-2025, cumplimiento pleno exigible desde el 22-abr-2026** → **ya exigible hoy** | **FTC** + **fiscales generales estatales** (15 U.S.C. § 6504). Multa civil por infracción |
| 4 | **SOPIPA** — Cal. B&P Code §§ 22584-22585 | El **operador** de un sitio/servicio *"usado primariamente para fines escolares K-12 y diseñado y comercializado para fines escolares K-12"*, **con conocimiento efectivo**. **NO obliga al centro** | Nexo con California + ese perfil de servicio | 1-ene-2016 | Fiscal general de California / fiscales de distrito (UCL). Sin acción privada expresa en el propio § 22584 |
| 5 | **Leyes estatales de privacidad estudiantil** (~40 estados; SOPIPA es el arquetipo y ha sido copiada en buena parte) | Varía por estado: unas al **proveedor**, otras al **LEA**, muchas a ambos | Nexo con el estado (estudiantes residentes / contrato con LEA del estado) | Varía (mayoría 2014-2020) | Fiscal general estatal; algunas con deberes de inventario/publicación de contratos |
| 6 | **Title VI** — 42 U.S.C. § 2000d; 34 CFR Part 100 | Cualquier **receptor de asistencia financiera federal** | Discriminación por **raza, color u origen nacional**, incl. **impacto dispar** vía la regulación del § 100.3(b)(2) | 1964 | **ED / OCR**, DOJ. ⚠️ Ver §B.14 sobre el estado del impacto dispar |
| 7 | **Title IX** — 20 U.S.C. § 1681; 34 CFR Part 106 | Programas educativos que reciben fondos federales | Discriminación **por sexo** | 1972 | ED / OCR; **sí hay acción privada** implícita |
| 8 | **Section 504** — 29 U.S.C. § 794; 34 CFR Part 104 | Receptores de asistencia financiera federal | Discriminación por **discapacidad**; deber de **ajustes razonables** y comunicación accesible | 1973 | ED / OCR; acción privada |
| 9 | **ADA Título II** — 42 U.S.C. §§ 12131 ss.; 28 CFR Part 35 | **Entidades públicas**: distritos públicos, universidades públicas — **con o sin fondos federales** | Ser entidad pública estatal o local | 1990. **Regla web: 28 CFR §§ 35.200-35.205 (publicada 24-abr-2024), estándar WCAG 2.1 AA. Fechas de cumplimiento PRORROGADAS un año por regla interina del DOJ (Federal Register, 20-abr-2026): 26-abr-2027 (población ≥50.000) y 26-abr-2028 (resto y distritos especiales)** | DOJ; acción privada |
| 10 | **ADA Título III** — 42 U.S.C. §§ 12181 ss.; 28 CFR Part 36 | **Public accommodations**, incluidas escuelas y universidades **privadas** | Ser establecimiento privado del listado (incl. *"nursery, elementary, secondary, undergraduate, or postgraduate private school"*) | 1990 | DOJ; acción privada |
| 11 | **BIPA (Illinois)** — 740 ILCS 14 | **Entidades privadas** que recogen identificadores biométricos en Illinois | Recoger huella, escaneo facial/retina, geometría de mano o **voiceprint** — típico de **proctoring** y control de acceso | 2008 | **Acción privada con daños legales tasados** — el riesgo litigioso más real del vertical |
| 12 | **Guía federal de IA en educación** — informe OET *"AI and the Future of Teaching and Learning"* (may-2023); *Dear Colleague Letter* del ED sobre uso de fondos federales en IA (22-jul-2025) | Nadie, en sentido estricto | — | 2023 / 2025 | **GUÍA, NO LEY.** Útil como estándar de diligencia y como condición práctica de elegibilidad de fondos, no como obligación autónoma |

### Qué NO está en esta tabla, y por qué

- **No hay ley federal de IA en educación.** Ni clasificación por riesgo, ni evaluación de impacto
  obligatoria, ni registro. Cualquier copy que sugiera lo contrario es falso.
- **Leyes estatales generales de privacidad del consumidor** (CCPA/CPRA, VCDPA, CPA…): la mayoría
  **exceptúa** los datos cubiertos por FERPA y/o a las instituciones sin ánimo de lucro. No se
  incluyen aquí para no inflar el pack; se tratan en los packs `us-ca-*`. *(Certeza media: el alcance
  exacto de las exenciones FERPA varía por estado y no se ha verificado estado por estado.)*
- **Leyes estatales de IA de propósito general** (p. ej. Colorado ADMT, SB 26-189, exigible 1-ene-2027):
  su *covered domain* **incluye expresamente matrícula y oportunidad educativa**. Ese contenido vive en
  el pack de Colorado, no aquí, pero conviene un enlace cruzado en producto.

---

## B. Controles, uno por uno

*(en construcción)*

---

## C. Trampas del vertical

*(en construcción)*

---

## D. Contraste explícito con el pack UE

*(en construcción)*

---

## E. Fuentes

*(en construcción)*
