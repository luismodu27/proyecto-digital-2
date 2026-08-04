-- 0036_billing_lifecycle.sql
-- Ciclo de vida de facturación: idempotencia, orden y reconciliación.
--
-- LOS TRES AGUJEROS QUE CIERRA, todos del tipo "no se ve hasta que ya pasó":
--
-- 1. SIN IDEMPOTENCIA. Stripe REINTENTA los webhooks (ante un timeout, un 5xx, o
--    simplemente porque sí). El `upsert` de la suscripción aguantaba el reintento
--    por casualidad, pero el evento de telemetría `checkout_completed` no: cada
--    reintento contaba un pago más. El embudo de activación —lo único que mide si
--    el producto funciona— se falseaba solo, y hacia arriba, que es la dirección
--    en la que nadie sospecha.
--
-- 2. SIN ORDEN. Stripe NO garantiza el orden de entrega. Un
--    `customer.subscription.updated` viejo que llega después de uno nuevo
--    sobrescribía el estado bueno con el caducado: una suscripción activa podía
--    quedar marcada `past_due` porque el evento de hace dos minutos llegó tarde.
--    Se arregla comparando la marca de tiempo DEL EVENTO, no la de recepción.
--
-- 3. EL FALLO PROPIO SE TRAGABA EL EVENTO. El webhook capturaba cualquier error y
--    respondía 200. Un 200 le dice a Stripe "recibido, no lo reintentes": si la
--    base de datos parpadeaba justo entonces, ese pago no se registraba **nunca**
--    y nadie se enteraba. El cliente pagaba y se quedaba en el plan gratuito. Esto
--    no lo arregla el SQL, lo arregla el webhook devolviendo 500; pero el registro
--    de eventos de aquí es lo que hace seguro reintentar.
--
-- ADITIVO: sin aplicar, el webhook detecta que no existe el registro y sigue
-- funcionando como hasta ahora (sin idempotencia, avisando en el log).

-- ---------- 1. Registro de eventos procesados ----------

create table if not exists public.stripe_events (
  -- El id del evento de Stripe (`evt_...`). Es la clave de idempotencia.
  id           text primary key,
  type         text not null,
  -- `event.created` de Stripe: cuándo OCURRIÓ, no cuándo nos llegó.
  event_at     timestamptz not null,
  processed_at timestamptz not null default now()
);

create index if not exists stripe_events_processed_idx
  on public.stripe_events (processed_at);

alter table public.stripe_events enable row level security;
-- Sin policies: solo lo toca el webhook con service_role. Ni los clientes ni
-- `anon` tienen nada que ver aquí.

comment on table public.stripe_events is
  'Eventos de Stripe ya procesados. Existe para que un reintento de Stripe no cuente dos veces el mismo pago.';

-- ---------- 2. Marca de orden en la suscripción ----------

alter table public.subscriptions
  add column if not exists last_event_at timestamptz;

comment on column public.subscriptions.last_event_at is
  'Marca de tiempo del último evento de Stripe APLICADO. Impide que un evento que llega tarde sobrescriba un estado más nuevo.';

-- ---------- 3. Aplicar un evento respetando el orden ----------

/**
 * Aplica el estado de una suscripción SOLO si el evento es más nuevo que el
 * último aplicado. Devuelve `true` si se aplicó, `false` si se descartó por
 * llegar tarde.
 *
 * La comparación va DENTRO del `on conflict`, en la misma sentencia, y no en un
 * "lee, compara y escribe" desde la aplicación: dos entregas simultáneas de
 * Stripe se resolverían mal en ese caso, y son justo lo que pasa cuando Stripe
 * reintenta mientras el original todavía va en camino.
 */
create or replace function public.apply_subscription_event(
  p_org                  uuid,
  p_customer             text,
  p_subscription         text,
  p_status               text,
  p_price                text,
  p_period_end           timestamptz,
  p_cancel_at_period_end boolean,
  p_event_at             timestamptz
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_applied boolean := false;
begin
  if p_org is null or p_event_at is null then
    return false;
  end if;

  insert into public.subscriptions (
    organization_id, stripe_customer_id, stripe_subscription_id, status,
    price_id, current_period_end, cancel_at_period_end, last_event_at
  )
  values (
    p_org, p_customer, p_subscription, coalesce(p_status, 'inactive'),
    p_price, p_period_end, coalesce(p_cancel_at_period_end, false), p_event_at
  )
  on conflict (organization_id) do update set
    stripe_customer_id     = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    status                 = excluded.status,
    price_id               = excluded.price_id,
    current_period_end     = excluded.current_period_end,
    cancel_at_period_end   = excluded.cancel_at_period_end,
    last_event_at          = excluded.last_event_at
  -- LA LÍNEA QUE IMPIDE EL RETROCESO. Sin ella, un evento viejo que llega tarde
  -- pisa el estado bueno.
  where public.subscriptions.last_event_at is null
     or public.subscriptions.last_event_at < excluded.last_event_at;

  get diagnostics v_applied = row_count;
  return v_applied;
end $$;

revoke all on function public.apply_subscription_event(
  uuid, text, text, text, text, timestamptz, boolean, timestamptz
) from public, anon, authenticated;
grant execute on function public.apply_subscription_event(
  uuid, text, text, text, text, timestamptz, boolean, timestamptz
) to service_role;

-- ---------- 4. Limpieza del registro de eventos ----------

/**
 * Borra los eventos procesados hace más de 30 días. Stripe deja de reintentar
 * mucho antes (unas 72 h), así que pasado ese plazo el registro ya no protege de
 * nada y solo crece. Lo llama el mismo cron que la purga de organizaciones.
 */
create or replace function public.prune_stripe_events()
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.stripe_events
  where processed_at < now() - interval '30 days';
  get diagnostics v_count = row_count;
  return v_count;
end $$;

revoke all on function public.prune_stripe_events() from public, anon, authenticated;
grant execute on function public.prune_stripe_events() to service_role;

comment on function public.apply_subscription_event(
  uuid, text, text, text, text, timestamptz, boolean, timestamptz
) is
  'Aplica un evento de suscripción de Stripe solo si es más nuevo que el último aplicado. false = descartado por llegar tarde.';
