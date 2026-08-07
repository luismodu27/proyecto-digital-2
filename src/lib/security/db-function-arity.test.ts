import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * ¿ALGUNA MIGRACIÓN LLAMA A UNA FUNCIÓN CON EL NÚMERO DE ARGUMENTOS EQUIVOCADO?
 *
 * ============================================================================
 * EL FALLO QUE ESTE GUARD EXISTE PARA IMPEDIR, y lo cometí yo hace una hora
 * ============================================================================
 *
 * La migración 0039 redefinía `verify_all_audit_chains` para añadirle un guard de
 * autorización. Para no cambiar nada más, había que copiar su cuerpo tal cual de
 * la 0023. Lo transcribí a mano habiendo leído solo el principio del fichero, y
 * escribí:
 *
 *     v_calc := private.audit_hash(r, v_prev);          -- 2 argumentos
 *
 * cuando la función real pide DIEZ:
 *
 *     v_calc := private.audit_hash(
 *       v_prev, r.organization_id, r.actor_id, r.table_name, r.row_id,
 *       r.action::text, r.old_data, r.new_data, r.diff, r.at
 *     );
 *
 * POR QUÉ NO SE NOTÓ, que es lo importante. PostgreSQL **no valida el cuerpo de
 * una función plpgsql al crearla**: la migración se aplica sin una sola queja, en
 * las dos pasadas del banco de pruebas. El error solo aparece al EJECUTARLA. Y la
 * verificación que hice comprobaba permisos —quién puede llamarla— sin llegar a
 * llamarla nunca con éxito. Verde en todo, y el cron semanal que promete detectar
 * manipulación del registro de auditoría llevaba desde entonces sin detectar nada.
 *
 * De regalo, la misma transcripción se comió la comprobación de `prev_hash`, o
 * sea la mitad del control de la cadena. Un cuerpo copiado a ojo pierde cosas en
 * silencio.
 *
 * LA LECCIÓN: «crear sin error» no es «funciona». Para una función de plpgsql son
 * dos afirmaciones completamente distintas, y la primera no implica nada sobre la
 * segunda. Este guard cubre estáticamente el error más probable de esa clase — que
 * el número de argumentos no cuadre — sin necesidad de una base de datos.
 *
 * Es el tercer guard de este tipo en el proyecto (`subprocessors.test.ts` para los
 * hosts, `db-grants.test.ts` para los permisos). El patrón ya está claro: cuando
 * una regla tiene que valer en muchos sitios, se escribe un escáner, no un
 * comentario.
 */

const MIGRACIONES = join(process.cwd(), "supabase", "migrations");

type Declaracion = { nombre: string; params: number };
export type LlamadaMala = { nombre: string; esperados: number; recibidos: number; fragmento: string };

/**
 * Cuenta argumentos de nivel superior en una lista entre paréntesis: respeta
 * paréntesis anidados, comillas simples y las comillas dobles de identificador.
 * Sin esto, `f(a, coalesce(b, c))` contaría tres.
 */
function contarArgumentos(dentro: string): number {
  const limpio = dentro.trim();
  if (limpio === "") return 0;
  let nivel = 0;
  let enCadena: false | "'" | '"' = false;
  let n = 1;
  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];
    if (enCadena) {
      if (c === enCadena) enCadena = false;
      continue;
    }
    if (c === "'" || c === '"') enCadena = c;
    else if (c === "(" || c === "[") nivel++;
    else if (c === ")" || c === "]") nivel--;
    else if (c === "," && nivel === 0) n++;
  }
  return n;
}

/** Devuelve el contenido del paréntesis que abre en `desde`, o null si no cierra. */
function cuerpoDelParentesis(sql: string, desde: number): { dentro: string; fin: number } | null {
  let nivel = 0;
  let enCadena: false | "'" | '"' = false;
  for (let i = desde; i < sql.length; i++) {
    const c = sql[i];
    if (enCadena) {
      if (c === enCadena) enCadena = false;
      continue;
    }
    if (c === "'" || c === '"') enCadena = c;
    else if (c === "(") nivel++;
    else if (c === ")") {
      nivel--;
      if (nivel === 0) return { dentro: sql.slice(desde + 1, i), fin: i };
    }
  }
  return null;
}

/**
 * Lógica pura. Solo mira funciones del esquema `private`: son las internas del
 * proyecto, las que se llaman desde otras migraciones y las que nadie más define.
 * Las de `public` se llaman también desde la aplicación y por PostgREST, donde el
 * nombre de los parámetros importa más que el número.
 */
export function llamadasConAridadIncorrecta(sql: string): LlamadaMala[] {
  const declaradas = new Map<string, Declaracion>();
  const reDecl = /create\s+or\s+replace\s+function\s+private\.([a-z_0-9]+)\s*\(/gi;
  for (let m = reDecl.exec(sql); m; m = reDecl.exec(sql)) {
    const cuerpo = cuerpoDelParentesis(sql, m.index + m[0].length - 1);
    if (!cuerpo) continue;
    // Una declaración sin parámetros deja el paréntesis vacío.
    declaradas.set(m[1], { nombre: m[1], params: contarArgumentos(cuerpo.dentro) });
  }

  const malas: LlamadaMala[] = [];
  const reCall = /private\.([a-z_0-9]+)\s*\(/gi;
  for (let m = reCall.exec(sql); m; m = reCall.exec(sql)) {
    const decl = declaradas.get(m[1]);
    if (!decl) continue;
    // Salta la propia declaración.
    const antes = sql.slice(Math.max(0, m.index - 60), m.index);
    if (/create\s+or\s+replace\s+function\s+$/i.test(antes)) continue;

    const cuerpo = cuerpoDelParentesis(sql, m.index + m[0].length - 1);
    if (!cuerpo) continue;
    const recibidos = contarArgumentos(cuerpo.dentro);
    // Los parámetros con `default` permiten llamar con menos. Se admite cualquier
    // cantidad HASTA la declarada; pasarse nunca es válido, y quedarse corto con
    // una función sin defaults tampoco — pero eso no se puede saber sin más
    // análisis, así que se marca solo la discrepancia clara: pasarse, o quedarse
    // a menos de la mitad (que es lo que delata una transcripción a ojo).
    if (recibidos > decl.params || recibidos * 2 < decl.params) {
      malas.push({
        nombre: m[1],
        esperados: decl.params,
        recibidos,
        fragmento: sql.slice(m.index, cuerpo.fin + 1).replace(/\s+/g, " ").slice(0, 90),
      });
    }
  }
  return malas;
}

function todoElSql(): string {
  return readdirSync(MIGRACIONES)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(MIGRACIONES, f), "utf8"))
    .join("\n");
}

describe("llamadas a funciones internas en las migraciones", () => {
  it("ninguna se llama con un número de argumentos imposible", () => {
    const malas = llamadasConAridadIncorrecta(todoElSql());
    expect(
      malas,
      malas
        .map(
          (m) =>
            `private.${m.nombre} declara ${m.esperados} parámetros y se llama con ${m.recibidos}:\n    ${m.fragmento}`,
        )
        .join("\n  "),
    ).toEqual([]);
  });

  it("de verdad encuentra declaraciones y llamadas (cobertura)", () => {
    const sql = todoElSql();
    const decls = [...sql.matchAll(/create\s+or\s+replace\s+function\s+private\.[a-z_0-9]+\s*\(/gi)];
    const calls = [...sql.matchAll(/private\.[a-z_0-9]+\s*\(/gi)];
    expect(decls.length).toBeGreaterThan(2);
    expect(calls.length).toBeGreaterThan(decls.length);
  });

  /** EL RITUAL: reproduce el error exacto que se cometió. */
  it("caza la llamada de 2 argumentos a una función de 10 (el fallo real de la 0039)", () => {
    const roto = `
      create or replace function private.audit_hash(
        p_prev text, p_org uuid, p_actor uuid, p_table text, p_row text,
        p_action text, p_old jsonb, p_new jsonb, p_diff jsonb, p_at timestamptz
      ) returns text as $$ select '' $$;
      create or replace function public.algo() returns void as $$
      begin
        v_calc := private.audit_hash(r, v_prev);
      end $$;
    `;
    const malas = llamadasConAridadIncorrecta(roto);
    expect(malas).toHaveLength(1);
    expect(malas[0]).toMatchObject({ nombre: "audit_hash", esperados: 10, recibidos: 2 });
  });

  it("acepta la llamada correcta, con paréntesis anidados y casts", () => {
    const bien = `
      create or replace function private.audit_hash(
        p_prev text, p_org uuid, p_actor uuid, p_table text, p_row text,
        p_action text, p_old jsonb, p_new jsonb, p_diff jsonb, p_at timestamptz
      ) returns text as $$ select '' $$;
      create or replace function public.algo() returns void as $$
      begin
        v_calc := private.audit_hash(
          v_prev, r.organization_id, coalesce(r.actor_id, r.created_by), r.table_name,
          r.row_id, r.action::text, r.old_data, r.new_data, r.diff, r.at
        );
      end $$;
    `;
    expect(llamadasConAridadIncorrecta(bien)).toEqual([]);
  });

  it("no se confunde con comas dentro de un literal de texto", () => {
    const conComas = `
      create or replace function private.f(a text, b text) returns void as $$ $$;
      create or replace function public.g() returns void as $$ begin
        perform private.f('uno, dos, tres', 'x');
      end $$;
    `;
    expect(llamadasConAridadIncorrecta(conComas)).toEqual([]);
  });

  it("marca también pasarse de argumentos", () => {
    const pasado = `
      create or replace function private.f(a text, b text) returns void as $$ $$;
      create or replace function public.g() returns void as $$ begin
        perform private.f('a','b','c');
      end $$;
    `;
    expect(llamadasConAridadIncorrecta(pasado)).toHaveLength(1);
  });
});
