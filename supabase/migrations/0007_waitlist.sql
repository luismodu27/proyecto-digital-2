-- Attesta — lista de espera (landing público)
-- Cualquiera puede INSERTAR su correo; nadie puede LEER/editar (privacidad).
-- El fundador consulta los leads desde el panel (SQL editor / service_role).

create table public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Solo INSERT, para anon y authenticated. Sin SELECT/UPDATE/DELETE.
create policy "waitlist_insert_anyone" on public.waitlist
  for insert to anon, authenticated
  with check (true);
