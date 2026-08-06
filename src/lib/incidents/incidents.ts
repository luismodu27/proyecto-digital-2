/**
 * Registro de incidentes del deployer (Art. 26.5 del Reglamento (UE) 2024/1689).
 *
 * LÓGICA PURA: sin React, sin Supabase, sin `next/*`. Vive aquí para poder
 * probarse, porque lo que codifica no es UI sino una **regla legal** que un `if`
 * invertido estropearía en silencio.
 *
 * Las tres cosas que este módulo existe para no equivocar —las tres son
 * contraintuitivas y las tres tienen test propio:
 *
 *  1. **El Art. 26.5 no contiene ni un solo plazo numérico.** Sus estándares son
 *     adverbiales: «sin demora injustificada» (rama de riesgo) e «inmediatamente»
 *     (rama de incidente grave). Los 15 / 10 / 2 días son del **Art. 73**.
 *
 *  2. **El Art. 73 obliga al PROVEEDOR, no al deployer.** Lo que aporta la fecha
 *     de conocimiento del deployer es el **inicio** de ese plazo ajeno. El
 *     deployer solo asume el 73 él mismo cuando **no consigue contactar con el
 *     proveedor** (el «mutatis mutandis» del último inciso del 26.5). Por eso
 *     `deadlineReference()` devuelve `owner: "provider"` salvo que se marque
 *     `providerUnreachable`: enseñar «te quedan 12 días» sin esa casilla sería
 *     falso para la inmensa mayoría de los casos.
 *
 *  3. **La obligación de SUSPENDER el uso está en la rama del riesgo del
 *     Art. 79.1, no en la del incidente grave.** Suena al revés (un incidente
 *     grave "suena peor"), y es el error fácil: `suspensionRequired()` mira
 *     `riskArt79` y NO mira `seriousness`.
 *
 * Encuadre temporal: el Art. 26 es exigible para el alto riesgo del Anexo III
 * desde el **2-dic-2027** (Reglamento (UE) 2026/1744). Registrar incidentes hoy
 * es **preparación**, no una obligación vencida — de ahí que aquí no haya
 * ninguna cuenta atrás de una obligación del 26.5.
 */
import { daysUntilDate, parseIsoDateUTC } from "@/lib/date";

/* -------------------------------------------------------------------------- */
/* Categorías del Art. 3, punto 49                                            */
/* -------------------------------------------------------------------------- */

/**
 * Supuestos que convierten un incidente (o un **mal funcionamiento**) en
 * «grave». La definición admite causalidad **directa o indirecta**.
 *
 * Son **cinco** y no cuatro: la letra (a) del Art. 3.49 —«muerte de una persona
 * o daño grave para la salud»— se parte en dos porque el Art. 73 le asigna
 * plazos distintos (10 días al fallecimiento, 15 al resto). El enum sigue al
 * plazo, que es lo que el registro necesita distinguir, no a la letra.
 */
export const INCIDENT_CATEGORIES = [
  "death",
  "serious_health_harm",
  "critical_infrastructure",
  "fundamental_rights",
  "property_or_environment",
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

/** Letra del Art. 3.49 de la que sale cada categoría (para la cita en la UI). */
export const CATEGORY_LETTER: Record<IncidentCategory, string> = {
  death: "a",
  serious_health_harm: "a",
  critical_infrastructure: "b",
  fundamental_rights: "c",
  property_or_environment: "d",
};

/**
 * Estado de calificación. `under_assessment` no es un adorno: al abrir la ficha
 * casi nadie sabe todavía si el evento es «grave» en el sentido del Art. 3.49, y
 * obligar a decidirlo en ese momento produce o bien registros falsos o bien
 * ningún registro. El expediente empieza como evento observado y **escala**.
 */
export const SERIOUSNESS = ["under_assessment", "serious", "not_serious"] as const;
export type Seriousness = (typeof SERIOUSNESS)[number];

export type IncidentStatus = "open" | "closed";

/** Destinatarios de la notificación declarada. */
export const NOTIFY_TARGETS = ["provider", "distributor", "authority"] as const;
export type NotifyTarget = (typeof NOTIFY_TARGETS)[number];

export type Incident = {
  id: string;
  systemId: string | null;
  systemName: string | null;
  title: string;
  detail: string | null;
  /** Cuándo ocurrió (puede no saberse). */
  occurredOn: string | null;
  /**
   * Cuándo tuvo conocimiento la organización. **Obligatorio.** Es el dato de
   * mayor valor probatorio de todo el expediente: el Art. 73 cuenta sus plazos
   * «desde que el proveedor **o, en su caso, el responsable del despliegue**
   * tenga conocimiento», así que esta fecha arranca un reloj que corre para otro.
   */
  awareOn: string;
  /** Cuándo se estableció el nexo causal (o su probabilidad razonable). */
  causalLinkOn: string | null;
  categories: IncidentCategory[];
  seriousness: Seriousness;
  /**
   * ¿Hay motivos para considerar que el uso **conforme a las instrucciones**
   * puede hacer que el sistema presente un riesgo del Art. 79.1 (salud,
   * seguridad o derechos fundamentales)? Esta es la rama que obliga a suspender.
   */
  riskArt79: boolean;
  /** La organización declara haber suspendido el uso. */
  useSuspended: boolean;
  /** No se ha podido contactar con el proveedor → el 26.5 remite al Art. 73. */
  providerUnreachable: boolean;
  notifiedProviderOn: string | null;
  notifiedDistributorOn: string | null;
  notifiedAuthorityOn: string | null;
  /**
   * ¿Es ADEMÁS una violación de seguridad de datos personales? Bandera
   * **independiente** a propósito: los relojes del RGPD 33/34 (72 h a la
   * autoridad de protección de datos) corren en paralelo y ninguno sustituye al
   * otro. Fundirlos en un solo contador es la forma más rápida de que alguien
   * pierda las 72 h creyendo que «ya lo notificó».
   */
  personalDataBreach: boolean;
  status: IncidentStatus;
  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/* Plazos del Art. 73 — del PROVEEDOR                                         */
/* -------------------------------------------------------------------------- */

/**
 * Días del Art. 73 por categoría: 2 días para infraestructuras críticas
 * (73.3), 10 para el fallecimiento (73.4) y 15 como regla general (73.2).
 */
export const ART73_DAYS: Record<IncidentCategory, number> = {
  death: 10,
  serious_health_harm: 15,
  critical_infrastructure: 2,
  fundamental_rights: 15,
  property_or_environment: 15,
};

/** Regla general del Art. 73.2, la que aplica cuando aún no se ha categorizado. */
export const ART73_DEFAULT_DAYS = 15;

/**
 * Plazo aplicable a un incidente: el **más corto** de sus categorías. Un mismo
 * hecho puede caer en varias (una caída de un sistema sanitario puede ser daño
 * a la salud Y perturbación de infraestructura crítica) y el que manda es el
 * más exigente, nunca el primero de la lista ni la media.
 *
 * Sin categorías se devuelve la regla general de 15 días: es el plazo del
 * Art. 73.2, no una invención, y no dejar plazo alguno sería peor.
 */
export function art73Days(categories: IncidentCategory[]): number {
  let days = ART73_DEFAULT_DAYS;
  for (const c of categories) {
    const d = ART73_DAYS[c];
    if (d !== undefined && d < days) days = d;
  }
  return days;
}

/**
 * Referencia de plazo que la UI puede mostrar **sin mentir**.
 *
 * - `owner: "provider"` — el caso normal. El plazo es del proveedor y se cuenta
 *   desde TU fecha de conocimiento. Tu registro fija cuándo empezó a correr.
 * - `owner: "self"` — solo si `providerUnreachable`. Ahí, y solo ahí, el 26.5
 *   remite al Art. 73 «mutatis mutandis» y el plazo es tuyo de verdad.
 * - `null` — no hay plazo del 73 que citar (el incidente no está calificado
 *   como grave, o falta la fecha de conocimiento).
 */
export type DeadlineReference = {
  owner: "provider" | "self";
  days: number;
  dueOn: string;
  daysLeft: number;
};

export function deadlineReference(
  i: Incident,
  now: Date,
): DeadlineReference | null {
  // Los plazos del 73 solo existen para incidentes GRAVES. Un evento en
  // evaluación no tiene plazo todavía: inventarle uno sería alarmismo.
  if (i.seriousness !== "serious") return null;
  const from = parseIsoDateUTC(i.awareOn);
  if (!from) return null;

  const days = art73Days(i.categories);
  from.setUTCDate(from.getUTCDate() + days);
  const dueOn = from.toISOString().slice(0, 10);
  return {
    owner: i.providerUnreachable ? "self" : "provider",
    days,
    dueOn,
    daysLeft: daysUntilDate(dueOn, now) ?? 0,
  };
}

/**
 * Días transcurridos desde el conocimiento. Cronómetro **ascendente**: el deber
 * del 26.5 es «inmediatamente», así que contar hacia arriba es exacto y una
 * cuenta atrás inventaría un plazo que la norma no da.
 */
export function daysSinceAware(i: Incident, now: Date): number {
  const d = daysUntilDate(i.awareOn, now);
  const days = d === null ? 0 : -d;
  // Negar 0 da `-0`, que en JS es un valor distinto de `0` para `Object.is` (y
  // por tanto para los tests). Se normaliza aquí y no en cada llamador.
  return days === 0 ? 0 : days;
}

/* -------------------------------------------------------------------------- */
/* Los tres deberes del Art. 26.5                                             */
/* -------------------------------------------------------------------------- */

/**
 * `risk`   — hay motivos para considerar un riesgo del Art. 79.1: informar al
 *            proveedor **o** distribuidor **y** a la autoridad de vigilancia del
 *            mercado, «sin demora injustificada», **y suspender el uso**.
 * `serious`— se ha detectado un incidente grave: informar «inmediatamente»,
 *            **primero al proveedor** y **después** al importador o distribuidor
 *            y a las autoridades.
 *
 * Los dos pueden concurrir, y de hecho suelen: un incidente grave casi siempre
 * arrastra también el supuesto de riesgo. Cuando concurren, quien obliga a
 * suspender sigue siendo `risk`.
 */
export type DutyKey = "risk" | "serious";

export function applicableDuties(i: Incident): DutyKey[] {
  const out: DutyKey[] = [];
  if (i.riskArt79) out.push("risk");
  if (i.seriousness === "serious") out.push("serious");
  return out;
}

/**
 * ¿El Art. 26.5 obliga a suspender el uso?
 *
 * Mira **solo** `riskArt79`. Que un incidente sea grave no dispara por sí mismo
 * la suspensión: el mandato «suspenderán el uso» está en la frase del riesgo del
 * Art. 79.1, no en la del incidente grave. Hay un test que rompe si alguien
 * "arregla" esto añadiendo `|| seriousness === "serious"`.
 */
export function suspensionRequired(i: Incident): boolean {
  return i.riskArt79;
}

export type NotificationStep = {
  target: NotifyTarget;
  /**
   * Orden legal. En la rama de incidente grave el 26.5 es literal («primero…
   * después»): el proveedor es 1 y los demás 2. En la rama de riesgo no hay
   * secuencia —son destinatarios simultáneos— y todos van con orden 1.
   */
  order: number;
  notifiedOn: string | null;
};

/**
 * Qué destinatarios hay que registrar y en qué orden, según los deberes que
 * concurran. Devuelve `[]` cuando no aplica ninguno: mientras el evento esté en
 * evaluación y no haya riesgo del 79.1, no hay nadie a quien informar todavía.
 *
 * `ordered` distingue las dos gramáticas del artículo, que no son
 * intercambiables: «al proveedor **o** distribuidor **y** a la autoridad»
 * (disyuntiva, simultánea) frente a «**primero** al proveedor **y después** al
 * importador o distribuidor y a las autoridades» (secuencia expresa).
 */
export function notificationPlan(i: Incident): {
  ordered: boolean;
  steps: NotificationStep[];
} {
  const duties = applicableDuties(i);
  if (duties.length === 0) return { ordered: false, steps: [] };

  const ordered = duties.includes("serious");
  const on: Record<NotifyTarget, string | null> = {
    provider: i.notifiedProviderOn,
    distributor: i.notifiedDistributorOn,
    authority: i.notifiedAuthorityOn,
  };

  const steps: NotificationStep[] = ordered
    ? [
        { target: "provider", order: 1, notifiedOn: on.provider },
        { target: "distributor", order: 2, notifiedOn: on.distributor },
        { target: "authority", order: 2, notifiedOn: on.authority },
      ]
    : [
        { target: "provider", order: 1, notifiedOn: on.provider },
        { target: "distributor", order: 1, notifiedOn: on.distributor },
        { target: "authority", order: 1, notifiedOn: on.authority },
      ];
  return { ordered, steps };
}

/** Destinatarios que la organización aún no declara haber informado. */
export function pendingTargets(i: Incident): NotifyTarget[] {
  return notificationPlan(i)
    .steps.filter((s) => !s.notifiedOn)
    .map((s) => s.target);
}

/**
 * Semáforo del expediente. `attention` es lo que la portada debe destacar:
 * abierto, con deberes de notificación activos y algo sin registrar.
 */
export type IncidentStage = "closed" | "attention" | "notified" | "logged";

export function incidentStage(i: Incident): IncidentStage {
  if (i.status === "closed") return "closed";
  const plan = notificationPlan(i);
  if (plan.steps.length === 0) return "logged";
  return plan.steps.some((s) => !s.notifiedOn) ? "attention" : "notified";
}

/**
 * Orden de la lista: primero lo que pide atención, luego lo notificado, luego lo
 * registrado sin deberes activos y al final lo cerrado. Dentro de cada grupo, lo
 * más reciente por fecha de conocimiento arriba, con desempate estable por id
 * (dos incidentes del mismo día no pueden bailar entre renders).
 */
const STAGE_ORDER: Record<IncidentStage, number> = {
  attention: 0,
  notified: 1,
  logged: 2,
  closed: 3,
};

export function sortIncidents(list: Incident[]): Incident[] {
  return [...list].sort((a, b) => {
    const sa = STAGE_ORDER[incidentStage(a)];
    const sb = STAGE_ORDER[incidentStage(b)];
    if (sa !== sb) return sa - sb;
    if (a.awareOn !== b.awareOn) return b.awareOn.localeCompare(a.awareOn);
    return a.id.localeCompare(b.id);
  });
}

export type IncidentCounts = {
  total: number;
  open: number;
  serious: number;
  /** Abiertos con alguna notificación declarada pendiente. */
  attention: number;
  /** Abiertos con riesgo del 79.1 declarado y sin suspensión registrada. */
  unsuspended: number;
};

export function countIncidents(list: Incident[]): IncidentCounts {
  const c: IncidentCounts = {
    total: list.length,
    open: 0,
    serious: 0,
    attention: 0,
    unsuspended: 0,
  };
  for (const i of list) {
    if (i.status === "open") c.open += 1;
    if (i.seriousness === "serious") c.serious += 1;
    if (incidentStage(i) === "attention") c.attention += 1;
    if (i.status === "open" && suspensionRequired(i) && !i.useSuspended) {
      c.unsuspended += 1;
    }
  }
  return c;
}
