-- ============================================================================
-- 0024 · Correcciones del red team (2026-07-23)
-- ============================================================================
-- El equipo adversarial encontró DOS fallas de severidad alta, ambas
-- explotables SALTÁNDOSE la app (PostgREST + anon key + el JWT del propio
-- usuario). El aislamiento entre organizaciones NO se vio afectado; ambas son
-- intra-organización, pero derrotan controles que el código sí pretendía
-- imponer. Causa raíz común: las policies comprobaban QUIÉN eres, no QUÉ valor
-- escribes; y los guards vigilaban UPDATE/DELETE pero no INSERT.
--
-- NOTA: los RPCs legítimos (create_organization 0004, invite_member/
-- claim_invitations 0008) son `security definer` (propiedad de postgres) →
-- bypasean RLS, así que endurecer las policies NO los rompe; solo cierra el
-- acceso directo del rol `authenticated`.

-- ---------------------------------------------------------------------------
-- FIX 1 (HIGH) — Escalada admin→owner por INSERT directo en `memberships`.
-- La policy `memberships_write_admin` (0002) era FOR ALL con
-- `with check (user_has_role owner/admin)`: comprobaba el rol del ACTOR pero no
-- el VALOR `role` escrito, así que un admin podía insertar una fila role='owner'
-- (para una cuenta títere) y tomar la organización. El guard 0021 solo cubre
-- UPDATE/DELETE. Se restringe: SOLO un owner puede escribir una fila owner.
-- ---------------------------------------------------------------------------
drop policy if exists memberships_write_admin on public.memberships;
create policy memberships_write_admin on public.memberships
  for all
  using (
    private.user_has_role(organization_id, array['owner','admin']::public.member_role[])
  )
  with check (
    private.user_has_role(organization_id, array['owner','admin']::public.member_role[])
    and (
      role::text <> 'owner'
      or private.user_has_role(organization_id, array['owner']::public.member_role[])
    )
  );

-- ---------------------------------------------------------------------------
-- FIX 2 (HIGH) — Misma escalada por la "puerta B": un admin escribía una
-- invitación pendiente con role='owner' directo en `invitations` (la policy
-- `invitations_write` tenía el mismo hueco), y `claim_invitations` la convertía
-- en membership owner al registrarse la cuenta títere. El RPC `invite_member` sí
-- lo impedía, pero el INSERT directo lo saltaba. Se restringe igual: SOLO un
-- owner puede crear/editar una invitación con role='owner'.
-- ---------------------------------------------------------------------------
drop policy if exists invitations_write on public.invitations;
create policy invitations_write on public.invitations
  for all
  using (
    private.user_has_role(organization_id, array['owner','admin']::public.member_role[])
  )
  with check (
    private.user_has_role(organization_id, array['owner','admin']::public.member_role[])
    and (
      role::text <> 'owner'
      or private.user_has_role(organization_id, array['owner']::public.member_role[])
    )
  );

-- ---------------------------------------------------------------------------
-- FIX 3 (HIGH) — Bypass de facturación: cualquier owner podía subir su plan a
-- 'enterprise' gratis con un UPDATE directo. La policy `organizations_update`
-- (0002) comprobaba "¿eres owner?" pero NO restringía columnas, así que `plan`
-- era escribible como cualquier otra. El plan es la fuente de verdad de los
-- entitlements (src/lib/billing/plan.ts). Se revoca el UPDATE de la columna
-- `plan` al rol `authenticated`. El webhook de Stripe usa `service_role` y el
-- fundador el SQL Editor (postgres): ninguno se ve afectado; los owners siguen
-- pudiendo editar el resto de columnas (nombre, etc.).
-- ---------------------------------------------------------------------------
revoke update (plan) on public.organizations from authenticated;
