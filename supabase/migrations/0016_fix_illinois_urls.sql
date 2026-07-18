-- Attesta — corrige URLs muertas de las fuentes de Illinois.
--
-- La Asamblea General de Illinois (ilga.gov) rediseñó su web: las URLs viejas
-- `/legislation/ilcs/ilcs3.asp?ActID=…` devuelven 404, así que el Vigía las
-- marcaba como "Error" en Fuentes vigiladas. El formato nuevo es
-- `/Legislation/ILCS/Articles?ActID=…&ChapterID=…`. Reponemos las URLs y
-- limpiamos el estado (hash/último estado/contador de fallos) para que la
-- próxima pasada del Vigía las tome como línea base sin falsos "cambió".

update public.reg_sources
   set url = 'https://www.ilga.gov/Legislation/ILCS/Articles?ActID=4015&ChapterID=68',
       last_status = null, fail_count = 0, last_hash = null, last_change_at = null
 where url = 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=4015&ChapterID=68';

update public.reg_sources
   set url = 'https://www.ilga.gov/Legislation/ILCS/Articles?ActID=2266&ChapterID=64',
       last_status = null, fail_count = 0, last_hash = null, last_change_at = null
 where url = 'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2266&ChapterID=64';
