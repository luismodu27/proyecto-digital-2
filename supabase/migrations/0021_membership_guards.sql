-- 0021 · Guardas de integridad de membresías a nivel de BD (defensa en profundidad)
--
-- Las invariantes "solo un owner otorga/retira el rol owner" y "una organización
-- nunca se queda sin owner" vivían SOLO en la app (team-actions.ts). Como la anon
-- key es pública y PostgREST es accesible directamente, un usuario con rol admin
-- podía saltarse esas guardas escribiendo en `memberships` por API (auto-promoverse
-- a owner con un UPDATE, o expulsar al owner con un DELETE) — escalada intra-tenant.
--
-- Este trigger impone las invariantes para CUALQUIER escritor (app o PostgREST
-- directo). Solo actúa en UPDATE/DELETE: los INSERT (creación de la org con su
-- primer owner, invitaciones aceptadas) van por funciones security definer y no
-- deben verse afectados; además `unique (organization_id, user_id)` ya impide
-- insertar una segunda fila para el mismo usuario.

create or replace function public.enforce_membership_guards()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_role public.member_role;
  v_other_owners int;
begin
  -- Contextos de confianza (service_role / postgres / DBA por SQL Editor) tienen
  -- auth.uid() nulo: no son el vector de ataque y deben poder operar/mantener.
  if (select auth.uid()) is null then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  -- Rol del actor (según el JWT) en la organización afectada.
  select role into v_actor_role
  from public.memberships
  where organization_id = coalesce(new.organization_id, old.organization_id)
    and user_id = (select auth.uid());

  if tg_op = 'UPDATE' then
    -- Escalar a owner exige ser owner.
    if new.role = 'owner'
       and old.role is distinct from 'owner'
       and coalesce(v_actor_role, 'member') <> 'owner' then
      raise exception 'solo un owner puede otorgar el rol owner';
    end if;
    -- Degradar a un owner exige ser owner y no dejar la org sin owner.
    if old.role = 'owner' and new.role is distinct from 'owner' then
      if coalesce(v_actor_role, 'member') <> 'owner' then
        raise exception 'solo un owner puede modificar a otro owner';
      end if;
      select count(*) into v_other_owners
      from public.memberships
      where organization_id = old.organization_id
        and role = 'owner'
        and user_id <> old.user_id;
      if v_other_owners = 0 then
        raise exception 'la organización no puede quedarse sin owner';
      end if;
    end if;

  elsif tg_op = 'DELETE' then
    if old.role = 'owner' then
      if coalesce(v_actor_role, 'member') <> 'owner' then
        raise exception 'solo un owner puede quitar a otro owner';
      end if;
      select count(*) into v_other_owners
      from public.memberships
      where organization_id = old.organization_id
        and role = 'owner'
        and user_id <> old.user_id;
      if v_other_owners = 0 then
        raise exception 'la organización no puede quedarse sin owner';
      end if;
    end if;
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists enforce_membership_guards on public.memberships;
create trigger enforce_membership_guards
  before update or delete on public.memberships
  for each row execute function public.enforce_membership_guards();
