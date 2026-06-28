-- Migration: 20260610000001_decisions_rls.sql
-- Purpose: Enable RLS and create all five access policies on the decisions
-- table per H12 §5.5. Writes come from API routes using the service_role
-- key; reads and user-initiated writes use the anon key through RLS.

alter table public.decisions enable row level security;

-- Authenticated users can read their own Decisions
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'decisions'
      and policyname = 'decisions_select_own'
  ) then
    create policy "decisions_select_own"
      on public.decisions
      for select
      using (auth.uid() = owner_id);
  end if;
end
$$;

-- Authenticated users can insert Decisions they own
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'decisions'
      and policyname = 'decisions_insert_own'
  ) then
    create policy "decisions_insert_own"
      on public.decisions
      for insert
      with check (auth.uid() = owner_id);
  end if;
end
$$;

-- Anonymous users can insert anonymous Decisions (owner_id is null)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'decisions'
      and policyname = 'decisions_insert_anonymous'
  ) then
    create policy "decisions_insert_anonymous"
      on public.decisions
      for insert
      with check (owner_id is null and anonymous_token is not null);
  end if;
end
$$;

-- Authenticated users can update their own Decisions
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'decisions'
      and policyname = 'decisions_update_own'
  ) then
    create policy "decisions_update_own"
      on public.decisions
      for update
      using (auth.uid() = owner_id);
  end if;
end
$$;

-- Authenticated users can delete their own Decisions
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'decisions'
      and policyname = 'decisions_delete_own'
  ) then
    create policy "decisions_delete_own"
      on public.decisions
      for delete
      using (auth.uid() = owner_id);
  end if;
end
$$;
