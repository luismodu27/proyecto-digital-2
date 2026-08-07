import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * ¿HAY ALGUNA FUNCIÓN DE LA BASE DE DATOS SIN CERRAR?
 *
 * ============================================================================
 * POR QUÉ EXISTE ESTE GUARD, que es la parte que de verdad importa
 * ============================================================================
 *
 * En PostgreSQL, cada función nueva nace con `EXECUTE` concedido a **PUBLIC**.
 * En Supabase, `anon` hereda ese permiso. Por lo tanto:
 *
 *     revoke all on function f(args) from anon;        -- NO HACE NADA
 *     revoke all on function f(args) from public;      -- esto sí
 *
 * La migración 0028 descubrió esto, lo documentó con detalle... y lo arregló en
 * DOS funciones. Las otras quince se quedaron con la forma que no hace nada.
 * Meses después, una auditoría comprobó contra el proyecto real, con la clave
 * pública que cualquiera saca del JavaScript de la web y sin ninguna cuenta:
 *
 *     POST /rest/v1/rpc/verify_all_audit_chains  ->  HTTP 200, 81 filas
 *
 * El identificador de cada organización cliente, su número de registros de
 * auditoría y el estado de su cadena de integridad. En un producto que se vende
 * como custodio de expedientes.
 *
 * LA LECCIÓN NO ES «acordarse de revocar de PUBLIC». Esa lección ya estaba
 * escrita, en un comentario largo y bien argumentado dentro de la propia 0028, y
 * aun así no llegó a las quince funciones. **Una lección escrita en prosa no se
 * propaga; un guard que falla sí.** Este fichero convierte esa regla en algo que
 * rompe el CI, igual que `subprocessors.test.ts` hace con los hosts no declarados
 * y `nav-gate.test.ts` con las rutas de pago sin muro.
 *
 * Comprueba el ESTADO NETO, no la forma de cada línea: da igual que una migración
 * antigua conserve el `revoke ... from anon` inútil, mientras alguna posterior
 * cierre la función de verdad. Lo que no se tolera es que una función quede sin
 * cerrar por NINGUNA migración.
 */

const MIGRACIONES = join(process.cwd(), "supabase", "migrations");

/**
 * Funciones que PUEDEN ejecutarse sin cuenta, cada una con su motivo. Añadir algo
 * aquí es una decisión de seguridad deliberada, y por eso hay que escribir el
 * porqué: la lista se lee en la revisión, no se rellena en automático.
 */
const ABIERTAS_A_PROPOSITO: Record<string, string> = {
  submit_intake:
    "La ÚNICA escritura anónima del producto: la puerta del intake compartible. " +
    "Devuelve el mismo `false` para token inexistente, caducado, revocado o agotado.",
  btrim_safe: "La usa `submit_intake` por dentro.",
  consume_rate_limit:
    "El formulario de intake se envía sin cuenta y es justo la superficie que más " +
    "falta hace limitar. Devuelve un booleano sobre una clave ya hasheada.",
  // Funciones de disparador: `returns trigger`. Postgres no permite invocarlas
  // directamente, así que el grant a PUBLIC es inocuo.
  set_updated_at: "Función de disparador (`returns trigger`), no invocable.",
  enforce_membership_guards: "Función de disparador (`returns trigger`), no invocable.",
};

/**
 * Lógica pura, separada de la lectura de ficheros para poder probarla con
 * entradas sintéticas — que es lo único que demuestra que el guard DETECTA algo.
 */
export function funcionesSinCerrar(sql: string): string[] {
  const declaradas = new Set<string>();
  for (const m of sql.matchAll(/create\s+or\s+replace\s+function\s+public\.([a-z_0-9]+)\s*\(/gi)) {
    declaradas.add(m[1]);
  }

  // Solo cuenta el `revoke` que menciona `public` como destinatario. El `from
  // anon` a secas es exactamente el no-op que este guard existe para cazar, así
  // que aquí NO suma.
  const cerradas = new Set<string>();
  for (const m of sql.matchAll(
    /revoke\s+[\s\S]*?on\s+function\s+public\.([a-z_0-9]+)\s*\([\s\S]*?\)\s*from\s+([^;]+);/gi,
  )) {
    const destinatarios = m[2].toLowerCase();
    if (/\bpublic\b/.test(destinatarios)) cerradas.add(m[1]);
  }

  return [...declaradas]
    .filter((f) => !cerradas.has(f) && !(f in ABIERTAS_A_PROPOSITO))
    .sort();
}

function todoElSql(): string {
  return readdirSync(MIGRACIONES)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(MIGRACIONES, f), "utf8"))
    .join("\n");
}

describe("permisos de las funciones de la base de datos", () => {
  it("ninguna función queda ejecutable por PUBLIC sin declararlo a propósito", () => {
    const sinCerrar = funcionesSinCerrar(todoElSql());
    expect(
      sinCerrar,
      `Estas funciones no se revocan de PUBLIC en ninguna migración, así que 'anon' ` +
        `puede ejecutarlas sin cuenta:\n  ${sinCerrar.join("\n  ")}\n\n` +
        `Añade a una migración nueva:\n` +
        `  revoke all on function public.X(args) from public;\n` +
        `  grant execute on function public.X(args) to <rol que sí>;\n` +
        `y el guard de autorización DENTRO de la función, nunca en su lugar.\n\n` +
        `Si de verdad debe ser pública, añádela a ABIERTAS_A_PROPOSITO con su motivo.`,
    ).toEqual([]);
  });

  /**
   * Sin esto, el test de arriba pasaría en verde si alguien rompiera la expresión
   * regular: cero funciones declaradas → cero sin cerrar → todo bien. Es el mismo
   * fallo que el guard de copy prohibido resuelve con su aserción de cobertura.
   */
  it("de verdad está leyendo las migraciones (cobertura)", () => {
    const sql = todoElSql();
    const declaradas = [
      ...sql.matchAll(/create\s+or\s+replace\s+function\s+public\.([a-z_0-9]+)\s*\(/gi),
    ];
    expect(declaradas.length).toBeGreaterThan(20);
    expect(sql.length).toBeGreaterThan(50_000);
  });

  /**
   * EL RITUAL: un guard que no falla al romper la regla no protege nada. Estas
   * entradas sintéticas reproducen el error exacto que ocurrió de verdad.
   */
  it("caza el `revoke ... from anon` a secas, que es el no-op que causó la fuga", () => {
    const noOp = `
      create or replace function public.fuga_potencial(org uuid) returns void as $$ $$;
      revoke all on function public.fuga_potencial(uuid) from anon, authenticated;
    `;
    expect(funcionesSinCerrar(noOp)).toEqual(["fuga_potencial"]);
  });

  it("acepta la forma correcta", () => {
    const correcto = `
      create or replace function public.bien_cerrada(org uuid) returns void as $$ $$;
      revoke all on function public.bien_cerrada(uuid) from public, anon, authenticated;
      grant execute on function public.bien_cerrada(uuid) to service_role;
    `;
    expect(funcionesSinCerrar(correcto)).toEqual([]);
  });

  it("una función declarada y jamás revocada también cae", () => {
    const olvidada = `create or replace function public.nadie_la_cerro() returns void as $$ $$;`;
    expect(funcionesSinCerrar(olvidada)).toEqual(["nadie_la_cerro"]);
  });

  it("el cierre puede venir de una migración POSTERIOR a la que la declara", () => {
    const enDosFicheros = `
      create or replace function public.tardia(org uuid) returns void as $$ $$;
      revoke all on function public.tardia(uuid) from anon;
      -- ... migraciones después ...
      revoke all on function public.tardia(uuid) from public;
    `;
    expect(funcionesSinCerrar(enDosFicheros)).toEqual([]);
  });
});
