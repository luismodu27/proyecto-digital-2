-- 0037_demo_requests.sql
-- Solicitudes de demo (venta asistida).
--
-- POR QUÉ NO VALE LA LISTA DE ESPERA QUE YA HAY. `waitlist` guarda un correo y de
-- dónde vino. Sirve para "avísame cuando esté", que es la señal de alguien que
-- todavía no ha decidido nada. Pero el plan Enterprise no se vende solo: alguien
-- tiene que hablar con quien pregunta, y para decidir a quién llamar primero hace
-- falta saber tres cosas que un correo suelto no dice — de qué organización es,
-- qué papel ocupa y qué tamaño tiene. Sin eso, una bandeja de 40 correos
-- idénticos se atiende por orden de llegada, que es el peor criterio posible.
--
-- LO QUE SE PIDE Y LO QUE NO. Solo cuatro campos obligatorios y dos opcionales.
-- Cada campo de más en un formulario de la web pública cuesta solicitudes, y una
-- solicitud perdida vale más que un dato de cualificación: lo que falte se
-- pregunta en la llamada, que es justo para lo que existe la llamada.
--
-- MISMO MODELO DE SEGURIDAD QUE `waitlist`: `anon` puede INSERTAR y nada más. Sin
-- policy de lectura, nadie puede sacar la lista de leads —que es información
-- comercial sensible— aunque tenga el grant de tabla por defecto de Supabase. El
-- fundador las consulta desde el SQL Editor con `service_role`.
--
-- ADITIVO: sin aplicar, el formulario informa del fallo y el correo al fundador
-- sale igual, así que ninguna solicitud se pierde por no haber migrado todavía.

create table if not exists public.demo_requests (
  id           uuid primary key default gen_random_uuid(),
  email        text not null check (char_length(email) between 3 and 254),
  name         text check (char_length(name) <= 120),
  company      text check (char_length(company) <= 160),
  -- Papel de quien pregunta. Texto libre acotado, no un enum: los títulos reales
  -- ("Head of People Ops", "DPO", "IT Manager") no caben en una lista cerrada, y
  -- una lista cerrada obliga a elegir "Otro", que no informa de nada.
  role         text check (char_length(role) <= 120),
  -- Tamaño de la organización. Aquí sí conviene un catálogo: es lo que ordena la
  -- bandeja, y para eso hace falta que sea comparable.
  team_size    text check (team_size in ('1-50', '51-200', '201-1000', '1000+')),
  -- Qué le trae. Es el campo que de verdad prepara la llamada.
  context      text check (char_length(context) <= 2000),
  -- De qué punto de la web salió, para saber qué sección genera conversaciones.
  source       text check (char_length(source) <= 80),
  locale       text check (locale in ('es', 'en')),
  created_at   timestamptz not null default now()
);

create index if not exists demo_requests_created_idx
  on public.demo_requests (created_at desc);

alter table public.demo_requests enable row level security;

-- Solo INSERT, para anon y authenticated. Sin SELECT/UPDATE/DELETE: la lista de
-- leads no la puede leer nadie desde la API pública.
drop policy if exists demo_requests_insert_anyone on public.demo_requests;
create policy demo_requests_insert_anyone on public.demo_requests
  for insert to anon, authenticated
  with check (true);

comment on table public.demo_requests is
  'Solicitudes de demo (venta asistida). Solo INSERT para anon: la lista no se puede leer desde la API pública.';
