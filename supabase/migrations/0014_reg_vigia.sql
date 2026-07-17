-- Attesta — Vigía determinista: 1er agente del foso automatizado (Capa 7).
--
-- El Vigía monitorea las fuentes regulatorias oficiales (reg_sources) por
-- fetch+hash. Cuando el contenido de una fuente cambia respecto de la última
-- revisión, encola un CANDIDATO "señal de cambio" (reg_candidates) para que el
-- Validador humano lo revise. Cero LLM, cero afirmación regulatoria automática:
-- el Vigía solo dice "algo cambió aquí, míralo". El análisis semántico (qué
-- cambió y qué significa) es trabajo del Analista (Fase B).
--
-- Todo ADITIVO (sin drop). El fetch ocurre en la capa de app (Next.js, donde sí
-- hay red); aquí viven la contabilidad de la watchlist y el encolado atómico con
-- dedupe, protegidos por is_platform_admin() (o el service_role del cron).

/* -------------------------------------------------------------------------- */
/* 1) Observabilidad de la watchlist                                          */
/* -------------------------------------------------------------------------- */

alter table public.reg_sources
  add column if not exists last_change_at timestamptz;
alter table public.reg_sources
  add column if not exists last_status text;
alter table public.reg_sources
  add column if not exists fail_count integer not null default 0;

-- Semilla idempotente por URL.
create unique index if not exists reg_sources_url_key
  on public.reg_sources (url);

/* -------------------------------------------------------------------------- */
/* 2) Watchlist inicial: fuentes oficiales ya citadas en el catálogo curado.  */
/* -------------------------------------------------------------------------- */

insert into public.reg_sources (framework, label, url, source_kind) values
  ('eu-ai-act',    'EUR-Lex — Reglamento (UE) 2024/1689',              'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', 'page'),
  ('eu-ai-act',    'Comisión Europea — marco regulatorio de IA',       'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', 'page'),
  ('eu-ai-act',    'AI Act Service Desk — Art. 50',                    'https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50', 'page'),
  ('us-nyc-ll144', 'NYC DCWP — Automated Employment Decision Tools',   'https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page', 'page'),
  ('us-co-aiact',  'Colorado General Assembly — SB 26-189',            'https://leg.colorado.gov/bills/sb26-189', 'page'),
  ('us-il-aivia',  'Illinois General Assembly — 820 ILCS 42 (AIVIA)',  'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=4015&ChapterID=68', 'page'),
  ('us-il-hra',    'Illinois General Assembly — 775 ILCS 5 (IHRA)',    'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2266&ChapterID=64', 'page'),
  ('us-eeoc',      'EEOC — Artificial Intelligence and the ADA',       'https://www.eeoc.gov/eeoc-disability-related-resources/artificial-intelligence-and-ada', 'page')
on conflict (url) do nothing;

/* -------------------------------------------------------------------------- */
/* 3) Reporte atómico del Vigía                                               */
/*    La app descarga la fuente, calcula el hash del contenido normalizado y  */
/*    llama a esta función, que: registra el chequeo, detecta el cambio por   */
/*    hash y —si cambió— encola un candidato-señal (con dedupe por fuente).   */
/* -------------------------------------------------------------------------- */

create or replace function public.vigia_report(
  src uuid, new_hash text, ok boolean, err text
) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  s          public.reg_sources%rowtype;
  changed    boolean := false;
  first_seen boolean := false;
  cand_id    uuid;
begin
  -- Autorizado: un validador de plataforma, o el service_role (cron post-deploy).
  if not (
    public.is_platform_admin()
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role'
  ) then
    raise exception 'no autorizado';
  end if;

  select * into s from public.reg_sources where id = src for update;
  if not found then raise exception 'fuente no encontrada'; end if;

  -- Fallo de descarga: registra el error y no toca el hash de referencia.
  if not ok then
    update public.reg_sources
       set last_checked_at = now(),
           last_status     = 'error',
           fail_count      = s.fail_count + 1
     where id = src;
    return jsonb_build_object(
      'status', 'error', 'changed', false,
      'detail', coalesce(nullif(trim(err), ''), 'error de descarga')
    );
  end if;

  first_seen := s.last_hash is null;
  changed    := (not first_seen) and (s.last_hash is distinct from new_hash);

  update public.reg_sources
     set last_hash       = new_hash,
         last_checked_at = now(),
         last_status     = case when changed then 'changed'
                                when first_seen then 'baseline'
                                else 'ok' end,
         last_change_at  = case when changed then now() else s.last_change_at end,
         fail_count      = 0
   where id = src;

  if not changed then
    return jsonb_build_object(
      'status', case when first_seen then 'baseline' else 'unchanged' end,
      'changed', false
    );
  end if;

  -- Dedupe: si ya hay un borrador pendiente de esta fuente, no floodear la cola.
  if exists (
    select 1 from public.reg_candidates
    where source_id = src and status = 'draft'
  ) then
    return jsonb_build_object('status', 'changed', 'changed', true, 'candidate', 'deduped');
  end if;

  insert into public.reg_candidates (
    framework, title, summary, impact, action, articles, source, scope,
    status, source_id, provenance
  ) values (
    s.framework,
    'Cambio detectado en «' || s.label || '»',
    'El Vigía detectó que el contenido de una fuente oficial vigilada cambió desde la última revisión. Revisa la fuente para determinar qué cambió y, si procede, redacta el evento regulatorio.',
    'Señal automática de cambio, aún sin analizar. Un cambio en esta fuente puede afectar a los sistemas del inventario según su marco (' || s.framework || ').',
    'Abre la fuente, identifica el cambio y —si es relevante— completa y publica el evento; si es ruido, descártalo.',
    '[]'::jsonb,
    jsonb_build_object('label', s.label, 'url', s.url),
    '{}'::jsonb,
    'draft',
    src,
    jsonb_build_object(
      'agent', 'Vigía',
      'model', null,
      'confidence', 0.35,
      'excerpt', 'hash de contenido distinto al de la última revisión',
      'detected_at', now()
    )
  )
  returning id into cand_id;

  return jsonb_build_object('status', 'changed', 'changed', true, 'candidate', cand_id);
end $$;

revoke all on function public.vigia_report(uuid, text, boolean, text) from anon;
grant execute on function public.vigia_report(uuid, text, boolean, text) to authenticated;
