-- 0032_suppliers.sql
-- Registro de proveedores y terceros (Capa 8).
--
-- POR QUÉ EXISTE: todos los packs reencuadran las obligaciones de diseño del
-- proveedor (Arts. 9-15) como «exige y conserva evidencia», pero no había dónde
-- guardar esa evidencia ni a quién se la pediste ni qué te contestó. Sin ese
-- sitio, el reencuadre era un consejo, no un expediente.
--
-- LA REGLA QUE ESTE ESQUEMA EXISTE PARA NO PERDER: cada elemento de evidencia
-- tiene una BASE JURÍDICA distinta, y de ella depende lo que el cliente puede
-- hacer. El Reglamento solo dirige al responsable del despliegue las
-- instrucciones de uso (Art. 13); la documentación técnica del Anexo IV, el
-- sistema de gestión de la calidad y el de gestión de riesgos van dirigidos a
-- las autoridades y a los organismos notificados. La base vive en el catálogo de
-- código (`src/lib/suppliers/evidence.ts`, cerrado y con tests), no en la BD:
-- es una afirmación jurídica y su sitio es donde se puede probar.
--
-- LO QUE NO SE MODELA, A PROPÓSITO:
--   · No hay `fecha_caducidad` obligatoria. Casi nada caduca: ni el marcado CE,
--     ni la declaración de conformidad, ni las instrucciones, ni el registro en
--     la base de datos de la UE. Los diez años de los Arts. 18, 23.5 y 47.1 son
--     plazo de CONSERVACIÓN del proveedor, no de validez. `expires_on` es
--     nullable y solo tiene sentido en el certificado del Art. 44.
--   · No hay puntuación ni «% de cumplimiento» del proveedor. No existe umbral
--     normativo y sería copy prohibido. Lo que se cuenta son elementos.
--   · No hay estado «conforme/no conforme». Recibido, verificado, rechazado.
--
-- ADITIVO y seguro: sin aplicar, la fachada devuelve listas vacías, lo registra
-- como `migration-pending` y la app funciona igual.
--
-- `create policy` no admite `if not exists`: cada una va precedida de su `drop`.

-- ---------------------------------------------------------------------------
-- Proveedores
-- ---------------------------------------------------------------------------
create table if not exists public.suppliers (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid not null references public.organizations (id) on delete cascade,
  name                    text not null,
  country                 text,

  -- `unknown` es un valor legítimo y frecuente: al empezar el inventario de
  -- terceros casi nadie sabe si su proveedor es provider, importador o
  -- distribuidor, y obligar a elegir produciría datos inventados.
  ai_act_role             text not null default 'unknown'
    check (ai_act_role in ('provider', 'importer', 'distributor', 'model_provider', 'third_party', 'unknown')),

  -- Si está fuera de la UE debe tener representante autorizado (Art. 22). El
  -- Art. 22.4 obliga al representante a PONER FIN al mandato si cree que el
  -- proveedor incumple: por eso un cambio o cese es señal de alarma, no un
  -- trámite, y se guarda con su fecha de verificación.
  outside_eu              boolean not null default false,
  authorized_rep          text,
  authorized_rep_checked_on date,

  gdpr_role               text not null default 'unknown'
    check (gdpr_role in ('controller', 'processor', 'joint', 'none', 'unknown')),
  contact                 text,

  contract_ends_on        date,
  dpa_signed              boolean not null default false,

  -- BANDERA ROJA del Art. 25.2. Muchas condiciones de uso SaaS excluyen el uso
  -- en casos de alto riesgo. Si tu contrato la tiene y aun así usas la
  -- herramienta para uno, te quedas con las obligaciones de proveedor y SIN
  -- derecho a que el proveedor inicial coopere.
  excludes_high_risk_use  boolean not null default false,

  note                    text,
  created_by              uuid references auth.users (id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists suppliers_org_idx
  on public.suppliers (organization_id, name);

alter table public.suppliers enable row level security;

-- Colaborativo, como el plan y los incidentes: quien negocia con el proveedor
-- rara vez tiene rol de admin.
drop policy if exists suppliers_select on public.suppliers;
create policy suppliers_select on public.suppliers
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

drop policy if exists suppliers_write on public.suppliers;
create policy suppliers_write on public.suppliers
  for all to authenticated
  using (organization_id in (select private.user_orgs()))
  with check (organization_id in (select private.user_orgs()));

drop trigger if exists audit_suppliers on public.suppliers;
create trigger audit_suppliers
  after insert or update or delete on public.suppliers
  for each row execute function private.write_audit();

drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Elementos de evidencia
-- ---------------------------------------------------------------------------
create table if not exists public.supplier_evidence (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  supplier_id      uuid not null references public.suppliers (id) on delete cascade,
  -- Opcional: el marcado CE y la declaración son por SISTEMA, pero en el
  -- mid-market lo normal es un sistema por proveedor. Se permite null para no
  -- obligar a elegir antes de tener el inventario cruzado.
  ai_system_id     uuid references public.ai_systems (id) on delete set null,

  -- El catálogo de tipos vive en `src/lib/suppliers/evidence.ts` y NO se repite
  -- aquí como CHECK a propósito: cada tipo nuevo obligaría a una migración, y
  -- el catálogo ya es cerrado en TypeScript (un tipo inventado no compila) y se
  -- filtra en la escritura. Un valor desconocido en BD simplemente no se pinta.
  kind             text not null,

  status           text not null default 'notRequested'
    check (status in ('notRequested', 'requested', 'received', 'verifiedPublicly', 'refused', 'notApplicable')),

  requested_on     date,
  received_on      date,

  -- Más útil que cualquier fecha: lo que invalida unas instrucciones de uso no
  -- es que pase el tiempo, es que salga una versión nueva del sistema.
  document_version text,
  source_url       text,

  -- NUNCA se autocalcula. Solo tiene sentido en el certificado del Art. 44.
  expires_on       date,

  -- Aquí va lo que contestó el proveedor cuando se negó. Una negativa por
  -- escrito, con fecha, ES evidencia, y de las mejores para un expediente.
  note             text,

  created_by       uuid references auth.users (id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists supplier_evidence_supplier_idx
  on public.supplier_evidence (supplier_id, kind);
create index if not exists supplier_evidence_org_idx
  on public.supplier_evidence (organization_id, status);

alter table public.supplier_evidence enable row level security;

drop policy if exists supplier_evidence_select on public.supplier_evidence;
create policy supplier_evidence_select on public.supplier_evidence
  for select to authenticated
  using (organization_id in (select private.user_orgs()));

drop policy if exists supplier_evidence_write on public.supplier_evidence;
create policy supplier_evidence_write on public.supplier_evidence
  for all to authenticated
  using (organization_id in (select private.user_orgs()))
  with check (organization_id in (select private.user_orgs()));

drop trigger if exists audit_supplier_evidence on public.supplier_evidence;
create trigger audit_supplier_evidence
  after insert or update or delete on public.supplier_evidence
  for each row execute function private.write_audit();

drop trigger if exists set_supplier_evidence_updated_at on public.supplier_evidence;
create trigger set_supplier_evidence_updated_at
  before update on public.supplier_evidence
  for each row execute function public.set_updated_at();

comment on table public.suppliers is
  'Registro de proveedores y terceros del deployer (Capa 8). Sin puntuaciones ni juicios de conformidad: solo hechos declarados.';
comment on column public.suppliers.excludes_high_risk_use is
  'El contrato excluye el uso en casos de alto riesgo (Art. 25.2). Bandera roja: si aun así se usa así, no hay derecho a la cooperación del proveedor inicial.';
comment on column public.supplier_evidence.expires_on is
  'Solo tiene sentido en el certificado de organismo notificado (Art. 44). Marcado CE, declaración de conformidad, instrucciones y registro en la BD de la UE NO caducan.';
comment on column public.supplier_evidence.note is
  'Incluye la respuesta del proveedor cuando se niega a entregar algo: una negativa por escrito y con fecha es evidencia.';
