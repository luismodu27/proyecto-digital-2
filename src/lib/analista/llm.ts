/**
 * El Analista (LLM, compatible con OpenAI) — server-only.
 *
 * Toma la señal de cambio + los fragmentos de norma recuperados por RAG y
 * PROPONE un borrador de evento regulatorio, anclado a citas reales. Salida
 * forzada por function calling (JSON estructurado). Nada se publica: el humano
 * valida.
 *
 * Proveedor agnóstico (NVIDIA NIM por defecto, gratis; Groq/OpenRouter vía env).
 * Grounding estricto: la única fuente legal son los chunks; cita-o-abstención;
 * reencuadre deployer-vs-provider + filtro determinista de copy prohibido.
 */

import {
  ANALISTA_BASE_URL,
  ANALISTA_MODEL,
  isLlmConfigured,
} from "./config";
import { EU_AI_ACT_FRAMING_NOTES } from "./corpus/eu-ai-act";

/** Copy PROHIBIDO en textos de Attesta (CLAUDE.md). Nunca debe aparecer. */
const PROHIBITED_COPY = [
  "certifica",
  "certificado",
  "aprobado",
  " apto",
  "cumple",
  "compliant",
  "garantiza",
  "sello de conformidad",
  "marcado ce",
  "validado por attesta",
  "auditado por attesta",
  "libre de riesgo",
  "asesoría legal",
  "asesoria legal",
];

export type RetrievedChunk = {
  id: string;
  doc_ref: string;
  title: string | null;
  content: string;
  source_url: string | null;
  similarity: number;
};

export type DraftCitation = {
  chunk_id: string;
  doc_ref: string;
  quote: string;
};

export type AnalistaDraft = {
  event_date: string | null;
  kind: string | null;
  summary: string;
  impact: string;
  action: string;
  articles: string[];
  scope: { all?: boolean; riskLevels?: string[] };
  proposed_event_id: string | null;
  confidence: number;
  citations: DraftCitation[];
  supported: boolean;
  insufficient_evidence: boolean;
  insufficient_reason?: string | null;
};

export type AnalistaSignal = {
  framework: string;
  sourceLabel: string;
  sourceUrl: string | null;
  content: string;
};

const RISK_LEVELS = ["unacceptable", "high", "limited", "minimal"] as const;
const KINDS = ["deadline", "guidance", "standard", "amendment", "enforcement"] as const;

/**
 * Función forzada (OpenAI-compatible). Campos anulables van como string vacío
 * para máxima compatibilidad entre proveedores; se mapean a null en código.
 */
const PROPOSE_FN = {
  type: "function",
  function: {
    name: "propose_reg_event",
    description:
      "Propón un borrador de evento regulatorio para el radar de Attesta, anclado en los fragmentos de norma provistos.",
    parameters: {
      type: "object",
      properties: {
        event_date: { type: "string", description: "Fecha YYYY-MM-DD, o cadena vacía si no se puede fijar con soporte." },
        kind: { type: "string", enum: [...KINDS, ""], description: "Tipo de evento, o vacío si no está claro." },
        summary: { type: "string", description: "Qué es (español, ≤ 60 palabras)." },
        impact: { type: "string", description: "Qué significa para un DEPLOYER mid-market de RRHH (español)." },
        action: { type: "string", description: "Acción concreta (español)." },
        articles: { type: "array", items: { type: "string" }, description: "Referencias LIMPIAS de artículo (p. ej. 'Art. 26.11', 'Anexo III.4'). SIN corchetes, números de lista ni títulos." },
        scope_all: { type: "boolean", description: "true si afecta a toda la organización." },
        scope_risk_levels: { type: "array", items: { type: "string", enum: [...RISK_LEVELS] }, description: "Niveles de riesgo afectados." },
        proposed_event_id: { type: "string", description: "Id sugerido (kebab-case) o vacío." },
        confidence: { type: "number", description: "Confianza 0..1." },
        citations: {
          type: "array",
          description: "Cada afirmación legal respaldada por un fragmento provisto.",
          items: {
            type: "object",
            properties: {
              doc_ref: { type: "string" },
              quote: { type: "string" },
            },
            required: ["doc_ref", "quote"],
          },
        },
        supported: { type: "boolean", description: "true si TODO el borrador está respaldado por los fragmentos." },
        insufficient_evidence: { type: "boolean", description: "true si no hay soporte suficiente." },
        insufficient_reason: { type: "string", description: "Motivo si insufficient_evidence, o vacío." },
      },
      required: [
        "event_date", "kind", "summary", "impact", "action", "articles",
        "scope_all", "scope_risk_levels", "proposed_event_id", "confidence",
        "citations", "supported", "insufficient_evidence", "insufficient_reason",
      ],
    },
  },
} as const;

function systemPrompt(): string {
  return [
    "Eres el «Analista» de Attesta, un SaaS de compliance de IA para el mid-market cuyo ICP es el DEPLOYER (quien usa la IA), no el provider.",
    "Tu tarea: a partir del contenido de una fuente regulatoria que cambió y de FRAGMENTOS DE NORMA recuperados, PROPONES un borrador de evento para el radar. Un humano validará antes de publicar.",
    "",
    "REGLAS DE GROUNDING (inviolables):",
    "- Los FRAGMENTOS provistos son tu ÚNICA fuente legal. Prohibido usar tu memoria del articulado.",
    "- Toda afirmación sobre un artículo debe llevar una cita (doc_ref + quote textual) a un fragmento provisto.",
    "- Si no hay fragmento que respalde una fecha, artículo o afirmación, NO la inventes: insufficient_evidence=true, supported=false, confidence bajo.",
    "- Un texto legal alucinado es un pasivo. Ante la duda, abstente.",
    "",
    "ENCUADRE deployer-vs-provider:",
    EU_AI_ACT_FRAMING_NOTES,
    "",
    "REGLAS DE COPY (Attesta NO certifica):",
    "- PROHIBIDO: certifica, certificado, aprobado, apto, cumple/compliant, garantiza, sello de conformidad, marcado CE, validado/auditado por Attesta, libre de riesgo, asesoría legal.",
    "- Usa: orientativo, preparación para auditoría, obligaciones aplicables (orientativo). Los verbos son de la organización.",
    "- summary/impact/action en ESPAÑOL, para un responsable de RRHH/Legal mid-market.",
    "- El cliente es el DEPLOYER (usa la IA). NUNCA lo llames 'proveedor/provider' ni digas que 'fabrica/desarrolla/diseña' el sistema; las obligaciones del proveedor se reencuadran como 'exige/conserva evidencia del proveedor'.",
    "- En `articles` pon SOLO la referencia (p. ej. 'Art. 26.11'), sin corchetes, números ni títulos.",
    "",
    "Responde ÚNICAMENTE llamando a la función propose_reg_event.",
  ].join("\n");
}

function userPrompt(signal: AnalistaSignal, chunks: RetrievedChunk[]): string {
  const frags = chunks
    .map((c, i) => `[${i + 1}] doc_ref: ${c.doc_ref}${c.title ? ` — ${c.title}` : ""}\n${c.content}`)
    .join("\n\n");
  return [
    `FUENTE QUE CAMBIÓ: ${signal.sourceLabel}${signal.sourceUrl ? ` (${signal.sourceUrl})` : ""}`,
    `MARCO: ${signal.framework}`,
    "",
    "CONTENIDO NUEVO DE LA FUENTE (puede traer ruido de navegación; céntrate en lo regulatorio):",
    signal.content.slice(0, 12000),
    "",
    "FRAGMENTOS DE NORMA RECUPERADOS (tu única fuente legal):",
    frags || "(ninguno — probablemente insufficient_evidence)",
  ].join("\n");
}

function hasProhibitedCopy(d: {
  summary: string; impact: string; action: string; articles: string[];
}): boolean {
  const hay = ` ${[d.summary, d.impact, d.action, ...d.articles].join("  ")} `.toLowerCase();
  return PROHIBITED_COPY.some((t) => hay.includes(t));
}

type FnArgs = {
  event_date?: string; kind?: string; summary?: string; impact?: string;
  action?: string; articles?: string[]; scope_all?: boolean;
  scope_risk_levels?: string[]; proposed_event_id?: string; confidence?: number;
  citations?: { doc_ref: string; quote: string }[]; supported?: boolean;
  insufficient_evidence?: boolean; insufficient_reason?: string;
};

const INSUFFICIENT = (reason: string): AnalistaDraft => ({
  event_date: null, kind: null, summary: "", impact: "", action: "",
  articles: [], scope: {}, proposed_event_id: null, confidence: 0,
  citations: [], supported: false, insufficient_evidence: true,
  insufficient_reason: reason,
});

/**
 * Redacta un borrador grounded a partir de la señal y los fragmentos.
 * Devuelve `null` si no está configurado; un draft insufficient si el modelo
 * no respalda o emite copy prohibido.
 */
export async function draft(
  signal: AnalistaSignal,
  chunks: RetrievedChunk[],
): Promise<AnalistaDraft | null> {
  if (!isLlmConfigured) return null;

  const res = await fetch(`${ANALISTA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.ANALISTA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ANALISTA_MODEL,
      temperature: 0.2,
      max_tokens: 1600,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt(signal, chunks) },
      ],
      tools: [PROPOSE_FN],
      tool_choice: { type: "function", function: { name: "propose_reg_event" } },
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
  };
  const argStr = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!argStr) return null;

  let t: FnArgs;
  try {
    t = JSON.parse(argStr) as FnArgs;
  } catch {
    return INSUFFICIENT("respuesta del modelo no parseable");
  }

  const summary = t.summary ?? "";
  const impact = t.impact ?? "";
  const action = t.action ?? "";
  const articles = t.articles ?? [];

  if (hasProhibitedCopy({ summary, impact, action, articles })) {
    return INSUFFICIENT("El borrador contenía copy prohibido; descartado por seguridad.");
  }

  const byRef = new Map(chunks.map((c) => [c.doc_ref, c.id]));
  const citations: DraftCitation[] = (t.citations ?? [])
    .filter((c) => byRef.has(c.doc_ref)) // descarta citas a fragmentos inexistentes
    .map((c) => ({ chunk_id: byRef.get(c.doc_ref) as string, doc_ref: c.doc_ref, quote: c.quote }));

  const scope = t.scope_all
    ? { all: true }
    : t.scope_risk_levels?.length
      ? { riskLevels: t.scope_risk_levels }
      : {};

  return {
    event_date: t.event_date ? t.event_date : null,
    kind: t.kind ? t.kind : null,
    summary, impact, action, articles, scope,
    proposed_event_id: t.proposed_event_id ? t.proposed_event_id : null,
    confidence: typeof t.confidence === "number" ? t.confidence : 0,
    citations,
    supported: Boolean(t.supported),
    insufficient_evidence: Boolean(t.insufficient_evidence),
    insufficient_reason: t.insufficient_reason || null,
  };
}
