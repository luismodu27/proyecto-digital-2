/**
 * Policy pack — Contratación con IA (EE. UU.).
 *
 * Controles del DEPLOYER (empleador) bajo las leyes estatales de EE. UU. que
 * regulan el uso de IA en contratación. A diferencia del EU AI Act, aquí el
 * empleador es el OBLIGADO DIRECTO (no hay reencuadre provider/deployer).
 *
 * Alcance: NYC Local Law 144 (AEDT) e Illinois (Human Rights Act enmendada por
 * HB 3773 + Artificial Intelligence Video Interview Act). Colorado (aplazada a
 * 2027) y la orientación federal EEOC (retirada en 2025) se siguen solo en el
 * radar de vigilancia, no como controles aquí.
 *
 * ⚠️ IMPORTANTE (regla dura del producto): Attesta NO realiza ni valida la
 * auditoría de sesgo; la ejecuta un AUDITOR INDEPENDIENTE. Attesta solo REGISTRA
 * la evidencia declarada (fecha, auditor, URL). "Auditoría realizada" ≠ "aprobada"
 * ≠ "sin discriminación".
 *
 * Orientación de compliance, NO asesoría legal. Contenido revisado por el
 * subagente `compliance-domain-expert` (2026-07-18) contra fuentes oficiales
 * (DCWP/NYC Rules, Illinois General Assembly). Casi todos los controles son
 * territoriales → van marcados con su condición de aplicabilidad.
 */

import type { PolicyPack } from "./types";

export const US_HIRING_PACK: PolicyPack = {
  id: "us-hiring",
  name: "Contratación con IA — EE. UU.",
  tag: "EE. UU. · Contratación",
  summary:
    "Obligaciones del empleador que usa IA para contratar en EE. UU. (NYC Local Law 144 e Illinois). Aplícalo a un sistema de selección para precargar sus brechas.",
  note: "Obligaciones territoriales: aplican según dónde contrates. Snapshot regulatorio: julio 2026. Orientativo, no asesoría legal.",
  controls: [
    {
      id: "identificar-aedt",
      title: "Identifica qué herramientas de selección son un AEDT (orientativo)",
      description:
        "Revisa cada herramienta de reclutamiento (cribado de CVs, ranking, scoring, ciertas video-entrevistas) y determina si encaja en la definición de «automated employment decision tool»: un proceso computacional que usa aprendizaje automático, modelado estadístico, IA o analítica de datos y que emite una puntuación, clasificación o recomendación que sustituye o pesa sustancialmente en la decisión sobre un candidato o empleado. Esa clasificación determina qué obligaciones de LL144 recaen sobre ti como empleador. Conserva el razonamiento de por qué una herramienta es o no un AEDT.",
      article: "NYC LL144 · 6 RCNY §5-300",
      severity: "alta",
      conditional:
        "Solo si evalúas a candidatos/empleados para un puesto en la Ciudad de Nueva York (o residentes de NYC).",
    },
    {
      id: "auditoria-sesgo-independiente",
      title:
        "Registra una auditoría de sesgo independiente de menos de 12 meses (orientativo)",
      description:
        "Antes de usar un AEDT, tu organización debe asegurar que la herramienta pasó una auditoría de sesgo realizada por un auditor independiente (sin implicación en desarrollar u operar la herramienta ni interés financiero) con antigüedad no mayor a un año. Attesta NO realiza ni valida la auditoría: registra la fecha, el nombre del auditor independiente y la URL del resumen como evidencia declarada. Nota clave: la ley exige realizar y publicar la auditoría, no «aprobarla»; una auditoría que muestre impacto adverso no impide por sí el uso bajo LL144, pero eleva tu exposición antidiscriminación (Title VII).",
      article: "NYC LL144 · 6 RCNY §5-301",
      severity: "alta",
      conditional: "Solo si la herramienta es un AEDT usado para puestos en NYC.",
    },
    {
      id: "publicar-resumen-auditoria",
      title: "Publica el resumen de resultados de la auditoría en tu sitio web (orientativo)",
      description:
        "Tu organización debe publicar en una sección accesible de su web, antes de usar el AEDT, el resumen de resultados de la última auditoría de sesgo (selection/scoring rates e impact ratios por sexo, raza/etnia y categorías interseccionales, la fecha de distribución de la herramienta y la fecha de la auditoría). Attesta guarda el enlace público y la fecha de publicación como evidencia; no aloja ni certifica el contenido.",
      article: "NYC LL144 · 6 RCNY §5-302",
      severity: "alta",
      conditional: "Solo si la herramienta es un AEDT usado para puestos en NYC.",
    },
    {
      id: "aviso-candidato-nyc",
      title: "Avisa al candidato con al menos 10 días hábiles de antelación (orientativo)",
      description:
        "Al menos 10 días hábiles antes de usar el AEDT, informa a cada candidato o empleado residente en NYC de: (a) que se usará un AEDT en su evaluación; (b) las características de trabajo o cualificaciones que la herramienta evaluará; (c) el tipo de datos recogidos y su fuente (y, si se solicita, la política de retención); y (d) que puede solicitar un proceso de selección alternativo o una adaptación. Conserva la plantilla del aviso y evidencia de su entrega.",
      article: "NYC LL144 · 6 RCNY §5-303",
      severity: "alta",
      conditional: "Solo si la herramienta es un AEDT usado para puestos en NYC.",
    },
    {
      id: "aviso-uso-ia-illinois",
      title: "Avisa del uso de IA a candidatos y empleados (Illinois, orientativo)",
      description:
        "Si usas IA en decisiones de empleo en Illinois (reclutamiento, contratación, promoción, formación, despido, disciplina o condiciones de empleo), debes notificar a la persona afectada que se está usando IA. Prepara y conserva un aviso claro. Cautela: los reglamentos de detalle de la IDHR (circunstancias, momento y forma exacta del aviso) están pendientes, por lo que el formato preciso es incierto; trátalo como orientativo y vigila su reaparición para ajustar el aviso.",
      article: "Illinois HRA (HB 3773) · 775 ILCS 5/2-102",
      severity: "media",
      conditional: "Solo si contratas o gestionas empleo en Illinois.",
    },
    {
      id: "evitar-efecto-discriminatorio-il",
      title:
        "Evita que la IA produzca efecto discriminatorio o use proxies como el código postal (orientativo)",
      description:
        "En Illinois es una violación de derechos civiles usar IA que tenga el efecto de discriminar por clase protegida en decisiones de empleo, y usar el código postal como proxy de clase protegida. La responsabilidad se basa en el efecto, no en la intención. Como deployer: entiende cómo decide tu herramienta, exige al proveedor evidencia de sus pruebas de sesgo/impacto adverso, elimina variables proxy y documenta tus revisiones.",
      article: "Illinois HRA (HB 3773) · 775 ILCS 5/2-102, 1-103",
      severity: "alta",
      conditional: "Solo si contratas o gestionas empleo en Illinois.",
    },
    {
      id: "aivia-consentimiento",
      title:
        "Obtén consentimiento y explica cómo funciona la IA antes de la video-entrevista (orientativo)",
      description:
        "Antes de una video-entrevista analizada por IA, tu organización debe: (a) avisar al candidato de que puede usarse IA para analizar el vídeo; (b) explicar cómo funciona la IA y qué tipos de características usa para evaluar; y (c) obtener su consentimiento. No puedes analizar con IA a quien no consienta; ofrece una alternativa. Conserva el consentimiento y el texto explicativo como evidencia (a menudo depende de que el proveedor te facilite ese texto).",
      article: "Illinois AIVIA · 820 ILCS 42/5",
      severity: "alta",
      conditional:
        "Solo si usas IA para analizar video-entrevistas de candidatos en Illinois.",
    },
    {
      id: "aivia-borrado-30",
      title: "Borra el vídeo en 30 días cuando el candidato lo solicite (orientativo)",
      description:
        "Si un candidato lo solicita, tu organización debe eliminar sus video-entrevistas dentro de los 30 días siguientes a la solicitud e instruir a cualquier tercero que recibió copias (incluidos backups) para que también las borre. Habilita un canal para recibir estas solicitudes y registra la fecha de solicitud y de borrado.",
      article: "Illinois AIVIA · 820 ILCS 42/15",
      severity: "media",
      conditional:
        "Solo si usas IA para analizar video-entrevistas de candidatos en Illinois.",
    },
    {
      id: "aivia-reporte-demografico",
      title:
        "Recoge y reporta datos demográficos si solo la IA decide quién avanza (orientativo)",
      description:
        "Si tu organización se basa únicamente en el análisis por IA para decidir qué candidatos avanzan a una entrevista presencial, debe recoger y reportar anualmente al Departamento de Comercio datos de raza y etnia de quienes recibieron o no recibieron la entrevista presencial. Solo aplica en ese supuesto acotado.",
      article: "Illinois AIVIA · 820 ILCS 42/20",
      severity: "baja",
      conditional:
        "Solo si usas IA como único criterio para seleccionar quién pasa a entrevista presencial en Illinois.",
    },
    {
      id: "conservar-evidencia-us",
      title: "Conserva evidencia de auditorías, avisos y consentimientos (orientativo)",
      description:
        "Mantén un registro trazable por herramienta y por candidato: fecha y auditor de la última auditoría de sesgo, URL del resumen publicado, plantillas y entregas de avisos, consentimientos AIVIA, solicitudes de borrado, y la evidencia de las pruebas de sesgo exigidas al proveedor. Es la base para responder a una reclamación o a una investigación del DCWP (NYC) o de la IDHR (Illinois). Attesta actúa como system of record de esa evidencia declarada, no como certificador.",
      article: "Transversal · 6 RCNY §§5-301 a 5-303; 820 ILCS 42; 775 ILCS 5",
      severity: "media",
      conditional: "Aplica siempre que uses IA en contratación en EE. UU.",
    },
    {
      id: "baseline-federal-antidiscriminacion",
      title: "Mantén las buenas prácticas antidiscriminación federales (orientativo)",
      description:
        "Con independencia del estado, las leyes federales antidiscriminación siguen aplicando a las herramientas de selección con IA: pruebas de impacto adverso (Title VII), adaptaciones razonables y evitar el «screen out» de personas con discapacidad (ADA), y edad (ADEA). La EEOC retiró en 2025 su guía específica sobre IA, pero las leyes de fondo no cambiaron: no asumas que «ya no hay regla federal».",
      article: "Federal · Title VII, ADA, ADEA",
      severity: "media",
      conditional: "Aplica siempre en EE. UU. (riesgo legal de fondo, no un deber de «auditar la IA»).",
    },
  ],
};
