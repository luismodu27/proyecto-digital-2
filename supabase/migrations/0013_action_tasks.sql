-- Attesta — plan de acción editable (Capa 2).
--
-- Hasta ahora el "plan de acción" era 100% derivado (solo lectura) de las
-- brechas y el riesgo. Esta tabla lo convierte en un TABLERO DE TAREAS real:
-- cada tarea tiene responsable, fecha límite y estado, editable por el equipo.
-- Las recomendaciones derivadas siguen existiendo como SUGERENCIAS que se
-- añaden al plan con un clic (source='recommendation' + source_key para no
-- duplicar).
--
-- Es colaborativo: cualquier miembro de la organización gestiona las tareas
-- (no solo owner/admin). Se AUDITA como el resto (lleva organization_id).

create table if not exists public.action_tasks (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  title            text not null,
  detail           text,
  article          text,
  priority         text not null default 'media'
    check (priority in ('critica', 'alta', 'media', 'baja')),
  status           text not null default 'todo'
    check (status in ('todo', 'in_progress', 'blocked', 'done')),
  assignee_id      uuid references auth.users (id) on delete set null,
  due_date         date,
  ai_system_id     uuid references public.ai_systems (id) on delete set null,
  source           text not null default 'manual'
    check (source in ('manual', 'recommendation')),
  source_key       text,
  created_by       uuid references auth.users (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists action_tasks_org_idx
  on public.action_tasks (organization_id, status);

alter table public.action_tasks enable row level security;

-- Todo miembro de la organización lee y gestiona las tareas (colaborativo).
create policy action_tasks_select on public.action_tasks
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

create policy action_tasks_write on public.action_tasks
  for all to authenticated
  using (organization_id in (select private.user_orgs()))
  with check (organization_id in (select private.user_orgs()));

-- Se audita (aparece en el registro de actividad).
create trigger audit_action_tasks
  after insert or update or delete on public.action_tasks
  for each row execute function private.write_audit();
