import { describe, expect, it } from "vitest";
import { getDictionary } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n/config";
import {
  ART25_TRIGGERS,
  CERT_WARN_DAYS,
  EVIDENCE_KINDS,
  EVIDENCE_STATUSES,
  coverage,
  evidenceKind,
  expiringEvidence,
  type SupplierEvidence,
} from "./evidence";

/**
 * Estos tests protegen las dos reglas que hacen honesta la feature entera: qué
 * verbo corresponde a cada elemento, y qué caduca de verdad.
 */

const NOW = new Date("2026-08-03T12:00:00Z");

const ev = (patch: Partial<SupplierEvidence>): SupplierEvidence => ({
  id: "e1",
  supplierId: "s1",
  systemId: null,
  systemName: null,
  kind: "instructions",
  status: "notRequested",
  requestedOn: null,
  receivedOn: null,
  documentVersion: null,
  sourceUrl: null,
  expiresOn: null,
  note: null,
  ...patch,
});

describe("base jurídica de cada elemento (de aquí sale el verbo)", () => {
  it("hay catálogo que comprobar y ninguna clave repetida", () => {
    expect(EVIDENCE_KINDS.length).toBeGreaterThanOrEqual(15);
    expect(new Set(EVIDENCE_KINDS.map((k) => k.key)).size).toBe(
      EVIDENCE_KINDS.length,
    );
  });

  it("las instrucciones de uso SON entregables al responsable del despliegue", () => {
    // Es el único documento que el Reglamento le dirige. Si esto deja de ser
    // `deliverable`, el producto pierde lo único que sí puede exigir.
    expect(evidenceKind("instructions")?.basis).toBe("deliverable");
    expect(evidenceKind("instructions")?.article).toBe("Art. 13");
  });

  it("la documentación del Anexo IV NO es exigible: solo por contrato", () => {
    // Esta es la regresión concreta que ya se cometió una vez en los packs y en
    // las recomendaciones: decir «exige al proveedor la documentación técnica».
    // El Art. 11.1 la dirige a autoridades y organismos notificados.
    expect(evidenceKind("technicalDocumentation")?.basis).toBe("contractOnly");
  });

  it("el sistema de gestión de la calidad y el de riesgos tampoco son exigibles", () => {
    expect(evidenceKind("qualityManagement")?.basis).toBe("contractOnly");
    expect(evidenceKind("riskManagement")?.basis).toBe("contractOnly");
  });

  it("marcado CE, declaración y registro en la BD de la UE se VERIFICAN", () => {
    // Son públicos: hay un canal que no depende de la buena voluntad del
    // proveedor, y presentarlos como algo que hay que pedir lo desaprovecha.
    for (const k of ["ceMarking", "declarationOfConformity", "euDatabase"]) {
      expect(evidenceKind(k)?.basis, k).toBe("publicSource");
    }
  });

  it("la documentación GPAI para integradores NO la puede reclamar un deployer", () => {
    // El destinatario del Art. 53.1.b es el proveedor del SISTEMA que integra el
    // modelo. Para un deployer puro la vía es el flow-down contractual.
    expect(evidenceKind("gpaiIntegratorDocs")?.basis).toBe("contractOnly");
    expect(evidenceKind("gpaiIntegratorDocs")?.gpai).toBe(true);
  });

  it("el resumen del contenido de entrenamiento es público", () => {
    expect(evidenceKind("gpaiTrainingSummary")?.basis).toBe("publicSource");
  });

  it("cada elemento cita un artículo no vacío", () => {
    for (const k of EVIDENCE_KINDS) {
      expect(k.article.trim().length, k.key).toBeGreaterThan(0);
    }
  });
});

describe("qué caduca de verdad", () => {
  it("SOLO el certificado de organismo notificado", () => {
    // Ni el marcado CE, ni la declaración de conformidad, ni las instrucciones,
    // ni el registro en la base de datos de la UE. Y los 10 años de los
    // Arts. 18 / 23.5 / 47.1 son CONSERVACIÓN del proveedor, no validez:
    // convertirlos en caducidad llenaría la pantalla de avisos falsos.
    const expiring = EVIDENCE_KINDS.filter((k) => k.expires).map((k) => k.key);
    expect(expiring).toEqual(["notifiedBodyCertificate"]);
  });

  it("avisa del certificado dentro de la ventana y no antes", () => {
    const soon = ev({
      kind: "notifiedBodyCertificate",
      expiresOn: "2026-10-01", // 59 días
    });
    const far = ev({
      id: "e2",
      kind: "notifiedBodyCertificate",
      expiresOn: "2027-06-01",
    });
    expect(CERT_WARN_DAYS).toBe(90);
    const out = expiringEvidence([soon, far], NOW);
    expect(out.map((x) => x.item.id)).toEqual(["e1"]);
    expect(out[0].daysLeft).toBe(59);
  });

  it("una fecha guardada en un elemento que NO caduca no genera aviso", () => {
    // Puede llegar por error humano o por una importación. La lista de
    // vencimientos es de las que antes se dejan de mirar si trae ruido.
    const bogus = ev({ kind: "ceMarking", expiresOn: "2026-08-10" });
    expect(expiringEvidence([bogus], NOW)).toEqual([]);
  });

  it("un certificado ya vencido sigue apareciendo, con días negativos", () => {
    const past = ev({ kind: "notifiedBodyCertificate", expiresOn: "2026-07-01" });
    const out = expiringEvidence([past], NOW);
    expect(out).toHaveLength(1);
    expect(out[0].daysLeft).toBeLessThan(0);
  });
});

describe("cobertura: hechos, nunca un porcentaje", () => {
  it("cuenta recibido, verificado, rechazado, pendiente y no aplica", () => {
    const c = coverage([
      ev({ id: "1", status: "received" }),
      ev({ id: "2", kind: "ceMarking", status: "verifiedPublicly" }),
      ev({ id: "3", kind: "technicalDocumentation", status: "refused" }),
      ev({ id: "4", kind: "qualityManagement", status: "requested" }),
      ev({ id: "5", kind: "riskManagement", status: "notApplicable" }),
    ]);
    expect(c).toEqual({
      covered: 2,
      refused: 1,
      pending: 1,
      notApplicable: 1,
      total: 5,
      pendingByBasis: {
        deliverable: 0,
        publicSource: 0,
        contractOnly: 1,
        existsNoAccess: 0,
      },
    });
  });

  it("un rechazo por escrito NO cuenta como cubierto, pero tampoco como pendiente", () => {
    // Que un proveedor se niegue, con fecha, es evidencia de primera para un
    // expediente. Meterlo en el montón de "pendiente" lo borraría.
    const c = coverage([ev({ status: "refused" })]);
    expect(c.covered).toBe(0);
    expect(c.pending).toBe(0);
    expect(c.refused).toBe(1);
  });

  it("separa lo pendiente por base jurídica", () => {
    // Que falte algo que el proveedor está OBLIGADO a darte no se lee igual que
    // que falte algo que solo se consigue negociando.
    const c = coverage([
      ev({ id: "1", kind: "instructions", status: "notRequested" }),
      ev({ id: "2", kind: "technicalDocumentation", status: "notRequested" }),
      ev({ id: "3", kind: "ceMarking", status: "notRequested" }),
    ]);
    expect(c.pendingByBasis.deliverable).toBe(1);
    expect(c.pendingByBasis.contractOnly).toBe(1);
    expect(c.pendingByBasis.publicSource).toBe(1);
  });

  it("no hay estado que insinúe un juicio sobre el proveedor", () => {
    // Regla #1: nada de "conforme", "apto" ni puntuaciones de proveedor.
    for (const s of EVIDENCE_STATUSES) {
      expect(s).not.toMatch(/complian|conform|apt|score|rating/i);
    }
  });
});

describe("Art. 25 — se avisa, no se dictamina", () => {
  it("están los cuatro supuestos", () => {
    expect(ART25_TRIGGERS).toHaveLength(4);
    expect(ART25_TRIGGERS.map((t) => t.key)).toEqual([
      "whiteLabel",
      "substantialModification",
      "purposeChange",
      "fineTuning",
    ]);
  });

  it("la válvula contractual SOLO existe en la marca blanca", () => {
    // El 25.1(a) es el único con "without prejudice to contractual
    // arrangements". Extenderla a los otros sería regalar una salida que la
    // norma no da.
    const withCarveOut = ART25_TRIGGERS.filter((t) => t.contractualCarveOut);
    expect(withCarveOut.map((t) => t.key)).toEqual(["whiteLabel"]);
  });

  it("el desenlace es el mismo texto para todos y no dictamina", () => {
    for (const locale of LOCALES) {
      const t = getDictionary(locale).dashboard.pages.suppliers;
      const outcome = t.art25Outcome;
      expect(outcome.length).toBeGreaterThan(0);
      // Ni veredicto ni automatismo: siempre remite a revisión jurídica.
      expect(outcome).toMatch(locale === "es" ? /jur[íi]dic/i : /legal/i);
      expect(outcome).not.toMatch(
        locale === "es" ? /\beres proveedor\b/i : /\byou are a provider\b/i,
      );
    }
  });
});

describe("paridad ES/EN del catálogo", () => {
  for (const locale of LOCALES) {
    it(`${locale}: cada tipo, estado y base jurídica tiene texto`, () => {
      const t = getDictionary(locale).dashboard.pages.suppliers;
      for (const k of EVIDENCE_KINDS) {
        expect(t.kinds[k.key as keyof typeof t.kinds], `${locale} · ${k.key}`).toBeTruthy();
      }
      for (const s of EVIDENCE_STATUSES) {
        expect(t.statuses[s], `${locale} · ${s}`).toBeTruthy();
      }
      for (const trig of ART25_TRIGGERS) {
        expect(
          t.art25[trig.key as keyof typeof t.art25],
          `${locale} · ${trig.key}`,
        ).toBeTruthy();
      }
    });
  }

  it("los verbos difieren entre bases jurídicas: son el punto entero", () => {
    for (const locale of LOCALES) {
      const v = getDictionary(locale).dashboard.pages.suppliers.verbs;
      const all = [v.deliverable, v.publicSource, v.contractOnly, v.existsNoAccess];
      expect(new Set(all).size, locale).toBe(4);
    }
  });

  it("y difieren entre idiomas (nadie copió el español en el espejo inglés)", () => {
    const es = getDictionary("es").dashboard.pages.suppliers;
    const en = getDictionary("en").dashboard.pages.suppliers;
    expect(es.verbs.deliverable).not.toBe(en.verbs.deliverable);
    expect(es.verbs.contractOnly).not.toBe(en.verbs.contractOnly);
    expect(es.art25Outcome).not.toBe(en.art25Outcome);
  });
});
