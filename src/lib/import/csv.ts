/**
 * Importación de inventario por CSV — parte PURA (sin red, sin Supabase).
 *
 * Por qué existe: el alta de sistemas uno a uno es el muro de activación #1. Una
 * organización mid-market llega con 20-40 sistemas de IA ya en uso, normalmente en
 * una hoja de cálculo; teclearlos a mano no ocurre, y sin inventario el resto del
 * producto (riesgo, brechas, dossier) está vacío.
 *
 * Decisiones que parecen detalles y no lo son:
 *
 *  · **Delimitador autodetectado.** Excel en español exporta CSV con **`;`**, no
 *    con `,`. Es la causa nº 1 de "tu importador no funciona": el fichero entra
 *    como una sola columna. Se detecta contando separadores en la cabecera.
 *  · **Cabeceras en ES y EN, con alias.** El fichero del cliente dirá "Nombre",
 *    "Responsable" o "Proveedor", no `vendor`. Se normaliza sin acentos ni
 *    mayúsculas.
 *  · **Todo se valida por filas y se informa por filas.** Un CSV real trae
 *    basura; abortar el fichero entero por una fila mala obliga a jugar a
 *    adivinar. Se importa lo válido y se dice exactamente qué fila falló y por qué.
 *  · **`actorRole` por defecto `deployer`**: nuestro ICP es quien USA la IA. Si el
 *    cliente escribe "proveedor"/"provider" se respeta.
 */

/** Rol del actor tal y como lo guarda `ai_systems.actor_role`. */
export type ActorRole = "provider" | "deployer";

/** Fila válida, lista para insertar. */
export type ParsedSystem = {
  /** Nº de línea en el fichero (1 = cabecera), para poder señalar el error. */
  line: number;
  name: string;
  owner: string | null;
  domain: string | null;
  vendor: string | null;
  actorRole: ActorRole;
};

/** Motivo por el que una fila no se pudo importar. */
export type RowError = {
  line: number;
  /** Clave estable para traducir el motivo en la UI. */
  code:
    | "missing-name"
    | "name-too-long"
    | "duplicate-in-file"
    | "too-many-columns";
  /** Fragmento del texto original, recortado, para que se reconozca la fila. */
  sample: string;
};

export type ParseResult = {
  rows: ParsedSystem[];
  errors: RowError[];
  /** `null` si no se reconoció ninguna cabecera obligatoria. */
  headerFound: boolean;
  /** Delimitador detectado (informativo para la UI). */
  delimiter: "," | ";" | "\t";
  /** Filas descartadas por exceder el límite. */
  truncated: number;
};

/** Tope de filas por importación: acota el insert y el abuso. */
export const MAX_IMPORT_ROWS = 200;
/** `ai_systems.name` es la única columna obligatoria. */
export const MAX_NAME_LEN = 120;
const MAX_FIELD_LEN = 200;

/** Quita acentos y mayúsculas para comparar cabeceras. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

/**
 * Alias aceptados por columna (ES y EN). Se comparan normalizados, así que
 * "Ámbito" y "ambito" son lo mismo.
 */
const HEADER_ALIASES: Record<keyof Omit<ParsedSystem, "line">, string[]> = {
  name: ["nombre", "name", "sistema", "system", "herramienta", "tool"],
  owner: ["responsable", "owner", "dueno", "propietario", "area", "departamento"],
  domain: ["ambito", "domain", "dominio", "uso", "use case", "caso de uso"],
  vendor: ["proveedor", "vendor", "fabricante", "supplier"],
  actorRole: ["rol", "role", "actor", "actor role", "actor_role", "papel"],
};

const PROVIDER_WORDS = new Set(["provider", "proveedor", "fabricante", "supplier"]);

/**
 * Divide una línea de CSV respetando comillas dobles (y `""` como comilla
 * escapada). No usamos `split(delimiter)` porque un nombre legítimo como
 * `"Cribado de CV, versión 2"` rompería el fichero.
 */
export function splitCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      out.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out.map((f) => f.trim());
}

/**
 * Detecta el delimitador contando candidatos FUERA de comillas en la cabecera.
 * Gana el más frecuente; empate o ninguno → coma (el caso estándar).
 */
export function detectDelimiter(headerLine: string): "," | ";" | "\t" {
  const counts = { ",": 0, ";": 0, "\t": 0 };
  let inQuotes = false;
  for (const ch of headerLine) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes && (ch === "," || ch === ";" || ch === "\t")) counts[ch]++;
  }
  const best = (Object.entries(counts) as [",", number][]).sort(
    (a, b) => b[1] - a[1],
  )[0]!;
  return best[1] > 0 ? best[0] : ",";
}

/** Empareja cada columna de la cabecera con un campo conocido (o `null`). */
function mapHeader(
  cells: string[],
): (keyof Omit<ParsedSystem, "line"> | null)[] {
  return cells.map((raw) => {
    const key = norm(raw);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(key)) {
        return field as keyof Omit<ParsedSystem, "line">;
      }
    }
    return null;
  });
}

function clean(value: string | undefined): string | null {
  if (value === undefined) return null;
  const v = value.trim().slice(0, MAX_FIELD_LEN);
  return v ? v : null;
}

/**
 * Parsea el CSV completo. Nunca lanza: un fichero ilegible produce
 * `headerFound: false` y cero filas, que la UI explica.
 *
 * Si NO hay cabecera reconocible se asume el orden de la plantilla
 * (`nombre, responsable, ámbito, proveedor, rol`) y se trata la primera línea
 * como datos: quien exporta de su hoja suele borrar la cabecera.
 */
export function parseSystemsCsv(input: string): ParseResult {
  // Quita el BOM que añade Excel; si no, la primera cabecera nunca coincide.
  const text = input.replace(/^﻿/, "");
  const lines = text.split(/\r\n|\n|\r/);

  // Primera línea no vacía = candidata a cabecera.
  let headerIndex = lines.findIndex((l) => l.trim() !== "");
  if (headerIndex === -1) {
    return {
      rows: [],
      errors: [],
      headerFound: false,
      delimiter: ",",
      truncated: 0,
    };
  }

  const delimiter = detectDelimiter(lines[headerIndex]!);
  const headerCells = splitCsvLine(lines[headerIndex]!, delimiter);
  let mapping = mapHeader(headerCells);
  const headerFound = mapping.includes("name");

  if (!headerFound) {
    // Sin cabecera: orden de la plantilla y la primera línea ya son datos.
    mapping = ["name", "owner", "domain", "vendor", "actorRole"];
    headerIndex -= 1;
  }

  const rows: ParsedSystem[] = [];
  const errors: RowError[] = [];
  const seen = new Set<string>();
  let truncated = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const raw = lines[i]!;
    if (raw.trim() === "") continue;

    const line = i + 1; // 1-indexado, como lo ve el usuario en su editor
    const cells = splitCsvLine(raw, delimiter);
    const sample = raw.trim().slice(0, 80);

    if (cells.length > mapping.length + 5) {
      // Muchísimas más columnas que la cabecera: casi siempre delimitador mal
      // detectado o fichero equivocado. Mejor avisar que importar basura.
      errors.push({ line, code: "too-many-columns", sample });
      continue;
    }

    const get = (field: keyof Omit<ParsedSystem, "line">): string | undefined => {
      const idx = mapping.indexOf(field);
      return idx === -1 ? undefined : cells[idx];
    };

    const name = clean(get("name"));
    if (!name) {
      errors.push({ line, code: "missing-name", sample });
      continue;
    }
    if (name.length > MAX_NAME_LEN) {
      errors.push({ line, code: "name-too-long", sample });
      continue;
    }

    const dedupeKey = norm(name);
    if (seen.has(dedupeKey)) {
      errors.push({ line, code: "duplicate-in-file", sample });
      continue;
    }
    seen.add(dedupeKey);

    if (rows.length >= MAX_IMPORT_ROWS) {
      truncated++;
      continue;
    }

    const roleRaw = norm(get("actorRole") ?? "");
    rows.push({
      line,
      name,
      owner: clean(get("owner")),
      domain: clean(get("domain")),
      vendor: clean(get("vendor")),
      // Por defecto `deployer`: nuestro ICP es quien USA la IA, no quien la fabrica.
      actorRole: PROVIDER_WORDS.has(roleRaw) ? "provider" : "deployer",
    });
  }

  return { rows, errors, headerFound, delimiter, truncated };
}

/** Plantilla de ejemplo que se ofrece para descargar. */
export const CSV_TEMPLATE_ES = `nombre,responsable,ambito,proveedor,rol
Cribado de CV,RRHH,Contratación,HireFlow,deployer
Chatbot de atención,Soporte,Atención al cliente,OpenAI,deployer
`;

export const CSV_TEMPLATE_EN = `name,owner,domain,vendor,role
CV screening,HR,Recruitment,HireFlow,deployer
Support chatbot,Support,Customer service,OpenAI,deployer
`;
