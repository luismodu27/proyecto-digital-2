-- Attesta — registro de evidencia de auditoría de sesgo (NYC Local Law 144).
--
-- Campos por herramienta (AEDT) para registrar la evidencia de la auditoría de
-- sesgo independiente y su publicación, con caducidad ROTATORIA de 12 meses
-- desde la última auditoría (la lógica de estado/cuenta atrás vive en la app,
-- `src/lib/bias-audit.ts`).
--
-- ⚠️ Attesta REGISTRA la evidencia declarada por la organización; NO realiza ni
-- valida la auditoría (la ejecuta un auditor independiente) ni certifica nada.
--
-- ADITIVO y seguro: si estas columnas no existen (migración sin aplicar), la app
-- degrada con gracia (la sección de auditoría de sesgo no aparece). Toda la
-- lectura va por un getter con fallback.

alter table public.ai_systems
  add column if not exists is_aedt boolean not null default false,
  add column if not exists last_bias_audit_date date,
  add column if not exists independent_auditor_name text,
  add column if not exists auditor_independence_confirmed boolean not null default false,
  add column if not exists bias_audit_summary_url text,
  add column if not exists summary_published_date date;

comment on column public.ai_systems.is_aedt is
  'Clasificada como Automated Employment Decision Tool (NYC LL144).';
comment on column public.ai_systems.last_bias_audit_date is
  'Fecha de la última auditoría de sesgo independiente (ancla de la caducidad de 12 meses).';
comment on column public.ai_systems.bias_audit_summary_url is
  'URL pública del resumen de resultados de la auditoría (6 RCNY §5-302).';
