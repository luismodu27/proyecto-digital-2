-- 0028_grant_hardening.sql
-- Endurece los PERMISOS (grants) de lo que 0026 y 0027 dejaron a medias.
--
-- POR QUÉ EXISTE. Al verificar 0026/0027 contra el Supabase real (no contra el
-- Postgres de pruebas) salieron dos diferencias entre lo que el SQL PARECÍA hacer
-- y lo que hace de verdad. Ninguna filtra datos hoy, pero las dos convierten una
-- defensa en profundidad en una sola capa, y eso es exactamente lo que no se
-- quiere en la única superficie anónima del producto.
--
--   (1) `revoke all on function f from anon` NO revoca nada. PostgreSQL concede
--       `EXECUTE` a **PUBLIC** por defecto en cada función nueva, y `anon` hereda
--       ese permiso vía PUBLIC. Comprobado: `anon` puede EJECUTAR
--       `product_funnel`; lo único que lo protege es el guard
--       `where public.is_platform_admin()` que lleva dentro (devuelve 0 filas).
--       Para revocar de verdad hay que revocar **de PUBLIC**, y volver a conceder
--       explícitamente a quien deba usarla.
--
--   (2) En Supabase, el rol `anon` tiene `SELECT` concedido por defecto sobre las
--       tablas de `public`. En el Postgres de pruebas no, y por eso allí un SELECT
--       de `anon` daba *permission denied* mientras en producción da `200 []`.
--       Las dos respuestas son seguras —la RLS no le concede ninguna fila— pero la
--       de producción depende SOLO de la RLS. Si algún día alguien añade una
--       policy permisiva por error, en producción eso sería una fuga y en pruebas
--       no. Revocando el SELECT, hacen falta DOS errores para filtrar, no uno.
--
-- QUÉ NO SE TOCA: el `INSERT` de `anon` en `product_events` (la landing es pública
-- y sus visitas son anónimas: sin ese insert no hay medición) ni el `EXECUTE` de
-- `submit_intake` (es la puerta pública del intake, a propósito).

/* -------------------------------------------------------------------------- */
/* (1) Revocar de PUBLIC, no de anon                                          */
/* -------------------------------------------------------------------------- */

-- El embudo es un panel interno de Attesta. Solo `authenticated`, y con el guard
-- de admin dentro de la propia función.
revoke all on function public.product_funnel(integer) from public;
revoke all on function public.product_funnel(integer) from anon;
grant execute on function public.product_funnel(integer) to authenticated;

-- Mismo defecto en 0011: `is_platform_admin()` la puede ejecutar `anon` vía
-- PUBLIC. Devuelve `false` (no hay `auth.uid()`), así que no filtra, pero no hay
-- ninguna razón para que un anónimo pueda llamarla.
revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_platform_admin() from anon;
grant execute on function public.is_platform_admin() to authenticated;

-- `btrim_safe` sí la necesita `anon`: la usa `submit_intake`. Se deja explícito
-- para que se vea que es deliberado y no un olvido.
grant execute on function public.btrim_safe(text) to anon, authenticated;

/* -------------------------------------------------------------------------- */
/* (2) Quitarle a `anon` el SELECT sobre las tablas nuevas                     */
/* -------------------------------------------------------------------------- */

-- Nadie sin cuenta tiene por qué poder consultar estas tablas. Hoy la RLS ya le
-- devuelve cero filas; esto añade la segunda cerradura.
revoke select on public.intake_links       from anon;
revoke select on public.intake_submissions from anon;

-- En `product_events` se revoca SOLO el select: el INSERT anónimo se conserva
-- porque es lo que permite medir las visitas de la landing.
revoke select on public.product_events from anon;
grant  insert on public.product_events to   anon;

/* -------------------------------------------------------------------------- */
/* Nota para futuras migraciones                                              */
/* -------------------------------------------------------------------------- */

-- Regla que queda: en este esquema, `revoke ... from anon` sobre una FUNCIÓN es
-- casi siempre un no-op. Si una función no debe ser pública, se escribe
--   revoke all on function f(args) from public;
--   grant execute on function f(args) to <rol que sí>;
-- y el guard de autorización va ADEMÁS dentro de la función, nunca en su lugar.
