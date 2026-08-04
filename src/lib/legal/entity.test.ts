import { describe, expect, it } from "vitest";
import { missingEntityFields, resolveLegalEntity } from "./entity";

/**
 * Lo que se protege aquí no es una función, es una promesa: que el aviso de
 * privacidad **nunca** se publique con un responsable inventado o a medias. El
 * modo de fallo temido no es una excepción, es una página que parece terminada.
 */

const COMPLETE = {
  LEGAL_ENTITY_NAME: "Attesta, S.L.",
  LEGAL_ENTITY_ADDRESS: "Calle Ejemplo 1, 28001 Madrid",
  LEGAL_ENTITY_TAX_ID: "B12345678",
  LEGAL_PRIVACY_EMAIL: "privacidad@attesta.io",
};

describe("resolveLegalEntity", () => {
  it("resuelve la entidad cuando están los cuatro datos obligatorios", () => {
    const entity = resolveLegalEntity(COMPLETE);
    expect(entity?.name).toBe("Attesta, S.L.");
    expect(entity?.taxId).toBe("B12345678");
    expect(entity?.euRepresentative).toBeNull();
  });

  it("recoge el representante en la UE cuando se declara (art. 27 RGPD)", () => {
    const entity = resolveLegalEntity({
      ...COMPLETE,
      LEGAL_EU_REPRESENTATIVE: "Representante UE, S.L. — Lisboa",
    });
    expect(entity?.euRepresentative).toBe("Representante UE, S.L. — Lisboa");
  });

  /**
   * EL TEST QUE IMPORTA. Sin él, un `??  "Attesta"` puesto con buena intención
   * convierte el borrador en una página publicable con datos falsos.
   */
  it("devuelve null si falta CUALQUIERA de los datos obligatorios", () => {
    for (const key of Object.keys(COMPLETE)) {
      const partial = { ...COMPLETE, [key]: undefined };
      expect(resolveLegalEntity(partial), `falta ${key}`).toBeNull();
    }
    expect(resolveLegalEntity({})).toBeNull();
  });

  it("una cadena en blanco no cuenta como dato", () => {
    expect(resolveLegalEntity({ ...COMPLETE, LEGAL_ENTITY_NAME: "   " })).toBeNull();
  });

  it("recorta los espacios de los valores", () => {
    const entity = resolveLegalEntity({ ...COMPLETE, LEGAL_ENTITY_NAME: "  Attesta, S.L.  " });
    expect(entity?.name).toBe("Attesta, S.L.");
  });

  it("nunca lanza, ni con un entorno vacío", () => {
    expect(() => resolveLegalEntity({})).not.toThrow();
  });
});

describe("missingEntityFields", () => {
  it("dice exactamente qué falta, para poder mostrarlo", () => {
    expect(missingEntityFields({ LEGAL_ENTITY_NAME: "Attesta, S.L." })).toEqual([
      "LEGAL_ENTITY_ADDRESS",
      "LEGAL_ENTITY_TAX_ID",
      "LEGAL_PRIVACY_EMAIL",
    ]);
  });

  it("no falta nada cuando están los cuatro", () => {
    expect(missingEntityFields(COMPLETE)).toEqual([]);
  });

  /** Coherencia entre las dos funciones: no pueden discrepar. */
  it("«no falta nada» y «hay entidad» son la misma condición", () => {
    const cases = [{}, COMPLETE, { ...COMPLETE, LEGAL_ENTITY_TAX_ID: "" }];
    for (const env of cases) {
      expect(missingEntityFields(env).length === 0).toBe(resolveLegalEntity(env) !== null);
    }
  });
});
