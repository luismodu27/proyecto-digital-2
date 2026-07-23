-- ============================================================================
-- 0025 · Correcciones del red team ronda 2 (2026-07-23)
-- ============================================================================
-- La ronda 2 (sobre el código ya con 0024) confirmó que:
--   · FIX 1 y FIX 2 de 0024 (escalada admin→owner) AGUANTAN.
--   · FIX 3 de 0024 (bypass de plan) NO funciona: era cosmético.
--
-- Por qué falló FIX 3: `revoke update (plan) ... from authenticated` es un no-op.
-- Supabase concede por defecto UPDATE a NIVEL DE TABLA al rol `authenticated`, y
-- en PostgreSQL un privilegio de tabla autoriza TODAS las columnas — un `revoke`
-- a nivel de columna NO puede recortar un grant de tabla. Resultado: cualquier
-- owner seguía pudiendo `update organizations set plan='enterprise'` directo por
-- PostgREST y desbloquear todo lo de pago sin pagar.
--
-- El app NO actualiza `organizations` directamente como authenticated (todas las
-- lecturas son SELECT; `name`/`jurisdictions` se escriben por RPCs security
-- definer). Así que revocamos el UPDATE de TABLA y re-otorgamos solo columnas de
-- identidad no sensibles. `plan` (entitlements), `created_by`, `id`, `created_at`
-- y `jurisdictions` (gestionada por RPC) quedan NO escribibles por el cliente.
-- El webhook de Stripe usa service_role y el fundador el SQL Editor (postgres):
-- ninguno afectado.

revoke update on public.organizations from authenticated;
grant update (name, slug) on public.organizations to authenticated;

-- ---------------------------------------------------------------------------
-- LOW — fuga cross-tenant del estado de suscripción.
-- `org_has_active_subscription(org)` (0017) respondía para CUALQUIER org, sin el
-- guard de pertenencia que todas sus hermanas (verify_audit_chain, list_org_
-- members, set_org_jurisdictions…) sí aplican. Un usuario con el id de otra org
-- (los ids aparecen en refs de Stripe, tickets, enlaces, logs) podía saber si esa
-- empresa es cliente de pago. Se añade el mismo guard: fuera de tu nexo → false.
-- ---------------------------------------------------------------------------
create or replace function public.org_has_active_subscription(org uuid)
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.subscriptions
    where organization_id = org
      and status in ('active', 'trialing')
  ) and (org in (select private.user_orgs()))
$$;
