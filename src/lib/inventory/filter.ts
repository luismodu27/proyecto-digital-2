/**
 * Búsqueda, filtro y orden del inventario. Lógica PURA y testeada aparte de la
 * página, por el mismo motivo que el parser de CSV: es donde de verdad se rompe
 * "tu buscador no funciona", y un componente no se puede probar en <1 s.
 *
 * El estado vive en la URL (`?q=&risk=&evidence=&sort=&dir=`) y no en el
 * cliente. Así el enlace es compartible ("mándame los de alto riesgo sin
 * clasificar"), el botón «atrás» hace lo que uno espera, y la tabla sigue
 * funcionando sin JavaScript — la barra es un `<form method="GET">` y los chips
 * son enlaces. Es también lo que permite que las tarjetas del resumen apunten a
 * un inventario ya filtrado.
 *
 * Se filtra en memoria, sobre la lista completa que ya devuelve `getAiSystems()`,
 * y no en Postgres: los topes de plan son 3 / 25 / pactado, así que hablamos de
 * decenas de filas y no de miles. Bajarlo a la consulta duplicaría la lógica en
 * los dos repos (mock y supabase) a cambio de nada medible. Si algún día un
 * Enterprise pasa de unos cientos de sistemas, este es el sitio por donde
 * empezar a mirar.
 */
import { RISK_ORDER, type AiSystem, type EvidenceState, type RiskLevel } from "@/lib/mock-data";

/** Columnas por las que se puede ordenar. */
export type SortKey = "name" | "risk" | "readiness" | "reviewed";
export type SortDir = "asc" | "desc";

/** `none` = sistemas todavía sin autoevaluación (segmento accionable). */
export type EvidenceFilter = EvidenceState | "none";

export type InventoryQuery = {
  q: string;
  risk: RiskLevel | null;
  evidence: EvidenceFilter | null;
  sort: SortKey;
  dir: SortDir;
};

/**
 * Orden por defecto: riesgo, del más severo al menos. Es la prioridad del
 * producto —lo inaceptable y lo de alto riesgo es lo que hay que mirar primero—
 * y no el orden en que se dieron de alta los sistemas, que no significa nada.
 */
export const DEFAULT_QUERY: InventoryQuery = {
  q: "",
  risk: null,
  evidence: null,
  sort: "risk",
  dir: "desc",
};

const SORT_KEYS: SortKey[] = ["name", "risk", "readiness", "reviewed"];
const EVIDENCE_VALUES: EvidenceFilter[] = [
  "declared",
  "evidenced",
  "reviewed",
  "none",
];

/** Dirección natural de cada columna al pulsarla por primera vez. */
export const DEFAULT_DIR: Record<SortKey, SortDir> = {
  // Alfabético ascendente es lo que se espera de un nombre…
  name: "asc",
  // …pero en riesgo, preparación y fecha lo interesante está en el extremo
  // alto: lo más grave, lo menos preparado y lo revisado más recientemente.
  risk: "desc",
  readiness: "asc",
  reviewed: "desc",
};

/**
 * Normaliza para comparar: minúsculas y SIN diacríticos. Es la mitad del
 * buscador que la gente nota cuando falta — en un inventario español, teclear
 * "seleccion" y no encontrar "Selección" se lee como que la búsqueda está rota.
 */
function fold(value: string): string {
  return value
    .normalize("NFD")
    // Rango de marcas diacríticas combinantes, escrito con escapes y no con los
    // caracteres literales: en el editor serían invisibles y el siguiente que
    // pase por aquí no sabría qué hay entre los corchetes.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Lee la query de los `searchParams`. Tolerante a basura A PROPÓSITO: un valor
 * desconocido se ignora y equivale a "sin filtro", nunca a "cero resultados".
 * Un marcador viejo con `?risk=alto` (un enum que ya no existe) debe enseñar el
 * inventario entero, no una pantalla vacía que parece pérdida de datos.
 */
export function parseInventoryQuery(
  params: Record<string, string | string[] | undefined>,
): InventoryQuery {
  const one = (key: string): string => {
    const raw = params[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return typeof value === "string" ? value.trim() : "";
  };

  const risk = one("risk") as RiskLevel;
  const evidence = one("evidence") as EvidenceFilter;
  const sort = one("sort") as SortKey;
  const dir = one("dir");

  const sortKey = SORT_KEYS.includes(sort) ? sort : DEFAULT_QUERY.sort;
  return {
    // Se acota la longitud: la caja de búsqueda no es un canal para meter
    // kilobytes en la URL, y un `q` gigante solo sirve para hacer trabajar al
    // servidor.
    q: one("q").slice(0, 120),
    risk: RISK_ORDER.includes(risk) ? risk : null,
    evidence: EVIDENCE_VALUES.includes(evidence) ? evidence : null,
    sort: sortKey,
    // Una `dir` inválida cae a la dirección natural de esa columna, no a "asc"
    // a secas: pulsar «Riesgo» tiene que empezar por lo más grave.
    dir: dir === "asc" || dir === "desc" ? dir : DEFAULT_DIR[sortKey],
  };
}

/** ¿Hay algún filtro activo? (para ofrecer «quitar filtros» y no antes). */
export function hasActiveFilters(query: InventoryQuery): boolean {
  return query.q !== "" || query.risk !== null || query.evidence !== null;
}

/**
 * Campos por los que se busca: exactamente los que la fila enseña. Buscar por
 * algo que no está a la vista desconcierta ("¿por qué sale este?").
 */
function haystack(s: AiSystem): string {
  return fold([s.name, s.id, s.owner, s.domain, s.vendor].join(" "));
}

/**
 * Los términos se combinan con Y, no como una subcadena única: "cribado ats"
 * encuentra "Cribado de CVs — ATS", que es lo que la gente teclea. Buscar la
 * frase literal no lo encontraría y parecería un fallo.
 */
function matchesText(s: AiSystem, q: string): boolean {
  const terms = fold(q).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const hay = haystack(s);
  return terms.every((term) => hay.includes(term));
}

function matchesEvidence(s: AiSystem, filter: EvidenceFilter): boolean {
  return filter === "none" ? !s.evidenceState : s.evidenceState === filter;
}

/** Índice en `RISK_ORDER`: 0 = inaceptable … 3 = mínimo. */
function riskRank(level: RiskLevel): number {
  return RISK_ORDER.indexOf(level);
}

/**
 * Filtra y ordena. Devuelve SIEMPRE un array nuevo (no reordena el de entrada,
 * que en modo demo es el módulo compartido `AI_SYSTEMS` y se corrompería para
 * el resto de páginas).
 */
export function filterSystems(
  systems: AiSystem[],
  query: InventoryQuery,
): AiSystem[] {
  const rows = systems.filter(
    (s) =>
      matchesText(s, query.q) &&
      (query.risk === null || s.risk === query.risk) &&
      (query.evidence === null || matchesEvidence(s, query.evidence)),
  );

  const sign = query.dir === "asc" ? 1 : -1;
  return rows.sort((a, b) => {
    let cmp = 0;
    switch (query.sort) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "risk":
        // Por el orden regulatorio (`RISK_ORDER`), no alfabético: "alto" antes
        // que "limitado" porque es más grave, no porque empiece por A. `desc`
        // enseña primero lo más severo, así que se invierte el índice.
        cmp = riskRank(b.risk) - riskRank(a.risk);
        break;
      case "readiness":
        cmp = a.compliance - b.compliance;
        break;
      case "reviewed":
        cmp = a.lastReviewed.localeCompare(b.lastReviewed);
        break;
    }
    // Desempate estable por nombre: sin esto, dos sistemas del mismo riesgo
    // pueden bailar de posición entre renders y la tabla parece inquieta.
    return cmp !== 0 ? cmp * sign : a.name.localeCompare(b.name);
  });
}

/**
 * Construye el `href` del inventario aplicando un parche sobre la query actual.
 * `null` borra el parámetro. Se omiten los valores por defecto para que la URL
 * de "sin filtros" sea `/dashboard/inventario` a secas y no una ristra de
 * parámetros redundantes.
 */
export function buildInventoryHref(
  query: InventoryQuery,
  patch: Partial<InventoryQuery> = {},
  basePath = "/dashboard/inventario",
): string {
  const next: InventoryQuery = { ...query, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.risk) params.set("risk", next.risk);
  if (next.evidence) params.set("evidence", next.evidence);
  if (next.sort !== DEFAULT_QUERY.sort) params.set("sort", next.sort);
  if (next.dir !== DEFAULT_DIR[next.sort]) params.set("dir", next.dir);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * `href` para la cabecera de una columna: si ya se ordena por ella, invierte la
 * dirección; si no, entra por su dirección natural.
 */
export function sortHref(query: InventoryQuery, key: SortKey): string {
  const dir: SortDir =
    query.sort === key
      ? query.dir === "asc"
        ? "desc"
        : "asc"
      : DEFAULT_DIR[key];
  return buildInventoryHref(query, { sort: key, dir });
}
