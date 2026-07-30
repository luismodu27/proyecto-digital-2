-- 0029_org_limits.sql
-- Topes PACTADOS por organización (metering a medida para Enterprise).
--
-- Por qué existe: los cupos por plan viven en el código
-- (`src/lib/billing/limits.ts`: 3 sistemas en el gratuito, 25 en Preparación, sin
-- tope en Enterprise). Eso cubre el autoservicio, pero no un Enterprise vendido
-- "hasta 200 sistemas y 40 asientos": ese número es fruto de una negociación y
-- pertenece a la organización, no al plan.
--
-- Semántica: `null` = usa el cupo de su plan. Un número = **gana sobre el plan**,
-- incluso si es MENOR (así se puede vender un Enterprise con tope pactado). La
-- contrapartida: cuando un contrato termina hay que **limpiarlo**
-- (`set max_systems = null`), o seguirá aplicándose bajo un plan que ya no toca.
--
-- ADITIVO y seguro: si esta migración no está aplicada, la app no encuentra las
-- columnas, lo registra como `migration-pending` y usa los cupos del plan. Nadie
-- se queda bloqueado ni se le regala cupo por sorpresa.
--
-- Los cupos limitan CREAR, nunca VER: no hay nada aquí que oculte o borre datos
-- existentes. Una organización que baja de plan conserva íntegro su expediente y
-- solo deja de poder añadir más.

alter table public.organizations
  add column if not exists max_systems integer,
  add column if not exists max_seats   integer;

-- Cotas de cordura. El mínimo es 1 (no 0) a propósito: un 0 dejaría la cuenta sin
-- poder crear nada, y un tope pactado de cero no es un caso de negocio real. La
-- capa de código además ignora cualquier valor <= 0, así que hacen falta dos
-- errores para dejar a alguien atascado.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_max_systems_check'
  ) then
    alter table public.organizations
      add constraint organizations_max_systems_check
      check (max_systems is null or max_systems between 1 and 100000);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'organizations_max_seats_check'
  ) then
    alter table public.organizations
      add constraint organizations_max_seats_check
      check (max_seats is null or max_seats between 1 and 10000);
  end if;
end $$;

comment on column public.organizations.max_systems is
  'Tope pactado de sistemas de IA. null = usa el cupo del plan. Gana sobre el plan, incluso si es menor. Limpiar al terminar el contrato.';
comment on column public.organizations.max_seats is
  'Tope pactado de asientos (miembros + invitaciones pendientes). null = usa el cupo del plan.';

-- Para cerrar un Enterprise a medida, el fundador ejecuta en el SQL Editor:
--
--   -- ver el consumo actual de cada organización:
--   select o.id, o.name, o.plan, o.max_systems, o.max_seats,
--          (select count(*) from public.ai_systems s  where s.organization_id = o.id) as sistemas,
--          (select count(*) from public.memberships m where m.organization_id = o.id) as miembros
--     from public.organizations o
--    order by sistemas desc;
--
--   -- fijar los topes pactados:
--   update public.organizations
--      set plan = 'enterprise', max_systems = 200, max_seats = 40
--    where id = '<org-uuid>';
--
--   -- al terminar el contrato, limpiar el pacto (vuelve al cupo de su plan):
--   update public.organizations set max_systems = null, max_seats = null
--    where id = '<org-uuid>';
