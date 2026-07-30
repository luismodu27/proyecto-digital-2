import { describe, expect, it } from "vitest";
import {
  ACTION_META,
  ACTION_META_BY_LOCALE,
  ENTITY_META,
  ENTITY_META_BY_LOCALE,
  FIELD_LABELS_BY_LOCALE,
  deriveChanged,
  deriveLabel,
  toAuditEntry,
  type RawAudit,
} from "./audit";

/**
 * El audit-trail es la pieza probatoria del producto: es lo que un auditor mira.
 * Estos tests protegen la traducción de fila cruda → texto legible, donde los
 * fallos son silenciosos y graves: una etiqueta vacía convierte una entrada en
 * "alguien cambió algo" y deja el registro sin valor.
 */

function raw(over: Partial<RawAudit> = {}): RawAudit {
  return {
    id: 1,
    actor_email: "persona@attesta-test.dev",
    table_name: "ai_systems",
    row_id: "11111111-1111-1111-1111-111111111111",
    action: "insert",
    diff: null,
    new_data: { name: "Cribado de CV" },
    old_data: null,
    at: "2026-07-30T10:00:00Z",
    ...over,
  };
}

describe("deriveLabel — de dato crudo a etiqueta humana", () => {
  it("un sistema se identifica por su nombre, y por su código si no hay nombre", () => {
    expect(deriveLabel("ai_systems", { name: "Cribado de CV" })).toBe("Cribado de CV");
    expect(deriveLabel("ai_systems", { code: "SYS-004" })).toBe("SYS-004");
  });

  it("una brecha se identifica por su requisito", () => {
    expect(deriveLabel("gap_items", { requirement: "Supervisión humana" })).toBe(
      "Supervisión humana",
    );
  });

  it("una evaluación de riesgo muestra el nivel traducido, no el enum crudo", () => {
    const es = deriveLabel("risk_assessments", { level: "high" }, "es");
    const en = deriveLabel("risk_assessments", { level: "high" }, "en");
    expect(es).not.toBe("high");
    expect(en).not.toBe("high");
    expect(es).not.toBe(en);
  });

  it("una membresía muestra el rol traducido", () => {
    expect(deriveLabel("memberships", { role: "owner" }, "es")).not.toBe("owner");
  });

  it("un acuse de evento regulatorio usa el título del catálogo si lo conoce", () => {
    const conocido = deriveLabel("regulatory_acks", { event_id: "eu-gpai-governance" });
    expect(conocido).toMatch(/^«.+»$/);
    // Un id desconocido no se inventa: se muestra el id tal cual.
    expect(deriveLabel("regulatory_acks", { event_id: "id-que-no-existe" })).toBe(
      "id-que-no-existe",
    );
  });

  it("datos nulos o tabla desconocida no rompen: devuelven cadena vacía", () => {
    expect(deriveLabel("ai_systems", null)).toBe("");
    expect(deriveLabel("tabla_inventada", { name: "x" })).toBe("");
  });
});

describe("deriveChanged — qué campos cambiaron, sin ruido técnico", () => {
  it("traduce los nombres de columna a etiquetas humanas", () => {
    const changed = deriveChanged("ai_systems", { risk_level: "high" }, "es");
    expect(changed).toHaveLength(1);
    expect(changed[0]).not.toBe("risk_level");
  });

  it("filtra el ruido de infraestructura (updated_at y compañía)", () => {
    const changed = deriveChanged("ai_systems", {
      updated_at: "2026-07-30",
      risk_level: "high",
    });
    expect(changed).toHaveLength(1);
  });

  it("una columna sin etiqueta se muestra tal cual en vez de desaparecer", () => {
    expect(deriveChanged("ai_systems", { columna_nueva: 1 })).toEqual([
      "columna_nueva",
    ]);
  });

  it("un diff nulo no produce entradas", () => {
    expect(deriveChanged("ai_systems", null)).toEqual([]);
  });
});

describe("toAuditEntry", () => {
  it("mapea la fila cruda conservando actor, acción y momento", () => {
    const e = toAuditEntry(raw());
    expect(e.actorEmail).toBe("persona@attesta-test.dev");
    expect(e.action).toBe("insert");
    expect(e.at).toBe("2026-07-30T10:00:00Z");
    expect(e.label).toBe("Cribado de CV");
  });

  it("un borrado se etiqueta con los datos ANTIGUOS (los nuevos ya no existen)", () => {
    const e = toAuditEntry(
      raw({
        action: "delete",
        new_data: null,
        old_data: { name: "Sistema retirado" },
      }),
    );
    expect(e.label).toBe("Sistema retirado");
  });

  it("solo un update lista campos cambiados", () => {
    const update = toAuditEntry(
      raw({ action: "update", diff: { risk_level: "high" } }),
    );
    const insert = toAuditEntry(raw({ action: "insert", diff: { risk_level: "high" } }));
    expect(update.changed.length).toBe(1);
    expect(insert.changed).toEqual([]);
  });

  it("un actor sin correo queda como null, no como 'undefined'", () => {
    expect(toAuditEntry(raw({ actor_email: null })).actorEmail).toBeNull();
  });
});

describe("paridad ES/EN de los metadatos del registro", () => {
  it("mismas entidades y acciones en los dos idiomas", () => {
    expect(Object.keys(ENTITY_META_BY_LOCALE.en).sort()).toEqual(
      Object.keys(ENTITY_META).sort(),
    );
    expect(Object.keys(ACTION_META_BY_LOCALE.en).sort()).toEqual(
      Object.keys(ACTION_META).sort(),
    );
  });

  it("las tablas con etiquetas de campo son las mismas en ES y EN", () => {
    expect(Object.keys(FIELD_LABELS_BY_LOCALE.en).sort()).toEqual(
      Object.keys(FIELD_LABELS_BY_LOCALE.es).sort(),
    );
  });

  it("y dentro de cada tabla, las mismas columnas", () => {
    for (const [table, es] of Object.entries(FIELD_LABELS_BY_LOCALE.es)) {
      expect(Object.keys(FIELD_LABELS_BY_LOCALE.en[table]!).sort(), table).toEqual(
        Object.keys(es).sort(),
      );
    }
  });
});
