/**
 * Asistente de clasificación de riesgo — EU AI Act.
 *
 * Lógica de un cuestionario guiado que clasifica un sistema de IA en uno de los
 * cuatro niveles del Reglamento (UE) 2024/1689 ("AI Act"):
 *   inaceptable (Art. 5) · alto (Art. 6 + Anexo III) · limitado (Art. 50) · mínimo.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Las reglas son una primera
 * aproximación defendible y deben ser revisadas por un experto para casos límite.
 * Verificado por el subagente `compliance-domain-expert`.
 */

import type { RiskLevel } from "./mock-data";
import type { Locale } from "./i18n/config";

export type Choice = { value: string; label: string; hint?: string };

export type Question = {
  id: string;
  step: number;
  title: string;
  help?: string;
  type: "single" | "multi";
  /** Solo aplica si una respuesta previa marcó el sistema como candidato a alto riesgo. */
  onlyIfHighCandidate?: boolean;
  choices: Choice[];
};

export type Answers = Record<string, string[]>;

export type Citation = { article: string; text: string };

/**
 * Capa GPAI (Cap. V, Arts. 51-56). NO es un nivel de riesgo: un chatbot de
 * atención con GenAI sigue siendo "limitado" por el Art. 50. Lo que añade es una
 * capa de deberes de EVIDENCIA frente al proveedor del modelo y, en dos casos, un
 * aviso de que el encuadre del cliente puede haber pasado de *deployer* a
 * *proveedor* (Art. 25 + directrices de la Comisión sobre GPAI).
 */
export type GpaiLayer = {
  /** Hay un modelo de propósito general por debajo. */
  applies: boolean;
  /**
   * El rol puede haber cambiado a PROVEEDOR (ajuste con datos propios o marca
   * blanca). Es un aviso para revisión jurídica, nunca un veredicto.
   */
  providerRisk: boolean;
  /** Explicación en el idioma de la UI. */
  note: string;
};

export type ClassificationResult = {
  level: RiskLevel;
  rationale: string;
  citations: Citation[];
  obligations: string[];
  /** Presente solo si el sistema declara un modelo de propósito general. */
  gpai?: GpaiLayer;
};

/* -------------------------------------------------------------------------- */
/* Cuestionario                                                               */
/* -------------------------------------------------------------------------- */

export const NONE = "none";

export const RISK_QUESTIONS: Question[] = [
  {
    id: "prohibited",
    step: 1,
    title: "¿El sistema realiza alguna de estas prácticas?",
    help: "Prácticas prohibidas por el Art. 5 del AI Act. Marca todas las que apliquen.",
    type: "multi",
    choices: [
      {
        value: "social_scoring",
        label: "Puntuación social de personas",
        hint: "Evaluar o clasificar a personas por su comportamiento social con efecto perjudicial.",
      },
      {
        value: "predictive_policing",
        label: "Predicción de delitos basada solo en perfilado",
        hint: "Evaluar el riesgo de que una persona cometa un delito basándose únicamente en su perfil o rasgos de personalidad.",
      },
      {
        value: "manipulation",
        label: "Técnicas subliminales o manipuladoras",
        hint: "Que distorsionan el comportamiento y pueden causar un daño significativo.",
      },
      {
        value: "vulnerabilities",
        label: "Explotación de vulnerabilidades",
        hint: "Por edad, discapacidad o situación socioeconómica.",
      },
      {
        value: "biometric_categorization",
        label: "Categorización biométrica sensible",
        hint: "Inferir raza, opiniones políticas, religión, orientación sexual, etc.",
      },
      {
        value: "emotion_work_edu",
        label: "Reconocimiento de emociones en trabajo o educación",
        hint: "Salvo por motivos médicos o de seguridad.",
      },
      {
        value: "rt_biometric",
        label: "Identificación biométrica remota en tiempo real en espacios públicos",
        hint: "Con fines policiales; la prohibición admite excepciones tasadas y autorización judicial.",
      },
      {
        value: "face_scraping",
        label: "Extracción masiva de imágenes faciales para bases de datos",
      },
      {
        value: "intimate_images",
        label: "Generación de imágenes íntimas realistas no consentidas",
        hint: "Sistemas cuyo propósito es crear o manipular imágenes o vídeo íntimos realistas de una persona identificable sin su consentimiento. NO marques esto por el uso normal de selección de personal (cribado de CVs, ranking, entrevistas): solo si el sistema produce ese material.",
      },
      {
        value: "csam",
        label: "Generación de material de abuso sexual infantil (CSAM)",
        hint: "Sistemas que generan o manipulan CSAM (en el sentido de la Directiva 2011/93/UE). No aplica al uso de IA en RRHH; márcalo solo si el sistema produce este material.",
      },
      { value: NONE, label: "Ninguna de las anteriores" },
    ],
  },
  {
    id: "domain",
    step: 2,
    title: "¿En qué ámbito se usa principalmente el sistema?",
    help: "Áreas de alto riesgo del Anexo III. Elige la que mejor describa el uso.",
    type: "single",
    choices: [
      { value: "biometrics", label: "Biometría (identificación/categorización permitida)" },
      { value: "critical_infra", label: "Infraestructura crítica (componente de seguridad)" },
      { value: "education", label: "Educación y formación profesional" },
      {
        value: "employment",
        label: "Empleo y gestión de trabajadores",
        hint: "Selección de personal, cribado de CVs, promoción, asignación de tareas.",
      },
      {
        value: "credit",
        label: "Solvencia / scoring crediticio",
        hint: "Acceso a servicios esenciales privados.",
      },
      { value: "insurance", label: "Seguros de vida y salud (riesgo y precio)" },
      { value: "public_services", label: "Servicios y ayudas públicas / emergencias" },
      { value: "law_enforcement", label: "Aplicación de la ley" },
      { value: "migration", label: "Migración, asilo y control fronterizo" },
      { value: "justice", label: "Justicia y procesos democráticos" },
      {
        value: NONE,
        label: "Ninguno / uso general de negocio",
        hint: "Marketing, productividad interna, recomendación de contenidos, etc.",
      },
    ],
  },
  {
    id: "profiling_gate",
    step: 3,
    title: "¿El sistema efectúa perfilado de personas físicas?",
    help: "Perfilado = tratamiento automatizado de datos personales para evaluar aspectos de una persona física: rendimiento laboral, situación económica, salud, preferencias, intereses, fiabilidad, comportamiento, localización o movimientos (Art. 4(4) del RGPD). Si el sistema opera en un área del Anexo III y efectúa perfilado, el Art. 6(3) impide que se aplique ninguna excepción: siempre se considera de alto riesgo.",
    type: "single",
    onlyIfHighCandidate: true,
    choices: [
      {
        value: "yes",
        label: "Sí, efectúa perfilado de personas físicas",
        hint: "Con perfilado no cabe excepción del Art. 6(3): el sistema es de alto riesgo directamente.",
      },
      { value: "no", label: "No efectúa perfilado de personas físicas" },
    ],
  },
  {
    id: "exception",
    step: 4,
    title: "¿Aplica alguna excepción del Art. 6(3)?",
    help: "Un sistema en un área del Anexo III NO es de alto riesgo si solo hace una de estas tareas acotadas (y no efectúa perfilado, ya confirmado en el paso anterior).",
    type: "single",
    onlyIfHighCandidate: true,
    choices: [
      { value: "narrow_task", label: "Realiza una tarea procedimental estrecha" },
      { value: "improve_human", label: "Mejora el resultado de una actividad humana previa" },
      {
        value: "detect_patterns",
        label: "Detecta patrones de decisión sin sustituir el juicio humano",
      },
      { value: "preparatory", label: "Es una tarea preparatoria de una evaluación" },
      { value: NONE, label: "Ninguna: influye en la decisión final" },
    ],
  },
  {
    id: "transparency",
    step: 5,
    title: "¿El sistema hace algo de esto de cara a las personas?",
    help: "Obligaciones de transparencia del Art. 50. Marca todas las que apliquen.",
    type: "multi",
    choices: [
      {
        value: "interacts",
        label: "Interactúa directamente con personas",
        hint: "Chatbots, asistentes conversacionales.",
      },
      {
        value: "synthetic",
        label: "Genera o manipula contenido sintético",
        hint: "Imagen, audio, vídeo o texto (incl. deepfakes).",
      },
      {
        value: "emotion_or_biometric",
        label: "Reconoce emociones o categoriza biométricamente",
        hint: "Fuera de los casos prohibidos.",
      },
      { value: NONE, label: "Ninguna de las anteriores" },
    ],
  },
  {
    id: "gpai",
    step: 6,
    title: "¿Por debajo hay un modelo de IA de propósito general (GenAI)?",
    help: "Capa GPAI del AI Act (Cap. V, Arts. 51-56), en vigor desde el 2-ago-2025. Elige la opción que mejor describa vuestro caso.",
    type: "single",
    choices: [
      {
        value: "third_party",
        label: "Usamos un servicio de un tercero tal cual",
        hint: "ChatGPT, Copilot, Gemini, Claude… sin modificarlos.",
      },
      {
        value: "self_hosted",
        label: "Desplegamos un modelo por nuestra cuenta, sin modificarlo",
        hint: "Open-weights o API integrada en un producto propio.",
      },
      {
        value: "finetuned",
        label: "Lo ajustamos con datos propios (fine-tuning)",
        hint: "Entrenamiento adicional sobre un modelo existente.",
      },
      {
        value: "own_brand",
        label: "Lo ofrecemos a terceros bajo nuestra marca",
        hint: "Aunque el modelo sea de otro.",
      },
      { value: NONE, label: "No hay ningún modelo de propósito general" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Capa GPAI (Cap. V) — contenido verificado                                  */
/* -------------------------------------------------------------------------- */

/**
 * Opciones de la pregunta `gpai` que implican que el ROL puede haber pasado de
 * *deployer* a *proveedor*.
 *
 * Base: **Art. 25** (quien pone su nombre o marca en un sistema, o lo modifica
 * sustancialmente, asume las obligaciones del proveedor) y, para modelos GPAI, las
 * **directrices de la Comisión de julio de 2025**, que dan un criterio
 * **indicativo** (no vinculante): se considera proveedor del modelo modificado
 * cuando el cómputo de entrenamiento del ajuste supera **un tercio** del cómputo
 * del modelo original. El **Recital 109** aclara que, en ese caso, las
 * obligaciones se limitan **al alcance de la modificación**.
 *
 * Por eso esto es un AVISO para revisión jurídica, nunca un veredicto: un ajuste
 * pequeño con LoRA no convierte a nadie en proveedor, y el criterio de cómputo no
 * cubre modificaciones que cambian el comportamiento sin gastar GPU.
 */
const GPAI_PROVIDER_RISK = new Set(["finetuned", "own_brand"]);
const GPAI_VALUES = new Set([
  "third_party",
  "self_hosted",
  "finetuned",
  "own_brand",
]);

export const GPAI_CITATIONS: Citation[] = [
  {
    article: "Arts. 51-56 (Cap. V)",
    text: "Los modelos de IA de propósito general tienen un régimen propio: documentación técnica, política de derechos de autor, resumen del contenido de entrenamiento e información a los proveedores que integran el modelo. Estas obligaciones son del PROVEEDOR del modelo, y son aplicables desde el 2 de agosto de 2025.",
  },
  {
    article: "Art. 53.1.b",
    text: "El proveedor del modelo debe facilitar información y documentación a quienes lo integran en sus sistemas, para que puedan cumplir sus propias obligaciones. Es la base para exigirle evidencia por escrito.",
  },
  {
    article: "Art. 25",
    text: "Quien pone su nombre o marca en un sistema, o lo modifica sustancialmente, asume las obligaciones del proveedor. Las directrices de la Comisión (julio de 2025) añaden un criterio INDICATIVO para modelos GPAI: superar un tercio del cómputo de entrenamiento del modelo original. El Recital 109 limita esas obligaciones al alcance de la modificación.",
  },
];

/** Deberes del DEPLOYER cuando por debajo hay un modelo de propósito general. */
export const GPAI_OBLIGATIONS: string[] = [
  "Deber propio: identifica y documenta qué modelo de propósito general hay por debajo, de qué proveedor y en qué versión. Sin eso no se puede exigir nada ni acreditar nada.",
  "Exige al proveedor del modelo la documentación del Art. 53.1.b (información para integradores), su política de derechos de autor y el resumen público del contenido de entrenamiento; conserva copia como evidencia declarada.",
  "Pregunta por escrito si el modelo está designado como de riesgo sistémico (Art. 51): cambia las obligaciones del proveedor y, por tanto, la evidencia que puedes exigirle.",
  "Deber propio: alfabetización en IA de quien lo usa (Art. 4) y límites de uso escritos — para qué sí y para qué no, con quién revisa las salidas.",
  "Deber propio: si el sistema interactúa con personas o genera contenido sintético, cumple la transparencia del Art. 50 (avisar de que es IA y marcar el contenido generado).",
];

/** Aviso extra cuando el ajuste o la marca blanca pueden cambiar el rol. */
export const GPAI_PROVIDER_OBLIGATIONS: string[] = [
  "⚠️ Revisión jurídica: al ajustar el modelo con datos propios o ofrecerlo bajo vuestra marca, vuestra organización puede pasar a considerarse PROVEEDOR (Art. 25). El criterio de cómputo de las directrices de la Comisión es indicativo, no un umbral legal.",
  "Si el rol cambia, las obligaciones se limitan al alcance de la modificación (Recital 109), pero incluyen documentar el ajuste: qué datos, qué objetivo y qué se evaluó antes de ponerlo en uso.",
];

export const GPAI_NOTES = {
  third_party:
    "Vuestro papel sigue siendo el de responsable del despliegue: las obligaciones del Cap. V son del proveedor del modelo. Lo vuestro es exigirle evidencia por escrito y documentar qué modelo y versión usáis.",
  self_hosted:
    "Desplegarlo por vuestra cuenta no os convierte en proveedores del modelo, pero sí os deja sin nadie a quien reclamar la documentación: conservad la del modelo de origen (licencia, tarjeta del modelo, versión) como evidencia.",
  finetuned:
    "Ajustar el modelo con datos propios es la frontera del Art. 25: puede convertir a vuestra organización en proveedora del modelo resultante. El criterio de un tercio del cómputo de entrenamiento es orientativo (directrices de la Comisión, jul-2025) y necesita revisión jurídica, no autoevaluación.",
  own_brand:
    "Ofrecerlo bajo vuestra marca activa el Art. 25 de forma directa: quien pone su nombre en el sistema asume las obligaciones del proveedor. Necesita revisión jurídica antes de seguir.",
} as const;

/* -------------------------------------------------------------------------- */
/* Citas y obligaciones                                                       */
/* -------------------------------------------------------------------------- */

const HIGH_DOMAINS = new Set([
  "biometrics",
  "critical_infra",
  "education",
  "employment",
  "credit",
  "insurance",
  "public_services",
  "law_enforcement",
  "migration",
  "justice",
]);

const REAL_EXCEPTIONS = new Set([
  "narrow_task",
  "improve_human",
  "detect_patterns",
  "preparatory",
]);

/**
 * Las 2 prácticas del Art. 5 añadidas por el Digital Omnibus: aplicables desde el
 * 2-dic-2026 (periodo transitorio). Antes de esa fecha aún NO están en vigor por el
 * AI Act, aunque ya son ilícito penal (Directiva 2011/93/UE y normativa nacional).
 */
export const OMNIBUS_ART5_EFFECTIVE = new Date("2026-12-02T00:00:00Z");
const OMNIBUS_ART5_PRACTICES = new Set(["intimate_images", "csam"]);

export const OBLIGATIONS_BY_LEVEL: Record<RiskLevel, string[]> = {
  unacceptable: [
    "Prohibido: el sistema no puede comercializarse ni usarse en la UE.",
    "Cesar el uso y documentar la retirada.",
  ],
  high: [
    // Deberes PROPIOS del deployer (nuestro ICP).
    "Deber propio: supervisión humana efectiva en la decisión (Art. 26.2, apoyada en el diseño del proveedor del Art. 14).",
    "Deber propio: obligaciones del responsable del despliegue (Art. 26) — uso conforme a instrucciones, información a personas afectadas y a trabajadores, conservación de logs y monitoreo del funcionamiento.",
    "Deber propio: transparencia frente a las personas afectadas (Art. 50) y, cuando aplique, registro en la base de datos de la UE (Art. 49) y evaluación de impacto en derechos fundamentales (Art. 27).",
    // Obligaciones del PROVEEDOR: el deployer las exige y conserva como evidencia.
    "Exige y conserva evidencia del proveedor: sistema de gestión de riesgos (Art. 9), gobernanza y calidad de datos (Art. 10), documentación técnica del Anexo IV (Art. 11), logging (Art. 12), instrucciones de uso (Art. 13), exactitud/robustez/ciberseguridad (Art. 15) y el marcado CE / Declaración UE de Conformidad.",
  ],
  limited: [
    "Informar a las personas de que interactúan con un sistema de IA (Art. 50).",
    "Etiquetar el contenido generado o manipulado por IA como artificial.",
  ],
  minimal: [
    "Sin obligaciones específicas bajo el AI Act.",
    "Se recomiendan códigos de conducta voluntarios (Art. 95).",
  ],
};

const CITATIONS: Record<RiskLevel, Citation[]> = {
  unacceptable: [
    { article: "Art. 5", text: "Prácticas de IA prohibidas." },
  ],
  high: [
    { article: "Art. 6 + Anexo III", text: "Clasificación como sistema de alto riesgo." },
    { article: "Arts. 9–15", text: "Requisitos para sistemas de alto riesgo." },
  ],
  limited: [
    { article: "Art. 50", text: "Obligaciones de transparencia." },
  ],
  minimal: [
    { article: "Art. 95", text: "Códigos de conducta voluntarios." },
  ],
};

/**
 * Ramas de `rationale` que `classify()` ensambla (versión ES). Paralelo EXACTO a
 * `RATIONALES_EN` (mismas 6 claves). El texto es idéntico al que antes vivía
 * inline en `classify()`; se extrae aquí para seleccionar por locale sin cambiar
 * la lógica. Ver `RATIONALES_EN` para el mapa rama → clave.
 */
export const RATIONALES = {
  prohibited_classic:
    "El sistema incurre en una o más prácticas prohibidas por el Art. 5. No puede usarse en la UE.",
  prohibited_omnibus_in_force:
    "El sistema incurre en una práctica prohibida por el Art. 5 —generación o manipulación de imágenes íntimas realistas no consentidas o de CSAM—, añadida por el Digital Omnibus y aplicable desde el 2 de diciembre de 2026. No puede ponerse en el mercado ni utilizarse en la UE. Con independencia del AI Act, generar o manipular este material ya constituye un ilícito penal (la Directiva 2011/93/UE para el CSAM; la Directiva (UE) 2024/1385 y la normativa penal nacional para las imágenes íntimas no consentidas).",
  prohibited_omnibus_pending:
    "El Digital Omnibus añadió al Art. 5 esta práctica —generación o manipulación de imágenes íntimas realistas no consentidas o de CSAM—, que será una práctica prohibida del EU AI Act aplicable desde el 2 de diciembre de 2026 (aún no en vigor a la fecha de esta evaluación). No obstante, generar o manipular este material ya es ilícito por derecho penal con independencia del AI Act (la Directiva 2011/93/UE para el CSAM; la Directiva (UE) 2024/1385 y la normativa penal nacional para las imágenes íntimas no consentidas), por lo que se clasifica como inaceptable. Valida esta clasificación con asesoría jurídica cualificada.",
  high:
    "El sistema opera en un área de alto riesgo del Anexo III y no le aplica ninguna excepción del Art. 6(3).",
  high_profiling:
    "El sistema opera en un área de alto riesgo del Anexo III y efectúa perfilado de personas físicas. Conforme al Art. 6(3), párrafo segundo, del Reglamento (UE) 2024/1689, un sistema del Anexo III que efectúa perfilado se considera siempre de alto riesgo, por lo que las excepciones del Art. 6(3) no pueden aplicarse.",
  limited:
    "El sistema no es de alto riesgo, pero está sujeto a obligaciones de transparencia del Art. 50.",
  minimal:
    "El sistema no encaja en prácticas prohibidas, áreas de alto riesgo ni obligaciones de transparencia.",
} as const;

/**
 * Citas extra (Directivas) que `classify()` añade a `CITATIONS.unacceptable`
 * cuando la práctica marcada es EXCLUSIVAMENTE Omnibus (versión ES). Paralelo a
 * `OMNIBUS_CITATIONS_EN`.
 */
export const OMNIBUS_CITATIONS: Citation[] = [
  {
    article: "Directiva 2011/93/UE",
    text: "CSAM: ilícito penal con independencia del AI Act.",
  },
  {
    article: "Directiva (UE) 2024/1385",
    text: "Imágenes íntimas no consentidas: ilícito penal vía normativa nacional.",
  },
];

/* -------------------------------------------------------------------------- */
/* Selectores locale-aware (default ES, retrocompatibles)                     */
/* -------------------------------------------------------------------------- */
/* Las estructuras `_EN` están definidas más abajo en el archivo; se resuelven */
/* en tiempo de llamada (module scope), por lo que el orden no importa.        */

function questionsFor(locale: Locale): Question[] {
  return locale === "en" ? RISK_QUESTIONS_EN : RISK_QUESTIONS;
}
function rationalesFor(locale: Locale): Record<keyof typeof RATIONALES, string> {
  return locale === "en" ? RATIONALES_EN : RATIONALES;
}
function citationsFor(locale: Locale): Record<RiskLevel, Citation[]> {
  return locale === "en" ? CITATIONS_EN : CITATIONS;
}
function omnibusCitationsFor(locale: Locale): Citation[] {
  return locale === "en" ? OMNIBUS_CITATIONS_EN : OMNIBUS_CITATIONS;
}
function obligationsFor(locale: Locale): Record<RiskLevel, string[]> {
  return locale === "en" ? OBLIGATIONS_BY_LEVEL_EN : OBLIGATIONS_BY_LEVEL;
}

/* -------------------------------------------------------------------------- */
/* Clasificación                                                              */
/* -------------------------------------------------------------------------- */

function has(answers: Answers, id: string, value: string): boolean {
  return (answers[id] ?? []).includes(value);
}

/** ¿El sistema es candidato a alto riesgo por su ámbito (Anexo III)? */
export function isHighCandidate(answers: Answers): boolean {
  const domain = (answers.domain ?? [])[0];
  return domain ? HIGH_DOMAINS.has(domain) : false;
}

export function classify(
  answers: Answers,
  now: Date = new Date(),
  locale: Locale = "es",
): ClassificationResult {
  // Selección de TEXTO por locale (la lógica de clasificación no cambia).
  const rationales = rationalesFor(locale);
  const citations = citationsFor(locale);
  const omnibusCitations = omnibusCitationsFor(locale);
  const obligations = obligationsFor(locale);

  // 1) Prohibido (Art. 5) — cualquier práctica marcada, salvo "ninguna".
  const prohibited = (answers.prohibited ?? []).filter((v) => v !== NONE);
  if (prohibited.length > 0) {
    // ¿Las marcadas son EXCLUSIVAMENTE las 2 añadidas por el Omnibus (aún no
    // vigentes por el AI Act hasta 2-dic-2026, pero ya ilícito penal)?
    const onlyOmnibus = prohibited.every((v) => OMNIBUS_ART5_PRACTICES.has(v));
    const omnibusInForce = now >= OMNIBUS_ART5_EFFECTIVE;

    let rationale: string;
    if (!onlyOmnibus) {
      // Hay al menos una prohibición "clásica" (ya vigente desde 2-feb-2025).
      rationale = rationales.prohibited_classic;
    } else if (omnibusInForce) {
      rationale = rationales.prohibited_omnibus_in_force;
    } else {
      rationale = rationales.prohibited_omnibus_pending;
    }

    return {
      level: "unacceptable",
      rationale,
      citations: onlyOmnibus
        ? [...citations.unacceptable, ...omnibusCitations]
        : citations.unacceptable,
      obligations: obligations.unacceptable,
    };
  }

  // 2) ¿Ámbito de alto riesgo (Anexo III)?
  const highCandidate = isHighCandidate(answers);

  if (highCandidate) {
    // Art. 6(3), párrafo 2: un sistema del Anexo III que efectúa perfilado de
    // personas físicas se considera SIEMPRE de alto riesgo — el perfilado anula
    // toda excepción, con independencia de lo acotada que sea la tarea.
    if (has(answers, "profiling_gate", "yes")) {
      return {
        level: "high",
        rationale: rationales.high_profiling,
        citations: citations.high,
        obligations: obligations.high,
      };
    }

    const exception = (answers.exception ?? [])[0];
    const exceptionApplies =
      exception !== undefined && REAL_EXCEPTIONS.has(exception);

    // Sin perfilado: la excepción NO aplica si no eligió una excepción real.
    if (!exceptionApplies) {
      return withGpai(
        {
          level: "high",
          rationale: rationales.high,
          citations: citations.high,
          obligations: obligations.high,
        },
        answers,
        locale,
      );
    }
    // Si aplica excepción, cae a evaluar transparencia (limitado/mínimo).
  }

  // 3) Transparencia (Art. 50) — limitado.
  const transparency = (answers.transparency ?? []).filter((v) => v !== NONE);
  if (transparency.length > 0) {
    return withGpai(
      {
        level: "limited",
        rationale: rationales.limited,
        citations: citations.limited,
        obligations: obligations.limited,
      },
      answers,
      locale,
    );
  }

  // 4) Riesgo mínimo.
  return withGpai(
    {
      level: "minimal",
      rationale: rationales.minimal,
      citations: citations.minimal,
      obligations: obligations.minimal,
    },
    answers,
    locale,
  );
}

/**
 * Añade la capa GPAI al resultado, si el sistema declara un modelo de propósito
 * general.
 *
 * Dos decisiones importantes:
 *
 *  1. **No toca el nivel de riesgo.** La capa GPAI es un régimen paralelo (Cap. V),
 *     no una clase de riesgo: un chatbot con GenAI sigue siendo "limitado" por el
 *     Art. 50. Decir "alto riesgo porque usa ChatGPT" sería alarmismo y
 *     regulatoriamente falso.
 *  2. **Las citas y obligaciones se anexan a las listas principales**, no viven
 *     aparte. Así el dossier y el informe —que leen esos dos campos ya
 *     persistidos— muestran la capa GPAI sin cambiar ni una línea de su código.
 */
function withGpai(
  base: ClassificationResult,
  answers: Answers,
  locale: Locale,
): ClassificationResult {
  const choice = (answers.gpai ?? [])[0];
  if (!choice || !GPAI_VALUES.has(choice)) return base;

  const providerRisk = GPAI_PROVIDER_RISK.has(choice);
  const gpaiCitations = locale === "en" ? GPAI_CITATIONS_EN : GPAI_CITATIONS;
  const gpaiObligations =
    locale === "en" ? GPAI_OBLIGATIONS_EN : GPAI_OBLIGATIONS;
  const providerObligations =
    locale === "en" ? GPAI_PROVIDER_OBLIGATIONS_EN : GPAI_PROVIDER_OBLIGATIONS;
  const notes = locale === "en" ? GPAI_NOTES_EN : GPAI_NOTES;

  return {
    ...base,
    citations: [...base.citations, ...gpaiCitations],
    obligations: [
      ...base.obligations,
      ...gpaiObligations,
      ...(providerRisk ? providerObligations : []),
    ],
    gpai: {
      applies: true,
      providerRisk,
      note: notes[choice as keyof typeof notes],
    },
  };
}

/** Devuelve las preguntas visibles según las respuestas actuales. */
export function visibleQuestions(
  answers: Answers,
  locale: Locale = "es",
): Question[] {
  const highCandidate = isHighCandidate(answers);
  const profiles = has(answers, "profiling_gate", "yes");
  return questionsFor(locale).filter((q) => {
    if (q.onlyIfHighCandidate && !highCandidate) return false;
    // Con perfilado confirmado, la excepción del Art. 6(3) no puede aplicar:
    // se omite la pregunta de excepción (el resultado ya es alto riesgo).
    if (q.id === "exception" && profiles) return false;
    return true;
  });
}

export { has };

/* ========================================================================== */
/* CONTENIDO EN INGLÉS (validado por compliance-domain-expert)                */
/* -------------------------------------------------------------------------- */
/* Estructuras paralelas `_EN` con la MISMA forma, claves, ids, valores de     */
/* enum y números de artículo/Anexo que las de arriba. SOLO cambia el texto    */
/* orientado al usuario. La LÓGICA (classify, visibleQuestions, isHighCandidate*/
/* HIGH_DOMAINS, REAL_EXCEPTIONS, fechas Omnibus) NO se duplica: opera igual   */
/* en ambos idiomas porque solo depende de ids/valores, no de etiquetas.       */
/*                                                                             */
/* WIRING (para el frontend-engineer):                                         */
/*  - RISK_QUESTIONS_EN      -> alterna con RISK_QUESTIONS en visibleQuestions()*/
/*                             y en RiskWizard.tsx (render del cuestionario).   */
/*  - OBLIGATIONS_BY_LEVEL_EN-> alterna con OBLIGATIONS_BY_LEVEL en classify()  */
/*                             (result.obligations) y en dossier/page.tsx       */
/*                             (import directo, indexado por `level`).          */
/*  - CITATIONS_EN           -> alterna con el CITATIONS privado en classify()  */
/*                             (result.citations).                              */
/*  - RATIONALES_EN          -> las 6 ramas de rationale que classify() ensambla*/
/*                             inline en ES; el engineer parametriza classify() */
/*                             por locale seleccionando la clave que corresponde*/
/*                             a cada rama (mapa de ramas -> clave abajo).       */
/*  - OMNIBUS_CITATIONS_EN   -> las 2 citas extra (Directivas) que classify()   */
/*                             añade a CITATIONS.unacceptable cuando la práctica */
/*                             marcada es EXCLUSIVAMENTE Omnibus (intimate/csam).*/
/*                                                                             */
/* NOTA: la `rationale` histórica persistida (assessment_history.rationale /   */
/* a.rationale) se guardó en el idioma del momento; NO es retraducible aquí.   */
/* ========================================================================== */

export const RISK_QUESTIONS_EN: Question[] = [
  {
    id: "prohibited",
    step: 1,
    title: "Does the system carry out any of these practices?",
    help: "Practices prohibited by Article 5 of the AI Act. Check all that apply.",
    type: "multi",
    choices: [
      {
        value: "social_scoring",
        label: "Social scoring of individuals",
        hint: "Evaluating or classifying people based on their social behavior with a detrimental effect.",
      },
      {
        value: "predictive_policing",
        label: "Predicting crime based solely on profiling",
        hint: "Assessing the risk of a person committing a criminal offence based solely on their profile or personality traits.",
      },
      {
        value: "manipulation",
        label: "Subliminal or manipulative techniques",
        hint: "That distort behavior and may cause significant harm.",
      },
      {
        value: "vulnerabilities",
        label: "Exploitation of vulnerabilities",
        hint: "Based on age, disability or socio-economic situation.",
      },
      {
        value: "biometric_categorization",
        label: "Sensitive biometric categorization",
        hint: "Inferring race, political opinions, religion, sexual orientation, etc.",
      },
      {
        value: "emotion_work_edu",
        label: "Emotion recognition in the workplace or education",
        hint: "Except for medical or safety reasons.",
      },
      {
        value: "rt_biometric",
        label: "Real-time remote biometric identification in publicly accessible spaces",
        hint: "For law-enforcement purposes; the prohibition allows for narrowly defined exceptions and judicial authorization.",
      },
      {
        value: "face_scraping",
        label: "Untargeted scraping of facial images to build databases",
      },
      {
        value: "intimate_images",
        label: "Generation of non-consensual realistic intimate images",
        hint: "Systems whose purpose is to create or manipulate realistic intimate images or video of an identifiable person without their consent. Do NOT check this for normal recruitment use (CV screening, ranking, interviews): only if the system produces such material.",
      },
      {
        value: "csam",
        label: "Generation of child sexual abuse material (CSAM)",
        hint: "Systems that generate or manipulate CSAM (within the meaning of Directive 2011/93/EU). Not applicable to HR use of AI; check it only if the system produces this material.",
      },
      { value: NONE, label: "None of the above" },
    ],
  },
  {
    id: "domain",
    step: 2,
    title: "In what area is the system mainly used?",
    help: "High-risk areas of Annex III. Choose the one that best describes the use.",
    type: "single",
    choices: [
      { value: "biometrics", label: "Biometrics (permitted identification/categorization)" },
      { value: "critical_infra", label: "Critical infrastructure (safety component)" },
      { value: "education", label: "Education and vocational training" },
      {
        value: "employment",
        label: "Employment and workers management",
        hint: "Recruitment, CV screening, promotion, task allocation.",
      },
      {
        value: "credit",
        label: "Creditworthiness / credit scoring",
        hint: "Access to essential private services.",
      },
      { value: "insurance", label: "Life and health insurance (risk and pricing)" },
      { value: "public_services", label: "Public services and benefits / emergencies" },
      { value: "law_enforcement", label: "Law enforcement" },
      { value: "migration", label: "Migration, asylum and border control" },
      { value: "justice", label: "Administration of justice and democratic processes" },
      {
        value: NONE,
        label: "None / general business use",
        hint: "Marketing, internal productivity, content recommendation, etc.",
      },
    ],
  },
  {
    id: "profiling_gate",
    step: 3,
    title: "Does the system perform profiling of natural persons?",
    help: "Profiling = automated processing of personal data to evaluate aspects of a natural person: work performance, economic situation, health, preferences, interests, reliability, behavior, location or movements (Article 4(4) GDPR). If the system operates in an Annex III area and performs profiling, Article 6(3) prevents any exception from applying: it is always considered high-risk.",
    type: "single",
    onlyIfHighCandidate: true,
    choices: [
      {
        value: "yes",
        label: "Yes, it performs profiling of natural persons",
        hint: "With profiling, no Article 6(3) exception is available: the system is high-risk outright.",
      },
      { value: "no", label: "No, it does not perform profiling of natural persons" },
    ],
  },
  {
    id: "exception",
    step: 4,
    title: "Does any exception under Article 6(3) apply?",
    help: "A system in an Annex III area is NOT high-risk if it only performs one of these narrow tasks (and does not perform profiling, already confirmed in the previous step).",
    type: "single",
    onlyIfHighCandidate: true,
    choices: [
      { value: "narrow_task", label: "Performs a narrow procedural task" },
      { value: "improve_human", label: "Improves the result of a previously completed human activity" },
      {
        value: "detect_patterns",
        label: "Detects decision-making patterns without replacing human judgment",
      },
      { value: "preparatory", label: "Is a preparatory task to an assessment" },
      { value: NONE, label: "None: it influences the final decision" },
    ],
  },
  {
    id: "transparency",
    step: 5,
    title: "Does the system do any of the following towards people?",
    help: "Transparency obligations under Article 50. Check all that apply.",
    type: "multi",
    choices: [
      {
        value: "interacts",
        label: "Interacts directly with natural persons",
        hint: "Chatbots, conversational assistants.",
      },
      {
        value: "synthetic",
        label: "Generates or manipulates synthetic content",
        hint: "Image, audio, video or text (incl. deepfakes).",
      },
      {
        value: "emotion_or_biometric",
        label: "Recognizes emotions or performs biometric categorization",
        hint: "Outside the prohibited cases.",
      },
      { value: NONE, label: "None of the above" },
    ],
  },
  {
    id: "gpai",
    step: 6,
    title: "Is there a general-purpose AI model (GenAI) underneath?",
    help: "The AI Act's GPAI layer (Chapter V, Articles 51-56), applicable since 2 August 2025. Pick the option that best describes your case.",
    type: "single",
    choices: [
      {
        value: "third_party",
        label: "We use a third-party service as-is",
        hint: "ChatGPT, Copilot, Gemini, Claude… without modifying them.",
      },
      {
        value: "self_hosted",
        label: "We deploy a model ourselves, unmodified",
        hint: "Open-weights, or an API integrated into our own product.",
      },
      {
        value: "finetuned",
        label: "We fine-tune it with our own data",
        hint: "Additional training on top of an existing model.",
      },
      {
        value: "own_brand",
        label: "We offer it to third parties under our own brand",
        hint: "Even if the model belongs to someone else.",
      },
      { value: NONE, label: "There is no general-purpose model involved" },
    ],
  },
];

export const OBLIGATIONS_BY_LEVEL_EN: Record<RiskLevel, string[]> = {
  unacceptable: [
    "Prohibited: the system cannot be placed on the market or used in the EU.",
    "Cease use and document the withdrawal.",
  ],
  high: [
    // Deployer's OWN duties (our ICP).
    "Own duty: effective human oversight over the decision (Art. 26(2), supported by the provider's design under Art. 14).",
    "Own duty: deployer obligations (Art. 26) — use in accordance with the instructions for use, information to affected persons and to workers, keeping of logs and monitoring of operation.",
    "Own duty: transparency towards affected persons (Art. 50) and, where applicable, registration in the EU database (Art. 49) and a fundamental rights impact assessment (Art. 27).",
    // PROVIDER obligations: the deployer requires and retains them as evidence.
    "Require and retain provider evidence: risk-management system (Art. 9), data governance and quality (Art. 10), Annex IV technical documentation (Art. 11), logging (Art. 12), instructions for use (Art. 13), accuracy/robustness/cybersecurity (Art. 15) and the CE marking / EU Declaration of Conformity.",
  ],
  limited: [
    "Inform people that they are interacting with an AI system (Art. 50).",
    "Label AI-generated or AI-manipulated content as artificial.",
  ],
  minimal: [
    "No specific obligations under the AI Act.",
    "Voluntary codes of conduct are recommended (Art. 95).",
  ],
};

export const CITATIONS_EN: Record<RiskLevel, Citation[]> = {
  unacceptable: [
    { article: "Art. 5", text: "Prohibited AI practices." },
  ],
  high: [
    { article: "Art. 6 + Annex III", text: "Classification as a high-risk system." },
    { article: "Arts. 9–15", text: "Requirements for high-risk systems." },
  ],
  limited: [
    { article: "Art. 50", text: "Transparency obligations." },
  ],
  minimal: [
    { article: "Art. 95", text: "Voluntary codes of conduct." },
  ],
};

/**
 * Ramas de rationale que `classify()` ensambla inline en ES. Mapa rama -> clave:
 *  - prohibited && !onlyOmnibus                     -> prohibited_classic
 *  - prohibited && onlyOmnibus && omnibusInForce    -> prohibited_omnibus_in_force
 *  - prohibited && onlyOmnibus && !omnibusInForce   -> prohibited_omnibus_pending
 *  - highCandidate && profiling_gate === "yes"      -> high_profiling
 *  - highCandidate && !exceptionApplies             -> high
 *  - transparency.length > 0                        -> limited
 *  - (fallback)                                     -> minimal
 */
export const RATIONALES_EN = {
  prohibited_classic:
    "The system engages in one or more practices prohibited by Article 5. It cannot be used in the EU.",
  prohibited_omnibus_in_force:
    "The system engages in a practice prohibited by Article 5 — the generation or manipulation of non-consensual realistic intimate images or of CSAM — added by the Digital Omnibus and applicable from 2 December 2026. It cannot be placed on the market or used in the EU. Irrespective of the AI Act, generating or manipulating this material already constitutes a criminal offence (Directive 2011/93/EU for CSAM; Directive (EU) 2024/1385 and national criminal law for non-consensual intimate images).",
  prohibited_omnibus_pending:
    "The Digital Omnibus added this practice — the generation or manipulation of non-consensual realistic intimate images or of CSAM — to Article 5; it will be a prohibited practice of the EU AI Act applicable from 2 December 2026 (not yet in force as of the date of this assessment). Nevertheless, generating or manipulating this material is already unlawful under criminal law irrespective of the AI Act (Directive 2011/93/EU for CSAM; Directive (EU) 2024/1385 and national criminal law for non-consensual intimate images), and it is therefore classified as unacceptable. Validate this classification with qualified legal advice.", // attesta-copy-ok: recomienda al usuario BUSCAR asesoría legal externa; no la presta Attesta.
  high:
    "The system operates in a high-risk area of Annex III and no exception under Article 6(3) applies to it.",
  high_profiling:
    "The system operates in a high-risk area of Annex III and performs profiling of natural persons. Under the second subparagraph of Article 6(3) of Regulation (EU) 2024/1689, an Annex III system that performs profiling is always considered high-risk, so the Article 6(3) exceptions cannot apply.",
  limited:
    "The system is not high-risk but is subject to the transparency obligations of Article 50.",
  minimal:
    "The system does not fall under prohibited practices, high-risk areas or transparency obligations.",
} as const;

/**
 * Citas extra (Directivas) que classify() añade a CITATIONS.unacceptable cuando
 * la práctica marcada es EXCLUSIVAMENTE Omnibus. Uso EN paralelo al ES inline:
 *   [...CITATIONS_EN.unacceptable, ...OMNIBUS_CITATIONS_EN]
 */
export const OMNIBUS_CITATIONS_EN: Citation[] = [
  {
    article: "Directive 2011/93/EU",
    text: "CSAM: a criminal offence irrespective of the AI Act.",
  },
  {
    article: "Directive (EU) 2024/1385",
    text: "Non-consensual intimate images: a criminal offence via national law.",
  },
];

export const GPAI_CITATIONS_EN: Citation[] = [
  {
    article: "Arts. 51-56 (Chapter V)",
    text: "General-purpose AI models have their own regime: technical documentation, a copyright policy, a summary of the training content, and information for the providers that integrate the model. These obligations belong to the model's PROVIDER, and have applied since 2 August 2025.",
  },
  {
    article: "Art. 53(1)(b)",
    text: "The model provider must supply information and documentation to those who integrate it into their systems, so they can meet their own obligations. This is the basis for demanding written evidence from them.",
  },
  {
    article: "Art. 25",
    text: "Whoever puts their name or trademark on a system, or substantially modifies it, takes on the provider's obligations. The Commission's guidelines (July 2025) add an INDICATIVE criterion for GPAI models: exceeding one third of the original model's training compute. Recital 109 limits those obligations to the scope of the modification.",
  },
];

export const GPAI_OBLIGATIONS_EN: string[] = [
  "Your own duty: identify and document which general-purpose model sits underneath, from which provider and in which version. Without that you can neither demand nor evidence anything.",
  "Require from the model provider the Art. 53(1)(b) documentation (information for integrators), their copyright policy and the public summary of training content; keep a copy as declared evidence.",
  "Ask in writing whether the model is designated as posing systemic risk (Art. 51): it changes the provider's obligations and therefore the evidence you can demand.",
  "Your own duty: AI literacy for the people using it (Art. 4) and written limits of use — what it is and is not for, and who reviews the outputs.",
  "Your own duty: if the system interacts with people or generates synthetic content, meet the Art. 50 transparency duties (disclose that it is AI and mark generated content).",
];

export const GPAI_PROVIDER_OBLIGATIONS_EN: string[] = [
  "⚠️ Legal review: by fine-tuning the model with your own data or offering it under your brand, your organization may come to be considered a PROVIDER (Art. 25). The Commission's compute criterion is indicative, not a legal threshold.",
  "If the role changes, the obligations are limited to the scope of the modification (Recital 109), but they do include documenting the fine-tune: which data, which objective and what was evaluated before putting it into use.",
];

export const GPAI_NOTES_EN = {
  third_party:
    "Your role remains that of deployer: the Chapter V obligations belong to the model's provider. Yours is to demand written evidence from them and to document which model and version you use.",
  self_hosted:
    "Deploying it yourself does not make you the model's provider, but it does leave you with no one to claim documentation from: keep the source model's paperwork (licence, model card, version) as evidence.",
  finetuned:
    "Fine-tuning with your own data is the Art. 25 boundary: it may make your organization the provider of the resulting model. The one-third training-compute criterion is indicative (Commission guidelines, Jul 2025) and calls for legal review, not self-assessment.",
  own_brand:
    "Offering it under your own brand triggers Art. 25 directly: whoever puts their name on the system takes on the provider's obligations. This needs legal review before going further.",
} as const;
