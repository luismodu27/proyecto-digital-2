/**
 * Policy pack — Reclutamiento y selección de personal (RRHH).
 *
 * Catálogo de controles/obligaciones típicos de un sistema de IA de selección,
 * pensado para un DEPLOYER mid-market. Precarga las brechas de un gap assessment.
 *
 * ⚠️ Orientación de compliance, NO asesoría legal. Contenido revisado por el
 * subagente `compliance-domain-expert` (2026-07-17; ampliado 2026-07-20) contra el
 * texto del EU AI Act (Arts. 4, 5, 10, 11, 14, 15, 26, 27, 50, 86) y el RGPD
 * (Arts. 5, 13-14, 22, 35). Los subapartados del Art. 26, el alcance del Art. 27
 * (FRIA) y el reparto deployer/proveedor del Art. 50 se verificaron contra
 * artificialintelligenceact.eu. Plazos del Digital Omnibus (alto riesgo → 2-dic-2027)
 * verificados contra la nota del Consejo de la UE (29-jun-2026).
 */

export type { PolicySeverity, PolicyControl, PolicyPack } from "./types";
import type { PolicyPack } from "./types";

export const RRHH_PACK: PolicyPack = {
  id: "rrhh",
  name: "Reclutamiento y selección (EU AI Act)",
  tag: "UE · Reclutamiento",
  summary:
    "Controles típicos para IA de selección de personal (alto riesgo, Anexo III). Aplícalo a un sistema para precargar sus brechas.",
  note:
    "Plazos del EU AI Act (deployer): la alfabetización en IA (Art. 4) y las prohibiciones del Art. 5 ya son exigibles (desde el 2-feb-2025); la transparencia del Art. 50 aplica el 2-ago-2026. Las obligaciones de alto riesgo del Anexo III (empleo, Arts. 14/26/27) se aplazaron al 2-dic-2027 con el Digital Omnibus — NO el 2-ago-2026, un error extendido en el mercado. Este pack te deja lista la evidencia con antelación.",
  controls: [
    {
      id: "alfabetizacion-ia",
      title: "Alfabetización en IA del personal",
      description:
        "Adopta medidas para que las personas que operan o supervisan la herramienta de selección tengan un nivel suficiente de alfabetización en IA (sus capacidades, límites y riesgos), proporcionado a su rol y contexto. Es un deber PROPIO y directo del deployer, exigible desde el 2 de febrero de 2025. Evidencia = registro de la formación u onboarding impartido (fecha, asistentes y contenidos).",
      article: "Art. 4",
      severity: "media",
      conditional: "Exigible desde el 2 de febrero de 2025 (ya vigente).",
    },
    {
      id: "supervision-humana",
      title: "Supervisión humana efectiva en la decisión",
      description:
        "Asigna la supervisión a una persona competente, formada y con autoridad para revisar, no seguir o anular la recomendación de la IA antes de descartar o avanzar a un candidato. Como deployer, DESIGNAR a esa persona es tu obligación (Art. 26.2); que el sistema permita la supervisión es diseño del proveedor (Art. 14).",
      article: "Art. 26.2 (y Art. 14)",
      severity: "alta",
    },
    {
      id: "sesgo",
      title: "No discriminación y control de sesgo",
      description:
        "El deber directo del empleador nace de la normativa antidiscriminación (p. ej. Directivas UE 2000/78/CE, 2006/54/CE, 2000/43/CE y la ley nacional): vigila que el cribado o el ranking no produzcan impacto desigual por características protegidas (sexo, edad, origen, discapacidad) y documéntalo. Exige además al proveedor evidencia de sus pruebas de sesgo sobre los datos de entrenamiento (obligación del proveedor, Art. 10, no tuya como deployer).",
      article: "Normativa antidiscriminación (Art. 10 = proveedor)",
      severity: "alta",
    },
    {
      id: "decision-automatizada",
      title: "Decisión no meramente automatizada (GDPR)",
      description:
        "Si hay decisiones con efecto significativo (p. ej. descarte automático), asegura una intervención humana real y el derecho del candidato a obtener explicación y a impugnar la decisión (GDPR Art. 22). El AI Act refuerza esto con el derecho del afectado a una explicación clara del papel del sistema en decisiones basadas en IA de alto riesgo del Anexo III (Art. 86).",
      article: "GDPR Art. 22 (y Art. 86)",
      severity: "alta",
    },
    {
      id: "transparencia-candidato",
      title: "Transparencia e información al candidato",
      description:
        "Informa a las personas candidatas de que están sujetas al uso de un sistema de IA de alto riesgo (obligación del deployer, Art. 26.11) y facilita la información de protección de datos del RGPD: finalidad, base jurídica, lógica implicada y datos tratados (GDPR Arts. 13-14).",
      article: "Art. 26.11 (y GDPR Arts. 13-14)",
      severity: "media",
    },
    {
      id: "transparencia-chatbot-emociones",
      title: "Transparencia de IA en la interacción (Art. 50)",
      description:
        "Deberes PROPIOS del deployer (aplicables desde el 2 de agosto de 2026): si expones a candidatos a un sistema de reconocimiento de emociones o categorización biométrica, debes informarles de ello (Art. 50.3); si difundes contenido generado o manipulado por IA (p. ej. imágenes o vídeos en materiales del proceso), debes etiquetarlo como tal (Art. 50.4). Lo que EXIGES al proveedor y conservas como evidencia: que un chatbot conversacional avise de que se habla con una IA (Art. 50.1) y que marque de forma legible por máquina el contenido que genere (Art. 50.2). ATENCIÓN: inferir emociones de una persona en el ámbito laboral (p. ej. análisis de afecto o microexpresiones en vídeo-entrevistas) es una práctica PROHIBIDA salvo fines médicos o de seguridad (Art. 5.1.f); comprueba si tu herramienta lo hace antes de usarla.",
      article: "Art. 50.3/50.4 (deployer) · 50.1/50.2 (proveedor) · prohib. 5.1.f",
      severity: "alta",
      conditional:
        "Transparencia del deployer (Art. 50) aplicable desde el 2 de agosto de 2026; la prohibición del Art. 5.1.f ya está vigente.",
    },
    {
      id: "info-trabajadores",
      title: "Información a los trabajadores y sus representantes",
      description:
        "Como empleador, antes de poner en servicio o usar la IA de alto riesgo en el lugar de trabajo, informa a los trabajadores afectados y a sus representantes de que estarán sujetos a ella.",
      article: "Art. 26.7",
      severity: "media",
    },
    {
      id: "datos-entrada",
      title: "Datos de entrada pertinentes y representativos",
      description:
        "En la medida en que controlas los datos de entrada (CVs, criterios del puesto, ponderaciones), asegúrate de que son pertinentes y suficientemente representativos para la finalidad prevista.",
      article: "Art. 26.4",
      severity: "media",
    },
    {
      id: "documentacion",
      title: "Uso conforme a instrucciones y documentación del proveedor",
      description:
        "Usa el sistema conforme a las instrucciones de uso del proveedor (Art. 26.1). Exige y conserva como evidencia la información que debe facilitarte (instrucciones de uso e información del Anexo IV / Art. 11, que son obligación del proveedor).",
      article: "Art. 26.1 (Anexo IV/Art. 11 = proveedor)",
      severity: "media",
    },
    {
      id: "logs",
      title: "Conservación de registros (logs) del sistema",
      description:
        "Conserva los logs generados automáticamente por el sistema, en la medida en que estén bajo tu control, durante un periodo adecuado a la finalidad y de al menos 6 meses.",
      article: "Art. 26.6",
      severity: "media",
    },
    {
      id: "exactitud-robustez",
      title: "Exactitud, robustez y ciberseguridad (exige evidencia)",
      description:
        "El nivel adecuado de exactitud, robustez y ciberseguridad es obligación de diseño del proveedor (Art. 15): exígele las métricas y sus límites declarados, y vigila en uso real que el rendimiento se mantiene (Art. 26.5).",
      article: "Art. 15 (proveedor) + Art. 26.5",
      severity: "media",
    },
    {
      id: "monitoreo",
      title: "Monitoreo del funcionamiento y revisión periódica",
      description:
        "Vigila el funcionamiento del sistema conforme a las instrucciones; si aprecias que su uso puede presentar un riesgo, suspende el uso e informa al proveedor y, cuando proceda, a la autoridad, y notifica los incidentes graves. Programa una revisión periódica (p. ej. anual o ante cambios).",
      article: "Art. 26.5",
      severity: "media",
    },
    {
      id: "conservacion-evidencia",
      title: "Conservación de evidencia de tus propias decisiones",
      description:
        "Guarda registro de las decisiones y revisiones humanas del proceso (motivo del descarte/avance, quién revisó y cuándo) para poder rendir cuentas (responsabilidad proactiva, GDPR Art. 5.2), responder a solicitudes de explicación (Art. 86) y defenderte ante posibles reclamaciones de discriminación.",
      article: "GDPR Art. 5.2 (y Art. 86)",
      severity: "media",
    },
    {
      id: "dpia",
      title: "Evaluación de impacto de protección de datos (DPIA)",
      description:
        "La evaluación sistemática de candidatos con perfilado suele requerir una DPIA previa bajo el RGPD (Art. 35, en especial 35.3.a); realízala y documéntala antes de iniciar el tratamiento.",
      article: "GDPR Art. 35",
      severity: "alta",
    },
    {
      id: "fria",
      title: "Evaluación de impacto en derechos fundamentales (FRIA) — normalmente NO aplica",
      description:
        "La FRIA del AI Act NO es exigible a un empleador privado ordinario que usa IA de selección (Anexo III.4). Solo aplica si sois un organismo de Derecho público o una entidad privada que presta servicios públicos (o para crédito/seguros del Anexo III 5.b y 5.c). Se incluye únicamente para dejar constancia de que se evaluó su aplicabilidad; en la mayoría de casos privados se marca como no aplicable.",
      article: "Art. 27",
      severity: "baja",
    },
  ],
};
