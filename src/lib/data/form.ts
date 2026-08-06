/**
 * Lectura y validación de los `FormData` que llegan a las Server Actions.
 *
 * POR QUÉ EXISTE, Y POR QUÉ NO ES ZOD. Una auditoría apuntó "validación
 * artesanal: enums sin whitelist, sin límites de longitud". Revisado sobre el
 * código, la mitad ya no era cierta —los enums se comprueban contra su catálogo
 * en todas las acciones— y la otra mitad lo era del todo: **ningún campo de
 * texto tenía tope**. Un miembro autenticado (o una cuenta comprometida) podía
 * meter megabytes en la nota de un proveedor o en el título de una tarea:
 * Postgres los acepta encantado, la factura sube y la pantalla que los pinta
 * revienta. Y el problema estructural era otro más: los ayudantes (`uuid`,
 * `date`, `text`, `on`) estaban **copiados en cuatro ficheros**, así que
 * arreglar uno no arreglaba los demás.
 *
 * Se resuelve con este módulo en vez de con una librería de esquemas porque lo
 * que hacía falta era **un solo sitio con topes**, no un lenguaje de validación:
 * las acciones no devuelven errores por campo (redirigen con un toast), así que
 * el valor de los mensajes ricos de un validador aquí es cero, y el proyecto
 * tiene seis dependencias directas a propósito. Si algún día hace falta devolver
 * errores por campo al formulario, ese es el momento de reconsiderarlo.
 *
 * REGLA DE DISEÑO: **truncar, no rechazar.** Un texto largo de más casi siempre
 * es alguien pegando de un documento, no un ataque; abortar y perderle lo escrito
 * sería castigarle por un fallo nuestro de UI. En cambio un uuid, una fecha o un
 * enum mal formados **sí** se rechazan (`null`): ahí no hay nada que salvar y
 * adivinar sería inventarse un dato. Los topes son deliberadamente generosos —
 * están para acotar el abuso, no para dar forma al contenido.
 */

/** Un nombre, un responsable, un proveedor: una línea. */
export const MAX_NAME = 200;
/** Cita de un artículo, versión de un documento, referencia corta. */
export const MAX_REF = 300;
/** Una URL. Por encima de esto no es una URL, es una carga útil. */
export const MAX_URL = 2000;
/** Nota o comentario libre: varios párrafos caben de sobra. */
export const MAX_NOTE = 5000;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Value = FormDataEntryValue | null | undefined;

/** El valor como cadena recortada, sin tope. Uso interno. */
function raw(v: Value): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Texto libre acotado, o `null` si queda vacío. Es el ayudante que faltaba: todo
 * lo que se escriba en la base de datos desde un formulario pasa por aquí.
 */
export function text(v: Value, max = MAX_NAME): string | null {
  return raw(v).slice(0, max) || null;
}

/** Texto obligatorio acotado: `null` si no hay nada que guardar. */
export function requiredText(v: Value, max = MAX_NAME): string | null {
  return text(v, max);
}

/** uuid válido, o `null`. Se rechaza, no se arregla. */
export function uuid(v: Value): string | null {
  const s = raw(v);
  return UUID_RE.test(s) ? s : null;
}

/**
 * Fecha `YYYY-MM-DD`, o `null`.
 *
 * Comprueba el formato **y** que exista en el calendario: `2026-02-31` encaja en
 * la expresión regular y Postgres la rechazaría con un error feo a mitad de una
 * escritura, en vez de tratarse como lo que es, un campo mal rellenado.
 */
export function date(v: Value): string | null {
  const s = raw(v);
  if (!DATE_RE.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  // `new Date("2026-02-31")` no falla: se desborda a marzo. Se compara el
  // resultado con la entrada para cazar justamente eso.
  return d.toISOString().slice(0, 10) === s ? s : null;
}

/** Casilla de formulario. El navegador manda `"on"`; el cliente puede mandar `"true"`. */
export function bool(v: Value): boolean {
  const s = raw(v);
  return s === "on" || s === "true";
}

/**
 * Valor de un catálogo cerrado, o el de reserva. Los catálogos viven en el
 * código (tipos y tests), no aquí: este ayudante solo los aplica.
 */
export function pick<T extends string>(
  v: Value,
  allowed: readonly T[],
  fallback: T,
): T {
  const s = raw(v);
  return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
}

/** Igual que `pick`, pero sin valor de reserva: fuera del catálogo ⇒ `null`. */
export function pickStrict<T extends string>(
  v: Value,
  allowed: readonly T[],
): T | null {
  const s = raw(v);
  return (allowed as readonly string[]).includes(s) ? (s as T) : null;
}

/**
 * URL acotada, o `null`.
 *
 * Solo `http`/`https`: estos valores acaban en un `href` de la interfaz y de los
 * PDF, y un `javascript:` ahí es un XSS almacenado con la firma de la propia
 * organización. Se rechaza en vez de recortar el esquema, porque una URL con un
 * esquema que no esperamos no es una URL que quisiéramos abrir.
 *
 * Y por lo largo tampoco se trunca, a diferencia del texto libre: media URL no
 * es una URL corta, es una URL **a otro sitio** (o a ninguno). Guardar eso sería
 * peor que no guardar nada, porque parece un enlace bueno hasta que alguien lo
 * pulsa desde un expediente.
 */
export function url(v: Value): string | null {
  const s = raw(v);
  if (!s || s.length > MAX_URL) return null;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:" ? s : null;
  } catch {
    return null;
  }
}

/** Entero dentro de un rango, o `null`. */
export function int(v: Value, min: number, max: number): number | null {
  const s = raw(v);
  if (!/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  return n >= min && n <= max ? n : null;
}
