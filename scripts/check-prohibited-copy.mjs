#!/usr/bin/env node
/**
 * Guard de COPY PROHIBIDO — puerta de calidad de la regla #1 del producto.
 *
 * "Attesta NO certifica": es un system-of-record de evidencia + autoevaluación +
 * preparación para auditoría. Un texto que insinúe certificación, conformidad
 * garantizada o asesoría legal es un PASIVO LEGAL, no un bug de estilo. Hasta
 * ahora esa regla se sostenía solo por disciplina humana; este script la vuelve
 * verificable en CI.
 *
 * DISEÑO (importante): NO es una lista negra de palabras. Escanear "certificado"
 * o "marcado CE" a secas produce ~18 falsos positivos en este repo, porque hay
 * usos LEGÍTIMOS y deseables:
 *   · "exige al proveedor el marcado CE y conserva esa evidencia" (encuadre deployer)
 *   · "Attesta actúa como system of record …, no como certificador" (descargo)
 *   · "garantiza intervención humana real" (RGPD Art. 22 — el objeto es la
 *     intervención humana, no el cumplimiento)
 *   · "aprobado por la Office of Administrative Law" (una norma que se aprueba)
 * Un guard con 18 falsos positivos se desactiva en una semana. Por eso aquí se
 * detecta el PATRÓN PELIGROSO: Attesta/el producto como SUJETO que certifica,
 * afirmaciones de cumplimiento sobre el cliente, y veredictos de aptitud.
 *
 * Además ignora dos formas LEGÍTIMAS y muy frecuentes en este repo:
 *   · NEGACIÓN — "Attesta NO certifica", "no es un certificado de conformidad",
 *     "no es un porcentaje de cumplimiento". Los descargos son obligatorios y son
 *     justo lo contrario del pasivo que buscamos.
 *   · PREGUNTA — "¿Attesta certifica mi cumplimiento?" (FAQ cuya respuesta es "No").
 *
 * Escape hatch: añade `attesta-copy-ok` en la misma línea (idealmente con motivo)
 * cuando un match sea un falso positivo justificado.
 *
 * RELACIÓN con `src/lib/analista/llm.ts`: allí vive `PROHIBITED_COPY`, el guard de
 * RUNTIME que descarta borradores del LLM con vocabulario prohibido. Este script es
 * el guard de BUILD sobre el código fuente escrito a mano. Son complementarios: uno
 * vigila lo que genera la máquina, el otro lo que escribimos nosotros.
 *
 * Uso:  node scripts/check-prohibited-copy.mjs
 * Sale con código 1 si encuentra copy prohibido (rompe el build en CI).
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src"];
const EXTENSIONS = [".ts", ".tsx"];
/**
 * Archivos cuyo CONTENIDO ES la lista de vocabulario prohibido (por definición la
 * contienen). Excluirlos evita 12 falsos positivos estructurales:
 *  · `analista/llm.ts` → `PROHIBITED_COPY` + las "REGLAS DE COPY" del prompt.
 *  · este propio script.
 */
const SKIP_FILES = [
  "scripts/check-prohibited-copy.mjs",
  "src/lib/analista/llm.ts",
];

const ALLOW_MARKER = "attesta-copy-ok";

/**
 * Marcadores de NEGACIÓN. Si aparecen en la ventana previa al match, el texto es
 * un descargo ("Attesta NO certifica", "no es un certificado de conformidad") y no
 * una afirmación prohibida. Heurística deliberada: preferimos algún falso negativo
 * a un guard con tantos falsos positivos que alguien lo desactive.
 */
const NEGATION_RE =
  /\b(no|nunca|jamás|jamas|sin|ni|tampoco|prohibid[oa]s?|prohibido|evita|nada de|lejos de|en ningún|en ningun|not|never|without|nor|neither|don't|doesn't|does not|isn't|is not|cannot|can't|only|rather than|instead of)\b/i;
/** Ventana (caracteres) hacia atrás en la que se busca la negación. */
const NEGATION_WINDOW = 110;

/**
 * Cada patrón describe una AFIRMACIÓN prohibida, no una palabra.
 * `why` explica al desarrollador qué está mal y cuál es la alternativa segura.
 */
const PATTERNS = [
  {
    id: "attesta-certifica",
    // Attesta / la plataforma / nosotros como SUJETO de un verbo de certificación.
    re: /\b(attesta|la plataforma|esta plataforma)\b[^.!?\n]{0,40}\b(certifica|acredita|garantiza|aprueba|valida|audita|verifica el cumplimiento)\b/gi,
    why: "Attesta NO certifica/valida/audita. Reencuádralo: 'tu organización declara…', 'Attesta reúne la evidencia declarada'.",
  },
  {
    id: "primera-persona-certificamos",
    re: /\b(certificamos|acreditamos|garantizamos|aprobamos|validamos|auditamos)\b/gi,
    why: "Verbo de certificación en primera persona. Attesta no certifica; los verbos son de la ORGANIZACIÓN del cliente.",
  },
  {
    id: "validado-por-attesta",
    re: /\b(validad[oa]s?|auditad[oa]s?|certificad[oa]s?|aprobad[oa]s?|revisad[oa]s?)\s+por\s+(attesta|la plataforma)\b/gi,
    why: "Nada se 'valida/audita/certifica por Attesta'. Usa 'evidencia declarada por tu organización'.",
  },
  {
    id: "sello-de-conformidad",
    re: /\b(sello|certificado|certificación|distintivo)\s+de\s+(conformidad|cumplimiento|compliance)\b/gi,
    why: "Attesta no emite sellos ni certificados de conformidad. Usa 'preparación para auditoría' o 'evidencia declarada'.",
  },
  {
    id: "emitir-certificado",
    re: /\b(emit(e|imos|ir|iremos)|expide|expedimos|entrega(mos)?|genera(mos)?)\b[^.!?\n]{0,25}\b(certificado|certificación|sello)\b/gi,
    why: "Attesta no emite certificados. Genera dossier/informe de evidencia y preparación.",
  },
  {
    id: "porcentaje-de-cumplimiento",
    re: /(\b\d{1,3}\s?%|porcentaje|%)\s*(de\s+)?(cumplimiento|conformidad|compliance)\b/gi,
    why: "El puntaje es '% listo' / 'preparación', NUNCA '% de cumplimiento'.",
  },
  {
    id: "nivel-de-cumplimiento",
    re: /\b(nivel|grado|estado|índice)\s+de\s+(cumplimiento|conformidad)\b/gi,
    why: "No medimos cumplimiento. Usa 'nivel de preparación' o '% listo'.",
  },
  {
    id: "afirmacion-de-cumplimiento",
    // "tu organización / tu sistema / ya" + cumple → afirmación de conformidad.
    re: /\b(cumples|cumplís|ya cumple[sn]?|cumple con (el|la|los|las|todos|todas)|es conforme (al|a la|con)|estás? compliant|totalmente compliant|100\s?%\s?compliant)\b/gi,
    why: "No afirmamos que el cliente cumple. Usa 'brechas identificadas', 'evidencia declarada', 'preparación'.",
  },
  {
    id: "apto-no-apto",
    re: /\b(apto|no apto|aprobad[oa]|suspens[oa])\s+(para|en)\s+(auditor[ií]a|el ai act|la norma|conformidad)\b/gi,
    why: "No emitimos veredictos de aptitud. Usa '% listo' y 'brechas abiertas'.",
  },
  {
    id: "libre-de-riesgo",
    re: /\b(libre de riesgo|sin riesgo legal|riesgo cero|elimina (el )?riesgo|te protege legalmente)\b/gi,
    why: "No prometemos ausencia de riesgo. Usa 'reduce la exposición documentando la evidencia'.",
  },
  {
    id: "garantiza-cumplimiento",
    re: /\bgarantiza[a-z]*\b[^.!?\n]{0,30}\b(cumplimiento|conformidad|compliance|que cumpl)/gi,
    why: "Nada garantiza el cumplimiento. 'garantiza intervención humana' (RGPD 22) sí es válido: reencuadra el objeto.",
  },
  {
    id: "asesoria-legal-sin-descargo",
    // "asesoría legal" es OBLIGATORIO en el descargo ("no constituye asesoría
    // legal"); solo se marca si aparece SIN negación cerca.
    re: /\basesor(ía|ia|amiento|ar)\s+legal\b/gi,
    why: "Attesta no da asesoría legal. Si es el descargo, mantén la negación explícita ('no constituye asesoría legal').",
  },

  // ---------------------------------------------------------------------------
  // INGLÉS (`dictionaries/en.ts`, LegalNote y componentes bilingües). Mismo
  // criterio: la afirmación, no la palabra. Hoy el contenido EN está limpio
  // (todo va negado: "not legal advice", "does not certify") — estas reglas
  // evitan que una traducción futura introduzca el pasivo.
  // ---------------------------------------------------------------------------
  {
    id: "attesta-certifies-en",
    re: /\b(attesta|the platform)\b[^.!?\n]{0,40}\b(certifies|guarantees|approves|validates|audits|accredits)\b/gi,
    why: "Attesta does NOT certify/validate/audit. Reframe: 'your organization declares…', 'Attesta collects the declared evidence'.",
  },
  {
    id: "first-person-certify-en",
    re: /\bwe\s+(certify|guarantee|approve|validate|audit|accredit)\b/gi,
    why: "First-person certification verb. The verbs belong to the customer's ORGANIZATION, not to Attesta.",
  },
  {
    id: "by-attesta-en",
    re: /\b(certified|validated|audited|approved|verified)\s+by\s+(attesta|the platform)\b/gi,
    why: "Nothing is 'certified/validated/audited by Attesta'. Use 'evidence declared by your organization'.",
  },
  {
    id: "conformity-seal-en",
    re: /\b(certificate|certification|seal|badge)\s+of\s+(conformity|compliance)\b/gi,
    why: "Attesta issues no seals or certificates of conformity. Use 'audit readiness' or 'declared evidence'.",
  },
  {
    id: "compliance-score-en",
    re: /\b(compliance\s+(score|level|percentage|rate)|(\d{1,3}\s?%|percentage)\s*(of\s+)?compliance)\b/gi,
    why: "The score is '% ready' / 'readiness', NEVER a compliance percentage.",
  },
  {
    id: "compliance-assertion-en",
    re: /\b(you are compliant|you're compliant|fully compliant|100\s?%\s?compliant|are compliant|is compliant|compliant with (the|all))\b/gi,
    why: "We never assert the customer is compliant. Use 'identified gaps', 'declared evidence', 'readiness'.",
  },
  {
    id: "risk-free-en",
    re: /\b(risk[-\s]free|zero risk|eliminates? (the )?risk|legally protected)\b/gi,
    why: "We never promise absence of risk. Use 'reduces exposure by documenting the evidence'.",
  },
  {
    id: "legal-advice-en",
    re: /\blegal advice\b/gi,
    why: "Attesta gives no legal advice. If this is the disclaimer, keep the explicit negation ('does not constitute legal advice').",
  },
];

// ---------------------------------------------------------------------------
// AUTOPRUEBA. Un guard que no puede demostrar que funciona es falsa tranquilidad:
// si alguien debilita una regex (o la comenta), el escaneo seguiría en verde y
// nadie se enteraría. Estas muestras corren en memoria en CADA ejecución.
//   · MUST_CATCH  → copy prohibido real; si NO se detecta, el guard está roto.
//   · MUST_PASS   → copy legítimo del repo (descargos, encuadre deployer); si se
//                   detecta, el guard tiene falsos positivos y acabará ignorado.
// ---------------------------------------------------------------------------
// Cada muestra declara QUÉ REGLAS debe disparar. Comprobar solo "dispara alguna"
// sería insuficiente: como una frase activa varias reglas, romper una sola regex
// pasaría desapercibido. Además se exige COBERTURA: toda regla de PATTERNS debe
// estar esperada por al menos una muestra.
const MUST_CATCH = [
  {
    text: "Attesta certifica que tu organización cumple con el EU AI Act.",
    expect: ["attesta-certifica", "afirmacion-de-cumplimiento"],
  },
  {
    text: "Certificamos tu sistema y emitimos un certificado tras la revisión.",
    expect: ["primera-persona-certificamos", "emitir-certificado"],
  },
  {
    text: "Sistema validado por Attesta, con resultado libre de riesgo.",
    expect: ["validado-por-attesta", "libre-de-riesgo"],
  },
  {
    text: "Te entregamos nuestro sello de conformidad al terminar.",
    expect: ["sello-de-conformidad"],
  },
  {
    text: "Tu preparación alcanza un 92% de cumplimiento con nivel de cumplimiento alto.",
    expect: ["porcentaje-de-cumplimiento", "nivel-de-cumplimiento"],
  },
  {
    text: "Ya estás apto para auditoría del EU AI Act.",
    expect: ["apto-no-apto"],
  },
  {
    text: "La plataforma garantiza el cumplimiento normativo de tu empresa.",
    expect: ["garantiza-cumplimiento"],
  },
  {
    text: "Ofrecemos asesoría legal especializada junto al informe.",
    expect: ["asesoria-legal-sin-descargo"],
  },
  {
    text: "Attesta certifies your organization and guarantees the outcome.",
    expect: ["attesta-certifies-en"],
  },
  {
    text: "We certify your system after the review.",
    expect: ["first-person-certify-en"],
  },
  {
    text: "Your system was audited by Attesta last quarter.",
    expect: ["by-attesta-en"],
  },
  {
    text: "You receive a certificate of conformity at the end.",
    expect: ["conformity-seal-en"],
  },
  {
    text: "Your compliance score is 92% across all systems.",
    expect: ["compliance-score-en"],
  },
  {
    text: "Your deployment is fully compliant today.",
    expect: ["compliance-assertion-en"],
  },
  {
    text: "The outcome is risk-free for your company.",
    expect: ["risk-free-en"],
  },
  {
    text: "This report is legal advice prepared for you.",
    expect: ["legal-advice-en"],
  },
];
const MUST_PASS = [
  // Encuadre deployer: la obligación es del PROVEEDOR y se exige como evidencia.
  "Exige al proveedor el marcado CE y la Declaración UE de Conformidad, y conserva esa evidencia.",
  // Descargos obligatorios.
  "No es un certificado de conformidad ni constituye asesoría legal.",
  "Attesta NO certifica: es una herramienta de autoevaluación y preparación.",
  "El porcentaje de «preparación» no es un porcentaje de cumplimiento.",
  "Attesta NO realiza ni valida la auditoría de sesgo.",
  "It is not a certificate of conformity, a CE marking, or legal advice.",
  "Attesta does not certify compliance with any law or regulation.",
  // RGPD Art. 22: el objeto de "garantiza" es la intervención humana, no el cumplimiento.
  "Aplica el RGPD Art. 22: garantiza intervención humana real en la decisión.",
  // Una norma que se aprueba / un tercero que certifica.
  "Entró en vigor el 1 de enero de 2026 (aprobado por la Office of Administrative Law).",
  "La certificación, cuando procede, solo la emiten organismos notificados acreditados.",
  // Pregunta de FAQ cuya respuesta es "No".
  "¿Attesta certifica mi cumplimiento del EU AI Act?",
];

/** Aplica todas las reglas a un texto y devuelve los ids que disparan. */
function rulesHitBy(text) {
  const hits = [];
  for (const p of PATTERNS) {
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(text)) !== null) {
      const before = text.slice(Math.max(0, m.index - NEGATION_WINDOW), m.index);
      const negated = NEGATION_RE.test(before) || NEGATION_RE.test(m[0]);
      if (!negated && !before.includes("¿")) hits.push(p.id);
      if (m.index === p.re.lastIndex) p.re.lastIndex++;
    }
  }
  return hits;
}

const selfTestErrors = [];
for (const { text, expect } of MUST_CATCH) {
  const hits = new Set(rulesHitBy(text));
  const missing = expect.filter((id) => !hits.has(id));
  if (missing.length > 0) {
    selfTestErrors.push(
      `Regla(s) [${missing.join(", ")}] NO dispararon en: "${text}"`,
    );
  }
}
for (const sample of MUST_PASS) {
  const hits = rulesHitBy(sample);
  if (hits.length > 0) {
    selfTestErrors.push(`Falso positivo [${hits.join(", ")}] en: "${sample}"`);
  }
}
// Cobertura: ninguna regla puede quedar sin muestra que la ejercite, o podría
// romperse en silencio.
const covered = new Set(MUST_CATCH.flatMap((s) => s.expect));
const uncovered = PATTERNS.map((p) => p.id).filter((id) => !covered.has(id));
if (uncovered.length > 0) {
  selfTestErrors.push(
    `Reglas sin muestra en MUST_CATCH (podrían romperse sin avisar): ${uncovered.join(", ")}`,
  );
}
if (selfTestErrors.length > 0) {
  console.error(
    "\n✗ AUTOPRUEBA DEL GUARD FALLIDA — las reglas no se comportan como deben:\n",
  );
  for (const e of selfTestErrors) console.error(`  · ${e}`);
  console.error(
    "\n  Arregla los patrones antes de confiar en el escaneo (un guard roto da" +
      "\n  falsa tranquilidad: pasaría en verde con copy prohibido en el repo).\n",
  );
  process.exit(1);
}

/** Recorre recursivamente y devuelve los archivos con extensión relevante. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTENSIONS.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => {
  try {
    return walk(join(ROOT, d));
  } catch {
    return [];
  }
});

const violations = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  if (SKIP_FILES.includes(rel)) continue;

  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes(ALLOW_MARKER)) return;
    for (const p of PATTERNS) {
      p.re.lastIndex = 0;
      let m;
      while ((m = p.re.exec(line)) !== null) {
        const before = line.slice(Math.max(0, m.index - NEGATION_WINDOW), m.index);
        // La negación puede ir ANTES del match ("no es un certificado de
        // conformidad") o DENTRO de él ("Attesta NO ejecuta ni valida"), porque el
        // patrón abarca sujeto + verbo. Se comprueban ambos.
        const negated = NEGATION_RE.test(before) || NEGATION_RE.test(m[0]);
        // Pregunta de FAQ ("¿Attesta certifica…?", cuya respuesta es "No").
        const isQuestion = before.includes("¿");
        if (!negated && !isQuestion) {
          violations.push({
            file: rel,
            line: i + 1,
            rule: p.id,
            match: m[0].trim().slice(0, 90),
            why: p.why,
          });
        }
        if (m.index === p.re.lastIndex) p.re.lastIndex++; // guarda anti-bucle
      }
    }
  });
}

if (violations.length === 0) {
  console.log(
    `✓ Copy prohibido: sin infracciones (${files.length} archivos, ${PATTERNS.length} reglas).`,
  );
  process.exit(0);
}

console.error(
  `\n✗ COPY PROHIBIDO detectado: ${violations.length} infracción(es).\n` +
    `  Regla #1 de Attesta: NO certificamos. Un texto que insinúe certificación,\n` +
    `  conformidad garantizada o asesoría legal es un pasivo legal.\n`,
);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.rule}]`);
  console.error(`    → "${v.match}"`);
  console.error(`    ${v.why}\n`);
}
console.error(
  `  Si un match es un falso positivo justificado, añade "${ALLOW_MARKER}" en esa línea\n` +
    `  (con el motivo). Ejemplo: exigir el marcado CE AL PROVEEDOR es legítimo.\n`,
);
process.exit(1);
