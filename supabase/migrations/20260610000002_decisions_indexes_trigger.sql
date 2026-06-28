-- Migration: 20260610000002_decisions_indexes_trigger.sql
-- Purpose: Add the three query-optimisation indexes and the updated_at
-- trigger to the decisions table per H12 §5.4 and §5.7.

-- Dashboard query: all Decisions for a user, filtered by status (H12 §5.4)
create index if not exists idx_decisions_owner_status
  on public.decisions (owner_id, status)
  where owner_id is not null;

-- Dashboard query: all active Decisions for a user, ordered by recency (H12 §5.4)
create index if not exists idx_decisions_owner_created
  on public.decisions (owner_id, created_at desc)
  where owner_id is not null;

-- Cleanup: all expired anonymous Decisions (H12 §5.4, FR-01.5, BR-04)
create index if not exists idx_decisions_expires_at
  on public.decisions (expires_at)
  where expires_at is not null and owner_id is null;

-- Trigger function: keep updated_at current on every UPDATE (H12 §5.7)
create or replace function update_decisions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger: fires before each UPDATE row on decisions (H12 §5.7)
create or replace trigger decisions_updated_at_trigger
  before update on public.decisions
  for each row
  execute function update_decisions_updated_at();
