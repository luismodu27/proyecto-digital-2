/**
 * Policy pack — IA en empleo (California, FEHA / ADS).
 *
 * Controles del DEPLOYER (empleador) bajo las Employment Regulations Regarding
 * Automated-Decision Systems del California Civil Rights Council, que enmiendan
 * el reglamento de la Fair Employment and Housing Act (FEHA), Title 2 del
 * California Code of Regulations (2 CCR §11008 y ss.). Aprobadas el 27-jun-2025,
 * EN VIGOR desde el 1-oct-2025.
 *
 * A diferencia del EU AI Act, el EMPLEADOR es el OBLIGADO DIRECTO: no hay
 * reencuadre provider/deployer. Única excepción: la responsabilidad por AGENTES
 * y proveedores que operan el ADS por cuenta del empleador → ahí sí se usa el
 * encuadre "exige y conserva evidencia del proveedor". Obligado = empleador con
 * 5+ empleados (al menos uno en California). Es empleo puro, nuestro ICP.
 *
 * ⚠️ IMPORTANTE (regla dura del producto): Attesta NO realiza ni valida el
 * anti-bias testing ni la conservación de registros; solo REGISTRA la evidencia
 * declarada (fecha, alcance, resultados, autor). "Prueba de sesgo realizada" ≠
 * "aprobada" ≠ "sin discriminación".
 *
 * Orientación de compliance, NO asesoría legal. Contenido revisado por el
 * subagente `compliance-domain-expert` (2026-07-22) contra la fuente oficial
 * (calcivilrights.ca.gov, Final Text) y análisis de despachos (Mayer Brown,
 * Littler, Jackson Lewis, Ogletree, Duane Morris, Covington). Casi todos los
 * controles son territoriales → van marcados con su condición de aplicabilidad.
 */

import type { PolicyPack } from "./types";

export const US_CA_FEHA_PACK: PolicyPack = {
  id: "us-ca-feha",
  name: "IA en empleo — California (FEHA)",
  tag: "EE. UU. · California · Empleo",
  summary:
    "Obligaciones del empleador que usa sistemas de decisión automatizada (ADS) en decisiones de empleo en California (reglamento FEHA del Civil Rights Council, en vigor 1-oct-2025). Aplícalo a un sistema de selección o gestión de personal para precargar sus brechas.",
  note: "Aplica si empleas o contratas en California con 5+ empleados (al menos uno en el estado). El empleador es el obligado directo. Snapshot regulatorio: julio 2026. Orientativo, no asesoría legal; conviene validación por un abogado de empleo de California antes de usarlo en producción.",
  controls: [
    {
      id: "identificar-ads",
      title: "Identifica qué herramientas son un ADS en decisiones de empleo (orientativo)",
      description:
        "Revisa cada herramienta que interviene en decisiones de empleo (cribado de CVs, ranking, scoring, pruebas automatizadas, análisis de vídeo, juegos/tests, asignación de turnos, evaluación de desempeño) y determina si encaja en la definición de \"automated-decision system\": un proceso computacional que toma una decisión o facilita la decisión humana sobre un beneficio de empleo, derivado de o que usa IA, aprendizaje automático, algoritmos, estadística u otras técnicas de procesamiento de datos (la definición revisada incluye la IA generativa). Esa clasificación determina qué obligaciones del reglamento FEHA recaen sobre ti como empleador. Conserva el razonamiento de por qué una herramienta es o no un ADS.",
      article: "Cal. Civil Rights Council · FEHA ADS · 2 CCR §11008",
      severity: "alta",
      conditional:
        "Solo si empleas o contratas en California (empleador con 5+ empleados, al menos uno en el estado).",
    },
    {
      id: "impacto-dispar-clase-protegida",
      title:
        "No uses un ADS que produzca impacto dispar sobre una clase protegida FEHA (orientativo)",
      description:
        "Es ilícito bajo la FEHA usar un ADS que resulte en discriminación —directa o por impacto dispar— sobre una clase protegida (raza, edad, credo religioso, origen nacional, sexo, discapacidad, etc.). La responsabilidad se basa en el EFECTO, no en la intención: puedes ser responsable aunque no quisieras discriminar. Como empleador: entiende cómo decide la herramienta y exige/registra evidencia de las pruebas antisesgo. La existencia, calidad, eficacia, alcance, recencia, resultados y tu respuesta a esas pruebas son factores relevantes en la defensa (ni necesarios ni suficientes); su AUSENCIA puede usarse como prueba en tu contra. Attesta NO ejecuta ni valida el anti-bias testing: registra fecha, alcance, resultados y autor como evidencia declarada.",
      article: "FEHA · 2 CCR §11017 (impacto adverso) · §11009",
      severity: "alta",
      conditional:
        "Solo si empleas o contratas en California con un ADS que interviene en decisiones de empleo.",
    },
    {
      id: "recencia-pruebas-sesgo",
      title:
        "Repite las pruebas antisesgo con recencia; una validación única al lanzar no basta (orientativo)",
      description:
        "El reglamento valora que las pruebas antisesgo sean oportunas, repetibles y transparentes: una sola validación al lanzar la herramienta no demuestra por sí sola medidas razonables. Programa una revisión periódica del ADS y de sus resultados, y documenta tu respuesta cuando una prueba muestre impacto adverso. Esto es una buena práctica defensiva (factor de defensa), no un deber de auditoría con calendario fijo como el de NYC. Attesta registra la fecha, el alcance y el resultado de cada ronda como evidencia declarada; no ejecuta la prueba.",
      article: "FEHA · 2 CCR §11009 (pruebas antisesgo)",
      severity: "media",
      conditional:
        "Solo si empleas o contratas en California con un ADS que interviene en decisiones de empleo.",
    },
    {
      id: "retencion-4-anios",
      title: "Conserva los registros del ADS al menos 4 años (orientativo)",
      description:
        "El empleador (y las agencias de empleo, organizaciones sindicales y programas de aprendizaje) debe conservar los registros de empleo, incluidos los datos del ADS, durante un mínimo de 4 años. Alcance típico: datos de entrada (inputs), salidas (outputs/puntuaciones), criterios de selección, y los datos usados para diseñar, desarrollar o personalizar el ADS para tu uso, además de los resultados de auditorías/pruebas. Este modelo de conservación encaja con Attesta como system of record. Attesta NO realiza la retención de tus datos operativos del ADS: registra qué se conserva, dónde y desde cuándo, como evidencia declarada.",
      article: "FEHA · 2 CCR §11013 (conservación de registros)",
      severity: "alta",
      conditional:
        "Solo si empleas o contratas en California con un ADS que interviene en decisiones de empleo.",
    },
    {
      id: "evaluacion-individualizada",
      title:
        "El ADS por sí solo no satisface la evaluación individualizada (antecedentes penales) (orientativo)",
      description:
        "Cuando la decisión exige una evaluación individualizada —por ejemplo, considerar antecedentes penales o la idoneidad para el puesto— un ADS que criba o puntúa automáticamente NO sustituye ese análisis caso a caso que exige la FEHA. Documenta el punto de intervención humana significativa: quién revisa, con qué criterios y con qué margen para apartarse del output del ADS. Usar un ADS para publicar ofertas de forma que discrimine o para indagar de forma ilícita en el historial penal está prohibido.",
      article: "FEHA · 2 CCR §11017.1 (impacto adverso · antecedentes penales)",
      severity: "alta",
      conditional:
        "Solo si empleas o contratas en California y el ADS interviene en decisiones que requieren evaluación individualizada.",
    },
    {
      id: "indagacion-medica-psicologica",
      title:
        "Verifica que el ADS no realice una indagación médica o psicológica encubierta (orientativo)",
      description:
        "Un ADS que aplica tests, preguntas o juegos/puzles que puedan revelar información sobre una discapacidad puede constituir una indagación médica o psicológica ilícita (riesgo FEHA/ADA). Control de triaje: verifica que la herramienta no infiera salud, condición o discapacidad, ni analice tono de voz, expresiones faciales u otras características o comportamientos de forma que discrimine. Si la herramienta lo hace, no la uses en esa forma; documenta la verificación. Cerrar esta brecha significa \"verifiqué que NO realiza una indagación de discapacidad\", no \"preparé una indagación\".",
      article: "FEHA · 2 CCR §11016 · §11008.1",
      severity: "alta",
      conditional:
        "Solo si empleas o contratas en California con un ADS que evalúa a personas.",
    },
    {
      id: "ajuste-razonable-discapacidad",
      title:
        "Ofrece ajuste razonable o proceso alternativo cuando el ADS pueda excluir a personas con discapacidad (orientativo)",
      description:
        "Un ADS que mide aptitudes, tiempo de reacción u otras capacidades puede discriminar a personas con ciertas discapacidades. Habilita un canal para solicitar un ajuste razonable o un proceso de selección alternativo, e informa de esa posibilidad. Conserva la política de ajustes, las solicitudes recibidas y cómo se resolvieron como evidencia declarada.",
      article: "FEHA · 2 CCR §11016 (discapacidad · ajuste razonable)",
      severity: "media",
      conditional:
        "Solo si empleas o contratas en California con un ADS que evalúa aptitudes o capacidades.",
    },
    {
      id: "proxies-impacto-adverso",
      title:
        "Entiende los criterios de selección del ADS y elimina proxies de clase protegida (orientativo)",
      description:
        "Documenta qué variables y criterios usa el ADS para decidir y depura las que actúan como proxy de una clase protegida (p. ej. señales correlacionadas con edad, origen o discapacidad). Es la base de tu defensa por impacto adverso: exige al proveedor la lista de features y sus pruebas de impacto, revisa periódicamente y registra tus revisiones. La responsabilidad se basa en el efecto, no en la intención.",
      article: "FEHA · 2 CCR §11017 (impacto adverso · criterios de selección)",
      severity: "media",
      conditional:
        "Solo si empleas o contratas en California con un ADS que interviene en decisiones de empleo.",
    },
    {
      id: "publicidad-reclutamiento",
      title:
        "No uses el ADS para dirigir ofertas o reclutar de forma discriminatoria (orientativo)",
      description:
        "Usar un ADS para publicar o segmentar ofertas de empleo de forma que excluya o desincentive a una clase protegida (por ejemplo, segmentación por edad o género en la difusión) está prohibido. Revisa cómo la herramienta de reclutamiento o los canales publicitarios dirigen las ofertas y conserva evidencia de que la audiencia no excluye clases protegidas.",
      article: "FEHA · 2 CCR §11009 (publicidad y reclutamiento)",
      severity: "media",
      conditional:
        "Solo si empleas o contratas en California y usas un ADS para difundir o segmentar ofertas.",
    },
    {
      id: "responsabilidad-agentes-proveedores",
      title:
        "Responde por los agentes y proveedores que operan el ADS por tu cuenta: exige y conserva su evidencia (orientativo)",
      description:
        "El reglamento define \"agente\" como quien ejerce por cuenta del empleador una función tradicionalmente suya (reclutar, cribar, contratar, promover, decidir retribución/permisos), incluido cuando lo hace mediante un ADS; el empleador responde de esas actuaciones y las prohibiciones de aiding-and-abetting siguen aplicando. Aunque la responsabilidad de los meros desarrolladores/vendedores se acotó, el empleador no se libera. Reencuadre deployer: exige contractualmente a tu proveedor/agente sus pruebas antisesgo, documentación de criterios y registros del ADS, y conserva esa evidencia del proveedor como parte de tu expediente.",
      article: "FEHA · 2 CCR §11008 (agente) · §11020",
      severity: "alta",
      conditional:
        "Solo si empleas o contratas en California y un tercero (vendor/agencia) opera el ADS por tu cuenta.",
    },
    {
      id: "conservar-evidencia-ca",
      title: "Mantén un expediente trazable de pruebas, registros y verificaciones (orientativo)",
      description:
        "Mantén un registro por herramienta y por decisión: inventario del ADS y por qué lo es, fecha/alcance/resultados de las pruebas antisesgo, criterios de selección y features, evidencia del proveedor/agente, registros del ADS conservados (4 años), verificaciones de indagación médica y políticas de ajuste razonable. Es la base para responder a una reclamación o a una investigación del Civil Rights Department. Attesta actúa como system of record de esa evidencia declarada, no como certificador ni auditor.",
      article: "Transversal · 2 CCR §11013; §11008 y ss.",
      severity: "media",
      conditional:
        "Aplica siempre que uses un ADS en decisiones de empleo en California.",
    },
  ],
};

/**
 * English (validated) mirror of US_CA_FEHA_PACK. Content only:
 * `id`/`article`/`severity`/`conditional` logic kept identical to the ES pack;
 * `name`, `tag`, `summary`, `note`, titles and descriptions translated. The
 * employer is the direct obligee (no provider/deployer reframing) except for
 * liability for agents/vendors that operate the ADS on the employer's behalf.
 * Attesta does NOT perform or validate anti-bias testing or record retention —
 * that stays as an explicit negation.
 */
export const US_CA_FEHA_PACK_EN: PolicyPack = {
  id: "us-ca-feha",
  name: "AI in employment — California (FEHA)",
  tag: "US · California · Employment",
  summary:
    "Obligations of the employer that uses automated-decision systems (ADS) in employment decisions in California (Civil Rights Council FEHA regulations, effective Oct 1, 2025). Apply it to a selection or workforce-management system to preload its gaps.",
  note: "Applies if you employ or hire in California with 5+ employees (at least one in the state). The employer is the direct obligee. Regulatory snapshot: July 2026. Indicative, not legal advice; a California employment attorney should validate it before production use.",
  controls: [
    {
      id: "identificar-ads",
      title: "Identify which tools are an ADS in employment decisions (indicative)",
      description:
        "Review each tool that takes part in employment decisions (CV screening, ranking, scoring, automated tests, video analysis, games/tests, shift assignment, performance evaluation) and determine whether it fits the definition of an \"automated-decision system\": a computational process that makes a decision or facilitates human decision making about an employment benefit, derived from or using AI, machine learning, algorithms, statistics or other data-processing techniques (the revised definition includes generative AI). That classification determines which FEHA-regulation obligations fall on you as an employer. Keep the reasoning for why a tool is or is not an ADS.",
      article: "Cal. Civil Rights Council · FEHA ADS · 2 CCR §11008",
      severity: "alta",
      conditional:
        "Only if you employ or hire in California (employer with 5+ employees, at least one in the state).",
    },
    {
      id: "impacto-dispar-clase-protegida",
      title:
        "Do not use an ADS that produces disparate impact on a FEHA protected class (indicative)",
      description:
        "It is unlawful under FEHA to use an ADS that results in discrimination —direct or disparate impact— against a protected class (race, age, religious creed, national origin, sex, disability, etc.). Liability is based on EFFECT, not intent: you can be liable even if you did not intend to discriminate. As an employer: understand how the tool decides and require/record evidence of anti-bias testing. The existence, quality, efficacy, scope, recency, results and your response to that testing are relevant factors in the defense (neither necessary nor sufficient); its ABSENCE can be used as evidence against you. Attesta does NOT perform or validate anti-bias testing: it records the date, scope, results and author as declared evidence.",
      article: "FEHA · 2 CCR §11017 (impacto adverso) · §11009",
      severity: "alta",
      conditional:
        "Only if you employ or hire in California with an ADS that takes part in employment decisions.",
    },
    {
      id: "recencia-pruebas-sesgo",
      title:
        "Repeat anti-bias testing with recency; a single validation at launch is not enough (indicative)",
      description:
        "The regulation values anti-bias testing that is timely, repeatable and transparent: a single validation when the tool is launched does not by itself demonstrate reasonable measures. Schedule a periodic review of the ADS and its results, and document your response when a test shows adverse impact. This is a defensive good practice (a defense factor), not a fixed-calendar audit duty like NYC's. Attesta records the date, scope and result of each round as declared evidence; it does not run the test.",
      article: "FEHA · 2 CCR §11009 (pruebas antisesgo)",
      severity: "media",
      conditional:
        "Only if you employ or hire in California with an ADS that takes part in employment decisions.",
    },
    {
      id: "retencion-4-anios",
      title: "Keep ADS records for at least 4 years (indicative)",
      description:
        "The employer (and employment agencies, labor organizations and apprenticeship programs) must keep employment records, including ADS data, for a minimum of 4 years. Typical scope: input data, outputs/scores, selection criteria, and the data used to design, develop or customize the ADS for your use, plus audit/test results. This retention model fits Attesta as a system of record. Attesta does NOT perform the retention of your operational ADS data: it records what is kept, where and since when, as declared evidence.",
      article: "FEHA · 2 CCR §11013 (conservación de registros)",
      severity: "alta",
      conditional:
        "Only if you employ or hire in California with an ADS that takes part in employment decisions.",
    },
    {
      id: "evaluacion-individualizada",
      title:
        "The ADS alone does not satisfy the individualized assessment (criminal history) (indicative)",
      description:
        "When the decision requires an individualized assessment —for example, considering criminal history or fitness for the role— an ADS that automatically screens or scores does NOT replace the case-by-case analysis FEHA requires. Document the point of meaningful human intervention: who reviews, under what criteria, and with what latitude to depart from the ADS output. Using an ADS to advertise openings in a discriminatory way or to unlawfully inquire into criminal history is prohibited.",
      article: "FEHA · 2 CCR §11017.1 (impacto adverso · antecedentes penales)",
      severity: "alta",
      conditional:
        "Only if you employ or hire in California and the ADS takes part in decisions that require an individualized assessment.",
    },
    {
      id: "indagacion-medica-psicologica",
      title:
        "Verify that the ADS does not perform a covert medical or psychological inquiry (indicative)",
      description:
        "An ADS that applies tests, questions or games/puzzles that may reveal information about a disability can constitute an unlawful medical or psychological inquiry (FEHA/ADA risk). Triage control: verify that the tool does not infer health, condition or disability, nor analyze tone of voice, facial expressions or other characteristics or behavior in a way that discriminates. If the tool does so, do not use it in that form; document the verification. Closing this gap means \"I verified that it does NOT perform a disability inquiry\", not \"I prepared an inquiry\".",
      article: "FEHA · 2 CCR §11016 · §11008.1",
      severity: "alta",
      conditional:
        "Only if you employ or hire in California with an ADS that assesses people.",
    },
    {
      id: "ajuste-razonable-discapacidad",
      title:
        "Offer a reasonable accommodation or alternative process when the ADS may screen out people with disabilities (indicative)",
      description:
        "An ADS that measures aptitudes, reaction time or other abilities can discriminate against people with certain disabilities. Enable a channel to request a reasonable accommodation or an alternative selection process, and inform people of that option. Keep the accommodation policy, the requests received and how they were resolved as declared evidence.",
      article: "FEHA · 2 CCR §11016 (discapacidad · ajuste razonable)",
      severity: "media",
      conditional:
        "Only if you employ or hire in California with an ADS that measures aptitudes or abilities.",
    },
    {
      id: "proxies-impacto-adverso",
      title:
        "Understand the ADS selection criteria and remove protected-class proxies (indicative)",
      description:
        "Document which variables and criteria the ADS uses to decide and remove those that act as a proxy for a protected class (e.g. signals correlated with age, national origin or disability). It is the basis of your adverse-impact defense: require from the provider the list of features and its impact testing, review periodically and record your reviews. Liability is based on effect, not intent.",
      article: "FEHA · 2 CCR §11017 (impacto adverso · criterios de selección)",
      severity: "media",
      conditional:
        "Only if you employ or hire in California with an ADS that takes part in employment decisions.",
    },
    {
      id: "publicidad-reclutamiento",
      title:
        "Do not use the ADS to target job ads or recruit in a discriminatory way (indicative)",
      description:
        "Using an ADS to post or segment job openings in a way that excludes or discourages a protected class (for example, segmenting by age or gender in distribution) is prohibited. Review how the recruiting tool or advertising channels target the openings and keep evidence that the audience does not exclude protected classes.",
      article: "FEHA · 2 CCR §11009 (publicidad y reclutamiento)",
      severity: "media",
      conditional:
        "Only if you employ or hire in California and use an ADS to distribute or segment openings.",
    },
    {
      id: "responsabilidad-agentes-proveedores",
      title:
        "You answer for the agents and vendors that operate the ADS on your behalf: require and keep their evidence (indicative)",
      description:
        "The regulation defines an \"agent\" as anyone who, on the employer's behalf, exercises a function traditionally the employer's (recruiting, screening, hiring, promoting, deciding pay/leave), including when done through an ADS; the employer answers for those actions and aiding-and-abetting prohibitions still apply. Although liability of mere developers/sellers was narrowed, the employer is not released. Deployer reframing: contractually require from your provider/agent their anti-bias testing, criteria documentation and ADS records, and keep that provider evidence as part of your file.",
      article: "FEHA · 2 CCR §11008 (agente) · §11020",
      severity: "alta",
      conditional:
        "Only if you employ or hire in California and a third party (vendor/agency) operates the ADS on your behalf.",
    },
    {
      id: "conservar-evidencia-ca",
      title: "Keep a traceable file of tests, records and verifications (indicative)",
      description:
        "Maintain a record per tool and per decision: ADS inventory and why it qualifies, date/scope/results of anti-bias testing, selection criteria and features, provider/agent evidence, ADS records kept (4 years), medical-inquiry verifications and reasonable-accommodation policies. It is the basis for responding to a claim or to an investigation by the Civil Rights Department. Attesta acts as the system of record for that declared evidence, not as a certifier or auditor.",
      article: "Transversal · 2 CCR §11013; §11008 y ss.",
      severity: "media",
      conditional:
        "Applies whenever you use an ADS in employment decisions in California.",
    },
  ],
};
