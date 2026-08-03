"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AccountMenu } from "@/components/dashboard/AccountMenu";
import { useT } from "@/lib/i18n/provider";
import type { Dictionary } from "@/lib/i18n";
import type { UserOrg } from "@/lib/mock-data";
import {
  DRAWER_ID, DRAWER_TITLE_ID, LOCK_PATH,
  countLocked, isActive, isLocked, visibleNav,
  type NavItem, type PlanTier,
} from "@/lib/dashboard/nav";

/* Clases ESTÁTICAS por variante. Nunca interpoladas: Tailwind v4 no ve `text-${x}`.
   `rail` es la cadena ACTUAL carácter por carácter → el escritorio no cambia. */
const ROW = {
  rail:
    "relative flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
  drawer:
    "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand",
} as const;

const STATE_RAIL = {
  active: "bg-brand-soft text-brand-strong",
  locked: "text-muted hover:bg-paper-sunken hover:text-ink-soft",
  normal: "text-ink-soft hover:translate-x-0.5 hover:bg-paper-sunken hover:text-ink",
} as const;

/* En el cajón no hay hover táctil y `transition-colors` no animaría el translate. */
const STATE_DRAWER = {
  active: "bg-brand-soft text-brand-strong",
  locked: "text-muted hover:bg-paper-sunken hover:text-ink-soft",
  normal: "text-ink-soft hover:bg-paper-sunken hover:text-ink",
} as const;

const ICON_BTN =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-paper-sunken hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand";

type TD = Dictionary["dashboard"];

function NavRow({
  item, variant, pathname, plan, td, onNavigate,
}: {
  item: NavItem;
  variant: "rail" | "drawer";
  pathname: string;
  plan?: PlanTier;
  td: TD;
  onNavigate?: () => void;
}) {
  const active = isActive(item.href, pathname);
  const locked = isLocked(item, plan);
  const state = variant === "rail" ? STATE_RAIL : STATE_DRAWER;
  // Frase completa para lectores de pantalla; ya existe traducida.
  const lockedText =
    item.requires === "enterprise" ? td.nav.lockedTitleEnterprise : td.nav.lockedTitle;
  // Nombre del plan para la insignia visible; reutiliza billing.tier (ya traducido).
  const tierName = item.requires ? td.billing.tier[item.requires] : "";

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${ROW[variant]} ${
        active ? state.active : locked ? state.locked : state.normal
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-4.5 shrink-0" fill="none" aria-hidden>
        <path d={item.icon} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="min-w-0 flex-1 truncate">{td.nav[item.key]}</span>

      {/* RAIL: candado decorativo + texto REAL para AT. Sin `title=` (no existe
          en táctil ni con teclado) y sin aria-label sobre un <svg> desnudo
          (no se expone de forma fiable en ningún motor). */}
      {locked && variant === "rail" && (
        <>
          <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 text-muted" fill="none" aria-hidden>
            <path d={LOCK_PATH} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sr-only">{lockedText}</span>
        </>
      )}

      {/* CAJÓN: insignia VISIBLE con el nombre del plan. La palanca comercial
          deja de depender de ARIA. El texto visible va aria-hidden y el sr-only
          lleva la frase completa: se anuncia UNA vez, no dos. */}
      {locked && variant === "drawer" && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--tone-gold-bd)] bg-[var(--tone-gold-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--tone-gold-fg)]">
          <svg viewBox="0 0 24 24" className="size-3 shrink-0" fill="none" aria-hidden>
            <path d={LOCK_PATH} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span aria-hidden>{tierName}</span>
          <span className="sr-only">{lockedText}</span>
        </span>
      )}
    </Link>
  );
}

export function Sidebar({
  userEmail, userName, plan, orgs, activeOrgId, isPlatformAdmin = false,
}: {
  userEmail?: string;
  userName?: string;
  plan?: PlanTier;
  orgs?: UserOrg[];
  activeOrgId?: string;
  /** Personal de Attesta: añade los paneles internos a la navegación. */
  isPlatformAdmin?: boolean;
}) {
  const pathname = usePathname();
  const t = useT();
  const td = t.dashboard;
  const nd = td.navDrawer;
  const items = visibleNav(isPlatformAdmin);
  const lockedCount = countLocked({ plan, isPlatformAdmin });

  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);          // SOLO para aria-expanded

  const openDrawer = useCallback(() => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    d.showModal();            // ← ÚNICA línea que exige JS para abrir
    setOpen(true);
    // React traduce `autoFocus` a un .focus() en el MONTAJE (con el diálogo aún
    // cerrado): falla en silencio. Hay que enfocar aquí, tras showModal().
    closeRef.current?.focus();
  }, []);

  const closeDrawer = useCallback(() => dialogRef.current?.close(), []);

  // Cierra al navegar: cubre el Logo del cajón, el AccountMenu (Facturación,
  // switchOrg, signOut), los redirect() de Server Actions y el botón Atrás.
  // El onClick por enlace cubre además pulsar el enlace YA activo, donde
  // `pathname` no cambia y este efecto no dispara.
  useEffect(() => { dialogRef.current?.close(); }, [pathname]);

  // `md:hidden` sobre un <dialog> ABIERTO lo deja invisible pero con el foco
  // dentro y el fondo inerte. Ocurre de verdad al rotar una tablet.
  // 768px = breakpoint `md` por defecto (el @theme del repo no redefine --breakpoint-*).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => { if (mq.matches) dialogRef.current?.close(); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const accountBlock = (placement: "auto" | "up") =>
    userEmail ? (
      <AccountMenu
        userEmail={userEmail}
        userName={userName}
        orgs={orgs}
        activeOrgId={activeOrgId}
        menuPlacement={placement}
      />
    ) : (
      <div className="rounded-xl border border-line bg-paper-sunken/60 p-4">
        <p className="text-xs font-medium text-ink">{td.sidebar.demoTitle}</p>
        <p className="mt-1 text-xs text-muted">{td.sidebar.demoBody}</p>
        <Link href="/" onClick={placement === "up" ? closeDrawer : undefined}
              className="mt-3 inline-block text-xs font-medium text-brand hover:text-brand-strong">
          {td.sidebar.backToSite}
        </Link>
      </div>
    );

  return (
    <>
      {/* ══ A) BARRA SUPERIOR MÓVIL — sticky. Hoy NADA es sticky en el dashboard
             y la navegación entera se pierde al bajar. z-30 a propósito: queda
             BAJO el overlay z-50 del WelcomeGuide, así que durante el primer
             login el disparador no es pulsable. ══════════════════════════════ */}
      {/* `<nav>` y no `<div>`: con el cajón cerrado, el rail es `hidden` y el
          `<dialog>` es `display:none`, así que en móvil no quedaría NINGÚN
          landmark de navegación en el documento.
          `pl-[max(…)]` y no `pl-[env(…)]` a secas: `pl-` gana a `px-` por orden
          de generación, y `env(safe-area-inset-left)` vale 0 mientras no haya
          `viewport-fit=cover` — la barra se quedaba sin padding izquierdo en
          TODOS los dispositivos. Mismo patrón que el `pb-[max(...)]` de abajo. */}
      <nav
        aria-label={nd.title}
        className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center gap-1 border-b border-line bg-paper-raised px-2 pl-[max(0.5rem,env(safe-area-inset-left))] md:hidden print:hidden"
      >
        <button
          type="button"
          onClick={openDrawer}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={DRAWER_ID}
          aria-label={nd.openMenu}
          className={`nav-drawer-trigger ${ICON_BTN}`}
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <Logo href="/dashboard" />
        <span className="flex-1" />
        <ThemeToggle />
      </nav>

      {/* ══ B) RAIL DE ESCRITORIO — idéntico a hoy de md: en adelante.
             Antes: flex w-full … border-b … md:h-dvh md:w-64 md:border-b-0 md:border-r
             Ahora: hidden … md:flex md:h-dvh md:w-64 md:border-r
             En md+ el computado es EXACTAMENTE el mismo. ═════════════════════ */}
      <aside className="hidden shrink-0 flex-col border-line bg-paper-raised md:flex md:h-dvh md:w-64 md:border-r print:hidden">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Logo href="/dashboard" />
          <ThemeToggle />
        </div>
        <nav aria-label={nd.title} className="flex flex-col gap-1 p-3">
          {items.map((item) => (
            <NavRow key={item.href} item={item} variant="rail" pathname={pathname} plan={plan} td={td} />
          ))}
        </nav>
        <div className="p-4 md:mt-auto">{accountBlock("auto")}</div>
      </aside>

      {/* ══ C) CAJÓN MODAL — <dialog> nativo, capa superior. ══════════════════
          ⚠️ REGLA QUE NO SE PUEDE ROMPER: este className NO puede contener
          NINGUNA utilidad de display (`flex`, `block`, `grid`, `inline-flex`).
          `dialog:not([open]){display:none}` es de origen UA y CUALQUIER regla de
          autor la vence — no por especificidad, por ORIGEN de cascada. El cajón
          quedaría permanentemente abierto tapando la pantalla. El layout va en
          el div INTERIOR. Hay un test estático que lo vigila.
          `max-h-none` + `m-0` anulan la hoja del UA para dialog:modal
          (max-height: calc(100% - 6px - 2em); margin: auto).
          Sin `h-dvh`: `inset-y-0` ya fija la altura y `dvh` baila mientras la
          barra de direcciones de iOS colapsa.

          No hay `onCancel`: el "doble Escape" (uno cierra el menú de cuenta,
          otro el cajón) NO se puede resolver desde aquí. Se intentó con una
          guarda `if (accountOpenRef.current)` y era código muerto — el
          `keydown` de AccountMenu corre ANTES y ya había puesto el ref a
          `false`, porque el `cancel` del diálogo es la acción POR DEFECTO de
          esa misma pulsación. Se arregla donde sí funciona, con
          `preventDefault()` en el handler de AccountMenu. ══════════════════ */}
      <dialog
        ref={dialogRef}
        id={DRAWER_ID}
        aria-labelledby={DRAWER_TITLE_ID}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // Los clics sobre ::backdrop tienen como target el propio <dialog>.
          // Funciona porque el diálogo lleva `p-0` (sin padding clicable).
          if (e.target === dialogRef.current) closeDrawer();
        }}
        className="nav-drawer fixed inset-y-0 left-0 right-auto m-0 w-[19.5rem] max-h-none max-w-[86vw] rounded-none border-y-0 border-l-0 border-r border-line bg-paper-raised p-0 pl-[max(0px,env(safe-area-inset-left))] text-ink shadow-2xl md:hidden print:hidden"
      >
        {/* SIN role="dialog" y SIN aria-modal: showModal() los aporta. Escribirlos
            a mano miente en cuanto alguien abra con show() o con el atributo open. */}
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line pl-4 pr-2">
            <h2 id={DRAWER_TITLE_ID} className="sr-only">{nd.title}</h2>
            {/* El cierre va en un envoltorio y no en el `Logo`, que no acepta
                `onClick`. Sin esto, abrir el cajón EN `/dashboard` y pulsar el
                logo no hacía nada: `pathname` no cambia, así que el efecto que
                cierra al navegar tampoco dispara. Un control muerto justo en la
                ruta por defecto. */}
            <span onClick={closeDrawer}>
              <Logo href="/dashboard" />
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={closeDrawer}
              aria-label={nd.closeMenu}
              className={ICON_BTN}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ── BLOQUE DE PLAN: la superficie comercial que NO depende del scroll.
                Se oculta entero en modo demo (`plan` undefined) y se queda en el
                chip a secas cuando no hay nada bloqueado. ─────────────────── */}
          {plan && (
            <div className="shrink-0 border-b border-line px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {nd.planLabel}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                    lockedCount > 0
                      ? "border-[var(--tone-gold-bd)] bg-[var(--tone-gold-bg)] text-[var(--tone-gold-fg)]"
                      : "border-[var(--tone-good-bd)] bg-[var(--tone-good-bg)] text-[var(--tone-good-fg)]"
                  }`}
                >
                  {td.billing.tier[plan]}
                </span>
              </div>
              {lockedCount > 0 && (
                <>
                  <p className="mt-1.5 text-xs leading-snug text-ink-soft">
                    {lockedCount === 1
                      ? nd.lockedCountOne
                      : nd.lockedCountMany.replace("{n}", String(lockedCount))}
                  </p>
                  <Link
                    href="/dashboard/facturacion"
                    onClick={closeDrawer}
                    className="mt-1.5 inline-flex min-h-11 items-center gap-1 text-xs font-medium text-brand hover:text-brand-strong focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {nd.seePlans}
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden>
                      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* ── LISTA PLANA, mismo orden que el rail (WCAG 3.2.3). El <nav> es el
                ÚNICO scroller: el bloque de cuenta no se va con el scroll. ─── */}
          <nav
            aria-label={nd.title}
            className="flex-1 overflow-y-auto overscroll-contain p-3"
          >
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => (
                <li key={item.href}>
                  <NavRow
                    item={item}
                    variant="drawer"
                    pathname={pathname}
                    plan={plan}
                    td={td}
                    onNavigate={closeDrawer}
                  />
                </li>
              ))}
            </ul>
          </nav>

          {/* ── CUENTA al fondo, como en el rail. `menuPlacement="up"` porque el
                desplegable es `top-full` en móvil y aquí no cabría hacia abajo.
                safe-area: en un iPhone con home indicator, sin esto la fila de
                cuenta queda bajo la barra del gesto. ────────────────────────── */}
          <div className="shrink-0 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {accountBlock("up")}
          </div>
        </div>
      </dialog>
    </>
  );
}

