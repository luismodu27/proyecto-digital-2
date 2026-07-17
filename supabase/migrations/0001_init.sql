-- Attesta — esquema base
-- Multi-tenant: cada tabla de negocio lleva organization_id como columna de tenant.

-- ---------- Enums ----------
create type risk_level as enum ('unacceptable', 'high', 'limited', 'minimal');
create type member_role as enum ('owner', 'admin', 'member');
create type gap_status as enum ('missing', 'partial', 'done');
create type gap_severity as enum ('high', 'medium', 'low');
create type audit_action as enum ('insert', 'update', 'delete');
create type system_actor_role as enum ('provider', 'deployer');

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------- organizations (tenant raíz) ----------
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now()
);

-- ---------- memberships (usuario <-> organización + rol) ----------
create table public.memberships (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  role             member_role not null default 'member',
  created_at       timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index memberships_user_idx on public.memberships (user_id);
create index memberships_org_idx on public.memberships (organization_id);

-- ---------- ai_systems (inventario) ----------
create table public.ai_systems (
  id                    uuid primary key default gen_random_uuid(),
  organization_id       uuid not null references public.organizations (id) on delete cascade,
  code                  text,
  name                  text not null,
  owner                 text,
  domain                text,
  vendor                text,
  actor_role            system_actor_role not null default 'deployer',
  risk_level            risk_level,
  compliance_pct        int check (compliance_pct between 0 and 100),
  last_reviewed_at      timestamptz,
  current_assessment_id uuid,
  created_by            uuid references auth.users (id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (organization_id, code)
);
create index ai_systems_org_idx on public.ai_systems (organization_id);
create trigger ai_systems_updated_at before update on public.ai_systems
  for each row execute function public.set_updated_at();

-- ---------- risk_assessments (resultado del asistente; append-only) ----------
create table public.risk_assessments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  ai_system_id     uuid not null references public.ai_systems (id) on delete cascade,
  answers          jsonb not null,
  level            risk_level not null,
  rationale        text not null,
  citations        jsonb not null default '[]',
  obligations      jsonb not null default '[]',
  engine_version   text,
  assessed_by      uuid references auth.users (id),
  assessed_at      timestamptz not null default now()
);
create index risk_assessments_system_idx
  on public.risk_assessments (ai_system_id, assessed_at desc);

-- FK diferida de ai_systems -> última evaluación vigente
alter table public.ai_systems
  add constraint ai_systems_current_assessment_fk
  foreign key (current_assessment_id)
  references public.risk_assessments (id) on delete set null;

-- ---------- gap_items (brechas) ----------
create table public.gap_items (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  ai_system_id     uuid not null references public.ai_systems (id) on delete cascade,
  requirement      text not null,
  article          text,
  status           gap_status not null default 'missing',
  severity         gap_severity not null default 'medium',
  remediation_note text,
  created_by       uuid references auth.users (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index gap_items_org_idx on public.gap_items (organization_id);
create index gap_items_system_idx on public.gap_items (ai_system_id);
create trigger gap_items_updated_at before update on public.gap_items
  for each row execute function public.set_updated_at();

-- ---------- audit_log (inmutable; se rellena por triggers) ----------
create table public.audit_log (
  id               bigint primary key generated always as identity,
  organization_id  uuid not null,
  actor_id         uuid,
  table_name       text not null,
  row_id           text not null,
  action           audit_action not null,
  old_data         jsonb,
  new_data         jsonb,
  diff             jsonb,
  at               timestamptz not null default now()
);
create index audit_log_org_idx on public.audit_log (organization_id, at desc);
