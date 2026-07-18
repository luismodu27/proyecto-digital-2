-- Attesta — semilla de la watchlist del Vigía (reg_sources).
--
-- Ejecútalo en el SQL Editor de Supabase (una vez). Solo un platform_admin o
-- service_role puede escribir aquí (lo impone la RLS). El Vigía compara la
-- huella de cada URL y, cuando cambia, deja un candidato en la cola del
-- Validador (/dashboard/vigilancia/candidatos).
--
-- ⚠️ Revisa/ajusta las URLs: deben apuntar a la página OFICIAL y estable de
-- cada norma. `framework` debe ser uno de los códigos del radar
-- (eu-ai-act, us-nyc-ll144, us-co-aiact, us-il-aivia, us-il-hra, us-eeoc).
-- `on conflict` evita duplicar si ya existe la misma URL.

insert into public.reg_sources (framework, label, url, source_kind, active)
values
  ('eu-ai-act',
   'EUR-Lex — Reglamento (UE) 2024/1689 (AI Act)',
   'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32024R1689',
   'page', true),
  ('eu-ai-act',
   'Comisión Europea — AI Act (portal)',
   'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
   'page', true),
  ('us-nyc-ll144',
   'NYC DCWP — Automated Employment Decision Tools (LL144)',
   'https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page',
   'page', true),
  ('us-co-aiact',
   'Colorado AG — Artificial Intelligence (SB 26-189)',
   'https://coag.gov/artificial-intelligence/',
   'page', true),
  ('us-il-aivia',
   'Illinois — Artificial Intelligence Video Interview Act (820 ILCS 42)',
   'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=4015',
   'page', true),
  ('us-eeoc',
   'EEOC — Artificial Intelligence and Algorithmic Fairness',
   'https://www.eeoc.gov/ai',
   'page', true)
on conflict do nothing;

-- Comprobar lo insertado:
--   select framework, label, active, last_checked_at from public.reg_sources order by created_at;
