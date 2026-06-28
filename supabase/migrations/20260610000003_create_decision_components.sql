-- Migration: 20260610000003_create_decision_components.sql
-- IR01-017: Create the decision_components table

create table public.decision_components (
  id             uuid        not null default gen_random_uuid(),
  decision_id    uuid        not null,
  component      text        not null,
  version        integer     not null default 1,
  content        jsonb       not null,
  is_current     boolean     not null default true,
  created_at     timestamptz not null default now(),
  prompt_version text,

  constraint decision_components_pkey
    primary key (id),
  constraint decision_components_decision_id_fkey
    foreign key (decision_id) references public.decisions(id) on delete cascade,
  constraint decision_components_component_check
    check (component in (
      '0_identity',
      '1_context',
      '2_goal',
      '3_constraints',
      '4_alternatives',
      '5_ai_analysis',
      '6_risks',
      '7_recommendation',
      '8_final_decision',
      '9_action_plan',
      '10_outcome',
      '11_reflection',
      '12_lessons_learned'
    )),
  constraint decision_components_version_positive
    check (version > 0)
);

alter table public.decision_components enable row level security;
