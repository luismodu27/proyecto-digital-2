-- Attesta — suscripciones (Stripe). Una fila por organización.
--
-- La escribe SOLO el webhook de Stripe (con service_role, que salta RLS). Los
-- miembros de la organización pueden leer su propia suscripción. El estado
-- gobierna el acceso a las funciones de pago (bloqueo por suscripción).
--
-- ADITIVO. Compatible con modo demo (no existe la tabla → la app no bloquea).

create table if not exists public.subscriptions (
  organization_id        uuid primary key references public.organizations (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 text not null default 'inactive',
  price_id               text,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx
  on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

-- Los miembros de la org pueden leer su suscripción. Nadie la escribe por RLS:
-- solo el service_role (webhook), que la ignora.
drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

-- updated_at automático.
drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ¿La organización tiene una suscripción que da acceso? (activa o en prueba)
create or replace function public.org_has_active_subscription(org uuid)
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.subscriptions
    where organization_id = org
      and status in ('active', 'trialing')
  )
$$;

revoke all on function public.org_has_active_subscription(uuid) from anon;
grant execute on function public.org_has_active_subscription(uuid) to authenticated;
