/**
 * Policy pack — ADMT en empleo (California · CCPA/CPPA).
 *
 * Controles del DEPLOYER (empleador / "business") bajo el reglamento de la
 * California Privacy Protection Agency (CPPA) que desarrolla la CCPA sobre
 * Automated Decisionmaking Technology (ADMT), risk assessments y cybersecurity
 * audits (Cal. Code Regs., tít. 11, art. 11; CCPA, Cal. Civ. Code §1798.100 y ss.).
 * Aquí el empleador es el OBLIGADO DIRECTO cuando usa ADMT para tomar
 * "significant decisions" de empleo (contratación, compensación, asignación de
 * trabajo, promoción, degradación, suspensión, terminación). No hay reencuadre
 * provider/deployer del EU AI Act: la relación con el vendedor del ADMT se maneja
 * vía contrato → "exige y conserva evidencia/clausulado del proveedor".
 *
 * ⚠️ IMPORTANTE (regla dura del producto): Attesta NO ejecuta ni valida el risk
 * assessment ni la auditoría de ciberseguridad; los REGISTRA como evidencia
 * declarada (fecha, responsable, versión, adjuntos). "Evaluación documentada" ≠
 * "aprobada" ≠ "sin riesgo".
 *
 * Fechas (verificadas): reglamento aprobado por OAL el 22–23 sep 2025, vigente el
 * 1-ene-2026; el cumplimiento del empleador que YA usa ADMT para decisiones
 * significativas es exigible el 1-ene-2027 (ADMT desplegado a partir del
 * 1-ene-2027 debe cumplir antes del primer uso). Auditorías de ciberseguridad con
 * calendario escalonado por ingresos (primeros informes 1-abr-2028).
 *
 * Orientación de compliance, NO asesoría legal. Contenido revisado por el
 * subagente `compliance-domain-expert` (2026-07-22) contra fuentes oficiales
 * (CPPA — texto aprobado del reglamento; Cal. Code Regs. tít. 11) y análisis de
 * despachos (Littler, Skadden, White & Case, Baker McKenzie, Ogletree, Mayer
 * Brown). Casi todos los controles son territoriales → marcados con su condición
 * de aplicabilidad. Snapshot regulatorio: julio 2026.
 */

import type { PolicyPack } from "./types";

export const US_CA_ADMT_PACK: PolicyPack = {
  id: "us-ca-admt",
  name: "ADMT en empleo — California (CCPA/CPPA)",
  tag: "EE. UU. · California · ADMT",
  summary:
    "Obligaciones del empleador (business/deployer) que usa tecnología de decisión automatizada (ADMT) en decisiones significativas de empleo sobre residentes de California, bajo el reglamento CCPA/CPPA. Aplícalo a un sistema de RRHH para precargar sus brechas.",
  note: "Obligación territorial: aplica si usas ADMT en decisiones de empleo sobre residentes de California; el cumplimiento del empleador que ya usa ADMT es exigible desde el 1-ene-2027 (reglamento vigente desde el 1-ene-2026). Attesta NO ejecuta ni valida el risk assessment ni la auditoría de ciberseguridad: los registra como evidencia declarada. Snapshot regulatorio: julio 2026. Orientativo, no asesoría legal — valida con un abogado de privacidad/empleo de California antes de GA.",
  controls: [
    {
      id: "alcance-admt",
      title:
        "Determina si tu uso de IA es \"ADMT\" para una decisión significativa de empleo (orientativo)",
      description:
        "Revisa cada herramienta y determina si encaja en la definición de ADMT: cualquier tecnología que procesa información personal y usa computación para reemplazar o reemplazar sustancialmente la decisión humana. La definición es amplia (más que la de \"AEDT\" de NYC LL144) y puede alcanzar incluso a herramientas de cribado basadas en reglas. Aplica solo cuando el resultado interviene en una \"significant decision\" de empleo: contratación, compensación, asignación de trabajo, promoción, degradación, suspensión o terminación. Excepción clave — \"meaningful human involvement\": si una persona con autoridad (a) sabe interpretar el resultado, (b) lo analiza junto con otra información relevante y la que aporte el afectado, y (c) puede tomar o cambiar la decisión, la herramienta NO es ADMT y estas obligaciones no aplican. Documenta el razonamiento de por qué una herramienta es o no ADMT.",
      article: "CCPA · Cal. Code Regs. tit. 11 §7001; Cal. Civ. Code §1798.100",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "aviso-previo",
      title:
        "Entrega un aviso previo (pre-use notice) antes de usar el ADMT (orientativo)",
      description:
        "Antes de recoger información personal para usar el ADMT en una decisión significativa, tu organización debe entregar a la persona un aviso previo que explique: (a) el propósito específico del ADMT; (b) cómo la tecnología toma la decisión; (c) las categorías de información personal que influyen en el resultado; (d) el tipo de resultado que produce y cómo se usa para decidir; y (e) sus derechos a acceder a la información, a hacer opt-out y a apelar, además de la garantía de no represalias. Puedes consolidar varios avisos en un documento si cubre cada conjunto de decisiones. Conserva la plantilla del aviso y la evidencia de su entrega.",
      article: "CCPA · Cal. Code Regs. tit. 11 §7220",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "evaluacion-riesgo",
      title:
        "Documenta una evaluación de riesgo (risk assessment) antes del despliegue (orientativo)",
      description:
        "Antes de desplegar un ADMT para decisiones significativas, tu organización debe realizar y documentar una evaluación de riesgo que sopese los riesgos para la privacidad frente a los beneficios, cubriendo los factores exigidos (propósitos, categorías de información personal, lógica/operación de la tecnología, impactos negativos y salvaguardas previstas). Debe aprobarla alguien con autoridad para decidir si se procede, con una atestación escrita; hay que remitir la información a la CPPA y facilitar una copia íntegra en 30 días si se solicita, y revisarla al menos cada 3 años o ante cambios materiales. Attesta NO ejecuta ni valida el risk assessment: registra la fecha, el responsable, la versión y los adjuntos como evidencia declarada.",
      article: "CCPA · Cal. Code Regs. tit. 11 §§7150–7157",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "opt-out",
      title:
        "Habilita el derecho a opt-out del ADMT y un proceso para atenderlo (orientativo)",
      description:
        "Los residentes de California pueden hacer opt-out del uso del ADMT en decisiones significativas de empleo; tu organización debe ofrecer un método y atender las solicitudes. Excepciones acotadas: para contratación, asignación de trabajo o compensación puedes denegar el opt-out solo si aseguras que el ADMT funciona según lo previsto y no discrimina; para promoción, degradación, suspensión o terminación el opt-out puede no aplicar si ofreces una apelación con revisión humana significativa (ver control de appeal). Conserva el razonamiento y la evidencia de cualquier excepción en la que te apoyes. Si interviene un vendedor o tercero, propaga el opt-out (ventana de notificación downstream de 15 días).",
      article: "CCPA · Cal. Code Regs. tit. 11 §7221",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "acceso-logica",
      title:
        "Atiende el derecho de acceso a la lógica del ADMT y su efecto en la decisión (orientativo)",
      description:
        "La persona puede solicitar información sobre cómo el ADMT tomó la decisión que le afecta. Tu organización debe responder en lenguaje claro: (a) el propósito específico para el que se usó el ADMT en su caso; (b) una descripción de la lógica (cómo procesó la información); (c) el resultado generado; y (d) cómo se usó ese resultado para decidir. Puedes retener secretos comerciales o información de seguridad/prevención de fraude, pero no como excusa general. Prepara un proceso de respuesta; a menudo depende de que el proveedor te facilite la descripción de la lógica → exígesela por contrato y consérvala.",
      article: "CCPA · Cal. Code Regs. tit. 11 §7222",
      severity: "media",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "contrato-proveedor",
      title:
        "Exige y conserva cláusulas contractuales con el vendedor del ADMT (orientativo)",
      description:
        "Si un service provider o contractor opera el ADMT por ti, necesitas un contrato conforme a la CCPA (§7051) que limite el tratamiento a los fines que especifiques, prohíba vender o compartir la información personal y —capa añadida por el reglamento de ADMT— obligue al vendedor a cooperar con tus deberes de aviso previo, con la mecánica de opt-out/apelación (incluida la ventana downstream de 15 días) y con las solicitudes de acceso del art. 11. Sin un contrato conforme, el vendedor no cuenta como service provider. Como deployer: exige y conserva ese clausulado como evidencia declarada.",
      article: "CCPA · Cal. Code Regs. tit. 11 §§7050–7051",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "politica-privacidad",
      title:
        "Actualiza tu política de privacidad para reflejar el uso de ADMT (orientativo)",
      description:
        "Actualiza tu política de privacidad CCPA y el aviso en el momento de la recogida (notice at collection) para revelar el uso de ADMT en decisiones significativas y los derechos asociados (opt-out, acceso, apelación) y cómo ejercerlos. Mantén copias versionadas como evidencia. En el contexto de empleo, coordínalo con el aviso previo específico del ADMT (que es un documento distinto y previo al uso).",
      article: "CCPA · Cal. Code Regs. tit. 11 §7011",
      severity: "media",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "revision-humana-appeal",
      title:
        "Ofrece revisión humana significativa (appeal) donde el reglamento la prevé (orientativo)",
      description:
        "Para promoción, degradación, suspensión o terminación, ofrecer una apelación con revisión humana significativa preserva la excepción al opt-out. El revisor debe entender cómo interpretar el resultado, analizarlo junto con otra información relevante y la que aporte la persona, y tener autoridad para cambiar la decisión — el mismo estándar que saca a una herramienta del concepto de ADMT. Documenta el canal de apelación, los plazos y los resultados. Cautela: la apelación no es una vía universal; el reglamento la contempla para ese subconjunto de decisiones y como sustituto del opt-out, no como sustituto del resto de derechos.",
      article: "CCPA · Cal. Code Regs. tit. 11 §§7001, 7221",
      severity: "media",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "auditoria-ciberseguridad",
      title:
        "Determina si te aplica la auditoría de ciberseguridad anual por umbral (orientativo)",
      description:
        "Si tu tratamiento presenta un \"riesgo significativo para la seguridad\" según el umbral del §7120 —derivar el 50 % o más de tus ingresos de vender o compartir información personal, o tener ingresos brutos anuales superiores a 25 M USD y además tratar información personal de 250.000+ consumidores/hogares o información personal sensible de 50.000+ consumidores— tu organización debe completar una auditoría de ciberseguridad anual, con calendario escalonado por ingresos (primeros informes: 1-abr-2028 para +100 M USD, 1-abr-2029 para 50–100 M USD, 1-abr-2030 para menos de 50 M USD). Verifica primero si el umbral te aplica. Attesta NO ejecuta ni valida la auditoría: registra su existencia, fecha y responsable como evidencia declarada.",
      article: "CCPA · Cal. Code Regs. tit. 11 §§7120–7124",
      severity: "media",
      conditional:
        "Solo si superas los umbrales de \"riesgo significativo para la seguridad\" del §7120 (por ingresos o volumen de datos).",
    },
    {
      id: "conservacion-registros",
      title:
        "Conserva registros de avisos, opt-outs, accesos y evaluaciones (orientativo)",
      description:
        "Mantén un registro trazable por herramienta y por persona: plantillas y entregas del aviso previo, solicitudes y respuestas de opt-out y de acceso, versiones y atestaciones del risk assessment, contratos con el vendedor y el razonamiento de cualquier excepción invocada. Es la base para responder a una consulta o investigación de la CPPA. La CCPA exige además conservar los registros de las solicitudes de los consumidores. Attesta actúa como system of record de esa evidencia declarada, no como certificador.",
      article: "CCPA · Cal. Code Regs. tit. 11 §7101 (y transversal §§7150–7222)",
      severity: "media",
      conditional:
        "Aplica siempre que uses ADMT en decisiones de empleo sobre residentes de California.",
    },
  ],
};

/**
 * English (validated) mirror of US_CA_ADMT_PACK. Content only:
 * `id`/`article`/`severity`/`conditional` logic kept identical to the ES pack;
 * `name`, `tag`, `summary`, `note`, titles and descriptions translated. The
 * employer/business is the direct obligee (no provider/deployer reframing;
 * vendor relationship handled by contract). Attesta does NOT perform or validate
 * the risk assessment or the cybersecurity audit — that stays as an explicit
 * negation.
 */
export const US_CA_ADMT_PACK_EN: PolicyPack = {
  id: "us-ca-admt",
  name: "ADMT in employment — California (CCPA/CPPA)",
  tag: "US · California · ADMT",
  summary:
    "Obligations of the employer (business/deployer) that uses automated decisionmaking technology (ADMT) in significant employment decisions about California residents, under the CCPA/CPPA regulations. Apply it to an HR system to preload its gaps.",
  note: "Territorial obligation: it applies if you use ADMT in employment decisions about California residents; compliance for an employer already using ADMT is enforceable from Jan 1, 2027 (regulation effective Jan 1, 2026). Attesta does NOT perform or validate the risk assessment or the cybersecurity audit: it records them as declared evidence. Regulatory snapshot: July 2026. Indicative, not legal advice — validate with a California privacy/employment attorney before GA.",
  controls: [
    {
      id: "alcance-admt",
      title:
        "Determine whether your use of AI is \"ADMT\" for a significant employment decision (indicative)",
      description:
        "Review each tool and determine whether it fits the definition of ADMT: any technology that processes personal information and uses computation to replace or substantially replace human decisionmaking. The definition is broad (broader than NYC LL144's \"AEDT\") and may reach even rule-based screening tools. It applies only when the output feeds a \"significant decision\" of employment: hiring, compensation, work assignment, promotion, demotion, suspension or termination. Key exception — \"meaningful human involvement\": if a person with authority (a) knows how to interpret the output, (b) analyzes it alongside other relevant information and any information the affected person provides, and (c) can make or change the decision, the tool is NOT ADMT and these obligations do not apply. Document the reasoning for why a tool is or is not ADMT.",
      article: "CCPA · Cal. Code Regs. tit. 11 §7001; Cal. Civ. Code §1798.100",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "aviso-previo",
      title:
        "Deliver a pre-use notice before using the ADMT (indicative)",
      description:
        "Before collecting personal information to use the ADMT in a significant decision, your organization must deliver a pre-use notice to the person explaining: (a) the specific purpose of the ADMT; (b) how the technology makes the decision; (c) the categories of personal information that affect the output; (d) the type of output it produces and how it is used to decide; and (e) their rights to access the information, to opt out and to appeal, plus the assurance of non-retaliation. You may consolidate several notices into one document if it covers each set of decisions. Keep the notice template and evidence of its delivery.",
      article: "CCPA · Cal. Code Regs. tit. 11 §7220",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "evaluacion-riesgo",
      title:
        "Document a risk assessment before deployment (indicative)",
      description:
        "Before deploying an ADMT for significant decisions, your organization must conduct and document a risk assessment weighing privacy risks against benefits, covering the required factors (purposes, categories of personal information, logic/operation of the technology, negative impacts and planned safeguards). It must be approved by someone with authority to decide whether to proceed, with a written attestation; you must submit the information to the CPPA and provide an unabridged copy within 30 days if requested, and review it at least every 3 years or upon material change. Attesta does NOT perform or validate the risk assessment: it records the date, the owner, the version and the attachments as declared evidence.",
      article: "CCPA · Cal. Code Regs. tit. 11 §§7150–7157",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "opt-out",
      title:
        "Enable the right to opt out of the ADMT and a process to honor it (indicative)",
      description:
        "California residents can opt out of the use of the ADMT in significant employment decisions; your organization must offer a method and honor the requests. Narrow exceptions: for hiring, work assignment or compensation you may deny the opt-out only if you ensure the ADMT works as intended and does not discriminate; for promotion, demotion, suspension or termination the opt-out may not apply if you offer an appeal with meaningful human review (see the appeal control). Keep the reasoning and evidence for any exception you rely on. If a vendor or third party is involved, propagate the opt-out (15-day downstream notification window).",
      article: "CCPA · Cal. Code Regs. tit. 11 §7221",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "acceso-logica",
      title:
        "Handle the right to access the ADMT's logic and its effect on the decision (indicative)",
      description:
        "The person may request information about how the ADMT made the decision affecting them. Your organization must respond in plain language: (a) the specific purpose for which the ADMT was used in their case; (b) a description of the logic (how it processed the information); (c) the output generated; and (d) how that output was used to decide. You may withhold trade secrets or security/fraud-prevention information, but not as a blanket excuse. Prepare a response process; it often depends on the provider supplying you the description of the logic → require it by contract and keep it.",
      article: "CCPA · Cal. Code Regs. tit. 11 §7222",
      severity: "media",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "contrato-proveedor",
      title:
        "Require and keep contractual clauses with the ADMT vendor (indicative)",
      description:
        "If a service provider or contractor operates the ADMT for you, you need a contract that conforms to the CCPA (§7051) that limits processing to the purposes you specify, prohibits selling or sharing the personal information and — a layer added by the ADMT regulations — obliges the vendor to cooperate with your pre-use notice duties, with the opt-out/appeal mechanics (including the 15-day downstream window) and with the access requests of article 11. Without a conforming contract, the vendor does not count as a service provider. As a deployer: require and keep that clausing as declared evidence.",
      article: "CCPA · Cal. Code Regs. tit. 11 §§7050–7051",
      severity: "alta",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "politica-privacidad",
      title:
        "Update your privacy policy to reflect the use of ADMT (indicative)",
      description:
        "Update your CCPA privacy policy and your notice at collection to disclose the use of ADMT in significant decisions and the associated rights (opt-out, access, appeal) and how to exercise them. Keep versioned copies as evidence. In the employment context, coordinate it with the ADMT-specific pre-use notice (which is a separate document delivered before use).",
      article: "CCPA · Cal. Code Regs. tit. 11 §7011",
      severity: "media",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "revision-humana-appeal",
      title:
        "Offer meaningful human review (appeal) where the regulation provides for it (indicative)",
      description:
        "For promotion, demotion, suspension or termination, offering an appeal with meaningful human review preserves the exception to the opt-out. The reviewer must understand how to interpret the output, analyze it alongside other relevant information and any information the person provides, and have authority to change the decision — the same standard that removes a tool from being ADMT. Document the appeal channel, the timelines and the outcomes. Caution: the appeal is not a universal path; the regulation contemplates it for that subset of decisions and as a substitute for the opt-out, not as a substitute for the other rights.",
      article: "CCPA · Cal. Code Regs. tit. 11 §§7001, 7221",
      severity: "media",
      conditional:
        "Solo si usas ADMT en decisiones de empleo sobre residentes de California.",
    },
    {
      id: "auditoria-ciberseguridad",
      title:
        "Determine whether the annual cybersecurity audit applies to you by threshold (indicative)",
      description:
        "If your processing presents a \"significant risk to security\" under the §7120 threshold — deriving 50% or more of your revenue from selling or sharing personal information, or having annual gross revenue above USD 25M and also processing personal information of 250,000+ consumers/households or sensitive personal information of 50,000+ consumers — your organization must complete an annual cybersecurity audit, with a phased calendar by revenue (first reports: Apr 1, 2028 for over USD 100M, Apr 1, 2029 for USD 50–100M, Apr 1, 2030 for under USD 50M). First verify whether the threshold applies to you. Attesta does NOT perform or validate the audit: it records its existence, date and owner as declared evidence.",
      article: "CCPA · Cal. Code Regs. tit. 11 §§7120–7124",
      severity: "media",
      conditional:
        "Solo si superas los umbrales de \"riesgo significativo para la seguridad\" del §7120 (por ingresos o volumen de datos).",
    },
    {
      id: "conservacion-registros",
      title:
        "Keep records of notices, opt-outs, access requests and assessments (indicative)",
      description:
        "Maintain a traceable record per tool and per person: pre-use notice templates and deliveries, opt-out and access requests and responses, risk assessment versions and attestations, vendor contracts and the reasoning for any exception invoked. It is the basis for responding to a query or investigation by the CPPA. The CCPA also requires keeping records of consumers' requests. Attesta acts as the system of record for that declared evidence, not as a certifier.",
      article: "CCPA · Cal. Code Regs. tit. 11 §7101 (y transversal §§7150–7222)",
      severity: "media",
      conditional:
        "Aplica siempre que uses ADMT en decisiones de empleo sobre residentes de California.",
    },
  ],
};
