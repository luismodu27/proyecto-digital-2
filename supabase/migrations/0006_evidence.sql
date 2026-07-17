-- Attesta — captura de evidencia (autoevaluación defendible)
-- Distingue una respuesta "solo declarada" de una "con evidencia" aportada.
-- La responsabilidad recae en la persona que atesta (no en Attesta).

alter table public.risk_assessments
  add column if not exists attested_by_name text,
  add column if not exists evidence_note   text,
  add column if not exists evidence_url     text,
  add column if not exists evidence_state   text not null default 'declared'
    check (evidence_state in ('declared', 'evidenced', 'reviewed'));

-- Refleja en el sistema el nivel de respaldo de su última evaluación.
alter table public.ai_systems
  add column if not exists evidence_state text
    check (evidence_state in ('declared', 'evidenced', 'reviewed'));
