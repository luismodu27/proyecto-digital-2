-- Attesta — Fase B del foso: el Analista (RAG sobre el texto de la norma).
--
-- El Analista toma las "señales de cambio" que el Vigía dejó en reg_candidates
-- y las ENRIQUECE (fecha, tipo, resumen, impacto, artículos) anclando cada
-- afirmación en fragmentos REALES del articulado, recuperados por similitud
-- vectorial. El LLM PROPONE un borrador; el humano VALIDA (approve_reg_candidate).
-- Nada se publica en reg_events automáticamente.
--
-- Esta migración (B.0) monta la FUNDACIÓN sin coste: la base de conocimiento
-- vectorial y los RPCs. La ingesta (Voyage) y el drafting (Claude) viven en la
-- capa de app y se activan por llaves de entorno (fallback seguro sin ellas).
--
-- Todo ADITIVO (sin drop). Pegar SOLO este archivo en el SQL Editor.
--
-- ⚠️ Gotcha de este stack: en funciones `security definer set search_path=''`
-- hay que cualificar con esquema TODO lo que no sea de pg_catalog, incluidos el
-- tipo `extensions.vector`, la opclass `extensions.vector_cosine_ops` y el
-- operador de distancia como `OPERATOR(extensions.<=>)`.

/* -------------------------------------------------------------------------- */
/* 1) pgvector                                                                */
/* -------------------------------------------------------------------------- */

create extension if not exists vector with schema extensions;

/* -------------------------------------------------------------------------- */
/* 2) Base de conocimiento: fragmentos del articulado + su embedding          */
/*    Corpus GLOBAL (misma ley para todos) → sin organization_id, admin-only. */
/* -------------------------------------------------------------------------- */

create table if not exists public.reg_knowledge_chunks (
  id           uuid primary key default gen_random_uuid(),
  framework    text not null default 'eu-ai-act',
  doc_ref      text not null,              -- p. ej. "Art. 26.1", "Anexo III.4"
  title        text,                       -- título legible del fragmento
  chunk_index  integer not null default 0, -- orden dentro del doc_ref
  content      text not null,              -- texto verbatim de la norma
  token_count  integer,
  model        text not null,              -- modelo de embedding usado (debe coincidir al consultar)
  source_url   text,
  source_hash  text,                       -- hash del content (ingesta idempotente)
  embedding    extensions.vector(1024),
  created_at   timestamptz not null default now(),
  unique (framework, doc_ref, chunk_index)
);

alter table public.reg_knowledge_chunks enable row level security;

-- Solo el equipo de plataforma lee/escribe el corpus (service_role bypassa RLS).
-- (drop antes de create → re-ejecutable; create policy no es idempotente)
drop policy if exists reg_knowledge_admin on public.reg_knowledge_chunks;
create policy reg_knowledge_admin on public.reg_knowledge_chunks
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- Índice HNSW coseno para el retrieval (robusto ante inserciones, alto recall).
create index if not exists reg_knowledge_chunks_embedding_idx
  on public.reg_knowledge_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

/* -------------------------------------------------------------------------- */
/* 3) Retrieval: top-k fragmentos por similitud coseno, filtrado por marco.   */
/* -------------------------------------------------------------------------- */

create or replace function public.match_reg_chunks(
  query_embedding extensions.vector, fw text, k integer
) returns table (
  id uuid, doc_ref text, title text, content text, source_url text, similarity double precision
)
language sql stable security definer set search_path = '' as $$
  select
    c.id, c.doc_ref, c.title, c.content, c.source_url,
    1 - (c.embedding OPERATOR(extensions.<=>) query_embedding) as similarity
  from public.reg_knowledge_chunks c
  where c.framework = fw and c.embedding is not null
  order by c.embedding OPERATOR(extensions.<=>) query_embedding
  limit greatest(coalesce(k, 6), 1)
$$;

revoke all on function public.match_reg_chunks(extensions.vector, text, integer) from anon;
grant execute on function public.match_reg_chunks(extensions.vector, text, integer) to authenticated;

/* -------------------------------------------------------------------------- */
/* 4) Escritura del Analista: enriquece un candidato-señal en borrador.       */
/*    Guard: platform_admin o el service_role del cron. Solo status='draft'.  */
/*    Fusiona la procedencia (agent 'Analista', model, confidence, citations).*/
/* -------------------------------------------------------------------------- */

create or replace function public.enrich_reg_candidate_ai(
  cand uuid, patch jsonb, prov jsonb
) returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not (
    public.is_platform_admin()
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role'
  ) then
    raise exception 'no autorizado';
  end if;

  update public.reg_candidates set
    event_date        = coalesce(nullif(patch->>'event_date', '')::date, event_date),
    kind              = coalesce(nullif(patch->>'kind', ''), kind),
    framework         = coalesce(nullif(patch->>'framework', ''), framework),
    title             = coalesce(nullif(patch->>'title', ''), title),
    summary           = coalesce(patch->>'summary', summary),
    impact            = coalesce(patch->>'impact', impact),
    action            = coalesce(patch->>'action', action),
    articles          = coalesce(patch->'articles', articles),
    scope             = coalesce(patch->'scope', scope),
    proposed_event_id = coalesce(nullif(patch->>'proposed_event_id', ''), proposed_event_id),
    provenance        = coalesce(provenance, '{}'::jsonb) || coalesce(prov, '{}'::jsonb)
  where id = cand and status = 'draft';

  if not found then raise exception 'candidato no encontrado o ya revisado'; end if;
end $$;

revoke all on function public.enrich_reg_candidate_ai(uuid, jsonb, jsonb) from anon;
grant execute on function public.enrich_reg_candidate_ai(uuid, jsonb, jsonb) to authenticated;
