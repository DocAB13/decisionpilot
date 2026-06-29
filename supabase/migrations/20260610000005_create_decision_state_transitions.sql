-- Migration: 20260610000005_create_decision_state_transitions.sql
-- IR01-019: Create the decision_state_transitions table

create table public.decision_state_transitions (
  id          uuid        not null default gen_random_uuid(),
  decision_id uuid        not null,
  from_status text,
  to_status   text        not null,
  trigger     text        not null,
  created_at  timestamptz not null default now(),

  constraint decision_state_transitions_pkey
    primary key (id),
  constraint decision_state_transitions_decision_id_fkey
    foreign key (decision_id) references public.decisions(id) on delete cascade,
  constraint decision_state_transitions_to_status_check
    check (to_status in (
      'draft', 'in_analysis', 'waiting_for_user',
      'decision_made', 'executing', 'completed', 'archived'
    )),
  constraint decision_state_transitions_trigger_check
    check (trigger in ('user_action', 'system_event', 'ai_completion'))
);

alter table public.decision_state_transitions enable row level security;

-- Primary access pattern: full state history for a Decision
create index if not exists idx_decision_state_transitions_decision
  on public.decision_state_transitions (decision_id, created_at asc);

-- Users can read state transitions belonging to their own Decisions
drop policy if exists "decision_state_transitions_select_own" on public.decision_state_transitions;
create policy "decision_state_transitions_select_own"
  on public.decision_state_transitions
  for select
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_state_transitions.decision_id
        and d.owner_id = auth.uid()
    )
  );

-- No INSERT policy for authenticated users.
-- All state transitions are written by API routes using the service_role key.
