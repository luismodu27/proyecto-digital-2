import { describe, expect, it } from "vitest";
import {
  POLICY_PACKS,
  POLICY_PACKS_EN,
  pendingControls,
  policyPackById,
  policyPacks,
} from "./index";
import type { PolicyPack } from "./types";
import { getDictionary } from "@/lib/i18n";

const es = getDictionary("es");
const en = getDictionary("en");

/**
 * Invariantes de los policy packs.
 *
 * Los packs son contenido REGULATORIO: cada control acaba como una fila de
 * `gap_items` en el expediente del cliente y como texto de su dossier. Aquí se
 * automatiza la revisión que hasta ahora se hacía a mano al añadir un pack
 * (paridad ES/EN, ids únicos, flag `prohibited` coherente), que es justo donde un
 * despiste no lo caza ni `tsc` ni el guard de copy.
 */

const ES_EN: [string, PolicyPack, PolicyPack][] = POLICY_PACKS.map((es, i) => [
  es.id,
  es,
  POLICY_PACKS_EN[i]!,
]);

describe("registro de packs", () => {
  it("los ids son únicos", () => {
    const ids = POLICY_PACKS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("el catálogo EN tiene los mismos packs, en el mismo orden", () => {
    expect(POLICY_PACKS_EN.map((p) => p.id)).toEqual(
      POLICY_PACKS.map((p) => p.id),
    );
  });

  it("`policyPackById` resuelve en ambos idiomas y devuelve null si no existe", () => {
    for (const p of POLICY_PACKS) {
      expect(policyPackById(p.id)?.id).toBe(p.id);
      expect(policyPackById(p.id, "en")?.id).toBe(p.id);
    }
    expect(policyPackById("pack-que-no-existe")).toBeNull();
  });

  it("`policyPacks` devuelve el catálogo del idioma pedido", () => {
    expect(policyPacks("es")).toBe(POLICY_PACKS);
    expect(policyPacks("en")).toBe(POLICY_PACKS_EN);
    expect(policyPacks()).toBe(POLICY_PACKS);
  });
});

describe.each(ES_EN)("pack %s", (id, es, en) => {
  it("tiene nombre, etiqueta, resumen y al menos un control", () => {
    for (const pack of [es, en]) {
      expect(pack.name.trim().length).toBeGreaterThan(0);
      expect(pack.tag.trim().length).toBeGreaterThan(0);
      expect(pack.summary.trim().length).toBeGreaterThan(0);
      expect(pack.controls.length).toBeGreaterThan(0);
    }
  });

  it("los ids de control son únicos dentro del pack", () => {
    const ids = es.controls.map((c) => c.id);
    expect(new Set(ids).size, `duplicados en ${id}`).toBe(ids.length);
  });

  it("EN espeja los mismos controles, en el mismo orden", () => {
    expect(en.controls.map((c) => c.id)).toEqual(es.controls.map((c) => c.id));
  });

  it("la severidad coincide entre ES y EN (es un dato, no texto)", () => {
    for (const [i, c] of es.controls.entries()) {
      expect(en.controls[i]!.severity, `${id}/${c.id}`).toBe(c.severity);
    }
  });

  it("las referencias legales del artículo son las mismas en ES y EN", () => {
    // `article` NO es comparable literalmente: lleva prosa que sí se traduce
    // ("Anexo III.3.d" → "Annex III.3.d", "Transversal ·" → "Cross-cutting ·").
    // Lo que no puede divergir son los NÚMEROS: son la referencia legal, se
    // guardan en `gap_items.article` y de ahí sale la clave de remediación que
    // deduplica el plan de acción. Un `26` que en EN quedara como `27` sería una
    // cita equivocada en el expediente del cliente.
    for (const [i, c] of es.controls.entries()) {
      const nums = (s: string) => s.match(/\d+/g) ?? [];
      expect(nums(en.controls[i]!.article), `${id}/${c.id} artículo`).toEqual(
        nums(c.article),
      );
    }
  });

  it("si el artículo empieza por `Art. N`, el mismo N encabeza la versión EN", () => {
    // Es exactamente lo que lee `remediationKeyFor` para elegir la remediación
    // validada del catálogo: si el prefijo cambia, el plan EN cae al texto
    // genérico sin que nadie se entere.
    const lead = (s: string) => s.match(/^Art\.\s*(\d+)/)?.[1] ?? null;
    for (const [i, c] of es.controls.entries()) {
      expect(lead(en.controls[i]!.article), `${id}/${c.id}`).toBe(lead(c.article));
    }
  });

  it("el flag `prohibited` es idéntico en ES y EN", () => {
    for (const [i, c] of es.controls.entries()) {
      expect(en.controls[i]!.prohibited === true, `${id}/${c.id}`).toBe(
        c.prohibited === true,
      );
    }
  });

  it("ningún control tiene título, descripción o artículo vacíos", () => {
    for (const pack of [es, en]) {
      for (const c of pack.controls) {
        expect(c.title.trim().length, `${pack.id}/${c.id} título`).toBeGreaterThan(0);
        expect(c.description.trim().length, `${pack.id}/${c.id} desc`).toBeGreaterThan(0);
        expect(c.article.trim().length, `${pack.id}/${c.id} art`).toBeGreaterThan(0);
      }
    }
  });

  it("un control `prohibited` cita el Art. 5 (es una práctica del Art. 5, no una brecha)", () => {
    for (const c of es.controls.filter((x) => x.prohibited)) {
      expect(c.article, `${id}/${c.id}`).toMatch(/Art\.\s*5/);
      expect(c.severity, `${id}/${c.id}`).toBe("alta");
    }
  });

  it("la condicionalidad territorial se declara en los dos idiomas o en ninguno", () => {
    for (const [i, c] of es.controls.entries()) {
      expect(!!en.controls[i]!.conditional, `${id}/${c.id}`).toBe(!!c.conditional);
    }
  });

  it("si hay aviso (`note`), existe en los dos idiomas", () => {
    expect(!!en.note, id).toBe(!!es.note);
  });

  it("la prosa del pack EN está traducida (no es el español copiado)", () => {
    // El espejo EN se escribe copiando el pack ES y traduciendo campo a campo.
    // Saltarse uno no rompe NADA: compila, pasa el resto de la paridad (mismos
    // ids, mismos números de artículo, misma severidad) y el control aparece en
    // español dentro de una página inglesa. Así se habían quedado dos
    // `conditional` y un `article` del pack de California.
    //
    // La regla es la identidad literal, no un detector de idioma: si un texto EN
    // es byte a byte el ES, es que no se tradujo. `tag` queda fuera (chips como
    // "GenAI" coinciden de verdad) y `article` también, porque una cita pura
    // ("CCPA · Cal. Code Regs. tit. 11 §§7120-7124") es idéntica en ambas — para
    // ese campo vale el escaneo de marcadores del test siguiente.
    // Se acumulan y se afirman de una vez: si el test cortara en el primero,
    // arreglar un pack a medio traducir sería un juego de topos.
    const untranslated: string[] = [];
    const same = (field: string, a: string, b?: string) => {
      if (a === b) untranslated.push(field);
    };
    same(`${id}.name`, es.name, en.name);
    same(`${id}.summary`, es.summary, en.summary);
    if (es.note) same(`${id}.note`, es.note, en.note);

    for (const [i, c] of es.controls.entries()) {
      const t = en.controls[i]!;
      same(`${id}/${c.id}.title`, c.title, t.title);
      same(`${id}/${c.id}.description`, c.description, t.description);
      if (c.conditional) {
        same(`${id}/${c.id}.conditional`, c.conditional, t.conditional);
      }
    }
    expect(untranslated).toEqual([]);
  });

  it("ningún campo del pack EN arrastra palabras en español", () => {
    // Complemento del anterior para los textos que SÍ pueden coincidir: la cita
    // legal. Un `article` mayormente numérico puede llevar una coletilla en prosa
    // ("(y transversal §§7150-7222)") que se traduce y se olvida. Se buscan solo
    // palabras funcionales inequívocas del español: nada de ellas es una palabra
    // inglesa, así que no hay falsos positivos con "Annex", "Art." o los nombres
    // propios de las leyes.
    // Lista de palabras funcionales del español que **no existen en inglés**, de
    // modo que no hay falsos positivos con "Annex", "Art." ni con los nombres de
    // las leyes. Se dejan fuera a propósito las cortas y ambiguas (`de`, `la`,
    // `en`, `no`, `es`, `un`) y `usa`, que con `/i` chocaría con "USA".
    const SPANISH =
      /\b(del|los|las|según|para|que|una|uno|con|sólo|solo|siempre|cuando|sobre|desde|hasta|cada|sus|tus|este|esta|más|aún|así|entre|hacia|sin|sino|aunque|porque|pero|también|además|debe|deben|puede|pueden|tienen|hay|toda|todo|todos|todas|Anexo|Reglamento|transversal|riesgo|evidencia|organización)\b/i;
    const fields = (p: PolicyPack) => [
      ["name", p.name],
      ["tag", p.tag],
      ["summary", p.summary],
      ...(p.note ? [["note", p.note] as const] : []),
      ...p.controls.flatMap((c) => [
        [`${c.id}.title`, c.title],
        [`${c.id}.description`, c.description],
        [`${c.id}.article`, c.article],
        ...(c.conditional ? [[`${c.id}.conditional`, c.conditional] as const] : []),
      ]),
    ];

    const offenders = fields(en)
      .filter(([, value]) => SPANISH.test(value))
      .map(([field, value]) => `${id} · ${field} → "${value}"`);
    expect(offenders).toEqual([]);
  });
});

describe("recuento de packs en la landing", () => {
  it("el número de packs NO está escrito a mano en el diccionario", () => {
    // La página de precios dice "N packs". Escribir ahí un número es garantía de
    // que envejezca en silencio: ya pasó (decía 8 con 9 packs en el catálogo). El
    // diccionario debe usar el marcador `{packs}` y el número lo pone
    // `POLICY_PACKS.length` al renderizar. Este test vigila que nadie lo revierta.
    const stale = /\b\d+\s+packs?\b/i;
    for (const [name, dict] of [["es", es], ["en", en]] as const) {
      const json = JSON.stringify(dict.landing.pricing);
      expect(json, `${name}: hay un recuento de packs escrito a mano`).not.toMatch(
        stale,
      );
      expect(json, `${name}: falta el marcador {packs}`).toContain("{packs}");
    }
  });
});

describe("copy de marca dentro de los packs", () => {
  it("ningún control afirma que el cliente cumple ni que Attesta certifica", () => {
    // Guard fino y complementario al de `npm run check:copy`: aquí se comprueba
    // el texto que acaba PERSISTIDO en el expediente del cliente.
    // attesta-copy-ok: esta línea ES la lista de vocabulario prohibido del test (mismo caso que analista/llm.ts).
    const prohibido = /\b(certificamos|garantizamos|we certify|we guarantee|certified by attesta|validado por attesta)\b/i;
    for (const pack of [...POLICY_PACKS, ...POLICY_PACKS_EN]) {
      for (const c of pack.controls) {
        expect(`${c.title} ${c.description}`, `${pack.id}/${c.id}`).not.toMatch(
          prohibido,
        );
      }
    }
  });
});

describe("pendingControls: deduplicación bilingüe por identidad (H2)", () => {
  const rrhhEs = policyPackById("rrhh", "es")!;
  const rrhhEn = policyPackById("rrhh", "en")!;
  /** Filas heredadas: solo título, sin control_id (brechas anteriores a 0040). */
  const porTitulo = (titulos: string[]) => titulos.map((requirement) => ({ requirement }));

  it("sistema virgen: devuelve TODOS los controles", () => {
    expect(pendingControls(rrhhEs, rrhhEn, [])).toHaveLength(
      rrhhEs.controls.length,
    );
  });

  it("reaplicar en EN sobre lo ya aplicado en ES no reinserta NADA (el bug)", () => {
    // El sistema tiene el pack aplicado en español: los gap_items guardan los
    // títulos ES. Ahora se reaplica con la UI en inglés (packCurrent = EN). Si se
    // dedujera por título, ninguno coincidiría y se duplicaría todo el pack.
    const yaGuardadosEnEs = porTitulo(rrhhEs.controls.map((c) => c.title));
    const pend = pendingControls(rrhhEn, rrhhEs, yaGuardadosEnEs);
    expect(pend).toEqual([]);
  });

  it("y al revés: aplicado en EN, reaplicado en ES, tampoco duplica", () => {
    const yaGuardadosEnEn = porTitulo(rrhhEn.controls.map((c) => c.title));
    expect(pendingControls(rrhhEs, rrhhEn, yaGuardadosEnEn)).toEqual([]);
  });

  it("dedupica por control_id (0040) aunque el título no coincida con NINGÚN idioma", () => {
    // Filas con identidad estable pero un título editado a mano/antiguo: la
    // deduplicación por texto fallaría, la de control_id no.
    const conId = rrhhEs.controls.map((c) => ({
      requirement: "título que ya no existe en el catálogo",
      controlId: c.id,
    }));
    expect(pendingControls(rrhhEs, rrhhEn, conId)).toEqual([]);
  });

  it("solo devuelve los controles que faltan (aplicación parcial)", () => {
    // Ya existen los títulos ES de todos MENOS el último.
    const guardados = porTitulo(rrhhEs.controls.slice(0, -1).map((c) => c.title));
    const pend = pendingControls(rrhhEs, rrhhEn, guardados);
    expect(pend).toHaveLength(1);
    expect(pend[0]!.id).toBe(rrhhEs.controls.at(-1)!.id);
  });

  it("títulos de otros packs o brechas manuales no dedupican este pack", () => {
    const ajenos = porTitulo(["Una brecha escrita a mano", "Control de otro pack cualquiera"]);
    expect(pendingControls(rrhhEs, rrhhEn, ajenos)).toHaveLength(
      rrhhEs.controls.length,
    );
  });

  it("sin pack en el otro idioma, dedupica al menos por el idioma actual", () => {
    const guardados = porTitulo(rrhhEs.controls.map((c) => c.title));
    expect(pendingControls(rrhhEs, null, guardados)).toEqual([]);
  });
});
