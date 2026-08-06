/**
 * Secciones del resumen que se transmiten por STREAMING.
 *
 * Por qué existen. La portada hacía un solo `Promise.all` de diez consultas y no
 * pintaba **nada** hasta que volvía la última: la más lenta decidía el tiempo de
 * la página entera. Aquí cada bloque independiente es un Server Component
 * `async` propio, envuelto en `<Suspense>` desde la página, así que el esqueleto
 * y los KPIs salen en cuanto está el inventario y el resto va llegando.
 *
 * Regla al añadir un bloque nuevo: si su dato **solo lo usa él**, va aquí y se
 * busca su dato dentro. Si el dato lo comparten dos bloques, o se pasa por props
 * desde la página (que ya lo tiene), o el getter lleva `cache()` — si no, se
 * duplica la consulta y el streaming sale más caro que lo que ahorra. `systems`
 * viaja por props justo por eso; `getGapItems` lleva `cache()` porque lo miran
 * dos bloques.
 *
 * Los `now` también bajan por props: dos `new Date()` en la misma página pueden
 * caer a distinto lado de la medianoche y hacer que un contador y un aviso se
 * contradigan en la misma pantalla.
 */
import Link from "next/link";
import type { AiSystem } from "@/lib/data";
import {
  getActionTasks,
  getGapItems,
  getOrgJurisdictions,
  getOrgMembers,
  getRegulatoryAcks,
  getRegulatoryEvents,
  getReviewCadenceDays,
} from "@/lib/data";
import { StatCard } from "@/components/dashboard/parts";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { DeadlineReminders } from "@/components/dashboard/DeadlineReminders";
import { ReviewReminders } from "@/components/dashboard/ReviewReminders";
import { regAckLabel, type RegAckStatus } from "@/lib/mock-data";
import {
  FRAMEWORK_META,
  affectedSystems,
  daysUntil,
  frameworkMeta,
  upcomingDeadlines,
  type RegulatoryEvent,
} from "@/lib/regulatory-watch";
import { resolveLocale } from "@/lib/i18n/resolve";
import { getDictionary } from "@/lib/i18n";

const ACK_CHIP: Record<RegAckStatus, string> = {
  reviewed:
    "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)]",
  planned:
    "border-[var(--tone-info-bd)] bg-[var(--tone-info-bg)] text-[var(--tone-info-fg)]",
  not_applicable:
    "border-[var(--tone-neutral-bd)] bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-fg)]",
};

/* -------------------------------------------------------------------------- */
/* Esqueletos                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Los esqueletos reservan LA ALTURA del bloque que sustituyen. Si no, al llegar
 * el dato el contenido de abajo salta, que es peor que esperar: mover el sitio
 * donde alguien está a punto de pulsar es un fallo de usabilidad, no un detalle.
 *
 * `aria-hidden`: son adorno. Quien usa lector de pantalla ya recibe el aviso de
 * la región `aria-busy` de la página; anunciar además cada placeholder sería
 * ruido.
 */
function Skeleton({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-2xl border border-line bg-paper-raised ${className}`}
    />
  );
}

export const StatSkeleton = () => <Skeleton className="h-[5.5rem]" />;
export const MilestoneSkeleton = () => <Skeleton className="mt-6 h-[4.75rem]" />;
/** El checklist se oculta solo al completarse: sin alto fijo no habría salto. */
export const ChecklistSkeleton = () => <Skeleton className="mb-6 h-14" />;
/**
 * Los avisos no se renderizan cuando no hay nada que avisar, que es el caso
 * normal de una cuenta sana. Reservarles alto dejaría un hueco permanente, así
 * que aquí no hay esqueleto a propósito: aparecen cuando existen.
 */
export const RemindersSkeleton = () => null;

/* -------------------------------------------------------------------------- */
/* Bloques                                                                     */
/* -------------------------------------------------------------------------- */

/** Tarjeta de brechas abiertas. Su consulta es la que más tarda de la fila. */
export async function OpenGapsStat() {
  const gaps = await getGapItems();
  const o = getDictionary(await resolveLocale()).dashboard.overview;
  return (
    <StatCard
      label={o.stat.openGaps}
      value={gaps.filter((g) => g.status !== "done").length}
      hint={o.stat.openGapsHint}
      accent="warn"
      href="/dashboard/gap"
    />
  );
}

/** Primeros pasos de activación (necesita brechas y equipo). */
export async function ActivationChecklist({
  systems,
  userId,
}: {
  systems: AiSystem[];
  userId?: string;
}) {
  const [gaps, members] = await Promise.all([getGapItems(), getOrgMembers()]);
  const d = getDictionary(await resolveLocale()).dashboard;
  const steps = [
    {
      key: "system",
      label: d.onboarding.steps.system.label,
      hint: d.onboarding.steps.system.hint,
      href: "/dashboard/inventario/nuevo",
      done: systems.length > 0,
    },
    {
      key: "risk",
      label: d.onboarding.steps.risk.label,
      hint: d.onboarding.steps.risk.hint,
      href: "/dashboard/riesgo/evaluar",
      done: systems.some((s) => !!s.evidenceState),
    },
    {
      key: "gap",
      label: d.onboarding.steps.gap.label,
      hint: d.onboarding.steps.gap.hint,
      href: "/dashboard/packs",
      done: gaps.length > 0,
      paid: true,
    },
    {
      key: "team",
      label: d.onboarding.steps.team.label,
      hint: d.onboarding.steps.team.hint,
      href: "/dashboard/equipo",
      done: members.length > 1,
      paid: true,
    },
  ];
  return <OnboardingChecklist steps={steps} userId={userId} />;
}

/** Próximo hito regulatorio (radar + acuses + nexo de jurisdicción). */
export async function NextMilestone({
  systems,
  now,
}: {
  systems: AiSystem[];
  now: Date;
}) {
  const [regEvents, regAcks, orgJur] = await Promise.all([
    getRegulatoryEvents(),
    getRegulatoryAcks(),
    getOrgJurisdictions(),
  ]);
  const locale = await resolveLocale();
  const d = getDictionary(locale).dashboard;
  const o = d.overview;

  // Respeta el nexo: si está configurado, solo hitos de esas jurisdicciones.
  const inNexus = (e: RegulatoryEvent) =>
    orgJur.length === 0 ||
    orgJur.includes(FRAMEWORK_META[e.framework]?.jurisdiction ?? "");
  const next = upcomingDeadlines(now, regEvents).filter(inNexus)[0];
  if (!next) return null;

  const days = daysUntil(next.date, now);
  const affected = affectedSystems(next, systems).length;
  const ack = regAcks[next.id];
  const tone =
    days <= 45
      ? "text-[var(--tone-danger-fg)]"
      : days <= 365
        ? "text-[var(--tone-gold-fg)]"
        : "text-ink";

  return (
    <Link
      href="/dashboard/vigilancia"
      className="card-lift mt-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper-raised px-5 py-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
          <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden>
            <path
              d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs uppercase tracking-wide text-muted">
              {o.nextMilestone} ·{" "}
              {frameworkMeta(next.framework, locale)?.short ?? next.framework}
            </p>
            {ack ? (
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${ACK_CHIP[ack.status]}`}
              >
                {regAckLabel(ack.status, locale)}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[11px] font-medium text-muted">
                {d.pages.monitoring.notMarked}
              </span>
            )}
          </div>
          <p className="truncate text-sm font-medium text-ink">{next.title}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className={`text-sm font-semibold tabular-nums ${tone}`}>
            {days === 0
              ? o.today
              : `${o.inDaysPrefix}${days} ${days === 1 ? d.units.dayOne : d.units.dayOther}`}
          </p>
          <p className="text-xs text-muted">
            {affected}{" "}
            {affected === 1 ? d.units.systemOne : d.units.systemOther}
          </p>
        </div>
        <span className="text-brand transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Link>
  );
}

/** Vencimientos del plan de acción. */
export async function TaskDeadlines({ now }: { now: Date }) {
  const tasks = await getActionTasks();
  const locale = await resolveLocale();
  const d = getDictionary(locale).dashboard;
  return (
    <DeadlineReminders
      tasks={tasks}
      now={now}
      t={d.deadlines}
      locale={locale}
    />
  );
}

/** Revisiones de la autoevaluación pendientes. */
export async function ReviewSection({
  systems,
  now,
}: {
  systems: AiSystem[];
  now: Date;
}) {
  const cadenceDays = await getReviewCadenceDays();
  const d = getDictionary(await resolveLocale()).dashboard;
  return (
    <ReviewReminders
      systems={systems}
      cadenceDays={cadenceDays}
      now={now}
      t={d.pages.incidents}
    />
  );
}
