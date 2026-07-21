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

export type ClassificationResult = {
  level: RiskLevel;
  rationale: string;
  citations: Citation[];
  obligations: string[];
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
    id: "exception",
    step: 3,
    title: "¿Aplica alguna excepción del Art. 6(3)?",
    help: "Un sistema en un área del Anexo III NO es de alto riesgo si solo hace lo siguiente y no perfila a personas.",
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
      {
        value: "profiling",
        label: "Perfila a personas o influye en decisiones sobre ellas",
        hint: "Si perfila personas, NO hay excepción: sigue siendo alto riesgo.",
      },
      { value: NONE, label: "Ninguna: influye en la decisión final" },
    ],
  },
  {
    id: "transparency",
    step: 4,
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
];

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

export function classify(answers: Answers): ClassificationResult {
  // 1) Prohibido (Art. 5) — cualquier práctica marcada, salvo "ninguna".
  const prohibited = (answers.prohibited ?? []).filter((v) => v !== NONE);
  if (prohibited.length > 0) {
    return {
      level: "unacceptable",
      rationale:
        "El sistema incurre en una o más prácticas prohibidas por el Art. 5. No puede usarse en la UE.",
      citations: CITATIONS.unacceptable,
      obligations: OBLIGATIONS_BY_LEVEL.unacceptable,
    };
  }

  // 2) ¿Ámbito de alto riesgo (Anexo III)?
  const highCandidate = isHighCandidate(answers);

  if (highCandidate) {
    const exception = (answers.exception ?? [])[0];
    const exceptionApplies =
      exception !== undefined && REAL_EXCEPTIONS.has(exception);

    // La excepción NO aplica si perfila personas o si no eligió excepción real.
    if (!exceptionApplies) {
      return {
        level: "high",
        rationale:
          "El sistema opera en un área de alto riesgo del Anexo III y no le aplica ninguna excepción del Art. 6(3).",
        citations: CITATIONS.high,
        obligations: OBLIGATIONS_BY_LEVEL.high,
      };
    }
    // Si aplica excepción, cae a evaluar transparencia (limitado/mínimo).
  }

  // 3) Transparencia (Art. 50) — limitado.
  const transparency = (answers.transparency ?? []).filter((v) => v !== NONE);
  if (transparency.length > 0) {
    return {
      level: "limited",
      rationale:
        "El sistema no es de alto riesgo, pero está sujeto a obligaciones de transparencia del Art. 50.",
      citations: CITATIONS.limited,
      obligations: OBLIGATIONS_BY_LEVEL.limited,
    };
  }

  // 4) Riesgo mínimo.
  return {
    level: "minimal",
    rationale:
      "El sistema no encaja en prácticas prohibidas, áreas de alto riesgo ni obligaciones de transparencia.",
    citations: CITATIONS.minimal,
    obligations: OBLIGATIONS_BY_LEVEL.minimal,
  };
}

/** Devuelve las preguntas visibles según las respuestas actuales. */
export function visibleQuestions(answers: Answers): Question[] {
  const highCandidate = isHighCandidate(answers);
  return RISK_QUESTIONS.filter(
    (q) => !q.onlyIfHighCandidate || highCandidate,
  );
}

export { has };
