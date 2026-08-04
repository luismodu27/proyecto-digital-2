-- 0033_content_locale.sql
-- Idioma del texto regulatorio que se PERSISTE (brechas y evaluaciones).
--
-- POR QUÉ EXISTE: el chrome de la UI se traduce en cada render, pero hay texto
-- que se copia a la base de datos y ahí se queda congelado. Al aplicar un policy
-- pack, el título y el artículo de cada control se escriben en `gap_items`; al
-- guardar una clasificación, su motivación se escribe en `risk_assessments`. Si
-- luego se cambia el idioma de la interfaz, esas filas siguen en el idioma en el
-- que se crearon — y hasta ahora NADIE SABÍA EN CUÁL. Sin ese dato no se puede
-- ni traducirlas después ni etiquetarlas con `lang` para el lector de pantalla.
--
-- POR QUÉ ES NULLABLE Y NO SE RELLENA HACIA ATRÁS: `null` significa «no consta»,
-- y es la verdad para toda fila anterior a esta migración. Rellenarlas con el
-- default (`es`) sería inventarse un dato: una organización que trabajara en
-- inglés acabaría con filas inglesas marcadas como españolas, y un `lang`
-- equivocado es PEOR que ninguno — el lector de pantalla cambia de voz y
-- pronuncia con la fonética que no es. El código trata `null` como desconocido y
-- simplemente no etiqueta (ver `src/lib/i18n/stored-locale.ts`, con tests).
--
-- QUÉ DESCRIBE EXACTAMENTE: el idioma del texto que genera Attesta (requisito,
-- artículo, motivación). NO el de las notas que escribe el usuario
-- (`remediation_note`, `evidence_note`): ese idioma lo elige quien teclea, no lo
-- sabemos, y no se etiqueta.
--
-- ADITIVO y seguro: sin aplicar, la fachada mapea `undefined`, el idioma queda
-- como desconocido y todo se comporta igual que antes.

alter table public.gap_items
  add column if not exists locale text
  check (locale is null or locale in ('es', 'en'));

alter table public.risk_assessments
  add column if not exists locale text
  check (locale is null or locale in ('es', 'en'));

-- Las tareas nacidas de una recomendación copian su título y su artículo igual
-- que las brechas copian los del pack: mismo defecto, misma columna. Las tareas
-- MANUALES se quedan en `null` a propósito — las escribe el usuario en el idioma
-- que quiera y aquí no se adivina.
alter table public.action_tasks
  add column if not exists locale text
  check (locale is null or locale in ('es', 'en'));

comment on column public.gap_items.locale is
  'Idioma del texto GENERADO por Attesta (requirement, article). null = no consta (fila anterior a 0033); no se rellena a ciegas. No describe remediation_note, que la escribe el usuario.';
comment on column public.risk_assessments.locale is
  'Idioma del texto GENERADO por Attesta (rationale, citations, obligations). null = no consta (fila anterior a 0033).';
comment on column public.action_tasks.locale is
  'Idioma del texto generado cuando source = recommendation. null en las tareas manuales: las escribe el usuario y su idioma no se adivina.';
