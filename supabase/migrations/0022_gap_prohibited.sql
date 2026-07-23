-- 0022_gap_prohibited.sql
-- Marca de "práctica prohibida" en las brechas (gap_items).
--
-- Motivo: los policy packs precargan controles como gap_items que computan en el
-- "% listo / preparación". Pero un control cuyo objeto es una práctica PROHIBIDA
-- del Art. 5 del EU AI Act (riesgo inaceptable — p. ej. reconocimiento de
-- emociones en el trabajo, Art. 5.1.f) NO es una brecha ordinaria: una práctica
-- prohibida no se "prepara para auditoría", se cesa. Por eso queda FUERA del
-- cómputo de preparación y se renderiza como Inaceptable / revisión jurídica.
--
-- Columna booleana con default false: degradación segura. Mientras no se aplique,
-- la app trata todas las brechas como no prohibidas (comportamiento actual).
alter table public.gap_items
  add column if not exists prohibited boolean not null default false;

comment on column public.gap_items.prohibited is
  'true = el control corresponde a una práctica prohibida del Art. 5 (riesgo inaceptable); queda fuera del cómputo de preparación y se trata como revisión jurídica, no como brecha a cerrar.';
