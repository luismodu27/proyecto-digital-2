/**
 * El Analista (Claude) — server-only.
 *
 * Toma la señal de cambio + los fragmentos de norma recuperados por RAG y
 * PROPONE un borrador de evento regulatorio, anclado a citas reales. Salida
 * forzada por tool use (JSON estructurado). Nada se publica: el humano valida.
 *
 * Grounding estricto: la única fuente legal permitida son los chunks; toda
 * afirmación sobre un artículo lleva cita; sin soporte → insufficient_evidence.
 * Reencuadre deployer-vs-provider + filtro determinista de copy prohibido.
 */

import { ANALISTA_MODEL, isAnthropicConfigured } from "./config";
import { EU_AI_ACT_FRAMING_NOTES } from "./corpus/eu-ai-act";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

/** Copy PROHIBIDO en textos de Attesta (CLAUDE.md). Nunca debe aparecer. */
const PROHIBITED_COPY = [
  "certifica",
  "certificado",
  "aprobado",
  "apto",
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

/** Herramienta que fuerza la salida estructurada (calca reg_candidates). */
const PROPOSE_TOOL = {
  name: "propose_reg_event",
  description:
    "Propón un borrador de evento regulatorio para el radar de Attesta, anclado en los fragmentos de norma provistos.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      event_date: {
        type: ["string", "null"],
        description: "Fecha del evento (YYYY-MM-DD) o null si no se puede fijar con soporte.",
      },
      kind: {
        type: ["string", "null"],
        enum: [...KINDS, null],
        description: "Tipo de evento, o null si no está claro.",
      },
      summary: { type: "string", description: "Qué es (en español, ≤ 60 palabras)." },
      impact: {
        type: "string",
        description: "Qué significa para un DEPLOYER mid-market de RRHH (en español).",
      },
      action: { type: "string", description: "Qué hacer, acción concreta (en español)." },
      articles: {
        type: "array",
        items: { type: "string" },
        description: "Artículos citados (p. ej. 'Art. 26').",
      },
      scope_all: {
        type: "boolean",
        description: "true si afecta a toda la organización con independencia del inventario.",
      },
      scope_risk_levels: {
        type: "array",
        items: { type: "string", enum: [...RISK_LEVELS] },
        description: "Niveles de riesgo afectados (si no es scope_all).",
      },
      proposed_event_id: {
        type: ["string", "null"],
        description: "Id sugerido del evento (kebab-case) o null.",
      },
      confidence: { type: "number", description: "Confianza 0..1 en el borrador." },
      citations: {
        type: "array",
        description: "Citas: cada afirmación legal respaldada por un fragmento provisto.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            doc_ref: { type: "string", description: "doc_ref del fragmento citado." },
            quote: { type: "string", description: "Cita textual del fragmento." },
          },
          required: ["doc_ref", "quote"],
        },
      },
      supported: {
        type: "boolean",
        description: "true si TODO el borrador está respaldado por los fragmentos provistos.",
      },
      insufficient_evidence: {
        type: "boolean",
        description: "true si no hay soporte suficiente para redactar sin inventar.",
      },
      insufficient_reason: {
        type: ["string", "null"],
        description: "Motivo si insufficient_evidence es true.",
      },
    },
    required: [
      "event_date",
      "kind",
      "summary",
      "impact",
      "action",
      "articles",
      "scope_all",
      "scope_risk_levels",
      "proposed_event_id",
      "confidence",
      "citations",
      "supported",
      "insufficient_evidence",
      "insufficient_reason",
    ],
  },
  strict: true,
} as const;

function systemPrompt(): string {
  return [
    "Eres el «Analista» de Attesta, un SaaS de compliance de IA para el mid-market cuyo ICP es el DEPLOYER (quien usa la IA), no el provider.",
    "Tu tarea: a partir del contenido de una fuente regulatoria que cambió y de FRAGMENTOS DE NORMA recuperados, PROPONES un borrador de evento para el radar. Un humano validará antes de publicar.",
    "",
    "REGLAS DE GROUNDING (inviolables):",
    "- Los FRAGMENTOS provistos son tu ÚNICA fuente legal. Prohibido usar tu memoria del articulado.",
    "- Toda afirmación sobre un artículo debe llevar una cita (doc_ref + quote textual) a un fragmento provisto.",
    "- Si no hay fragmento que respalde una fecha, artículo o afirmación, NO la inventes: pon insufficient_evidence=true, supported=false y confidence bajo.",
    "- Un texto legal alucinado es un pasivo. Ante la duda, abstente.",
    "",
    "ENCARGO DE ENCUADRE (deployer-vs-provider):",
    EU_AI_ACT_FRAMING_NOTES,
    "",
    "REGLAS DE COPY (Attesta NO certifica):",
    "- PROHIBIDO: certifica, certificado, aprobado, apto, cumple/compliant, garantiza, sello de conformidad, marcado CE, validado/auditado por Attesta, libre de riesgo, asesoría legal.",
    "- Usa: orientativo, preparación para auditoría, obligaciones aplicables (orientativo), clasificación orientativa. Los verbos son de la organización.",
    "- summary/impact/action en ESPAÑOL. Redacta para un responsable de RRHH/Legal mid-market.",
    "",
    "Llama SIEMPRE a la herramienta propose_reg_event con tu propuesta.",
  ].join("\n");
}

function userPrompt(signal: AnalistaSignal, chunks: RetrievedChunk[]): string {
  const frags = chunks
    .map(
      (c, i) =>
        `[${i + 1}] doc_ref: ${c.doc_ref}${c.title ? ` — ${c.title}` : ""}\n${c.content}`,
    )
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

/** ¿El texto contiene copy prohibido? (whole-ish, case-insensitive). */
function hasProhibitedCopy(draft: {
  summary: string;
  impact: string;
  action: string;
  articles: string[];
}): boolean {
  const hay = [draft.summary, draft.impact, draft.action, ...draft.articles]
    .join("  ")
    .toLowerCase();
  return PROHIBITED_COPY.some((t) => hay.includes(t));
}

type ToolInput = {
  event_date: string | null;
  kind: string | null;
  summary: string;
  impact: string;
  action: string;
  articles: string[];
  scope_all: boolean;
  scope_risk_levels: string[];
  proposed_event_id: string | null;
  confidence: number;
  citations: { doc_ref: string; quote: string }[];
  supported: boolean;
  insufficient_evidence: boolean;
  insufficient_reason: string | null;
};

/**
 * Redacta un borrador grounded a partir de la señal y los fragmentos.
 * Devuelve `null` si no está configurado o la API rechaza/rehúsa.
 */
export async function draft(
  signal: AnalistaSignal,
  chunks: RetrievedChunk[],
): Promise<AnalistaDraft | null> {
  if (!isAnthropicConfigured) return null;

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANALISTA_MODEL,
      max_tokens: 2048,
      thinking: { type: "disabled" },
      system: systemPrompt(),
      tools: [PROPOSE_TOOL],
      tool_choice: { type: "tool", name: "propose_reg_event" },
      messages: [{ role: "user", content: userPrompt(signal, chunks) }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    stop_reason?: string;
    content?: { type: string; name?: string; input?: unknown }[];
  };

  if (json.stop_reason === "refusal") return null;

  const toolUse = (json.content ?? []).find(
    (b) => b.type === "tool_use" && b.name === "propose_reg_event",
  );
  if (!toolUse?.input) return null;
  const t = toolUse.input as ToolInput;

  // Filtro determinista de copy prohibido: si aparece, no enriquecemos.
  if (hasProhibitedCopy(t)) {
    return {
      event_date: null,
      kind: null,
      summary: "",
      impact: "",
      action: "",
      articles: [],
      scope: {},
      proposed_event_id: null,
      confidence: 0,
      citations: [],
      supported: false,
      insufficient_evidence: true,
      insufficient_reason: "El borrador contenía copy prohibido; descartado por seguridad.",
    };
  }

  // Resolver chunk_id por doc_ref (las citas del modelo traen doc_ref + quote).
  const byRef = new Map(chunks.map((c) => [c.doc_ref, c.id]));
  const citations: DraftCitation[] = (t.citations ?? []).map((c) => ({
    chunk_id: byRef.get(c.doc_ref) ?? "",
    doc_ref: c.doc_ref,
    quote: c.quote,
  }));

  const scope = t.scope_all
    ? { all: true }
    : t.scope_risk_levels?.length
      ? { riskLevels: t.scope_risk_levels }
      : {};

  return {
    event_date: t.event_date,
    kind: t.kind,
    summary: t.summary,
    impact: t.impact,
    action: t.action,
    articles: t.articles ?? [],
    scope,
    proposed_event_id: t.proposed_event_id,
    confidence: typeof t.confidence === "number" ? t.confidence : 0,
    citations,
    supported: Boolean(t.supported),
    insufficient_evidence: Boolean(t.insufficient_evidence),
    insufficient_reason: t.insufficient_reason,
  };
}
