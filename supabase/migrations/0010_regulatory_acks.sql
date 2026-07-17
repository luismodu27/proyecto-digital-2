-- Attesta — acuse de vigilancia regulatoria ("marcar como revisado").
-- Permite a owner/admin dejar constancia de que la organización ha revisado un
-- evento del radar regulatorio y qué decidió (revisado / plan en marcha / no
-- aplica). Es evidencia de vigilancia activa; se AUDITA como el resto.
-- El evento vive en el catálogo curado (código), por eso event_id es texto.

create table if not exists public.regulatory_acks (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  event_id         text not null,
  status           text not null default 'reviewed'
    check (status in ('reviewed', 'planned', 'not_applicable')),
  note             text,
  acknowledged_by  uuid references auth.users (id),
  acknowledged_at  timestamptz not null default now(),
  unique (organization_id, event_id)
);
create index if not exists regulatory_acks_org_idx
  on public.regulatory_acks (organization_id);

alter table public.regulatory_acks enable row level security;

-- Miembros ven el estado; owner/admin lo gestionan.
create policy regulatory_acks_select on public.regulatory_acks
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

create policy regulatory_acks_write on public.regulatory_acks
  for all to authenticated
  using (private.user_has_role(organization_id, array['owner','admin']::public.member_role[]))
  with check (private.user_has_role(organization_id, array['owner','admin']::public.member_role[]));

-- Se audita (aparece en el registro de actividad).
create trigger audit_regulatory_acks
  after insert or update or delete on public.regulatory_acks
  for each row execute function private.write_audit();
