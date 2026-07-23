-- Attesta — plan (nivel de acceso) por organización.
--
-- Tres niveles, en orden de acceso:
--   'free'        → Diagnóstico: inventario + clasificación de riesgo (1 usuario).
--   'preparacion' → desbloquea gap, plan, vigilancia, dossier/informe, packs, equipo, actividad.
--   'enterprise'  → todo lo de Preparación (+ futuro: multi-org, SSO, soporte prioritario).
--
-- El plan efectivo se resuelve en la app (`src/lib/billing/plan.ts`):
--   · staff de Attesta (platform_admins) → siempre 'enterprise';
--   · suscripción Stripe activa → al menos 'preparacion';
--   · si no, el valor de esta columna (por defecto 'free').
--
-- ADITIVO y seguro: si esta columna aún NO existe (migración sin aplicar), la app
-- degrada a acceso completo — nadie queda bloqueado por sorpresa. El bloqueo por
-- plan se activa SOLO cuando se aplica esta migración.

alter table public.organizations
  add column if not exists plan text not null default 'free';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_plan_check'
  ) then
    alter table public.organizations
      add constraint organizations_plan_check
      check (plan in ('free', 'preparacion', 'enterprise'));
  end if;
end $$;

-- Para elevar manualmente una organización (p. ej. Enterprise o cortesía), el
-- fundador ejecuta en el SQL Editor:
--   update public.organizations set plan = 'enterprise' where id = '<org-uuid>';
--   update public.organizations set plan = 'preparacion' where id = '<org-uuid>';
-- Ver el id de una org por el email de un miembro:
--   select o.id, o.name, o.plan from public.organizations o
--   join public.memberships m on m.organization_id = o.id
--   join auth.users u on u.id = m.user_id
--   where u.email = '<correo>';
