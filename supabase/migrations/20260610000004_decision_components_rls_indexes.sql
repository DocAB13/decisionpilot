-- Migration: 20260610000004_decision_components_rls_indexes.sql
-- IR01-018: RLS policies and indexes for decision_components

-- RLS is already enabled in IR01-017; this is idempotent
alter table public.decision_components enable row level security;

-- Indexes (IF NOT EXISTS makes these idempotent)
create index if not exists idx_decision_components_current
  on public.decision_components (decision_id, component)
  where is_current = true;

create index if not exists idx_decision_components_history
  on public.decision_components (decision_id, component, version desc);

create index if not exists idx_decision_components_prompt_version
  on public.decision_components (prompt_version)
  where prompt_version is not null;

-- Policies (drop-then-create is idempotent)
drop policy if exists "decision_components_select_own" on public.decision_components;
create policy "decision_components_select_own"
  on public.decision_components
  for select
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_components.decision_id
        and d.owner_id = auth.uid()
    )
  );

drop policy if exists "decision_components_insert_own" on public.decision_components;
create policy "decision_components_insert_own"
  on public.decision_components
  for insert
  with check (
    exists (
      select 1 from public.decisions d
      where d.id = decision_components.decision_id
        and d.owner_id = auth.uid()
    )
  );

drop policy if exists "decision_components_update_own" on public.decision_components;
create policy "decision_components_update_own"
  on public.decision_components
  for update
  using (
    exists (
      select 1 from public.decisions d
      where d.id = decision_components.decision_id
        and d.owner_id = auth.uid()
    )
  );
