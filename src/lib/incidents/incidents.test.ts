import { describe, expect, it } from "vitest";
import {
  ART73_DAYS,
  ART73_DEFAULT_DAYS,
  CATEGORY_LETTER,
  INCIDENT_CATEGORIES,
  applicableDuties,
  art73Days,
  countIncidents,
  daysSinceAware,
  deadlineReference,
  incidentStage,
  notificationPlan,
  pendingTargets,
  sortIncidents,
  suspensionRequired,
  type Incident,
} from "./incidents";

/**
 * Estos tests codifican la EXPECTATIVA REGULATORIA del Art. 26.5, no la
 * implementación. Cada bloque protege una regla que un `if` invertido
 * estropearía sin que `tsc`, `lint` ni el build dijeran nada.
 */

const BASE: Incident = {
  id: "inc-1",
  systemId: "SYS-001",
  systemName: "Cribado de CVs",
  title: "Descartes anómalos en un perfil de candidatas",
  detail: null,
  occurredOn: "2026-07-01",
  awareOn: "2026-07-03",
  causalLinkOn: null,
  categories: [],
  seriousness: "under_assessment",
  riskArt79: false,
  useSuspended: false,
  providerUnreachable: false,
  notifiedProviderOn: null,
  notifiedDistributorOn: null,
  notifiedAuthorityOn: null,
  personalDataBreach: false,
  status: "open",
  createdAt: "2026-07-03T10:00:00Z",
};

const make = (patch: Partial<Incident>): Incident => ({ ...BASE, ...patch });

const NOW = new Date("2026-07-10T12:00:00Z");

describe("categorías del Art. 3, punto 49", () => {
  it("son cinco: la letra (a) se parte en muerte y daño grave a la salud", () => {
    // No es una licencia: el Art. 73 les da plazos distintos (10 vs 15 días), y
    // el enum sigue al plazo porque es lo que el registro necesita distinguir.
    expect(INCIDENT_CATEGORIES).toHaveLength(5);
    expect(CATEGORY_LETTER.death).toBe("a");
    expect(CATEGORY_LETTER.serious_health_harm).toBe("a");
  });

  it("cubre las cuatro letras del artículo, sin inventar una quinta", () => {
    const letters = new Set(Object.values(CATEGORY_LETTER));
    expect([...letters].sort()).toEqual(["a", "b", "c", "d"]);
  });
});

describe("plazos del Art. 73", () => {
  it("2 días para infraestructuras críticas, 10 para el fallecimiento, 15 el resto", () => {
    expect(ART73_DAYS.critical_infrastructure).toBe(2);
    expect(ART73_DAYS.death).toBe(10);
    expect(ART73_DAYS.serious_health_harm).toBe(15);
    expect(ART73_DAYS.fundamental_rights).toBe(15);
    expect(ART73_DAYS.property_or_environment).toBe(15);
  });

  it("con varias categorías manda la MÁS corta, no la primera ni la media", () => {
    // Un mismo hecho puede ser daño a la salud Y perturbación de infraestructura
    // crítica. Quedarse con 15 días porque va primero en la lista sería tarde.
    expect(art73Days(["serious_health_harm", "critical_infrastructure"])).toBe(2);
    expect(art73Days(["critical_infrastructure", "serious_health_harm"])).toBe(2);
    expect(art73Days(["fundamental_rights", "death"])).toBe(10);
  });

  it("sin categorías cae en la regla general del 73.2 (15 días)", () => {
    expect(art73Days([])).toBe(ART73_DEFAULT_DAYS);
    expect(ART73_DEFAULT_DAYS).toBe(15);
  });
});

describe("de quién es el plazo (la regla que más fácil se miente)", () => {
  const serious = make({ seriousness: "serious", categories: ["fundamental_rights"] });

  it("por defecto el plazo es DEL PROVEEDOR, contado desde tu conocimiento", () => {
    // El Art. 73.1 obliga a los proveedores. Lo que aporta el deployer es la
    // fecha que arranca ese plazo ajeno; enseñarlo como propio sería falso.
    const ref = deadlineReference(serious, NOW);
    expect(ref?.owner).toBe("provider");
    expect(ref?.days).toBe(15);
    expect(ref?.dueOn).toBe("2026-07-18"); // 3 jul + 15 días
  });

  it("solo pasa a ser TUYO si no se ha podido contactar con el proveedor", () => {
    // Es el «mutatis mutandis» del último inciso del Art. 26.5. Sin esa casilla
    // marcada, ninguna cuenta atrás legal es del deployer.
    const ref = deadlineReference(make({ ...serious, providerUnreachable: true }), NOW);
    expect(ref?.owner).toBe("self");
  });

  it("un incidente en evaluación no tiene plazo del 73 que citar", () => {
    expect(deadlineReference(make({ seriousness: "under_assessment" }), NOW)).toBeNull();
    expect(deadlineReference(make({ seriousness: "not_serious" }), NOW)).toBeNull();
  });

  it("la categoría más exigente acorta la fecha de referencia", () => {
    const ref = deadlineReference(
      make({ seriousness: "serious", categories: ["critical_infrastructure"] }),
      NOW,
    );
    expect(ref?.days).toBe(2);
    expect(ref?.dueOn).toBe("2026-07-05");
    expect(ref?.daysLeft).toBe(-5); // ya pasó respecto al 10 de julio
  });
});

describe("suspensión del uso", () => {
  it("la obliga el riesgo del Art. 79.1, NO que el incidente sea grave", () => {
    // Suena al revés y por eso está aquí: el mandato «suspenderán el uso» está
    // en la frase del riesgo del 79.1, no en la del incidente grave.
    expect(suspensionRequired(make({ riskArt79: true, seriousness: "not_serious" }))).toBe(true);
    expect(suspensionRequired(make({ riskArt79: false, seriousness: "serious" }))).toBe(false);
  });

  it("un incidente grave CON riesgo del 79.1 sí obliga a suspender", () => {
    expect(suspensionRequired(make({ riskArt79: true, seriousness: "serious" }))).toBe(true);
  });
});

describe("deberes que concurren", () => {
  it("ninguno mientras el evento está en evaluación y no hay riesgo declarado", () => {
    expect(applicableDuties(BASE)).toEqual([]);
    expect(notificationPlan(BASE).steps).toEqual([]);
    expect(pendingTargets(BASE)).toEqual([]);
  });

  it("los dos pueden darse a la vez", () => {
    expect(applicableDuties(make({ riskArt79: true, seriousness: "serious" }))).toEqual([
      "risk",
      "serious",
    ]);
  });
});

describe("orden de la notificación", () => {
  it("incidente grave: PRIMERO el proveedor, después distribuidor y autoridad", () => {
    // El Art. 26.5 es literal aquí («primero… y después»).
    const plan = notificationPlan(make({ seriousness: "serious" }));
    expect(plan.ordered).toBe(true);
    expect(plan.steps.map((s) => [s.target, s.order])).toEqual([
      ["provider", 1],
      ["distributor", 2],
      ["authority", 2],
    ]);
  });

  it("riesgo del 79.1: destinatarios simultáneos, sin secuencia", () => {
    // «al proveedor O distribuidor Y a la autoridad»: disyuntiva, no secuencia.
    const plan = notificationPlan(make({ riskArt79: true }));
    expect(plan.ordered).toBe(false);
    expect(plan.steps.every((s) => s.order === 1)).toBe(true);
  });

  it("si concurren los dos deberes manda la secuencia del incidente grave", () => {
    const plan = notificationPlan(make({ riskArt79: true, seriousness: "serious" }));
    expect(plan.ordered).toBe(true);
    expect(plan.steps[0].target).toBe("provider");
  });

  it("lo ya declarado deja de estar pendiente", () => {
    const i = make({ seriousness: "serious", notifiedProviderOn: "2026-07-03" });
    expect(pendingTargets(i)).toEqual(["distributor", "authority"]);
  });
});

describe("cronómetro del deber «inmediatamente»", () => {
  it("cuenta hacia ARRIBA desde el conocimiento", () => {
    // Contar hacia abajo inventaría un plazo que el Art. 26.5 no da.
    expect(daysSinceAware(make({ awareOn: "2026-07-03" }), NOW)).toBe(7);
    expect(daysSinceAware(make({ awareOn: "2026-07-10" }), NOW)).toBe(0);
  });
});

describe("estado del expediente y orden de la lista", () => {
  it("pide atención mientras quede alguna notificación sin declarar", () => {
    expect(incidentStage(make({ seriousness: "serious" }))).toBe("attention");
  });

  it("pasa a notificado cuando están las tres", () => {
    const i = make({
      seriousness: "serious",
      notifiedProviderOn: "2026-07-03",
      notifiedDistributorOn: "2026-07-04",
      notifiedAuthorityOn: "2026-07-04",
    });
    expect(incidentStage(i)).toBe("notified");
  });

  it("sin deberes activos queda simplemente registrado", () => {
    expect(incidentStage(BASE)).toBe("logged");
  });

  it("cerrado gana sobre todo lo demás", () => {
    expect(incidentStage(make({ seriousness: "serious", status: "closed" }))).toBe("closed");
  });

  it("ordena por urgencia y, a igualdad, por conocimiento más reciente", () => {
    const list = [
      make({ id: "c", status: "closed", awareOn: "2026-07-09" }),
      make({ id: "a", seriousness: "serious", awareOn: "2026-07-01" }),
      make({ id: "b", seriousness: "serious", awareOn: "2026-07-05" }),
      make({ id: "d", awareOn: "2026-07-08" }),
    ];
    expect(sortIncidents(list).map((i) => i.id)).toEqual(["b", "a", "d", "c"]);
  });

  it("no muta el array recibido", () => {
    const list = [make({ id: "z" }), make({ id: "a", seriousness: "serious" })];
    sortIncidents(list);
    expect(list.map((i) => i.id)).toEqual(["z", "a"]);
  });
});

describe("recuento para la portada", () => {
  it("separa abiertos, graves, pendientes de notificar y sin suspender", () => {
    const list = [
      make({ id: "1", riskArt79: true, useSuspended: false }),
      make({ id: "2", riskArt79: true, useSuspended: true }),
      make({ id: "3", seriousness: "serious", status: "closed" }),
      make({ id: "4", seriousness: "serious" }),
    ];
    expect(countIncidents(list)).toEqual({
      total: 4,
      open: 3,
      serious: 2,
      attention: 3, // 1, 2 y 4 (el 3 está cerrado)
      unsuspended: 1, // solo el 1
    });
  });

  it("un incidente cerrado no cuenta como pendiente de suspender", () => {
    const c = countIncidents([make({ riskArt79: true, status: "closed" })]);
    expect(c.unsuspended).toBe(0);
  });
});
