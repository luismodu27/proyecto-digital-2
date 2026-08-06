import { describe, expect, it } from "vitest";
import { es } from "./dictionaries/es";
import { en } from "./dictionaries/en";

/**
 * GUARD: en el diccionario no puede haber FUNCIONES.
 *
 * EL FALLO QUE ESTE TEST EXISTE PARA IMPEDIR, y que ya ocurrió una vez. El
 * diccionario entero se pasa como prop a `I18nProvider`, que es un Client
 * Component. Todo lo que cruza esa frontera se serializa, y **una función no se
 * puede serializar**: React lanza *"Functions cannot be passed directly to
 * Client Components"* y la página devuelve 500. Como es un error de EJECUCIÓN,
 * ni `tsc` ni `next build` lo ven — el build pasó tan feliz con el panel entero
 * roto.
 *
 * Y se coló porque el propio encabezado del diccionario invitaba a hacerlo
 * ("las cadenas con variables son funciones tipadas"), una convención que nunca
 * se había usado y que resultó ser incompatible con la arquitectura. La
 * alternativa es un marcador de posición (`{days}`) y un `replace` en el punto de
 * uso: menos elegante, pero serializable.
 *
 * Cubre CUALQUIER profundidad, porque el problema no depende de dónde esté la
 * función, sino de que exista en el objeto que cruza la frontera.
 */

type Json = unknown;

function findFunctions(value: Json, path = ""): string[] {
  if (typeof value === "function") return [path || "(raíz)"];
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => findFunctions(v, `${path}[${i}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, Json>).flatMap(([k, v]) =>
      findFunctions(v, path ? `${path}.${k}` : k),
    );
  }
  return [];
}

describe("guard · el diccionario cruza a un Client Component", () => {
  it("el diccionario español no contiene ninguna función", () => {
    expect(findFunctions(es)).toEqual([]);
  });

  it("el diccionario inglés no contiene ninguna función", () => {
    expect(findFunctions(en)).toEqual([]);
  });

  /**
   * Prueba definitiva y no de aproximación: si se puede serializar como JSON, se
   * puede cruzar la frontera. Cubre de paso otros valores no serializables que un
   * escáner de funciones no vería (`Date`, `Map`, `Symbol`, referencias cíclicas).
   */
  it("el diccionario entero es serializable", () => {
    expect(() => JSON.stringify(es)).not.toThrow();
    expect(() => JSON.stringify(en)).not.toThrow();
    // Ida y vuelta idéntica: si algo se pierde al serializar, tampoco llegaría.
    expect(JSON.parse(JSON.stringify(es))).toEqual(es);
    expect(JSON.parse(JSON.stringify(en))).toEqual(en);
  });

  /**
   * Autoprueba: un guard que no puede fallar no protege nada. Se le da un objeto
   * con una función anidada y se comprueba que la encuentra, con su ruta.
   */
  it("se autoprueba: encuentra una función anidada y dice dónde está", () => {
    const bad = { a: { b: [{ c: (x: number) => x }] } };
    expect(findFunctions(bad)).toEqual(["a.b[0].c"]);
    expect(findFunctions({ a: { b: "texto" } })).toEqual([]);
  });
});
