import { describe, expect, it } from "vitest";
import {
  POLICY_PACKS,
  POLICY_PACKS_EN,
  policyPackById,
  policyPacks,
} from "./index";
import type { PolicyPack } from "./types";

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
