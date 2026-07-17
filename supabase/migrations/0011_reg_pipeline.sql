-- Attesta — Fase A del "foso automatizado": la espina del pipeline de vigilancia.
--
-- Los agentes (Vigía → Analista → Actualizador) PROPONEN borradores de eventos
-- regulatorios; un humano (el Validador) los aprueba o rechaza antes de que
-- lleguen a los clientes. Filosofía intacta: nada se publica como afirmación
-- regulatoria sin validación humana. El catálogo curado en código sigue siendo
-- la línea base de confianza; estas tablas AÑADEN eventos publicados por el
-- pipeline.
--
-- El catálogo regulatorio es GLOBAL (la misma ley para todos los tenants), por
-- eso estas tablas NO llevan organization_id y NO usan las policies por-org. El
-- Validador es personal de Attesta (platform_admins), no un cliente. Los acuses
-- por organización ("marcar como revisado") siguen en regulatory_acks (0010).

/* -------------------------------------------------------------------------- */
/* Personal de Attesta habilitado para validar (el humano-en-el-bucle)        */
/* -------------------------------------------------------------------------- */

create table if not exists public.platform_admins (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  added_at  timestamptz not null default now(),
  note      text
);

alter table public.platform_admins enable row level security;

-- ¿El usuario actual es validador de plataforma? (security definer → sin recursión)
create or replace function public.is_platform_admin()
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.platform_admins
    where user_id = (select auth.uid())
  )
$$;
revoke all on function public.is_platform_admin() from anon;
grant execute on function public.is_platform_admin() to authenticated;

-- Un validador puede ver la lista de validadores; nadie se auto-inserta
-- (el alta se hace en el panel de Supabase / service_role).
create policy platform_admins_select on public.platform_admins
  for select to authenticated
  using (public.is_platform_admin());

/* -------------------------------------------------------------------------- */
/* Fuentes vigiladas por el Vigía (watchlist global)                          */
/* -------------------------------------------------------------------------- */

create table if not exists public.reg_sources (
  id               uuid primary key default gen_random_uuid(),
  framework        text not null default 'eu-ai-act',
  label            text not null,
  url              text not null,
  source_kind      text not null default 'page'
    check (source_kind in ('page', 'feed', 'api')),
  last_hash        text,
  last_checked_at  timestamptz,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

alter table public.reg_sources enable row level security;

create policy reg_sources_admin on public.reg_sources
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

/* -------------------------------------------------------------------------- */
/* Eventos PUBLICADOS por el pipeline (catálogo global, se suma al de código)  */
/* -------------------------------------------------------------------------- */

create table if not exists public.reg_events (
  id                  text primary key,
  event_date          date not null,
  kind                text not null
    check (kind in ('deadline', 'guidance', 'standard', 'amendment', 'enforcement')),
  framework           text not null default 'eu-ai-act',
  title               text not null,
  summary             text not null,
  impact              text not null,
  action              text not null,
  articles            jsonb not null default '[]'::jsonb,
  source              jsonb not null,
  scope               jsonb not null default '{}'::jsonb,
  published_at        timestamptz not null default now(),
  published_by        uuid references auth.users (id),
  origin_candidate_id uuid
);

alter table public.reg_events enable row level security;

-- Todo miembro autenticado ve los eventos publicados (aparecen en su radar).
create policy reg_events_select on public.reg_events
  for select to authenticated
  using (true);

-- Solo el Validador de plataforma puede publicar/editar/retirar.
create policy reg_events_admin_write on public.reg_events
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

/* -------------------------------------------------------------------------- */
/* Cola de CANDIDATOS: borradores a la espera de validación humana            */
/* -------------------------------------------------------------------------- */

create table if not exists public.reg_candidates (
  id                uuid primary key default gen_random_uuid(),
  proposed_event_id text,
  event_date        date,
  kind              text
    check (kind in ('deadline', 'guidance', 'standard', 'amendment', 'enforcement')),
  framework         text not null default 'eu-ai-act',
  title             text not null,
  summary           text,
  impact            text,
  action            text,
  articles          jsonb not null default '[]'::jsonb,
  source            jsonb,
  scope             jsonb not null default '{}'::jsonb,
  status            text not null default 'draft'
    check (status in ('draft', 'approved', 'rejected', 'superseded')),
  source_id         uuid references public.reg_sources (id) on delete set null,
  -- Procedencia del agente: {agent, model, confidence, excerpt, detected_at}
  provenance        jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  reviewed_by       uuid references auth.users (id),
  reviewed_at       timestamptz,
  review_note       text
);

create index if not exists reg_candidates_status_idx
  on public.reg_candidates (status, created_at desc);

alter table public.reg_candidates enable row level security;

create policy reg_candidates_admin on public.reg_candidates
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

/* -------------------------------------------------------------------------- */
/* Acciones del Validador (atómicas y auto-guardadas)                         */
/* -------------------------------------------------------------------------- */

-- Aprobar: publica el candidato como evento del radar y lo marca aprobado.
-- Todo en una transacción y solo para validadores de plataforma.
create or replace function public.approve_reg_candidate(cand uuid, event_id text)
returns text
language plpgsql volatile security definer set search_path = '' as $$
declare
  c public.reg_candidates%rowtype;
  eid text := nullif(trim(event_id), '');
begin
  if not public.is_platform_admin() then
    raise exception 'no autorizado';
  end if;

  select * into c from public.reg_candidates where id = cand;
  if not found then raise exception 'candidato no encontrado'; end if;
  if c.status <> 'draft' then raise exception 'el candidato ya fue revisado'; end if;
  if eid is null then eid := coalesce(c.proposed_event_id, 'reg-' || replace(cand::text, '-', '')); end if;
  if c.event_date is null or c.kind is null or c.source is null then
    raise exception 'el candidato no tiene fecha, tipo o fuente'; end if;

  insert into public.reg_events (
    id, event_date, kind, framework, title, summary, impact, action,
    articles, source, scope, published_by, origin_candidate_id
  ) values (
    eid, c.event_date, c.kind, c.framework, c.title,
    coalesce(c.summary, ''), coalesce(c.impact, ''), coalesce(c.action, ''),
    c.articles, c.source, c.scope, (select auth.uid()), c.id
  );

  update public.reg_candidates
     set status = 'approved', proposed_event_id = eid,
         reviewed_by = (select auth.uid()), reviewed_at = now()
   where id = cand;

  return eid;
end $$;
revoke all on function public.approve_reg_candidate(uuid, text) from anon;
grant execute on function public.approve_reg_candidate(uuid, text) to authenticated;

-- Rechazar: marca el candidato como rechazado con una nota.
create or replace function public.reject_reg_candidate(cand uuid, note text)
returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then
    raise exception 'no autorizado';
  end if;

  update public.reg_candidates
     set status = 'rejected', review_note = nullif(trim(note), ''),
         reviewed_by = (select auth.uid()), reviewed_at = now()
   where id = cand and status = 'draft';

  if not found then raise exception 'candidato no encontrado o ya revisado'; end if;
end $$;
revoke all on function public.reject_reg_candidate(uuid, text) from anon;
grant execute on function public.reject_reg_candidate(uuid, text) to authenticated;
